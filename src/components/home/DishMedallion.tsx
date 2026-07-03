"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/components/providers/LocaleProvider";
import { DISH_PHOTOS, type DishPhotoKey } from "@/lib/data/photos";

const ROTATION: DishPhotoKey[] = ["plov", "shashlik", "somsa", "manti", "lagman", "non"];
const INTERVAL_MS = 2800;
const FLIP_MS = 700;

function Face({ dishKey, hidden }: { dishKey: DishPhotoKey; hidden?: boolean }) {
  const { locale } = useLocale();
  const [failed, setFailed] = useState(false);
  const photo = DISH_PHOTOS[dishKey];

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-full"
      style={{ backfaceVisibility: "hidden", transform: hidden ? "rotateY(180deg)" : undefined }}
    >
      {!failed ? (
        <Image src={photo.url} alt={photo.name.en} fill unoptimized className="object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="grid h-full w-full place-items-center bg-cobalt-deep text-5xl">🍚</div>
      )}
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-2 rounded-full bg-cobalt-deep px-3 py-1 text-[11px] font-bold whitespace-nowrap text-white shadow-lg">
        {photo.name[locale]}
      </span>
    </div>
  );
}

/**
 * A "stamped" circular photo that page-flips (3D rotateY, like a card/book page turning)
 * between national dishes every ~2.8s. Click to flip immediately; hover pauses the timer.
 */
export function DishMedallion() {
  const [flipped, setFlipped] = useState(false);
  const [frontKey, setFrontKey] = useState<DishPhotoKey>(ROTATION[0]);
  const [backKey, setBackKey] = useState<DishPhotoKey>(ROTATION[1]);
  const nextIndex = useRef(2);
  const paused = useRef(false);

  const advance = useCallback(() => {
    setFlipped((prev) => {
      const next = !prev;
      const dish = ROTATION[nextIndex.current % ROTATION.length];
      nextIndex.current += 1;
      // Whichever face is about to be hidden by this flip is safe to update now — it won't
      // be visible again until it flips back into view two turns from now.
      if (next) setFrontKey(dish);
      else setBackKey(dish);
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) advance();
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <div
      className="animate-rise-in group relative mx-auto hidden aspect-square w-full max-w-[280px] cursor-pointer sm:block"
      style={{ animationDelay: "140ms" }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onClick={advance}
      role="button"
      aria-label="Show another dish"
    >
      <div className="absolute inset-0 rotate-3 rounded-full border-[3px] border-dashed border-white/50 transition-transform duration-500 group-hover:rotate-[18deg]" />
      <div
        className="absolute inset-3 overflow-hidden rounded-full shadow-2xl ring-4 ring-white/80 transition-transform duration-300 group-hover:scale-[1.04]"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative h-full w-full transition-transform ease-[cubic-bezier(0.45,0,0.2,1)]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transitionDuration: `${FLIP_MS}ms`,
          }}
        >
          <Face dishKey={frontKey} />
          <Face dishKey={backKey} hidden />
        </div>
      </div>
    </div>
  );
}
