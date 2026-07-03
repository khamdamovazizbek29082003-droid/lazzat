"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { RestaurantGrid } from "@/components/home/RestaurantGrid";
import { useLocale, useT } from "@/components/providers/LocaleProvider";
import { displayFont } from "@/lib/fonts";
import type { DictKey } from "@/lib/i18n/dictionaries";
import { photoForType } from "@/lib/data/photos";
import type { RestaurantDetail, RestaurantSummary } from "@/lib/data/types";
import { closesAtLabel, formatUzs, isOpenNow } from "@/lib/data/utils";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

const ATTRIBUTE_BADGES: { key: keyof RestaurantDetail["attributes"]; icon: string; labelKey: DictKey }[] = [
  { key: "halal", icon: "☪️", labelKey: "filter_halal" },
  { key: "delivery", icon: "🛵", labelKey: "filter_delivery" },
  { key: "wifi", icon: "📶", labelKey: "filter_wifi" },
  { key: "parking", icon: "🅿️", labelKey: "filter_parking" },
  { key: "outdoorSeating", icon: "🌤️", labelKey: "filter_outdoor" },
  { key: "kidsArea", icon: "🧒", labelKey: "filter_family" },
  { key: "is24h", icon: "🕐", labelKey: "filter_24h" },
];

function summarizeHours(hours: RestaurantDetail["hours"]) {
  const first = hours[0];
  const uniform = hours.every(
    (h) => h.opensAt === first.opensAt && h.closesAt === first.closesAt && h.isClosed === first.isClosed,
  );
  if (!uniform) return null;
  if (first.isClosed) return null;
  if (!first.opensAt || !first.closesAt) return "24/7";
  return `${first.opensAt} – ${first.closesAt}`;
}

export function RestaurantDetailView({
  restaurant: initial,
  nearby,
}: {
  restaurant: RestaurantDetail;
  nearby: RestaurantSummary[];
}) {
  const { locale } = useLocale();
  const t = useT();
  const { isFavorite, toggle } = useFavorites();
  const [restaurant, setRestaurant] = useState(initial);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const open = isOpenNow(restaurant.hours);
  const hoursLabel = summarizeHours(restaurant.hours);
  const photo = photoForType(restaurant.type);
  const [photoFailed, setPhotoFailed] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      await navigator.share({ title: restaurant.name[locale], url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg(t("link_copied"));
      setTimeout(() => setShareMsg(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-16">
      <TopBar cityName={restaurant.cityName} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <div
          className="relative flex h-56 items-center justify-center overflow-hidden rounded-3xl sm:h-72"
          style={{ background: `linear-gradient(135deg, ${restaurant.gradient[0]}, ${restaurant.gradient[1]})` }}
        >
          {photoFailed ? (
            <span className="text-8xl drop-shadow">{restaurant.emoji}</span>
          ) : (
            <>
              <Image
                src={photo.url}
                alt={photo.name[locale]}
                fill
                unoptimized
                className="object-cover"
                priority
                onError={() => setPhotoFailed(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute right-3 bottom-2 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                📷 {photo.name[locale]} — {photo.credit}
              </span>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className={`${displayFont.className} text-2xl font-bold text-[var(--text)] sm:text-3xl`}>
              {restaurant.name[locale]}
            </h1>
            <div className="mt-1 text-sm text-[var(--text-sub)]">
              {restaurant.districtName ? `${restaurant.districtName} · ` : ""}
              {restaurant.address}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggle(restaurant.slug)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
            >
              {isFavorite(restaurant.slug) ? "❤️" : "🤍"} {isFavorite(restaurant.slug) ? t("saved") : t("save")}
            </button>
            <button
              onClick={share}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
            >
              🔗 {t("share")}
            </button>
          </div>
        </div>
        {shareMsg && <p className="mt-1 text-xs font-semibold text-turquoise">{shareMsg}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-cobalt px-3 py-1 text-sm font-bold text-white">
            ◆ {restaurant.ratingAvg ? restaurant.ratingAvg.toFixed(1) : t("new_badge")}
          </span>
          <span className="text-sm text-[var(--text-sub)]">
            {restaurant.reviewCount} {t("reviews_count")}
          </span>
          <span className={open ? "text-sm font-semibold text-turquoise" : "text-sm font-semibold text-anor"}>
            {open ? t("open_now") : t("closed_now")}
            {open && closesAtLabel(restaurant.hours) ? ` · ${t("closes_at")} ${closesAtLabel(restaurant.hours)}` : ""}
          </span>
          <span className="text-sm text-[var(--text-sub)]">
            {t("avg_check")}: ~{formatUzs(restaurant.avgCheckUzs)}
          </span>
        </div>

        {restaurant.description[locale] && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text)]">
            {restaurant.description[locale]}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {ATTRIBUTE_BADGES.filter((b) => restaurant.attributes[b.key]).map((b) => (
            <span
              key={b.key}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text)]"
            >
              {b.icon} {t(b.labelKey)}
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {restaurant.categories.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[var(--text)]">{t("menu")}</h2>
                <div className="mt-3 space-y-6">
                  {restaurant.categories.map((cat) => (
                    <div key={cat.id}>
                      <h3 className="text-sm font-bold tracking-wide text-[var(--text-sub)] uppercase">
                        {cat.name[locale]}
                      </h3>
                      <div className="mt-2 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                        {cat.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{item.emoji}</span>
                              <span className="font-medium text-[var(--text)]">{item.name[locale]}</span>
                              {item.isPopular && (
                                <span className="rounded-full bg-saffron/15 px-2 py-0.5 text-xs font-bold text-saffron">
                                  {t("popular_dishes")}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 font-semibold text-[var(--text)]">{formatUzs(item.priceUzs)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-lg font-bold text-[var(--text)]">
                {restaurant.reviewCount} {t("reviews_count")}
              </h2>
              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <ReviewForm
                  restaurantId={restaurant.id}
                  onSubmitted={(review) =>
                    setRestaurant((r) => ({
                      ...r,
                      reviews: [review, ...r.reviews],
                      reviewCount: r.reviewCount + 1,
                    }))
                  }
                />
                <div className="mt-5 border-t border-[var(--border)] pt-4">
                  <ReviewList reviews={restaurant.reviews} />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
              {hoursLabel && (
                <div className="mb-3">
                  <div className="font-bold text-[var(--text)]">{t("hours")}</div>
                  <div className="text-[var(--text-sub)]">{hoursLabel}</div>
                </div>
              )}
              <div className="mb-3">
                <div className="font-bold text-[var(--text)]">{t("address")}</div>
                <div className="text-[var(--text-sub)]">{restaurant.address}</div>
              </div>
              {restaurant.phone && (
                <div>
                  <div className="font-bold text-[var(--text)]">{t("phone")}</div>
                  <a href={`tel:${restaurant.phone}`} className="text-cobalt">
                    {restaurant.phone}
                  </a>
                </div>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block rounded-xl bg-cobalt py-2 text-center text-sm font-bold text-white transition hover:brightness-110"
              >
                {t("directions")}
              </a>
              <Link
                href={`/map?slug=${restaurant.slug}`}
                className="mt-2 block rounded-xl border border-[var(--border)] py-2 text-center text-sm font-bold text-[var(--text)] transition hover:bg-[var(--surface-2)]"
              >
                {t("view_map")}
              </Link>
            </div>
          </aside>
        </div>

        {nearby.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-[var(--text)]">{t("nearby_similar")}</h2>
            <div className="mt-3">
              <RestaurantGrid items={nearby} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
