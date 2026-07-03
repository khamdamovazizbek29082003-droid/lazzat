"use client";

import { useEffect, useState } from "react";
import { useLocale, useT } from "@/components/providers/LocaleProvider";
import { listRegions } from "@/lib/data/client";
import type { Region } from "@/lib/data/types";

export function RegionCityPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (citySlug: string | null) => void;
}) {
  const { locale } = useLocale();
  const t = useT();
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    listRegions(locale).then(setRegions);
  }, [locale]);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] outline-none focus:border-cobalt"
    >
      <option value="">{t("region_picker_all")}</option>
      {regions.map((r) => (
        <optgroup key={r.id} label={r.name}>
          {r.cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
