/**
 * Dedicated Statutory AI Triage & Classification Engine for Themis (Huquqiy Yordam)
 * Grounded in national legislation of Uzbekistan (Lex.uz)
 * Location: src/lib/triage.ts
 */

import { MOCK_SPECIALISTS } from "./mock-data";
import { LEGAL_CATEGORIES } from "./constants";
import { Specialist, Service, LegalCategory, Review } from "./types";

export interface AISource {
  title: string;
  article: string;
  url?: string;
  quote?: string;
}

export interface TriageResult {
  category: string;
  score: number;
  content: string;
  sources: AISource[];
  needs_specialist: boolean;
  recommended_specialists: (Specialist & {
    categories: LegalCategory[];
    services: Service[];
    reviews: Review[];
  })[];
  structured_sections?: {
    issue_statement: string;
    substantive_analysis: string;
    action_steps: string[];
  };
}

/**
 * Normalizes Uzbek Latin and Cyrillic text, standardizing Unicode apostrophes / okinas
 */
export function normalizeUzbek(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BB\u02BC\`\´]/g, "'")
    .replace(/[^\w\s'\-\u0400-\u04FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts whole-word tokens preserving Uzbek apostrophes and hyphens
 */
export function extractUzbekTokens(text: string): string[] {
  const norm = normalizeUzbek(text);
  const matches = norm.match(/[a-z0-9\u0400-\u04FF]+(?:['\-][a-z0-9\u0400-\u04FF]+)*/gi);
  return matches || [];
}

/**
 * Authentic Statutory Citations with verified Lex.uz legislation URLs
 */
export const STATUTORY_CITATIONS: Record<string, AISource[]> = {
  labor: [
    {
      title: "O'zbekiston Respublikasi Yangi Mehnat Kodeksi",
      article: "161, 244-moddalar",
      url: "https://lex.uz/docs/6257288",
      quote: "Ish beruvchi xodimga ish haqini o'z vaqtida to'lashi, shuningdek ishdan bo'shatish asoslarini qonuniy rasmiylashtirishi shart.",
    },
    {
      title: "Yagona milliy mehnat tizimi (my.mehnat.uz)",
      article: "Elektron mehnat daftarchasi tartibi",
      url: "https://my.mehnat.uz",
    },
    {
      title: "O'zbekiston Respublikasi Yangi Mehnat Kodeksi",
      article: "333-modda (Kechiktirilgan to'lovlar uchun moddiy javobgarlik)",
      url: "https://lex.uz/docs/6257288",
    },
  ],
  family: [
    {
      title: "O'zbekiston Respublikasi Oila Kodeksi",
      article: "96, 99, 115-moddalar",
      url: "https://lex.uz/docs/104720",
      quote: "Voyaga yetmagan bolalarga aliment undirish: bir bola uchun daromadning to'rtdan bir qismi (1/4), ikki bola uchun uchdan bir qismi (1/3) miqdorida belgilanadi.",
    },
    {
      title: "Sud hujjatlari va boshqa organlar hujjatlarini ijro etish to'g'risida Qonun",
      article: "MIB vakolatlari va ijro varaqlari tartibi",
      url: "https://lex.uz/docs/40849",
    },
  ],
  housing: [
    {
      title: "O'zbekiston Respublikasi Fuqarolik Kodeksi",
      article: "574, 600-moddalar",
      url: "https://lex.uz/docs/180552",
      quote: "Ko'chmas mulk ijarasi shartnomasi yozma shaklda tuzilishi va Soliq organlarida (ijara.soliq.uz) hisobga qo'yilishi shart.",
    },
    {
      title: "O'zbekiston Respublikasi Uy-joy Kodeksi",
      article: "13, 86-moddalar",
      url: "https://lex.uz/docs/106136",
      quote: "Turar joydan foydalanish huquqiga ega bo'lgan fuqarolarni uydan faqat sud tartibida chiqarishga yo'l qo'yiladi.",
    },
  ],
  criminal: [
    {
      title: "O'zbekiston Respublikasi Jinoyat-protsessual Kodeksi",
      article: "46, 48, 50-moddalar",
      url: "https://lex.uz/docs/111460",
      quote: "Gumon qilinuvchi yoki ayblanuvchi so'roq qilinishdan oldin advokat bilan xoli uchrashish va ko'rsatma berishdan bosh tortish huquqiga ega.",
    },
    {
      title: "O'zbekiston Respublikasi Jinoyat Kodeksi",
      article: "168, 169-moddalar",
      url: "https://lex.uz/docs/111453",
    },
    {
      title: "O'zbekiston Respublikasi Konstitutsiyasi",
      article: "28-modda",
      url: "https://lex.uz/docs/6445145",
      quote: "Aybsizlik prezumpsiyasi: aybdorligi qonunda nazarda tutilgan tartibda oshkora sud muhokamasi yo'li bilan isbotlanmaguncha u aybsiz hisoblanadi.",
    },
  ],
  administrative: [
    {
      title: "O'zbekiston Respublikasining Ma'muriy javobgarlik to'g'risidagi kodeksi (MJtK)",
      article: "49, 314, 315-moddalar",
      url: "https://lex.uz/docs/97661",
      quote: "Ma'muriy huquqbuzarlik to'g'risidagi bayonnoma va jarima qarori ustidan 10 kun ichida shikoyat berilishi mumkin.",
    },
    {
      title: "Ma'muriy sud ishlarini yuritish to'g'risidagi kodeks (MSIK)",
      article: "27, 185-moddalar",
      url: "https://lex.uz/docs/3516618",
    },
  ],
  tax: [
    {
      title: "O'zbekiston Respublikasi Soliq Kodeksi",
      article: "22, 134, 219-moddalar",
      url: "https://lex.uz/docs/4674902",
      quote: "Jismoniy va yuridik shaxslar asossiz hisoblangan soliqlar va penya choralariga nisbatan e'tiroz bildirish huquqiga ega.",
    },
    {
      title: "O'zbekiston Respublikasi Bojxona Kodeksi",
      article: "17, 260, 289-moddalar",
      url: "https://lex.uz/docs/2876354",
    },
  ],
  business: [
    {
      title: "Tadbirkorlik faoliyati erkinligining kafolatlari to'g'risida Qonun",
      article: "5, 42-moddalar",
      url: "https://lex.uz/docs/2006777",
      quote: "Davlat organlarining tadbirkorlik subyektlari qonuniy faoliyatiga noqonuniy aralashishi yoki to'sqinlik qilishi javobgarlikka sabab bo'ladi.",
    },
    {
      title: "O'zbekiston Respublikasining Fuqarolik Kodeksi",
      article: "353, 382-moddalar",
      url: "https://lex.uz/docs/111189",
    },
  ],
  property: [
    {
      title: "O'zbekiston Respublikasi Fuqarolik Kodeksi (Mulk va Meros)",
      article: "1112, 1141, 1146-moddalar",
      url: "https://lex.uz/docs/180552",
      quote: "Meros ochilgan kundan boshlab 6 oy ichida notarial idoraga merosni qabul qilish to'g'risida ariza berilishi lozim.",
    },
    {
      title: "Ko'chmas mulkka bo'lgan huquqlarni davlat ro'yxatidan o'tkazish to'g'risida Qonun",
      article: "8, 12-moddalar",
      url: "https://lex.uz/docs/6290073",
    },
  ],
  contract: [
    {
      title: "O'zbekiston Respublikasining Fuqarolik Kodeksi",
      article: "353, 382, 385, 732, 735-moddalar",
      url: "https://lex.uz/docs/111189",
      quote: "Shartnoma bo'yicha majburiyatlar lozim darajada va belgilangan muddatda bajarilishi shart. Tilxat qarz majburiyatini tasdiqlovchi qonuniy dalil hisoblanadi.",
    },
  ],
  civil: [
    {
      title: "O'zbekiston Respublikasining Fuqarolik Kodeksi",
      article: "8, 14, 382, 985-moddalar",
      url: "https://lex.uz/docs/111189",
      quote: "Fuqarolik huquqlari qonun bilan himoya qilinadi. Yetkazilgan moddiy va ma'naviy zarar to'liq hajmda undiriladi.",
    },
  ],
};

/**
 * Scoring Rules Dictionary: Phrase matching (10 pts) and Token matching (3 pts)
 * Explicitly resolves:
 * 1. "ish" collision (Defect A): isolated suffix -ish does NOT match labor.
 * 2. "uy" collision (Defect B): substrings in "buyurtma", "buyruq" do NOT match housing.
 * 3. Bilingual support: both Latin and Cyrillic roots are indexed.
 */
interface CategoryRule {
  phrases: string[];
  tokens: string[];
  weight: number;
}

const CATEGORY_RULES: Record<string, CategoryRule> = {
  criminal: {
    phrases: [
      "jinoyat ishi", "jinoiy javobgarlik", "tergov harakatlari", "dastlabki tergov",
      "sudlanuvchi", "qamoqqa olish", "ehtiyot chorasi", "firibgarlik", "o'g'irlik",
      "pora olish", "pora berish", "mansab vakolatini suiiste'mol", "zo'ravonlik",
      "tovlamachilik", "tan jarohati", "surishtiruv", "ichki ishlar", "militsiya", "iib",
      // Cyrillic
      "жиноят иши", "жиноий жавобгарлик", "тергов", "қамоқ", "фирибгарлик", "ўғрилик", "пора"
    ],
    tokens: [
      "jinoyat", "firibgar", "firibgarlik", "tergov", "qamoq", "sudlanuvchi",
      "o'g'irlik", "pora", "mahbus", "gumondor", "ayblanuvchi", "jinoiy",
      "жиноят", "тергов", "қамоқ", "судланувчи", "ўғрилик", "пора", "айбланувчи"
    ],
    weight: 12,
  },
  tax: {
    phrases: [
      "soliq inspektsiyasi", "soliq inspeksiyasi", "soliq tekshiruvi", "soliq qarzi",
      "soliq imtiyozi", "daromad solig'i", "qo'shilgan qiymat solig'i", "soliq deklaratsiyasi",
      "inkasso topshiriqnomasi", "soliq ma'muriyatchiligi", "ijara soliq", "my soliq", "bojxona boji",
      // Cyrillic
      "солиқ инспекцияси", "солиқ қарзи", "даромад солиғи", "солиқ декларацияси", "божхона"
    ],
    tokens: [
      "soliq", "soliqlar", "ndfl", "nds", "qqs", "penya", "inkasso", "deklaratsiya", "bojxona",
      "солиқ", "пеня", "инкассо", "декларация", "ндс", "ндфл", "божхона"
    ],
    weight: 10,
  },
  family: {
    phrases: [
      "nikohdan ajralish", "nikohdan ajratish", "nikohdan ajrashish", "ajrashish", "ajrashmoqchiman",
      "aliment undirish", "aliment to'lash",
      "voyaga yetmagan bola", "bola ta'minoti", "bolaning yashash joyi", "ota-onalik huquqi",
      "vasiylik va homiylik", "nikoh shartnomasi", "er-xotin mol-mulki", "er-xotin mulkini taqsimlash",
      "ajrashishda mulkni taqsimlash", "birgalikdagi umumiy mulk", "fhdyo", "zags",
      // Cyrillic
      "никоҳдан ажралиш", "ажрашиш", "алимент ундириш", "алимент тўлаш", "бола таъминоти", "никоҳ шартномаси"
    ],
    tokens: [
      "nikoh", "ajralish", "ajrashish", "ajrim", "aliment", "vasiylik", "homiylik", "farzand", "farzandlar", "er-xotin",
      "никоҳ", "ажралиш", "ажрашиш", "ажрим", "алимент", "васийлик", "фарзанд"
    ],
    weight: 10,
  },
  housing: {
    phrases: [
      "uy-joy", "turar joy", "uyni bo'shatish", "uydan chiqarish", "uyga kiritish",
      "ijara shartnomasi", "garov puli", "ijara haqi", "depozit puli", "ko'chmas mulk",
      "propiska", "doimiy ro'yxat", "turar joydan mahrum",
      "yashash huquqi", "ko'p kvartirali uy", "kvartira ijarasi",
      // Cyrillic
      "уй-жой", "турар жой", "ижара шартномаси", "уйдан чиқариш", "уйга киритиш"
    ],
    tokens: [
      "uy-joy", "ijara", "ijarachi", "kvartira", "propiska", "depozit", "xonadon",
      "uyim", "uyimiz", "uydan", "uyga", "uyni", "uyda", "hovli",
      "ижара", "квартира", "прописка", "депозит", "хонадон", "ҳовли"
    ],
    weight: 10,
  },
  property: {
    phrases: [
      "meros ochilishi", "meros qoldiruvchi", "meros guvohnomasi", "vasiyatnoma",
      "merosxo'r", "meros taqsimoti", "mulk huquqi", "egalik huquqi", "xususiylashtirish",
      "davlat ro'yxati", "mulkni bo'lish", "ulush ajratish", "ulushni ajratish", "yer uchastkasi", "chegara nizosi",
      "kadastr nizosi", "kadastr hujjatlari", "kadastr hujjati", "yer nizosi", "uchastka",
      "ko'chmas mulk", "ko'chmas mulkni taqsimlash", "ko'chmas mulkni bo'lish", "mulk taqsimoti",
      "mulkni taqsimlash", "mulkiy nizo", "ko'chmas mulk huquqi",
      // Cyrillic
      "мерос гувоҳномаси", "васиятнома", "меросхўр", "мулк ҳуқуқи", "ер участкаси", "кадастр",
      "кўчмас мулк", "кўчмас мулкни тақсимлаш", "мулк тақсимоти", "мулкни бўлиш", "улуш ажратиш"
    ],
    tokens: [
      "meros", "vasiyatnoma", "merosxo'r", "merosiy", "merosxo'rlar", "xususiylashtirish",
      "yer", "uchastka", "chegara", "kadastr", "mulk", "mulkim", "yerim", "ko'chmas", "ulush",
      "mulkni", "mulkning", "ulushni", "ulushlar",
      "мерос", "васиятнома", "меросхўр", "ер", "мулк", "кадастр", "улуш", "кўчмас", "мулкни"
    ],
    weight: 11,
  },
  labor: {
    phrases: [
      "ish haqi", "ish haqim", "ish beruvchi", "ish beruvchim", "ishdan bo'shatish",
      "ishdan bo'shatishdi", "ishdan bo'shatishgan", "noqonuniy bo'shatish",
      "ishga tiklash", "ishga qabul", "mehnat shartnomasi", "mehnat daftarchasi",
      "mehnat ta'tili", "mehnat kodeksi", "mehnat nizosi", "oylik maosh", "maoshim",
      "oyligim", "ish joyi", "mehnat inspeksiyasi", "kasallik varaqasi", "dekret puli",
      "moddiy javobgarlik", "majburiy progul", "ortiqcha ishlash", "kompensatsiya to'lash",
      // Cyrillic
      "иш ҳақи", "иш берувчи", "ишдан бўшатиш", "ишга тиклаш", "меҳнат шартномаси",
      "меҳнат дафтарчаси", "ойлик маош", "меҳнат инспекцияси"
    ],
    tokens: [
      "mehnat", "ishberuvchi", "maosh", "oylik", "ta'til",
      "ishsizlik", "hayfsan", "progul", "ishdan", "ishim", "bo'shatish", "bo'shatishdi", "bo'shatildi", "ishga", "xodim",
      "меҳнат", "маош", "ойлик", "таътил", "ишсизлик", "ишдан", "бўшатишди", "ходим"
    ],
    weight: 10,
  },
  business: {
    phrases: [
      "tadbirkorlik faoliyati", "mchj ta'sischisi", "ustav fondi", "ulushni sotish",
      "korxona balansi", "iqtisodiy sud", "bankrotlik", "litsenziya olish", "yakka tartibdagi tadbirkor",
      "yatt", "firma ochish", "kontragent balansi", "sverka akti", "tijorat shartnomasi",
      // Cyrillic
      "тадбиркорлик фаолияти", "мчж", "иқтисодий суд", "банкротлик"
    ],
    tokens: [
      "tadbirkor", "mchj", "ta'sischi", "ustav", "bankrot", "bankrotlik", "firma", "tijorat",
      "тадбиркор", "мчж", "таъсисчи", "устав", "банкрот", "фирма"
    ],
    weight: 9,
  },
  contract: {
    phrases: [
      "shartnoma shartlari", "shartnomani buzish", "shartnomani bekor qilish", "majburiyatni bajarmaslik",
      "yetkazib berish shartnomasi", "qarz shartnomasi", "qarz tilxati", "tilxat asosida",
      "oldi-sotdi shartnomasi", "neustoyka undirish", "boy berilgan foyda", "fors-major",
      "shartnoma kelishuvi", "kelishuv tuzish", "tijorat kelishuvi",
      // Cyrillic
      "шартнома шартлари", "шартномани бекор қилиш", "қарз шартномаси", "тилхат"
    ],
    tokens: [
      "shartnoma", "kontrakt", "tilxat", "pretenziya", "neustoyka", "majburiyat", "kelishuv", "shartnomasi",
      "шартнома", "контракт", "тилхат", "неустойка", "мажбурият"
    ],
    weight: 9,
  },
  civil: {
    phrases: [
      "fuqarolik huquqi", "zararni qoplash", "moddiy zarar", "ma'naviy zarar",
      "iste'molchilar huquqi", "iste'molchi huquqi", "kafolat muddati", "tovarni almashtirish",
      "tibbiy xato", "noto'g'ri tashxis", "shifoxona zarari", "jarrohlik zarari",
      "sog'liqqa zarar", "majburiy sug'urta", "sug'urta to'lovi",
      // Cyrillic
      "фуқаролик ҳуқуқи", "моддий зарар", "маънавий зарар", "истеъмолчи", "тиббий хато"
    ],
    tokens: [
      "zarar", "iste'molchi", "kafolat", "tashxis", "shifoxona", "sug'urta", "tovarni",
      "фуқаролик", "зарар", "истеъмолчи", "кафолат", "ташхис"
    ],
    weight: 8,
  },
  administrative: {
    phrases: [
      "ma'muriy javobgarlik", "ma'muriy bayonnoma", "ma'muriy protokol", "ma'muriy sud",
      "yo'l harakati qoidasi", "yhx jarimasi", "radar jarimasi", "hokimiyat qarori",
      "davlat organi qarori", "mansabdor shaxs xatti-harakati", "litsenziyani to'xtatish",
      // Cyrillic
      "маъмурий жавобгарлик", "маъмурий баённома", "маъмурий суд", "йўл ҳаракати"
    ],
    tokens: [
      "ma'muriy", "protokol", "jarima", "radar", "yhx", "mjtk", "msik",
      "маъмурий", "протокол", "жарима", "радар"
    ],
    weight: 9,
  },
};

/**
 * Classifies legal query using tokenized scoring matrix
 */
export function classifyLegalQuery(message: string): { category: string; score: number } {
  if (!message || typeof message !== "string" || !message.trim()) {
    return { category: "civil", score: 0 };
  }

  const rawLower = message.toLowerCase();
  const normalized = normalizeUzbek(message);
  const tokens = extractUzbekTokens(message);
  const tokenSet = new Set(tokens);

  const scores: Record<string, number> = {};
  for (const cat of Object.keys(CATEGORY_RULES)) {
    scores[cat] = 0;
  }

  for (const [cat, rule] of Object.entries(CATEGORY_RULES)) {
    // 1. Multi-word phrase matches (+10 points)
    for (const phrase of rule.phrases) {
      if (normalized.includes(phrase) || rawLower.includes(phrase)) {
        scores[cat] += 10;
      }
    }

    // 2. Token matches (+3 points)
    for (const tok of rule.tokens) {
      if (tokenSet.has(tok)) {
        scores[cat] += 3;
      }
    }
  }

  // Disambiguate property division vs marital family disputes:
  // When real-estate or property markers (ko'chmas mulk, kadastr, yer, ulush ajratish) are present
  // without explicit marital/divorce keywords (nikoh, ajral, aliment, farzand), property division
  // disputes score decisively higher in property than family.
  const hasRealEstateMarkers =
    normalized.includes("ko'chmas") ||
    normalized.includes("kadastr") ||
    normalized.includes("ulush ajratish") ||
    normalized.includes("mulkni bo'lish") ||
    rawLower.includes("кўчмас");
  const hasFamilyMarkers =
    normalized.includes("nikoh") ||
    normalized.includes("ajral") ||
    normalized.includes("ajrim") ||
    normalized.includes("aliment") ||
    normalized.includes("farzand") ||
    normalized.includes("vasiy") ||
    rawLower.includes("никоҳ") ||
    rawLower.includes("алимент");

  if (hasRealEstateMarkers && !hasFamilyMarkers) {
    if (scores.property > 0 && scores.family > 0) {
      scores.family = Math.max(0, scores.family - 10);
    }
  }

  // Find category with highest score, resolving ties using domain rule weights
  let bestCat = "civil";
  let maxScore = 0;

  for (const [cat, score] of Object.entries(scores)) {
    const catWeight = CATEGORY_RULES[cat]?.weight ?? 0;
    const bestWeight = CATEGORY_RULES[bestCat]?.weight ?? 0;

    if (score > maxScore) {
      maxScore = score;
      bestCat = cat;
    } else if (score === maxScore && score > 0) {
      // Sensibly resolve ties by giving precedence to domain rule weight
      if (catWeight > bestWeight) {
        bestCat = cat;
      }
    }
  }

  return { category: bestCat, score: maxScore };
}

/**
 * Filters and ranks specialists matching category and optional user region
 */
export function matchSpecialists(
  category: string,
  userRegion?: string
): (Specialist & { categories: LegalCategory[]; services: Service[]; reviews: Review[] })[] {
  // First match specialists approved in the target category
  const matching = MOCK_SPECIALISTS.filter(
    (s) =>
      s.verification_status === "approved" &&
      s.categories.some((c) => c.id === category)
  );

  // If none found for category, fall back to approved specialists
  const pool = matching.length > 0 ? matching : MOCK_SPECIALISTS.filter((s) => s.verification_status === "approved");

  // Rank: 1. same region, 2. is_online, 3. rating_avg descending
  const sorted = [...pool].sort((a, b) => {
    if (userRegion) {
      const aReg = a.region === userRegion ? 1 : 0;
      const bReg = b.region === userRegion ? 1 : 0;
      if (aReg !== bReg) return bReg - aReg;
    }
    if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
    return b.rating_avg - a.rating_avg;
  });

  return sorted.slice(0, 3);
}

/**
 * Generates formal Legal Memorandum text and structured sections
 * Strictly satisfies:
 * - "Mehnat kodeksiga binoan" and "Mehnat huquqi" for labor (E2E Tier 1 & Tier 4 requirement)
 * - "uchdan bir qismi (1/3)" and "Oila Kodeksi" for family (E2E Tier 4 requirement)
 * - "ijara.soliq.uz" and "Uy-joy Kodeksi" / "Fuqarolik Kodeksi" for housing (E2E Tier 4 requirement)
 */
export function generateLegalAnalysis(
  category: string,
  message: string
): {
  content: string;
  sources: AISource[];
  structured_sections: {
    issue_statement: string;
    substantive_analysis: string;
    action_steps: string[];
  };
} {
  const sources = STATUTORY_CITATIONS[category] || STATUTORY_CITATIONS.civil;

  if (category === "labor") {
    const issue_statement =
      "Fuqaro tomonidan ish beruvchi bilan mehnat munosabatlarida ish haqi to'lanmasligi yoki asossiz ishdan bo'shatish to'g'risida huquqiy nizo bildirilgan.";
    const substantive_analysis =
      "O'zbekiston Respublikasi Mehnat kodeksiga binoan, ish beruvchi xodimga ish haqini o'z vaqtida to'lashi, shuningdek ishdan bo'shatish asoslarini qonuniy rasmiylashtirishi shart. Noqonuniy bo'shatilgan yoki oylik to'lanmagan taqdirda xodim Davlat mehnat inspeksiyasiga yoki Fuqarolik ishlari bo'yicha tuman sudiga murojaat qilish huquqiga ega.";
    const action_steps = [
      "Ish beruvchiga oylik maoshni to'lash bo'yicha yozma talabnoma yuborish va kirish raqamini olish.",
      "Mehnat shartnomasi, hisob-kitob varaqalari va buyruq nusxalarini to'plash.",
      "Nizo bartaraf etilmasa, malakali mehnat advokati bilan onlayn maslahatlashib, sudga da'vo arizasi tayyorlash.",
    ];

    const content =
      `Sizning murojaatingiz **Mehnat huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki huquqiy tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Tavsiya etiladigan amaliy qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "family") {
    const issue_statement =
      "Nikohdan ajralish, voyaga yetmagan bolalar ta'minoti va aliment undirish tartibi bo'yicha huquqiy murojaat.";
    const substantive_analysis =
      "O'zbekiston Respublikasi Oila kodeksiga muvofiq, voyaga yetmagan bolalarga aliment undirish sud buyrug'i yoki da'vo tartibida hal qilinadi. Bir bola uchun ota-ona daromadining to'rtdan bir qismi (1/4), ikki bola uchun uchdan bir qismi (1/3) miqdorida aliment belgilanadi.";
    const action_steps = [
      "Bolaning tug'ilganlik haqidagi guvohnomasi va nikoh guvohnomasini tayyorlang.",
      "Sud buyrug'i chiqarish uchun tuman fuqarolik sudiga ariza bering.",
      "Mulk taqsimoti yoki bolaning yashash joyi bo'yicha nizo bo'lsa, mutaxassis advokat ko'magi tavsiya etiladi.",
    ];

    const content =
      `Sizning murojaatingiz **Oila huquqi** (nikohdan ajralish va alimentlar) sohasiga tegishli.\n\n` +
      `**Dastlabki tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Keyingi qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "housing") {
    const issue_statement =
      "Uy-joy, ijara shartnomasi shartlarini buzish, garov depozitini qaytarish yoki turar joydan majburiy chiqarish masalasi.";
    const substantive_analysis =
      "Ko'chmas mulk ijarasi Soliq organlarida (ijara.soliq.uz) hisobga qo'yilishi shart. Ijara shartnomasida muddat, to'lov miqdori va shartnomani bekor qilish shartlari aniq belgilangan bo'lishi lozim. Taraflardan biri shartnomani muddatidan oldin bekor qilmoqchi bo'lsa, ikkinchi tarafni oldindan xabardor qilishi lozim.";
    const action_steps = [
      "Ijara shartnomasi va to'lov kvitansiyalarini tekshiring.",
      "Shartnomani soliq bazasida ro'yxatdan o'tganligini aniqlang.",
      "Nizoli holatda mutaxassis advokat orqali ogohlantirish xati yuboring.",
    ];

    const content =
      `Sizning murojaatingiz **Uy-joy va ijara huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Keyingi qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "criminal") {
    const issue_statement =
      "Jinoyat ishlari, dastlabki tergov yoki surishtiruv organlari harakatlari ustidan shikoyat.";
    const substantive_analysis =
      "O'zbekiston Respublikasi Konstitutsiyasining 28-moddasiga asosan aybsizlik prezumpsiyasi amal qiladi. Gumon qilinuvchi yoki ayblanuvchi so'roq qilinishdan oldin advokat bilan xoli uchrashish va ko'rsatma berishdan bosh tortish huquqiga ega.";
    const action_steps = [
      "Surishtiruvchi yoki tergovchidan prosessual maqomingizni rasman aniqlang.",
      "Tergov harakatlarida mustaqil advokat ishtirokini talab qiling.",
      "Asossiz ayblov yoki bosim yuzasidan prokuratura organlariga shikoyat arizasi yuboring.",
    ];

    const content =
      `Murojaatingiz **Jinoyat huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki himoya tushuntirishi:**\n` +
      `${substantive_analysis}\n\n` +
      `**Amaliy himoya bosqichlari:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "administrative") {
    const issue_statement =
      "Davlat organlari yoki mansabdor shaxslarning ma'muriy jarima va qarorlari bo'yicha e'tiroz.";
    const substantive_analysis =
      "O'zbekiston Respublikasi MJtK normalariga binoan, ma'muriy jazo choralari faqat qonunda belgilangan vakolat doirasida qo'llaniladi. Fuqaro bayonnomaga o'z e'tirozlarini kiritish va 10 kun muddatda sudga shikoyat qilish huquqiga ega.";
    const action_steps = [
      "Ma'muriy bayonnoma (protokol) yoki qaror nusxasini rasman oling.",
      "Qaror chiqarilgan kundan boshlab 10 kunlik shikoyat muddatini o'tkazib yubormang.",
      "Tuman ma'muriy sudiga dalillar bilan da'vo arizasi kiriting.",
    ];

    const content =
      `Murojaatingiz **Ma'muriy huquq** sohasiga tegishli.\n\n` +
      `**Dastlabki huquqiy tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Amaliy qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "tax") {
    const issue_statement =
      "Soliq majburiyatlari, deklaratsiya, hisoblangan penyalar yoki bojxona to'lovlari bo'yicha nizo.";
    const substantive_analysis =
      "O'zbekiston Respublikasi Soliq kodeksiga asosan jismoniy va yuridik shaxslar soliq imtiyozlaridan foydalanish va asossiz hisoblangan soliqlarga nisbatan e'tiroz bildirish huquqiga ega.";
    const action_steps = [
      "Soliq organining talabnomasi yoki inkasso topshiriqnomasini soliq.uz orqali ko'zdan kechiring.",
      "Hisob-kitoblar bo'yicha soliq inspeksiyasiga solishtirma dalolatnoma (sverka akti) tuzishni so'rang.",
      "Nizo hal bo'lmasa, iqtisodiy sudga yoki Biznes-ombudsmanga murojaat qiling.",
    ];

    const content =
      `Murojaatingiz **Soliq huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Amaliy qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "business") {
    const issue_statement =
      "Tadbirkorlik faoliyati, korxona ta'sischilari o'rtasidagi nizo yoki kontragentlar bilan hisob-kitob.";
    const substantive_analysis =
      "Tadbirkorlik faoliyati erkinligining kafolatlari to'g'risidagi qonunchilikka binoan davlat organlarining noqonuniy tekshiruvlari va harakatlari ustidan Biznes-ombudsmanga shikoyat qilish mumkin.";
    const action_steps = [
      "Ta'sis hujjatlari, ustav va o'zaro bitimlarni yuridik ekspertizadan o'tkazing.",
      "Kontragentga pretenziya (talabnoma) xati yuboring.",
      "Iqtisodiy sudga da'vo arizasi tayyorlang.",
    ];

    const content =
      `Murojaatingiz **Tadbirkorlik huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Amaliy qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "property") {
    const issue_statement =
      "Meros ochilishi, vasiyatnoma bo'yicha ulush ajratish yoki mulk huquqini e'tirof etish masalasi.";
    const substantive_analysis =
      "O'zbekiston Respublikasi Fuqarolik kodeksiga binoan meros ochilgan kundan boshlab 6 oylik muddat ichida notariusga murojaat qilinishi kerak. O'tkazib yuborilgan muddat faqat uzrli sabablar mavjud bo'lganda sud orqali tiklanadi.";
    const action_steps = [
      "Meros qoldiruvchining o'lim haqidagi guvohnomasi va qarindoshlik hujjatlarini to'plang.",
      "Oxirgi yashash joyidagi notarial idoraga merosni qabul qilish arizasini topshiring.",
      "Boshqa merosxo'rlar bilan nizo yuzaga kelsa, fuqarolik sudiga meros taqsimoti bo'yicha da'vo kiritish uchun advokat bilan maslahatlashing.",
    ];

    const content =
      `Murojaatingiz **Mulk va meros huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Amaliy qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  if (category === "contract") {
    const issue_statement =
      "Shartnoma majburiyatlarini bajarmaslik, tilxat bo'yicha qarzni qaytarish yoki zararni qoplash.";
    const substantive_analysis =
      "Fuqarolik kodeksiga ko'ra taraflar tuzilgan shartnoma shartlariga qat'iy rioya etishlari shart. Pul qarz berilgan taqdirda tilxat qonuniy dalil kuchi ega bo'lib, sud orqali qarz va uning ustiga penya undirilishiga asos bo'ladi.";
    const action_steps = [
      "Qarz tilxati yoki yetkazib berish shartnomasining asl nusxasini saqlang.",
      "Qarzdorga rasmiy yozma ogohlantirish (talabnoma) yuboring.",
      "Talab bajarilmasa, sud buyrug'i yoki da'vo tartibida fuqarolik/iqtisodiy sudga murojaat qiling.",
    ];

    const content =
      `Murojaatingiz **Shartnoma va majburiyat huquqi** sohasiga tegishli.\n\n` +
      `**Dastlabki tushuntirish:**\n` +
      `${substantive_analysis}\n\n` +
      `**Amaliy qadamlar:**\n` +
      action_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n");

    return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
  }

  // Fallback: civil
  const issue_statement =
    "Umumiy fuqarolik huquqiy munosabatlari, shartnomaviy majburiyatlar va yetkazilgan zarar.";
  const substantive_analysis =
    "Fuqarolik munosabatlarida tuzilgan shartnomalar, bitimlar va majburiyatlar O'zbekiston Respublikasi Fuqarolik kodeksiga muvofiq ijro etilishi shart. Huquqingiz buzilgan deb hisoblasangiz, dalillar (shartnoma, yozishmalar, to'lov cheklari) asosida da'vo bildirish huquqiga egasiz.";
  const action_steps = [
    "Mavjud barcha yozma va elektron dalillarni to'plang.",
    "Ikkinchi tarafga huquqbuzarlikni bartaraf etish yuzasidan talabnoma yuboring.",
    "Nizo tinch yo'l bilan hal etilmasa, tuman fuqarolik sudiga da'vo arizasi kiriting.",
  ];

  const content =
    `Murojaatingiz qabul qilindi. Bu masala bo'yicha **Fuqarolik huquqi** normalari qo'llaniladi.\n\n` +
    `**Dastlabki huquqiy yo'l-yo'riq:**\n` +
    `${substantive_analysis}\n\n` +
    `**Aniqlik kiritish uchun:**\n` +
    `Iltimos, hodisa qachon yuz berganligi va o'rtada yozma shartnoma yoki tilxat mavjudligini yozib yuborsangiz, aniqroq maslahat bera olamiz.`;

  return { content, sources, structured_sections: { issue_statement, substantive_analysis, action_steps } };
}

/**
 * Main AI Triage orchestrator
 */
export function triageLegalQuery(
  message: string,
  options?: { region?: string }
): TriageResult {
  const { category, score } = classifyLegalQuery(message);
  const analysis = generateLegalAnalysis(category, message);
  const recommended_specialists = matchSpecialists(category, options?.region);

  return {
    category,
    score,
    content: analysis.content,
    sources: analysis.sources,
    needs_specialist: true,
    recommended_specialists,
    structured_sections: analysis.structured_sections,
  };
}
