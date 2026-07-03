"use client";

import { useT } from "@/components/providers/LocaleProvider";
import type { Review } from "@/lib/data/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const t = useT();

  if (reviews.length === 0) {
    return <p className="text-sm text-[var(--text-sub)]">{t("no_reviews_yet")}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id}>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--text)]">
            {r.userName} <span className="text-saffron">{"★".repeat(r.ratingOverall)}</span>
            {r.isVerifiedVisit && (
              <span className="flex items-center gap-1 rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise" title={t("verified_visit_hint")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {t("verified_visit")}
              </span>
            )}
            {r.mine && <span className="text-xs font-semibold text-turquoise">● {t("pending_review")}</span>}
          </div>
          {r.text && <p className="mt-0.5 text-sm text-[var(--text-sub)]">{r.text}</p>}
          {r.media && r.media.length > 0 && (
            <div className="mt-1.5 flex gap-1.5 overflow-x-auto">
              {r.media.map((m, i) =>
                m.type === "VIDEO" ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video key={i} src={m.url} className="h-16 w-16 shrink-0 rounded-lg object-cover" controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={m.url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
