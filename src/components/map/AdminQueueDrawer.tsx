"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/providers/LocaleProvider";
import { decideReview, decideSubmission, listReviewQueue, listSubmissionQueue } from "@/lib/data/client";
import { CATEGORY_EMOJI, type PendingReview, type PlaceSubmission } from "@/lib/data/types";
import { StarRating } from "@/components/restaurant/StarRating";

type Tab = "places" | "reviews";

export function AdminQueueDrawer({ onClose, onDecided }: { onClose: () => void; onDecided: () => void }) {
  const t = useT();
  const [tab, setTab] = useState<Tab>("places");
  const [items, setItems] = useState<PlaceSubmission[]>([]);
  const [reviews, setReviews] = useState<PendingReview[]>([]);

  const refresh = () => {
    listSubmissionQueue().then(setItems);
    listReviewQueue().then(setReviews);
  };
  useEffect(() => {
    refresh();
  }, []);

  const decidePlace = async (id: string, action: "approve" | "reject") => {
    await decideSubmission(id, action);
    refresh();
    onDecided();
  };

  const decideRev = async (id: string, action: "approve" | "reject") => {
    await decideReview(id, action);
    refresh();
    onDecided();
  };

  return (
    <div className="animate-drop-in absolute top-[72px] right-3.5 z-50 max-h-[70vh] w-[340px] max-w-[92vw] overflow-y-auto rounded-2xl bg-[var(--surface)] p-4 shadow-2xl sm:right-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-bold text-[var(--text)]">🛡 {t("admin_queue")}</div>
        <button
          onClick={onClose}
          className="grid h-7 w-7 place-items-center rounded-full bg-[var(--surface-2)] text-sm text-[var(--text-sub)]"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 flex gap-1 rounded-full bg-[var(--surface-2)] p-1">
        <button
          onClick={() => setTab("places")}
          className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
            tab === "places" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
          }`}
        >
          {t("admin_tab_places")} {items.length ? `(${items.length})` : ""}
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`flex-1 rounded-full py-1.5 text-xs font-bold transition ${
            tab === "reviews" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
          }`}
        >
          {t("admin_tab_reviews")} {reviews.length ? `(${reviews.length})` : ""}
        </button>
      </div>

      {tab === "places" && (
        <>
          {items.length === 0 && <p className="py-4 text-sm text-[var(--text-sub)]">{t("admin_empty")}</p>}
          {items.map((s) => (
            <div key={s.id} className="mb-2.5 rounded-xl border border-[var(--border)] p-3">
              <div className="font-bold text-[var(--text)]">
                {CATEGORY_EMOJI[s.type]} {s.name}
              </div>
              <div className="my-1 text-xs text-[var(--text-sub)]">
                {s.type.replace("_", " ")} · {s.submittedBy}
              </div>
              {s.note && <div className="my-1 text-xs text-[var(--text)]">&ldquo;{s.note}&rdquo;</div>}
              <a href={`tel:${s.ownerPhone}`} className="my-1 block text-sm font-bold text-cobalt">
                📞 {t("call_owner")}: {s.ownerPhone}
              </a>
              <div className="mt-2 flex gap-2">
                <button onClick={() => decidePlace(s.id, "approve")} className="flex-1 rounded-lg bg-turquoise py-1.5 text-xs font-bold text-white">
                  ✓ {t("approve")}
                </button>
                <button onClick={() => decidePlace(s.id, "reject")} className="flex-1 rounded-lg bg-anor py-1.5 text-xs font-bold text-white">
                  ✕ {t("reject")}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "reviews" && (
        <>
          {reviews.length === 0 && <p className="py-4 text-sm text-[var(--text-sub)]">{t("admin_reviews_empty")}</p>}
          {reviews.map((r) => (
            <div key={r.id} className="mb-2.5 rounded-xl border border-[var(--border)] p-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-[var(--text)]">{r.restaurantName}</div>
                <StarRating value={r.ratingOverall} readOnly size={14} />
              </div>
              <div className="my-1 text-xs text-[var(--text-sub)]">{r.userName}</div>
              {r.text && <div className="my-1 text-xs text-[var(--text)]">&ldquo;{r.text}&rdquo;</div>}
              {r.media.length > 0 && (
                <div className="my-1.5 flex gap-1.5 overflow-x-auto">
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
              <div className="mt-2 flex gap-2">
                <button onClick={() => decideRev(r.id, "approve")} className="flex-1 rounded-lg bg-turquoise py-1.5 text-xs font-bold text-white">
                  ✓ {t("approve")}
                </button>
                <button onClick={() => decideRev(r.id, "reject")} className="flex-1 rounded-lg bg-anor py-1.5 text-xs font-bold text-white">
                  ✕ {t("reject")}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
