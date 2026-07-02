"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { useT } from "@/components/providers/LocaleProvider";
import { listNearby } from "@/lib/data/client";
import type { RestaurantSummary } from "@/lib/data/types";
import { isOpenNow } from "@/lib/data/utils";
import { FilterChips, type FilterKey } from "./FilterChips";
import { Hero } from "./Hero";
import { NationalDishes } from "./NationalDishes";
import { RestaurantGrid } from "./RestaurantGrid";

export function HomeView() {
  const t = useT();
  const [all, setAll] = useState<RestaurantSummary[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<FilterKey>>(new Set());

  useEffect(() => {
    listNearby().then(setAll);
  }, []);

  const toggleChip = (key: FilterKey) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const filtered = useMemo(() => {
    let items = all;
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter((r) => `${r.name.uz} ${r.name.ru} ${r.name.en} ${r.cityName}`.toLowerCase().includes(q));
    }
    if (active.has("openNow")) items = items.filter((r) => isOpenNow(r.hours));
    if (active.has("is24h")) items = items.filter((r) => r.attributes.is24h);
    if (active.has("budget")) items = items.filter((r) => r.priceBucket === "BUDGET");
    if (active.has("halal")) items = items.filter((r) => r.attributes.halal);
    if (active.has("delivery")) items = items.filter((r) => r.attributes.delivery);
    if (active.has("kidsArea")) items = items.filter((r) => r.attributes.kidsArea);
    if (active.has("outdoorSeating")) items = items.filter((r) => r.attributes.outdoorSeating);
    if (active.has("wifi")) items = items.filter((r) => r.attributes.wifi);
    if (active.has("parking")) items = items.filter((r) => r.attributes.parking);

    if (active.has("mostReviewed")) items = [...items].sort((a, b) => b.reviewCount - a.reviewCount);
    else if (active.has("topRated")) items = [...items].sort((a, b) => b.ratingAvg - a.ratingAvg);

    return items;
  }, [all, query, active]);

  const cityCount = useMemo(() => new Set(all.map((r) => r.cityName)).size, [all]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Hero value={query} onChange={setQuery} placeCount={all.length} cityCount={cityCount} />
        <NationalDishes />
        <div className="mt-6">
          <FilterChips active={active} onToggle={toggleChip} />
        </div>
        <div className="mt-8 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-[var(--text)]">{t("nearby_heading")}</h2>
          <span className="text-sm text-[var(--text-sub)]">
            {filtered.length} {t("places_found")}
          </span>
        </div>
        <div className="mt-4">
          <RestaurantGrid items={filtered} />
        </div>
      </main>
    </div>
  );
}
