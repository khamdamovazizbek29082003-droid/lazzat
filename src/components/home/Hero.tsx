"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useT } from "@/components/providers/LocaleProvider";
import { displayFont } from "@/lib/fonts";
import { DISH_PHOTOS, type DishPhotoKey } from "@/lib/data/photos";
import { Ikat } from "@/components/layout/Ikat";

const SLIDESHOW: DishPhotoKey[] = ["plov", "shashlik", "somsa", "manti", "lagman", "non"];
const SLIDE_INTERVAL_MS = 2000;
const FADE_MS = 900;

function SlidePhoto({ dishKey, active, priority }: { dishKey: DishPhotoKey; active: boolean; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const photo = DISH_PHOTOS[dishKey];

  return (
    <div
      className={`absolute inset-0 transition-opacity ease-in-out ${active ? "opacity-100" : "opacity-0"}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {!failed && (
        <Image
          src={photo.url}
          alt={photo.name.en}
          fill
          unoptimized
          priority={priority}
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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDESHOW.length), SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-3xl shadow-lg sm:min-h-[380px]">
      {/* Full-bleed rotating dish photos, crossfading — replaces the old gradient + medallion. */}
      <div className="absolute inset-0">
        {SLIDESHOW.map((key, i) => (
          <SlidePhoto key={key} dishKey={key} active={i === index} priority={i === 0} />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

      <div className="relative flex min-h-[320px] flex-col justify-end px-6 py-7 sm:min-h-[380px] sm:px-10 sm:py-9">
        <div className="animate-rise-in mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          <Ikat size={10} color="#D68F27" bg="transparent" />
          {t("brand_tagline")}
        </div>
        <h1 className={`${displayFont.className} animate-rise-in max-w-lg text-base leading-snug font-bold text-white sm:text-lg`}>
          {t("hero_title")}
        </h1>
        <p
          className="animate-rise-in mt-1.5 max-w-md text-xs leading-relaxed text-white/85 sm:text-sm"
          style={{ animationDelay: "80ms" }}
        >
          {t("hero_subtitle")}
        </p>

        <div
          className="animate-rise-in mt-5 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-xl"
          style={{ animationDelay: "150ms" }}
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

        <div className="animate-rise-in mt-4 flex flex-wrap gap-2.5" style={{ animationDelay: "220ms" }}>
          <span className="flex cursor-default items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-anor shadow-md sm:text-sm">
            <Ikat size={10} color="#B4322E" bg="#fff" /> {placeCount}+ {t("hero_stat_places")}
          </span>
          <span className="flex cursor-default items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white ring-1 ring-white/40 backdrop-blur sm:text-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-5.686-7-11a7 7 0 0 1 14 0c0 5.314-7 11-7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {cityCount} {t("hero_stat_cities")}
          </span>
        </div>
      </div>

      <span className="absolute right-3 bottom-2 text-[10px] font-medium text-white/70">{t("photo_credits_hint")}</span>
    </div>
  );
}
