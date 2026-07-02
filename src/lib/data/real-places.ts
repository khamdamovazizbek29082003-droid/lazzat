import type { EstablishmentType } from "./types";

/**
 * Real cafes/restaurants sourced from OpenStreetMap (Overpass API, ODbL — open data, free
 * to use, unlike scraping Google). Names and coordinates are real; ratings, review counts,
 * menus, hours and descriptions are generated placeholders (OSM doesn't carry those) until
 * this is backed by the live API. See mock-store.ts for how these become full listings.
 */
export interface RealPlaceSeed {
  name: string;
  type: EstablishmentType;
  cityName: string;
  lat: number;
  lng: number;
  phone?: string;
  is24h?: boolean;
  halal?: boolean;
  delivery?: boolean;
  outdoorSeating?: boolean;
  wifi?: boolean;
}

const rp = (
  name: string,
  type: EstablishmentType,
  cityName: string,
  lat: number,
  lng: number,
  opts: Partial<RealPlaceSeed> = {},
): RealPlaceSeed => ({ name, type, cityName, lat, lng, ...opts });

export const REAL_PLACE_SEEDS: RealPlaceSeed[] = [
  // ─────────────────────────── Tashkent ───────────────────────────
  rp("Bibigon", "CAFE", "Toshkent", 41.3116241, 69.2898272, { phone: "+998983007300", wifi: true }),
  rp("Pasado", "RESTAURANT", "Toshkent", 41.2947982, 69.2541432),
  rp("MixUp (Meram)", "CAFE", "Toshkent", 41.2912051, 69.2237127, { wifi: true }),
  rp('Cafe "Nostalgie"', "CAFE", "Toshkent", 41.2860771, 69.2829780, { phone: "+998951462016", wifi: true }),
  rp("Jumanji", "RESTAURANT", "Toshkent", 41.2956602, 69.2551760, { phone: "+998881334422" }),
  rp("Binafsha", "CAFE", "Toshkent", 41.3019551, 69.2651667, { outdoorSeating: true }),
  rp("Castlebar", "RESTAURANT", "Toshkent", 41.2857726, 69.2261323, { phone: "+998977726595", outdoorSeating: true }),
  rp("City Grill", "RESTAURANT", "Toshkent", 41.3222214, 69.2636443),
  rp("Doner House", "FAST_FOOD", "Toshkent", 41.3013572, 69.2896898, { delivery: true }),
  rp("Bellissimo", "FAST_FOOD", "Toshkent", 41.2915433, 69.3410039, { phone: "+998712036666" }),
  rp("Osiyo Grand", "RESTAURANT", "Toshkent", 41.3249886, 69.2637626),
  rp("Astoria", "RESTAURANT", "Toshkent", 41.3743441, 69.2880923),
  rp("Chak-Chak Bar", "BAR", "Toshkent", 41.3688504, 69.2865676, { phone: "+998712250620", is24h: true }),
  rp("Oftob", "RESTAURANT", "Toshkent", 41.3371811, 69.2553233),
  rp("Labi Haus", "RESTAURANT", "Toshkent", 41.2829683, 69.2671268),
  rp("Bella Napoli", "CAFE", "Toshkent", 41.2794052, 69.2474709, { phone: "+998712539183", wifi: true }),
  rp("Silk Road", "RESTAURANT", "Toshkent", 41.2974453, 69.2739067),
  rp("Xadra Milliy Taomlar", "RESTAURANT", "Toshkent", 41.3244499, 69.2446771, { phone: "+998712447138", halal: true }),
  rp("Rossini", "RESTAURANT", "Toshkent", 41.3272220, 69.2473631),
  rp("Guzar Choyxona", "TEA_HOUSE", "Toshkent", 41.3011987, 69.2582136),

  // ─────────────────────────── Samarkand ───────────────────────────
  rp("Sharq Shirinliklari", "DESSERT_SHOP", "Samarqand", 39.6567257, 66.9785755),
  rp("Art Cafe", "CAFE", "Samarqand", 39.6600631, 66.9803670),
  rp("Registan Café", "CAFE", "Samarqand", 39.6532330, 66.9751566, { phone: "+998917003663", wifi: true }),
  rp("Platan", "RESTAURANT", "Samarqand", 39.6575732, 66.9557418, { phone: "+998662338049", outdoorSeating: true }),
  rp("Old City Restaurant", "RESTAURANT", "Samarqand", 39.6481084, 66.9572651, { phone: "+998662338020" }),
  rp("Besh Chinor", "RESTAURANT", "Samarqand", 39.6590021, 66.9634950),
  rp("Magistr", "CAFE", "Samarqand", 39.6525700, 66.9616058, { phone: "+998902501551", wifi: true }),
  rp("Sharshara", "RESTAURANT", "Samarqand", 39.6655929, 66.9480467),
  rp("Shashlik.uz", "RESTAURANT", "Samarqand", 39.6607782, 66.9464543),
  rp("Restaurant Old City (Stari Grad)", "RESTAURANT", "Samarqand", 39.6530871, 66.9787306),
  rp("Chocolad Café", "DESSERT_SHOP", "Samarqand", 39.6803023, 66.9284257, { phone: "+998782100080", wifi: true }),
  rp("Oltin Samarkand", "RESTAURANT", "Samarqand", 39.6784409, 66.9401023),
  rp("Farhod", "CAFE", "Samarqand", 39.6793347, 66.9381293, { phone: "+998955070088" }),
  rp("CaffeINN", "COFFEE_SHOP", "Samarqand", 39.6746692, 66.9270396, { wifi: true }),
  rp("Fresco", "CAFE", "Samarqand", 39.6734181, 66.9262603, { phone: "+998902245555", wifi: true }),
  rp("Sadaf", "RESTAURANT", "Samarqand", 39.6542441, 66.9571456, { phone: "+998902827171" }),
  rp("Dari Kavkaza", "RESTAURANT", "Samarqand", 39.6467301, 66.9562815),
  rp("Karvon", "RESTAURANT", "Samarqand", 39.6805711, 66.9171686),

  // ─────────────────────────── Bukhara ───────────────────────────
  rp("Silk Road Tea House", "TEA_HOUSE", "Buxoro", 39.7750105, 64.4162909, { wifi: true }),
  rp("Minzifa", "RESTAURANT", "Buxoro", 39.7719830, 64.4192012),
  rp("Old Bukhara", "RESTAURANT", "Buxoro", 39.7739272, 64.4196375),
  rp("Boloi Hovuz Choyxonasi", "TEA_HOUSE", "Buxoro", 39.7770318, 64.4084411),
  rp("Osh Markazi (Plov Centre)", "CAFE", "Buxoro", 39.7695080, 64.4499258, { phone: "6113600" }),
  rp("Chinar", "RESTAURANT", "Buxoro", 39.7731190, 64.4234922, { outdoorSeating: true, wifi: true }),
  rp("Mavrigi", "RESTAURANT", "Buxoro", 39.7724537, 64.4169488, { wifi: true }),
  rp("Lagmonxona (Dilkor)", "RESTAURANT", "Buxoro", 39.7476741, 64.4226635, { halal: true }),
  rp("Temir's Restaurant", "RESTAURANT", "Buxoro", 39.7732001, 64.4187950, { phone: "+998934770621", wifi: true }),
  rp("Golden Dragon", "RESTAURANT", "Buxoro", 39.7629723, 64.4267626),
  rp("Sushi & Wok", "CAFE", "Buxoro", 39.7630230, 64.4307681, { phone: "+998934753737" }),
  rp("Julius Meinl", "COFFEE_SHOP", "Buxoro", 39.7747386, 64.4164406, { outdoorSeating: true }),
  rp("Amsterdam Terrace", "CAFE", "Buxoro", 39.7726401, 64.4174822),
  rp("Bon Bon", "CAFE", "Buxoro", 39.7719967, 64.4309479),
  rp("Bella Coffee House", "COFFEE_SHOP", "Buxoro", 39.7735498, 64.4304100),
  rp("Burger Club #1", "FAST_FOOD", "Buxoro", 39.7336110, 64.4335269, { phone: "+998934701928" }),
  rp("Dastarxan", "RESTAURANT", "Buxoro", 39.7602113, 64.4320427),
  rp("Uzbegim", "RESTAURANT", "Buxoro", 39.7412588, 64.4332876),

  // ─────────────────────────── Fergana ───────────────────────────
  rp("EVOS", "FAST_FOOD", "Farg'ona", 40.3855552, 71.7842725, { delivery: true }),
  rp("Nastarin Restaurant & Club", "RESTAURANT", "Farg'ona", 40.3746692, 71.7854058, { phone: "+998916644719" }),
  rp("Pizzeria #1", "FAST_FOOD", "Farg'ona", 40.3810517, 71.8037663, { phone: "+998954006783", delivery: true }),
  rp("Traktir Ostrov Sokrovish", "CAFE", "Farg'ona", 40.3863927, 71.7865511, { phone: "+998904068999", outdoorSeating: true, wifi: true }),
  rp("Emirates Cafe", "CAFE", "Farg'ona", 40.3833595, 71.7816401, { phone: "+998916700005" }),
  rp("Brown Sugar", "COFFEE_SHOP", "Farg'ona", 40.3784504, 71.7864704, { phone: "+998732440565", wifi: true }),
  rp("Rohat", "RESTAURANT", "Farg'ona", 40.3872904, 71.7847289, { wifi: true }),
  rp("Lagmon Markazi", "CAFE", "Farg'ona", 40.3813302, 71.7955471, { phone: "+998732449293" }),
  rp("Toshkent Milliy Taomlari", "CAFE", "Farg'ona", 40.3835607, 71.7818669),
  rp("Choyxona Husniddinaka", "TEA_HOUSE", "Farg'ona", 40.3591531, 71.8094445, { phone: "+998954018654" }),
  rp("Soy Boyi Choyxonasi", "TEA_HOUSE", "Farg'ona", 40.3598325, 71.8043422),
  rp("Kafe Shox", "CAFE", "Farg'ona", 40.3758420, 71.7839437),
  rp("Dadopizza", "FAST_FOOD", "Farg'ona", 40.3765337, 71.8063630),
  rp("Golden Chicken", "FAST_FOOD", "Farg'ona", 40.3676117, 71.7814946),
  rp("Yusuf Ota Osh Markazi", "CAFE", "Farg'ona", 40.3716421, 71.7659195),
  rp("Sadaf", "RESTAURANT", "Farg'ona", 40.3625128, 71.8461651),
  rp("Ozbegim Milliy Taomlar", "CAFE", "Farg'ona", 40.3826569, 71.7801476, { is24h: true }),
  rp("Palvon Shashlik", "CAFE", "Farg'ona", 40.4048095, 71.7786821),

  // ─────────────────────────── Khiva ───────────────────────────
  rp("Zarafshon", "CAFE", "Xiva", 41.3768872, 60.3604927, { outdoorSeating: true }),
  rp("Yasavul Boshi", "RESTAURANT", "Xiva", 41.3788787, 60.3601652),
  rp("Zuhra va Tohir", "RESTAURANT", "Xiva", 41.3821418, 60.3590606, { outdoorSeating: true }),
  rp("Fish Restaurant Khiva", "RESTAURANT", "Xiva", 41.3705000, 60.3748000),
  rp("Sofra Kafe", "RESTAURANT", "Xiva", 41.3781265, 60.3745445),
  rp("Restaurant Terrassa", "RESTAURANT", "Xiva", 41.3791490, 60.3592563),
  rp("Farrux Restaurant", "RESTAURANT", "Xiva", 41.3771090, 60.3586566),
  rp("Sultan", "RESTAURANT", "Xiva", 41.3764208, 60.3598445),
  rp("Caravan", "RESTAURANT", "Xiva", 41.3762402, 60.3587983, { outdoorSeating: true }),
  rp("Osh Markazi", "RESTAURANT", "Xiva", 41.3868241, 60.3593451),
  rp("Xon Saroy", "RESTAURANT", "Xiva", 41.3783619, 60.3748888),
  rp("Xon Somsa", "STREET_FOOD", "Xiva", 41.3889975, 60.3599673),
  rp("AIM Coffee", "COFFEE_SHOP", "Xiva", 41.3780783, 60.3671883),
  rp("Garage Burger", "FAST_FOOD", "Xiva", 41.3917445, 60.3641625, { wifi: true, outdoorSeating: true }),
  rp("Real Pizza", "FAST_FOOD", "Xiva", 41.3823720, 60.3619068, { phone: "+998914264447", delivery: true }),

  // ─────────────────────────── Nukus ───────────────────────────
  rp("Sonata", "CAFE", "Nukus", 42.4395938, 59.6393761, { phone: "+998612233106" }),
  rp("Urban", "FAST_FOOD", "Nukus", 42.4554634, 59.6094949, { phone: "+998913020101", halal: true, is24h: true }),
  rp("Falcone", "RESTAURANT", "Nukus", 42.4484071, 59.6153813, { phone: "+998956011400" }),
  rp("Cinnamon Coffee & Pastry", "COFFEE_SHOP", "Nukus", 42.4643432, 59.6117921, { phone: "+998977897789" }),
  rp("Shax Saray Milliy Tagamlar", "CAFE", "Nukus", 42.4450088, 59.6307056, { phone: "+998933677777" }),
  rp("Karat", "RESTAURANT", "Nukus", 42.4472167, 59.6186476, { phone: "+998905937775" }),
  rp("Edison", "RESTAURANT", "Nukus", 42.4450773, 59.6288155, { phone: "+998912679009", delivery: true }),
  rp("Premier Lounge", "FAST_FOOD", "Nukus", 42.4706339, 59.6163762, { phone: "+998973587007" }),
  rp("Vkus Vostoka", "CAFE", "Nukus", 42.4688109, 59.6084552, { phone: "+998612227200" }),
  rp("Fish House", "RESTAURANT", "Nukus", 42.4426331, 59.6472901, { phone: "+998910977838" }),
  rp("Silk Road Cafe & Turkish Food", "CAFE", "Nukus", 42.4670244, 59.6116151, { phone: "+998975085995" }),
  rp("Aral Shayxana", "TEA_HOUSE", "Nukus", 42.4611954, 59.6061176),
  rp("Kuksi House", "FAST_FOOD", "Nukus", 42.4641048, 59.6105855, { phone: "+998913010105" }),
  rp("Lazzet", "CAFE", "Nukus", 42.4483280, 59.6244438),
  rp("Sogdiana", "CAFE", "Nukus", 42.4590190, 59.6345335, { phone: "+998990955582" }),
];
