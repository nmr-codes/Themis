"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Video,
  MessageSquare,
  Star,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Phone,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  getConsultationById,
  updateConsultationReview,
  updateConsultationStatus,
  StoredConsultation,
} from "@/lib/consultation-storage";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [consultation, setConsultation] = useState<StoredConsultation | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancel Dialog State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Load consultation dynamically from storage or seeds
  useEffect(() => {
    const found = getConsultationById(id);
    if (found) {
      setConsultation(found);
    } else {
      // Graceful fallback to seed item or synthetic record from mock specialists
      const matchedSpec = MOCK_SPECIALISTS.find((s) => s.id === id) || MOCK_SPECIALISTS[0];
      const fallbackItem: StoredConsultation = {
        id: id || "c-101",
        specialist_id: matchedSpec.id,
        specialist_name: matchedSpec.full_name,
        specialist_title: matchedSpec.categories[0]?.name_uz
          ? `${matchedSpec.categories[0].name_uz} bo'yicha advokat`
          : "Malakali Advokat",
        specialist_role: matchedSpec.categories[0]?.name_uz
          ? `${matchedSpec.categories[0].name_uz} bo'yicha advokat`
          : "Malakali Advokat",
        service_id: matchedSpec.services[0]?.id || "serv-default",
        service_name: matchedSpec.services[0]?.name || "To'liq 45 daqiqalik onlayn konsultatsiya",
        duration_minutes: matchedSpec.services[0]?.duration_minutes || 45,
        category: matchedSpec.categories[0]?.name_uz || "Fuqarolik huquqi",
        price: matchedSpec.services[0]?.price || 180000,
        currency: "UZS",
        format: "video",
        scheduled_at: "Belgilangan vaqt, 15:00",
        status: "scheduled",
        status_label: "Rejalashtirilgan",
        status_color: "bg-blue-100 text-blue-800",
        meeting_link: "https://meet.google.com/thm-legal-aid",
        user_notes:
          "Ish beruvchim oxirgi ikki oy davomida maoshimni bermayapti va ishdan bo'shatish bilan tahdid qilmoqda.",
        description:
          "Ish beruvchim oxirgi ikki oy davomida maoshimni bermayapti va ishdan bo'shatish bilan tahdid qilmoqda.",
        has_review: false,
        created_at: new Date().toISOString(),
      };
      setConsultation(fallbackItem);
    }
    setLoading(false);
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Iltimos, advokat xizmati yuzasidan qisqa sharh qoldiring");
      return;
    }

    setSubmittingReview(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Persist review to localStorage
    if (consultation) {
      updateConsultationReview(consultation.id, rating, comment.trim());
      setConsultation((prev) =>
        prev
          ? {
              ...prev,
              has_review: true,
              user_rating: rating,
              user_comment: comment.trim(),
              status: "completed",
              status_label: "Yakunlangan",
            }
          : null
      );
    }

    setSubmittingReview(false);
    setReviewDialogOpen(false);
    toast.success("Rahmat! Sizning baho va sharhingiz qabul qilindi.");
  };

  const handleCancelConsultation = () => {
    if (!consultation) return;
    updateConsultationStatus(consultation.id, "cancelled");
    setConsultation((prev) =>
      prev
        ? {
            ...prev,
            status: "cancelled",
            status_label: "Rad etilgan",
          }
        : null
    );
    setCancelDialogOpen(false);
    toast.info("Konsultatsiya so'rovi bekor qilindi");
  };

  if (loading || !consultation) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B132B] mx-auto" />
        <p className="text-xs text-slate-500 mt-3 font-mono">Konsultatsiya ma&apos;lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  // Specialist matching details
  const specialistDetails = MOCK_SPECIALISTS.find((s) => s.id === consultation.specialist_id) || {
    license_number: "#ADV-3810",
    phone: "+998 90 123 45 67",
    email: "advokat@themis.uz",
    university: "Toshkent Davlat Yuridik Universiteti",
    experience_years: 9,
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/consultations"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0B132B] font-medium transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Konsultatsiyalar ro&apos;yxatiga qaytish
      </Link>

      {/* Main Dossier Card */}
      <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-sm">
        <CardHeader className="border-b border-[#E2DCD0] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E6F24] font-mono font-semibold">
                  Buyurtma #{consultation.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#166534] border border-emerald-200 font-semibold">
                  Eskrou Himoyalangan
                </span>
              </div>
              <CardTitle className="font-serif text-2xl text-[#0B132B] mt-1">
                {consultation.service_name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 mt-0.5">
                {consultation.category} • O&apos;zbekiston Respublikasi Advokatlar Palatasi
              </CardDescription>
            </div>

            <Badge
              className={`self-start sm:self-auto text-xs py-1 px-3 border-0 font-medium ${
                consultation.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : consultation.status === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : consultation.status === "cancelled"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {consultation.status_label || (consultation.status === "pending" ? "Kutilmoqda" : "Tasdiqlangan")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Format-specific Interactive Action Banner */}
          {consultation.format === "video" ? (
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0D47A1] text-white shrink-0 mt-0.5">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#0B132B]">
                    Onlayn video uchrashuv xonasi
                  </h4>
                  <p className="text-xs text-slate-600">
                    Belgilangan vaqtda quyidagi havola orqali video sessiyaga qo&apos;shiling:
                  </p>
                </div>
              </div>

              <a
                href={consultation.meeting_link || "https://meet.google.com/thm-legal-aid"}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button size="sm" className="bg-[#0D47A1] hover:bg-[#082E6E] text-white gap-1.5 shadow-sm text-xs">
                  Uchrashuvga kirish
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-[#C59B27]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0B132B] text-[#D4AF37] shrink-0 mt-0.5">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#0B132B]">
                    Xavfsiz Advokatlik Chat Xonasi
                  </h4>
                  <p className="text-xs text-slate-600">
                    Advokat bilan to&apos;g&apos;ridan-to&apos;g&apos;ri suhbatlashish va hujjatlar almashish xonasi:
                  </p>
                </div>
              </div>

              <Link href={`/consultations/${consultation.id}/chat`} className="shrink-0">
                <Button size="sm" className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] gap-1.5 shadow-sm text-xs">
                  Chatni ochish
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Details Grid with Specialist Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-[#E2DCD0] bg-white space-y-2">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Advokat Ma&apos;lumotlari</span>
              <div className="flex items-center gap-3 pt-1">
                <Avatar className="h-12 w-12 border border-[#C59B27]/50 shrink-0">
                  <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-sm">
                    {getInitials(consultation.specialist_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-serif font-bold text-slate-900 text-base leading-tight">
                      {consultation.specialist_name}
                    </p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {specialistDetails.license_number || "#ADV-3810"}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs font-medium mt-0.5">
                    {consultation.specialist_title || consultation.specialist_role || consultation.category}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                {specialistDetails.phone} • {specialistDetails.email}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E2DCD0] bg-white space-y-2">
              <span className="text-slate-400 font-mono text-[10px] uppercase">
                Belgilangan Vaqt va Format
              </span>
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5 pt-1">
                <Clock className="h-4 w-4 text-[#8E6F24]" />
                {consultation.scheduled_at}
              </p>
              <p className="text-slate-600 text-xs">
                {consultation.duration_minutes || 45} daqiqa (
                {consultation.format === "video"
                  ? "Video uchrashuv"
                  : consultation.format === "chat"
                  ? "Xavfsiz matnli chat"
                  : "Audio qo'ng'iroq"}
                )
              </p>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Xizmat haqi:</span>
                <span className="font-bold text-[#0B132B] text-sm">
                  {formatPrice(consultation.price)}
                </span>
              </div>
            </div>
          </div>

          {/* User Request Notes */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
              Siz qoldirgan murojaat mazmuni:
            </h4>
            <div className="p-4 rounded-xl bg-white border border-[#E2DCD0] text-xs text-slate-700 leading-relaxed font-serif italic">
              &ldquo;{consultation.user_notes || consultation.description || "Muammo tafsilotlari advokatga yuborildi."}&rdquo;
            </div>
          </div>

          {/* Escrow and Payment State */}
          <div className="p-4 rounded-xl border border-[#C59B27]/40 bg-[#FAF0D9]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                To&apos;lov holati: Eskrou tizimida xavfsiz ushlab turilibdi
              </p>
              <p className="text-[11px] text-slate-600">
                Konsultatsiya yakunlanib tomonlar tasdiqlamaguncha mablag&apos; advokatga o&apos;tkazilmaydi.
              </p>
            </div>
            <p className="text-lg font-serif font-bold text-[#0B132B]">
              {formatPrice(consultation.price)}
            </p>
          </div>

          {/* Client Feedback Display if Reviewed */}
          {consultation.has_review && (
            <div className="p-4 rounded-xl border border-[#C59B27]/40 bg-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono uppercase">
                  Siz qoldirgan baho:
                </span>
                <span className="text-[#C59B27] font-bold text-xs flex items-center gap-1">
                  {"★".repeat(consultation.user_rating || 5)}
                  <span className="text-slate-500 font-normal">
                    ({consultation.user_rating || 5}/5)
                  </span>
                </span>
              </div>
              {consultation.user_comment && (
                <p className="text-xs text-slate-600 italic">
                  &ldquo;{consultation.user_comment}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E2DCD0]">
            <div className="flex items-center gap-2">
              <Link href={`/consultations/${consultation.id}/chat`}>
                <Button variant="outline" className="gap-2 border-[#C59B27]/40 hover:bg-[#FAF0D9]/50 text-xs text-[#0B132B]">
                  <MessageSquare className="h-4 w-4 text-[#0D47A1]" />
                  Advokat bilan Chat
                </Button>
              </Link>
              {consultation.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(true)}
                  className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Bekor qilish
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => setReviewDialogOpen(true)}
              disabled={consultation.has_review}
              className="gap-1.5 text-xs bg-white border border-[#C59B27]/40 hover:bg-[#FAF0D9]/50 text-[#0B132B]"
            >
              <Star className="h-4 w-4 text-[#C59B27] fill-[#C59B27]" />
              {consultation.has_review ? "Baho berildi ✓" : "Baho va Sharh Qoldirish"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#0B132B]">
              Konsultatsiyani Baholash
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              {consultation.specialist_name} ko&apos;rsatgan huquqiy xizmat sifatini 1 dan 5 gacha baholang
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit} className="space-y-4 py-2">
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? "text-[#C59B27] fill-[#C59B27]" : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-800">
                Sharh yoki fikr-mulohazangiz:
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Yuristning maslahati qanchalik foydali bo'ldi? Boshqa fuqarolarga tavsiya qilasizmi?"
                className="text-xs bg-white border-[#E2DCD0] min-h-[90px]"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                className="border-[#E2DCD0] text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={submittingReview}
                className="bg-[#0B132B] hover:bg-[#1A2849] text-white text-xs"
              >
                {submittingReview ? "Saqlanmoqda..." : "Sharhni Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#0B132B] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              So&apos;rovni bekor qilish
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Ushbu konsultatsiya so&apos;rovini bekor qilmoqchimisiz? Eskrou depoziti darhol sizning hisobingizga qaytariladi.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="border-[#E2DCD0] text-xs"
            >
              Orqaga
            </Button>
            <Button
              type="button"
              onClick={handleCancelConsultation}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              Ha, bekor qilinsin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
