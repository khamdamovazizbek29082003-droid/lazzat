"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useT } from "@/components/providers/LocaleProvider";
import {
  decideClaim,
  decideReview,
  decideSubmission,
  listClaimQueue,
  listReviewQueue,
  listSubmissionQueue,
  listUsers,
  searchAdminRestaurants,
} from "@/lib/data/client";
import {
  CATEGORY_EMOJI,
  type AdminRestaurant,
  type AdminUser,
  type ClaimEvidenceType,
  type PendingClaim,
  type PendingReview,
  type PlaceSubmission,
} from "@/lib/data/types";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { StarRating } from "@/components/restaurant/StarRating";
import { EditRestaurantPanel } from "./EditRestaurantPanel";

type Tab = "places" | "reviews" | "restaurants" | "claims" | "users";

const EVIDENCE_LABEL: Record<ClaimEvidenceType, DictKey> = {
  PHONE_VERIFICATION: "evidence_phone",
  DOCUMENT: "evidence_document",
  UTILITY_BILL: "evidence_utility_bill",
  OTHER: "evidence_other",
};

export function AdminQueueDrawer({ onClose, onDecided }: { onClose: () => void; onDecided: () => void }) {
  const t = useT();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [tab, setTab] = useState<Tab>("places");
  const [items, setItems] = useState<PlaceSubmission[]>([]);
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [editing, setEditing] = useState<AdminRestaurant | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const refresh = () => {
    listSubmissionQueue().then(setItems);
    listReviewQueue().then(setReviews);
    listClaimQueue().then(setClaims);
  };
  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (tab !== "restaurants") return;
    searchAdminRestaurants(restaurantQuery).then(setRestaurants);
  }, [tab, restaurantQuery]);

  useEffect(() => {
    if (tab !== "users" || !isAdmin) return;
    listUsers().then(setUsers);
  }, [tab, isAdmin]);

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

  const decideOwnerClaim = async (id: string, action: "approve" | "reject") => {
    await decideClaim(id, action);
    refresh();
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

      <div className="mb-3 flex gap-1 overflow-x-auto rounded-full bg-[var(--surface-2)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setTab("places")}
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
            tab === "places" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
          }`}
        >
          {t("admin_tab_places")} {items.length ? `(${items.length})` : ""}
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
            tab === "reviews" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
          }`}
        >
          {t("admin_tab_reviews")} {reviews.length ? `(${reviews.length})` : ""}
        </button>
        <button
          onClick={() => setTab("restaurants")}
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
            tab === "restaurants" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
          }`}
        >
          {t("admin_tab_restaurants")}
        </button>
        <button
          onClick={() => setTab("claims")}
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
            tab === "claims" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
          }`}
        >
          {t("admin_tab_claims")} {claims.length ? `(${claims.length})` : ""}
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab("users")}
            className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition ${
              tab === "users" ? "bg-cobalt text-white" : "text-[var(--text-sub)]"
            }`}
          >
            {t("admin_tab_users")}
          </button>
        )}
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

      {tab === "restaurants" && (
        <>
          <input
            value={restaurantQuery}
            onChange={(e) => setRestaurantQuery(e.target.value)}
            placeholder={t("admin_search_placeholder")}
            className="mb-2.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-cobalt"
          />
          {restaurants.map((r) => (
            <div key={r.id} className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] p-3">
              <div className="min-w-0">
                <div className="truncate font-bold text-[var(--text)]">
                  {CATEGORY_EMOJI[r.type]} {r.names.uz}
                </div>
                <div className="truncate text-xs text-[var(--text-sub)]">{r.cityName}</div>
              </div>
              <button
                onClick={() => setEditing(r)}
                className="shrink-0 rounded-lg bg-cobalt px-3 py-1.5 text-xs font-bold text-white"
              >
                {t("edit")}
              </button>
            </div>
          ))}
        </>
      )}

      {tab === "claims" && (
        <>
          {claims.length === 0 && <p className="py-4 text-sm text-[var(--text-sub)]">{t("admin_claims_empty")}</p>}
          {claims.map((c) => (
            <div key={c.id} className="mb-2.5 rounded-xl border border-[var(--border)] p-3">
              <div className="font-bold text-[var(--text)]">{c.restaurantName}</div>
              <div className="my-1 text-xs text-[var(--text-sub)]">
                {c.userName} · {t(EVIDENCE_LABEL[c.evidenceType])}
              </div>
              {c.note && <div className="my-1 text-xs text-[var(--text)]">&ldquo;{c.note}&rdquo;</div>}
              {c.evidenceUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.evidenceUrl} alt="" className="my-1.5 h-20 w-20 rounded-lg object-cover" />
              )}
              {c.restaurantPhone && (
                <a href={`tel:${c.restaurantPhone}`} className="my-1 block text-sm font-bold text-cobalt">
                  📞 {t("call_owner")}: {c.restaurantPhone}
                </a>
              )}
              <div className="mt-2 flex gap-2">
                <button onClick={() => decideOwnerClaim(c.id, "approve")} className="flex-1 rounded-lg bg-turquoise py-1.5 text-xs font-bold text-white">
                  ✓ {t("approve")}
                </button>
                <button onClick={() => decideOwnerClaim(c.id, "reject")} className="flex-1 rounded-lg bg-anor py-1.5 text-xs font-bold text-white">
                  ✕ {t("reject")}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "users" && isAdmin && (
        <>
          <div className="mb-3 text-sm font-bold text-[var(--text)]">
            {users.length} {t("admin_users_total")}
          </div>
          {users.map((u) => (
            <div key={u.id} className="mb-2 rounded-xl border border-[var(--border)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-bold text-[var(--text)]">{u.name}</div>
                {u.role !== "USER" && (
                  <span className="shrink-0 rounded-full bg-cobalt/10 px-2 py-0.5 text-[10px] font-bold text-cobalt">{u.role}</span>
                )}
              </div>
              <div className="mt-0.5 truncate text-xs text-[var(--text-sub)]">
                {u.email ?? (u.telegramId ? `Telegram: ${u.telegramId}` : "—")}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-sub)]">
                {t("admin_users_joined")} {u.createdAt.slice(0, 10)}
              </div>
            </div>
          ))}
        </>
      )}

      {editing && (
        <EditRestaurantPanel
          restaurant={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setRestaurants((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setEditing(null);
          }}
          onDeleted={() => {
            setRestaurants((prev) => prev.filter((r) => r.id !== editing.id));
            setEditing(null);
            onDecided();
          }}
        />
      )}
    </div>
  );
}
