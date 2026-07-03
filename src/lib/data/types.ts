/**
 * Shapes mirror the Prisma models / Zod schemas already in the repo
 * (prisma/schema.prisma, src/app/api/v1/**) so the mock client in ./client.ts
 * can later be rewired to real `fetch` calls without touching any UI.
 */

export type Locale = "uz" | "ru" | "en";

export type EstablishmentType =
  | "RESTAURANT"
  | "CAFE"
  | "FAST_FOOD"
  | "BAKERY"
  | "COFFEE_SHOP"
  | "TEA_HOUSE"
  | "STREET_FOOD"
  | "CANTEEN"
  | "DESSERT_SHOP"
  | "BAR"
  | "OTHER";

export type PriceBucket = "BUDGET" | "MODERATE" | "UPSCALE" | "PREMIUM";

export type SubmissionStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "DUPLICATE";

export type TranslatedText = Record<Locale, string>;

export interface MenuItem {
  id: string;
  name: TranslatedText;
  priceUzs: number;
  weightGrams?: number;
  isPopular?: boolean;
  isSeasonal?: boolean;
  emoji: string;
}

export interface MenuCategory {
  id: string;
  name: TranslatedText;
  items: MenuItem[];
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Monday ... 6 = Sunday
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  ratingOverall: number;
  ratingFood?: number;
  ratingService?: number;
  ratingAtmosphere?: number;
  ratingPrice?: number;
  text?: string;
  createdAt: string;
  isVerifiedVisit?: boolean;
  mine?: boolean;
  media?: { url: string; type: "PHOTO" | "VIDEO" }[];
}

export interface RestaurantAttributes {
  delivery: boolean;
  takeaway: boolean;
  dineIn: boolean;
  parking: boolean;
  wifi: boolean;
  outdoorSeating: boolean;
  kidsArea: boolean;
  halal: boolean;
  vegetarian: boolean;
  vegan: boolean;
  is24h: boolean;
}

export interface RestaurantSummary {
  id: string;
  slug: string;
  type: EstablishmentType;
  name: TranslatedText;
  cityName: string;
  districtName?: string;
  lat: number;
  lng: number;
  priceBucket: PriceBucket;
  avgCheckUzs: number;
  ratingAvg: number;
  reviewCount: number;
  gradient: [string, string];
  emoji: string;
  attributes: RestaurantAttributes;
  hours: WorkingHours[];
}

export interface RestaurantDetail extends RestaurantSummary {
  description: TranslatedText;
  address: string;
  phone?: string;
  telegram?: string;
  categories: MenuCategory[];
  reviews: Review[];
}

export interface MapMarker {
  id: string;
  slug: string;
  lat: number;
  lng: number;
  rating: number;
  priceBucket: PriceBucket;
  type: EstablishmentType;
  status: "APPROVED" | "PENDING";
  name: string;
  emoji: string;
}

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  label: string;
}

export type MapData = { type: "clusters"; items: MapCluster[] } | { type: "markers"; items: MapMarker[] };

export interface PlaceSubmissionInput {
  name: string;
  type: EstablishmentType;
  ownerPhone: string;
  lat: number;
  lng: number;
  note?: string;
  photoUrls?: string[];
  videoUrls?: string[];
}

export interface PlaceSubmission extends PlaceSubmissionInput {
  id: string;
  status: SubmissionStatus;
  submittedBy: string;
  createdAt: string;
  rejectionReason?: string;
  createdRestaurantSlug?: string;
}

export interface NearbyFilters {
  q?: string;
  city?: string;
  halal?: boolean;
  openNow?: boolean;
  is24h?: boolean;
  delivery?: boolean;
  outdoorSeating?: boolean;
  wifi?: boolean;
  parking?: boolean;
  kidsArea?: boolean;
  priceBucket?: PriceBucket;
  sort?: "rating" | "reviews" | "newest";
}

export interface CreateReviewInput {
  ratingOverall: number;
  ratingFood?: number;
  ratingService?: number;
  ratingAtmosphere?: number;
  ratingPrice?: number;
  text?: string;
  photoUrls?: string[];
  videoUrls?: string[];
}

export interface AdminRestaurant {
  id: string;
  slug: string;
  type: EstablishmentType;
  names: TranslatedText;
  cityName: string;
  address: string;
  phone?: string;
  priceBucket: PriceBucket;
  attributes: RestaurantAttributes;
  hours: WorkingHours[];
}

export interface PendingReview {
  id: string;
  restaurantSlug: string;
  restaurantName: string;
  userName: string;
  ratingOverall: number;
  text?: string;
  createdAt: string;
  media: { url: string; type: "PHOTO" | "VIDEO" }[];
}

export const CATEGORY_EMOJI: Record<EstablishmentType, string> = {
  RESTAURANT: "🍽️",
  CAFE: "☕",
  FAST_FOOD: "🍔",
  BAKERY: "🥖",
  COFFEE_SHOP: "☕",
  TEA_HOUSE: "🫖",
  STREET_FOOD: "🌯",
  CANTEEN: "🍛",
  DESSERT_SHOP: "🍰",
  BAR: "🍸",
  OTHER: "🍴",
};
