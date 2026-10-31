/**
 * E2E Test Harness & Domain State Simulator
 * Platform: Themis (Huquqiy Yordam) — Uzbekistan Legal Consultation Platform
 * 
 * Provides:
 * - Standalone HTTP test server for `/api/ai/chat` (ephemeral port)
 * - Authoritative domain constants and mock datasets
 * - Domain state machine simulators for Auth, Catalog, Booking, Chat, Admin, Escrow
 * - Assertions and validation helpers
 */

import http from "node:http";
import assert from "node:assert/strict";

// ============================================================
// Authoritative Domain Constants (Lex.uz & System Specifications)
// ============================================================

export const LEGAL_CATEGORIES = [
  { id: "labor", name_uz: "Mehnat huquqi", name_ru: "Трудовое право", sort_order: 1 },
  { id: "family", name_uz: "Oila huquqi", name_ru: "Семейное право", sort_order: 2 },
  { id: "civil", name_uz: "Fuqarolik huquqi", name_ru: "Гражданское право", sort_order: 3 },
  { id: "housing", name_uz: "Uy-joy huquqi", name_ru: "Жилищное право", sort_order: 4 },
  { id: "criminal", name_uz: "Jinoyat huquqi", name_ru: "Уголовное право", sort_order: 5 },
  { id: "administrative", name_uz: "Ma'muriy huquq", name_ru: "Административное право", sort_order: 6 },
  { id: "business", name_uz: "Tadbirkorlik huquqi", name_ru: "Предпринимательское право", sort_order: 7 },
  { id: "property", name_uz: "Mulk huquqi", name_ru: "Право собственности", sort_order: 8 },
  { id: "contract", name_uz: "Shartnoma huquqi", name_ru: "Договорное право", sort_order: 9 },
  { id: "tax", name_uz: "Soliq huquqi", name_ru: "Налоговое право", sort_order: 10 },
];

export const REGIONS = [
  { id: "tashkent_city", name_uz: "Toshkent shahri" },
  { id: "tashkent", name_uz: "Toshkent viloyati" },
  { id: "samarkand", name_uz: "Samarqand viloyati" },
  { id: "bukhara", name_uz: "Buxoro viloyati" },
  { id: "fergana", name_uz: "Farg'ona viloyati" },
  { id: "andijan", name_uz: "Andijon viloyati" },
  { id: "namangan", name_uz: "Namangan viloyati" },
  { id: "kashkadarya", name_uz: "Qashqadaryo viloyati" },
  { id: "surkhandarya", name_uz: "Surxondaryo viloyati" },
  { id: "jizzakh", name_uz: "Jizzax viloyati" },
  { id: "syrdarya", name_uz: "Sirdaryo viloyati" },
  { id: "khorezm", name_uz: "Xorazm viloyati" },
  { id: "navoi", name_uz: "Navoiy viloyati" },
  { id: "karakalpakstan", name_uz: "Qoraqalpog'iston Respublikasi" },
];

export const PLATFORM_COMMISSION_PERCENT = 15;
export const DEFAULT_CURRENCY = "UZS";
export const MIN_CONSULTATION_DURATION = 15;
export const MAX_CONSULTATION_DURATION = 120;

// ============================================================
// Authoritative Mock Specialists Dataset
// ============================================================

