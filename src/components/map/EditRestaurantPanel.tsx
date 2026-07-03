"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";
import { deleteRestaurant, updateRestaurant } from "@/lib/data/client";
import type { AdminRestaurant, EstablishmentType, PriceBucket } from "@/lib/data/types";
import { CATEGORY_EMOJI } from "@/lib/data/types";
import { Panel } from "./Panel";

const TYPES: EstablishmentType[] = [
  "CAFE", "RESTAURANT", "FAST_FOOD", "COFFEE_SHOP", "TEA_HOUSE",
  "STREET_FOOD", "BAKERY", "DESSERT_SHOP", "CANTEEN", "BAR", "OTHER",
];
const PRICE_BUCKETS: PriceBucket[] = ["BUDGET", "MODERATE", "UPSCALE", "PREMIUM"];

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-cobalt";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-2.5 block">
      <div className="mb-1 text-xs font-bold text-[var(--text-sub)]">{label}</div>
      {children}
    </label>
  );
}

const ATTR_TOGGLES: { key: "halal" | "delivery" | "wifi" | "parking" | "outdoorSeating" | "kidsArea" | "is24h"; icon: string; labelKey: "filter_halal" | "filter_delivery" | "filter_wifi" | "filter_parking" | "filter_outdoor" | "filter_family" | "filter_24h" }[] = [
  { key: "halal", icon: "☪️", labelKey: "filter_halal" },
  { key: "delivery", icon: "🛵", labelKey: "filter_delivery" },
  { key: "wifi", icon: "📶", labelKey: "filter_wifi" },
  { key: "parking", icon: "🅿️", labelKey: "filter_parking" },
  { key: "outdoorSeating", icon: "🌤️", labelKey: "filter_outdoor" },
  { key: "kidsArea", icon: "🧒", labelKey: "filter_family" },
  { key: "is24h", icon: "🕐", labelKey: "filter_24h" },
];

export function EditRestaurantPanel({
  restaurant,
  onClose,
  onSaved,
  onDeleted,
}: {
  restaurant: AdminRestaurant;
  onClose: () => void;
  onSaved: (r: AdminRestaurant) => void;
  onDeleted: () => void;
}) {
  const t = useT();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [names, setNames] = useState(restaurant.names);
  const [address, setAddress] = useState(restaurant.address);
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [type, setType] = useState(restaurant.type);
  const [priceBucket, setPriceBucket] = useState(restaurant.priceBucket);
  const [attrs, setAttrs] = useState(restaurant.attributes);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateRestaurant(restaurant.id, {
        names,
        address,
        phone: phone.trim() || undefined,
        type,
        priceBucket,
        attributes: {
          halal: attrs.halal,
          delivery: attrs.delivery,
          wifi: attrs.wifi,
          parking: attrs.parking,
          outdoorSeating: attrs.outdoorSeating,
          kidsArea: attrs.kidsArea,
          is24h: attrs.is24h,
        },
      });
      onSaved(updated);
    } catch {
      setError(t("error_generic"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(t("delete_restaurant_confirm"))) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteRestaurant(restaurant.id);
      onDeleted();
    } catch {
      setError(t("error_generic"));
      setDeleting(false);
    }
  };

  return (
    <Panel title={t("edit_restaurant_title")} subtitle={restaurant.names.uz} onClose={onClose} side="right">
      <Field label={t("field_name_uz")}>
        <input value={names.uz} onChange={(e) => setNames((n) => ({ ...n, uz: e.target.value }))} className={inputCls} />
      </Field>
      <Field label={t("field_name_ru")}>
        <input value={names.ru} onChange={(e) => setNames((n) => ({ ...n, ru: e.target.value }))} className={inputCls} />
      </Field>
      <Field label={t("field_name_en")}>
        <input value={names.en} onChange={(e) => setNames((n) => ({ ...n, en: e.target.value }))} className={inputCls} />
      </Field>
      <Field label={t("field_address")}>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
      </Field>
      <Field label={t("field_owner_phone")}>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
      </Field>
      <Field label={t("field_type")}>
        <select value={type} onChange={(e) => setType(e.target.value as EstablishmentType)} className={inputCls}>
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {CATEGORY_EMOJI[ty]} {ty.replace("_", " ")}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("field_price_bucket")}>
        <select value={priceBucket} onChange={(e) => setPriceBucket(e.target.value as PriceBucket)} className={inputCls}>
          {PRICE_BUCKETS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {ATTR_TOGGLES.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => setAttrs((prev) => ({ ...prev, [a.key]: !prev[a.key] }))}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              attrs[a.key]
                ? "border-cobalt bg-cobalt text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-sub)]"
            }`}
          >
            {a.icon} {t(a.labelKey)}
          </button>
        ))}
      </div>

      {error && <p className="mb-2 text-xs font-semibold text-anor">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-xl bg-cobalt py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {t("save_changes")}
      </button>

      {isAdmin && (
        <button
          onClick={remove}
          disabled={deleting}
          className="mt-2 w-full rounded-xl border border-anor py-2 text-sm font-bold text-anor transition hover:bg-anor hover:text-white disabled:opacity-60"
        >
          🗑 {t("delete_restaurant")}
        </button>
      )}
    </Panel>
  );
}
