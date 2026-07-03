import { db } from "./db";
import { Prisma } from "@prisma/client";

export type MapMarker = {
  id: string;
  slug: string;
  lat: number;
  lng: number;
  rating: number;
  priceBucket: string;
  type: string;
  name: string;
};

/** Markers inside a viewport bounding box — feeds the 3D map at street-level zoom. */
export async function markersInBBox(
  b: { west: number; south: number; east: number; north: number },
  locale: "uz" | "ru" | "en" = "uz",
  limit = 2000,
) {
  return db.$queryRaw<MapMarker[]>(Prisma.sql`
    SELECT r.id, r.slug, r.lat, r.lng,
           r."ratingAvg" AS rating, r."priceBucket"::text AS "priceBucket", r.type::text AS type,
           rt.name AS name
    FROM "Restaurant" r
    JOIN "RestaurantTranslation" rt ON rt."restaurantId" = r.id AND rt.locale = ${locale}::"Locale"
    WHERE r.status = 'APPROVED'
      AND r.location && ST_MakeEnvelope(${b.west}, ${b.south}, ${b.east}, ${b.north}, 4326)::geography
    LIMIT ${limit}
  `);
}

export type MapClusterRow = { id: string; lat: number; lng: number; count: number; label: string };

/** City-grouped counts for the zoomed-out (country/region) map view. */
export async function clustersByCity(
  b: { west: number; south: number; east: number; north: number },
  locale: "uz" | "ru" | "en" = "uz",
) {
  return db.$queryRaw<MapClusterRow[]>(Prisma.sql`
    SELECT c.id AS id, AVG(r.lat)::float AS lat, AVG(r.lng)::float AS lng,
           COUNT(*)::int AS count, ct.name AS label
    FROM "Restaurant" r
    JOIN "City" c ON c.id = r."cityId"
    JOIN "CityTranslation" ct ON ct."cityId" = c.id AND ct.locale = ${locale}::"Locale"
    WHERE r.status = 'APPROVED'
      AND r.location && ST_MakeEnvelope(${b.west}, ${b.south}, ${b.east}, ${b.north}, 4326)::geography
    GROUP BY c.id, ct.name
  `);
}

/** Nearest approved restaurants within radiusMeters, ordered by distance. */
export async function nearby(lat: number, lng: number, radiusMeters = 3000, limit = 50) {
  return db.$queryRaw<(MapMarker & { distance: number })[]>(Prisma.sql`
    SELECT id, slug, lat, lng, "ratingAvg" AS rating,
           "priceBucket"::text AS "priceBucket", type::text AS type,
           ST_Distance(location, ST_MakePoint(${lng}, ${lat})::geography) AS distance
    FROM "Restaurant"
    WHERE status = 'APPROVED'
      AND ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})
    ORDER BY distance
    LIMIT ${limit}
  `);
}

/** Duplicate check for community submissions: anything within 60 m with a similar name. */
export async function findLikelyDuplicates(lat: number, lng: number, name: string) {
  return db.$queryRaw<{ id: string; slug: string; similarity: number }[]>(Prisma.sql`
    SELECT r.id, r.slug, similarity(rt.name, ${name}) AS similarity
    FROM "Restaurant" r
    JOIN "RestaurantTranslation" rt ON rt."restaurantId" = r.id
    WHERE ST_DWithin(r.location, ST_MakePoint(${lng}, ${lat})::geography, 60)
      AND similarity(rt.name, ${name}) > 0.35
    ORDER BY similarity DESC
    LIMIT 5
  `);
}

/** Keep the PostGIS point in sync whenever lat/lng change. */
export async function syncLocation(restaurantId: string, lat: number, lng: number) {
  await db.$executeRaw(Prisma.sql`
    UPDATE "Restaurant"
    SET location = ST_MakePoint(${lng}, ${lat})::geography
    WHERE id = ${restaurantId}
  `);
}
