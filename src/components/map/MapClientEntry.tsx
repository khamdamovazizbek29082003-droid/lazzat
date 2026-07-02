"use client";

import dynamic from "next/dynamic";

// MapLibre touches window/canvas at import time — must stay client-only,
// and `ssr:false` dynamic imports are only allowed from a Client Component.
const MapExplorer = dynamic(() => import("./MapExplorer").then((m) => m.MapExplorer), { ssr: false });

export function MapClientEntry({ initialSlug }: { initialSlug?: string }) {
  return <MapExplorer initialSlug={initialSlug} />;
}
