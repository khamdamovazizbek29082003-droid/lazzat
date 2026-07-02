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
            {r.mine && <span className="text-xs font-semibold text-turquoise">● {t("pending_review")}</span>}
          </div>
          {r.text && <p className="mt-0.5 text-sm text-[var(--text-sub)]">{r.text}</p>}
        </div>
      ))}
    </div>
  );
}
