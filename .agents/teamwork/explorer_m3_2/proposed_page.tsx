"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Shield,
  Star,
  MapPin,
  Clock,
  Video,
  MessageSquare,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Loader2,
  Award,
  Gavel,
  BookOpen,
  Lock,
  Building2,
  FileText,
  BadgeCheck,
  Scale,
  Sparkles,
  Search,
  AlertCircle,
  HelpCircle,
  Phone,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { REGIONS, PLATFORM_COMMISSION_PERCENT } from "@/lib/constants";
import { formatPrice, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Service } from "@/lib/types";

// Interface Contract 3 stored consultation model
interface StoredConsultation {
  id: string;
  specialist_id: string;
  specialist_name: string;
  specialist_title: string;
  specialist_avatar?: string;
  category: string;
  scheduled_at: string;
  format: "chat" | "video" | "call";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  price: number;
  description?: string;
  created_at: string;
}

// Judicial Court Representation Tier definition
interface CourtAdmission {
  id: string;
  name: string;
  code_name: string;
  jurisdiction: string;
  icon: typeof Scale;
  accredited: boolean;
}

const DEFAULT_COURT_ADMISSIONS: CourtAdmission[] = [
  {
    id: "civil",
    name: "Fuqarolik ishlari bo'yicha sudlar",
    code_name: "O'zbekiston Respublikasi Fuqarolik Protsessual Kodeksi (FPK)",
    jurisdiction: "Tumanlararo, shahar va viloyat fuqarolik sudlarida to'liq vakillik",
    icon: Scale,
    accredited: true,
  },
  {
    id: "economic",
    name: "Iqtisodiy sudlar (Arbitraj & Tijorat)",
    code_name: "O'zbekiston Respublikasi Iqtisodiy Protsessual Kodeksi (IPK)",
    jurisdiction: "Korporativ nizolar, shartnomaviy qarzlar va bankrotlik ishlari",
    icon: Building2,
    accredited: true,
  },
  {
    id: "administrative",
    name: "Ma'muriy sudlar",
    code_name: "O'zbekiston Respublikasi Ma'muriy Sud Ishlarini Yuritish Kodeksi (MSYoPK)",
    jurisdiction: "Davlat organlari, mansabdor shaxslar qarorlari va jarimalar ustidan shikoyat",
    icon: Gavel,
    accredited: true,
  },
  {
    id: "criminal",
    name: "Jinoyat ishlari bo'yicha sudlar",
    code_name: "O'zbekiston Respublikasi Jinoyat Protsessual Kodeksi (JPK)",
    jurisdiction: "Dastlabki tergov organlarida va sudda himoyachi sifatida qatnashish",
    icon: Shield,
    accredited: true,
  },
];