export const MOCK_SPECIALISTS = [
  {
    id: "spec-1",
    user_id: "user-spec-1",
    full_name: "Azizbek Rahimov",
    phone: "+998 90 123 45 67",
    email: "azizbek.r@themis.uz",
    bio: "Oliy toifali advokat. Mehnat nizolari, ishdan asossiz bo'shatish va oylik maosh masalalarida 9 yillik muvaffaqiyatli amaliyotga egaman.",
    region: "tashkent_city",
    languages: ["uz", "ru"],
    experience_years: 9,
    education: "Yurisprudensiya magistri",
    university: "Toshkent Davlat Yuridik Universiteti",
    graduation_year: 2015,
    verification_status: "approved",
    license_number: "#ADV-1082",
    is_online: true,
    rating_avg: 4.9,
    rating_count: 38,
    consultation_count: 52,
    categories: [LEGAL_CATEGORIES[0], LEGAL_CATEGORIES[2]], // labor, civil
    services: [
      {
        id: "serv-1",
        specialist_id: "spec-1",
        name: "Tezkor 15 daqiqalik maslahat",
        duration_minutes: 15,
        price: 70000,
        currency: "UZS",
        format: "chat",
        is_active: true,
      },
      {
        id: "serv-2",
        specialist_id: "spec-1",
        name: "To'liq 45 daqiqalik onlayn konsultatsiya",
        duration_minutes: 45,
        price: 180000,
        currency: "UZS",
        format: "video",
        is_active: true,
      },
    ],
    reviews: [
      { id: "rev-1", rating: 5, comment: "Ish beruvchim bilan nizoni juda tez va aniq tushuntirib berdilar.", specialist_reply: "Arzimaydi!" },
      { id: "rev-2", rating: 5, comment: "Mehnat shartnomasidagi noqonuniy bandlarni ko'rsatib berdilar.", specialist_reply: null },
    ],
  },
  {
    id: "spec-2",
    user_id: "user-spec-2",
    full_name: "Dilnoza Karimova",
    phone: "+998 91 987 65 43",
    email: "dilnoza.k@themis.uz",
    bio: "Oila huquqi va nikoh shartnomalari bo'yicha yurist-ekspert. Bolalar manfaati va mulkni taqsimlashda tinch kelishuv asosida yechim topishga ixtisoslashganman.",
    region: "samarkand",
    languages: ["uz", "ru", "en"],
    experience_years: 7,
    education: "Huquqshunos bakalavr",
    university: "Jahon Iqtisodiyoti va Diplomatiya Universiteti (JIDU)",
    graduation_year: 2017,
    verification_status: "approved",
    license_number: "#ADV-3490",
    is_online: true,
    rating_avg: 4.8,
    rating_count: 24,
    consultation_count: 35,
    categories: [LEGAL_CATEGORIES[1], LEGAL_CATEGORIES[7]], // family, property
    services: [
      {
        id: "serv-3",
        specialist_id: "spec-2",
        name: "Oila va aliment masalalari bo'yicha konsultatsiya",
        duration_minutes: 30,
        price: 120000,
        currency: "UZS",
        format: "video",
        is_active: true,
      },
    ],
    reviews: [
      { id: "rev-3", rating: 5, comment: "Juda xushmuomala va o'z ishining ustasi.", specialist_reply: null },
    ],
  },
  {
    id: "spec-3",
    user_id: "user-spec-3",
    full_name: "Rustam Mahmudov",
    phone: "+998 93 456 78 90",
    email: "rustam.m@themis.uz",
    bio: "Uy-joy, ko'chmas mulk oldi-sotdisi va ijara shartnomalari bo'yicha ixtisoslashgan advokat. Qurilish va kadastr nizolarida amaliy yordam.",
    region: "tashkent_city",
    languages: ["uz"],
    experience_years: 12,
    education: "Yuridik fanlar bo'yicha falsafa doktori (PhD)",
    university: "Toshkent Davlat Yuridik Universiteti",
    graduation_year: 2012,
    verification_status: "approved",
    license_number: "#ADV-4921",
    is_online: false,
    rating_avg: 4.95,
    rating_count: 62,
    consultation_count: 89,
    categories: [LEGAL_CATEGORIES[3], LEGAL_CATEGORIES[8]], // housing, contract
    services: [
      {
        id: "serv-4",
        specialist_id: "spec-3",
        name: "Ko'chmas mulk shartnomasini ekspertiza qilish",
        duration_minutes: 60,
        price: 250000,
        currency: "UZS",
        format: "video",
        is_active: true,
      },
    ],
    reviews: [],
  },
  {
    id: "spec-4",
    user_id: "user-spec-4",
    full_name: "Javohir To'rayev",
    phone: "+998 97 111 22 33",
    email: "javohir.t@themis.uz",
    bio: "Jinoyat va ma'muriy huquq bo'yicha himoyachi advokat. Huquqni muhofaza qiluvchi organlar bilan munosabatlar va surishtiruv jarayonlarida professional himoya.",
    region: "fergana",
    languages: ["uz", "ru"],
    experience_years: 15,
    education: "Yurisprudensiya magistri",
    university: "Toshkent Davlat Yuridik Universiteti",
    graduation_year: 2009,
    verification_status: "approved",
    license_number: "#ADV-0812",
    is_online: true,
    rating_avg: 4.75,
    rating_count: 45,
    consultation_count: 68,
    categories: [LEGAL_CATEGORIES[4], LEGAL_CATEGORIES[5]], // criminal, administrative
    services: [
      {
        id: "serv-5",
        specialist_id: "spec-4",
        name: "Jinoyat ishi bo'yicha tezkor tahlil va himoya",
        duration_minutes: 45,
        price: 200000,
        currency: "UZS",
        format: "audio",
        is_active: true,
      },
    ],
    reviews: [],
  },
  {
    id: "spec-5",
    user_id: "user-spec-5",
    full_name: "Shahnoza Alimova",
    phone: "+998 94 333 44 55",
    email: "shahnoza.a@themis.uz",
    bio: "Tadbirkorlik va soliq huquqi bo'yicha maslahatchi. Korxonalarni ro'yxatga olish, litsenziyalash, soliq auditlari va xalqaro shartnomalar tuzish bo'yicha mutaxassis.",
    region: "bukhara",
    languages: ["uz", "ru", "en"],
    experience_years: 8,
    education: "Xalqaro tijorat huquqi magistri (LLM)",
    university: "Vestminster Xalqaro Universiteti (WIUT)",
    graduation_year: 2016,
    verification_status: "pending", // Pending admin verification
    license_number: "#ADV-9920",
    is_online: false,
    rating_avg: 4.6,
    rating_count: 15,
    consultation_count: 22,
    categories: [LEGAL_CATEGORIES[6], LEGAL_CATEGORIES[9]], // business, tax
    services: [
      {
        id: "serv-6",
        specialist_id: "spec-5",
        name: "Biznesni soliqqa tortish va audit maslahati",
        duration_minutes: 60,
        price: 300000,
        currency: "UZS",
        format: "video",
        is_active: true,
      },
    ],
    reviews: [],
  },
];

