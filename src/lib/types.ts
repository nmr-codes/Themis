// ============================================================
// Core Database Types for Themis / Huquqiy Yordam Platform
// ============================================================

export type UserRole = "user" | "specialist" | "admin";
export type PreferredLanguage = "uz" | "ru";

export type VerificationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "revision_needed"
  | "rejected"
  | "suspended";

export type ConsultationStatus =
  | "pending"
  | "accepted"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type TransactionStatus =
  | "pending"
  | "paid"
  | "held"
  | "completed"
  | "refund_pending"
  | "refunded"
  | "disputed";

export type CredentialType =
  | "diploma"
  | "license"
  | "certificate"
  | "id_document"
  | "other";

export type ServiceFormat = "chat" | "video" | "audio" | "written";
export type ReviewStatus = "active" | "flagged" | "removed";
export type ComplaintType = "specialist" | "user" | "review" | "consultation" | "other";
export type ComplaintStatus = "open" | "investigating" | "resolved" | "dismissed";

// ============================================================
// Table Interfaces
// ============================================================

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  region: string | null;
  preferred_language: PreferredLanguage;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Specialist {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  region: string | null;
  languages: string[];
  experience_years: number;
  education: string | null;
  university: string | null;
  graduation_year: number | null;
  previous_workplaces: WorkplaceEntry[];
  verification_status: VerificationStatus;
  license_number?: string;
  chamber_name?: string;
  admin_notes: string | null;
  is_online: boolean;
  rating_avg: number;
  rating_count: number;
  consultation_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkplaceEntry {
  company: string;
  position: string;
  start_year: number;
  end_year: number | null;
}

export interface SpecialistCategory {
  specialist_id: string;
  category_id: string;
}

export interface SpecialistCredential {
  id: string;
  specialist_id: string;
  credential_type: CredentialType;
  title: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  document_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  admin_notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  specialist_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  format: ServiceFormat;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalCategory {
  id: string;
  name_uz: string;
  name_ru: string;
  description_uz: string | null;
  description_ru: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Availability {
  id: string;
  specialist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string | null;
  legal_category_id: string | null;
  status: "active" | "closed";
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: AISource[];
  recommended_specialists: string[];
  created_at: string;
}

export interface AISource {
  title: string;
  url?: string;
  article?: string;
  excerpt?: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  specialist_id: string;
  service_id: string;
  ai_conversation_id: string | null;
  status: ConsultationStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  meeting_link: string | null;
  user_notes: string | null;
  specialist_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  consultation_id: string;
  user_id: string;
  specialist_id: string;
  amount: number;
  platform_fee: number;
  specialist_amount: number;
  currency: string;
  status: TransactionStatus;
  payment_provider: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  consultation_id: string;
  user_id: string;
  specialist_id: string;
  rating: number;
  comment: string | null;
  specialist_reply: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  consultation_id: string | null;
  review_id: string | null;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

// ============================================================
// Extended / Joined types for the frontend
// ============================================================

export interface SpecialistWithDetails extends Specialist {
  categories: LegalCategory[];
  services: Service[];
  credentials: SpecialistCredential[];
}

export interface ConsultationWithDetails extends Consultation {
  specialist: Specialist;
  service: Service;
  user_profile: Profile;
  transaction?: Transaction;
  review?: Review;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender_profile?: Profile;
}