export default function SpecialistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const specId = params.id as string;

  // 1. Strict Specialist Lookup - Graceful Judicial Not-Found Handling
  const specialist = MOCK_SPECIALISTS.find((s) => s.id === specId);

  const [activeTab, setActiveTab] = useState<string>("services");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If specialist not found, render authentic judicial not-found dossier
  if (!specialist) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Link
          href="/specialists"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-[#0D1B34] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Advokatlar reyestriga qaytish
        </Link>

        <div className="parchment-card rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-[#C5A059]/40 space-y-5">
          <div className="h-16 w-16 mx-auto rounded-full bg-[#FAF0D9] border-2 border-[#C5A059] flex items-center justify-center text-[#8E6F24] shadow-sm">
            <Shield className="h-8 w-8 stroke-[1.75]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8E6F24] font-bold">
              REYESTR YOZUVI TOPILMADI
            </span>
            <h1 className="font-editorial-heading text-2xl sm:text-3xl font-bold text-[#0D1B34]">
              Advokat Shaxsiy Daftari Mavjud Emas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Qidirilayotgan identifikator (<code className="font-mono bg-white px-1.5 py-0.5 rounded border text-[#0D1B34]">#{specId}</code>) bo&apos;yicha Adliya Vazirligi reyestrida faol advokat topilmadi yoki sahifa manzili o&apos;zgargan.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/specialists">
              <Button className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-2 px-5 py-2.5 shadow-sm">
                <Search className="h-3.5 w-3.5 text-[#D4AF37]" />
                Reyestrdan Boshqa Advokat Izlash
              </Button>
            </Link>
            <Link href="/ai-chat">
              <Button variant="outline" className="border-[#C5A059]/50 text-xs gap-2 px-5 py-2.5">
                <Sparkles className="h-3.5 w-3.5 text-[#0D47A1]" />
                AI Huquqiy Tahlilga O&apos;tish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Derive authentic legal chamber license credentials
  const licenseNumber =
    (specialist as { license_number?: string }).license_number ||
    (specialist.admin_notes?.match(/#ADV-\d+/)?.[0]) ||
    (specialist.id === "spec-1"
      ? "#ADV-1082"
      : specialist.id === "spec-2"
      ? "#ADV-3490"
      : specialist.id === "spec-3"
      ? "#ADV-4921"
      : `#ADV-${specialist.id.replace(/\D/g, "") || "7042"}`);

  const verificationDate = "2026-yil 15-yanvar";
  const chamberAffiliation = "O'zbekiston Respublikasi Advokatlar Palatasi a'zosi";
  const regionName = REGIONS.find((r) => r.id === specialist.region)?.name_uz || "O'zbekiston";

  // Comprehensive Services Catalog (Ensuring all 4 standard chamber offerings are represented)
  const fullServicesList: Service[] = [...specialist.services];

  // If written memorandum service is missing in mock data, augment with authentic chamber offering
  const hasWrittenOpinion = fullServicesList.some((s) => s.format === "chat" && s.price > 100000);
  if (!hasWrittenOpinion) {
    fullServicesList.push({
      id: `serv-opinion-${specialist.id}`,
      specialist_id: specialist.id,
      name: "Hujjat huquqiy tahlili va rasmiy yozma xulosa",
      description: "Shartnoma, buyruq yoki sud hujjatlarini O'zbekiston qonunchiligi (Lex.uz) asosida to'liq ekspertiza qilish va xulosani rasmiy muhr bilan taqdim etish",
      duration_minutes: 60,
      price: 250000,
      currency: "UZS",
      format: "chat",
      is_active: true,
      created_at: specialist.created_at,
      updated_at: specialist.updated_at,
    });
  }

  // Open booking modal with prefilled slot
  const handleOpenBooking = (service: Service) => {
    setSelectedService(service);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    setBookingDate(tomorrow.toISOString().slice(0, 16));
    setBookingDialogOpen(true);
  };

  // Quick preset slot helper
  const handleSelectSlotPreset = (daysAhead: number, hour: number, minute: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, minute, 0, 0);
    // Pad to local ISO format YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setBookingDate(localIso);
  };

  // Interface Contract 3: Save booking directly to localStorage.getItem("themis_consultations")
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error("Iltimos, konsultatsiya vaqtini belgilang");
      return;
    }
    if (!selectedService) {
      toast.error("Iltimos, xizmat tarifini tanlang");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Construct standard consultation item
      const newConsultation: StoredConsultation = {
        id: `c-${Date.now()}`,
        specialist_id: specialist.id,
        specialist_name: specialist.full_name,
        specialist_title: specialist.education || "Advokat",
        specialist_avatar: specialist.avatar_url || undefined,
        category: specialist.categories[0]?.name_uz || "Umumiy huquq",
        scheduled_at: bookingDate,
        format: selectedService.format,
        status: "pending",
        price: selectedService.price,
        description: userNotes.trim() || undefined,
        created_at: new Date().toISOString(),
      };

      // 2. Read existing consultations from localStorage
      let existingList: StoredConsultation[] = [];
      try {
        const raw = localStorage.getItem("themis_consultations");
        if (raw) {
          existingList = JSON.parse(raw);
          if (!Array.isArray(existingList)) existingList = [];
        }
      } catch {
        existingList = [];
      }

      // 3. Prepend newly booked consultation to front of list
      existingList.unshift(newConsultation);
      localStorage.setItem("themis_consultations", JSON.stringify(existingList));

      // Simulate fast network roundtrip for UI feedback
      setTimeout(() => {
        setSubmitting(false);
        setBookingDialogOpen(false);
        toast.success(
          "Konsultatsiya so'rovingiz qabul qilindi va Themis eskrou tizimida ro'yxatga olindi!"
        );
        router.push("/consultations");
      }, 700);
    } catch (err) {
      setSubmitting(false);
      toast.error("Konsultatsiyani saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Official Header Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Link
            href="/specialists"
            className="inline-flex items-center gap-1.5 hover:text-[#0D1B34] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Advokatlar reyestri
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-mono text-slate-700 font-semibold">
            Chamber Dossier {licenseNumber}
          </span>
        </div>

        {/* Live presence indicator */}
        <div className="flex items-center gap-3">
          {specialist.is_online ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              Hozir onlayn • Qabulga tayyor
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
              <Clock className="h-3 w-3 text-slate-500" />
              Navbat asosida • Xabarlarga javob beradi
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Adliya Vazirligi Akkreditatsiyasi
          </span>
        </div>
      </div>

      {/* 2. Official Advocate Dossier Masthead */}
      <div className="legal-memorandum parchment-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border-2 border-[#C5A059]/40 shadow-sm">
        {/* Subtle decorative judicial watermark */}
        <div className="absolute -right-8 -bottom-8 pointer-events-none opacity-[0.03] text-[#0D1B34]">
          <Gavel className="h-64 w-64 rotate-12" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1">
            {/* Portrait with Judicial Seal Ring */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-[#C59B27]/25 border-2 border-[#C5A059] shadow-md">
                <AvatarFallback className="bg-[#0D1B34] text-[#D4AF37] font-serif font-bold text-3xl sm:text-4xl">
                  {getInitials(specialist.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* Verified badge emblem on portrait */}
              <div
                title="Adliya Vazirligi davlat ro'yxatidan o'tgan"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Advocate Core Details */}
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-editorial-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D1B34] tracking-tight">
                  {specialist.full_name}
                </h1>

                {/* State License Badge */}
                <span className="legal-seal">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                  <span>Litsenziya {licenseNumber}</span>
                </span>
              </div>

              {/* Pedigree & Affiliation */}
              <p className="text-xs sm:text-sm text-slate-700 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{specialist.education}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[#0D47A1] font-semibold">{specialist.university}</span>
                {specialist.graduation_year && (
                  <span className="text-slate-500">({specialist.graduation_year}-yil)</span>
                )}
              </p>

              {/* Chamber & Credential Ticker */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600 font-mono pt-0.5">
                <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-[#FAF0D9]/80 px-2 py-0.5 rounded border border-[#C5A059]/30">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                  {specialist.rating_avg.toFixed(1)} ({specialist.rating_count} sharh)
                </span>

                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {specialist.experience_years} yil amaliyot
                </span>

                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {specialist.consultation_count} ta maslahat
                </span>

                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {regionName}
                </span>
              </div>

              {/* Legal Specializations List */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialist.categories.map((c) => (
                  <span
                    key={c.id}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF7EE] text-[#7E5919] border border-[#C5A059]/40 font-semibold"
                  >
                    {c.name_uz}
                  </span>
                ))}
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {chamberAffiliation}
                </span>
              </div>
            </div>
          </div>

          {/* Masthead Fast-Booking Callout */}
          <div className="w-full lg:w-auto shrink-0 p-4 rounded-xl bg-white/80 border border-[#C5A059]/30 backdrop-blur-sm flex flex-col justify-between space-y-3 min-w-[240px]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                Rasmiy Tariflar Asosida
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold text-[#0D1B34]">
                  {fullServicesList[0] ? formatPrice(fullServicesList[0].price) : "70 000 UZS"}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">/ boshlang&apos;ich</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded border border-emerald-200 flex items-start gap-1.5">
              <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" />
              <span>100% Eskrou xavfsizlik kafolati (Adliya standarti)</span>
            </div>

            <Button
              onClick={() => {
                if (fullServicesList[0]) handleOpenBooking(fullServicesList[0]);
              }}
              className="w-full bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs font-semibold gap-1.5 py-2 shadow-sm"
            >
              <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
              Konsultatsiyaga Yozilish
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Deep Legal Chamber Dossier Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#FAF7EE] border border-[#C5A059]/40 p-1.5 rounded-xl grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-1">
          <TabsTrigger
            value="services"
            className="text-xs font-medium py-2 rounded-lg data-[state=active]:bg-[#0D1B34] data-[state=active]:text-white data-[state=active]:font-bold transition-all"
          >
            Tariflar & Yozilish
          </TabsTrigger>
          <TabsTrigger
            value="credentials"
            className="text-xs font-medium py-2 rounded-lg data-[state=active]:bg-[#0D1B34] data-[state=active]:text-white data-[state=active]:font-bold transition-all"
          >
            Sud Amaliyoti & Vakolatlar
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="text-xs font-medium py-2 rounded-lg data-[state=active]:bg-[#0D1B34] data-[state=active]:text-white data-[state=active]:font-bold transition-all"
          >
            Tarjimai Hol & Ta&apos;lim
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="text-xs font-medium py-2 rounded-lg data-[state=active]:bg-[#0D1B34] data-[state=active]:text-white data-[state=active]:font-bold transition-all"
          >
            Mijozlar Bahosi ({specialist.reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* ============================================================
            TAB 1: Service & Tariff Matrix
            ============================================================ */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fullServicesList.map((service) => (
              <div
                key={service.id}
                className="paper-card rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-[#C5A059] transition-all bg-white"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20 flex items-center gap-1.5 font-bold uppercase">
                      {service.format === "video" ? (
                        <Video className="h-3.5 w-3.5 text-[#0D47A1]" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-[#0D47A1]" />
                      )}
                      {service.format === "video" ? "Onlayn Video Uchrashuv" : "Matnli Xavfsiz Konsultatsiya"}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {service.duration_minutes} daqiqa
                    </span>
                  </div>

                  <h3 className="font-editorial-heading text-lg sm:text-xl font-bold text-[#0D1B34] leading-snug">
                    {service.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {service.description || "Advokat tomonidan to'liq huquqiy tahlil va amaliy maslahat beriladi."}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                      To&apos;lov qiymati (QQS va komissiya bilan)
                    </span>
                    <span className="text-lg font-bold text-[#0D1B34]">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleOpenBooking(service)}
                    className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs font-semibold gap-1.5 shadow-sm px-4"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Yozilish
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Courtroom Trial Representation Notice & Inquiry Card */}
          <div className="statute-border-gold rounded-xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#8E6F24] font-mono uppercase tracking-wide">
              <Gavel className="h-4 w-4 text-[#C59B27]" />
              <span>Sudda vakillik va order asosida himoya so&apos;rovi</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Fuqarolik, iqtisodiy, ma&apos;muriy yoki jinoyat sudlarida rasmiy advokatlik orderi va shartnoma asosida sudda qatnashish talab etilsa, oldindan konsultatsiya o&apos;tkazilib, ish hajmi va shartnoma summasi tomonlar kelishuvi bilan imzolanadi.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Tarif: Individual yuridik shartnoma asosida</span>
              <span className="text-[#0D47A1] font-semibold underline cursor-pointer" onClick={() => {
                if (fullServicesList[0]) handleOpenBooking(fullServicesList[0]);
              }}>
                Birlamchi tahlil uchun yozilish &rarr;
              </span>
            </div>
          </div>

          {/* Transparent Commission & 100% Escrow Guarantee Notice */}
          <div className="p-5 rounded-xl bg-[#FAF0D9]/60 border border-[#C5A059]/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7E5919] uppercase tracking-wider">
              <Lock className="h-4 w-4 text-[#C59B27]" />
              <span>100% Xavfsiz Eskrou va Shafofflik Kafolati</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Eskrou himoya tizimi:</p>
                <p className="text-slate-600 leading-relaxed">
                  Mablag&apos;ingiz Themis kafolatlangan hisobida saqlanadi. Konsultatsiya to&apos;liq va muvaffaqiyatli o&apos;tkazilmaguncha pul advokatga to&apos;lanmaydi. Agar uchrashuv o&apos;tkazilmasa, mablag&apos; to&apos;liq qaytariladi.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Yashirin to&apos;lovlarsiz:</p>
                <p className="text-slate-600 leading-relaxed">
                  Platformaning {PLATFORM_COMMISSION_PERCENT}% texnik xizmat haqi ko&apos;rsatilgan tariflar ichiga kiritilgan. Hech qanday qo&apos;shimcha to&apos;lovlar undirilmaydi.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 2: Court Practice & Judicial Credentials
            ============================================================ */}
        <TabsContent value="credentials" className="space-y-6">
          {/* Court Representation Rights Matrix */}
          <div className="paper-card rounded-xl p-6 space-y-4">
            <div className="border-b border-[#E5E0D5] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6F24] font-bold block mb-1">
                RASMIY SUD VAKOLATLARI
              </span>
              <h3 className="font-editorial-heading text-xl font-bold text-[#0D1B34]">
                Sud Instansiyalarida Vakillik Huquqi
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                O&apos;zbekiston Respublikasi Advokatlik to&apos;g&apos;risidagi Qonuniga muvofiq quyidagi sud tizimlarida ishonchnoma va order bilan himoya huquqi tasdiqlangan:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {DEFAULT_COURT_ADMISSIONS.map((court) => {
                const IconComponent = court.icon;
                return (
                  <div
                    key={court.id}
                    className="p-4 rounded-xl bg-[#FDFCF9] border border-[#E5E0D5] hover:border-[#C5A059]/60 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[#FAF0D9] text-[#8E6F24] flex items-center justify-center">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34]">
                          {court.name}
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Akkreditatsiyalangan
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      {court.jurisdiction}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[10px] font-mono text-[#0D47A1]">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate">{court.code_name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Bar Registry Card */}
          <div className="notary-stamp paper-card rounded-xl p-6 space-y-4 bg-[#FAF7EE]/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0D5] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6F24] font-bold block mb-0.5">
                  DAVLAT REYESTRI MA&apos;LUMOTLARI
                </span>
                <h3 className="font-editorial-heading text-lg font-bold text-[#0D1B34]">
                  Advokat Guvohnomasi va Palata A&apos;zoligi
                </h3>
              </div>
              <span className="legal-seal self-start sm:self-auto">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-700" />
                Muddatsiz Litsenziya
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5]">
                <span className="text-[10px] uppercase text-slate-400 block">Litsenziya Raqami</span>
                <span className="font-bold text-[#0D1B34] text-sm mt-0.5 block">{licenseNumber}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5]">
                <span className="text-[10px] uppercase text-slate-400 block">Ro&apos;yxatga Olgan Organ</span>
                <span className="font-bold text-[#0D1B34] text-xs mt-0.5 block truncate">Adliya Vazirligi</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5]">
                <span className="text-[10px] uppercase text-slate-400 block">Tekshirilgan Sana</span>
                <span className="font-bold text-[#0D1B34] text-xs mt-0.5 block">{verificationDate}</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5]">
                <span className="text-[10px] uppercase text-slate-400 block">Advokatlik Maqomi</span>
                <span className="font-bold text-emerald-700 text-xs mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Amaldagi Faol
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 3: Biography, Pedigree & Languages
            ============================================================ */}
        <TabsContent value="about" className="space-y-6">
          <div className="paper-card rounded-xl p-6 sm:p-7 space-y-6 bg-white">
            {/* Executive Bio */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6F24] font-bold block mb-1">
                TARJIMAI HOL & AMALIYOT SOHASI
              </span>
              <h3 className="font-editorial-heading text-xl font-bold text-[#0D1B34] mb-3">
                Advokat Haqida
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed bg-[#FDFCF9] p-5 rounded-xl border border-[#E5E0D5] relative">
                <p className="font-serif italic text-base text-[#0D1B34] mb-2">
                  &ldquo;Har bir fuqaro va tadbirkorning qonuniy manfaatlari O&apos;zbekiston Respublikasi Konstitutsiyasi va qonunlari bilan kafolatlangan.&rdquo;
                </p>
                <p className="font-sans leading-relaxed text-slate-700">
                  {specialist.bio || "Oliy toifali advokat. Fuqarolik, mehnat va xo'jalik nizolari bo'yicha uzoq yillik muvaffaqiyatli sud tajribasiga ega."}
                </p>
              </div>
            </div>

            {/* Pedigree & Education */}
            <div className="pt-4 border-t border-[#E5E0D5]">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8E6F24] font-bold mb-3 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span>Oliy Ta&apos;lim va Ilmiy Unvon:</span>
              </h4>
              <div className="p-4 rounded-xl bg-[#FAF7EE] border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-editorial-heading font-bold text-base text-[#0D1B34]">
                    {specialist.university}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {specialist.education} • Tamomlagan yili: {specialist.graduation_year || "2015"}-yil
                  </p>
                </div>
                <span className="seal-badge text-[10px] self-start sm:self-auto">
                  Davlat Diplomi Tasdiqlangan
                </span>
              </div>
            </div>

            {/* Career Timeline */}
            <div className="pt-4 border-t border-[#E5E0D5]">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8E6F24] font-bold mb-3.5 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>Mehnat Faoliyati va Sud Amaliyoti:</span>
              </h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-[#C5A059]/40 ml-2">
                {specialist.previous_workplaces && specialist.previous_workplaces.length > 0 ? (
                  specialist.previous_workplaces.map((w, i) => (
                    <div key={i} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#0D1B34] border-2 border-white ring-2 ring-[#C5A059]" />
                      <p className="text-xs font-bold text-slate-900">{w.company}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {w.position} ({w.start_year} — {w.end_year || "hozirgacha"})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-mono">
                    Mustaqil advokatlik faoliyati ({specialist.experience_years} yil amaliyot)
                  </p>
                )}
              </div>
            </div>

            {/* Language Competencies */}
            <div className="pt-4 border-t border-[#E5E0D5]">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#8E6F24] font-bold mb-2.5 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Ish Yuritish va Muloqot Tillari:</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {specialist.languages.map((l) => {
                  const label =
                    l === "uz"
                      ? "O'zbek tili (Rasmiy sud ish yuritish tili)"
                      : l === "ru"
                      ? "Rus tili (Professional muloqot)"
                      : l === "en"
                      ? "Ingliz tili (Xalqaro shartnomalar)"
                      : l === "kk"
                      ? "Qoraqalpoq tili (Respublika tili)"
                      : l;
                  return (
                    <span
                      key={l}
                      className="text-xs font-mono px-3 py-1 rounded-lg bg-[#FAF7EE] text-slate-800 border border-[#C5A059]/30 font-semibold"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 4: Reviews & Case Resolution Track Record
            ============================================================ */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Case Resolution Statistics KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="paper-card rounded-xl p-4 bg-white text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                O&apos;tkazilgan maslahatlar
              </span>
              <span className="font-editorial-heading text-2xl font-bold text-[#0D1B34] block">
                {specialist.consultation_count} ta
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">100% rasmiy qayd</span>
            </div>

            <div className="paper-card rounded-xl p-4 bg-white text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                O&apos;rtacha Mijoz Bahosi
              </span>
              <span className="font-editorial-heading text-2xl font-bold text-amber-700 block">
                {specialist.rating_avg.toFixed(1)} ★
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {specialist.rating_count} ta tasdiqlangan ovoz
              </span>
            </div>

            <div className="paper-card rounded-xl p-4 bg-white text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Tavsiya Qilish Ulushi
              </span>
              <span className="font-editorial-heading text-2xl font-bold text-[#0D47A1] block">
                98%
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">Yuqori ishonch</span>
            </div>

            <div className="paper-card rounded-xl p-4 bg-white text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                O&apos;rtacha Javob Vaqti
              </span>
              <span className="font-editorial-heading text-2xl font-bold text-[#0D1B34] block">
                ~15 daq
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Tezkor aloqa</span>
            </div>
          </div>

          {/* Client Testimonials List */}
          <div className="space-y-4">
            {specialist.reviews && specialist.reviews.length > 0 ? (
              specialist.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="paper-card rounded-xl p-5 sm:p-6 space-y-3 bg-white border border-[#E5E0D5]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(Math.max(0, 5 - rev.rating))}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {rev.rating}.0 / 5.0
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto font-semibold">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Tasdiqlangan Mijoz • Yakunlangan Konsultatsiya
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {rev.specialist_reply && (
                    <div className="mt-3 p-3.5 bg-[#FAF7EE] rounded-lg border-l-2 border-[#C5A059] text-xs text-slate-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-[#0D1B34] font-mono text-[10px] uppercase font-bold">
                        <Gavel className="h-3 w-3 text-[#8E6F24]" />
                        <span>Advokatning Rasmiy Javobi:</span>
                      </div>
                      <p className="font-sans leading-relaxed text-slate-700">
                        {rev.specialist_reply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Graceful Empty Review State */
              <div className="paper-card rounded-xl p-8 text-center space-y-3 bg-white border-dashed border-[#C5A059]/50">
                <div className="h-12 w-12 mx-auto rounded-full bg-[#FAF0D9] text-[#8E6F24] flex items-center justify-center">
                  <Star className="h-6 w-6 stroke-[1.75]" />
                </div>
                <h4 className="font-editorial-heading text-lg font-bold text-[#0D1B34]">
                  Hozircha Sharhlar Mavjud Emas
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Ushbu advokat yaqinda Themis yuridik platformasida akkreditatsiyadan o&apos;tgan. Birinchi bo&apos;lib konsultatsiyadan foydalaning va sharh qoldiring!
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      if (fullServicesList[0]) handleOpenBooking(fullServicesList[0]);
                    }}
                    className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1.5 shadow-sm"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Birinchi Bo&apos;lib Yozilish
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================
          CONSULTATION BOOKING DIALOG (Interface Contract 3)
          ============================================================ */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#FAF8F5] border-2 border-[#C5A059]/40 p-6 sm:p-7">
          <DialogHeader className="border-b border-[#E5E0D5] pb-3 text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6F24] font-bold block mb-0.5">
              RASMIY HUQUQIY UCHRASHUV
            </span>
            <DialogTitle className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
              Konsultatsiyaga Yozilish
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 font-sans">
              Advokat {specialist.full_name} ({licenseNumber}) qabuliga rasmiy so&apos;rov yuborish
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 pt-2">
              {/* Selected Tariff Summary */}
              <div className="p-3.5 bg-white rounded-xl border border-[#C5A059]/40 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#0D47A1]">
                    {selectedService.format === "video" ? "Video Konsultatsiya" : "Matnli Chat"}
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {selectedService.duration_minutes} daqiqa
                  </span>
                </div>
                <p className="font-editorial-heading font-bold text-base text-[#0D1B34]">
                  {selectedService.name}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-600 font-mono pt-1 border-t border-slate-100">
                  <span>To&apos;lov qiymati (Eskrou):</span>
                  <span className="font-bold text-[#0D1B34] text-sm">
                    {formatPrice(selectedService.price)}
                  </span>
                </div>
              </div>

              {/* Slot Quick Presets */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Tavsiya etilgan qabul vaqtlari (1-bosishda tanlang):
                </Label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectSlotPreset(1, 10, 0)}
                    className="p-2 rounded-lg bg-white border border-[#C5A059]/30 hover:border-[#0D1B34] text-slate-700 font-mono text-[11px] text-center transition-colors"
                  >
                    Ertaga, 10:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSlotPreset(1, 14, 0)}
                    className="p-2 rounded-lg bg-white border border-[#C5A059]/30 hover:border-[#0D1B34] text-slate-700 font-mono text-[11px] text-center transition-colors"
                  >
                    Ertaga, 14:00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSlotPreset(1, 16, 30)}
                    className="p-2 rounded-lg bg-white border border-[#C5A059]/30 hover:border-[#0D1B34] text-slate-700 font-mono text-[11px] text-center transition-colors"
                  >
                    Ertaga, 16:30
                  </button>
                </div>
              </div>

              {/* Precise Date/Time Picker */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-semibold text-slate-700">
                  Yoki aniq sana va vaqtni tanlang:
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="bg-white border-[#C5A059]/40 text-xs h-10 font-mono"
                  required
                />
              </div>

              {/* Problem Description Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                  Muammoingiz mazmuni haqida qisqacha:
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Advokat oldindan tanishib chiqishi uchun nizoli holat, shartnoma yoki huquq buzilishini qisqacha tasvirlang..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="text-xs bg-white border-[#C5A059]/40 min-h-[85px] leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 font-mono block text-right">
                  {userNotes.length} belgi kiritildi
                </span>
              </div>

              {/* Escrow Guarantee Callout */}
              <div className="p-3 bg-[#FAF0D9] rounded-lg border border-[#C5A059]/40 flex items-start gap-2.5 text-[11px] text-[#7E5919]">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 text-[#B88E32]" />
                <span className="leading-relaxed">
                  To&apos;lov Themis eskrou hisobida xavfsiz saqlanadi. Konsultatsiya to&apos;liq o&apos;tkazilmaguncha mablag&apos; advokatga o&apos;tkazilmaydi.
                </span>
              </div>

              <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBookingDialogOpen(false)}
                  className="border-[#C5A059]/40 text-xs"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-2 font-semibold shadow-sm"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Buyurtmani Tasdiqlash
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
