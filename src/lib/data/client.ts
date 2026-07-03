/**
 * Data client. Every function here hits the real database via the live API routes.
 * Write paths (submissions, reviews, admin decisions) require a signed-in session —
 * NextAuth cookies ride along automatically on same-origin fetch calls from client
 * components, so no extra wiring is needed beyond `credentials: "same-origin"` (the
 * fetch default).
 */
import { isOpenNow, isValidOwnerPhone } from "./utils";
import { CATEGORY_EMOJI } from "./types";
import type {
  AdminRestaurant,
  ClaimEvidenceType,
  CreateReviewInput,
  EstablishmentType,
  Locale,
  MapData,
  MapMarker,
  NearbyFilters,
  PendingClaim,
  PendingReview,
  PlaceSubmission,
  PlaceSubmissionInput,
  Region,
  Review,
  RestaurantAttributes,
  RestaurantDetail,
  RestaurantSummary,
  TranslatedText,
  WorkingHours,
} from "./types";

type BBox = { west: number; south: number; east: number; north: number };

/** Relative fetch works in the browser; server components (SSR) need an absolute URL. */
function apiUrl(path: string) {
  if (typeof window !== "undefined") return path;
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}${path}`;
}

// ─────────────────────────── shape adapters (Prisma JSON -> frontend types) ───────────────────────────

type RawTranslation = { locale: string; [field: string]: unknown };

function pickTranslated(translations: RawTranslation[] | undefined, field: string): TranslatedText {
  const out: TranslatedText = { uz: "", ru: "", en: "", kaa: "" };
  for (const t of translations ?? []) {
    if (t.locale === "uz" || t.locale === "ru" || t.locale === "en" || t.locale === "kaa") out[t.locale] = (t[field] as string) ?? "";
  }
  // Most listing names are proper nouns kept identical across locales anyway (see the OSM
  // import) — fall back to the Uzbek name rather than showing blank when no "kaa" row exists.
  if (!out.kaa) out.kaa = out.uz;
  return out;
}

const GRADIENTS: [string, string][] = [
  ["#14418C", "#2563C4"],
  ["#D68F27", "#B4322E"],
  ["#1E9C8D", "#14418C"],
  ["#B4322E", "#D68F27"],
  ["#2563C4", "#1E9C8D"],
  ["#0E3068", "#2563C4"],
];
function gradientFor(id: string): [string, string] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

function mapAttributes(a: Partial<RestaurantAttributes> | null | undefined): RestaurantAttributes {
  return {
    delivery: a?.delivery ?? false,
    takeaway: a?.takeaway ?? false,
    dineIn: a?.dineIn ?? true,
    parking: a?.parking ?? false,
    wifi: a?.wifi ?? false,
    outdoorSeating: a?.outdoorSeating ?? false,
    kidsArea: a?.kidsArea ?? false,
    halal: a?.halal ?? false,
    vegetarian: a?.vegetarian ?? false,
    vegan: a?.vegan ?? false,
    is24h: a?.is24h ?? false,
  };
}

function mapHours(hours: Array<{ dayOfWeek: number; opensAt: string | null; closesAt: string | null; isClosed: boolean }> | undefined): WorkingHours[] {
  return (hours ?? []).map((h) => ({ dayOfWeek: h.dayOfWeek, opensAt: h.opensAt, closesAt: h.closesAt, isClosed: h.isClosed }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSummary(r: any): RestaurantSummary {
  return {
    id: r.id,
    slug: r.slug,
    type: r.type,
    name: pickTranslated(r.translations, "name"),
    cityName: r.city?.translations?.[0]?.name ?? "",
    citySlug: r.city?.slug ?? "",
    districtName: r.district?.translations?.[0]?.name,
    lat: r.lat,
    lng: r.lng,
    priceBucket: r.priceBucket,
    avgCheckUzs: r.avgCheckUzs ?? 0,
    ratingAvg: r.ratingAvg,
    reviewCount: r.reviewCount,
    gradient: gradientFor(r.id),
    emoji: CATEGORY_EMOJI[r.type as EstablishmentType],
    attributes: mapAttributes(r.attributes),
    hours: mapHours(r.hours),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetail(r: any): RestaurantDetail {
  return {
    ...mapSummary(r),
    description: pickTranslated(r.translations, "description"),
    address: r.address,
    phone: r.phone ?? undefined,
    telegram: r.telegram ?? undefined,
    verifiedOwner: r.verifiedOwner ?? false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories: (r.categories ?? []).map((c: any) => ({
      id: c.id,
      name: pickTranslated(c.translations, "name"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (c.items ?? []).map((it: any) => ({
        id: it.id,
        name: pickTranslated(it.translations, "name"),
        priceUzs: it.priceUzs,
        weightGrams: it.weightGrams ?? undefined,
        isPopular: it.isPopular,
        isSeasonal: it.isSeasonal,
        // No per-item photos uploaded yet — fall back to the restaurant-level category emoji.
        emoji: CATEGORY_EMOJI[r.type as EstablishmentType],
      })),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviews: (r.reviews ?? []).map((rev: any) => ({
      id: rev.id,
      restaurantId: rev.restaurantId,
      userName: rev.user?.name ?? "Foydalanuvchi",
      ratingOverall: rev.ratingOverall,
      ratingFood: rev.ratingFood ?? undefined,
      ratingService: rev.ratingService ?? undefined,
      ratingAtmosphere: rev.ratingAtmosphere ?? undefined,
      ratingPrice: rev.ratingPrice ?? undefined,
      text: rev.text ?? undefined,
      createdAt: rev.createdAt,
      isVerifiedVisit: rev.isVerifiedVisit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      media: (rev.media ?? []).map((m: any) => ({ url: m.url, type: m.type })),
    })),
  };
}

// ─────────────────────────── live reads ───────────────────────────

/** mirrors GET /api/v1/map?west=&south=&east=&north=&zoom=&locale= */
export async function getMapData(params: BBox & { zoom: number; locale?: Locale }): Promise<MapData> {
  const qs = new URLSearchParams({
    west: String(params.west),
    south: String(params.south),
    east: String(params.east),
    north: String(params.north),
    zoom: String(params.zoom),
    locale: params.locale ?? "uz",
  });
  const res = await fetch(apiUrl(`/api/v1/map?${qs}`), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load map data");
  const data = await res.json();

  if (data.type === "clusters") {
    return { type: "clusters", items: data.items };
  }

  const items: MapMarker[] = data.items.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any): MapMarker => ({
      id: m.id,
      slug: m.slug,
      lat: m.lat,
      lng: m.lng,
      rating: m.rating,
      priceBucket: m.priceBucket,
      type: m.type,
      status: "APPROVED",
      name: m.name,
      emoji: CATEGORY_EMOJI[m.type as EstablishmentType],
    }),
  );

  // Pending (unverified) submissions aren't public — only the submitter and moderators can
  // see them (GET /api/v1/submissions, /api/v1/admin/queues/submissions). The caller overlays
  // its own just-submitted pin locally instead of relying on this feed for that.
  return { type: "markers", items };
}

/** mirrors GET /api/v1/restaurants/:slug */
export async function getRestaurant(slug: string): Promise<RestaurantDetail | null> {
  const res = await fetch(apiUrl(`/api/v1/restaurants/${slug}`), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load restaurant");
  const { restaurant } = await res.json();
  return mapDetail(restaurant);
}

/** mirrors GET /api/v1/restaurants */
export async function listNearby(filters: NearbyFilters = {}): Promise<RestaurantSummary[]> {
  const qs = new URLSearchParams({ limit: "50" });
  if (filters.city) qs.set("city", filters.city);
  if (filters.q) qs.set("q", filters.q);
  if (filters.halal) qs.set("halal", "true");
  if (filters.priceBucket) qs.set("priceBucket", filters.priceBucket);

  const res = await fetch(apiUrl(`/api/v1/restaurants?${qs}`), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load restaurants");
  const { items } = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mapped = items.map((r: any) => mapSummary(r));

  // The list route doesn't yet accept these as query params — filter client-side for now,
  // same as the mock did. Fine at today's data volume; move server-side once it grows.
  if (filters.delivery) mapped = mapped.filter((r: RestaurantSummary) => r.attributes.delivery);
  if (filters.outdoorSeating) mapped = mapped.filter((r: RestaurantSummary) => r.attributes.outdoorSeating);
  if (filters.wifi) mapped = mapped.filter((r: RestaurantSummary) => r.attributes.wifi);
  if (filters.parking) mapped = mapped.filter((r: RestaurantSummary) => r.attributes.parking);
  if (filters.kidsArea) mapped = mapped.filter((r: RestaurantSummary) => r.attributes.kidsArea);
  if (filters.is24h) mapped = mapped.filter((r: RestaurantSummary) => r.attributes.is24h);
  if (filters.openNow) mapped = mapped.filter((r: RestaurantSummary) => isOpenNow(r.hours));
  if (filters.sort === "reviews") mapped = [...mapped].sort((a: RestaurantSummary, b: RestaurantSummary) => b.reviewCount - a.reviewCount);

  return mapped;
}

/** mirrors GET /api/v1/regions?locale= — all regions with their cities, for region/city pickers. */
export async function listRegions(locale: Locale = "uz"): Promise<Region[]> {
  const res = await fetch(apiUrl(`/api/v1/regions?locale=${locale}`), { cache: "no-store" });
  if (!res.ok) return [];
  const { items } = await res.json();
  return items;
}

// ─────────────────────────── live writes (require a signed-in session) ───────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubmission(s: any): PlaceSubmission {
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    ownerPhone: s.ownerPhone,
    lat: s.lat,
    lng: s.lng,
    note: s.note ?? undefined,
    status: s.status,
    submittedBy: s.user?.name ?? "—",
    createdAt: typeof s.createdAt === "string" ? s.createdAt : new Date(s.createdAt).toISOString(),
    rejectionReason: s.rejectionReason ?? undefined,
  };
}

async function errorFrom(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) return "error_sign_in_required";
  const body = await res.json().catch(() => null);
  return body?.error ?? fallback;
}

/** mirrors POST /api/v1/submissions */
export async function createSubmission(input: PlaceSubmissionInput): Promise<PlaceSubmission> {
  if (!input.name.trim()) throw new Error("error_name_required");
  if (!isValidOwnerPhone(input.ownerPhone)) throw new Error("error_phone_invalid");

  const res = await fetch(apiUrl("/api/v1/submissions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, ownerPhone: input.ownerPhone.replace(/[\s-]/g, "") }),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to submit"));
  const { submission } = await res.json();
  return mapSubmission(submission);
}

/** mirrors GET /api/v1/admin/queues/submissions — returns [] if not a signed-in moderator. */
export async function listSubmissionQueue(): Promise<PlaceSubmission[]> {
  const res = await fetch(apiUrl("/api/v1/admin/queues/submissions"), { cache: "no-store" });
  if (!res.ok) return [];
  const { items } = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((s: any) => mapSubmission(s));
}

/** mirrors POST /api/v1/admin/queues/submissions/:id */
export async function decideSubmission(
  id: string,
  action: "approve" | "reject" | "duplicate",
  reason?: string,
): Promise<PlaceSubmission> {
  const res = await fetch(apiUrl(`/api/v1/admin/queues/submissions/${id}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, reason }),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to update submission"));
  const data = await res.json();

  // Approve returns { restaurant }, not the updated submission row — build a minimal
  // stand-in from what we already know; callers refetch the queue afterwards anyway.
  if (data.restaurant) {
    return mapSubmission({
      id,
      status: "APPROVED",
      name: data.restaurant.slug,
      type: data.restaurant.type,
      ownerPhone: "",
      lat: data.restaurant.lat,
      lng: data.restaurant.lng,
      createdAt: new Date().toISOString(),
    });
  }
  return mapSubmission(data.submission);
}

