import type { RestaurantSummary } from "@/lib/data/types";
import { RestaurantCard } from "./RestaurantCard";

export function RestaurantGrid({ items, emptyLabel }: { items: RestaurantSummary[]; emptyLabel?: string }) {
  if (items.length === 0) {
    return emptyLabel ? <p className="py-10 text-center text-sm text-[var(--text-sub)]">{emptyLabel}</p> : null;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((restaurant) => (
        <RestaurantCard key={restaurant.slug} restaurant={restaurant} />
      ))}
    </div>
  );
}
