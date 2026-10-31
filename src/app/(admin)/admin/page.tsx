"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Scale,
  ShieldCheck,
  Award,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getStoredConsultations, StoredConsultation } from "@/lib/consultation-storage";

export default function AdminDashboardPage() {
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const [spec5Status, setSpec5Status] = useState<"pending" | "approved" | "rejected">("pending");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Read consultations
    const stored = getStoredConsultations();
    setConsultations(stored);

    // 2. Read specialist verification overrides
    try {
      const verifs = localStorage.getItem("themis_specialist_verifications");
      if (verifs) {
        const parsed = JSON.parse(verifs);
        if (parsed["spec-5"]) {
          setSpec5Status(parsed["spec-5"].status || parsed["spec-5"]);
        }
      }
    } catch (e) {}

    setIsLoaded(true);
  }, []);

  const pendingSpecCount = spec5Status === "pending" ? 1 : 0;
  const approvedSpecCount = 34 + (spec5Status === "approved" ? 1 : 0);

  const dynamicConsultationCount = 286 + consultations.length;
  const dynamicCommission =
    7420000 +
    consultations.reduce((sum, c) => sum + Math.round(c.price * 0.15), 0);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title & Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD0]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0D9] border border-[#C59B27]/40 text-[#845D18] text-xs font-mono mb-2">
            <Scale className="h-3.5 w-3.5 text-[#C59B27]" />
            <span className="font-semibold uppercase">RESPUBLIKA HUQUQIY NAZORAT TIZIMI</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B132B]">
            Nazorat Palatasi & Tizim Boshqaruvi
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Platformaning umumiy faolligi, advokatlik litsenziyalari ekspertizasi va moliyaviy eskrou balansi
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#166534] border border-emerald-300 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Bosh Auditor Rejimi
          </span>
        </div>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Ro&apos;yxatdagi fuqarolar</span>
            <Users className="h-4 w-4 text-[#0D47A1]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#0B132B]">
            1,428
          </div>
          <p className="text-xs text-emerald-700 font-medium font-mono">
            +124 ta bu hafta qo&apos;shildi
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Tasdiqlangan advokatlar</span>
            <UserCheck className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#0B132B]">
            {isLoaded ? approvedSpecCount : "..."}
          </div>
          <p className="text-xs text-[#B84A2A] font-medium font-mono">
            {pendingSpecCount > 0 ? "1 ta litsenziya tekshiruvda" : "Barcha litsenziyalar faol"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Konsultatsiyalar</span>
            <Calendar className="h-4 w-4 text-[#845D18]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#0B132B]">
            {isLoaded ? dynamicConsultationCount : "..."}
          </div>
          <p className="text-xs text-slate-500 font-mono">
            98% ijobiy hal etilgan
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Platforma komissiyasi (15%)</span>
            <CreditCard className="h-4 w-4 text-[#C59B27]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#0B132B]">
            {isLoaded ? formatPrice(dynamicCommission) : "..."}
          </div>
          <p className="text-xs text-emerald-700 font-medium font-mono">
            Sof platforma fondi
          </p>
        </div>
      </div>

      {/* Critical Verification Alert Banner for Shahnoza Alimova (#ADV-9920) */}
      {pendingSpecCount > 0 ? (
        <div className="p-6 bg-[#FAF0D9]/40 border-2 border-[#C59B27]/50 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#845D18] font-mono text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-[#B84A2A]" />
                Tekshiruv kutilayotgan advokat arizasi (1 ta yangi)
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0B132B]">
                Shahnoza Alimova — Biznes va soliq huquqi bo&apos;yicha advokat
              </h3>
              <p className="text-xs text-slate-600 font-mono">
                Litsenziya: #ADV-9920 • Buxoro viloyati advokatlar palatasi / Adliya Vazirligi
              </p>
            </div>

            <Link href="/admin/specialists">
              <Button className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs h-10 px-5 gap-1.5 shadow-sm border border-[#C59B27]/40 shrink-0">
                Litsenziyani tekshirish
                <ArrowRight className="h-3.5 w-3.5 text-[#D4AF37]" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-xs font-mono text-emerald-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#0B132B]">Barcha advokatlar litsenziyalari tasdiqlangan</p>
              <p className="text-slate-600">Tekshiruv navbatida yangi arizalar mavjud emas. Shahnoza Alimova (#ADV-9920) tasdiqlangan.</p>
            </div>
          </div>
          <Link href="/admin/specialists">
            <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-800 text-xs">
              Reyestrni ko&apos;rish
            </Button>
          </Link>
        </div>
      )}

      {/* Institutional Audit Ticker & Regulatory Integrity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[#E2DCD0] bg-[#FDFBF7] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-[#166534]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0B132B]">Lex.uz Qonunchilik Bazasi</p>
            <p className="text-[11px] font-mono text-slate-500">Statutory API sinxronizatsiyasi faol (O&apos;zR Qonunlari)</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E2DCD0] bg-[#FDFBF7] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-[#0D47A1]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0B132B]">Eskrou Depozit Himoyasi</p>
            <p className="text-[11px] font-mono text-slate-500">256-bit Shifrlangan bank xavfsizlik protokoli</p>
          </div>
        </div>
      </div>

      {/* Quick Access Grid to Sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/consultations"
          className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] hover:border-[#C59B27] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#C59B27] mb-3 group-hover:scale-105 transition-transform">
            <Calendar className="h-5 w-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-[#0B132B] group-hover:text-[#0D47A1] transition-colors">
            Konsultatsiyalar
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Mijoz va yurist o&apos;rtasidagi uchrashuvlarni monitoring qilish va yozuvlarni nazorat qilish
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-mono text-[#8E6F24] font-semibold">
            Boshqarishga o&apos;tish <ChevronRight className="h-3 w-3" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] hover:border-[#C59B27] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#C59B27] mb-3 group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-[#0B132B] group-hover:text-[#0D47A1] transition-colors">
            Fuqarolar & Rollar
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            Foydalanuvchi hisoblarini boshqarish, huquqiy maqomlarni o&apos;zgartirish va blokirovka
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-mono text-[#8E6F24] font-semibold">
            Boshqarishga o&apos;tish <ChevronRight className="h-3 w-3" />
          </div>
        </Link>

        <Link
          href="/admin/transactions"
          className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] hover:border-[#C59B27] transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#C59B27] mb-3 group-hover:scale-105 transition-transform">
            <CreditCard className="h-5 w-5" />
          </div>
          <h4 className="font-serif text-lg font-bold text-[#0B132B] group-hover:text-[#0D47A1] transition-colors">
            Eskrou va Komissiya
          </h4>
          <p className="text-xs text-slate-600 mt-1">
            15% platforma vositachilik tushumlari, bank to&apos;lovlari va kafolatlangan depozitlar
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-mono text-[#8E6F24] font-semibold">
            Boshqarishga o&apos;tish <ChevronRight className="h-3 w-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}
