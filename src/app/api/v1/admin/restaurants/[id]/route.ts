import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";
import { buildSearchText } from "@/lib/search/translit";

const Body = z.object({
  names: z.object({ uz: z.string().min(1), ru: z.string().min(1), en: z.string().min(1) }),
  address: z.string().min(1),
  phone: z.string().optional(),
  type: z.enum([
    "RESTAURANT", "CAFE", "FAST_FOOD", "BAKERY", "COFFEE_SHOP", "TEA_HOUSE",
    "STREET_FOOD", "CANTEEN", "DESSERT_SHOP", "BAR", "OTHER",
  ]),
  priceBucket: z.enum(["BUDGET", "MODERATE", "UPSCALE", "PREMIUM"]),
  attributes: z.object({
    halal: z.boolean(),
    delivery: z.boolean(),
    wifi: z.boolean(),
    parking: z.boolean(),
    outdoorSeating: z.boolean(),
    kidsArea: z.boolean(),
    is24h: z.boolean(),
  }),
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        opensAt: z.string().nullable(),
        closesAt: z.string().nullable(),
        isClosed: z.boolean(),
      }),
    )
    .length(7),
});

/** PATCH /api/v1/admin/restaurants/:id — edit a restaurant's core listing info. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "MODERATOR")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }
  const { id } = await params;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { names, address, phone, type, priceBucket, attributes, hours } = parsed.data;

  const restaurant = await db.$transaction(async (tx) => {
    await Promise.all(
      (["uz", "ru", "en"] as const).map((locale) =>
        tx.restaurantTranslation.upsert({
          where: { restaurantId_locale: { restaurantId: id, locale } },
          update: { name: names[locale] },
          create: { restaurantId: id, locale, name: names[locale] },
        }),
      ),
    );
    await tx.restaurantAttributes.upsert({
      where: { restaurantId: id },
      update: attributes,
      create: { restaurantId: id, ...attributes },
    });
    await tx.workingHours.deleteMany({ where: { restaurantId: id } });
    await tx.workingHours.createMany({ data: hours.map((h) => ({ ...h, restaurantId: id })) });
    return tx.restaurant.update({
      where: { id },
      data: { address, phone: phone || null, type, priceBucket, searchText: buildSearchText(Object.values(names)) },
      include: {
        translations: true,
        city: { include: { translations: { where: { locale: "uz" } } } },
        attributes: true,
        hours: { orderBy: { dayOfWeek: "asc" } },
      },
    });
  });

  return NextResponse.json({ restaurant });
}

/** DELETE /api/v1/admin/restaurants/:id — permanently removes the listing and all related data. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }
  const { id } = await params;

  await db.restaurant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
