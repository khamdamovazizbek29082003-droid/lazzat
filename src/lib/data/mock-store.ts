import type {
  EstablishmentType,
  MenuCategory,
  PlaceSubmission,
  PriceBucket,
  RestaurantDetail,
  Review,
  TranslatedText,
  WorkingHours,
} from "./types";
import { CATEGORY_EMOJI } from "./types";
import { REAL_PLACE_SEEDS } from "./real-places";

const tr = (uz: string, ru: string, en: string): TranslatedText => ({ uz, ru, en, kaa: uz });

const GRADIENTS: [string, string][] = [
  ["#14418C", "#2563C4"],
  ["#D68F27", "#B4322E"],
  ["#1E9C8D", "#14418C"],
  ["#B4322E", "#D68F27"],
  ["#2563C4", "#1E9C8D"],
  ["#0E3068", "#2563C4"],
];

const STANDARD_HOURS = (opensAt = "09:00", closesAt = "23:00"): WorkingHours[] =>
  Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, opensAt, closesAt, isClosed: false }));

const ALWAYS_OPEN: WorkingHours[] = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  opensAt: null,
  closesAt: null,
  isClosed: false,
}));

// Next.js keeps separate module instances for the server and the browser bundle, so this
// counter is NOT actually shared across them — a random suffix keeps ids collision-free
// even when both sides happen to reach the same counter value independently. Not an issue
// once this is backed by a real database with real primary keys.
let seq = 1000;
const nextId = (prefix: string) => `${prefix}-${seq++}-${Math.random().toString(36).slice(2, 7)}`;

function menuItem(uz: string, ru: string, en: string, priceUzs: number, emoji: string, popular = false) {
  return { id: nextId("item"), name: tr(uz, ru, en), priceUzs, emoji, isPopular: popular };
}

const MENU_TEMPLATES: Record<string, () => MenuCategory[]> = {
  milliy: () => [
    {
      id: nextId("cat"),
      name: tr("Milliy taomlar", "Национальные блюда", "National dishes"),
      items: [
        menuItem("Osh (qazili)", "Плов с казы", "Plov with qazi", 65000, "🍚", true),
        menuItem("Osh (oddiy)", "Плов классический", "Classic plov", 45000, "🍚"),
        menuItem("Norin", "Норин", "Norin", 40000, "🍜"),
        menuItem("Manti (5 dona)", "Манты (5 шт)", "Manti (5 pcs)", 35000, "🥟"),
      ],
    },
    {
      id: nextId("cat"),
      name: tr("Ichimliklar", "Напитки", "Drinks"),
      items: [
        menuItem("Ko'k choy", "Зелёный чай", "Green tea", 8000, "🍵"),
        menuItem("Ayron", "Айран", "Ayran", 10000, "🥛"),
      ],
    },
  ],
  fastfood: () => [
    {
      id: nextId("cat"),
      name: tr("Fast food", "Фастфуд", "Fast food"),
      items: [
        menuItem("Lag'mon (qovurma)", "Жареный лагман", "Fried lagman", 38000, "🍝", true),
        menuItem("Burger", "Бургер", "Burger", 32000, "🍔", true),
        menuItem("Hot-dog", "Хот-дог", "Hot dog", 22000, "🌭"),
        menuItem("Kartoshka fri", "Картофель фри", "French fries", 15000, "🍟"),
      ],
    },
    {
      id: nextId("cat"),
      name: tr("Ichimliklar", "Напитки", "Drinks"),
      items: [menuItem("Cola 0.5L", "Кола 0.5Л", "Cola 0.5L", 10000, "🥤")],
    },
  ],
  coffee: () => [
    {
      id: nextId("cat"),
      name: tr("Kofe", "Кофе", "Coffee"),
      items: [
        menuItem("Flat white", "Флэт уайт", "Flat white", 28000, "☕", true),
        menuItem("Latte", "Латте", "Latte", 26000, "☕"),
        menuItem("Espresso", "Эспрессо", "Espresso", 18000, "☕"),
      ],
    },
    {
      id: nextId("cat"),
      name: tr("Nonvoyxona", "Выпечка", "Bakery"),
      items: [
        menuItem("Tandir non", "Тандыр нон", "Tandir bread", 8000, "🍞", true),
        menuItem("Kruassan", "Круассан", "Croissant", 16000, "🥐"),
      ],
    },
  ],
  choyxona: () => [
    {
      id: nextId("cat"),
      name: tr("Choyxona", "Чайхана", "Tea house"),
      items: [
        menuItem("Ko'k choy (choynak)", "Зелёный чай (чайник)", "Green tea (pot)", 6000, "🫖", true),
        menuItem("Somsa (go'shtli)", "Самса с мясом", "Meat somsa", 12000, "🥟", true),
        menuItem("Shashlik (qo'y go'shti)", "Шашлык из баранины", "Lamb shashlik", 28000, "🍢"),
      ],
    },
  ],
  desserts: () => [
    {
      id: nextId("cat"),
      name: tr("Shirinliklar", "Десерты", "Desserts"),
      items: [
        menuItem("Napoleon", "Наполеон", "Napoleon cake", 22000, "🍰", true),
        menuItem("Cheesecake", "Чизкейк", "Cheesecake", 26000, "🍰", true),
        menuItem("Muzqaymoq", "Мороженое", "Ice cream", 14000, "🍨"),
      ],
    },
  ],
};

