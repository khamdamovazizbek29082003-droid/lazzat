/**
 * Seed: taxonomy only (regions, key cities, districts, cuisines, allergens).
 * Restaurants enter through the admin panel or community submissions — never seeded.
 */
import { PrismaClient, Locale } from "@prisma/client";
const db = new PrismaClient();

const REGIONS: [string, string, string, string, string][] = [
  ["TAS", "Toshkent shahri", "Ташкент", "Tashkent City", "Ташкент қаласы"],
  ["TOS", "Toshkent viloyati", "Ташкентская область", "Tashkent Region", "Ташкент ўалаяты"],
  ["SAM", "Samarqand", "Самарканд", "Samarkand", "Самарқанд"],
  ["BUX", "Buxoro", "Бухара", "Bukhara", "Бухара"],
  ["FAR", "Farg'ona", "Фергана", "Fergana", "Фарғана"],
  ["AND", "Andijon", "Андижан", "Andijan", "Андижан"],
  ["NAM", "Namangan", "Наманган", "Namangan", "Наманган"],
  ["XOR", "Xorazm", "Хорезм", "Khorezm", "Хорезм"],
  ["QAS", "Qashqadaryo", "Кашкадарья", "Kashkadarya", "Қашқадәрья"],
  ["SUR", "Surxondaryo", "Сурхандарья", "Surkhandarya", "Сурхандәрья"],
  ["JIZ", "Jizzax", "Джизак", "Jizzakh", "Жиззах"],
  ["SIR", "Sirdaryo", "Сырдарья", "Syrdarya", "Сырдәрья"],
  ["NAV", "Navoiy", "Навои", "Navoi", "Навои"],
  ["QOR", "Qoraqalpog'iston", "Каракалпакстан", "Karakalpakstan", "Қарақалпақстан"],
];

const CITIES: [string, string, number, number, string, string, string, string][] = [
  ["TAS", "tashkent", 41.3111, 69.2797, "Toshkent", "Ташкент", "Tashkent", "Ташкент"],
  ["TOS", "nurafshon", 41.0167, 69.3417, "Nurafshon", "Нурафшан", "Nurafshon", "Нурафшан"],
  ["SAM", "samarkand", 39.6542, 66.9597, "Samarqand", "Самарканд", "Samarkand", "Самарқанд"],
  ["BUX", "bukhara", 39.7747, 64.4286, "Buxoro", "Бухара", "Bukhara", "Бухара"],
  ["FAR", "fergana", 40.3894, 71.7876, "Farg'ona", "Фергана", "Fergana", "Фарғана"],
  ["AND", "andijan", 40.7821, 72.3442, "Andijon", "Андижан", "Andijan", "Андижан"],
  ["NAM", "namangan", 40.9983, 71.6726, "Namangan", "Наманган", "Namangan", "Наманган"],
  ["XOR", "khiva", 41.3783, 60.3639, "Xiva", "Хива", "Khiva", "Хийўа"],
  ["QAS", "qarshi", 38.8606, 65.7891, "Qarshi", "Карши", "Qarshi", "Қарши"],
  ["SUR", "termez", 37.2242, 67.2783, "Termiz", "Термез", "Termez", "Термиз"],
  ["JIZ", "jizzakh", 40.1158, 67.8422, "Jizzax", "Джизак", "Jizzakh", "Жиззах"],
  ["SIR", "guliston", 40.4897, 68.7842, "Guliston", "Гулистан", "Guliston", "Гулистан"],
  ["NAV", "navoiy", 40.0844, 65.3792, "Navoiy", "Навои", "Navoi", "Навои"],
  ["QOR", "nukus", 42.46, 59.6166, "Nukus", "Нукус", "Nukus", "Нөкис"],
];

const TASHKENT_DISTRICTS: [string, string, string, string, string][] = [
  ["yunusobod", "Yunusobod", "Юнусабад", "Yunusobod", "Юнусабад"],
  ["chilonzor", "Chilonzor", "Чиланзар", "Chilonzor", "Чиланзар"],
  ["mirobod", "Mirobod", "Мирабад", "Mirobod", "Мирабад"],
  ["yakkasaroy", "Yakkasaroy", "Яккасарай", "Yakkasaroy", "Яккасарай"],
  ["olmazor", "Olmazor", "Алмазар", "Olmazor", "Алмазар"],
  ["sergeli", "Sergeli", "Сергели", "Sergeli", "Сергели"],
  ["shayxontohur", "Shayxontohur", "Шайхантаур", "Shaykhontohur", "Шайхантаур"],
  ["mirzo-ulugbek", "Mirzo Ulug'bek", "Мирзо-Улугбек", "Mirzo Ulugbek", "Мирзо-Улугбек"],
  ["uchtepa", "Uchtepa", "Учтепа", "Uchtepa", "Уштепа"],
  ["bektemir", "Bektemir", "Бектемир", "Bektemir", "Бектемир"],
  ["yashnobod", "Yashnobod", "Яшнабад", "Yashnobod", "Яшнабад"],
  ["yangihayot", "Yangihayot", "Янгихаёт", "Yangihayot", "Янгихаят"],
];

