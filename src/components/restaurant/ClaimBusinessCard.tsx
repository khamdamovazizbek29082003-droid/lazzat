"use client";

import { useState } from "react";
import { useT } from "@/components/providers/LocaleProvider";
import { claimRestaurant } from "@/lib/data/client";
import type { ClaimEvidenceType } from "@/lib/data/types";
import { MediaUploader, type UploadedMedia } from "@/components/shared/MediaUploader";
import { InlineSignIn } from "./InlineSignIn";

const EVIDENCE_TYPES: { value: ClaimEvidenceType; labelKey: "evidence_phone" | "evidence_document" | "evidence_utility_bill" | "evidence_other" }[] = [
  { value: "PHONE_VERIFICATION", labelKey: "evidence_phone" },
  { value: "DOCUMENT", labelKey: "evidence_document" },
  { value: "UTILITY_BILL", labelKey: "evidence_utility_bill" },
  { value: "OTHER", labelKey: "evidence_other" },
];

export function ClaimBusinessCard({ restaurantSlug, verifiedOwner }: { restaurantSlug: string; verifiedOwner: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState<ClaimEvidenceType>("PHONE_VERIFICATION");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [note, setNote] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (verifiedOwner) return null;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setNeedsSignIn(false);
    try {
      await claimRestaurant(restaurantSlug, {
        evidenceType,
        evidenceUrl: media[0]?.url,
        note: note.trim() || undefined,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof Error && err.message === "error_sign_in_required") setNeedsSignIn(true);
      else if (err instanceof Error && err.message.includes("already have a claim")) setError(t("claim_already_sent"));
      else setError(t("error_generic"));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <p className="font-semibold text-turquoise">{t("claim_sent_toast")}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-left text-sm transition hover:border-cobalt/40"
      >
        <div className="font-bold text-[var(--text)]">{t("claim_this_place")}</div>
        <div className="mt-0.5 text-cobalt underline">{t("claim_this_place_cta")}</div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
      <div className="font-bold text-[var(--text)]">{t("claim_form_title")}</div>
      <p className="mt-1 text-xs text-[var(--text-sub)]">{t("claim_form_subtitle")}</p>

      <label className="mt-3 block">
        <div className="mb-1 text-xs font-bold text-[var(--text-sub)]">{t("field_evidence_type")}</div>
        <select
          value={evidenceType}
          onChange={(e) => setEvidenceType(e.target.value as ClaimEvidenceType)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-cobalt"
        >
          {EVIDENCE_TYPES.map((e) => (
            <option key={e.value} value={e.value}>
              {t(e.labelKey)}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-2.5 block">
        <div className="mb-1 text-xs font-bold text-[var(--text-sub)]">{t("field_evidence_photo")}</div>
        <MediaUploader value={media} onChange={setMedia} maxPhotos={1} />
      </label>

      <label className="mt-2.5 block">
        <div className="mb-1 text-xs font-bold text-[var(--text-sub)]">{t("field_note")}</div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-cobalt"
        />
      </label>

      {error && <p className="mt-2 text-xs font-semibold text-anor">{error}</p>}
      {needsSignIn ? (
        <InlineSignIn />
      ) : (
        <button
          onClick={submit}
          disabled={submitting}
          className="mt-3 w-full rounded-xl bg-cobalt py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {t("submit_claim")}
        </button>
      )}
    </div>
  );
}
