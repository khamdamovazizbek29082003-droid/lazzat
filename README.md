# Lazzat — Phase 0 starter

Nationwide food discovery platform for Uzbekistan. This starter contains the
data model, taxonomy seeds, auth (Google + Telegram Login Widget with HMAC
verification), the PostGIS geo layer, UZ Cyrillic/Latin search normalization,
and the first API routes — including the 3D map data endpoint and the full
community-submission → admin-verification pipeline.

## Stack
Next.js 15 (App Router) · TypeScript · Prisma · PostgreSQL + PostGIS + pg_trgm ·
Auth.js v5 · MapLibre GL JS + Supercluster · Tailwind v4 · Zod

## Setup
```bash
cp .env.example .env        # fill in DATABASE_URL, AUTH_SECRET, providers
npm install
npx prisma migrate dev      # creates schema; see "Raw SQL" below
npm run db:seed             # 14 regions, cities, Tashkent districts, cuisines
npm run dev
```

### Raw SQL to add after the first migration
Prisma can't express these; append to the generated migration or run once:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX restaurant_location_gix ON "Restaurant" USING GIST (location);
CREATE INDEX restaurant_searchtext_trgm ON "Restaurant" USING GIN ("searchText" gin_trgm_ops);
CREATE INDEX menuitem_name_trgm ON "MenuItemTranslation" USING GIN (name gin_trgm_ops);
```

## The 3D map (production design)
- **Renderer:** MapLibre GL JS with `pitch: 55, bearing: -15` and
  `fill-extrusion` building layers → a true 3D, buttery WebGL map with no
  Google licensing cost. (Optionally swap the basemap for Google
  Photorealistic 3D Tiles later — the marker layer is renderer-agnostic.)
- **Data:** `GET /api/v1/map?west=&south=&east=&north=&zoom=`.
  Below zoom 13 the server returns Supercluster clusters — zoomed out to the
  country you see one bubble per region ("Tashkent · 1 240"); clicking a
  bubble flies the camera in and the bubbles split until street-level pins
  appear. At zoom ≥ 13 it returns raw markers.
- **Perf:** bbox query hits the PostGIS GiST index; responses are CDN-cached
  60–120 s; the client re-fetches on `moveend` debounced 250 ms.

## Community submissions → admin verification
1. `POST /api/v1/submissions` — signed-in user drops a pin, sends
   `{name, type, ownerPhone (+998XXXXXXXXX), lat, lng, note?, photoUrl?}`.
   Server rate-limits (5/day), runs a PostGIS + trigram duplicate check
   (anything within 60 m with a similar name), and queues it PENDING.
2. `GET /api/v1/admin/queues/submissions` — moderator queue, oldest first.
3. Moderator **calls the owner's phone** to verify the place and get consent.
4. `POST /api/v1/admin/queues/submissions/:id` with `{action: "approve"}` —
   transactionally creates the Restaurant (trilingual name rows, attributes,
   PostGIS point, searchText), links it to the submission, audit-logs it.
   `reject` / `duplicate` close the item with a reason.
5. Follow-ups (TODO hooks in code): notify the submitter, invite the owner
   to claim the listing via the OwnerClaim flow.

## Layout
```
prisma/schema.prisma        full data model (+ PlaceSubmission)
prisma/seed.ts              taxonomy seed
src/lib/db.ts               Prisma singleton
src/lib/auth.ts             Auth.js: Google + Telegram HMAC verification
src/lib/policies.ts         role & per-restaurant owner authorization
src/lib/geo.ts              PostGIS: bbox markers, nearby, duplicate check
src/lib/search/translit.ts  UZ Cyrillic↔Latin + apostrophe normalization
src/app/api/v1/...          map, restaurants, reviews, submissions, admin queue
```

## Next milestones (from the architecture doc)
M1 admin panel UI + menu editor → M2 consumer pages + search + SEO →
M3 reviews UX + owner dashboard → launch.
