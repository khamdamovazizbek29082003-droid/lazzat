"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/components/providers/LocaleProvider";
import { CATEGORY_EMOJI, type EstablishmentType } from "@/lib/data/types";
import { isValidOwnerPhone } from "@/lib/data/utils";
import { MediaUploader, type UploadedMedia } from "@/components/shared/MediaUploader";
import { Panel } from "./Panel";

const TYPES: EstablishmentType[] = [
  "CAFE",
  "RESTAURANT",
  "FAST_FOOD",
  "COFFEE_SHOP",
  "TEA_HOUSE",
  "STREET_FOOD",
  "BAKERY",
  "DESSERT_SHOP",
  "CANTEEN",
  "BAR",
  "OTHER",
];

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

export function AddPlaceForm({
  lat,
  lng,
  onCancel,
  onSubmit,
}: {
  lat: number;
  lng: number;
  onCancel: () => void;
  onSubmit: (input: {
    name: string;
    type: EstablishmentType;
    ownerPhone: string;
    note?: string;
    photoUrls?: string[];
    videoUrls?: string[];
  }) => Promise<void> | void;
}) {
  const t = useT();
  const [name, setName] = useState("");
  const [type, setType] = useState<EstablishmentType>("CAFE");
  const [phone, setPhone] = useState("+998");
  const [note, setNote] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError(t("error_name_required"));
    if (!isValidOwnerPhone(phone)) return setError(t("error_phone_invalid"));
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        ownerPhone: phone.replace(/[\s-]/g, ""),
        note: note.trim() || undefined,
        photoUrls: media.filter((m) => m.type === "PHOTO").map((m) => m.url),
        videoUrls: media.filter((m) => m.type === "VIDEO").map((m) => m.url),
      });
    } catch (err) {
      setError(err instanceof Error && err.message === "error_sign_in_required" ? t("error_sign_in_required") : t("error_generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Panel title={t("new_place_title")} subtitle={t("new_place_subtitle")} onClose={onCancel}>
      <p className="mb-2.5 text-[11px] text-[var(--text-sub)]">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
      <Field label={t("field_name")}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("field_name_placeholder")}
          className={inputCls}
          autoFocus
        />
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
      <Field label={t("field_owner_phone")}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          inputMode="tel"
          className={inputCls}
        />
      </Field>
      <Field label={t("field_note")}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("field_note_placeholder")}
          className={inputCls}
        />
      </Field>
      <Field label={t("field_media")}>
        <MediaUploader value={media} onChange={setMedia} />
      </Field>
      {error && <p className="mb-2 text-xs font-semibold text-anor">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="w-full rounded-xl bg-cobalt py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {t("submit_for_review")}
      </button>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-sub)]">{t("submit_hint")}</p>
    </Panel>
  );
}