// ============================================================
// Core Statutory Triage Engine (Direct implementation of /api/ai/chat)
// ============================================================

export function processAiTriage(payload) {
  const { message, conversation_id, history = [] } = payload || {};

  if (!message || typeof message !== "string" || message.trim() === "") {
    return {
      status: 400,
      data: { error: "Xabar matni kiritilmadi" },
    };
  }

  const lower = message.toLowerCase();
  let category = "civil";
  let content = "";
  let sources = [];
  let needs_specialist = true;

  if (
    lower.includes("ish") ||
    lower.includes("maosh") ||
    lower.includes("bo'shat") ||
    lower.includes("mehnat") ||
    lower.includes("ta'til")
  ) {
    category = "labor";
    content =
      "Sizning murojaatingiz **Mehnat huquqi** sohasiga tegishli.\n\n" +
      "**Dastlabki huquqiy tushuntirish:**\n" +
      "O'zbekiston Respublikasi Mehnat kodeksiga binoan, ish beruvchi xodimga ish haqini o'z vaqtida to'lashi, shuningdek ishdan bo'shatish asoslarini qonuniy rasmiylashtirishi shart. Noqonuniy bo'shatilgan yoki oylik to'lanmagan taqdirda xodim Davlat mehnat inspeksiyasiga yoki Fuqarolik ishlari bo'yicha tuman sudiga murojaat qilish huquqiga ega.\n\n" +
      "**Tavsiya etiladigan amaliy qadamlar:**\n" +
      "1. Ish beruvchiga yozma ariza yoki talabnoma yuboring va arizaning nusxasini o'zingizda saqlang.\n" +
      "2. Mehnat shartnomasi va buyruq nusxalarini to'plang.\n" +
      "3. Nizo bartaraf etilmasa, malakali mehnat advokati bilan onlayn maslahatlashib, sudga da'vo arizasi tayyorlang.";
    sources = [
      { title: "O'zbekiston Respublikasi Yangi Mehnat Kodeksi", article: "161, 244-moddalar" },
      { title: "Yagona milliy mehnat tizimi (my.mehnat.uz)", article: "Elektron mehnat daftarchasi tartibi" },
    ];
  } else if (
    lower.includes("nikoh") ||
    lower.includes("ajral") ||
    lower.includes("aliment") ||
    lower.includes("farzand") ||
    lower.includes("bola")
  ) {
    category = "family";
    content =
      "Sizning murojaatingiz **Oila huquqi** (nikohdan ajralish va alimentlar) sohasiga tegishli.\n\n" +
      "**Dastlabki tushuntirish:**\n" +
      "O'zbekiston Respublikasi Oila kodeksiga muvofiq, voyaga yetmagan bolalarga aliment undirish sud buyrug'i yoki da'vo tartibida hal qilinadi. Bir bola uchun ota-ona daromadining to'rtdan bir qismi (1/4), ikki bola uchun uchdan bir qismi (1/3) miqdorida aliment belgilanadi.\n\n" +
      "**Keyingi qadamlar:**\n" +
      "1. Bolaning tug'ilganlik haqidagi guvohnomasi va nikoh guvohnomasini tayyorlang.\n" +
      "2. Sud buyrug'i chiqarish uchun tuman fuqarolik sudiga ariza bering.\n" +
      "3. Mulk taqsimoti yoki bolaning yashash joyi bo'yicha nizo bo'lsa, mutaxassis ko'magi tavsiya etiladi.";
    sources = [
      { title: "O'zbekiston Respublikasi Oila Kodeksi", article: "96, 99, 115-moddalar" },
    ];
  } else if (
    lower.includes("ijara") ||
    lower.includes("kvartira") ||
    lower.includes("uy") ||
    lower.includes("kadastr") ||
    lower.includes("propiska")
  ) {
    category = "housing";
    content =
      "Sizning murojaatingiz **Uy-joy va ijara huquqi** sohasiga tegishli.\n\n" +
      "**Dastlabki tushuntirish:**\n" +
      "Ko'chmas mulk ijarasi Soliq organlarida (ijara.soliq.uz) hisobga qo'yilishi shart. Ijara shartnomasida muddat, to'lov miqdori va shartnomani bekor qilish shartlari aniq belgilangan bo'lishi lozim. Taraflardan biri shartnomani muddatidan oldin bekor qilmoqchi bo'lsa, ikkinchi tarafni oldindan xabardor qilishi lozim.\n\n" +
      "**Keyingi qadamlar:**\n" +
      "1. Ijara shartnomasi va to'lov kvitansiyalarini tekshiring.\n" +
      "2. Shartnomani soliq bazasida ro'yxatdan o'tganligini aniqlang.\n" +
      "3. Nizoli holatda mutaxassis advokat orqali ogohlantirish xati yuboring.";
    sources = [
      { title: "O'zbekiston Respublikasi Fuqarolik Kodeksi", article: "574, 600-moddalar" },
      { title: "O'zbekiston Respublikasi Uy-joy Kodeksi", article: "13, 86-moddalar" },
    ];
  } else if (
    lower.includes("jinoyat") ||
    lower.includes("tergov") ||
    lower.includes("qamoq") ||
    lower.includes("militsiya") ||
    lower.includes("sudlandim")
  ) {
    category = "criminal";
    content =
      "Murojaatingiz **Jinoyat huquqi** sohasiga tegishli.\n\n" +
      "**Dastlabki himoya tushuntirishi:**\n" +
      "O'zbekiston Respublikasi Konstitutsiyasining 28-moddasiga asosan aybsizlik prezumpsiyasi amal qiladi. Gumon qilinuvchi yoki ayblanuvchi so'roq qilinishdan oldin advokat bilan xoli uchrashish va ko'rsatma berishdan bosh tortish huquqiga ega.";
    sources = [
      { title: "O'zbekiston Respublikasi Jinoyat-protsessual Kodeksi", article: "46, 48-moddalar" },
      { title: "O'zbekiston Respublikasi Konstitutsiyasi", article: "28-modda" },
    ];
  } else if (
    lower.includes("soliq") ||
    lower.includes("deklaratsiya") ||
    lower.includes("ndfl") ||
    lower.includes("nds")
  ) {
    category = "tax";
    content =
      "Murojaatingiz **Soliq huquqi** sohasiga tegishli.\n\n" +
      "O'zbekiston Respublikasi Soliq kodeksiga asosan jismoniy va yuridik shaxslar soliq imtiyozlaridan foydalanish va asossiz hisoblangan soliqlarga nisbatan e'tiroz bildirish huquqiga ega.";
    sources = [
      { title: "O'zbekiston Respublikasi Soliq Kodeksi", article: "22, 134-moddalar" },
    ];
  } else if (
    lower.includes("biznes") ||
    lower.includes("mchj") ||
    lower.includes("firma") ||
    lower.includes("litsenziya")
  ) {
    category = "business";
    content =
      "Murojaatingiz **Tadbirkorlik huquqi** sohasiga tegishli.\n\n" +
      "Tadbirkorlik subyektlari huquqlarini himoya qilish to'g'risidagi qonunchilikka binoan davlat organlarining noqonuniy tekshiruvlari va harakatlari ustidan Biznes-ombudsmanga shikoyat qilish mumkin.";
    sources = [
      { title: "Tadbirkorlik faoliyati erkinligining kafolatlari to'g'risida Qonun", article: "5, 42-moddalar" },
    ];
  } else {
    category = "civil";
    content =
      "Murojaatingiz qabul qilindi. Bu masala bo'yicha **Fuqarolik huquqi** normalari qo'llaniladi.\n\n" +
      "**Dastlabki huquqiy yo'l-yo'riq:**\n" +
      "Fuqarolik munosabatlarida tuzilgan shartnomalar, bitimlar va majburiyatlar O'zbekiston Respublikasi Fuqarolik kodeksiga muvofiq ijro etilishi shart. Huquqingiz buzilgan deb hisoblasangiz, dalillar (shartnoma, yozishmalar, to'lov cheklari) asosida da'vo bildirish huquqiga egasiz.\n\n" +
      "**Aniqlik kiritish uchun:**\n" +
      "Iltimos, hodisa qachon yuz berganligi va o'rtada yozma shartnoma yoki tilxat mavjudligini yozib yuborsangiz, aniqroq maslahat bera olamiz.";
    sources = [
      { title: "O'zbekiston Respublikasi Fuqarolik Kodeksi", article: "8, 382-moddalar" },
    ];
  }

  const matchedSpecs = MOCK_SPECIALISTS.filter((s) =>
    s.categories.some((c) => c.id === category)
  );

  return {
    status: 200,
    data: {
      conversation_id: conversation_id || "conv-" + Date.now(),
      response: {
        content,
        category,
        sources,
        needs_specialist,
        recommended_specialists: matchedSpecs.length > 0 ? matchedSpecs : MOCK_SPECIALISTS.slice(0, 2),
      },
    },
  };
}

