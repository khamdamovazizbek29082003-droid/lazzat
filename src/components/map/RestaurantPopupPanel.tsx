"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useT } from "@/components/providers/LocaleProvider";
import { createReview, getRestaurant } from "@/lib/data/client";
import { photoForType } from "@/lib/data/photos";
import type { RestaurantDetail } from "@/lib/data/types";
import { formatUzs } from "@/lib/data/utils";
import { ReviewList } from "@/components/restaurant/ReviewList";
import { StarRating } from "@/components/restaurant/StarRating";
import { Panel } from "./Panel";

export function RestaurantPopupPanel({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { locale } = useLocale();
  const t = useT();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setRestaurant(null);
    getRestaurant(slug).then((r) => {
      if (active) setRestaurant(r);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!restaurant) {
    return (
      <Panel title="…" onClose={onClose}>
        <div className="py-6 text-center text-sm text-[var(--text-sub)]">…</div>
      </Panel>
    );
  }

  const popular = restaurant.categories
    .flatMap((c) => c.items)
    .filter((i) => i.isPopular)
    .slice(0, 3);
  const photo = photoForType(restaurant.type);

  const submitReview = async () => {
    if (!stars) return setError(t("error_stars_required"));
    const review = await createReview(restaurant.slug, { ratingOverall: stars, text: text.trim() || undefined });
    setRestaurant((r) => (r ? { ...r, reviews: [review, ...r.reviews], reviewCount: r.reviewCount + 1 } : r));
    setStars(0);
    setText("");
    setError(null);
  };

  return (
    <Panel
      title={restaurant.name[locale]}
      subtitle={`${restaurant.cityName}${restaurant.districtName ? " · " + restaurant.districtName : ""}`}
      onClose={onClose}
    >
      <div
        className="relative mb-2.5 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl"
        style={{ background: `linear-gradient(135deg, ${restaurant.gradient[0]}, ${restaurant.gradient[1]})` }}
      >
        {photoFailed ? (
          <span className="text-4xl">{restaurant.emoji}</span>
        ) : (
          <Image
            src={photo.url}
            alt={photo.name[locale]}
            fill
            unoptimized
            className="object-cover"
            onError={() => setPhotoFailed(true)}
          />
        )}
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-lg bg-cobalt px-2.5 py-1 text-sm font-bold text-white">
          ◆ {restaurant.ratingAvg ? restaurant.ratingAvg.toFixed(1) : t("new_badge")}
        </span>
        <span className="text-xs text-[var(--text-sub)]">
          {restaurant.reviewCount} {t("reviews_count")} · ~{formatUzs(restaurant.avgCheckUzs)}
        </span>
      </div>

      {popular.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold text-[var(--text-sub)] uppercase">{t("popular_dishes")}</div>
          <ul className="mt-1 space-y-1">
            {popular.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-[var(--text)]">
                <span>
                  {item.emoji} {item.name[locale]}
                </span>
                <span className="font-semibold">{formatUzs(item.priceUzs)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-lg bg-cobalt py-1.5 text-center text-xs font-bold text-white"
        >
          {t("directions")}
        </a>
        <Link
          href={`/restaurants/${restaurant.slug}`}
          className="flex-1 rounded-lg border border-[var(--border)] py-1.5 text-center text-xs font-bold text-[var(--text)]"
        >
          {t("view_full_page")}
        </Link>
      </div>

      <div className="border-t border-[var(--border)] pt-3">
        <div className="text-xs font-bold text-[var(--text-sub)] uppercase">{t("leave_review")}</div>
        <div className="mt-1.5">
          <StarRating value={stars} onChange={setStars} size={19} />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("review_placeholder")}
          rows={2}
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm text-[var(--text)] outline-none focus:border-cobalt"
        />
        {error && <p className="mt-1 text-xs font-semibold text-anor">{error}</p>}
        <button onClick={submitReview} className="mt-1.5 w-full rounded-lg bg-cobalt py-1.5 text-sm font-bold text-white">
          {t("submit_review")}
        </button>
      </div>

      <div className="mt-3 max-h-40 overflow-y-auto border-t border-[var(--border)] pt-3">
        <ReviewList reviews={restaurant.reviews} />
      </div>
    </Panel>
  );
}
