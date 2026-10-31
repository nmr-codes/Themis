"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  Phone,
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Specialist, Service, LegalCategory } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { saveConsultation, StoredConsultation } from "@/lib/consultation-storage";

interface ConsultationBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  specialist: Specialist & {
    categories: LegalCategory[];
    services: Service[];
  };
  initialService?: Service | null;
  onSuccess?: (consultation: StoredConsultation) => void;
}

const TIME_SLOTS = {
  morning: [
    { id: "09:30", label: "09:30 — 10:15" },
    { id: "11:00", label: "11:00 — 11:45" },
  ],
  afternoon: [
    { id: "14:00", label: "14:00 — 14:45" },
    { id: "15:30", label: "15:30 — 16:15" },
    { id: "17:00", label: "17:00 — 17:45" },
  ],
  evening: [
    { id: "18:30", label: "18:30 — 19:15" },
    { id: "19:30", label: "19:30 — 20:15" },
  ],
};

export function ConsultationBookingDialog({
  isOpen,
  onClose,
  specialist,
  initialService,
  onSuccess,
}: ConsultationBookingDialogProps) {
  const router = useRouter();

  // Selected format: chat, video, call
  const [selectedFormat, setSelectedFormat] = useState<"chat" | "video" | "call">("video");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("15:30 — 16:15");
  const [userNotes, setUserNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Initialize dates and selected service whenever dialog opens or initialService changes
  useEffect(() => {
    if (isOpen) {
      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const dd = String(tomorrow.getDate()).padStart(2, "0");
      setSelectedDate(`${yyyy}-${mm}-${dd}`);

      if (initialService) {
        setSelectedServiceId(initialService.id);
        const fmt = (initialService.format === "audio" ? "call" : initialService.format) as "chat" | "video" | "call";
        setSelectedFormat(fmt);
      } else if (specialist.services && specialist.services.length > 0) {
        setSelectedServiceId(specialist.services[0].id);
        const fmt = (specialist.services[0].format === "audio" ? "call" : specialist.services[0].format) as "chat" | "video" | "call";
        setSelectedFormat(fmt);
      }
    }
  }, [isOpen, initialService, specialist]);

  // Determine current active service and pricing
  const matchedService = specialist.services.find(
    (s) => s.id === selectedServiceId || s.format === (selectedFormat === "call" ? "audio" : selectedFormat)
  ) || specialist.services[0];

  const currentPrice = matchedService?.price || (selectedFormat === "chat" ? 80000 : selectedFormat === "call" ? 110000 : 180000);
  const currentDuration = matchedService?.duration_minutes || (selectedFormat === "chat" ? 20 : selectedFormat === "call" ? 30 : 45);
  const currentServiceName = matchedService?.name || (
    selectedFormat === "chat"
      ? "Tezkor matnli chat konsultatsiyasi"
      : selectedFormat === "call"
      ? "To'g'ridan-to'g'ri telefon/audio maslahat"
      : "To'liq yuzma-yuz video konsultatsiya"
  );

  const handleFormatChange = (fmt: "chat" | "video" | "call") => {
    setSelectedFormat(fmt);
    // Find matching service from specialist's catalog if available
    const serviceFmt = fmt === "call" ? "audio" : fmt;
    const existing = specialist.services.find((s) => s.format === serviceFmt);
    if (existing) {
      setSelectedServiceId(existing.id);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Iltimos, konsultatsiya kunini belgilang");
      return;
    }
    if (!selectedTimeSlot) {
      toast.error("Iltimos, konsultatsiya vaqt oralig'ini tanlang");
      return;
    }
    if (!userNotes.trim()) {
      toast.error("Iltimos, advokat masalani o'rganishi uchun muammoingiz mazmunini qisqacha bayon qiling");
      return;
    }

    setSubmitting(true);

    try {
      const scheduledDisplay = `${selectedDate}, ${selectedTimeSlot}`;
      const primaryCategory = specialist.categories[0]?.name_uz || "Fuqarolik huquqi";
      const specialistRole = `${primaryCategory} bo'yicha advokat`;

      const newBooking: StoredConsultation = {
        id: "c-" + Date.now(),
        specialist_id: specialist.id,
        specialist_name: specialist.full_name,
        specialist_title: specialistRole,
        specialist_role: specialistRole,
        specialist_avatar: specialist.avatar_url || undefined,
        category: primaryCategory,
        service_id: matchedService?.id || "serv-" + Date.now(),
        service_name: currentServiceName,
        duration_minutes: currentDuration,
        scheduled_at: scheduledDisplay,
        format: selectedFormat,
        status: "pending",
        status_label: "Kutilmoqda",
        status_color: "bg-amber-100 text-amber-800",
        price: currentPrice,
        currency: "UZS",
        description: userNotes.trim(),
        user_notes: userNotes.trim(),
        meeting_link: selectedFormat === "video" ? "https://meet.google.com/thm-legal-aid" : undefined,
        created_at: new Date().toISOString(),
      };

      // Fulfill Interface Contract 3: Save to localStorage immediately
      saveConsultation(newBooking);

      // Brief simulated escrow network registration
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitting(false);
      onClose();

      toast.success(
        "Konsultatsiya so'rovingiz qabul qilindi va eskrou tizimida ro'yxatga olindi!"
      );

      if (onSuccess) {
        onSuccess(newBooking);
      }

      router.push("/consultations");
    } catch {
      setSubmitting(false);
      toast.error("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] border-2 border-[#C5A059]/40 p-6 sm:p-7 shadow-2xl">
        <DialogHeader className="border-b border-[#E5E0D5] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B88E32]">
            <ShieldCheck className="h-4 w-4 text-[#B88E32]" />
            <span>Rasmiy Advokat Konsultatsiyasiga Yozilish</span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-[#0B132B] mt-1">
            {specialist.full_name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-600">
            {specialist.education} • {specialist.university} ({specialist.experience_years} yil sud amaliyoti)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmBooking} className="space-y-5 pt-3">
          {/* Format Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              1. Konsultatsiya formatini tanlang:
            </Label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleFormatChange("video")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFormat === "video"
                    ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md ring-2 ring-[#C5A059]/50"
                    : "bg-white text-slate-700 border-[#E2DDD5] hover:border-[#C5A059]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Video className={`h-4 w-4 ${selectedFormat === "video" ? "text-[#C5A059]" : "text-slate-500"}`} />
                  <span className="text-[10px] font-mono opacity-80">45 daqiqa</span>
                </div>
                <p className="font-semibold text-xs">Video Uchrashuv</p>
                <p className="text-[11px] font-mono mt-0.5 opacity-90">
                  {formatPrice(matchedService?.format === "video" ? matchedService.price : 180000)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange("chat")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFormat === "chat"
                    ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md ring-2 ring-[#C5A059]/50"
                    : "bg-white text-slate-700 border-[#E2DDD5] hover:border-[#C5A059]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <MessageSquare className={`h-4 w-4 ${selectedFormat === "chat" ? "text-[#C5A059]" : "text-slate-500"}`} />
                  <span className="text-[10px] font-mono opacity-80">15-30 daq</span>
                </div>
                <p className="font-semibold text-xs">Xavfsiz Chat</p>
                <p className="text-[11px] font-mono mt-0.5 opacity-90">
                  {formatPrice(matchedService?.format === "chat" ? matchedService.price : 80000)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFormatChange("call")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFormat === "call"
                    ? "bg-[#0B132B] text-white border-[#0B132B] shadow-md ring-2 ring-[#C5A059]/50"
                    : "bg-white text-slate-700 border-[#E2DDD5] hover:border-[#C5A059]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Phone className={`h-4 w-4 ${selectedFormat === "call" ? "text-[#C5A059]" : "text-slate-500"}`} />
                  <span className="text-[10px] font-mono opacity-80">20-30 daq</span>
                </div>
                <p className="font-semibold text-xs">Audio Qo&apos;ng&apos;iroq</p>
                <p className="text-[11px] font-mono mt-0.5 opacity-90">
                  {formatPrice(matchedService?.format === "audio" ? matchedService.price : 110000)}
                </p>
              </button>
            </div>
          </div>

          {/* Date & Shift Picker */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              2. Uchrashuv kuni va vaqt oralig&apos;i:
            </Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Uchrashuv sanasi:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#C5A059]/40 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B132B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Tanlangan vaqt oralig&apos;i:
                </label>
                <div className="h-9 px-3 rounded-lg border border-[#C5A059]/40 bg-[#F4F1EA] text-xs text-slate-900 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Clock className="h-3.5 w-3.5 text-[#B88E32]" />
                    {selectedTimeSlot}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-white border-[#C5A059]/50">
                    Ochiq darcha
                  </Badge>
                </div>
              </div>
            </div>

            {/* Time Slot Shifts */}
            <div className="space-y-2 pt-1 bg-white p-3 rounded-xl border border-[#E5E0D5]">
              <span className="text-[11px] text-slate-500 font-medium block">
                Mavjud advokatlik vaqt darchalari:
              </span>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 w-16 shrink-0">Ertalab:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_SLOTS.morning.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.label)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                          selectedTimeSlot === slot.label
                            ? "bg-[#0B132B] text-[#D4AF37] border-[#0B132B] font-bold shadow-sm"
                            : "bg-[#FAF8F5] text-slate-700 border-[#E2DDD5] hover:border-[#C5A059]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 w-16 shrink-0">Tushdan so&apos;ng:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_SLOTS.afternoon.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.label)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                          selectedTimeSlot === slot.label
                            ? "bg-[#0B132B] text-[#D4AF37] border-[#0B132B] font-bold shadow-sm"
                            : "bg-[#FAF8F5] text-slate-700 border-[#E2DDD5] hover:border-[#C5A059]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 w-16 shrink-0">Kechki:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_SLOTS.evening.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.label)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all ${
                          selectedTimeSlot === slot.label
                            ? "bg-[#0B132B] text-[#D4AF37] border-[#0B132B] font-bold shadow-sm"
                            : "bg-[#FAF8F5] text-slate-700 border-[#E2DDD5] hover:border-[#C5A059]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Problem Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="problem-notes" className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
              3. Muammoingiz mazmuni va huquqiy savol (Majburiy):
            </Label>
            <Textarea
              id="problem-notes"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Masalan: Ish beruvchi 2 oylik maoshni to'lamasdan noqonuniy ravishda bo'shatmoqda. Mehnat shartnomam mavjud, qanday da'vo arizasi kiritish mumkin?.."
              className="text-xs bg-white border-[#C5A059]/40 min-h-[90px] leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-500 italic">
              Advokat uchrashuvga qadar O&apos;zbekiston Respublikasi qonun hujjatlarini (Lex.uz) o&apos;rganib chiqishi uchun asosiy faktlarni yozing.
            </p>
          </div>

          {/* Escrow Guarantee Callout */}
          <div className="p-3.5 bg-[#FAF0D9]/80 rounded-xl border border-[#C5A059]/40 flex items-start gap-3 text-xs text-[#7E5919]">
            <Lock className="h-5 w-5 shrink-0 mt-0.5 text-[#B88E32]" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">
                100% Kafolatlangan Davlat va Eskrou Xavfsizligi
              </p>
              <p className="leading-relaxed text-[11px] text-slate-700">
                To&apos;lov xavfsiz eskrou hisobida saqlanadi. Konsultatsiya to&apos;liq o&apos;tkazilmaguncha mablag&apos; advokatga chiqarilmaydi. Agar advokat belgilangan vaqtda uchrashuvga chiqmasa, mablag&apos;ingiz 100% to&apos;liq qaytariladi.
              </p>
            </div>
          </div>

          {/* Summary & Confirmation */}
          <div className="p-3.5 bg-white rounded-xl border border-[#C5A059]/40 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                To&apos;lov summasi (15% QQS va xizmat haqi ichida)
              </span>
              <span className="text-xl font-serif font-bold text-[#0B132B]">
                {formatPrice(currentPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                <CheckCircle2 className="h-3 w-3" /> Kafolatlangan narx
              </span>
              <span className="text-[11px] text-slate-500">
                Qo&apos;shimcha komissiyalarsiz
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-between items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-[#C5A059]/40 text-xs w-full sm:w-auto"
            >
              Bekor qilish
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#0B132B] hover:bg-[#1A2849] text-[#FAF8F5] text-xs font-semibold px-6 gap-2 w-full sm:w-auto shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                  Eskrou tizimida rasmiylashtirilmoqda...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 text-[#D4AF37]" />
                  Konsultatsiyani Tasdiqlash
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
