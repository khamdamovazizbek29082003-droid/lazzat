"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createReview } from "@/lib/data/client";
import type { DictKey } from "@/lib/i18n/dictionaries";
import type { Review } from "@/lib/data/types";
import type { UploadedMedia } from "@/components/shared/MediaUploader";

const draftKey = (restaurantId: string) => `lazzat:review-draft:${restaurantId}`;

/** Best-effort location for the "verified visit" badge — never blocks or fails the review. */
function getPositionSafe(timeoutMs = 4000): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}

/**
 * Shared review-submit logic for ReviewForm and RestaurantPopupPanel. If the user isn't
 * signed in, the draft (stars + text + media) is stashed in sessionStorage and `needsSignIn`
 * flips on — the caller renders sign-in buttons inline. Google's OAuth redirect leaves and
 * returns to this same page, so once the session comes back as authenticated the draft
 * resumes and submits automatically — no need to re-type the review.
 */
export function useReviewComposer(restaurantId: string, onSubmitted: (review: Review) => void) {
  const { status } = useSession();
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [error, setError] = useState<DictKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const doSubmit = useCallback(
    async (s: number, t: string, m: UploadedMedia[]) => {
      setSubmitting(true);
      setError(null);
      try {
        const position = await getPositionSafe();
        const review = await createReview(restaurantId, {
          ratingOverall: s,
          text: t.trim() || undefined,
          photoUrls: m.filter((x) => x.type === "PHOTO").map((x) => x.url),
          videoUrls: m.filter((x) => x.type === "VIDEO").map((x) => x.url),
          lat: position?.lat,
          lng: position?.lng,
        });
        onSubmitted(review);
        setStars(0);
        setText("");
        setMedia([]);
        setNeedsSignIn(false);
        sessionStorage.removeItem(draftKey(restaurantId));
      } catch (err) {
        if (err instanceof Error && err.message === "error_sign_in_required") {
          sessionStorage.setItem(draftKey(restaurantId), JSON.stringify({ stars: s, text: t, media: m }));
          setNeedsSignIn(true);
        } else {
          setError("error_generic");
        }
      } finally {
        setSubmitting(false);
      }
    },
    [restaurantId, onSubmitted],
  );

  // Resume a pending draft once the session comes back authenticated.
  useEffect(() => {
    if (status !== "authenticated") return;
    const raw = sessionStorage.getItem(draftKey(restaurantId));
    if (!raw) return;
    sessionStorage.removeItem(draftKey(restaurantId));
    try {
      const draft = JSON.parse(raw) as { stars: number; text: string; media?: UploadedMedia[] };
      if (draft.stars) doSubmit(draft.stars, draft.text ?? "", draft.media ?? []);
    } catch {
      // corrupt draft — ignore
    }
  }, [status, restaurantId, doSubmit]);

  const submit = () => {
    if (!stars) {
      setError("error_stars_required");
      return;
    }
    setNeedsSignIn(false);
    doSubmit(stars, text, media);
  };

  return { stars, setStars, text, setText, media, setMedia, error, submitting, needsSignIn, submit };
}
