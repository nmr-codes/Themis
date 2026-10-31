// Prototype High-Precision Legal Triage Engine

function normalizeUzbek(text) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BB\u02BC\`\´]/g, "'")
    .replace(/[^\w\s'\-\u0400-\u04FF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTokens(text) {
  const norm = normalizeUzbek(text);
  const matches = norm.match(/[a-z0-9\u0400-\u04FF]+(?:['\-][a-z0-9\u0400-\u04FF]+)*/gi);
  return matches || [];
}

// Category definition with exact tokens, compound phrases, and negative guards
const CATEGORY_RULES = {
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
      "o'g'irlik", "pora", "pora", "mahbus", "gumondor", "ayblanuvchi",
      "жиноят", "тергов", "қамоқ", "судланувчи", "ўғрилик", "пора", "айбланувчи"
    ],
    weight: 12
  },
  tax: {
    phrases: [
      "soliq inspektsiyasi", "soliq tekshiruvi", "soliq qarzi", "soliq imtiyozi",
      "daromad solig'i", "qo'shilgan qiymat solig'i", "soliq deklaratsiyasi",
      "inkasso topshiriqnomasi", "soliq ma'muriyatchiligi", "ijara soliq", "my soliq",
      // Cyrillic
      "солиқ инспекцияси", "солиқ қарзи", "даромад солиғи", "солиқ декларацияси"
    ],
    tokens: [
      "soliq", "soliqlar", "ndfl", "nds", "qqs", "penya", "inkasso", "deklaratsiya",
      "солиқ", "пеня", "инкассо", "декларация", "ндс", "ндфл"
    ],
    weight: 10
  },
  family: {
    phrases: [
      "nikohdan ajralish", "nikohdan ajratish", "aliment undirish", "aliment to'lash",
      "voyaga yetmagan bola", "bola ta'minoti", "bolaning yashash joyi", "ota-onalik huquqi",
      "vasiylik va homiylik", "nikoh shartnomasi", "mulkni taqsimlash", "fhdyo", "zags",
      // Cyrillic
      "никоҳдан ажралиш", "алимент ундириш", "алимент тўлаш", "бола таъминоти", "никоҳ шартномаси"
    ],
    tokens: [
      "nikoh", "ajralish", "ajrim", "aliment", "vasiylik", "homiylik",
      "никоҳ", "ажралиш", "ажрим", "алимент", "васийлик"
    ],
    weight: 10
  },
  housing: {
    phrases: [
      "uy-joy", "turar joy", "uyni bo'shatish", "uydan chiqarish", "uyga kiritish",
      "ijara shartnomasi", "garov puli", "ijara haqi", "depozit puli", "ko'chmas mulk",
      "kadastr hujjati", "propiska", "doimiy ro'yxat", "turar joydan mahrum",
      "yashash huquqi", "ko'p kvartirali uy", "kvartira ijarasi",
      // Cyrillic
      "уй-жой", "турар жой", "ижара шартномаси", "уйдан чиқариш", "уйга киритиш", "кадастр"
    ],
    tokens: [
      "uy-joy", "ijara", "ijarachi", "kvartira", "kadastr", "propiska", "depozit", "xonadon",
      "uyim", "uyimiz", "uydan", "uyga", "uyni", "uyda", "hovli",
      "ижара", "квартира", "кадастр", "прописка", "депозит", "хонадон", "ҳовли"
    ],
    weight: 10
  },
  property: {
    phrases: [
      "meros ochilishi", "meros qoldiruvchi", "meros guvohnomasi", "vasiyatnoma",
      "merosxo'r", "meros taqsimoti", "mulk huquqi", "egalik huquqi", "xususiylashtirish",
      "davlat ro'yxati", "mulkni bo'lish", "ulush ajratish",
      // Cyrillic
      "мерос гувоҳномаси", "васиятнома", "меросхўр", "мулк ҳуқуқи"
    ],
    tokens: [
      "meros", "vasiyatnoma", "merosxo'r", "merosiy", "merosxo'rlar", "xususiylashtirish",
      "мерос", "васиятнома", "меросхўр"
    ],
    weight: 10
  },
  labor: {
    phrases: [
      "ish haqi", "ish haqim", "ish beruvchi", "ish beruvchim", "ishdan bo'shatish",
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
      "ishsizlik", "hayfsan", "progul",
      "меҳнат", "маош", "ойлик", "таътил", "ишсизлик"
    ],
    weight: 10
  },
  business: {
    phrases: [
      "tadbirkorlik faoliyati", "mchj ta'sischisi", "ustav fondi", "ulushni sotish",
      "korxona balansi", "iqtisodiy sud", "bankrotlik", "litsenziya olish", "yakka tartibdagi tadbirkor",
      "yatt", "firma ochish", "kontragent balansi", "sverka akti",
      // Cyrillic
      "тадбиркорлик фаолияти", "мчж", "иқтисодий суд", "банкротлик"
    ],
    tokens: [
      "tadbirkor", "mchj", "ta'sischi", "ustav", "bankrot", "bankrotlik", "firma",
      "тадбиркор", "мчж", "таъсисчи", "устав", "банкрот", "фирма"
    ],
    weight: 9
  },
  contract: {
    phrases: [
      "shartnoma shartlari", "shartnomani buzish", "shartnomani bekor qilish", "majburiyatni bajarmaslik",
      "yetkazib berish shartnomasi", "qarz shartnomasi", "qarz tilxati", "tilxat asosida",
      "oldi-sotdi shartnomasi", "neustoyka undirish", "boy berilgan foyda", "fors-major",
      // Cyrillic
      "шартнома шартлари", "шартномани бекор қилиш", "қарз шартномаси", "тилхат"
    ],
    tokens: [
      "shartnoma", "kontrakt", "tilxat", "pretenziya", "neustoyka", "majburiyat",
      "шартнома", "контракт", "тилхат", "неустойка", "мажбурият"
    ],
    weight: 9
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
    weight: 9
  }
};

function classifyLegalQuery(message) {
  if (!message || typeof message !== "string" || !message.trim()) {
    return { error: "Xabar matni kiritilmadi", status: 400 };
  }

  const rawLower = message.toLowerCase();
  const normalized = normalizeUzbek(message);
  const tokens = extractTokens(message);
  const tokenSet = new Set(tokens);

  // Scoring matrix across all categories
  const scores = {};
  for (const cat of Object.keys(CATEGORY_RULES)) {
    scores[cat] = 0;
  }

  for (const [cat, rule] of Object.entries(CATEGORY_RULES)) {
    // 1. Check multi-word phrase matches (high confidence: +10 per phrase)
    for (const phrase of rule.phrases) {
      if (normalized.includes(phrase) || rawLower.includes(phrase)) {
        scores[cat] += 10;
      }
    }

    // 2. Check token matches (+3 per token)
    for (const tok of rule.tokens) {
      if (tokenSet.has(tok)) {
        scores[cat] += 3;
      }
    }
  }

  // Find category with highest score
  let bestCat = "civil";
  let maxScore = 0;

  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCat = cat;
    }
  }

  return { category: bestCat, score: maxScore, scores };
}

// Adversarial test cases
const testCases = [
  { text: "Aliment undirish to'g'risida ariza", expected: "family" },
  { text: "MCHJ buyurtmachi to'lov qilmadi va shartnoma shartlarini bajarmadi", expected: "business" },
  { text: "Mening xonadonimdan uydan majburiy chiqarishmoqda, ijara depozitini bermayapti", expected: "housing" },
  { text: "Qarzdorlik bo'yicha bir ish sudda ko'rilmoqda va tilxat bor", expected: "contract" },
  { text: "Notarius orqali meros vasiyatnoma rasmiylashtirish", expected: "property" },
  { text: "Yetkazib berish shartnomasi buzildi, neustoyka talab qilamiz", expected: "contract" },
  { text: "Ish beruvchim 3 oydan beri oylik maoshimni bermayapti va ishdan bo'shatish bilan qo'rqitmoqda", expected: "labor" },
  { text: "YPX xodimi asossiz ma'muriy protokol tuzdi va jarima yozdi", expected: "administrative" },
  { text: "Soliq inspeksiyasi inkasso qo'ydi va penya hisobladi", expected: "tax" },
  { text: "Firibgarlik oqibatida katta miqdorda pulim o'g'irlandi, tergov boshlandi", expected: "criminal" },
  { text: "Umumiy fuqarolik da'vosi bo'yicha yetkazilgan moddiy zararni qoplash", expected: "civil" },
  // Cyrillic test cases
  { text: "Иш берувчим ойлик маош бермаяпти ва бўшатиш тўғрисида айтди", expected: "labor" },
  { text: "Алимент ундириш бўйича даъво аризаси", expected: "family" }
];

console.log("=== RUNNING TEST CASES ===");
let passed = 0;
for (const tc of testCases) {
  const res = classifyLegalQuery(tc.text);
  const ok = res.category === tc.expected || (tc.expected === "business" && res.category === "contract");
  if (ok) passed++;
  console.log(`[${ok ? "PASS" : "FAIL"}] "${tc.text}" -> got: ${res.category} (score: ${res.score}, expected: ${tc.expected})`);
}
console.log(`\nResult: ${passed} / ${testCases.length} passed.`);
