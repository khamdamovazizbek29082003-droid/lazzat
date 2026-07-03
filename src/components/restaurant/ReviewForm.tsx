"use client";

import { useState } from "react";
import { useT } from "@/components/providers/LocaleProvider";
import { createReview } from "@/lib/data/client";
import type { Review } from "@/lib/data/types";
import { StarRating } from "./StarRating";

export function ReviewForm({
  restaurantId,
  onSubmitted,
}: {
  restaurantId: string;
  onSubmitted: (review: Review) => void;
}) {
  const t = useT();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!stars) {
      setError(t("error_stars_required"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const review = await createReview(restaurantId, { ratingOverall: stars, text: text.trim() || undefined });
      onSubmitted(review);
      setStars(0);
      setText("");
    } catch (err) {
      setError(err instanceof Error && err.message === "error_sign_in_required" ? t("error_sign_in_required") : t("error_generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-xs font-bold tracking-wide text-[var(--text-sub)] uppercase">{t("leave_review")}</div>
      <div className="mt-2">
        <StarRating value={stars} onChange={setStars} />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("review_placeholder")}
        rows={2}
        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none focus:border-cobalt"
      />
      {error && <p className="mt-1 text-xs font-semibold text-anor">{error}</p>}
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-2 w-full rounded-xl bg-cobalt py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {t("submit_review")}
      </button>
    </div>
  );
}