// ============================================================
// Ephemeral HTTP Test Server Setup
// ============================================================

export function createTestServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url?.startsWith("/api/ai/chat") && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          try {
            let parsed = {};
            if (body.trim()) {
              parsed = JSON.parse(body);
            }
            const result = processAiTriage(parsed);
            res.writeHead(result.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result.data));
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Yaroqsiz JSON formati" }));
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Endpoint topilmadi" }));
      }
    });

    server.keepAliveTimeout = 0;
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        port,
        baseUrl,
        close: () =>
          new Promise((res) => {
            if (typeof server.closeAllConnections === "function") {
              server.closeAllConnections();
            }
            server.close(res);
          }),
      });
    });

    server.on("error", reject);
  });
}

// ============================================================
// Domain Simulators (Catalog, Booking, Auth, Chat, Admin, Escrow)
// ============================================================

export function filterSpecialistsCatalog({
  search = "",
  category = "all",
  region = "all",
  onlyOnline = false,
  minRating = "all",
}) {
  return MOCK_SPECIALISTS.filter((spec) => {
    if (
      search &&
      !spec.full_name.toLowerCase().includes(search.toLowerCase()) &&
      !spec.bio?.toLowerCase().includes(search.toLowerCase()) &&
      !spec.university?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (category !== "all") {
      const hasCategory = spec.categories.some((c) => c.id === category);
      if (!hasCategory) return false;
    }

    if (region !== "all" && spec.region !== region) {
      return false;
    }

    if (onlyOnline && !spec.is_online) {
      return false;
    }

    if (minRating !== "all" && spec.rating_avg < parseFloat(minRating)) {
      return false;
    }

    return true;
  });
}

export function simulateAuthLogin(email, password) {
  if (!email || !password) {
    throw new Error("Iltimos, barcha maydonlarni to'ldiring");
  }

  // Persona detection logic from src/app/(auth)/login/page.tsx:50
  let role = "user";
  if (email.includes("admin")) {
    role = "admin";
  } else if (email.includes("law") || email.includes("spec") || email.includes("yurist")) {
    role = "specialist";
  }

  return {
    success: true,
    user: {
      id: "demo-user-" + Math.floor(Math.random() * 1000),
      email,
      full_name: email.split("@")[0],
      role,
    },
    targetRedirect: role === "admin" ? "/admin" : role === "specialist" ? "/specialist" : "/dashboard",
  };
}

export function simulateAuthRegister({ fullName, email, password, role = "user" }) {
  if (!fullName || !email || !password) {
    throw new Error("Iltimos, barcha maydonlarni to'ldiring");
  }

  if (password.length < 6) {
    throw new Error("Parol kamida 6 belgidan iborat bo'lishi kerak");
  }

  if (!["user", "specialist"].includes(role)) {
    throw new Error("Noto'g'ri rol tanlandi");
  }

  return {
    success: true,
    user: {
      id: "user-" + Date.now(),
      full_name: fullName,
      email,
      role,
    },
    targetRedirect: role === "specialist" ? "/specialist/profile" : "/dashboard",
  };
}

export function simulateConsultationBooking({
  specialistId,
  serviceId,
  scheduledAt,
  userNotes = "",
  userId = "u-client-1",
}) {
  const specialist = MOCK_SPECIALISTS.find((s) => s.id === specialistId);
  if (!specialist) {
    throw new Error("Mutaxassis topilmadi");
  }

  const service = specialist.services.find((s) => s.id === serviceId);
  if (!service) {
    throw new Error("Tanlangan xizmat tarifi topilmadi");
  }

  if (!scheduledAt) {
    throw new Error("Iltimos, konsultatsiya vaqtini belgilang");
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Yaroqsiz sana formati");
  }

  // Create consultation conforming to Interface Contract 3
  const consultation = {
    id: "c-" + Date.now(),
    specialist_id: specialist.id,
    specialist_name: specialist.full_name,
    specialist_role: specialist.categories[0]?.name_uz || "Advokat",
    user_id: userId,
    service_id: service.id,
    service_name: service.name,
    duration_minutes: service.duration_minutes,
    price: service.price,
    currency: service.currency,
    format: service.format,
    scheduled_at: scheduledAt,
    user_notes: userNotes,
    status: "pending",
    status_label: "Kutilmoqda",
    created_at: new Date().toISOString(),
  };

  return consultation;
}

export function calculateCommission(price, commissionPercent = PLATFORM_COMMISSION_PERCENT) {
  if (typeof price !== "number" || price < 0) {
    throw new Error("Tarif narxi musbat son bo'lishi kerak");
  }
  const platformFee = Math.round((price * commissionPercent) / 100);
  const specialistNet = price - platformFee;
  return {
    price,
    commissionPercent,
    platformFee,
    specialistNet,
    currency: DEFAULT_CURRENCY,
  };
}

export function simulateChatTurn(messages, userText) {
  if (!userText || !userText.trim()) {
    throw new Error("Xabar bo'sh bo'lishi mumkin emas");
  }

  const userMsg = {
    id: "msg-" + Date.now(),
    sender: "user",
    text: userText.trim(),
    time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
  };

  const replyMsg = {
    id: "msg-" + (Date.now() + 1),
    sender: "specialist",
    text: "Xabaringizni oldim, rahmat! Ertaga batafsil gaplashamiz.",
    time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
  };

  return [...messages, userMsg, replyMsg];
}
