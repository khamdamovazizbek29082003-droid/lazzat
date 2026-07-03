"use client";

import { useState } from "react";
import Image from "next/image";
import { useT } from "@/components/providers/LocaleProvider";
import { displayFont } from "@/lib/fonts";
import { DISH_PHOTOS } from "@/lib/data/photos";
import { Ikat } from "@/components/layout/Ikat";

const IKAT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cpath d='M22 3 L41 22 L22 41 L3 22 Z' fill='none' stroke='white' stroke-width='1.6'/%3E%3C/svg%3E\")";

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
  const medallion = DISH_PHOTOS.plov;
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg">
      {/* Warm terracotta-to-saffron gradient — a deliberate break from the cobalt brand color,
          reaching instead for ceramics/ikat/plov warmth. */}
      <div className="absolute inset-0 bg-gradient-to-br from-anor via-[#c1552b] to-saffron" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: IKAT_PATTERN, backgroundSize: "44px 44px" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

      <div className="relative grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <h1
            className={`${displayFont.className} animate-rise-in max-w-xl text-3xl leading-[1.15] font-extrabold text-white sm:text-4xl lg:text-[2.75rem]`}
          >
            {headlineLead}
            {headlineAccent && (
              <>
                <br />
                <span className="relative mt-1 inline-block">
                  <span className="relative z-10 text-white">{headlineAccent}</span>
                  <span className="absolute inset-x-0 -bottom-0.5 -z-0 h-[0.42em] -rotate-1 rounded-sm bg-cobalt-deep/60 sm:-bottom-1" />
                </span>
              </>
            )}
          </h1>
          <p className="animate-rise-in mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:text-base" style={{ animationDelay: "100ms" }}>
            {t("hero_subtitle")}
          </p>

          <div
            className="animate-rise-in mt-7 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-xl"
            style={{ animationDelay: "180ms" }}
          >
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("search_placeholder")}
              className="flex-1 bg-transparent px-4 py-2.5 text-[#17202b] placeholder-gray-400 outline-none"
            />
            <button
              aria-label={t("search_placeholder")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-anor text-white shadow-md transition-transform duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <div className="animate-rise-in mt-7 flex flex-wrap gap-3" style={{ animationDelay: "260ms" }}>
            <span className="flex cursor-default items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-anor shadow-md">
              <Ikat size={12} color="#B4322E" bg="#fff" /> {placeCount}+ {t("hero_stat_places")}
            </span>
            <span className="flex cursor-default items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/40 backdrop-blur">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-5.686-7-11a7 7 0 0 1 14 0c0 5.314-7 11-7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {cityCount} {t("hero_stat_cities")}
            </span>
          </div>
        </div>

        {/* Stamped photo medallion — a single iconic dish in a dashed "seal" ring, rotated for
            a hand-stamped feel, instead of the old full-bleed photo-mosaic wallpaper. */}
        <div className="animate-rise-in relative mx-auto hidden aspect-square w-full max-w-[280px] sm:block" style={{ animationDelay: "140ms" }}>
          <div className="absolute inset-0 rotate-3 rounded-full border-[3px] border-dashed border-white/50" />
          <div className="absolute inset-3 -rotate-2 overflow-hidden rounded-full shadow-2xl ring-4 ring-white/80">
            {!photoFailed ? (
              <Image
                src={medallion.url}
                alt={medallion.name.en}
                fill
                unoptimized
                className="object-cover"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-cobalt-deep text-5xl">🍚</div>
            )}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-2 rounded-full bg-cobalt-deep px-3 py-1 text-[11px] font-bold whitespace-nowrap text-white shadow-lg">
            {medallion.name.uz}
          </span>
        </div>
      </div>

      <span className="absolute right-3 bottom-2 text-[10px] font-medium text-white/70">{t("photo_credits_hint")}</span>
    </div>
  );
}