type Seed = {
  slug: string;
  type: EstablishmentType;
  name: [string, string, string];
  cityName: string;
  districtName?: string;
  lat: number;
  lng: number;
  priceBucket: PriceBucket;
  avgCheckUzs: number;
  ratingAvg: number;
  reviewCount: number;
  menu: keyof typeof MENU_TEMPLATES;
  attrs: Partial<RestaurantDetail["attributes"]>;
  hours?: WorkingHours[];
  description: [string, string, string];
};

const SEEDS: Seed[] = [
  {
    slug: "qosh-chinor-osh-markazi",
    type: "RESTAURANT",
    name: ["Qo'sh Chinor Osh Markazi", "Ош-центр Кош Чинор", "Qo'sh Chinor Plov Center"],
    cityName: "Toshkent",
    districtName: "Yunusobod",
    lat: 41.3401,
    lng: 69.2887,
    priceBucket: "MODERATE",
    avgCheckUzs: 65000,
    ratingAvg: 4.8,
    reviewCount: 214,
    menu: "milliy",
    attrs: { halal: true, dineIn: true, takeaway: true, parking: true },
    hours: STANDARD_HOURS("08:00", "16:00"),
    description: [
      "Toshkentning eng mashhur osh markazlaridan biri — har kuni yangi tayyorlanadigan qazili osh.",
      "Один из самых известных плов-центров Ташкента — казы-плов готовится свежим каждый день.",
      "One of Tashkent's most famous plov centers — fresh qazi plov cooked daily.",
    ],
  },
  {
    slug: "lagmanxona-77",
    type: "RESTAURANT",
    name: ["Lagmanxona 77", "Лагманхона 77", "Lagmanxona 77"],
    cityName: "Toshkent",
    districtName: "Chilonzor",
    lat: 41.2789,
    lng: 69.2034,
    priceBucket: "MODERATE",
    avgCheckUzs: 55000,
    ratingAvg: 4.6,
    reviewCount: 132,
    menu: "fastfood",
    attrs: { halal: true, delivery: true, takeaway: true },
    description: [
      "Uyg'ur oshxonasi — qo'lda tortilgan lag'mon va qovurma taomlar.",
      "Уйгурская кухня — лагман ручной раскатки и жареные блюда.",
      "Uyghur kitchen — hand-pulled lagman and fried noodle dishes.",
    ],
  },
  {
    slug: "non-and-coffee",
    type: "COFFEE_SHOP",
    name: ["Non & Coffee", "Нон & Кофе", "Non & Coffee"],
    cityName: "Toshkent",
    districtName: "Mirobod",
    lat: 41.3011,
    lng: 69.2814,
    priceBucket: "MODERATE",
    avgCheckUzs: 48000,
    ratingAvg: 4.7,
    reviewCount: 98,
    menu: "coffee",
    attrs: { wifi: true, outdoorSeating: true, delivery: true },
    description: [
      "Tandir noni va specialty kofe — kutilmagan, ammo ajoyib kombinatsiya.",
      "Тандыр нон и спешелти кофе — неожиданное, но отличное сочетание.",
      "Tandir bread and specialty coffee — an unexpected but great combination.",
    ],
  },
  {
    slug: "sultan-kabob",
    type: "RESTAURANT",
    name: ["Sultan Kabob", "Султан Кабоб", "Sultan Kabob"],
    cityName: "Toshkent",
    districtName: "Yakkasaroy",
    lat: 41.2872,
    lng: 69.2695,
    priceBucket: "UPSCALE",
    avgCheckUzs: 80000,
    ratingAvg: 4.5,
    reviewCount: 76,
    menu: "choyxona",
    attrs: { halal: true, outdoorSeating: true, kidsArea: true, parking: true },
    description: [
      "Mangalda pishirilgan shashliklar va milliy taomlar oilaviy muhitda.",
      "Шашлык на мангале и национальные блюда в семейной атмосфере.",
      "Charcoal-grilled shashlik and national dishes in a family setting.",
    ],
  },
  {
    slug: "choyxona-bahor",
    type: "TEA_HOUSE",
    name: ["Choyxona Bahor", "Чайхана Бахор", "Bahor Tea House"],
    cityName: "Toshkent",
    districtName: "Olmazor",
    lat: 41.3487,
    lng: 69.2251,
    priceBucket: "BUDGET",
    avgCheckUzs: 50000,
    ratingAvg: 4.4,
    reviewCount: 61,
    menu: "choyxona",
    attrs: { halal: true, outdoorSeating: true, is24h: false },
    description: [
      "An'anaviy choyxona — ko'k choy, somsa va sokin muhit.",
      "Традиционная чайхана — зелёный чай, самса и спокойная атмосфера.",
      "A traditional tea house — green tea, somsa, and a calm atmosphere.",
    ],
  },
  {
    slug: "shirin-dunyo",
    type: "DESSERT_SHOP",
    name: ["Shirin Dunyo", "Ширин Дунё", "Shirin Dunyo Desserts"],
    cityName: "Toshkent",
    districtName: "Mirzo Ulug'bek",
    lat: 41.3312,
    lng: 69.3286,
    priceBucket: "MODERATE",
    avgCheckUzs: 60000,
    ratingAvg: 4.9,
    reviewCount: 154,
    menu: "desserts",
    attrs: { wifi: true, delivery: true, kidsArea: true },
    description: [
      "Uy sharoitida tayyorlangan tortlar va desertlar.",
      "Домашние торты и десерты.",
      "Home-style cakes and desserts.",
    ],
  },
  {
    slug: "dostlik-somsa",
    type: "STREET_FOOD",
    name: ["Do'stlik Somsa", "Дустлик Сомса", "Do'stlik Somsa"],
    cityName: "Toshkent",
    districtName: "Sergeli",
    lat: 41.2245,
    lng: 69.2311,
    priceBucket: "BUDGET",
    avgCheckUzs: 20000,
    ratingAvg: 4.6,
    reviewCount: 44,
    menu: "choyxona",
    attrs: { takeaway: true, halal: true },
    description: [
      "Tandirda pishirilgan somsa — mahalliylar orasida sevimli joy.",
      "Самса из тандыра — любимое место у местных жителей.",
      "Tandir-baked somsa — a local favorite.",
    ],
  },
  {
    slug: "uchtepa-oshxonasi",
    type: "CANTEEN",
    name: ["Uchtepa Oshxonasi", "Учтепа Ошхонаси", "Uchtepa Canteen"],
    cityName: "Toshkent",
    districtName: "Uchtepa",
    lat: 41.3106,
    lng: 69.1734,
    priceBucket: "BUDGET",
    avgCheckUzs: 30000,
    ratingAvg: 4.3,
    reviewCount: 39,
    menu: "milliy",
    attrs: { halal: true, dineIn: true, takeaway: true },
    description: [
      "Uy taomlari uslubidagi arzon va mazali oshxona.",
      "Недорогая столовая с домашней кухней.",
      "Affordable canteen serving home-style dishes.",
    ],
  },
  {
    slug: "bektemir-bar",
    type: "BAR",
    name: ["Bektemir Sky Bar", "Бектемир Скай Бар", "Bektemir Sky Bar"],
    cityName: "Toshkent",
    districtName: "Bektemir",
    lat: 41.2317,
    lng: 69.3517,
    priceBucket: "PREMIUM",
    avgCheckUzs: 180000,
    ratingAvg: 4.5,
    reviewCount: 28,
    menu: "fastfood",
    attrs: { outdoorSeating: true, wifi: true },
    description: [
      "Tomdagi bar — panorama manzara va live musiqa.",
      "Бар на крыше — панорамный вид и живая музыка.",
      "Rooftop bar — panoramic views and live music.",
    ],
  },
  {
    slug: "yashnobod-fastfood",
    type: "FAST_FOOD",
    name: ["Yashnobod Fast Food", "Яшнабад Фаст Фуд", "Yashnobod Fast Food"],
    cityName: "Toshkent",
    districtName: "Yashnobod",
    lat: 41.2814,
    lng: 69.3468,
    priceBucket: "BUDGET",
    avgCheckUzs: 28000,
    ratingAvg: 4.2,
    reviewCount: 51,
    menu: "fastfood",
    attrs: { delivery: true, takeaway: true },
    description: [
      "Tez va sifatli fast-food — burger, lag'mon va boshqalar.",
      "Быстрый и качественный фастфуд.",
      "Quick, quality fast food — burgers, lagman, and more.",
    ],
  },
  {
    slug: "yangihayot-nonvoyxona",
    type: "BAKERY",
    name: ["Yangihayot Nonvoyxonasi", "Янгихаёт Нонвойхонаси", "Yangihayot Bakery"],
    cityName: "Toshkent",
    districtName: "Yangihayot",
    lat: 41.2694,
    lng: 69.1523,
    priceBucket: "BUDGET",
    avgCheckUzs: 15000,
    ratingAvg: 4.4,
    reviewCount: 22,
    menu: "coffee",
    attrs: { takeaway: true },
    description: [
      "Har tongda yangi non va pishiriqlar.",
      "Свежий хлеб и выпечка каждое утро.",
      "Fresh bread and pastries every morning.",
    ],
  },
  {
    slug: "registon-osh-uyi",
    type: "RESTAURANT",
    name: ["Registon Osh Uyi", "Регистон Ош Уйи", "Registon Plov House"],
    cityName: "Samarqand",
    lat: 39.6547,
    lng: 66.9756,
    priceBucket: "MODERATE",
    avgCheckUzs: 58000,
    ratingAvg: 4.7,
    reviewCount: 87,
    menu: "milliy",
    attrs: { halal: true, dineIn: true, parking: true },
    description: [
      "Registon maydoni yaqinidagi milliy taomlar uyi.",
      "Дом национальной кухни рядом с площадью Регистан.",
      "A national-cuisine house near Registan Square.",
    ],
  },
  {
    slug: "bibi-choyxona",
    type: "TEA_HOUSE",
    name: ["Bibi Choyxona", "Биби Чайхана", "Bibi Tea House"],
    cityName: "Samarqand",
    lat: 39.6601,
    lng: 66.9754,
    priceBucket: "BUDGET",
    avgCheckUzs: 40000,
    ratingAvg: 4.5,
    reviewCount: 63,
    menu: "choyxona",
    attrs: { outdoorSeating: true, halal: true },
    description: [
      "Bibi-Xonim masjidi yonidagi an'anaviy choyxona.",
      "Традиционная чайхана рядом с мечетью Биби-Ханым.",
      "A traditional tea house next to the Bibi-Khanym Mosque.",
    ],
  },
  {
    slug: "lyabi-hovuz-cafe",
    type: "CAFE",
    name: ["Lyabi Hovuz Café", "Ляби Ховуз Кафе", "Lyabi-Hauz Café"],
    cityName: "Buxoro",
    lat: 39.7756,
    lng: 64.4158,
    priceBucket: "MODERATE",
    avgCheckUzs: 52000,
    ratingAvg: 4.6,
    reviewCount: 71,
    menu: "coffee",
    attrs: { outdoorSeating: true, wifi: true },
    description: [
      "Lyabi Hovuz hovuzi bo'yidagi mashhur kafe.",
      "Популярное кафе у пруда Ляби-Хауз.",
      "A popular café by the Lyabi-Hauz pool.",
    ],
  },
  {
    slug: "minorai-shashlik",
    type: "RESTAURANT",
    name: ["Minorai Shashlik", "Минораи Шашлик", "Minorai Shashlik"],
    cityName: "Buxoro",
    lat: 39.7681,
    lng: 64.4232,
    priceBucket: "MODERATE",
    avgCheckUzs: 62000,
    ratingAvg: 4.4,
    reviewCount: 48,
    menu: "choyxona",
    attrs: { halal: true, dineIn: true },
    description: [
      "Kalyan minorasi yaqinidagi shashlikxona.",
      "Шашлычная рядом с минаретом Калян.",
      "A shashlik house near the Kalyan Minaret.",
    ],
  },
  {
    slug: "vodiy-lagmon",
    type: "RESTAURANT",
    name: ["Vodiy Lagmon", "Водий Лагмон", "Vodiy Lagmon"],
    cityName: "Farg'ona",
    lat: 40.3894,
    lng: 71.7876,
    priceBucket: "BUDGET",
    avgCheckUzs: 35000,
    ratingAvg: 4.5,
    reviewCount: 56,
    menu: "fastfood",
    attrs: { halal: true, delivery: true },
    description: [
      "Farg'ona vodiysi uslubidagi lag'mon.",
      "Лагман в стиле Ферганской долины.",
      "Fergana Valley-style lagman.",
    ],
  },
  {
    slug: "margilon-somsa",
    type: "STREET_FOOD",
    name: ["Marg'ilon Somsa", "Маргилан Сомса", "Margilan Somsa"],
    cityName: "Farg'ona",
    lat: 40.4731,
    lng: 71.7247,
    priceBucket: "BUDGET",
    avgCheckUzs: 18000,
    ratingAvg: 4.6,
    reviewCount: 33,
    menu: "choyxona",
    attrs: { takeaway: true, halal: true },
    description: [
      "Marg'ilon uslubidagi tandir somsa.",
      "Тандыр самса в маргиланском стиле.",
      "Margilan-style tandir somsa.",
    ],
  },
  {
    slug: "ichan-qala-choyxona",
    type: "TEA_HOUSE",
    name: ["Ichan Qal'a Choyxona", "Ичан-Кала Чайхана", "Ichan-Qala Tea House"],
    cityName: "Xiva",
    lat: 41.3783,
    lng: 60.3639,
    priceBucket: "BUDGET",
    avgCheckUzs: 42000,
    ratingAvg: 4.7,
    reviewCount: 41,
    menu: "choyxona",
    attrs: { outdoorSeating: true, halal: true },
    description: [
      "Ichan Qal'a ichidagi tarixiy choyxona.",
      "Историческая чайхана внутри Ичан-Калы.",
      "A historic tea house inside Ichan-Qala.",
    ],
  },
  {
    slug: "amudaryo-osh",
    type: "RESTAURANT",
    name: ["Amudaryo Osh", "Амударьё Ош", "Amudaryo Plov"],
    cityName: "Nukus",
    lat: 42.46,
    lng: 59.6166,
    priceBucket: "MODERATE",
    avgCheckUzs: 45000,
    ratingAvg: 4.3,
    reviewCount: 19,
    menu: "milliy",
    attrs: { halal: true, dineIn: true, parking: true },
    description: [
      "Qoraqalpog'iston uslubidagi osh va milliy taomlar.",
      "Плов и национальные блюда в каракалпакском стиле.",
      "Karakalpak-style plov and national dishes.",
    ],
  },
];

