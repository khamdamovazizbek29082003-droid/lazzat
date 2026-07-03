"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useT } from "@/components/providers/LocaleProvider";
import { createSubmission, getMapData, getRestaurant, listSubmissionQueue } from "@/lib/data/client";
import { CATEGORY_EMOJI, type EstablishmentType, type MapCluster, type MapMarker } from "@/lib/data/types";
import { AddPlaceForm } from "./AddPlaceForm";
import { AdminQueueDrawer } from "./AdminQueueDrawer";
import { MapTopBar } from "./MapTopBar";
import { RestaurantPopupPanel } from "./RestaurantPopupPanel";

const UZ_CENTER: [number, number] = [64.5, 41.6];
const UZ_ZOOM = 5.2;
const CLUSTER_ZOOM_THRESHOLD = 8;

// Carto's Voyager basemap: real streets/labels/POIs/buildings, no API key required
// (attribution is mandatory and handled via the AttributionControl below). Override with
// NEXT_PUBLIC_MAP_STYLE_URL (e.g. a MapTiler style) for higher-detail tiles in production.
const STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// Esri World Imagery: free, key-free satellite raster tiles. The Carto vector source is
// included too (invisible, raster draws on top) purely so add3DBuildings() below can still
// extrude real buildings over the satellite photo — a hybrid 3D satellite view.
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
    carto: { type: "vector", url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json" },
  },
  layers: [{ id: "esri-satellite", type: "raster", source: "esri" }],
};

// Carto's "carto.streets" vector source (OpenMapTiles schema) ships real building
// heights, so we can extrude them for a true 3D skyline like Google/Yandex Maps' 3D view.
function add3DBuildings(map: maplibregl.Map) {
  const style = map.getStyle();
  const hasBuildingSource = Object.entries(style?.sources ?? {}).some(([, s]) => s.type === "vector");
  if (!hasBuildingSource || map.getLayer("lazzat-3d-buildings")) return;
  const sourceId = Object.keys(style!.sources!).find((id) => style!.sources![id].type === "vector");
  if (!sourceId) return;

  const labelLayerId = style?.layers?.find((l) => l.type === "symbol" && "layout" in l)?.id;
  map.addLayer(
    {
      id: "lazzat-3d-buildings",
      source: sourceId,
      "source-layer": "building",
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 5], 0, "#d8d3c8", 50, "#b9c4d6", 200, "#8ea3c2"],
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 13, 0, 16, ["coalesce", ["get", "render_height"], 5]],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.85,
      },
    },
    labelLayerId,
  );
}

function buildClusterEl(cluster: MapCluster) {
  const el = document.createElement("div");
  el.className =
    "flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-cobalt bg-white px-3 py-1.5 text-sm font-extrabold text-cobalt-deep shadow-lg cursor-pointer";
  el.innerText = `◆ ${cluster.label} · ${cluster.count}`;
  return el;
}

function buildPinEl(marker: MapMarker) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.cursor = "pointer";

  const pin = document.createElement("span");
  Object.assign(pin.style, {
    width: "32px",
    height: "32px",
    borderRadius: "50% 50% 50% 4px",
    transform: "rotate(-45deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2.5px solid #fff",
    boxShadow: "0 8px 16px rgba(0,0,0,.35)",
    background: marker.status === "PENDING" ? "#D68F27" : "#14418C",
  });
  if (marker.status === "PENDING") pin.classList.add("animate-pulse-pin");

  const emojiSpan = document.createElement("span");
  emojiSpan.style.transform = "rotate(45deg)";
  emojiSpan.style.fontSize = "14px";
  emojiSpan.innerText = marker.emoji;
  pin.appendChild(emojiSpan);

  const label = document.createElement("span");
  Object.assign(label.style, {
    marginTop: "4px",
    fontSize: "10px",
    fontWeight: "800",
    background: "rgba(255,255,255,.95)",
    color: marker.status === "PENDING" ? "#8A6210" : "#0E3068",
    borderRadius: "6px",
    padding: "2px 6px",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,.25)",
  });
  label.innerText =
    marker.status === "PENDING" ? "⏳" : `${marker.name.split(" ")[0]}${marker.rating ? " · " + marker.rating.toFixed(1) : ""}`;

  wrap.appendChild(pin);
  wrap.appendChild(label);
  return wrap;
}

