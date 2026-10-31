"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scale,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Star,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Phone,
  Video,
  MessageSquare,
  FileText,
  Briefcase,
  HeartHandshake,
  Building,
  Building2,
  Landmark,
  FileCheck,
  Receipt,
  Search,
  Award,
  ChevronRight,
  UserCheck,
  User,
  Users,
  Compass,
  Lock,
  ExternalLink,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LEGAL_CATEGORIES } from "@/lib/constants";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { formatPrice, getInitials } from "@/lib/utils";
import { toast } from "sonner";

// Map each of the 10 legal categories to its distinct Lucide icon
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  labor: Briefcase,
  family: HeartHandshake,
  civil: Scale,
  housing: Building,
  criminal: ShieldAlert,
  administrative: FileText,
  business: Building2,
  property: Landmark,
  contract: FileCheck,
  tax: Receipt,
};

// Authoritative statutory citation anchors for each legal branch
const CATEGORY_STATUTES: Record<string, string> = {
  labor: "O'zR Yangi Mehnat Kodeksi • 161, 244-moddalar",
  family: "O'zR Oila Kodeksi • 96, 99-moddalar",
  civil: "O'zR Fuqarolik Kodeksi • 8, 14, 353-moddalar",
  housing: "O'zR Uy-joy Kodeksi • 27, 32, 54-moddalar",
  criminal: "O'zR Jinoyat va JPK Kodekslari",
  administrative: "O'zR MJtK va MSIK • 49, 194-moddalar",
  business: "Tadbirkorlik faoliyati kafolatlari to'g'risida Qonun",
  property: "O'zR FK III bo'lim: Mulk va meros huquqi",
  contract: "O'zR FK: Shartnomaviy majburiyatlar va javobgarlik",
  tax: "O'zR Soliq Kodeksi • Maxsus qism",
};