const SAMPLE_REVIEWS: [string, string][] = [
  ["Dilnoza M.", "Osh juda mazali, go'sht ko'p. Tushgacha boring!"],
  ["Sardor A.", "Delicious, but Saturdays are crowded."],
  ["Malika R.", "Perfect hand-pulled noodles, fast delivery."],
  ["Sarah K.", "Unexpected combo but it really works — will come back."],
  ["Jasur T.", "Xizmat tez, narxlar mos."],
  ["Ivan P.", "Отличное место, обязательно приду снова."],
];

function buildReviews(restaurantId: string, count: number): Review[] {
  return Array.from({ length: count }, (_, i) => {
    const [userName, text] = SAMPLE_REVIEWS[(count + i) % SAMPLE_REVIEWS.length];
    const stars = 4 + ((i + count) % 2);
    return {
      id: nextId("review"),
      restaurantId,
      userName,
      ratingOverall: stars,
      ratingFood: stars,
      ratingService: Math.max(3, stars - 1),
      ratingAtmosphere: stars,
      ratingPrice: stars,
      text,
      createdAt: new Date(Date.now() - i * 5 * 86400_000).toISOString(),
      isVerifiedVisit: i % 2 === 0,
    };
  });
}

const FULL_ATTRS_DEFAULT: RestaurantDetail["attributes"] = {
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
};

