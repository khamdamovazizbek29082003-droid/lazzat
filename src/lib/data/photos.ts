import type { EstablishmentType, Locale, TranslatedText } from "./types";

/**
 * Real, freely-licensed photography — not scraped from Google Images (which is almost
 * entirely copyrighted, unlicensed-for-reuse content). Sourced from Unsplash and Pexels,
 * both of which grant free use (including commercial) with no attribution required; we
 * credit the platform anyway as a courtesy. These are representative category/dish
 * photos, not photos of any specific business.
 *
 * Originally sourced from Wikimedia Commons, but upload.wikimedia.org started
 * rate-limiting/blocking this network's egress IP after routine dev-time traffic — not
 * viable to depend on for a real app. Unsplash/Pexels' CDNs proved reliable instead.
 */
export interface DishPhoto {
  key: string;
  url: string;
  name: TranslatedText;
  credit: string;
  sourceUrl: string;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;
const pexels = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?w=1000`;

export const DISH_PHOTOS = {
  plov: {
    key: "plov",
    url: unsplash("1634324092526-91f5e878b72f"),
    name: { uz: "Osh (palov)", ru: "Плов", en: "Plov", kaa: "Палау" },
    credit: "Unsplash",
    sourceUrl: "https://unsplash.com/photos/ojDzHZHcVx4",
  },
  shashlik: {
    key: "shashlik",
    url: unsplash("1626323109252-0adb3b46692b"),
    name: { uz: "Shashlik", ru: "Шашлык", en: "Shashlik", kaa: "Шашлык" },
    credit: "Unsplash",
    sourceUrl: "https://unsplash.com/photos/grilled-meat-on-black-metal-grill-jkP5KFVbpGg",
  },
  somsa: {
    key: "somsa",
    url: pexels("23286188"),
    name: { uz: "Somsa", ru: "Самса", en: "Somsa", kaa: "Самса" },
    credit: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/popular-indian-and-pakistani-snack-chicken-and-beef-samosa-desi-food-23286188/",
  },
  non: {
    key: "non",
    url: pexels("10337726"),
    name: { uz: "Non (tandir noni)", ru: "Лепёшка", en: "Tandir bread (non)", kaa: "Нан (тандыр нан)" },
    credit: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/a-plate-of-a-cheese-garlic-naan-10337726/",
  },
  lagman: {
    key: "lagman",
    url: unsplash("1631709497146-a239ef373cf1"),
    name: { uz: "Lag'mon", ru: "Лагман", en: "Lagman", kaa: "Лағман" },
    credit: "Unsplash",
    sourceUrl: "https://unsplash.com/photos/a-bowl-of-noodle-soup-with-chopsticks-on-the-side-NFQi_2HUNRI",
  },
  teahouse: {
    key: "teahouse",
    url: unsplash("1615634376487-fd4e488e982e"),
    name: { uz: "Choyxona", ru: "Чайхана", en: "Teahouse", kaa: "Шайхана" },
    credit: "Unsplash",
    sourceUrl: "https://unsplash.com/photos/green-and-black-ceramic-teapot-ZeuI2N-ses4",
  },
  coffee: {
    key: "coffee",
    url: unsplash("1531441802565-2948024f1b22"),
    name: { uz: "Kofe", ru: "Кофе", en: "Coffee", kaa: "Кофе" },
    credit: "Unsplash",
    sourceUrl: "https://unsplash.com/photos/white-ceramic-coffee-cup-with-latte-art-s1-VmA26BIc",
  },
  dessert: {
    key: "dessert",
    url: pexels("20183046"),
    name: { uz: "Shirinlik (baklava)", ru: "Пахлава", en: "Baklava", kaa: "Пахлаўа" },
    credit: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/close-up-of-baklava-pieces-on-a-plate-20183046/",
  },
  manti: {
    key: "manti",
    url: unsplash("1523905330026-b8bd1f5f320e"),
    name: { uz: "Manti", ru: "Манты", en: "Manti", kaa: "Манты" },
    credit: "Unsplash",
    sourceUrl: "https://unsplash.com/photos/steamed-dumplings-on-steamer-q66grqqHpDQ",
  },
  doner: {
    key: "doner",
    url: pexels("23996328"),
    name: { uz: "Fast food", ru: "Фастфуд", en: "Fast food", kaa: "Тез аш" },
    credit: "Pexels",
    sourceUrl: "https://www.pexels.com/photo/hamburger-and-fries-23996328/",
  },
} as const satisfies Record<string, DishPhoto>;

export type DishPhotoKey = keyof typeof DISH_PHOTOS;

/** Homepage "national dishes" showcase, in display order. */
export const NATIONAL_DISHES: DishPhotoKey[] = [
  "plov",
  "shashlik",
  "somsa",
  "manti",
  "lagman",
  "non",
  "dessert",
  "teahouse",
  "coffee",
  "doner",
];

const TYPE_PHOTO: Record<EstablishmentType, DishPhotoKey> = {
  RESTAURANT: "plov",
  CAFE: "coffee",
  FAST_FOOD: "doner",
  BAKERY: "non",
  COFFEE_SHOP: "coffee",
  TEA_HOUSE: "teahouse",
  STREET_FOOD: "somsa",
  CANTEEN: "plov",
  DESSERT_SHOP: "dessert",
  BAR: "shashlik",
  OTHER: "manti",
};

/** Representative category photo for a place — not a photo of that specific business. */
export function photoForType(type: EstablishmentType): DishPhoto {
  return DISH_PHOTOS[TYPE_PHOTO[type]];
}

export function dishName(photo: DishPhoto, locale: Locale) {
  return photo.name[locale];
}
