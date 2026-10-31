/**
 * AI Consultation Persistence & Storage Layer
 * Stores AI triage sessions and transcripts in localStorage (themis_ai_conversations)
 * Location: src/lib/ai-chat-storage.ts
 */

import { AISource } from "./triage";
import { MOCK_SPECIALISTS } from "./mock-data";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  category?: string;
  sources?: AISource[];
  recommended_specialists?: any[];
  structured_sections?: {
    issue_statement: string;
    substantive_analysis: string;
    action_steps: string[];
  };
  timestamp?: string;
}

export interface AIConversation {
  id: string;
  title: string;
  category: string;
  statute: string;
  date: string;
  status: string;
  messages_count: number;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export const STORAGE_KEY_AI_CONVERSATIONS = "themis_ai_conversations";
export const STORAGE_KEY_PENDING_INQUIRY = "themis_pending_inquiry";

export const SEED_AI_CONVERSATIONS: AIConversation[] = [
  {
    id: "conv-1",
    title: "Ish beruvchi tomonidan ish haqini kechiktirish va asossiz bo'shatish",
    category: "Mehnat huquqi",
    statute: "O'zR Yangi Mehnat Kodeksi • 161, 244-moddalar",
    date: "28-oktabr, 2026",
    status: "Tahlil yakunlangan",
    messages_count: 2,
    created_at: "2026-10-28T10:15:00Z",
    updated_at: "2026-10-28T10:16:30Z",
    messages: [
      {
        id: "m-1-1",
        role: "user",
        content:
          "Ish beruvchim oxirgi ikki oy davomida maoshimni kechiktirib kelmoqda va o'z xohishim bilan bo'shash to'g'risida majburiy ariza talab qilmoqda. Qanday huquqiy choralar ko'rsam bo'ladi?",
        timestamp: "10:15",
      },
      {
        id: "m-1-2",
        role: "assistant",
        category: "labor",
        content:
          "Sizning murojaatingiz **Mehnat huquqi** sohasiga tegishli.\n\n" +
          "**Dastlabki huquqiy tushuntirish:**\n" +
          "O'zbekiston Respublikasi Mehnat kodeksiga binoan, ish beruvchi xodimga ish haqini o'z vaqtida to'lashi, shuningdek ishdan bo'shatish asoslarini qonuniy rasmiylashtirishi shart. Noqonuniy bo'shatilgan yoki oylik to'lanmagan taqdirda xodim Davlat mehnat inspeksiyasiga yoki Fuqarolik ishlari bo'yicha tuman sudiga murojaat qilish huquqiga ega.\n\n" +
          "**Tavsiya etiladigan amaliy qadamlar:**\n" +
          "1. Ish beruvchiga oylik maoshni to'lash bo'yicha yozma talabnoma yuborish va kirish raqamini olish.\n" +
          "2. Mehnat shartnomasi, hisob-kitob varaqalari va buyruq nusxalarini to'plash.\n" +
          "3. Nizo bartaraf etilmasa, malakali mehnat advokati bilan onlayn maslahatlashib, sudga da'vo arizasi tayyorlash.",
        sources: [
          {
            title: "O'zbekiston Respublikasi Yangi Mehnat Kodeksi",
            article: "161, 244-moddalar",
            url: "https://lex.uz/docs/6257288",
            quote: "Ish beruvchi har bir xodimga belgilangan muddatda to'liq ish haqini to'lashi shart.",
          },
          {
            title: "Yagona milliy mehnat tizimi (my.mehnat.uz)",
            article: "Elektron mehnat daftarchasi tartibi",
            url: "https://my.mehnat.uz",
          },
        ],
        recommended_specialists: [MOCK_SPECIALISTS[0]], // Azizbek Rahimov
        structured_sections: {
          issue_statement:
            "Fuqaro tomonidan ish beruvchi tomonidan 2 oylik ish haqi to'lanmaganligi va majburiy ishdan bo'shatish xavfi bildirilgan.",
          substantive_analysis:
            "Mehnat kodeksining 161 va 244-moddalariga muvofiq, ish beruvchi mehnat haqini o'z vaqtida berishi shart. Majburiy ariza yozdirish noqonuniy hisoblanadi.",
          action_steps: [
            "Ish beruvchiga yozma pretenziya yuborish (3 kun muddat)",
            "Davlat mehnat inspeksiyasiga shikoyat arizasi kiritish (10 kun)",
            "Tuman fuqarolik sudiga kompensatsiya undirish bo'yicha da'vo arizasi berish",
          ],
        },
        timestamp: "10:16",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Ijara shartnomasini muddatidan oldin bekor qilish va depozit nizosi",
    category: "Uy-joy huquqi",
    statute: "O'zR Fuqarolik Kodeksi • 574, 600-moddalar",
    date: "25-oktabr, 2026",
    status: "Advokatga yo'naltirilgan",
    messages_count: 2,
    created_at: "2026-10-25T14:30:00Z",
    updated_at: "2026-10-25T14:32:00Z",
    messages: [
      {
        id: "m-2-1",
        role: "user",
        content:
          "Kvartira egasi 3 kun ichida uyni bo'shatishimni talab qilmoqda va 300 dollar garov depozit pulimni qaytarmayapti. Qonun bo'yicha muddat qancha?",
        timestamp: "14:30",
      },
      {
        id: "m-2-2",
        role: "assistant",
        category: "housing",
        content:
          "Sizning murojaatingiz **Uy-joy va ijara huquqi** sohasiga tegishli.\n\n" +
          "**Dastlabki tushuntirish:**\n" +
          "Ko'chmas mulk ijarasi Soliq organlarida (ijara.soliq.uz) hisobga qo'yilishi shart. Ijara shartnomasida muddat, to'lov miqdori va shartnomani bekor qilish shartlari aniq belgilangan bo'lishi lozim. Taraflardan biri shartnomani muddatidan oldin bekor qilmoqchi bo'lsa, ikkinchi tarafni oldindan xabardor qilishi lozim.\n\n" +
          "**Keyingi qadamlar:**\n" +
          "1. Ijara shartnomasi va to'lov kvitansiyalarini tekshiring.\n" +
          "2. Shartnomani soliq bazasida ro'yxatdan o'tganligini aniqlang.\n" +
          "3. Nizoli holatda mutaxassis advokat orqali ogohlantirish xati yuboring.",
        sources: [
          {
            title: "O'zbekiston Respublikasi Fuqarolik Kodeksi",
            article: "574, 600-moddalar",
            url: "https://lex.uz/docs/180552",
          },
          {
            title: "O'zbekiston Respublikasi Uy-joy Kodeksi",
            article: "13, 86-moddalar",
            url: "https://lex.uz/docs/106136",
          },
        ],
        recommended_specialists: [MOCK_SPECIALISTS[2]], // Rustam Mahmudov
        structured_sections: {
          issue_statement:
            "Ijara munosabatlarida muddatidan oldin majburiy chiqarish va garov depozitini ushlab qolish nizosi.",
          substantive_analysis:
            "Fuqarolik kodeksining 600-moddasiga ko'ra, ijara shartnomasini bekor qilish uchun kamida 3 oy oldin (yoki shartnomada kelishilgan muddatda) yozma ogohlantirish talab etiladi. Depozit ushlab qolish faqat keltirilgan zarar isbotlanganda mumkin.",
          action_steps: [
            "Ijara shartnomasi va depozit to'lov cheklarini soliq portalida tekshirish",
            "Uy egasiga depozitni qaytarish bo'yicha rasmiy talabnoma yuborish",
            "Ko'chmas mulk advokati bilan da'vo kiritish",
          ],
        },
        timestamp: "14:32",
      },
    ],
  },
  {
    id: "conv-3",
    title: "Aliment to'lovlarini sud orqali undirish va ijro ta'minoti",
    category: "Oila huquqi",
    statute: "O'zR Oila Kodeksi • 96, 99-moddalar",
    date: "19-oktabr, 2026",
    status: "Tahlil yakunlangan",
    messages_count: 2,
    created_at: "2026-10-19T09:00:00Z",
    updated_at: "2026-10-19T09:02:00Z",
    messages: [
      {
        id: "m-3-1",
        role: "user",
        content:
          "2 nafar voyaga yetmagan farzandim uchun aliment undirish tartibi va oylik daromaddan ushlanadigan foiz qancha bo'ladi?",
        timestamp: "09:00",
      },
      {
        id: "m-3-2",
        role: "assistant",
        category: "family",
        content:
          "Sizning murojaatingiz **Oila huquqi** (nikohdan ajralish va alimentlar) sohasiga tegishli.\n\n" +
          "**Dastlabki tushuntirish:**\n" +
          "O'zbekiston Respublikasi Oila kodeksiga muvofiq, voyaga yetmagan bolalarga aliment undirish sud buyrug'i yoki da'vo tartibida hal qilinadi. Bir bola uchun ota-ona daromadining to'rtdan bir qismi (1/4), ikki bola uchun uchdan bir qismi (1/3) miqdorida aliment belgilanadi.\n\n" +
          "**Keyingi qadamlar:**\n" +
          "1. Bolaning tug'ilganlik haqidagi guvohnomasi va nikoh guvohnomasini tayyorlang.\n" +
          "2. Sud buyrug'i chiqarish uchun tuman fuqarolik sudiga ariza bering.\n" +
          "3. Mulk taqsimoti yoki bolaning yashash joyi bo'yicha nizo bo'lsa, mutaxassis ko'magi tavsiya etiladi.",
        sources: [
          {
            title: "O'zbekiston Respublikasi Oila Kodeksi",
            article: "96, 99, 115-moddalar",
            url: "https://lex.uz/docs/104720",
          },
        ],
        recommended_specialists: [MOCK_SPECIALISTS[1]], // Dilnoza Karimova
        structured_sections: {
          issue_statement:
            "2 nafar voyaga yetmagan farzand ta'minoti uchun aliment miqdorini belgilash va sud orqali undirish tartibi.",
          substantive_analysis:
            "Oila kodeksining 99-moddasiga ko'ra, 2 nafar bola uchun ota-ona oylik ish haqi va barcha daromadlarining 1/3 qismi miqdorida aliment belgilanadi.",
          action_steps: [
            "Farzandlarning tug'ilganlik guvohnomalari nusxalarini tayyorlash",
            "Yashash joyidagi Fuqarolik ishlari bo'yicha sudga sud buyrug'i berish haqida ariza kiritish",
            "Sud buyrug'ini MIB ijrochisiga topshirish",
          ],
        },
        timestamp: "09:02",
      },
    ],
  },
];

/**
 * Reads all stored AI conversations from localStorage (SSR-safe with default seeds)
 */
export function getStoredAIConversations(): AIConversation[] {
  if (typeof window === "undefined") {
    return SEED_AI_CONVERSATIONS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI_CONVERSATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, JSON.stringify(SEED_AI_CONVERSATIONS));
      return SEED_AI_CONVERSATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_AI_CONVERSATIONS;
  } catch (err) {
    console.error("Failed to read themis_ai_conversations:", err);
    return SEED_AI_CONVERSATIONS;
  }
}

/**
 * Retrieves a single conversation by ID
 */
export function getAIConversationById(id: string): AIConversation | null {
  const list = getStoredAIConversations();
  return list.find((c) => c.id === id) || null;
}

/**
 * Saves or updates a conversation in localStorage
 */
export function saveAIConversation(conv: AIConversation): void {
  if (typeof window === "undefined") return;

  try {
    const list = getStoredAIConversations();
    const existingIndex = list.findIndex((c) => c.id === conv.id);

    let updated: AIConversation[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...conv, updated_at: new Date().toISOString() };
    } else {
      updated = [conv, ...list];
    }

    localStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save AI conversation:", err);
  }
}

/**
 * Deletes a conversation by ID
 */
export function deleteAIConversation(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const list = getStoredAIConversations();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_AI_CONVERSATIONS, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete AI conversation:", err);
  }
}