const curatedRestaurants: RestaurantDetail[] = SEEDS.map((s, i) => {
  const id = nextId("rest");
  const reviews = buildReviews(id, Math.min(3, Math.max(0, Math.round(s.reviewCount / 40))));
  return {
    id,
    slug: s.slug,
    type: s.type,
    name: tr(...s.name),
    cityName: s.cityName,
    citySlug: s.cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    districtName: s.districtName,
    lat: s.lat,
    lng: s.lng,
    priceBucket: s.priceBucket,
    avgCheckUzs: s.avgCheckUzs,
    ratingAvg: s.ratingAvg,
    reviewCount: s.reviewCount,
    gradient: GRADIENTS[i % GRADIENTS.length],
    emoji: CATEGORY_EMOJI[s.type],
    attributes: { ...FULL_ATTRS_DEFAULT, ...s.attrs },
    hours: s.hours ?? (s.attrs.is24h ? ALWAYS_OPEN : STANDARD_HOURS()),
    description: tr(...s.description),
    address: `${s.cityName}${s.districtName ? ", " + s.districtName : ""}`,
    phone: "+998901234567",
    telegram: `@${s.slug.replace(/-/g, "_")}`,
    verifiedOwner: false,
    categories: MENU_TEMPLATES[s.menu](),
    reviews,
  };
});