/** mirrors POST /api/v1/reviews */
export async function createReview(restaurantId: string, input: CreateReviewInput): Promise<Review> {
  const res = await fetch(apiUrl("/api/v1/reviews"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restaurantId, ...input }),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to submit review"));
  const { review } = await res.json();

  return {
    id: review.id,
    restaurantId: review.restaurantId,
    userName: "Siz",
    ratingOverall: review.ratingOverall,
    ratingFood: review.ratingFood ?? undefined,
    ratingService: review.ratingService ?? undefined,
    ratingAtmosphere: review.ratingAtmosphere ?? undefined,
    ratingPrice: review.ratingPrice ?? undefined,
    text: review.text ?? undefined,
    createdAt: typeof review.createdAt === "string" ? review.createdAt : new Date(review.createdAt).toISOString(),
    isVerifiedVisit: review.isVerifiedVisit ?? false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: (review.media ?? []).map((m: any) => ({ url: m.url, type: m.type })),
    mine: true,
  };
}

/** mirrors GET /api/v1/admin/queues/reviews — returns [] if not a signed-in moderator. */
export async function listReviewQueue(): Promise<PendingReview[]> {
  const res = await fetch(apiUrl("/api/v1/admin/queues/reviews"), { cache: "no-store" });
  if (!res.ok) return [];
  const { items } = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((r: any) => ({
    id: r.id,
    restaurantSlug: r.restaurant?.slug ?? "",
    restaurantName: r.restaurant?.translations?.[0]?.name ?? "",
    userName: r.user?.name ?? "—",
    ratingOverall: r.ratingOverall,
    text: r.text ?? undefined,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: (r.media ?? []).map((m: any) => ({ url: m.url, type: m.type })),
  }));
}

