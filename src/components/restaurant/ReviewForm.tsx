"use client";

import { useT } from "@/components/providers/LocaleProvider";
import type { Review } from "@/lib/data/types";
import { useReviewComposer } from "@/lib/hooks/useReviewComposer";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { InlineSignIn } from "./InlineSignIn";
import { StarRating } from "./StarRating";

export function ReviewForm({
  restaurantId,
  onSubmitted,
}: {
  restaurantId: string;
  onSubmitted: (review: Review) => void;
}) {
  const t = useT();
  const { stars, setStars, text, setText, media, setMedia, error, submitting, needsSignIn, submit } = useReviewComposer(
    restaurantId,
    onSubmitted,
  );

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
      <div className="mt-2">
        <MediaUploader value={media} onChange={setMedia} />
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-anor">{t(error)}</p>}
      {needsSignIn ? (
        <InlineSignIn />
      ) : (
        <button
          onClick={submit}
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-cobalt py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {t("submit_review")}
        </button>
      )}
    </div>
  );
}