const CUISINES: [string, string, string, string, string][] = [
  ["uzbek", "Milliy taomlar", "Национальная кухня", "Uzbek", "Милли ас"],
  ["uyghur", "Uyg'ur", "Уйгурская", "Uyghur", "Уйғыр"],
  ["turkish", "Turk", "Турецкая", "Turkish", "Түрк"],
  ["korean", "Koreys", "Корейская", "Korean", "Корей"],
  ["italian", "Italyan", "Итальянская", "Italian", "Итальян"],
  ["japanese", "Yapon", "Японская", "Japanese", "Япон"],
  ["georgian", "Gruzin", "Грузинская", "Georgian", "Грузин"],
  ["fastfood", "Fast food", "Фастфуд", "Fast food", "Тез аш"],
  ["coffee", "Kofe", "Кофе", "Coffee", "Кофе"],
  ["desserts", "Shirinliklar", "Десерты", "Desserts", "Тәтликлер"],
];

const ALLERGENS: [string, string, string, string, string][] = [
  ["gluten", "Kleykovina", "Глютен", "Gluten", "Глютен"],
  ["dairy", "Sut mahsulotlari", "Молочные продукты", "Dairy", "Сүт өнимлери"],
  ["nuts", "Yong'oqlar", "Орехи", "Nuts", "Жаңғақлар"],
  ["eggs", "Tuxum", "Яйца", "Eggs", "Жумыртқа"],
  ["sesame", "Kunjut", "Кунжут", "Sesame", "Күнжит"],
];

const tr = (uz: string, ru: string, en: string, kaa: string) => [
  { locale: Locale.uz, name: uz },
  { locale: Locale.ru, name: ru },
  { locale: Locale.en, name: en },
  { locale: Locale.kaa, name: kaa },
];

/** Upserts each locale row individually so re-running the seed backfills any locale
 * added later (e.g. "kaa") onto rows that already existed from a prior run. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertTranslations(model: any, idField: string, idValue: string, rows: { locale: Locale; name: string }[]) {
  for (const row of rows) {
    await model.upsert({
      where: { [`${idField}_locale`]: { [idField]: idValue, locale: row.locale } },
      update: { name: row.name },
      create: { [idField]: idValue, locale: row.locale, name: row.name },
    });
  }
}

async function main() {
  for (const [code, uz, ru, en, kaa] of REGIONS) {
    const region = await db.region.upsert({ where: { code }, update: {}, create: { code } });
    await upsertTranslations(db.regionTranslation, "regionId", region.id, tr(uz, ru, en, kaa));
  }
  for (const [regionCode, slug, lat, lng, uz, ru, en, kaa] of CITIES) {
    const region = await db.region.findUniqueOrThrow({ where: { code: regionCode } });
    const city = await db.city.upsert({ where: { slug }, update: {}, create: { slug, lat, lng, regionId: region.id } });
    await upsertTranslations(db.cityTranslation, "cityId", city.id, tr(uz, ru, en, kaa));
  }
  const tashkent = await db.city.findUniqueOrThrow({ where: { slug: "tashkent" } });
  for (const [slug, uz, ru, en, kaa] of TASHKENT_DISTRICTS) {
    const district = await db.district.upsert({
      where: { cityId_slug: { cityId: tashkent.id, slug } },
      update: {},
      create: { cityId: tashkent.id, slug },
    });
    await upsertTranslations(db.districtTranslation, "districtId", district.id, tr(uz, ru, en, kaa));
  }
  for (const [slug, uz, ru, en, kaa] of CUISINES) {
    const cuisine = await db.cuisine.upsert({ where: { slug }, update: {}, create: { slug } });
    await upsertTranslations(db.cuisineTranslation, "cuisineId", cuisine.id, tr(uz, ru, en, kaa));
  }
  for (const [slug, uz, ru, en, kaa] of ALLERGENS) {
    const allergen = await db.allergen.upsert({ where: { slug }, update: {}, create: { slug } });
    await upsertTranslations(db.allergenTranslation, "allergenId", allergen.id, tr(uz, ru, en, kaa));
  }
  console.log(`Seeded taxonomy: ${REGIONS.length} regions, ${CITIES.length} cities, 12 Tashkent districts, cuisines, allergens (uz/ru/en/kaa).`);
}

main().finally(() => db.$disconnect());