/**
 * Creates a new conversation docket with generated ID
 */
export function createNewAIConversation(firstUserMessage: string, categoryName: string = "Umumiy tahlil"): AIConversation {
  const title =
    firstUserMessage.length > 60
      ? firstUserMessage.slice(0, 57) + "..."
      : firstUserMessage;

  const now = new Date();
  const dateStr = now.toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });

  const newConv: AIConversation = {
    id: "conv-" + Date.now(),
    title: title || "Yangi huquqiy murojaat",
    category: categoryName,
    statute: "Lex.uz milliy qonunchilik ekspertizasi",
    date: dateStr,
    status: "Tahlil jarayonida",
    messages_count: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    messages: [],
  };

  saveAIConversation(newConv);
  return newConv;
}

/**
 * Reads pending inquiry saved from landing page (?q=... or themis_pending_inquiry)
 */
export function getPendingInquiry(clearAfterRead: boolean = true): string | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(STORAGE_KEY_PENDING_INQUIRY);
    if (val && clearAfterRead) {
      localStorage.removeItem(STORAGE_KEY_PENDING_INQUIRY);
    }
    return val;
  } catch {
    return null;
  }
}

/**
 * Stores pending inquiry to localStorage
 */
export function setPendingInquiry(query: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_INQUIRY, query);
  } catch (err) {
    console.error("Failed to set themis_pending_inquiry:", err);
  }
}
