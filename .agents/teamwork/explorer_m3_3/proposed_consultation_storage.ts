/**
 * Proposed Consultation Storage & Lifecycle Helper
 * Fulfills PROJECT.md § Interface Contract 3 (Consultation Booking Persistence Contract)
 * Location in src: src/lib/consultation-storage.ts
 */

export interface StoredConsultation {
  id: string;
  specialist_id: string;
  specialist_name: string;
  specialist_title: string;
  specialist_role?: string;
  specialist_avatar?: string;
  category: string;
  service_id?: string;
  service_name: string;
  duration_minutes: number;
  scheduled_at: string;
  format: "chat" | "video" | "call";
  status: "pending" | "confirmed" | "completed" | "cancelled" | "scheduled";
  status_label: string;
  status_color?: string;
  price: number;
  currency: string;
  description?: string;
  user_notes?: string;
  meeting_link?: string;
  has_review?: boolean;
  user_rating?: number;
  user_comment?: string;
  created_at: string;
}

export const STORAGE_KEY_CONSULTATIONS = "themis_consultations";

export const SEED_CONSULTATIONS: StoredConsultation[] = [
  {
    id: "c-101",
    specialist_id: "spec-1",
    specialist_name: "Azizbek Rahimov",
    specialist_title: "Mehnat huquqi bo'yicha advokat",
    specialist_role: "Mehnat huquqi bo'yicha advokat",
    service_id: "serv-2",
    service_name: "To'liq 45 daqiqalik onlayn konsultatsiya",
    duration_minutes: 45,
    category: "Mehnat huquqi",
    price: 180000,
    currency: "UZS",
    format: "video",
    scheduled_at: "Ertaga, 15:00",
    status: "scheduled",
    status_label: "Rejalashtirilgan",
    status_color: "bg-blue-100 text-blue-800",
    meeting_link: "https://meet.google.com/thm-legal-aid",
    user_notes: "Ish beruvchim oxirgi ikki oy davomida maoshimni bermayapti va noqonuniy bo'shatish bilan tahdid qilmoqda.",
    description: "Ish beruvchim oxirgi ikki oy davomida maoshimni bermayapti va noqonuniy bo'shatish bilan tahdid qilmoqda.",
    has_review: false,
    created_at: "2026-10-30T10:00:00Z",
  },
  {
    id: "c-102",
    specialist_id: "spec-2",
    specialist_name: "Dilnoza Karimova",
    specialist_title: "Oila huquqi bo'yicha yurist",
    specialist_role: "Oila huquqi bo'yicha yurist",
    service_id: "serv-3",
    service_name: "Oila va aliment masalalari bo'yicha konsultatsiya",
    duration_minutes: 30,
    category: "Oila huquqi",
    price: 120000,
    currency: "UZS",
    format: "video",
    scheduled_at: "20-oktabr, 11:00",
    status: "completed",
    status_label: "Yakunlangan",
    status_color: "bg-emerald-100 text-emerald-800",
    meeting_link: "https://meet.google.com/thm-family-law",
    user_notes: "Nikoh shartnomasi va voyaga yetmagan farzandlar uchun aliment belgilash tartibi.",
    description: "Nikoh shartnomasi va voyaga yetmagan farzandlar uchun aliment belgilash tartibi.",
    has_review: true,
    user_rating: 5,
    user_comment: "Juda xushmuomala va o'z ishining ustasi. Vaziyatni xolisona tushuntirdilar.",
    created_at: "2026-10-18T09:00:00Z",
  },
  {
    id: "c-103",
    specialist_id: "spec-3",
    specialist_name: "Rustam Mahmudov",
    specialist_title: "Uy-joy advokati",
    specialist_role: "Uy-joy advokati",
    service_id: "serv-4",
    service_name: "Ko'chmas mulk shartnomasini ekspertiza qilish",
    duration_minutes: 60,
    category: "Ko'chmas mulk va uy-joy",
    price: 250000,
    currency: "UZS",
    format: "video",
    scheduled_at: "10-oktabr, 17:00",
    status: "completed",
    status_label: "Yakunlangan",
    status_color: "bg-emerald-100 text-emerald-800",
    meeting_link: "https://meet.google.com/thm-housing-law",
    user_notes: "Ko'chmas mulk oldi-sotdi shartnomasidagi xatarli bandlarni tahlil qilish.",
    description: "Ko'chmas mulk oldi-sotdi shartnomasidagi xatarli bandlarni tahlil qilish.",
    has_review: false,
    created_at: "2026-10-09T14:00:00Z",
  },
];

/**
 * Retrieve all consultations safely in SSR and client environments.
 * Merges localStorage custom bookings with default seed consultations.
 */
export function getStoredConsultations(): StoredConsultation[] {
  if (typeof window === "undefined") {
    return SEED_CONSULTATIONS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSULTATIONS);
    if (!raw) {
      return SEED_CONSULTATIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return SEED_CONSULTATIONS;
    }
    // Return stored items combined with any seeds that haven't been shadowed
    const storedIds = new Set(parsed.map((item) => item.id));
    const unseeded = SEED_CONSULTATIONS.filter((seed) => !storedIds.has(seed.id));
    return [...parsed, ...unseeded];
  } catch (error) {
    console.error("Failed to read consultations from localStorage", error);
    return SEED_CONSULTATIONS;
  }
}

/**
 * Lookup consultation by ID from stored or seed records.
 */
export function getConsultationById(id: string): StoredConsultation | null {
  const all = getStoredConsultations();
  return all.find((c) => c.id === id) || null;
}

/**
 * Persist a newly created or updated consultation to localStorage.
 */
export function saveConsultation(consultation: StoredConsultation): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredConsultations();
    const filtered = current.filter((c) => c.id !== consultation.id);
    const updated = [consultation, ...filtered];
    localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save consultation to localStorage", error);
  }
}

/**
 * Update review score and feedback for a consultation.
 */
export function updateConsultationReview(
  id: string,
  rating: number,
  comment: string
): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredConsultations();
    const updated = current.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          has_review: true,
          user_rating: rating,
          user_comment: comment,
          status: "completed" as const,
          status_label: "Yakunlangan",
          status_color: "bg-emerald-100 text-emerald-800",
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update consultation review", error);
  }
}
