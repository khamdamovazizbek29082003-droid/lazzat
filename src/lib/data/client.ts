/**
 * Data client. getMapData / getRestaurant / listNearby now hit the real database via the
 * live API routes. createSubmission / listSubmissionQueue / decideSubmission / createReview
 * are still backed by the in-memory mock store — those routes require a signed-in session,
 * and auth isn't wired into the UI yet (next phase). Once it is, the same swap applies to
 * them: replace the function body with a fetch() call, keep the signature identical.
 */
import {
  nextRestaurantId,
  nextReviewId,
  nextSubmissionId,
  restaurants as mockRestaurants,
  slugify,
  submissions,
} from "./mock-store";
import { isOpenNow, isValidOwnerPhone } from "./utils";
import { CATEGORY_EMOJI } from "./types";
import type {
  CreateReviewInput,
  EstablishmentType,
  Locale,
  MapData,
  MapMarker,
  NearbyFilters,
  PlaceSubmission,
  PlaceSubmissionInput,
  Review,
  RestaurantAttributes,
  RestaurantDetail,
  RestaurantSummary,
  TranslatedText,
  WorkingHours,
} from "./types";

const NETWORK_DELAY_MS = 120;
const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));

const CURRENT_USER = "Siz"; // "You" — stand-in until real auth is wired.

type BBox = { west: number; south: number; east: number; north: number };
const inBBox = (lat: number, lng: number, b: BBox) => lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;

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
  const out: TranslatedText = { uz: "", ru: "", en: "" };
  for (const t of translations ?? []) {
    if (t.locale === "uz" || t.locale === "ru" || t.locale === "en") out[t.locale] = (t[field] as string) ?? "";
  }
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

  // Community submissions still live in the mock store (no auth yet) — overlay any pending
  // ones here so "add a place" still shows a live pulsing pin on the map immediately.
  const pending: MapMarker[] = submissions
    .filter((s) => (s.status === "PENDING" || s.status === "IN_REVIEW") && inBBox(s.lat, s.lng, params))
    .map((s) => ({
      id: s.id,
      slug: s.id,
      lat: s.lat,
      lng: s.lng,
      rating: 0,
      priceBucket: "MODERATE",
      type: s.type,
      status: "PENDING",
      name: s.name,
      emoji: CATEGORY_EMOJI[s.type],
    }));

  return { type: "markers", items: [...items, ...pending] };
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

// ─────────────────────────── still-mocked writes (need auth first) ───────────────────────────

/** mirrors POST /api/v1/submissions */
export async function createSubmission(input: PlaceSubmissionInput): Promise<PlaceSubmission> {
  if (!input.name.trim()) throw new Error("error_name_required");
  if (!isValidOwnerPhone(input.ownerPhone)) throw new Error("error_phone_invalid");

  const submission: PlaceSubmission = {
    ...input,
    ownerPhone: input.ownerPhone.replace(/[\s-]/g, ""),
    id: nextSubmissionId(),
    status: "PENDING",
    submittedBy: CURRENT_USER,
    createdAt: new Date().toISOString(),
  };
  submissions.push(submission);
  return delay(submission);
}

/** mirrors GET /api/v1/admin/queues/submissions */
export async function listSubmissionQueue(): Promise<PlaceSubmission[]> {
  const items = submissions
    .filter((s) => s.status === "PENDING" || s.status === "IN_REVIEW")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return delay(items);
}

/** mirrors POST /api/v1/admin/queues/submissions/:id */
export async function decideSubmission(
  id: string,
  action: "approve" | "reject" | "duplicate",
  reason?: string,
): Promise<{ submission: PlaceSubmission; restaurant?: RestaurantDetail }> {
  const submission = submissions.find((s) => s.id === id);
  if (!submission) throw new Error("Submission not found");

  if (action !== "approve") {
    submission.status = action === "reject" ? "REJECTED" : "DUPLICATE";
    submission.rejectionReason = reason;
    return delay({ submission });
  }

  const slug = slugify(submission.name, submission.id.slice(-6));
  const restaurant: RestaurantDetail = {
    id: nextRestaurantId(),
    slug,
    type: submission.type,
    name: { uz: submission.name, ru: submission.name, en: submission.name },
    cityName: "Toshkent",
    lat: submission.lat,
    lng: submission.lng,
    priceBucket: "MODERATE",
    avgCheckUzs: 0,
    ratingAvg: 0,
    reviewCount: 0,
    gradient: ["#14418C", "#2563C4"],
    emoji: CATEGORY_EMOJI[submission.type],
    attributes: mapAttributes(null),
    hours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, opensAt: "09:00", closesAt: "22:00", isClosed: false })),
    description: { uz: submission.note ?? "", ru: submission.note ?? "", en: submission.note ?? "" },
    address: submission.note ?? "",
    phone: submission.ownerPhone,
    categories: [],
    reviews: [],
  };
  // Note: this pushes into the mock store, not the real database — approving here won't
  // make the place show up via the real listNearby()/getMapData() calls above until the
  // admin queue is wired to the real API too (next phase, needs auth).
  mockRestaurants.push(restaurant);
  submission.status = "APPROVED";
  submission.createdRestaurantSlug = slug;

  return delay({ submission, restaurant });
}

/** mirrors POST /api/v1/reviews */
export async function createReview(restaurantSlug: string, input: CreateReviewInput): Promise<Review> {
  // The restaurant now almost certainly came from the real API, not the mock store, so
  // there's usually nothing to mutate here — just echo back a review object the caller
  // can append to its own local state. Once auth lands this becomes a real POST.
  const restaurant = mockRestaurants.find((r) => r.slug === restaurantSlug);

  const review: Review = {
    id: nextReviewId(),
    restaurantId: restaurant?.id ?? restaurantSlug,
    userName: CURRENT_USER,
    ratingOverall: input.ratingOverall,
    ratingFood: input.ratingFood,
    ratingService: input.ratingService,
    ratingAtmosphere: input.ratingAtmosphere,
    ratingPrice: input.ratingPrice,
    text: input.text,
    createdAt: new Date().toISOString(),
    mine: true,
  };

  if (restaurant) {
    restaurant.reviews = [review, ...restaurant.reviews];
    restaurant.reviewCount = restaurant.reviews.length;
    restaurant.ratingAvg =
      Math.round((restaurant.reviews.reduce((sum, r) => sum + r.ratingOverall, 0) / restaurant.reviews.length) * 10) / 10;
  }

  return delay(review);
}
