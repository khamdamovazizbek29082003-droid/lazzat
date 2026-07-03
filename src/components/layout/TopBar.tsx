"use client";

import Link from "next/link";
import { displayFont } from "@/lib/fonts";
import { useLocale, useT } from "@/components/providers/LocaleProvider";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { LOCALES } from "@/lib/i18n/dictionaries";
import { Ikat } from "./Ikat";
import { AuthButton } from "./AuthButton";

export function TopBar({ cityName = "Toshkent" }: { cityName?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useT();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-cobalt">
          <Ikat size={14} color="#D68F27" bg="#14418C" />
        </span>
        <span className={`${displayFont.className} text-lg font-bold text-[var(--text)]`}>lazzat</span>
        <span className="hidden text-sm text-[var(--text-sub)] sm:inline">· {cityName}</span>
      </Link>

      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/map"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
        >
          🗺 {t("nav_map")}
        </Link>
        <div className="flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition ${
                locale === l ? "bg-cobalt text-white" : "text-[var(--text-sub)] hover:text-[var(--text)]"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <ThemeToggle />
        <AuthButton />
      </nav>
    </header>
  );
}
