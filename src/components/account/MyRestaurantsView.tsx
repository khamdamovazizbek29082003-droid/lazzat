"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { TopBar } from "@/components/layout/TopBar";
import { useT } from "@/components/providers/LocaleProvider";
import { listMyRestaurants } from "@/lib/data/client";
import { CATEGORY_EMOJI, type AdminRestaurant } from "@/lib/data/types";
import { RestaurantEditForm } from "@/components/shared/RestaurantEditForm";

export function MyRestaurantsView() {
  const t = useT();
  const { status } = useSession();
  const [items, setItems] = useState<AdminRestaurant[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    listMyRestaurants().then((r) => {
      setItems(r);
      setLoaded(true);
    });
  }, [status]);

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-16">
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="mt-6 text-2xl font-bold text-[var(--text)]">{t("my_restaurants")}</h1>

        {loaded && items.length === 0 && (
          <p className="mt-6 text-sm text-[var(--text-sub)]">{t("my_restaurants_empty")}</p>
        )}

        <div className="mt-6 space-y-3">
          {items.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <button
                onClick={() => setOpenId((cur) => (cur === r.id ? null : r.id))}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="font-bold text-[var(--text)]">
                  {CATEGORY_EMOJI[r.type]} {r.names.uz}
                </span>
                <span className="text-sm font-semibold text-cobalt">{openId === r.id ? t("close") : t("edit")}</span>
              </button>
              {openId === r.id && (
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <RestaurantEditForm
                    restaurant={r}
                    onSaved={(updated) => setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
