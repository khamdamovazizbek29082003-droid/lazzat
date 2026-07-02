"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "@/components/providers/LocaleProvider";
import { displayFont } from "@/lib/fonts";
import { DISH_PHOTOS, NATIONAL_DISHES, type DishPhotoKey } from "@/lib/data/photos";

function MosaicTile({ dishKey }: { dishKey: DishPhotoKey }) {
  const [failed, setFailed] = useState(false);
  const photo = DISH_PHOTOS[dishKey];

  return (
    <div className="relative h-full w-full bg-cobalt-deep">
      {!failed && (
        <Image
          src={photo.url}
          alt={photo.name.en}
          fill
          unoptimized
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function Hero({
  value,
  onChange,
  placeCount,
  cityCount,
}: {
  value: string;
  onChange: (value: string) => void;
  placeCount: number;
  cityCount: number;
}) {
  const t = useT();
  const [headlineLead, headlineAccent] = t("hero_title").split(" — ");

  return (
    <div className="relative flex min-h-[380px] flex-col justify-center overflow-hidden rounded-3xl shadow-lg sm:min-h-[440px]">
      {/* Wallpaper of real Uzbek dishes (same photos as the "national dishes" strip below). */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2">
        {NATIONAL_DISHES.map((key) => (
          <MosaicTile key={key} dishKey={key} />
        ))}
      </div>
      {/* Cobalt scrim: near-opaque on the left for text contrast, fading right so the photos read through. */}
      <div className="absolute inset-0 bg-gradient-to-r from-cobalt-deep/95 via-cobalt-deep/85 to-cobalt/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-cobalt-deep/70 via-transparent to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}
      />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <h1
          className={`${displayFont.className} animate-rise-in max-w-lg text-2xl leading-[1.25] font-bold tracking-tight text-white drop-shadow-sm sm:text-3xl lg:text-4xl`}
        >
          {headlineLead}
          {headlineAccent && (
            <>
              {" "}
              <span className="animate-shimmer inline-block bg-gradient-to-r from-saffron via-[#ffd985] to-saffron bg-clip-text text-transparent [animation-duration:6s]">
                — {headlineAccent}
              </span>
            </>
          )}
        </h1>
        <p
          className="animate-rise-in mt-4 max-w-md border-l-2 border-saffron/70 pl-3.5 text-sm leading-relaxed text-white/90 sm:text-base"
          style={{ animationDelay: "100ms" }}
        >
          {t("hero_subtitle")}
        </p>

        <div
          className="animate-rise-in group mt-7 flex max-w-xl items-center gap-2 rounded-full border border-white/25 bg-white/15 p-1.5 shadow-lg backdrop-blur transition-colors focus-within:border-white/50 focus-within:bg-white/20"
          style={{ animationDelay: "180ms" }}
        >
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 bg-transparent px-4 py-2 text-white placeholder-white/70 outline-none"
          />
          <button
            aria-label={t("search_placeholder")}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-saffron text-white shadow-md transition-transform duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <div className="animate-rise-in mt-6 flex flex-wrap gap-2.5" style={{ animationDelay: "260ms" }}>
          <span className="flex cursor-default items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg">
            <span className="text-saffron">◆</span> {placeCount}+ {t("hero_stat_places")}
          </span>
          <span className="flex cursor-default items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/25 hover:shadow-lg">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-5.686-7-11a7 7 0 0 1 14 0c0 5.314-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {cityCount} {t("hero_stat_cities")}
          </span>
        </div>
      </div>

      <span className="absolute right-3 bottom-2 text-[10px] font-medium text-white/60">{t("photo_credits_hint")}</span>
    </div>
  );
}