/**
 * Deterministic PRNG seeded by name+city, so the "random-looking" rating/review count for
 * real (OSM-sourced) places comes out identical on the server and the client — using
 * Math.random() here would make the SSR'd detail page mismatch the client render (Next.js
 * keeps separate module instances per environment) and trigger a hydration error.
 */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const TYPE_MENU: Record<EstablishmentType, keyof typeof MENU_TEMPLATES> = {
  RESTAURANT: "milliy",
  CANTEEN: "milliy",
  OTHER: "milliy",
  FAST_FOOD: "fastfood",
  CAFE: "coffee",
  COFFEE_SHOP: "coffee",
  BAKERY: "coffee",
  TEA_HOUSE: "choyxona",
  BAR: "choyxona",
  STREET_FOOD: "choyxona",
  DESSERT_SHOP: "desserts",
};

const PRICE_BY_ROLL = (roll: number): PriceBucket =>
  roll < 0.35 ? "BUDGET" : roll < 0.8 ? "MODERATE" : roll < 0.95 ? "UPSCALE" : "PREMIUM";

const AVG_CHECK_BY_BUCKET: Record<PriceBucket, [number, number]> = {
  BUDGET: [18000, 35000],
  MODERATE: [40000, 75000],
  UPSCALE: [80000, 130000],
  PREMIUM: [150000, 250000],
};

