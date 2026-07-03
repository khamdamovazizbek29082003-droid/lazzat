"use client";

import { useT } from "@/components/providers/LocaleProvider";
import { CATEGORY_EMOJI, type EstablishmentType } from "@/lib/data/types";
import type { DictKey } from "@/lib/i18n/dictionaries";

const TYPES: { type: EstablishmentType; labelKey: DictKey }[] = [
  { type: "RESTAURANT", labelKey: "type_restaurant" },
  { type: "CAFE", labelKey: "type_cafe" },
  { type: "COFFEE_SHOP", labelKey: "type_coffee_shop" },
  { type: "TEA_HOUSE", labelKey: "type_tea_house" },
  { type: "FAST_FOOD", labelKey: "type_fast_food" },
  { type: "BAKERY", labelKey: "type_bakery" },
  { type: "STREET_FOOD", labelKey: "type_street_food" },
  { type: "CANTEEN", labelKey: "type_canteen" },
  { type: "DESSERT_SHOP", labelKey: "type_dessert_shop" },
  { type: "BAR", labelKey: "type_bar" },
];

export function TypeChips({
  active,
  onToggle,
}: {
  active: Set<EstablishmentType>;
  onToggle: (type: EstablishmentType) => void;
}) {
  const t = useT();

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TYPES.map(({ type, labelKey }) => {
        const isActive = active.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            aria-pressed={isActive}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
              isActive
                ? "border-transparent bg-cobalt text-white shadow-sm shadow-cobalt/30"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-cobalt/40"
            }`}
          >
            {CATEGORY_EMOJI[type]} {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
