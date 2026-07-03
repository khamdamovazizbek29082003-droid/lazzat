"use client";

import Link from "next/link";
import { useT } from "@/components/providers/LocaleProvider";
import { displayFont } from "@/lib/fonts";

export function MapTopBar({
  view,
  addMode,
  onToggleAdd,
  adminOpen,
  onToggleAdmin,
  pendingCount,
  onBackToCountry,
  canModerate,
}: {
  view: "country" | "city";
  addMode: boolean;
  onToggleAdd: () => void;
  adminOpen: boolean;
  onToggleAdmin: () => void;
  pendingCount: number;
  onBackToCountry: () => void;
  canModerate: boolean;
}) {
  const t = useT();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
      <Link href="/" className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 backdrop-blur">
        <span className={`${displayFont.className} text-base font-bold text-white`}>lazzat</span>
        <span className="hidden text-xs text-white/70 sm:inline">· {t("brand_tagline")}</span>
      </Link>
      <div className="pointer-events-auto flex flex-wrap gap-2">
        {view === "city" && (
          <button
            onClick={onBackToCountry}
            className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
          >
            {t("back_to_country")}
          </button>
        )}
        <button
          onClick={onToggleAdd}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
            addMode ? "bg-saffron text-white" : "bg-white text-cobalt-deep hover:brightness-95"
          }`}
        >
          {addMode ? t("cancel_add_place") : t("add_place")}
        </button>
        {canModerate && (
          <button
            onClick={onToggleAdmin}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              adminOpen ? "bg-cobalt text-white" : "bg-white/15 text-white backdrop-blur hover:bg-white/25"
            }`}
          >
            🛡 {t("admin_button")}
            {pendingCount ? ` (${pendingCount})` : ""}
          </button>
        )}
      </div>
    </div>
  );
}