/** mirrors POST /api/v1/admin/queues/reviews/:id */
export async function decideReview(id: string, action: "approve" | "reject"): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/admin/queues/reviews/${id}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to update review"));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdminRestaurant(r: any): AdminRestaurant {
  return {
    id: r.id,
    slug: r.slug,
    type: r.type,
    names: pickTranslated(r.translations, "name"),
    cityName: r.city?.translations?.[0]?.name ?? "",
    address: r.address,
    phone: r.phone ?? undefined,
    priceBucket: r.priceBucket,
    attributes: mapAttributes(r.attributes),
    hours: mapHours(r.hours),
  };
}

/** mirrors GET /api/v1/admin/restaurants?q= — returns [] if not a signed-in moderator. */
export async function searchAdminRestaurants(q: string): Promise<AdminRestaurant[]> {
  const res = await fetch(apiUrl(`/api/v1/admin/restaurants?q=${encodeURIComponent(q)}`), { cache: "no-store" });
  if (!res.ok) return [];
  const { items } = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((r: any) => mapAdminRestaurant(r));
}

/** mirrors PATCH /api/v1/admin/restaurants/:id */
export async function updateRestaurant(
  id: string,
  data: {
    names: TranslatedText;
    address: string;
    phone?: string;
    type: EstablishmentType;
    priceBucket: RestaurantSummary["priceBucket"];
    attributes: Pick<RestaurantAttributes, "halal" | "delivery" | "wifi" | "parking" | "outdoorSeating" | "kidsArea" | "is24h">;
    hours: WorkingHours[];
  },
): Promise<AdminRestaurant> {
  const res = await fetch(apiUrl(`/api/v1/admin/restaurants/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to update restaurant"));
  const { restaurant } = await res.json();
  return mapAdminRestaurant(restaurant);
}

/** mirrors DELETE /api/v1/admin/restaurants/:id */
export async function deleteRestaurant(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/admin/restaurants/${id}`), { method: "DELETE" });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to delete restaurant"));
}