export default function LandingPage() {
  const router = useRouter();
  const [activeDossier, setActiveDossier] = useState(0);
  const [inquiryText, setInquiryText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<
    "terms" | "privacy" | "privilege" | null
  >(null);

  // Curated sample case dossiers for interactive legal triage preview
  const sampleDossiers = [
    {
      tag: "Mehnat huquqi",
      article: "O'zR Yangi Mehnat Kodeksi • 161, 244, 333-moddalar",
      situation:
        "Ish beruvchim 3 oydan beri maoshimni bermayapti va ishdan asossiz bo'shatish bilan tahdid qilmoqda. Huquqlarimni qanday himoya qilaman?",
      triage:
        "Yangi Mehnat kodeksiga ko'ra, ish haqini kechiktirish qat'iyan taqiqlangan. Ish beruvchi har bir kechiktirilgan kun uchun kompensatsiya to'lashi shart. Mehnat shartnomasini bir tomonlama bekor qilish faqat qonunda ko'rsatilgan qat'iy asoslar bilan amalga oshiriladi.",
      steps: [
        "Ish beruvchiga 3 kunlik yozma talabnoma yuborish va kirish raqamini olish",
        "Davlat mehnat inspeksiyasiga (Yagona portal orqali) shikoyat kiritish",
        "Kechiktirilgan maosh va ma'naviy zarar bo'yicha fuqarolik sudiga da'vo kiritish",
      ],
      advocate: MOCK_SPECIALISTS[0], // Azizbek Rahimov
      licenseNumber: "#ADV-3810 (Toshkent shahar Adliya boshqarmasi)",
    },
    {
      tag: "Oila & Farzand",
      article: "O'zR Oila Kodeksi • 96, 99, 115-moddalar",
      situation:
        "Nikohdan ajralishda aliment miqdori va voyaga yetmagan farzandimning ta'minoti qanday kafolatlanadi?",
      triage:
        "Voyaga yetmagan bir bola uchun ota-ona daromadining to'rtdan bir (1/4) qismi, ikki bola uchun uchdan bir (1/3) qismi miqdorida qat'iy aliment undiriladi. Aliment to'lashdan bosh tortilgan taqdirda sud buyrug'i 3 kun ichida ko'rib chiqilib, Majburiy ijro byurosi (MIB) orqali ijro etiladi.",
      steps: [
        "Bolaning tug'ilganlik to'g'risidagi guvohnomasi va FHDYO hujjatlarini tayyorlash",
        "Tuman fuqarolik sudiga sud buyrug'i chiqarish to'g'risida ariza topshirish",
        "Ijro varaqasini Majburiy ijro byurosi (MIB) orqali majburiy ta'minlash",
      ],
      advocate: MOCK_SPECIALISTS[1], // Dilnoza Karimova
      licenseNumber: "#ADV-4192 (Samarqand viloyati Adliya boshqarmasi)",
    },
    {
      tag: "Uy-joy & Ijara",
      article: "O'zR Fuqarolik Kodeksi • 574, 600-moddalar",
      situation:
        "Ijara shartnomamiz bor edi, ammo uy egasi 3 kun ichida uyni bo'shatishimni va depozit pulini qaytarmasligini aytdi.",
      triage:
        "Ijara shartnomasi soliq idorasida (ijara.soliq.uz) ro'yxatdan o'tgan bo'lsa, uy egasi kamida 3 oy oldin yozma ogohlantirish berishi shart. Depozitni noqonuniy ushlab qolish asosli sababsiz mumkin emas va sud orqali 2 baravar kompensatsiya talab qilinishi mumkin.",
      steps: [
        "Ijara shartnomasi va to'lov kvitansiyalarini to'liq ekspertiza qilish",
        "Uy egasiga depozitni qaytarish bo'yicha rasmiy talabnoma yuborish",
        "Zararni qoplash va majburiy yashash huquqi bo'yicha tuman sudiga da'vo tayyorlash",
      ],
      advocate: MOCK_SPECIALISTS[2], // Rustam Mahmudov
      licenseNumber: "#ADV-4921 (Toshkent shahar Adliya boshqarmasi)",
    },
    {
      tag: "Mulk & Meros",
      article: "O'zR FK III bo'lim • 1112, 1141-moddalar",
      situation:
        "Ota-onamizdan qolgan hovli-joy bo'yicha meros guvohnomasini rasmiylashtirishda merosxo'rlar o'rtasida nizo chiqdi.",
      triage:
        "Qonun bo'yicha birinchi navbatdagi merosxo'rlar (bolalar, ota-ona, turmush o'rtoq) teng ulushlarga egadirlar. Meros ochilgan kundan boshlab 6 oy ichida notariusga ariza berish va meros massasini aniqlashtirish talab etiladi.",
      steps: [
        "Meros ochilgan joydagi notarial idoraga 6 oylik muddatda ariza kiritish",
        "Ko'chmas mulk kadastr va arxiv hujjatlarini yig'ish",
        "Ulushlarni teng taqsimlash yoki sud tartibida meros taqsimotini amalga oshirish",
      ],
      advocate: MOCK_SPECIALISTS[1], // Dilnoza Karimova
      licenseNumber: "#ADV-4192 (Samarqand viloyati Adliya boshqarmasi)",
    },
  ];

  // Quick inquiry prompt chips
  const quickPromptChips = [
    "Ish beruvchi 2 oydan beri maosh bermayapti",
    "Nikohni bekor qilish va aliment undirish",
    "Ijara shartnomasini muddatidan oldin bekor qilish",
    "Meros hovli-joy taqsimoti va mulk nizosi",
  ];

  // Submit inquiry to AI Chat flow
  const handleInquirySubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || inquiryText).trim();
    if (!query) {
      toast.info("Iltimos, huquqiy masalangizni yozing");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("themis_pending_inquiry", query);
    }
    router.push(`/ai-chat?q=${encodeURIComponent(query)}`);
  };

  // Quick demo switcher function adhering to Interface Contract 2 & localStorage demo personas
  const handleDemoSwitch = (role: "client" | "specialist" | "admin") => {
    const demoPersonas = {
      client: {
        id: "demo-client-1",
        email: "mijoz@themis.uz",
        full_name: "Dilshod Aliyev (Fuqaro)",
        role: "client",
      },
      specialist: {
        id: "spec-1",
        email: "azizbek.r@themis.uz",
        full_name: "Azizbek Rahimov (Advokat)",
        role: "specialist",
      },
      admin: {
        id: "demo-admin-1",
        email: "admin@themis.uz",
        full_name: "Nazoratchi Moderator (Admin)",
        role: "admin",
      },
    };

    const persona = demoPersonas[role];
    if (typeof window !== "undefined") {
      localStorage.setItem("themis_demo_user", JSON.stringify(persona));
    }
    toast.success(`${persona.full_name} sifatida tizimga kirdingiz!`);

    if (role === "admin") {
      router.push("/admin");
    } else if (role === "specialist") {
      router.push("/specialist");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0B132B] selection:bg-[#C59B27]/25 selection:text-[#0B132B] font-sans">
      {/* ====================================================================
          1. Top Judicial Ribbon & Archival Authority Banner
          ==================================================================== */}
      <aside aria-label="Rasmiy davlat huquqiy axborot tasdiqi" className="bg-[#0B132B] text-amber-100/90 py-2 border-b border-[#C59B27]/30 text-[11px] font-mono">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="text-[#C59B27] font-semibold tracking-wider uppercase">
              O&apos;ZBEKISTON RESPUBLIKASI DAVLAT HUQUQIY AXBOROT TIZIMI
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">
              Konstitutsiyaviy kafolat: 28 va 55-moddalar
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Advokatlik siri & Eskrou kafolati
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <button
              onClick={() => setActivePolicyModal("privilege")}
              className="text-[#C59B27] hover:underline font-medium cursor-pointer"
            >
              Kafolat hujjati
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          2. Archival Legal Masthead & Trust Header
          ==================================================================== */}
      <header className="border-b border-[#E2DCD0] bg-[#FAF8F5]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          {/* Authentic Brand Emblem */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-lg bg-[#0B132B] flex items-center justify-center border-2 border-[#C59B27]/60 shadow-sm transition-transform group-hover:scale-105">
              <Scale className="h-6 w-6 text-[#C59B27]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial-heading text-2xl font-bold text-[#0B132B] tracking-tight leading-none">
                  Huquqiy Yordam
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C59B27]/15 text-[#845D18] border border-[#C59B27]/30 font-bold uppercase tracking-wider">
                  THEMIS
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mt-1">
                Adolat va Qonun Ustuvorligi Portali
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
            <Link
              href="#sohalar"
              className="hover:text-[#0D47A1] transition-colors flex items-center gap-1"
            >
              <span>Huquqiy Sohalar</span>
            </Link>
            <Link
              href="#qanday-ishlaydi"
              className="hover:text-[#0D47A1] transition-colors"
            >
              Qanday ishlaydi?
            </Link>
            <Link
              href="/ai-chat"
              className="hover:text-[#0D47A1] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C59B27]" />
              <span>AI Tahlilxona</span>
            </Link>
            <Link
              href="/specialists"
              className="hover:text-[#0D47A1] transition-colors"
            >
              Advokatlar Reyestri
            </Link>
            <Link
              href="#kafolatlar"
              className="hover:text-[#0D47A1] transition-colors"
            >
              Kafolatlar
            </Link>
          </nav>

          {/* Quick Demo Role Switcher & Auth Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Switcher Dropdown/Group */}
            <div className="hidden sm:flex items-center border border-[#C59B27]/40 rounded-lg p-1 bg-[#F5EEDB]/60 text-xs font-mono">
              <span className="px-1.5 text-[10px] text-slate-500 font-bold uppercase">
                Demo:
              </span>
              <button
                onClick={() => handleDemoSwitch("client")}
                className="px-2 py-1 rounded hover:bg-white text-slate-800 transition-colors"
                title="Fuqaro kabinetiga kirish"
              >
                Fuqaro
              </button>
              <button
                onClick={() => handleDemoSwitch("specialist")}
                className="px-2 py-1 rounded hover:bg-white text-[#0D47A1] font-semibold transition-colors"
                title="Advokat portaliga kirish"
              >
                Advokat
              </button>
              <button
                onClick={() => handleDemoSwitch("admin")}
                className="px-2 py-1 rounded hover:bg-white text-[#B84A2A] font-semibold transition-colors"
                title="Nazoratchi admin paneliga kirish"
              >
                Admin
              </button>
            </div>

            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-800 hover:text-[#0B132B] hover:bg-[#F0EBE1] font-medium text-xs sm:text-sm px-3.5"
              >
                Kirish
              </Button>
            </Link>

            <Link href="/register">
              <Button className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] border border-[#C59B27]/50 shadow-sm text-xs sm:text-sm px-4 sm:px-5">
                Boshlash
              </Button>
            </Link>

            {/* Mobile menu trigger */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden border-[#E2DCD0]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2DCD0] bg-[#FAF8F5] px-4 py-4 space-y-3">
            <Link
              href="#sohalar"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1.5 text-slate-700"
            >
              Huquqiy Sohalar
            </Link>
            <Link
              href="#qanday-ishlaydi"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1.5 text-slate-700"
            >
              Qanday ishlaydi?
            </Link>
            <Link
              href="/ai-chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1.5 text-slate-700"
            >
              AI Yuridik Tahlilxona
            </Link>
            <Link
              href="/specialists"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1.5 text-slate-700"
            >
              Advokatlar Reyestri
            </Link>
            <Link
              href="#kafolatlar"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-1.5 text-slate-700"
            >
              Kafolatlar va Eskrou
            </Link>

            <div className="pt-3 border-t border-[#E2DCD0] flex flex-wrap gap-2">
              <span className="text-xs font-mono text-slate-500 w-full">
                Tezkor demo rollar:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDemoSwitch("client");
                }}
                className="text-xs"
              >
                Fuqaro
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDemoSwitch("specialist");
                }}
                className="text-xs text-[#0D47A1]"
              >
                Advokat
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDemoSwitch("admin");
                }}
                className="text-xs text-[#B84A2A]"
              >
                Admin
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          3. Asymmetric Hero Section with Constitutional Preamble
          ==================================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 border-b border-[#E2DCD0]">
        <div className="container mx-auto px-4 relative">
          {/* Constitutional Preamble Block */}
          <div className="max-w-5xl mx-auto mb-10">
            <div className="notary-stamp p-5 sm:p-6 bg-[#FDFBF7] border-2 border-[#C59B27]/40 rounded-xl relative overflow-hidden shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#C59B27]/30 mb-4 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0B132B] flex items-center justify-center border border-[#C59B27]/50 shrink-0">
                    <Scale className="h-4 w-4 text-[#C59B27]" />
                  </div>
                  <div>
                    <span className="font-editorial-heading text-sm font-bold text-[#0B132B] tracking-wide">
                      O&apos;zbekiston Respublikasi Konstitutsiyasi • Rasmiy Kafolatlar
                    </span>
                    <p className="text-[10px] font-mono text-slate-500">
                      Yangi tahrirdagi Oliy Qonun normalari asosida
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="legal-seal">
                    <CheckCircle2 className="h-3 w-3" />
                    Konstitutsiyaviy Huquq
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-800">
                <div className="statute-border-azure bg-white/80 p-4 rounded-lg border border-[#E2DCD0]">
                  <div className="flex items-center gap-1.5 text-[#0D47A1] font-mono font-bold text-[11px] mb-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>28-MODDA • MALAKALI YURIDIK YORDAM</span>
                  </div>
                  <p className="italic text-slate-700 font-serif text-[13px] leading-relaxed">
                    &ldquo;Har kimga malakali yuridik yordam olish huquqi kafolatlanadi.
                    Qonunda nazarda tutilgan hollarda yuridik yordam davlat hisobidan
                    ko&apos;rsatiladi.&rdquo;
                  </p>
                </div>

                <div className="statute-border-gold bg-white/80 p-4 rounded-lg border border-[#E2DCD0]">
                  <div className="flex items-center gap-1.5 text-[#845D18] font-mono font-bold text-[11px] mb-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>55-MODDA • SUD VA HUQUQIY HIMOYA</span>
                  </div>
                  <p className="italic text-slate-700 font-serif text-[13px] leading-relaxed">
                    &ldquo;Har kim o&apos;z huquq va erkinliklarini qonunda taqiqlanmagan
                    barcha usullar bilan himoya qilishga haqli. Har kimga o&apos;z huquq va
                    erkinliklarini sud orqali himoya qilish kafolatlanadi.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Hero Grid: Editorial Pitch & Interactive Inquiry */}
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF0D9] border border-[#C59B27]/40 text-[#845D18] text-xs font-mono mb-5 shadow-sm">
                <Award className="h-3.5 w-3.5 text-[#C59B27]" />
                <span>AMIR TEMUR TUZUKLARI: &ldquo;KUCH — ADOLATDADIR&rdquo;</span>
              </div>

              <h1 className="font-editorial-heading text-4xl sm:text-6xl font-bold text-[#0B132B] tracking-tight leading-[1.08] mb-6">
                Huquqiy muammoingizga <br className="hidden sm:inline" />
                <span className="italic font-normal text-slate-700">qonuniy yechim</span> va{" "}
                <span className="text-[#0D47A1] underline decoration-[#C59B27]/60 underline-offset-8">
                  haqiqiy advokat
                </span>{" "}
                toping.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Muammoingizni erkin tilda yozing — sun&apos;iy intellekt O&apos;zbekiston kodekslaridan
                (Lex.uz) tegishli moddalarni ajratib beradi, tizim esa davlat litsenziyasiga ega
                tasdiqlangan advokat bilan xavfsiz onlayn konsultatsiya tashkil qiladi.
              </p>
            </div>

            {/* Interactive Legal Inquiry Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <form
                onSubmit={handleInquirySubmit}
                className="parchment-card p-2 sm:p-3 rounded-2xl border-2 border-[#C59B27]/50 shadow-md bg-white flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="flex items-center gap-3 w-full px-3 py-2">
                  <Search className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="Huquqiy masalangizni yozing (masalan: 2 oylik ish haqi to'lanmadi, ijara nizosi)..."
                    className="w-full bg-transparent text-sm sm:text-base text-[#0B132B] placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-[#0D47A1] hover:bg-[#0B3982] text-white px-6 h-12 rounded-xl text-sm font-semibold shrink-0 gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-[#C59B27]" />
                  Tahlil qilish
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              {/* Inquiry Prompt Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                  Mavzular:
                </span>
                {quickPromptChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleInquirySubmit(undefined, chip)}
                    className="text-xs px-3 py-1 rounded-full bg-[#FAF0D9]/80 hover:bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/30 transition-all hover:scale-105"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Live Case Dossier & Triage Chamber */}
            <div id="tahlil" className="mt-8">
              <div className="legal-memorandum rounded-2xl overflow-hidden border border-[#E2DCD0] shadow-sm">
                {/* Dossier Header Tabs */}
                <div className="bg-[#0B132B] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#C59B27]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded bg-[#C59B27]/20 text-[#C59B27]">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-editorial-heading text-lg font-bold text-white tracking-wide">
                        Jonli Huquqiy Tahlilxona (Case Dossier)
                      </h3>
                      <p className="text-[11px] font-mono text-slate-300">
                        Haqiqiy hayotiy holatlar va ularning qonuniy yechimlari
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sampleDossiers.map((dossier, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveDossier(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeDossier === idx
                            ? "bg-[#C59B27] text-[#0B132B] font-bold shadow-sm"
                            : "bg-white/10 text-slate-200 hover:bg-white/20"
                        }`}
                      >
                        {dossier.tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dossier Body */}
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#FAF8F5]">
                  {/* Left side: Problem & Law triage */}
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1.5 font-bold">
                        Fuqaro murojaati:
                      </span>
                      <blockquote className="p-4 rounded-xl bg-white border border-[#E2DCD0] text-slate-900 text-sm italic font-serif leading-relaxed shadow-sm">
                        &ldquo;{sampleDossiers[activeDossier].situation}&rdquo;
                      </blockquote>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                          Qonunchilik tahlili:
                        </span>
                        <span className="font-mono text-[11px] text-[#0D47A1] font-semibold bg-[#EEF4FC] px-2.5 py-0.5 rounded border border-[#B2D0F2]">
                          {sampleDossiers[activeDossier].article}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed bg-[#FDFBF7] p-4 rounded-xl border border-[#E2DCD0]">
                        {sampleDossiers[activeDossier].triage}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                        Bajarilishi shart bo&apos;lgan 3 qadam:
                      </span>
                      <div className="space-y-2">
                        {sampleDossiers[activeDossier].steps.map((step, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-[#E2DCD0]"
                          >
                            <span className="h-5 w-5 rounded-full bg-[#0D47A1] text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="font-medium pt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Matched Advocate Dossier Preview */}
                  <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-xl bg-white border-2 border-[#C59B27]/40 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD0]">
                        <span className="legal-seal">
                          <CheckCircle2 className="h-3 w-3" />
                          Litsenziyasi Tasdiqlangan
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {sampleDossiers[activeDossier].advocate.experience_years} yil staj
                        </span>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <Avatar className="h-14 w-14 border-2 border-[#C59B27]/50 shrink-0">
                          <AvatarFallback className="bg-[#0B132B] text-[#C59B27] font-serif font-bold text-lg">
                            {getInitials(
                              sampleDossiers[activeDossier].advocate.full_name
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-editorial-heading text-xl font-bold text-[#0B132B]">
                            {sampleDossiers[activeDossier].advocate.full_name}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium">
                            {sampleDossiers[activeDossier].advocate.university}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs">
                            <span className="text-[#C59B27] font-bold">
                              ★ {sampleDossiers[activeDossier].advocate.rating_avg}
                            </span>
                            <span className="text-slate-400">
                              (
                              {
                                sampleDossiers[activeDossier].advocate
                                  .rating_count
                              }{" "}
                              sharh)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E2DCD0] text-xs font-mono text-slate-600">
                        <span className="text-slate-400 block text-[10px] uppercase">
                          Davlat litsenziyasi:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {sampleDossiers[activeDossier].licenseNumber}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic bg-[#FDFBF7] p-3 rounded-lg border border-[#E2DCD0]">
                        &ldquo;{sampleDossiers[activeDossier].advocate.bio}&rdquo;
                      </p>

                      <div className="p-3 bg-[#FAF0D9]/40 rounded-lg border border-[#C59B27]/30 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono uppercase text-slate-500">
                            Boshlang&apos;ich tarif
                          </p>
                          <p className="text-sm font-bold text-[#0B132B]">
                            {formatPrice(
                              sampleDossiers[activeDossier].advocate.services[0]
                                ?.price || 70000
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-[#C59B27]/50 text-[#845D18] font-mono"
                        >
                          45 daqiqa (Video)
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E2DCD0]">
                      <Link
                        href={`/specialists/${sampleDossiers[activeDossier].advocate.id}`}
                      >
                        <Button className="w-full bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs h-10 gap-1.5 shadow-sm">
                          Advokat bilan bog&apos;lanish
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Trust Ticker (Hero Base) */}
        <div className="mt-14 border-t border-b border-[#E2DCD0] bg-[#F5EEDB]/50 py-6">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-center text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-4 font-bold">
              Rasmiy Davlat va Akademik Hamkorlik Tizimi
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div className="p-3 rounded-lg bg-white/80 border border-[#E2DCD0] shadow-2xs">
                <p className="font-editorial-heading text-sm font-bold text-[#0B132B]">
                  TDYU
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Toshkent Davlat Yuridik Universiteti tayanchi
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/80 border border-[#E2DCD0] shadow-2xs">
                <p className="font-editorial-heading text-sm font-bold text-[#0B132B]">
                  Advokatlar Palatasi
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  O&apos;zR Advokatlar Palatasi a&apos;zolari
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/80 border border-[#E2DCD0] shadow-2xs">
                <p className="font-editorial-heading text-sm font-bold text-[#0B132B]">
                  Lex.uz Integratsiyasi
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Milliy qonunchilik bazasi bilan sinxron
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/80 border border-[#E2DCD0] shadow-2xs">
                <p className="font-editorial-heading text-sm font-bold text-[#0B132B]">
                  Adliya Vazirligi
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Davlat litsenziyasi verifikatsiyasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. 10 Legal Categories Directory (All branches with distinct icons)
          ==================================================================== */}
      <section id="sohalar" className="py-20 bg-white border-b border-[#E2DCD0]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono tracking-widest uppercase text-[#845D18] font-bold block mb-1">
              O&apos;ZBEKISTON RESPUBLIKASI QONUNCHILIK SOHALARI
            </span>
            <h2 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#0B132B] mb-3">
              10 Asosiy Huquqiy Yo&apos;nalish Bo&apos;yicha Yordam
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Kundalik hayot, oila, tadbirkorlik va davlat organlari bilan munosabatlarda
              huquqlaringizni qat&apos;iy himoya qiluvchi mutaxassislar
            </p>
          </div>

          {/* 10 Distinct Categories Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LEGAL_CATEGORIES.map((cat) => {
              const CategoryIcon = CATEGORY_ICONS[cat.id] || Scale;
              const statute = CATEGORY_STATUTES[cat.id] || "O'zR Qonunchiligi";

              return (
                <Link
                  key={cat.id}
                  href={`/specialists?category=${cat.id}`}
                  className="parchment-card p-6 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD0] hover:border-[#C59B27] hover:bg-white transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0B132B] flex items-center justify-center border border-[#C59B27]/40 shadow-xs group-hover:scale-105 transition-transform">
                        <CategoryIcon className="h-6 w-6 text-[#C59B27]" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/30 font-semibold">
                        {cat.sort_order}-soha
                      </span>
                    </div>

                    <h3 className="font-editorial-heading text-xl font-bold text-[#0B132B] group-hover:text-[#0D47A1] transition-colors mb-2">
                      {cat.name_uz}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {cat.description_uz}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2DCD0] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                      {statute}
                    </span>
                    <span className="text-[#0D47A1] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Ko&apos;rish <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. 4-Step Human-Centered Consultation Narrative (Qanday ishlaydi)
          ==================================================================== */}
      <section
        id="qanday-ishlaydi"
        className="py-20 bg-[#F5EEDB]/40 border-b border-[#E2DCD0]"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono tracking-widest uppercase text-[#845D18] font-bold block mb-1">
              KONSULTATSIYA JARAYONI
            </span>
            <h2 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#0B132B] mb-4">
              Qonuniy Himoya Olishning 4 Shaffof Bosqichi
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Murakkab byurokratiya va noma&apos;lumliksiz — huquqlaringizni tiklash va
              malakali advokat bilan bog&apos;lanish tartibi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="parchment-card p-6 rounded-2xl bg-white border border-[#E2DCD0] space-y-3 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
                <span className="font-mono text-2xl font-bold text-[#C59B27]">01</span>
                <Sparkles className="h-5 w-5 text-[#0D47A1]" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B]">
                Muammoni bayon qilish
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Huquqiy masalangizni o&apos;z so&apos;zlaringiz bilan yozing. Sun&apos;iy intellekt
                Lex.uz bazasidan tegishli moddalarni va birlamchi tahlilni chiqaradi.
              </p>
              <span className="inline-block text-[10px] font-mono text-[#0D47A1] bg-[#EEF4FC] px-2 py-0.5 rounded">
                Tezkor & Bepul
              </span>
            </div>

            {/* Step 2 */}
            <div className="parchment-card p-6 rounded-2xl bg-white border border-[#E2DCD0] space-y-3 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
                <span className="font-mono text-2xl font-bold text-[#C59B27]">02</span>
                <UserCheck className="h-5 w-5 text-[#166534]" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B]">
                Advokatni tanlash
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tizim tavsiya qilgan yoki katalogdagi tasdiqlangan advokatlar reyestridan
                mutaxassisni staji, ta&apos;limi va narxiga qarab tanlang.
              </p>
              <span className="inline-block text-[10px] font-mono text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded">
                #ADV Litsenziyali
              </span>
            </div>

            {/* Step 3 */}
            <div className="parchment-card p-6 rounded-2xl bg-white border border-[#E2DCD0] space-y-3 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
                <span className="font-mono text-2xl font-bold text-[#C59B27]">03</span>
                <Video className="h-5 w-5 text-[#0D47A1]" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B]">
                Onlayn konsultatsiya
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Video, audio yoki himoyalangan chat orqali masofadan ulaning. Hujjatlaringizni
                xavfsiz taqdim eting va amaliy harakatlar rejasini oling.
              </p>
              <span className="inline-block text-[10px] font-mono text-[#845D18] bg-[#FAF0D9] px-2 py-0.5 rounded">
                Maxfiy & Xavfsiz
              </span>
            </div>

            {/* Step 4 */}
            <div className="parchment-card p-6 rounded-2xl bg-white border border-[#E2DCD0] space-y-3 relative">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
                <span className="font-mono text-2xl font-bold text-[#C59B27]">04</span>
                <ShieldCheck className="h-5 w-5 text-[#B84A2A]" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B]">
                Eskrou kafolati
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To&apos;lov tizimda xavfsiz muzlatiladi. Mablag&apos; faqat konsultatsiya to&apos;liq
                yakunlangach va siz tasdiqlaganingizdan keyin o&apos;tkaziladi.
              </p>
              <span className="inline-block text-[10px] font-mono text-[#B84A2A] bg-[#FCE7E0] px-2 py-0.5 rounded">
                100% Himoyalangan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. Verified Advocate Showcase with Attorney Dossier Preview Cards
          ==================================================================== */}
      <section className="py-20 border-b border-[#E2DCD0] bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono tracking-widest uppercase text-[#845D18] font-bold block mb-1">
                RASMIY ADVOKATLAR REYESTRI
              </span>
              <h2 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#0B132B]">
                Tajribali va Tasdiqlangan Mutaxassislar
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                O&apos;zbekiston Respublikasi Adliya vazirligi tomonidan ro&apos;yxatga olingan advokatlar
              </p>
            </div>
            <Link href="/specialists">
              <Button
                variant="outline"
                className="border-[#C59B27]/40 hover:bg-[#F5EEDB] text-xs gap-1.5"
              >
                Barcha advokatlar reyestri
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_SPECIALISTS.map((spec) => (
              <div
                key={spec.id}
                className="parchment-card rounded-2xl p-6 flex flex-col justify-between space-y-4 bg-[#FAF8F5] border border-[#E2DCD0]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-[#C59B27]/50 shadow-sm">
                      <AvatarFallback className="bg-[#0B132B] text-[#C59B27] font-serif font-bold text-xl">
                        {getInitials(spec.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="legal-seal">
                      <ShieldCheck className="h-3 w-3" />
                      Tasdiqlangan
                    </span>
                  </div>

                  <h3 className="font-editorial-heading text-xl font-bold text-[#0B132B] mb-1">
                    {spec.full_name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-3">
                    {spec.education} • {spec.university}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-3 border-b border-[#E2DCD0]">
                    <span className="text-[#C59B27] font-bold">★ {spec.rating_avg}</span>
                    <span>({spec.rating_count} sharh)</span>
                    <span>•</span>
                    <span>{spec.experience_years} yil tajriba</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 italic">
                    &ldquo;{spec.bio}&rdquo;
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {spec.categories.map((c) => (
                      <span
                        key={c.id}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF0D9] text-[#7E5919] border border-[#C59B27]/30"
                      >
                        {c.name_uz}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DCD0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Boshlang&apos;ich tarif
                    </span>
                    <span className="text-sm font-bold text-[#0B132B]">
                      {formatPrice(spec.services[0]?.price || 70000)}
                    </span>
                  </div>

                  <Link href={`/specialists/${spec.id}`}>
                    <Button
                      size="sm"
                      className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs gap-1 shadow-sm"
                    >
                      Dossiyeni ko&apos;rish <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. Dignity & Trust Manifesto (Kafolatlar va Eskrou Mexanizmi)
          ==================================================================== */}
      <section
        id="kafolatlar"
        className="py-20 bg-[#F5EEDB]/40 border-b border-[#E2DCD0]"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono tracking-widest uppercase text-[#845D18] block mb-2 font-bold">
              KAFOLAT VA ISHONCH STANDARTI
            </span>
            <h2 className="font-editorial-heading text-3xl sm:text-5xl font-bold text-[#0B132B] mb-4">
              Nega Themis Tizimi An&apos;anaviy Yo&apos;llardan Xavfsiz?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Huquqiy masalalar — inson taqdiri, oila osoyishtaligi va shaxsiy mulk
              daxlsizligidir. Biz har bir murojaatni qat&apos;iy huquqiy va moliyaviy kafolat
              ostiga olamiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old / Flawed Way */}
            <div className="p-8 rounded-2xl bg-white border border-red-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-red-800 font-mono text-xs uppercase font-bold tracking-wider">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                Eski yo&apos;l (Tanish-bilish & Noma&apos;lumlik)
              </div>
              <h3 className="font-editorial-heading text-2xl font-bold text-slate-800">
                Noma&apos;lum malaka va asossiz xarajatlar
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>
                    Advokatning haqiqiy litsenziyasi yoki ma&apos;lumotini tekshirishning
                    rasmiy imkoni yo&apos;q.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>
                    Tariflar oldindan aytilmaydi, yashirin to&apos;lovlar va asossiz narx
                    oshishi yuz beradi.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>
                    Oldindan to&apos;lov olinadi, ammo sifatli maslahat berilishiga hech qanday
                    rasmiy kafolat yo&apos;q.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>
                    Fuqaro sarson bo&apos;lib turli idoralarga qatnaydi, qonuniy yo&apos;nalish
                    aniq bo&apos;lmaydi.
                  </span>
                </li>
              </ul>
            </div>

            {/* The Themis Way */}
            <div className="p-8 rounded-2xl bg-[#0B132B] text-white border-2 border-[#C59B27]/70 shadow-md space-y-5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-[#C59B27] font-mono text-xs uppercase font-bold tracking-wider">
                <Award className="h-4 w-4" />
                Huquqiy Yordam (Themis Tizimi)
              </div>
              <h3 className="font-editorial-heading text-2xl font-bold text-white">
                100% Verifikatsiya & Eskrou Himoyasi
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                  <span>
                    <strong>Adliya vazirligi litsenziyasi:</strong> Har bir mutaxassis
                    diplomi va maqomi platforma yuristlari tomonidan tekshiriladi.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                  <span>
                    <strong>Ochiq va qat&apos;iy tarif:</strong> Konsultatsiya narxi
                    oldindan belgilanadi, hech qanday yashirin komissiya yo&apos;q.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                  <span>
                    <strong>Xavfsiz eskrou to&apos;lov:</strong> Mablag&apos; faqat
                    konsultatsiya to&apos;liq yakunlangach advokatga o&apos;tkaziladi.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                  <span>
                    <strong>Lex.uz havolalari bilan AI tahlil:</strong> Muammoning
                    dastlabki xulosasi O&apos;zbekiston kodekslari asosida shakllanadi.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. Archival Legal Footer & Policy Triggers
          ==================================================================== */}
      <footer className="bg-[#081021] text-slate-400 py-14 border-t border-[#C59B27]/20 text-xs">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1: Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#C59B27]/20 flex items-center justify-center border border-[#C59B27]/40">
                  <Scale className="h-4 w-4 text-[#C59B27]" />
                </div>
                <span className="font-editorial-heading text-lg font-bold text-white">
                  Huquqiy Yordam
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                O&apos;zbekiston Respublikasi fuqarolari va tadbirkorlari uchun yagona
                litsenziyali advokatlar va yuridik maslahat portali.
              </p>
              <div className="text-[11px] font-mono text-[#C59B27]">
                Lex.uz va Adliya vazirligi reyestri bilan integratsiyalangan
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-white font-mono uppercase text-xs tracking-wider mb-3 font-semibold">
                Platforma Bo&apos;limlari
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/specialists" className="hover:text-white transition-colors">
                    Advokatlar Reyestri
                  </Link>
                </li>
                <li>
                  <Link href="/ai-chat" className="hover:text-white transition-colors">
                    AI Yuridik Tahlilxona
                  </Link>
                </li>
                <li>
                  <Link href="#sohalar" className="hover:text-white transition-colors">
                    Qonunchilik Sohalari (10 ta)
                  </Link>
                </li>
                <li>
                  <Link href="#qanday-ishlaydi" className="hover:text-white transition-colors">
                    Konsultatsiya Qoidalari
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Portals */}
            <div>
              <h4 className="text-white font-mono uppercase text-xs tracking-wider mb-3 font-semibold">
                Kabinetlar & Kirish
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Fuqaro Shaxsiy Kabineti
                  </Link>
                </li>
                <li>
                  <Link href="/specialist" className="hover:text-white transition-colors">
                    Yurist va Advokat Kabineti
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Moderator va Nazorat Markazi
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Mutaxassis Sifatida Ro&apos;yxatdan O&apos;tish
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Legal & Policies */}
            <div>
              <h4 className="text-white font-mono uppercase text-xs tracking-wider mb-3 font-semibold">
                Qonuniy Hujjatlar
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setActivePolicyModal("privilege")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Advokatlik Siri Kafolati
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyModal("terms")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Foydalanish Shartlari
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicyModal("privacy")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Maxfiylik Siyosati
                  </button>
                </li>
                <li>
                  <span className="text-[11px] text-slate-500 font-mono block mt-2">
                    O&apos;zR &ldquo;Advokatura to&apos;g&apos;risida&rdquo;gi Qonuni
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <p>© 2026 Themis (Huquqiy Yordam). Barcha huquqlar qonun bilan himoyalangan.</p>
            <p className="text-slate-400">
              O&apos;zbekiston Respublikasi Konstitutsiyasi 28 va 55-moddalari kafolatlangan.
            </p>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          9. Legal Policy Interactive Dialog Modals
          ==================================================================== */}
      {/* Terms Modal */}
      <Dialog
        open={activePolicyModal === "terms"}
        onOpenChange={(open) => !open && setActivePolicyModal(null)}
      >
        <DialogContent className="max-w-2xl bg-[#FAF8F5] border-[#C59B27]/40 text-[#0B132B]">
          <DialogHeader>
            <DialogTitle className="font-editorial-heading text-2xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0D47A1]" />
              Foydalanish Shartlari va Huquqiy Bitim
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs font-mono">
              Amal qilish muddati: 2026-yil • O&apos;zbekiston Respublikasi yurisdiksiyasi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <div className="statute-border-azure p-3 bg-white rounded">
              <h4 className="font-bold text-[#0D47A1] mb-1">1. Umumiy qoidalar</h4>
              <p className="text-slate-700">
                Mazkur platforma O&apos;zbekiston Respublikasi fuqarolari, rezidentlari va
                tadbirkorlik subyektlariga malakali yuridik yordam ko&apos;rsatuvchi litsenziyalangan
                advokatlar bilan masofaviy aloqani ta&apos;minlash maqsadida xizmat qiladi.
              </p>
            </div>
            <div className="statute-border-gold p-3 bg-white rounded">
              <h4 className="font-bold text-[#845D18] mb-1">2. AI axborot xizmati chegarasi</h4>
              <p className="text-slate-700">
                Sun&apos;iy intellekt tahlilchisi tomonidan beriladigan ma&apos;lumotlar
                O&apos;zbekiston Respublikasi qonun hujjatlariga (Lex.uz) asoslangan dastlabki
                yo&apos;naltiruvchi axborot hisoblanadi. U rasmiy advokatlik orderi yoki sud
                hujjatining o&apos;rnini bosmaydi.
              </p>
            </div>
            <div className="statute-border p-3 bg-white rounded">
              <h4 className="font-bold text-[#B84A2A] mb-1">3. Xavfsiz Eskrou to&apos;lovlari</h4>
              <p className="text-slate-700">
                Konsultatsiya uchun to&apos;langan mablag&apos; maxsus himoyalangan hisobda
                saqlanadi va konsultatsiya to&apos;liq yakunlanib mijoz tomonidan tasdiqlanmaguncha
                mutaxassisga o&apos;tkazilmaydi.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog
        open={activePolicyModal === "privacy"}
        onOpenChange={(open) => !open && setActivePolicyModal(null)}
      >
        <DialogContent className="max-w-2xl bg-[#FAF8F5] border-[#C59B27]/40 text-[#0B132B]">
          <DialogHeader>
            <DialogTitle className="font-editorial-heading text-2xl font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#166534]" />
              Shaxsiy Ma&apos;lumotlar va Maxfiylik Siyosati
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs font-mono">
              O&apos;zR &ldquo;Shaxsga doir ma&apos;lumotlar to&apos;g&apos;risida&rdquo;gi Qonuni (O&apos;RQ-547) asosida
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <p className="text-slate-700">
              Themis platformasi foydalanuvchilarning barcha shaxsiy, moliyaviy va huquqiy
              ma&apos;lumotlarini 256-bitli shifrlash protokollari asosida qat&apos;iy himoyalaydi.
            </p>
            <ul className="space-y-2 list-disc pl-4 text-slate-700">
              <li>Murojaat matnlari va yuklangan hujjatlar uchinchi shaxslarga taqdim etilmaydi.</li>
              <li>AI modellari fuqaroning shaxsiy ma&apos;lumotlarini ommaviy o&apos;rganish uchun saqlamaydi.</li>
              <li>Foydalanuvchi istalgan vaqtda o&apos;z akkauntidagi barcha suhbatlar tarixini o&apos;chirish huquqiga ega.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attorney-Client Privilege Modal */}
      <Dialog
        open={activePolicyModal === "privilege"}
        onOpenChange={(open) => !open && setActivePolicyModal(null)}
      >
        <DialogContent className="max-w-2xl bg-[#FAF8F5] border-[#C59B27]/40 text-[#0B132B]">
          <DialogHeader>
            <DialogTitle className="font-editorial-heading text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#C59B27]" />
              Advokatlik Siri va Qonuniy Daxsizlik Kafolati
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs font-mono">
              O&apos;zR &ldquo;Advokatura to&apos;g&apos;risida&rdquo;gi Qonuni 9-moddasi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            <div className="statute-border-gold p-4 bg-white rounded">
              <h4 className="font-bold text-[#845D18] mb-1">Qonundan iqtibos:</h4>
              <p className="italic text-slate-800 font-serif leading-relaxed">
                &ldquo;Advokat kasbiy vazifasini bajarishi munosabati bilan unga ma&apos;lum bo&apos;lgan
                holatlar advokatlik sirini tashkil etadi. Advokatdan uning ishonch bildiruvchi
                shaxs bilan o&apos;zaro munosabatlariga doir ma&apos;lumotlarni talab qilish, shuningdek
                advokatni ushbu holatlar yuzasidan guvoh sifatida so&apos;roq qilish taqiqlanadi.&rdquo;
              </p>
            </div>
            <p className="text-slate-700">
              Themis platformasida o&apos;tkaziladigan barcha audio, video va yozma konsultatsiyalar
              ushbu qonuniy me&apos;yor bilan to&apos;liq himoyalangan. Tizim advokat va mijoz
              o&apos;rtasidagi suhbatlarni uchinchi tomonlarga yoki davlat idoralariga sudsiz
              ochib bermaydi.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
