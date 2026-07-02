/**
 * Mock data client. Every export here mirrors a real route already implemented
 * in src/app/api/v1/** — same request shape, same response shape, same validation
 * rules (e.g. the +998 owner-phone regex). When the real backend is wired up, only
 * the *bodies* of these functions change to `fetch(...)` calls; no UI code should
 * need to change.
 */
import {
  nextRestaurantId,
  nextReviewId,
  nextSubmissionId,
  restaurants,
  slugify,
  submissions,
} from "./mock-store";
import { isOpenNow, isValidOwnerPhone } from "./utils";
import { CATEGORY_EMOJI } from "./types";
import type {
  CreateReviewInput,
  MapCluster,
  MapData,
  MapMarker,
  NearbyFilters,
  PlaceSubmission,
  PlaceSubmissionInput,
  Review,
  RestaurantDetail,
  RestaurantSummary,
} from "./types";

const NETWORK_DELAY_MS = 120;
const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));

const CURRENT_USER = "Siz"; // "You" — stand-in until real auth is wired.

type BBox = { west: number; south: number; east: number; north: number };
const inBBox = (lat: number, lng: number, b: BBox) => lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;

/** mirrors GET /api/v1/map?west=&south=&east=&north=&zoom= */
export async function getMapData(params: BBox & { zoom: number }): Promise<MapData> {
  const CLUSTER_ZOOM_THRESHOLD = 8;

  if (params.zoom < CLUSTER_ZOOM_THRESHOLD) {
    const byCity = new Map<string, { lat: number; lng: number; count: number }>();
    for (const r of restaurants) {
      if (!inBBox(r.lat, r.lng, params)) continue;
      const entry = byCity.get(r.cityName) ?? { lat: 0, lng: 0, count: 0 };
      entry.lat += r.lat;
      entry.lng += r.lng;
      entry.count += 1;
      byCity.set(r.cityName, entry);
    }
    const items: MapCluster[] = [...byCity.entries()].map(([cityName, e]) => ({
      id: `cluster-${cityName}`,
      lat: e.lat / e.count,
      lng: e.lng / e.count,
      count: e.count,
      label: cityName,
    }));
    return delay({ type: "clusters", items });
  }

  const items: MapMarker[] = [
    ...restaurants
      .filter((r) => inBBox(r.lat, r.lng, params))
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        lat: r.lat,
        lng: r.lng,
        rating: r.ratingAvg,
        priceBucket: r.priceBucket,
        type: r.type,
        status: "APPROVED" as const,
        name: r.name.uz,
        emoji: r.emoji,
      })),
    ...submissions
      .filter((s) => (s.status === "PENDING" || s.status === "IN_REVIEW") && inBBox(s.lat, s.lng, params))
      .map((s) => ({
        id: s.id,
        slug: s.id,
        lat: s.lat,
        lng: s.lng,
        rating: 0,
        priceBucket: "MODERATE" as const,
        type: s.type,
        status: "PENDING" as const,
        name: s.name,
        emoji: CATEGORY_EMOJI[s.type],
      })),
  ];
  return delay({ type: "markers", items });
}

/** mirrors GET /api/v1/restaurants/:slug (not yet built server-side) */
export async function getRestaurant(slug: string): Promise<RestaurantDetail | null> {
  const found = restaurants.find((r) => r.slug === slug) ?? null;
  // Clone: callers hold this in React state, and createReview() below also mutates the
  // stored restaurant in place — without cloning, a caller's own state update (e.g.
  // prepending the new review) would double up against the mutation it just triggered.
  return delay(found ? structuredClone(found) : null);
}

/** mirrors GET /api/v1/restaurants */
export async function listNearby(filters: NearbyFilters = {}): Promise<RestaurantSummary[]> {
  const q = filters.q?.trim().toLowerCase();
  let items = restaurants.filter((r) => {
    if (filters.city && r.cityName.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.priceBucket && r.priceBucket !== filters.priceBucket) return false;
    if (filters.halal && !r.attributes.halal) return false;
    if (filters.delivery && !r.attributes.delivery) return false;
    if (filters.outdoorSeating && !r.attributes.outdoorSeating) return false;
    if (filters.wifi && !r.attributes.wifi) return false;
    if (filters.parking && !r.attributes.parking) return false;
    if (filters.kidsArea && !r.attributes.kidsArea) return false;
    if (filters.is24h && !r.attributes.is24h) return false;
    if (filters.openNow && !isOpenNow(r.hours)) return false;
    if (q) {
      const haystack = `${r.name.uz} ${r.name.ru} ${r.name.en} ${r.cityName} ${r.districtName ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (filters.sort === "reviews") items = [...items].sort((a, b) => b.reviewCount - a.reviewCount);
  else items = [...items].sort((a, b) => b.ratingAvg - a.ratingAvg);

  return delay(items.map((r) => structuredClone(r)));
}

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
    attributes: {
      delivery: false,
      takeaway: false,
      dineIn: true,
      parking: false,
      wifi: false,
      outdoorSeating: false,
      kidsArea: false,
      halal: false,
      vegetarian: false,
      vegan: false,
      is24h: false,
    },
    hours: Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, opensAt: "09:00", closesAt: "22:00", isClosed: false })),
    description: { uz: submission.note ?? "", ru: submission.note ?? "", en: submission.note ?? "" },
    address: submission.note ?? "",
    phone: submission.ownerPhone,
    categories: [],
    reviews: [],
  };
  restaurants.push(restaurant);
  submission.status = "APPROVED";
  submission.createdRestaurantSlug = slug;

  return delay({ submission, restaurant });
}

/** mirrors POST /api/v1/reviews */
export async function createReview(restaurantSlug: string, input: CreateReviewInput): Promise<Review> {
  const restaurant = restaurants.find((r) => r.slug === restaurantSlug);
  if (!restaurant) throw new Error("Restaurant not found");

  const review: Review = {
    id: nextReviewId(),
    restaurantId: restaurant.id,
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
  restaurant.reviews = [review, ...restaurant.reviews];
  restaurant.reviewCount = restaurant.reviews.length;
  restaurant.ratingAvg =
    Math.round((restaurant.reviews.reduce((sum, r) => sum + r.ratingOverall, 0) / restaurant.reviews.length) * 10) / 10;

  return delay(review);
}
