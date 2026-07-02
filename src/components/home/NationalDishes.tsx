"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useT } from "@/components/providers/LocaleProvider";
import { displayFont } from "@/lib/fonts";
import { DISH_PHOTOS, NATIONAL_DISHES, type DishPhotoKey } from "@/lib/data/photos";

const FALLBACK_GRADIENTS: [string, string][] = [
  ["#14418C", "#2563C4"],
  ["#D68F27", "#B4322E"],
  ["#1E9C8D", "#14418C"],
];

function DishTile({ dishKey, index }: { dishKey: DishPhotoKey; index: number }) {
  const { locale } = useLocale();
  const [failed, setFailed] = useState(false);
  const photo = DISH_PHOTOS[dishKey];
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  return (
    <div
      className="group relative h-40 w-32 shrink-0 overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-lg sm:h-48 sm:w-40 lg:h-52 lg:w-44"
      style={failed ? { background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` } : undefined}
    >
      {!failed && (
        <>
          <Image
            src={photo.url}
            alt={photo.name[locale]}
            fill
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-110"
            onError={() => setFailed(true)}
          />
          <span className="absolute top-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur">
            {photo.credit}
          </span>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span className={`${displayFont.className} absolute right-3 bottom-2.5 left-3 text-sm font-bold text-white drop-shadow sm:text-base`}>
        {photo.name[locale]}
      </span>
    </div>
  );
}

export function NationalDishes() {
  const t = useT();

  return (
    <section className="mt-8">
      <h2 className={`${displayFont.className} text-xl font-bold text-[var(--text)]`}>{t("national_dishes")}</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NATIONAL_DISHES.map((key, i) => (
          <DishTile key={key} dishKey={key} index={i} />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-[var(--text-sub)]">{t("photo_credits_hint")}</p>
    </section>
  );
}
