"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";
import { deleteRestaurant, updateRestaurant } from "@/lib/data/client";
import type { AdminRestaurant, EstablishmentType, PriceBucket, WorkingHours } from "@/lib/data/types";
import { CATEGORY_EMOJI } from "@/lib/data/types";
import type { DictKey } from "@/lib/i18n/dictionaries";

const DAY_KEYS: DictKey[] = ["day_0", "day_1", "day_2", "day_3", "day_4", "day_5", "day_6"];

function normalizeHours(hours: WorkingHours[]): WorkingHours[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const existing = hours.find((h) => h.dayOfWeek === dayOfWeek);
    return existing ?? { dayOfWeek, opensAt: "09:00", closesAt: "22:00", isClosed: false };
  });
}

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

const ATTR_TOGGLES: {
  key: "halal" | "delivery" | "wifi" | "parking" | "outdoorSeating" | "kidsArea" | "familySection" | "is24h";
  icon: string;
  labelKey: "filter_halal" | "filter_delivery" | "filter_wifi" | "filter_parking" | "filter_outdoor" | "filter_family" | "filter_family_section" | "filter_24h";
}[] = [
  { key: "halal", icon: "☪️", labelKey: "filter_halal" },
  { key: "delivery", icon: "🛵", labelKey: "filter_delivery" },
  { key: "wifi", icon: "📶", labelKey: "filter_wifi" },
  { key: "parking", icon: "🅿️", labelKey: "filter_parking" },
  { key: "outdoorSeating", icon: "🌤️", labelKey: "filter_outdoor" },
  { key: "kidsArea", icon: "🧒", labelKey: "filter_family" },
  { key: "familySection", icon: "👨‍👩‍👧", labelKey: "filter_family_section" },
  { key: "is24h", icon: "🕐", labelKey: "filter_24h" },
];

/**
 * Core restaurant edit form — shared by the map admin drawer (wrapped in a floating Panel)
 * and the owner's /my-restaurants page (rendered directly in normal page flow).
 */
export function RestaurantEditForm({
  restaurant,
  onSaved,
  onDeleted,
}: {
  restaurant: AdminRestaurant;
  onSaved: (r: AdminRestaurant) => void;
  onDeleted?: () => void;
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
  const [hours, setHours] = useState(() => normalizeHours(restaurant.hours));
  const [ramadanHoursNote, setRamadanHoursNote] = useState(restaurant.ramadanHoursNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
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
          familySection: attrs.familySection,
          is24h: attrs.is24h,
        },
        hours,
        ramadanHoursNote: ramadanHoursNote.trim() || undefined,
      });
      onSaved(updated);
      setSaved(true);
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
      onDeleted?.();
    } catch {
      setError(t("error_generic"));
      setDeleting(false);
    }
  };

  return (
    <div>
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

      <div className="mb-1 text-xs font-bold text-[var(--text-sub)]">{t("field_hours")}</div>
      <div className="mb-3 space-y-1.5">
        {hours.map((h, i) => (
          <div key={h.dayOfWeek} className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="w-9 shrink-0 font-semibold text-[var(--text)]">{t(DAY_KEYS[h.dayOfWeek])}</span>
            <input
              type="time"
              value={h.opensAt ?? ""}
              disabled={h.isClosed || h.opensAt === null}
              onChange={(e) => setHours((prev) => prev.map((d, j) => (j === i ? { ...d, opensAt: e.target.value } : d)))}
              className="w-[92px] rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 text-[var(--text)] disabled:opacity-40"
            />
            <span className="text-[var(--text-sub)]">–</span>
            <input
              type="time"
              value={h.closesAt ?? ""}
              disabled={h.isClosed || h.closesAt === null}
              onChange={(e) => setHours((prev) => prev.map((d, j) => (j === i ? { ...d, closesAt: e.target.value } : d)))}
              className="w-[92px] rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 text-[var(--text)] disabled:opacity-40"
            />
            <label className="flex items-center gap-1 text-[var(--text-sub)]">
              <input
                type="checkbox"
                checked={h.opensAt === null}
                onChange={(e) =>
                  setHours((prev) =>
                    prev.map((d, j) =>
                      j === i ? { ...d, opensAt: e.target.checked ? null : "09:00", closesAt: e.target.checked ? null : "22:00", isClosed: false } : d,
                    ),
                  )
                }
              />
              {t("hours_24h")}
            </label>
            <label className="flex items-center gap-1 text-[var(--text-sub)]">
              <input
                type="checkbox"
                checked={h.isClosed}
                onChange={(e) => setHours((prev) => prev.map((d, j) => (j === i ? { ...d, isClosed: e.target.checked } : d)))}
              />
              {t("hours_closed")}
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setHours((prev) => prev.map((d) => ({ ...d, opensAt: prev[0].opensAt, closesAt: prev[0].closesAt, isClosed: prev[0].isClosed })))}
          className="text-xs font-semibold text-cobalt underline"
        >
          {t("hours_copy_to_all")}
        </button>
      </div>

      <Field label={t("field_ramadan_hours")}>
        <input
          value={ramadanHoursNote}
          onChange={(e) => setRamadanHoursNote(e.target.value)}
          placeholder={t("field_ramadan_hours_placeholder")}
          className={inputCls}
        />
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
      {saved && !error && <p className="mb-2 text-xs font-semibold text-turquoise">✓ {t("save_changes")}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-xl bg-cobalt py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {t("save_changes")}
      </button>

      {isAdmin && onDeleted && (
        <button
          onClick={remove}
          disabled={deleting}
          className="mt-2 w-full rounded-xl border border-anor py-2 text-sm font-bold text-anor transition hover:bg-anor hover:text-white disabled:opacity-60"
        >
          🗑 {t("delete_restaurant")}
        </button>
      )}
    </div>
  );
}
