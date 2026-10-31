"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Star,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Scale,
  Award,
  BookOpen,
  FileText,
  Video,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getInitials } from "@/lib/utils";
import {
  getStoredConsultations,
  updateConsultationStatus,
  StoredConsultation,
} from "@/lib/consultation-storage";
import { toast } from "sonner";

export default function SpecialistDashboardPage() {
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setConsultations(getStoredConsultations());
    setIsLoaded(true);
  }, []);

  const pendingRequests = consultations.filter((c) => c.status === "pending");
  const activeConsultations = consultations.filter(
    (c) =>
      c.status === "scheduled" ||
      c.status === "accepted" ||
      c.status === "confirmed" ||
      c.status === "in_progress"
  );
  const completedConsultations = consultations.filter((c) => c.status === "completed");

  const totalCompletedCount = 52 + completedConsultations.length;
  const netEarnings =
    6800000 +
    completedConsultations.reduce((sum, c) => sum + Math.round(c.price * 0.85), 0);

  const handleQuickAccept = (id: string) => {
    updateConsultationStatus(id, "accepted");
    setConsultations(getStoredConsultations());
    toast.success("Mijoz so'rovi qabul qilindi va qabul jadvaliga kiritildi!");
  };

  const handleQuickReject = (id: string) => {
    updateConsultationStatus(id, "cancelled");
    setConsultations(getStoredConsultations());
    toast.info("So'rov rad etildi va mijozga xabar berildi.");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Verification & License Banner */}
      <div className="p-5 sm:p-6 bg-[#FDFBF7] border border-[#C59B27]/40 rounded-2xl relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C59B27]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B132B] flex items-center justify-center border border-[#C59B27]/50 text-[#C59B27]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#0B132B]">
                  Litsenziyalangan Advokat Docketsi
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-[#166534] border border-emerald-200 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Adliya Vazirligi Tasdiqlagan
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                Litsenziya: #ADV-3810 • Toshkent shahar Advokatlar Palatasi a&apos;zosi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-[#845D18] bg-[#FAF0D9] px-2.5 py-1 rounded-full border border-[#C59B27]/40 font-medium">
              Eskrou himoyasi faol (15% platforma)
            </span>
          </div>
        </div>

        <div className="pt-3 text-xs text-slate-700 leading-relaxed font-serif italic">
          &ldquo;Advokat kasbiy burchini bajarishda faqat qonunga bo&apos;ysunadi. Har bir konsultatsiya O&apos;zR &lsquo;Advokatura to&apos;g&apos;risida&rsquo;gi Qonuni 9-moddasi (Advokatlik siri) bilan kafolatlangan.&rdquo;
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B132B] tracking-tight">
          Advokat Boshqaruv Markazi
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Fuqarolar murojaatlari, onlayn sud va huquqiy tahlil konsultatsiyalari ko&apos;rsatkichlari
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>O&apos;tkazilgan ishlar</span>
            <Calendar className="h-4 w-4 text-[#0D47A1]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#0B132B]">
            {isLoaded ? totalCompletedCount : "..."}
          </div>
          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 font-mono">
            <span>+{completedConsultations.length} yangi</span> yakunlandi
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Yangi so&apos;rovlar</span>
            <Clock className="h-4 w-4 text-[#B84A2A]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#B84A2A]">
            {isLoaded ? pendingRequests.length : "..."}
          </div>
          <p className="text-xs text-[#B84A2A] font-medium flex items-center gap-1 font-mono">
            Tasdiqlash kutilmoqda
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Mijozlar bahosi</span>
            <Star className="h-4 w-4 text-[#C59B27] fill-[#C59B27]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#0B132B]">
            4.9 <span className="text-xs font-mono font-normal text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            38 ta tasdiqlangan sharh
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#E2DCD0] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
            <span>Sof tushum (85%)</span>
            <DollarSign className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#0B132B]">
            {isLoaded ? formatPrice(netEarnings) : "..."}
          </div>
          <p className="text-xs text-emerald-700 font-medium font-mono">
            Advokat hisobiga o&apos;tkazildi
          </p>
        </div>
      </div>

      {/* Pending Requests Dossier Card */}
      <div className="rounded-2xl bg-white border border-[#E2DCD0] overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 bg-[#0B132B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C59B27]/30">
          <div>
            <h3 className="font-serif text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C59B27]" />
              Yangi Konsultatsiya So&apos;rovlari ({pendingRequests.length})
            </h3>
            <p className="text-xs font-mono text-slate-300 mt-0.5">
              Mijozlar tomonidan band qilingan navbatdagi huquqiy yordam arizalari
            </p>
          </div>

          <Link href="/specialist/requests">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5 self-start sm:self-auto"
            >
              Barcha so&apos;rovlar <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="p-6 space-y-4 bg-[#FAF8F5]">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E2DCD0]">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0B132B]">Kutilayotgan yangi so&apos;rovlar mavjud emas</p>
              <p className="text-xs text-slate-500 mt-1">Barcha mijoz murojaatlari ko&apos;rib chiqilgan va jadvalga kiritilgan.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2DCD0] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs hover:border-[#C59B27] transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-serif text-lg font-bold text-[#0B132B]">
                      {req.description?.split(" ")[0] || "Mijoz Murojaati"} (#{req.id})
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/40 font-semibold">
                      {req.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Eskrouda: {formatPrice(req.price)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Xizmat: <strong>{req.service_name} ({req.format === "video" ? "Video muloqot" : req.format === "chat" ? "Matnli chat" : "Audio"})</strong>
                  </p>
                  <p className="text-xs text-slate-500 italic line-clamp-1">
                    &ldquo;{req.user_notes || req.description}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#0D47A1] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {req.scheduled_at}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      Sof tushum (85%): {formatPrice(Math.round(req.price * 0.85))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickReject(req.id)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-9"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Rad etish
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAccept(req.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Qabul qilish
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmed Active Consultations Docket */}
      <div className="rounded-2xl bg-white border border-[#E2DCD0] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#E2DCD0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#0D47A1]" />
            <h3 className="font-serif text-lg font-bold text-[#0B132B]">
              Tasdiqlangan Ishlar & Qabul Jadvali ({activeConsultations.length})
            </h3>
          </div>
          <Link href="/specialist/schedule">
            <Button variant="ghost" size="sm" className="text-xs text-[#8E6F24] hover:text-[#0B132B]">
              Jadval sozlamalari
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-[#E2DCD0]">
          {activeConsultations.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-[#C59B27]/40 shrink-0">
                  <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-xs">
                    {getInitials(item.specialist_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#0B132B]">{item.service_name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      #{item.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.scheduled_at} • {item.format === "video" ? "Video muloqot" : "Matnli chat"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link href={`/consultations/${item.id}/chat`}>
                  <Button variant="outline" size="sm" className="text-xs border-[#C59B27]/40 text-[#0B132B]">
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#0D47A1]" />
                    Mijoz bilan Chat
                  </Button>
                </Link>
                {item.format === "video" && (
                  <a href={item.meeting_link || "https://meet.google.com/thm-legal-aid"} target="_blank" rel="noreferrer">
                    <Button size="sm" className="bg-[#0D47A1] text-white hover:bg-[#1565C0] text-xs">
                      <Video className="h-3.5 w-3.5 mr-1" />
                      Uchrashuvga kirish
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
