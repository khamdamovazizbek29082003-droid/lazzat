"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useT } from "@/components/providers/LocaleProvider";
import { photoForType } from "@/lib/data/photos";
import type { RestaurantSummary } from "@/lib/data/types";
import { closesAtLabel, formatUzs, haversineKm, isOpenNow } from "@/lib/data/utils";
import { useFavorites } from "@/lib/hooks/useFavorites";

const TASHKENT_CENTER = { lat: 41.3111, lng: 69.2797 };

export function RestaurantCard({ restaurant }: { restaurant: RestaurantSummary }) {
  const { locale } = useLocale();
  const t = useT();
  const { isFavorite, toggle } = useFavorites();
  const [photoFailed, setPhotoFailed] = useState(false);
  const open = isOpenNow(restaurant.hours);
  const closes = closesAtLabel(restaurant.hours);
  const distance = restaurant.cityName === "Toshkent" ? haversineKm(TASHKENT_CENTER, restaurant) : null;
  const photo = photoForType(restaurant.type);

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition hover:shadow-lg"
    >
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${restaurant.gradient[0]}, ${restaurant.gradient[1]})` }}
      >
        {photoFailed ? (
          <span className="text-5xl drop-shadow">{restaurant.emoji}</span>
        ) : (
          <>
            <Image
              src={photo.url}
              alt={photo.name[locale]}
              fill
              unoptimized
              className="object-cover"
              onError={() => setPhotoFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <span className="absolute right-2 bottom-1.5 text-[9px] font-medium text-white/70">
              📷 {photo.credit}
            </span>
          </>
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-cobalt-deep/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          ◆ {restaurant.ratingAvg ? restaurant.ratingAvg.toFixed(1) : t("new_badge")}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(restaurant.slug);
          }}
          aria-label={t("save")}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-base transition hover:scale-105"
        >
          {isFavorite(restaurant.slug) ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="p-3.5">
        <div className="font-bold text-[var(--text)]">{restaurant.name[locale]}</div>
        <div className="mt-0.5 text-sm text-[var(--text-sub)]">
          {restaurant.districtName ?? restaurant.cityName}
          {distance !== null && ` · ${distance.toFixed(1)} km`}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={open ? "font-semibold text-turquoise" : "font-semibold text-anor"}>
            {open ? t("open_now") : t("closed_now")}
            {open && closes ? ` · ${t("closes_at")} ${closes}` : ""}
          </span>
          <span className="text-[var(--text-sub)]">~{formatUzs(restaurant.avgCheckUzs)}</span>
        </div>
      </div>
    </Link>
  );
}
