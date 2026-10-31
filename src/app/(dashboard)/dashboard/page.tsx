"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Sparkles,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Video,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatPrice } from "@/lib/utils";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { getStoredConsultations, StoredConsultation } from "@/lib/consultation-storage";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Azizbek");
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Read demo persona
    const stored = localStorage.getItem("themis_demo_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.full_name) setUserName(u.full_name.split(" ")[0]);
      } catch (e) {}
    }

    // 2. Read consultations dynamically from shared storage
    const list = getStoredConsultations();
    setConsultations(list);
    setIsLoaded(true);
  }, []);

  const upcoming = consultations.find(
    (c) =>
      c.status === "scheduled" ||
      c.status === "pending" ||
      c.status === "accepted" ||
      c.status === "in_progress"
  ) || consultations[0];

  const activeCount = consultations.filter(
    (c) =>
      c.status === "scheduled" ||
      c.status === "pending" ||
      c.status === "accepted" ||
      c.status === "in_progress"
  ).length;

  const completedCount = consultations.filter((c) => c.status === "completed").length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Dignified Welcome Banner */}
      <div className="rounded-2xl bg-[#0B132B] text-white p-6 sm:p-8 border border-[#C59B27]/40 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5]/10 border border-[#C59B27]/40 text-[#D4AF37] text-xs font-mono">
            <Scale className="h-3.5 w-3.5" />
            <span className="tracking-wider uppercase">KAFOLATLANGAN HUQUQIY HIMOYA</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Xush kelibsiz, {userName}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Sizning huquqlaringiz O&apos;zbekiston Respublikasi qonunchiligi va advokatlik siri himoyasida.
            Bugun qanday huquqiy yordam yoki tahlil kerak?
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/ai-chat">
              <Button className="bg-[#C59B27] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs sm:text-sm gap-2 shadow-sm transition-all">
                <Sparkles className="h-4 w-4" />
                AI Huquqiy Tahlilni Boshlash
              </Button>
            </Link>
            <Link href="/specialists">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm gap-2"
              >
                <Users className="h-4 w-4 text-[#D4AF37]" />
                Advokatlar Reyestri
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Citizen Legal Summary Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Faol Dockets
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#0B132B]">
            {isLoaded ? activeCount : "..."}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Jarayondagi ishlar</p>
        </div>

        <div className="rounded-xl p-4 bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Yakunlangan
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#0B132B]">
            {isLoaded ? completedCount : "..."}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Hal qilingan masalalar</p>
        </div>

        <div className="rounded-xl p-4 bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Advokatlar
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-[#0B132B]">34+</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Litsenziyalangan reyestr</p>
        </div>

        <div className="rounded-xl p-4 bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Eskrou Himoyasi
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center">
              <Lock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="font-serif text-base font-bold text-[#166534]">100% Kafolat</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Depozit xavfsizligi</p>
        </div>
      </div>

      {/* Case Docket: Upcoming Consultation */}
      <div className="rounded-2xl p-6 border border-[#E2DCD0] shadow-xs bg-[#FDFBF7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2DCD0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B132B] flex items-center justify-center text-[#D4AF37]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#0B132B]">
                Rejalashtirilgan Konsultatsiya Docketsi
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {upcoming ? `Ish raqami #${upcoming.id.toUpperCase()} • Eskrou himoyalangan` : "Faol dockets mavjud emas"}
              </p>
            </div>
          </div>
          {upcoming && (
            <span className={`self-start sm:self-auto text-xs px-2.5 py-1 rounded-full font-semibold border ${upcoming.status_color || "bg-blue-100 text-blue-800"}`}>
              {upcoming.status_label || "Rejalashtirilgan"}
            </span>
          )}
        </div>

        {upcoming ? (
          <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border-2 border-[#C59B27]/40 shrink-0">
                <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-lg">
                  {getInitials(upcoming.specialist_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-[#0B132B]">
                    {upcoming.specialist_name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    Advokat
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {upcoming.service_name} ({upcoming.format === "video" ? "Video uchrashuv" : upcoming.format === "chat" ? "Xavfsiz chat" : "Audio qo'ng'iroq"})
                </p>
                <p className="text-xs text-[#8E6F24] font-semibold mt-1 flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  {upcoming.scheduled_at} (Toshkent vaqti)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-center">
              <Link href={`/consultations/${upcoming.id}/chat`}>
                <Button variant="outline" size="sm" className="border-[#C59B27]/40 hover:bg-[#FAF0D9]/50 text-xs gap-1.5 text-[#0B132B]">
                  <MessageSquare className="h-3.5 w-3.5 text-[#0B132B]" />
                  Chat Xonasi
                </Button>
              </Link>
              <Link href={`/consultations/${upcoming.id}`}>
                <Button size="sm" className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs gap-1.5">
                  Tafsilotlar
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-6 pb-2 text-center">
            <p className="text-sm text-slate-600 mb-3">Hozirda rejalashtirilgan konsultatsiyalaringiz yo&apos;q.</p>
            <Link href="/specialists">
              <Button size="sm" className="bg-[#0B132B] text-white hover:bg-[#152A4F]">
                Advokat tanlash va yozilish
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Verified Advocates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E6F24] font-semibold block">
              SARALANGAN MUTAXASSISLAR
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0B132B]">
              Ishonchli Advokatlar va Yuristlar
            </h2>
          </div>
          <Link href="/specialists">
            <Button variant="ghost" size="sm" className="text-xs text-[#8E6F24] hover:text-[#0B132B] gap-1">
              Barchasini ko&apos;rish <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MOCK_SPECIALISTS.slice(0, 3).map((spec) => (
            <div
              key={spec.id}
              className="rounded-xl p-5 border border-[#E2DCD0] bg-[#FDFBF7] flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Avatar className="h-12 w-12 border-2 border-[#C59B27]/30">
                    <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-base">
                      {getInitials(spec.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Litsenziyalangan
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#0B132B] mb-0.5">
                  {spec.full_name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-1">{spec.education}</p>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="text-[#C59B27] font-bold">★ {spec.rating_avg}</span>
                  <span>({spec.rating_count} sharh)</span>
                  <span>•</span>
                  <span>{spec.experience_years} yil</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2DCD0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Tarif</span>
                  <span className="text-xs font-bold text-[#0B132B]">
                    {formatPrice(spec.services[0]?.price || 70000)}
                  </span>
                </div>
                <Link href={`/specialists/${spec.id}`}>
                  <Button size="sm" className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs h-8">
                    Yozilish
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
