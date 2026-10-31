import { LegalCategory } from "./types";

// ============================================================
// Legal Categories
// ============================================================

export const LEGAL_CATEGORIES: LegalCategory[] = [
  {
    id: "labor",
    name_uz: "Mehnat huquqi",
    name_ru: "Трудовое право",
    description_uz: "Ish shartnomasi, ish haqi, ishdan bo'shatish, mehnat nizolari",
    description_ru: "Трудовой договор, зарплата, увольнение, трудовые споры",
    icon: "Briefcase",
    sort_order: 1,
  },
  {
    id: "family",
    name_uz: "Oila huquqi",
    name_ru: "Семейное право",
    description_uz: "Nikoh, ajralish, alimentlar, bolalar huquqlari",
    description_ru: "Брак, развод, алименты, права детей",
    icon: "Heart",
    sort_order: 2,
  },
  {
    id: "civil",
    name_uz: "Fuqarolik huquqi",
    name_ru: "Гражданское право",
    description_uz: "Fuqarolik shartnomalar, huquqlar va majburiyatlar",
    description_ru: "Гражданские договоры, права и обязанности",
    icon: "Users",
    sort_order: 3,
  },
  {
    id: "housing",
    name_uz: "Uy-joy huquqi",
    name_ru: "Жилищное право",
    description_uz: "Uy-joy sotib olish, ijara, uy-joy nizolari",
    description_ru: "Покупка жилья, аренда, жилищные споры",
    icon: "Home",
    sort_order: 4,
  },
  {
    id: "criminal",
    name_uz: "Jinoyat huquqi",
    name_ru: "Уголовное право",
    description_uz: "Jinoyat ishlari, himoya, jabrlanuvchi huquqlari",
    description_ru: "Уголовные дела, защита, права потерпевших",
    icon: "Shield",
    sort_order: 5,
  },
  {
    id: "administrative",
    name_uz: "Ma'muriy huquq",
    name_ru: "Административное право",
    description_uz: "Ma'muriy javobgarlik, jarima, davlat organlari bilan munosabat",
    description_ru: "Административная ответственность, штрафы, отношения с госорганами",
    icon: "Building2",
    sort_order: 6,
  },
  {
    id: "business",
    name_uz: "Tadbirkorlik huquqi",
    name_ru: "Предпринимательское право",
    description_uz: "Biznes ro'yxatdan o'tkazish, litsenziyalash, soliq",
    description_ru: "Регистрация бизнеса, лицензирование, налоги",
    icon: "TrendingUp",
    sort_order: 7,
  },
  {
    id: "property",
    name_uz: "Mulk huquqi",
    name_ru: "Право собственности",
    description_uz: "Ko'chmas mulk, meros, mulk nizolari",
    description_ru: "Недвижимость, наследство, имущественные споры",
    icon: "Key",
    sort_order: 8,
  },
  {
    id: "contract",
    name_uz: "Shartnoma huquqi",
    name_ru: "Договорное право",
    description_uz: "Shartnomalar tuzish, o'zgartirish, buzilish",
    description_ru: "Заключение, изменение, расторжение договоров",
    icon: "FileText",
    sort_order: 9,
  },
  {
    id: "tax",
    name_uz: "Soliq huquqi",
    name_ru: "Налоговое право",
    description_uz: "Soliq to'lash, deklaratsiya, soliq imtiyozlari",
    description_ru: "Налогообложение, декларации, налоговые льготы",
    icon: "Calculator",
    sort_order: 10,
  },
];

// ============================================================
// Uzbekistan Regions
// ============================================================

export const REGIONS = [
  { id: "tashkent_city", name_uz: "Toshkent shahri", name_ru: "Город Ташкент" },
  { id: "tashkent", name_uz: "Toshkent viloyati", name_ru: "Ташкентская область" },
  { id: "samarkand", name_uz: "Samarqand viloyati", name_ru: "Самаркандская область" },
  { id: "bukhara", name_uz: "Buxoro viloyati", name_ru: "Бухарская область" },
  { id: "fergana", name_uz: "Farg'ona viloyati", name_ru: "Ферганская область" },
  { id: "andijan", name_uz: "Andijon viloyati", name_ru: "Андижанская область" },
  { id: "namangan", name_uz: "Namangan viloyati", name_ru: "Наманганская область" },
  { id: "kashkadarya", name_uz: "Qashqadaryo viloyati", name_ru: "Кашкадарьинская область" },
  { id: "surkhandarya", name_uz: "Surxondaryo viloyati", name_ru: "Сурхандарьинская область" },
  { id: "jizzakh", name_uz: "Jizzax viloyati", name_ru: "Джизакская область" },
  { id: "syrdarya", name_uz: "Sirdaryo viloyati", name_ru: "Сырдарьинская область" },
  { id: "khorezm", name_uz: "Xorazm viloyati", name_ru: "Хорезмская область" },
  { id: "navoi", name_uz: "Navoiy viloyati", name_ru: "Навоийская область" },
  { id: "karakalpakstan", name_uz: "Qoraqalpog'iston Respublikasi", name_ru: "Республика Каракалпакстан" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

// ============================================================
// Consultation service formats
// ============================================================

export const SERVICE_FORMATS = [
  { id: "chat", name_uz: "Chat orqali", name_ru: "Через чат", icon: "MessageSquare" },
  { id: "video", name_uz: "Video qo'ng'iroq", name_ru: "Видеозвонок", icon: "Video" },
  { id: "audio", name_uz: "Audio qo'ng'iroq", name_ru: "Аудиозвонок", icon: "Phone" },
] as const;

// ============================================================
// Languages supported
// ============================================================

export const LANGUAGES = [
  { id: "uz", name_uz: "O'zbek", name_ru: "Узбекский" },
  { id: "ru", name_uz: "Rus", name_ru: "Русский" },
  { id: "en", name_uz: "Ingliz", name_ru: "Английский" },
  { id: "kk", name_uz: "Qozoq", name_ru: "Казахский" },
] as const;

// ============================================================
// Days of week
// ============================================================

export const DAYS_OF_WEEK = [
  { id: 0, name_uz: "Yakshanba", name_ru: "Воскресенье", short_uz: "Ya", short_ru: "Вс" },
  { id: 1, name_uz: "Dushanba", name_ru: "Понедельник", short_uz: "Du", short_ru: "Пн" },
  { id: 2, name_uz: "Seshanba", name_ru: "Вторник", short_uz: "Se", short_ru: "Вт" },
  { id: 3, name_uz: "Chorshanba", name_ru: "Среда", short_uz: "Cho", short_ru: "Ср" },
  { id: 4, name_uz: "Payshanba", name_ru: "Четверг", short_uz: "Pa", short_ru: "Чт" },
  { id: 5, name_uz: "Juma", name_ru: "Пятница", short_uz: "Ju", short_ru: "Пт" },
  { id: 6, name_uz: "Shanba", name_ru: "Суббота", short_uz: "Sha", short_ru: "Сб" },
] as const;

// ============================================================
// Platform defaults
// ============================================================

export const PLATFORM_COMMISSION_PERCENT = 15;
export const DEFAULT_CURRENCY = "UZS";
export const MIN_CONSULTATION_DURATION = 15;
export const MAX_CONSULTATION_DURATION = 120;