export function MapExplorer({ initialSlug }: { initialSlug?: string }) {
  const t = useT();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role as string | undefined;
  const canModerate = role === "MODERATOR" || role === "ADMIN";

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const draftMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [zoom, setZoom] = useState(UZ_ZOOM);
  const [pitch, setPitch] = useState(55);
  const [styleMode, setStyleMode] = useState<"streets" | "satellite">("streets");
  const [addMode, setAddMode] = useState(false);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  // My own just-submitted pins, shown pulsing immediately — pending submissions aren't
  // public data, so this is local-only feedback rather than something fetched from the map API.
  const [myPending, setMyPending] = useState<MapMarker[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const say = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Init the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: UZ_CENTER,
      zoom: UZ_ZOOM,
      pitch: 55,
      bearing: -15,
      attributionControl: false,
    });
    // Carto + OpenStreetMap both require attribution to be shown on the map.
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    mapRef.current = map;

    const onMove = () => {
      setZoom(map.getZoom());
      setDataVersion((v) => v + 1);
    };
    map.on("load", () => {
      add3DBuildings(map);
      onMove();
    });
    map.on("moveend", onMove);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fly to & pre-select a restaurant handed in via ?slug= (from the detail page's "View on map").
  useEffect(() => {
    if (!initialSlug || !mapRef.current) return;
    getRestaurant(initialSlug).then((r) => {
      if (!r || !mapRef.current) return;
      mapRef.current.jumpTo({ center: [r.lng, r.lat], zoom: 14, pitch: 55, bearing: -15 });
      setSelectedSlug(initialSlug);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug]);

  // Add-place mode: toggle crosshair + a single "drop the pin" click.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = addMode ? "crosshair" : "";
    if (!addMode) return;

    const handler = (e: maplibregl.MapMouseEvent) => {
      setDraft((current) => current ?? { lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [addMode]);

  // Existing pins sit in an HTML layer above the canvas, so without this a click near a
  // restaurant while placing a new pin would hit that marker (opening its popup) instead of
  // reaching the map underneath.
  useEffect(() => {
    markersRef.current.forEach((m) => {
      m.getElement().style.pointerEvents = addMode ? "none" : "";
    });
  }, [addMode, dataVersion]);

  // Draft (dashed, turquoise) marker for the pin being placed.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    draftMarkerRef.current?.remove();
    draftMarkerRef.current = null;
    if (draft) {
      const el = document.createElement("div");
      Object.assign(el.style, {
        width: "30px",
        height: "30px",
        borderRadius: "50% 50% 50% 4px",
        transform: "rotate(-45deg)",
        background: "#1E9C8D",
        border: "2.5px dashed #fff",
        boxShadow: "0 8px 16px rgba(0,0,0,.35)",
      });
      draftMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([draft.lng, draft.lat]).addTo(map);
    }
  }, [draft]);

  const refreshPendingCount = useCallback(() => {
    if (!canModerate) return;
    listSubmissionQueue().then((items) => setPendingCount(items.length));
  }, [canModerate]);

  // Fetch clusters/markers for the current viewport whenever it changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();

    getMapData({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      zoom: map.getZoom(),
    }).then((data) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (data.type === "clusters") {
        data.items.forEach((cluster) => {
          const el = buildClusterEl(cluster);
          el.addEventListener("click", () => {
            map.flyTo({ center: [cluster.lng, cluster.lat], zoom: 12.5, pitch: 55, bearing: -15, duration: 1200 });
          });
          markersRef.current.push(new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([cluster.lng, cluster.lat]).addTo(map));
        });
      } else {
        [...data.items, ...myPending].forEach((marker) => {
          const el = buildPinEl(marker);
          el.addEventListener("click", () => {
            if (marker.status === "APPROVED") setSelectedSlug(marker.slug);
            else say(`⏳ ${t("pending_review")}`);
          });
          markersRef.current.push(new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([marker.lng, marker.lat]).addTo(map));
        });
      }
    });

    refreshPendingCount();
  }, [dataVersion, refreshPendingCount, say, t, myPending]);

  const handlePitch = (value: number) => {
    setPitch(value);
    mapRef.current?.setPitch(value);
  };

  const backToCountry = () => {
    mapRef.current?.flyTo({ center: UZ_CENTER, zoom: UZ_ZOOM, pitch: 55, bearing: -15, duration: 1000 });
  };

  const toggleSatellite = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = styleMode === "streets" ? "satellite" : "streets";
    setStyleMode(next);
    map.once("style.load", () => add3DBuildings(map));
    map.setStyle(next === "satellite" ? SATELLITE_STYLE : STYLE_URL);
  };

  const submitDraft = async (input: { name: string; type: EstablishmentType; ownerPhone: string; note?: string }) => {
    if (!draft) return;
    const submission = await createSubmission({ ...input, lat: draft.lat, lng: draft.lng });
    setMyPending((prev) => [
      ...prev,
      {
        id: submission.id,
        slug: submission.id,
        lat: draft.lat,
        lng: draft.lng,
        rating: 0,
        priceBucket: "MODERATE",
        type: input.type,
        status: "PENDING",
        name: input.name,
        emoji: CATEGORY_EMOJI[input.type],
      },
    ]);
    setDraft(null);
    setAddMode(false);
    say(t("submission_sent_toast"));
  };

  const hint = draft
    ? t("map_addmode_form_hint")
    : addMode
      ? t("map_addmode_hint")
      : zoom < CLUSTER_ZOOM_THRESHOLD
        ? t("map_country_hint")
        : t("map_default_hint");

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0e1b33]">
      {/* Inline position/inset: maplibre-gl.css sets `.maplibregl-map { position: relative }`
          and loads after Tailwind, so the `absolute inset-0` utility classes can lose the
          cascade tie and collapse this container to 0 height. Inline styles always win. */}
      <div ref={containerRef} className="absolute inset-0" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} />

      <MapTopBar
        view={zoom < CLUSTER_ZOOM_THRESHOLD ? "country" : "city"}
        addMode={addMode}
        onToggleAdd={() => {
          setAddMode((v) => !v);
          setDraft(null);
          setSelectedSlug(null);
        }}
        adminOpen={adminOpen}
        onToggleAdmin={() => setAdminOpen((v) => !v)}
        pendingCount={pendingCount}
        onBackToCountry={backToCountry}
        canModerate={canModerate}
      />

      <div className="absolute right-4 bottom-5 z-40 flex flex-col items-end gap-2">
        <button
          onClick={toggleSatellite}
          className="flex items-center gap-1.5 rounded-xl border border-white/25 bg-black/30 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-black/45"
        >
          {styleMode === "streets" ? (
            <>
              🛰️ {t("satellite_view")}
            </>
          ) : (
            <>
              🗺️ {t("streets_view")}
            </>
          )}
        </button>
        <div className="rounded-xl border border-white/25 bg-black/30 px-3 py-2.5 text-center text-white backdrop-blur">
          <div className="mb-1.5 text-[11px] font-bold">3D · {Math.round(pitch)}°</div>
          <input
            type="range"
            min={0}
            max={65}
            value={pitch}
            onChange={(e) => handlePitch(Number(e.target.value))}
            className="w-24 accent-saffron"
          />
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-30 max-w-[92vw] -translate-x-1/2 truncate rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
        {hint}
      </div>

      {selectedSlug && !addMode && <RestaurantPopupPanel slug={selectedSlug} onClose={() => setSelectedSlug(null)} />}
      {draft && <AddPlaceForm lat={draft.lat} lng={draft.lng} onCancel={() => setDraft(null)} onSubmit={submitDraft} />}
      {adminOpen && canModerate && (
        <AdminQueueDrawer
          onClose={() => setAdminOpen(false)}
          onDecided={() => {
            setDataVersion((v) => v + 1);
            say(t("approved_toast"));
          }}
        />
      )}

      {toast && (
        <div className="animate-drop-in absolute top-[72px] left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
