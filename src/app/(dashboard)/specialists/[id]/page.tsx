"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Gavel,
  BookOpen,
  Lock,
  Building2,
  BadgeCheck,
  Scale,
  Sparkles,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { REGIONS, PLATFORM_COMMISSION_PERCENT } from "@/lib/constants";
import { formatPrice, getInitials } from "@/lib/utils";
import { Service } from "@/lib/types";
import { ConsultationBookingDialog } from "@/components/modals/consultation-booking-dialog";

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
  const specId = params.id as string;

  // 1. Strict Specialist Lookup - Graceful Judicial Not-Found Handling
  const specialist = MOCK_SPECIALISTS.find((s) => s.id === specId);

  const [activeTab, setActiveTab] = useState<string>("services");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D1B34]">
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
    specialist.license_number ||
    (specialist.admin_notes?.match(/#ADV-\d+/)?.[0]) ||
    (specialist.id === "spec-1"
      ? "#ADV-3810"
      : specialist.id === "spec-2"
      ? "#ADV-4192"
      : specialist.id === "spec-3"
      ? "#ADV-4921"
      : `#ADV-${specialist.id.replace(/\D/g, "") || "7042"}`);

  const verificationDate = "2026-yil 15-yanvar";
  const chamberAffiliation = specialist.chamber_name || "O'zbekiston Respublikasi Advokatlar Palatasi a'zosi";
  const regionName = REGIONS.find((r) => r.id === specialist.region)?.name_uz || "O'zbekiston";

  // Comprehensive Services Catalog (Ensuring all standard chamber offerings are represented)
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

  // Open booking modal with prefilled service
  const handleOpenBooking = (service: Service) => {
    setSelectedService(service);
    setBookingDialogOpen(true);
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
              Hozir onlayn qabulda
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
              <Clock className="h-3 w-3 text-slate-400" />
              Navbat asosida qabul
            </span>
          )}

          <Badge variant="outline" className="font-mono text-[10px] bg-[#FAF7EE] border-[#C5A059]/60 text-[#8E6F24]">
            Reestr: 2026-N/UZ
          </Badge>
        </div>
      </div>

      {/* 2. Official Legal Chamber Dossier Masthead */}
      <div className="parchment-card rounded-2xl p-6 sm:p-8 border-2 border-[#C5A059]/40 relative overflow-hidden shadow-sm">
        {/* Archival Heraldic Background Watermark */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-[0.03] pointer-events-none select-none">
          <Shield className="h-96 w-96 text-[#0D1B34]" />
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8 relative z-10">
          {/* Avatar with Double Gold Judicial Seal Frame */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div className="relative p-1 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#C5A059] to-[#8E6F24] shadow-md">
              <div className="p-0.5 rounded-[14px] bg-[#FAF7EE]">
                <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl bg-white">
                  <AvatarFallback className="rounded-xl bg-gradient-to-b from-[#0D1B34] to-[#152A4F] text-[#FAF7EE] font-serif text-3xl sm:text-4xl font-bold tracking-wider">
                    {getInitials(specialist.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Official State Verified Shield Badge */}
            <div
              className="absolute -bottom-2 -right-2 bg-emerald-700 text-white p-1.5 rounded-full shadow-md border-2 border-[#FAF7EE]"
              title="Adliya Vazirligi tomonidan tasdiqlangan"
            >
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>

          {/* Dossier Information Body */}
          <div className="flex-1 space-y-3.5 text-center md:text-left">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="legal-seal px-2.5 py-0.5 text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                  <span>{licenseNumber}</span>
                  <span className="text-emerald-900/60">•</span>
                  <span>Adliya Vazirligi Litsenziyasi</span>
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-50 text-blue-900 border border-blue-200">
                  <Gavel className="h-3 w-3 text-[#0D47A1]" />
                  <span>{chamberAffiliation}</span>
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D1B34] tracking-tight">
                {specialist.full_name}
              </h1>

              <p className="text-sm text-slate-700 font-medium">
                {specialist.education} • {specialist.university} ({specialist.graduation_year}-yil)
              </p>
            </div>

            {/* Legal Specialization Branches */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-0.5">
              {specialist.categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className="bg-white/80 hover:bg-white text-slate-800 border border-[#C5A059]/40 text-xs px-2.5 py-1 font-sans"
                >
                  {cat.name_uz}
                </Badge>
              ))}
              <Badge
                variant="outline"
                className="text-xs text-slate-600 border-[#C5A059]/40 flex items-center gap-1 font-mono"
              >
                <MapPin className="h-3 w-3 text-[#B84A2A]" />
                {regionName} yurisdiksiyasi
              </Badge>
            </div>

            {/* Chamber Trust Metric Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-[#E5E0D5] text-xs">
              <div className="text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Reyting bahosi
                </span>
                <span className="font-bold text-[#0D1B34] flex items-center justify-center md:justify-start gap-1 text-sm mt-0.5">
                  <Star className="h-3.5 w-3.5 fill-[#C59B27] text-[#C59B27]" />
                  {specialist.rating_avg.toFixed(1)}
                  <span className="text-slate-400 text-[11px] font-normal">
                    ({specialist.rating_count} ta sharh)
                  </span>
                </span>
              </div>

              <div className="text-center md:text-left border-x border-[#E5E0D5] px-2 sm:px-4">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Sud amaliyoti
                </span>
                <span className="font-bold text-[#0D1B34] text-sm mt-0.5 block font-mono">
                  {specialist.experience_years} yil amaliy tajriba
                </span>
              </div>

              <div className="text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  O&apos;tkazilgan ishlar
                </span>
                <span className="font-bold text-[#0D47A1] text-sm mt-0.5 block font-mono">
                  {specialist.consultation_count} ta konsultatsiya
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tariff Card & Call to Action in Masthead */}
          <div className="w-full md:w-64 p-4 rounded-xl bg-white border border-[#C5A059]/50 shadow-sm space-y-3 text-center md:text-left shrink-0">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Birlamchi maslahat narxi
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-[#0D1B34]">
                  {formatPrice(fullServicesList[0]?.price || 70000)}
                </span>
                <span className="text-[11px] text-slate-500 font-sans">/ seans</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium flex items-center justify-center md:justify-start gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3" />
                100% Eskrou xavfsiz to&apos;lov
              </span>
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

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0D1B34] leading-snug">
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
              <span
                className="text-[#0D47A1] font-semibold underline cursor-pointer"
                onClick={() => {
                  if (fullServicesList[0]) handleOpenBooking(fullServicesList[0]);
                }}
              >
                Birlamchi tahlil uchun yozilish &rarr;
              </span>
            </div>
          </div>

          {/* Transparent Commission & 100% Escrow Guarantee Notice */}
          <div className="p-5 rounded-xl bg-[#FAF0D9]/60 border border-[#C5A059]/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7E5919] uppercase tracking-wider">
              <Lock className="h-4 w-4 text-[#C59B27]" />
              <span>Davlat Litsenziyasi va Themis Eskrou Kafolati</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed font-sans">
              <p>
                <strong className="text-[#0D1B34]">Shaffof Tarif:</strong> Platforma komissiyasi ({PLATFORM_COMMISSION_PERCENT}%) advokat xizmati narxi ichida bo&apos;lib, fuqarolardan hech qanday yashirin to&apos;lov undirilmaydi.
              </p>
              <p>
                <strong className="text-[#0D1B34]">100% Pul Qaytarish Kafolati:</strong> Agar advokat belgilangan vaqtda konsultatsiyaga chiqmasa yoki maslahat sifatsiz bo&apos;lsa, mablag&apos;ingiz to&apos;liq qaytariladi.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 2: Court Admissions & Procedural Scope
            ============================================================ */}
        <TabsContent value="credentials" className="space-y-6">
          <div className="parchment-card rounded-2xl p-6 sm:p-8 border border-[#C5A059]/40 space-y-6 bg-white">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6F24] font-bold block mb-1">
                RASMIY VAKOLAT VA AKKREDITATSIYA
              </span>
              <h3 className="font-serif text-xl font-bold text-[#0D1B34]">
                O&apos;zbekiston Respublikasi Sudlarida Himoya Qilish Huquqi
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Advokat {specialist.full_name} quyidagi sud instantsiyalarida ishonchnoma va advokatlik orderi asosida fuqarolar va yuridik shaxslar manfaatlarini to&apos;liq himoya qilish vakolatiga ega.
              </p>
            </div>

            {/* 4 Court Representation Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEFAULT_COURT_ADMISSIONS.map((court) => (
                <div
                  key={court.id}
                  className="p-4 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5]/80 space-y-2 hover:border-[#C5A059] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#0D1B34] text-[#D4AF37]">
                        <court.icon className="h-4 w-4" />
                      </div>
                      <h4 className="font-serif text-sm font-bold text-[#0D1B34]">
                        {court.name}
                      </h4>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-mono">
                      Vakolatli
                    </Badge>
                  </div>

                  <p className="text-[11px] font-mono text-[#8E6F24]">
                    {court.code_name}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {court.jurisdiction}
                  </p>
                </div>
              ))}
            </div>

            {/* Official State Registry Record Card */}
            <div className="p-5 rounded-xl border-2 border-dashed border-[#C5A059]/40 bg-[#FAF7EE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#8E6F24] uppercase">
                  Adliya Vazirligi Davlat Reyestri Ma&apos;lumotnomasi
                </span>
                <span className="text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Muddatsiz Litsenziya
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Litsenziya Raqami
                  </span>
                  <span className="font-mono font-bold text-[#0D1B34]">
                    {licenseNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Palata A&apos;zoligi
                  </span>
                  <span className="font-sans font-semibold text-slate-800">
                    Advokatlar Palatasi
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Tekshiruv Sanasi
                  </span>
                  <span className="font-mono text-slate-700">
                    {verificationDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Hududiy Boshqarma
                  </span>
                  <span className="font-sans text-slate-700">
                    {regionName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 3: Bio, Education & Pedigree Timeline
            ============================================================ */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Biography & Timeline */}
            <div className="md:col-span-2 space-y-6">
              <div className="paper-card rounded-2xl p-6 sm:p-8 bg-white space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0D1B34]">
                  Advokat Haqida
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  {specialist.bio ||
                    "O'zbekiston Respublikasi qonunlari doirasida fuqarolik, mehnat va tijorat masalalari bo'yicha professional yuridik xizmat ko'rsatib kelmoqdaman."}
                </p>

                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D5] flex items-center gap-3 text-xs">
                  <BookOpen className="h-5 w-5 text-[#8E6F24] shrink-0" />
                  <p className="text-slate-700 font-sans leading-relaxed">
                    Har bir nizoli masala bo&apos;yicha O&apos;zbekiston Respublikasi Oliy Sudi Plenum qarorlari va Lex.uz milliy qonunchilik bazasi tahlil qilinadi.
                  </p>
                </div>
              </div>

              {/* Career Timeline */}
              <div className="paper-card rounded-2xl p-6 sm:p-8 bg-white space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#0D1B34]">
                  Kasbiy Faoliyat Bosqichlari
                </h3>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E5E0D5]">
                  {specialist.previous_workplaces.map((wp, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-2 top-1.5 h-3.5 w-3.5 rounded-full bg-[#0D1B34] border-2 border-[#D4AF37]" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#8E6F24]">
                            {wp.start_year} — {wp.end_year || "hozirgi vaqtgacha"}
                          </span>
                        </div>
                        <p className="font-serif font-bold text-base text-[#0D1B34]">
                          {wp.position}
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {wp.company}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Academic Pedigree & Languages */}
            <div className="space-y-6">
              <div className="paper-card rounded-2xl p-6 bg-white space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8E6F24] uppercase">
                  <GraduationCap className="h-4 w-4 text-[#C59B27]" />
                  <span>Akademik Ma&apos;lumot</span>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900 text-sm">
                    {specialist.university}
                  </p>
                  <p className="text-xs text-slate-600">
                    {specialist.education}
                  </p>
                  <span className="inline-block text-[11px] font-mono bg-[#FAF7EE] text-[#8E6F24] px-2 py-0.5 rounded border border-[#C5A059]/40">
                    Bitirgan yili: {specialist.graduation_year}
                  </span>
                </div>
              </div>

              <div className="paper-card rounded-2xl p-6 bg-white space-y-3">
                <span className="text-xs font-mono font-bold text-[#8E6F24] uppercase block">
                  Muloqot Tillari
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {specialist.languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="bg-[#FAF8F5] border-[#C5A059]/40 text-xs uppercase font-mono font-bold text-[#0D1B34]"
                    >
                      {lang === "uz" ? "O'zbekcha" : lang === "ru" ? "Ruscha" : lang === "en" ? "Inglizcha" : lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="paper-card rounded-2xl p-6 bg-white space-y-2 text-xs text-slate-600">
                <span className="font-mono font-bold text-[#8E6F24] uppercase block text-[10px]">
                  Yuridik Tajriba
                </span>
                <p className="leading-relaxed">
                  Sud amaliyoti va xususiy advokatlik faoliyatida jami{" "}
                  <strong className="text-[#0D1B34]">{specialist.experience_years} yil</strong>lik uzluksiz stajga ega.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================
            TAB 4: Reviews & Client Dispute History
            ============================================================ */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="space-y-4">
            {/* Resolution Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="paper-card rounded-xl p-4 bg-white text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Barcha Baholar
                </span>
                <span className="font-serif text-2xl font-bold text-[#0D1B34] block">
                  {specialist.rating_count} ta
                </span>
                <span className="text-[11px] text-slate-500">Mijozlar tomonidan</span>
              </div>

              <div className="paper-card rounded-xl p-4 bg-white text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  O&apos;rtacha Baho
                </span>
                <span className="font-serif text-2xl font-bold text-amber-700 block">
                  ★ {specialist.rating_avg.toFixed(1)} / 5.0
                </span>
                <span className="text-[11px] text-slate-500">A&apos;lo darajali sifat</span>
              </div>

              <div className="paper-card rounded-xl p-4 bg-white text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Muvaffaqiyatli Bitim
                </span>
                <span className="font-serif text-2xl font-bold text-[#0D47A1] block">
                  98%
                </span>
                <span className="text-[11px] text-slate-500">Ijobiy tavsiya</span>
              </div>

              <div className="paper-card rounded-xl p-4 bg-white text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Javob Berish Tezligi
                </span>
                <span className="font-serif text-2xl font-bold text-[#0D1B34] block">
                  ~15 daqiqa
                </span>
                <span className="text-[11px] text-slate-500">Ish vaqtida</span>
              </div>
            </div>

            {/* Reviews List */}
            {specialist.reviews.length > 0 ? (
              <div className="space-y-4">
                {specialist.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="paper-card rounded-xl p-5 sm:p-6 bg-white space-y-3 border border-[#E5E0D5]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-600 text-sm">
                          {"★".repeat(rev.rating)}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {rev.rating}.0 / 5.0
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Tasdiqlangan Mijoz
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Specialist's Response */}
                    {rev.specialist_reply && (
                      <div className="mt-3 p-3.5 rounded-lg bg-[#FAF8F5] border-l-4 border-[#0D1B34] space-y-1 text-xs">
                        <span className="font-bold text-[#0D1B34] block font-mono text-[11px]">
                          Advokat javobi:
                        </span>
                        <p className="text-slate-600 italic">
                          &ldquo;{rev.specialist_reply}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Reviews State */
              <div className="parchment-card rounded-2xl p-8 sm:p-12 text-center border border-[#C5A059]/40 space-y-4 bg-white">
                <div className="h-12 w-12 mx-auto rounded-full bg-[#FAF0D9] flex items-center justify-center text-[#8E6F24]">
                  <Star className="h-6 w-6 stroke-[1.75]" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h4 className="font-serif text-lg font-bold text-[#0D1B34]">
                    Hozircha Sharhlar Mavjud Emas
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Advokat yaqinda davlat reyestrida ro&apos;yxatdan o&apos;tgan. Birinchi bo&apos;lib konsultatsiya oling va o&apos;z bahoingizni qoldiring.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      if (fullServicesList[0]) handleOpenBooking(fullServicesList[0]);
                    }}
                    size="sm"
                    className="bg-[#0D1B34] text-white text-xs"
                  >
                    Birinchi Bo&apos;lib Yozilish
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Consultation Booking Dialog per Interface Contract 3 */}
      <ConsultationBookingDialog
        isOpen={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        specialist={specialist}
        initialService={selectedService}
      />
    </div>
  );
}
