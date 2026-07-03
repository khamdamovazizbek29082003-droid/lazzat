export type Locale = "uz" | "ru" | "en";
export const LOCALES: Locale[] = ["uz", "ru", "en"];

/**
 * UI-chrome strings only (nav, buttons, hints). Restaurant/menu content lives in
 * TranslatedText fields on the mock data (see src/lib/data/types.ts) — this dictionary
 * is a lightweight stand-in for full next-intl routing, which lands with the real API.
 */
const dict = {
  brand_tagline: { uz: "3D xarita", ru: "3D карта", en: "3D map" },
  hero_title: {
    uz: "O'zbekistondagi barcha taomlar — bitta joyda",
    ru: "Вся еда Узбекистана — в одном месте",
    en: "Every place to eat in Uzbekistan — in one place",
  },
  hero_subtitle: {
    uz: "Choyxonalardan tortib zamonaviy restoranlargacha — yoningizdagi eng yaxshi joyni toping.",
    ru: "От традиционных чайхан до современных ресторанов — найдите лучшее место рядом с вами.",
    en: "From centuries-old teahouses to modern restaurants — find the best place near you.",
  },
  hero_stat_places: { uz: "ta joy", ru: "мест", en: "places" },
  hero_stat_cities: { uz: "shahar", ru: "городов", en: "cities" },
  search_placeholder: {
    uz: "Restoran, taom yoki oshxona qidiring…",
    ru: "Найдите ресторан, блюдо или кухню…",
    en: "Search restaurants, dishes, or cuisines…",
  },
  national_dishes: { uz: "O'zbek milliy taomlari", ru: "Национальные блюда Узбекистана", en: "Uzbek national dishes" },
  photo_credits_hint: {
    uz: "Rasmlar: Unsplash va Pexels, bepul foydalanish litsenziyasi",
    ru: "Фото: Unsplash и Pexels, свободная лицензия",
    en: "Photos: Unsplash & Pexels, free-to-use license",
  },
  nearby_heading: { uz: "Yaqin-atrofda", ru: "Рядом с вами", en: "Nearby" },
  places_found: { uz: "ta joy topildi", ru: "мест найдено", en: "places found" },
  view_map: { uz: "Xaritada ko'rish", ru: "Смотреть на карте", en: "View on map" },

  filter_open_now: { uz: "Hozir ochiq", ru: "Открыто сейчас", en: "Open now" },
  filter_24h: { uz: "24/7", ru: "24/7", en: "24/7" },
  filter_budget: { uz: "50 mingdan arzon", ru: "До 50 000", en: "Under 50k" },
  filter_moderate: { uz: "50 000–100 000", ru: "50 000–100 000", en: "50k–100k" },
  filter_upscale: { uz: "100 000+", ru: "100 000+", en: "100k+" },
  filter_halal: { uz: "Halol", ru: "Халяль", en: "Halal" },
  filter_delivery: { uz: "Yetkazib berish", ru: "Доставка", en: "Delivery" },
  filter_top_rated: { uz: "Eng yuqori baho", ru: "Высокий рейтинг", en: "Top rated" },
  filter_most_reviewed: { uz: "Eng ko'p sharh", ru: "Больше всего отзывов", en: "Most reviewed" },
  filter_family: { uz: "Oilaviy", ru: "Для семьи", en: "Family friendly" },
  filter_outdoor: { uz: "Ochiq havoda", ru: "Летняя веранда", en: "Outdoor seating" },
  filter_wifi: { uz: "Wi-Fi", ru: "Wi-Fi", en: "Wi-Fi" },
  filter_parking: { uz: "Parking", ru: "Парковка", en: "Parking" },

  open_now: { uz: "Hozir ochiq", ru: "Открыто", en: "Open now" },
  closed_now: { uz: "Yopiq", ru: "Закрыто", en: "Closed" },
  closes_at: { uz: "yopiladi", ru: "закрытие в", en: "closes" },

  nav_map: { uz: "Xarita", ru: "Карта", en: "Map" },
  nav_home: { uz: "Bosh sahifa", ru: "Главная", en: "Home" },

  map_country_hint: {
    uz: "Hududni bosing — yaqinlashish uchun · click a region to zoom in",
    ru: "Нажмите на регион, чтобы приблизиться",
    en: "Click a region to fly in",
  },
  map_default_hint: {
    uz: "Pinni bosing — sharh qoldiring · «＋ Joy qo'shish» bilan yangi joy yuboring",
    ru: "Нажмите на пин — оставьте отзыв · «＋ Добавить место» — предложить новое место",
    en: "Tap a pin to view & review · use “＋ Add a place” to submit a new one",
  },
  map_addmode_hint: {
    uz: "Xaritada joyni bosing — pin qo'ying",
    ru: "Нажмите на карту, чтобы поставить пин",
    en: "Tap the map to drop a pin",
  },
  map_addmode_form_hint: { uz: "Formani to'ldiring →", ru: "Заполните форму →", en: "Fill in the form →" },
  back_to_country: { uz: "← O'zbekiston", ru: "← Узбекистан", en: "← Uzbekistan" },
  satellite_view: { uz: "Sputnik", ru: "Спутник", en: "Satellite" },
  streets_view: { uz: "Xarita", ru: "Карта", en: "Map" },
  add_place: { uz: "＋ Joy qo'shish", ru: "＋ Добавить место", en: "＋ Add a place" },
  cancel_add_place: { uz: "✕ Bekor qilish", ru: "✕ Отменить", en: "✕ Cancel" },
  admin_queue: { uz: "Tekshirish navbati", ru: "Очередь модерации", en: "Verification queue" },
  admin_button: { uz: "Admin", ru: "Админ", en: "Admin" },
  admin_empty: {
    uz: "Navbat bo'sh ✓ — «＋ Joy qo'shish» orqali yangi taklif yuboring.",
    ru: "Очередь пуста ✓ — отправьте новое место через «Добавить место».",
    en: "Queue is empty ✓ — submit a new place with “Add a place”.",
  },
  call_owner: { uz: "Egasiga qo'ng'iroq", ru: "Позвонить владельцу", en: "Call the owner" },
  approve: { uz: "Tasdiqlash", ru: "Одобрить", en: "Approve" },
  reject: { uz: "Rad etish", ru: "Отклонить", en: "Reject" },
  duplicate: { uz: "Dublikat", ru: "Дубликат", en: "Duplicate" },
  pending_review: { uz: "Tekshirilmoqda", ru: "На проверке", en: "Pending review" },

  new_place_title: { uz: "Yangi joy qo'shish", ru: "Добавить новое место", en: "Add a new place" },
  new_place_subtitle: {
    uz: "Yo'lda topdingizmi? Admin tekshiradi.",
    ru: "Нашли по пути? Админ проверит.",
    en: "Found it on your way? An admin will verify it.",
  },
  field_name: { uz: "Nomi", ru: "Название", en: "Name" },
  field_name_placeholder: { uz: "Masalan: Do'stlik Somsa", ru: "Например: Do'stlik Somsa", en: "e.g. Do'stlik Somsa" },
  field_type: { uz: "Turi", ru: "Тип", en: "Type" },
  field_owner_phone: {
    uz: "Egasining telefoni — moderator qo'ng'iroq qilib tasdiqlaydi",
    ru: "Телефон владельца — модератор позвонит для подтверждения",
    en: "Owner's phone — a moderator will call to verify",
  },
  field_note: { uz: "Izoh (ixtiyoriy)", ru: "Комментарий (необязательно)", en: "Note (optional)" },
  field_note_placeholder: {
    uz: "Manzil mo'ljali, ish vaqti…",
    ru: "Ориентир, часы работы…",
    en: "Landmark, hours…",
  },
  submit_for_review: { uz: "Tekshiruvga yuborish", ru: "Отправить на проверку", en: "Submit for review" },
  submit_hint: {
    uz: "Yuborilgach pin sariq «Tekshirilmoqda» holatida turadi. Moderator egasiga qo'ng'iroq qilib tasdiqlagach — jonli bo'ladi.",
    ru: "После отправки пин будет жёлтым «На проверке». После звонка владельцу модератор подтвердит — пин станет активным.",
    en: "Once sent the pin shows amber “Pending review”. After the moderator calls the owner to verify, it goes live.",
  },
  submission_sent_toast: {
    uz: "✓ Tekshiruvga yuborildi — moderator egasiga qo'ng'iroq qiladi.",
    ru: "✓ Отправлено на проверку — модератор позвонит владельцу.",
    en: "✓ Sent for verification — a moderator will call the owner.",
  },
  approved_toast: {
    uz: "✓ Egasi tasdiqlandi — joy xaritada jonli.",
    ru: "✓ Владелец подтверждён — место на карте активно.",
    en: "✓ Owner verified — the place is now live on the map.",
  },
  rejected_toast: { uz: "Taklif rad etildi.", ru: "Заявка отклонена.", en: "Submission rejected." },
  error_name_required: { uz: "Joy nomini kiriting.", ru: "Укажите название места.", en: "Add the place's name." },
  error_phone_invalid: {
    uz: "Telefon +998 XX XXX XX XX ko'rinishida bo'lishi kerak.",
    ru: "Телефон должен быть в формате +998 XX XXX XX XX.",
    en: "Owner phone must be +998 XX XXX XX XX.",
  },

  leave_review: { uz: "Sharh qoldirish", ru: "Оставить отзыв", en: "Leave a review" },
  review_placeholder: { uz: "Taassurotingiz…", ru: "Ваши впечатления…", en: "Your impressions…" },
  submit_review: { uz: "Yuborish", ru: "Отправить", en: "Submit" },
  error_stars_required: { uz: "Avval yulduzcha tanlang.", ru: "Сначала выберите оценку.", en: "Pick a star rating first." },
  review_sent_toast: {
    uz: "✓ Sharh yuborildi — moderatsiyadan so'ng ko'rinadi.",
    ru: "✓ Отзыв отправлен — появится после модерации.",
    en: "✓ Review submitted — visible after moderation.",
  },
  no_reviews_yet: { uz: "Hali sharhlar yo'q — birinchi bo'ling.", ru: "Отзывов пока нет — будьте первым.", en: "No reviews yet — be the first." },
  reviews_count: { uz: "sharh", ru: "отзывов", en: "reviews" },

  directions: { uz: "Yo'nalish", ru: "Маршрут", en: "Directions" },
  view_full_page: { uz: "To'liq sahifa", ru: "Открыть страницу", en: "View full page" },
  popular_dishes: { uz: "Mashhur taomlar", ru: "Популярные блюда", en: "Popular dishes" },
  new_badge: { uz: "yangi", ru: "новое", en: "new" },

  hours: { uz: "Ish vaqti", ru: "Часы работы", en: "Working hours" },
  menu: { uz: "Menyu", ru: "Меню", en: "Menu" },
  about: { uz: "Tavsif", ru: "Описание", en: "About" },
  photos: { uz: "Rasmlar", ru: "Фото", en: "Photos" },
  nearby_similar: { uz: "Yaqin va o'xshash joylar", ru: "Похожие места рядом", en: "Nearby & similar places" },
  save: { uz: "Saqlash", ru: "Сохранить", en: "Save" },
  saved: { uz: "Saqlangan", ru: "Сохранено", en: "Saved" },
  share: { uz: "Ulashish", ru: "Поделиться", en: "Share" },
  link_copied: { uz: "Havola nusxalandi", ru: "Ссылка скопирована", en: "Link copied" },
  close: { uz: "Yopish", ru: "Закрыть", en: "Close" },
  address: { uz: "Manzil", ru: "Адрес", en: "Address" },
  phone: { uz: "Telefon", ru: "Телефон", en: "Phone" },
  avg_check: { uz: "O'rtacha chek", ru: "Средний чек", en: "Average check" },

  sign_in: { uz: "Kirish", ru: "Войти", en: "Sign in" },
  sign_in_google: { uz: "Google orqali kirish", ru: "Войти через Google", en: "Sign in with Google" },
  sign_out: { uz: "Chiqish", ru: "Выйти", en: "Sign out" },
} as const satisfies Record<string, Record<Locale, string>>;

export type DictKey = keyof typeof dict;

export const dictionaries: Record<Locale, Record<DictKey, string>> = LOCALES.reduce(
  (acc, locale) => {
    acc[locale] = Object.fromEntries(
      (Object.keys(dict) as DictKey[]).map((key) => [key, dict[key][locale]]),
    ) as Record<DictKey, string>;
    return acc;
  },
  {} as Record<Locale, Record<DictKey, string>>,
);
