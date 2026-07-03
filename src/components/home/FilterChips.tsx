"use client";

import type { ReactNode } from "react";
import { useT } from "@/components/providers/LocaleProvider";
import type { DictKey } from "@/lib/i18n/dictionaries";

export type FilterKey =
  | "openNow"
  | "is24h"
  | "budget"
  | "halal"
  | "delivery"
  | "topRated"
  | "mostReviewed"
  | "kidsArea"
  | "familySection"
  | "outdoorSeating"
  | "wifi"
  | "parking";

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: Record<FilterKey, ReactNode> = {
  openNow: <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-turquoise" />,
  is24h: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  budget: (
    <svg {...ICON_PROPS}>
      <path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  halal: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" />
    </svg>
  ),
  delivery: (
    <svg {...ICON_PROPS}>
      <rect x="1" y="7" width="13" height="8" rx="1.2" />
      <path d="M14 10h3.5L20 12.8V15h-2" />
      <circle cx="6" cy="17.3" r="1.5" />
      <circle cx="16.5" cy="17.3" r="1.5" />
    </svg>
  ),
  topRated: (
    <svg {...ICON_PROPS} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 6.06 6.6.82-4.86 4.62 1.28 6.6L12 17.6l-5.92 3 1.28-6.6L2.5 9.38l6.6-.82L12 2.5Z" />
    </svg>
  ),
  mostReviewed: (
    <svg {...ICON_PROPS}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  ),
  kidsArea: (
    <svg {...ICON_PROPS}>
      <path d="M16.5 20v-1.8a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.2V20" />
      <circle cx="9.75" cy="7.8" r="3.3" />
      <path d="M21 20v-1.8a3.6 3.6 0 0 0-2.6-3.46" />
      <path d="M15 4.13a3.3 3.3 0 0 1 0 6.24" />
    </svg>
  ),
  outdoorSeating: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55" />
    </svg>
  ),
  familySection: (
    <svg {...ICON_PROPS}>
      <circle cx="7" cy="6.5" r="2.2" />
      <circle cx="17" cy="6.5" r="2.2" />
      <circle cx="12" cy="8.5" r="1.6" />
      <path d="M2.5 20v-1.5A3.5 3.5 0 0 1 6 15h2a3.5 3.5 0 0 1 3.5 3.5V20" />
      <path d="M12.5 20v-1a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1" />
    </svg>
  ),
  wifi: (
    <svg {...ICON_PROPS}>
      <path d="M5 12.6a11 11 0 0 1 14 0" />
      <path d="M1.4 9a16 16 0 0 1 21.2 0" />
      <path d="M8.5 16.1a6 6 0 0 1 7 0" />
      <circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  parking: (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border-[1.5px] border-current text-[10px] leading-none font-black">
      P
    </span>
  ),
};

const CHIPS: { key: FilterKey; labelKey: DictKey }[] = [
  { key: "openNow", labelKey: "filter_open_now" },
  { key: "is24h", labelKey: "filter_24h" },
  { key: "budget", labelKey: "filter_budget" },
  { key: "halal", labelKey: "filter_halal" },
  { key: "delivery", labelKey: "filter_delivery" },
  { key: "topRated", labelKey: "filter_top_rated" },
  { key: "mostReviewed", labelKey: "filter_most_reviewed" },
  { key: "kidsArea", labelKey: "filter_family" },
  { key: "familySection", labelKey: "filter_family_section" },
  { key: "outdoorSeating", labelKey: "filter_outdoor" },
  { key: "wifi", labelKey: "filter_wifi" },
  { key: "parking", labelKey: "filter_parking" },
];

export function FilterChips({ active, onToggle }: { active: Set<FilterKey>; onToggle: (key: FilterKey) => void }) {
  const t = useT();

  return (
    <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CHIPS.map((chip) => {
        const isActive = active.has(chip.key);
        return (
          <button
            key={chip.key}
            onClick={() => onToggle(chip.key)}
            aria-pressed={isActive}
            className={`group relative isolate flex shrink-0 items-center gap-2 overflow-hidden rounded-full border px-5 py-3 text-base font-semibold whitespace-nowrap transition-all duration-200 ease-out select-none ${
              isActive
                ? "border-transparent bg-gradient-to-r from-cobalt to-cobalt-lite text-white shadow-md shadow-cobalt/30"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-cobalt/40 hover:shadow-sm"
            } active:scale-[0.97]`}
          >
            {/* Smooth fill wipe on hover for unselected chips. */}
            {!isActive && (
              <span className="absolute inset-0 origin-left -z-10 scale-x-0 bg-cobalt/8 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            )}
            <span className="transition-transform duration-200 ease-out group-hover:scale-110">{ICONS[chip.key]}</span>
            {t(chip.labelKey)}
            {isActive && (
              <span className="animate-rise-in absolute -top-1.5 -right-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-saffron text-[9px] text-white shadow ring-2 ring-[var(--surface)]">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
