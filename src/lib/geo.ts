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
};

/** Markers inside a viewport bounding box — feeds the 3D map + supercluster. */
export async function markersInBBox(b: { west: number; south: number; east: number; north: number }, limit = 2000) {
  return db.$queryRaw<MapMarker[]>(Prisma.sql`
    SELECT id, slug, lat, lng,
           "ratingAvg" AS rating, "priceBucket"::text AS "priceBucket", type::text AS type
    FROM "Restaurant"
    WHERE status = 'APPROVED'
      AND location && ST_MakeEnvelope(${b.west}, ${b.south}, ${b.east}, ${b.north}, 4326)::geography
    LIMIT ${limit}
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