const realRestaurants: RestaurantDetail[] = REAL_PLACE_SEEDS.map((s, i) => {
  const id = nextId("rest");
  const rand = seededRandom(`${s.name}|${s.cityName}`);
  const priceBucket = PRICE_BY_ROLL(rand());
  const [lo, hi] = AVG_CHECK_BY_BUCKET[priceBucket];
  const avgCheckUzs = Math.round((lo + rand() * (hi - lo)) / 1000) * 1000;
  const ratingAvg = Math.round((3.9 + rand() * 0.9) * 10) / 10;
  const reviewCount = Math.floor(15 + rand() * 220);
  const reviews = buildReviews(id, Math.min(2, Math.floor(reviewCount / 80)));

  return {
    id,
    slug: slugify(s.name, `${s.cityName.slice(0, 3).toLowerCase()}${i}`),
    type: s.type,
    name: tr(s.name, s.name, s.name),
    cityName: s.cityName,
    citySlug: s.cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    lat: s.lat,
    lng: s.lng,
    priceBucket,
    avgCheckUzs,
    ratingAvg,
    reviewCount,
    gradient: GRADIENTS[(i + SEEDS.length) % GRADIENTS.length],
    emoji: CATEGORY_EMOJI[s.type],
    attributes: {
      ...FULL_ATTRS_DEFAULT,
      halal: s.halal ?? false,
      delivery: s.delivery ?? false,
      outdoorSeating: s.outdoorSeating ?? false,
      wifi: s.wifi ?? false,
      is24h: s.is24h ?? false,
    },
    hours: s.is24h ? ALWAYS_OPEN : STANDARD_HOURS(),
    description: tr(
      `${s.name} — ${s.cityName}dagi mashhur joylardan biri. Manzil va ish vaqti OpenStreetMap'dan olindi.`,
      `${s.name} — популярное место в городе ${s.cityName}. Адрес и координаты взяты из OpenStreetMap.`,
      `${s.name} is a well-known spot in ${s.cityName}. Location sourced from OpenStreetMap.`,
    ),
    address: s.cityName,
    phone: s.phone,
    verifiedOwner: false,
    categories: MENU_TEMPLATES[TYPE_MENU[s.type]](),
    reviews,
  };
});

export const restaurants: RestaurantDetail[] = [...curatedRestaurants, ...realRestaurants];

/** In-memory community-submission queue — mutated by the mock data client. */
export const submissions: PlaceSubmission[] = [];

export function nextSubmissionId() {
  return nextId("sub");
}

export function nextRestaurantId() {
  return nextId("rest");
}

export function nextReviewId() {
  return nextId("review");
}

export function slugify(name: string, suffix: string) {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return `${base}-${suffix}`;
}