/** mirrors POST /api/v1/restaurants/:slug/claim */
export async function claimRestaurant(
  slug: string,
  input: { evidenceType: ClaimEvidenceType; evidenceUrl?: string; note?: string },
): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/restaurants/${slug}/claim`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to submit claim"));
}

/** mirrors GET /api/v1/my/restaurants — restaurants the current user owns via an approved claim. */
export async function listMyRestaurants(): Promise<AdminRestaurant[]> {
  const res = await fetch(apiUrl("/api/v1/my/restaurants"), { cache: "no-store" });
  if (!res.ok) return [];
  const { items } = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((r: any) => mapAdminRestaurant(r));
}

/** mirrors GET /api/v1/admin/queues/claims — returns [] if not a signed-in moderator. */
export async function listClaimQueue(): Promise<PendingClaim[]> {
  const res = await fetch(apiUrl("/api/v1/admin/queues/claims"), { cache: "no-store" });
  if (!res.ok) return [];
  const { items } = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((c: any) => ({
    id: c.id,
    restaurantSlug: c.restaurant?.slug ?? "",
    restaurantName: c.restaurant?.translations?.[0]?.name ?? "",
    restaurantPhone: c.restaurant?.phone ?? undefined,
    userName: c.user?.name ?? "—",
    evidenceType: c.evidenceType,
    evidenceUrl: c.evidenceUrl ?? undefined,
    note: c.note ?? undefined,
    createdAt: typeof c.createdAt === "string" ? c.createdAt : new Date(c.createdAt).toISOString(),
  }));
}

/** mirrors POST /api/v1/admin/queues/claims/:id */
export async function decideClaim(id: string, action: "approve" | "reject"): Promise<void> {
  const res = await fetch(apiUrl(`/api/v1/admin/queues/claims/${id}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(await errorFrom(res, "Failed to update claim"));
}
