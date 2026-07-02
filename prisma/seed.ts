/**
 * Seed: taxonomy only (regions, key cities, districts, cuisines, allergens).
 * Restaurants enter through the admin panel or community submissions — never seeded.
 */
import { PrismaClient, Locale } from "@prisma/client";
const db = new PrismaClient();

const REGIONS: [string, string, string, string][] = [
  ["TAS", "Toshkent shahri", "Ташкент", "Tashkent City"],
  ["TOS", "Toshkent viloyati", "Ташкентская область", "Tashkent Region"],
  ["SAM", "Samarqand", "Самарканд", "Samarkand"],
  ["BUX", "Buxoro", "Бухара", "Bukhara"],
  ["FAR", "Farg'ona", "Фергана", "Fergana"],
  ["AND", "Andijon", "Андижан", "Andijan"],
  ["NAM", "Namangan", "Наманган", "Namangan"],
  ["XOR", "Xorazm", "Хорезм", "Khorezm"],
  ["QAS", "Qashqadaryo", "Кашкадарья", "Kashkadarya"],
  ["SUR", "Surxondaryo", "Сурхандарья", "Surkhandarya"],
  ["JIZ", "Jizzax", "Джизак", "Jizzakh"],
  ["SIR", "Sirdaryo", "Сырдарья", "Syrdarya"],
  ["NAV", "Navoiy", "Навои", "Navoi"],
  ["QOR", "Qoraqalpog'iston", "Каракалпакстан", "Karakalpakstan"],
];

const CITIES: [string, string, number, number, string, string, string][] = [
  ["TAS", "tashkent", 41.3111, 69.2797, "Toshkent", "Ташкент", "Tashkent"],
  ["SAM", "samarkand", 39.6542, 66.9597, "Samarqand", "Самарканд", "Samarkand"],
  ["BUX", "bukhara", 39.7747, 64.4286, "Buxoro", "Бухара", "Bukhara"],
  ["FAR", "fergana", 40.3894, 71.7876, "Farg'ona", "Фергана", "Fergana"],
  ["XOR", "khiva", 41.3783, 60.3639, "Xiva", "Хива", "Khiva"],
  ["QOR", "nukus", 42.46, 59.6166, "Nukus", "Нукус", "Nukus"],
];

const TASHKENT_DISTRICTS: [string, string, string, string][] = [
  ["yunusobod", "Yunusobod", "Юнусабад", "Yunusobod"],
  ["chilonzor", "Chilonzor", "Чиланзар", "Chilonzor"],
  ["mirobod", "Mirobod", "Мирабад", "Mirobod"],
  ["yakkasaroy", "Yakkasaroy", "Яккасарай", "Yakkasaroy"],
  ["olmazor", "Olmazor", "Алмазар", "Olmazor"],
  ["sergeli", "Sergeli", "Сергели", "Sergeli"],
  ["shayxontohur", "Shayxontohur", "Шайхантаур", "Shaykhontohur"],
  ["mirzo-ulugbek", "Mirzo Ulug'bek", "Мирзо-Улугбек", "Mirzo Ulugbek"],
  ["uchtepa", "Uchtepa", "Учтепа", "Uchtepa"],
  ["bektemir", "Bektemir", "Бектемир", "Bektemir"],
  ["yashnobod", "Yashnobod", "Яшнабад", "Yashnobod"],
  ["yangihayot", "Yangihayot", "Янгихаёт", "Yangihayot"],
];

const CUISINES: [string, string, string, string][] = [
  ["uzbek", "Milliy taomlar", "Национальная кухня", "Uzbek"],
  ["uyghur", "Uyg'ur", "Уйгурская", "Uyghur"],
  ["turkish", "Turk", "Турецкая", "Turkish"],
  ["korean", "Koreys", "Корейская", "Korean"],
  ["italian", "Italyan", "Итальянская", "Italian"],
  ["japanese", "Yapon", "Японская", "Japanese"],
  ["georgian", "Gruzin", "Грузинская", "Georgian"],
  ["fastfood", "Fast food", "Фастфуд", "Fast food"],
  ["coffee", "Kofe", "Кофе", "Coffee"],
  ["desserts", "Shirinliklar", "Десерты", "Desserts"],
];

const ALLERGENS: [string, string, string, string][] = [
  ["gluten", "Kleykovina", "Глютен", "Gluten"],
  ["dairy", "Sut mahsulotlari", "Молочные продукты", "Dairy"],
  ["nuts", "Yong'oqlar", "Орехи", "Nuts"],
  ["eggs", "Tuxum", "Яйца", "Eggs"],
  ["sesame", "Kunjut", "Кунжут", "Sesame"],
];

const tr = (uz: string, ru: string, en: string) => [
  { locale: Locale.uz, name: uz },
  { locale: Locale.ru, name: ru },
  { locale: Locale.en, name: en },
];

async function main() {
  for (const [code, uz, ru, en] of REGIONS) {
    await db.region.upsert({
      where: { code },
      update: {},
      create: { code, translations: { create: tr(uz, ru, en) } },
    });
  }
  for (const [regionCode, slug, lat, lng, uz, ru, en] of CITIES) {
    const region = await db.region.findUniqueOrThrow({ where: { code: regionCode } });
    await db.city.upsert({
      where: { slug },
      update: {},
      create: { slug, lat, lng, regionId: region.id, translations: { create: tr(uz, ru, en) } },
    });
  }
  const tashkent = await db.city.findUniqueOrThrow({ where: { slug: "tashkent" } });
  for (const [slug, uz, ru, en] of TASHKENT_DISTRICTS) {
    await db.district.upsert({
      where: { cityId_slug: { cityId: tashkent.id, slug } },
      update: {},
      create: { cityId: tashkent.id, slug, translations: { create: tr(uz, ru, en) } },
    });
  }
  for (const [slug, uz, ru, en] of CUISINES) {
    await db.cuisine.upsert({
      where: { slug },
      update: {},
      create: { slug, translations: { create: tr(uz, ru, en) } },
    });
  }
  for (const [slug, uz, ru, en] of ALLERGENS) {
    await db.allergen.upsert({
      where: { slug },
      update: {},
      create: { slug, translations: { create: tr(uz, ru, en) } },
    });
  }
  console.log("Seeded taxonomy: 14 regions, 6 cities, 12 Tashkent districts, cuisines, allergens.");
}

main().finally(() => db.$disconnect());
