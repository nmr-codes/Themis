"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Scale,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Briefcase,
  Heart,
  Home,
  FileText,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getStoredAIConversations,
  deleteAIConversation,
  AIConversation,
} from "@/lib/ai-chat-storage";

// Authentic Citizen Prompt Templates across 4 Legal Dispute Branches
const PROMPT_CATEGORIES = [
  {
    id: "labor",
    title: "Mehnat nizolari",
    subtitle: "Oylik maosh, noqonuniy bo'shatish, ta'til to'lovlari",
    code: "O'zR Yangi Mehnat Kodeksi",
    icon: Briefcase,
    color: "border-l-[#0D47A1]",
    prompts: [
      "Ish beruvchim 2 oydan beri oylik maoshimni bermayapti, kompensatsiya undirish tartibi qanday?",
      "Homiladorlik davrida xodimni ishdan bo'shatish qonuniymi?",
      "Ishdan noqonuniy bo'shatilganda ishga qayta tiklash va majburiy progulni undirish",
    ],
  },
  {
    id: "family",
    title: "Oila va aliment",
    subtitle: "Nikohdan ajralish, aliment hisobi, mulk taqsimoti",
    code: "O'zR Oila Kodeksi",
    icon: Heart,
    color: "border-l-[#B84A2A]",
    prompts: [
      "2 nafar voyaga yetmagan farzand uchun aliment undirish tartibi va miqdori qancha?",
      "Nikohni bekor qilishda birgalikdagi mol-mulkni teng taqsimlash qoidalari",
      "Chet elda ishlayotgan sobiq turmush o'rtog'idan aliment undirish tartibi",
    ],
  },
  {
    id: "housing",
    title: "Uy-joy va ijara",
    subtitle: "Ijara shartnomasi, depozit, propiska, ko'chmas mulk",
    code: "O'zR Uy-joy & Fuqarolik Kodeksi",
    icon: Home,
    color: "border-l-[#166534]",
    prompts: [
      "Ijara shartnomasi rasmiylashtirilmagan bo'lsa, uy egasi zudlik bilan chiqarib yuborishi mumkinmi?",
      "Kvartirada doimiy ro'yxatda (propiska) turgan shaxsni uydan chiqarish asoslari",
      "Ijara garov depozitini uy egasidan sud orqali qaytarib olish",
    ],
  },
  {
    id: "property",
    title: "Mulk va shartnoma",
    subtitle: "Qarz tilxati, meros guvohnomasi, shartnoma buzilishi",
    code: "O'zR Fuqarolik Kodeksi",
    icon: Scale,
    color: "border-l-[#C59B27]",
    prompts: [
      "Tilxat (qarz tilxati) bo'yicha pulni qaytarib ololmayapman, sudga qanday ariza beriladi?",
      "Meros ochilgan kundan 6 oylik muddat o'tib ketgan bo'lsa, meros huquqini sudda tiklash",
      "Yetkazib berish shartnomasi buzilganda neustoyka va zararni undirish",
    ],
  },
];

function AIChatListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConversations(getStoredAIConversations());
  }, []);

  // Forward incoming pending inquiries (?q=... or themis_pending_inquiry)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q.trim()) {
      router.push(`/ai-chat/new?q=${encodeURIComponent(q.trim())}`);
      return;
    }
    const pending = typeof window !== "undefined" ? localStorage.getItem("themis_pending_inquiry") : null;
    if (pending && pending.trim()) {
      router.push(`/ai-chat/new?q=${encodeURIComponent(pending.trim())}`);
    }
  }, [searchParams, router]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteAIConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    toast.success("Murojaat jurnaldan o'chirildi");
  };

  const handleLaunchPrompt = (prompt: string) => {
    router.push(`/ai-chat/new?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-14 font-sans">
      {/* Official Judicial Header Masthead */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E2DCD0]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0D9] border border-[#C59B27]/40 text-[#845D18] text-xs font-mono font-bold">
              <Scale className="h-3.5 w-3.5 text-[#C59B27]" />
              № HQ-2026/REGISTRY
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FC] border border-[#B2D0F2] text-[#0D47A1] text-xs font-mono font-semibold">
              <BookOpen className="h-3.5 w-3.5" />
              LEX.UZ MILLIY QONUNCHILIK SINTESI
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-mono">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Adliya Vazirligi Standarti
            </span>
          </div>

          <h1 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#0B132B] tracking-tight">
            AI Yuridik Tahlilxona & Huquqiy Xulosalar
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl font-serif">
            O&apos;zbekiston Respublikasi amaldagi qonunlari va kodekslari asosida dastlabki yuridik ekspertiza o&apos;tkazish hamda tegishli litsenziyaga ega advokatlar bilan bog&apos;lanish portali.
          </p>
        </div>

        <Link href="/ai-chat/new" className="shrink-0">
          <Button className="w-full sm:w-auto bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] border border-[#C59B27]/60 shadow-md text-xs sm:text-sm px-6 h-12 gap-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]">
            <Plus className="h-4 w-4 text-[#C59B27]" />
            Yangi huquqiy tahlil ochish
          </Button>
        </Link>
      </div>

      {/* Mandatory Statutory Disclaimer (Feature 7 & Uzbek Law on Advocacy) */}
      <div className="notary-stamp p-5 sm:p-6 bg-[#FDFBF7] border-2 border-[#C59B27]/40 rounded-2xl relative overflow-hidden shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAF0D9] flex items-center justify-center text-[#845D18] shrink-0 border border-[#C59B27]/50 shadow-xs">
            <AlertTriangle className="h-5 w-5 text-[#C59B27]" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-editorial-heading font-bold text-sm sm:text-base text-[#0B132B]">
                Rasmiy Huquqiy Ogohlantirish (&quot;Advokatura to&apos;g&apos;risida&quot;gi Qonun talabi)
              </h4>
              <span className="text-[10px] font-mono bg-[#FAF0D9] text-[#845D18] px-2 py-0.5 rounded border border-[#C59B27]/30 font-semibold uppercase">
                Majburiy tartib
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic">
              &quot;Ushbu sun&apos;iy intellekt tahlili dastlabki axborot xarakteriga ega bo&apos;lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling.&quot;
            </p>
            <p className="text-[11px] font-mono text-slate-500 pt-0.5">
              O&apos;zbekiston Respublikasining 349-I-sonli &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuniga muvofiq professional yuridik yordam faqat litsenziyaga ega advokatlar tomonidan ko&apos;rsatiladi.
            </p>
          </div>
        </div>
      </div>

      {/* Authentic Prompt Suggestions across 4 Dispute Areas (Namuna Savollar) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial-heading text-xl font-bold text-[#0B132B] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C59B27]" />
              Tezkor Huquqiy Murojaat Namunasi (Namuna savollar)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-serif">
              O&apos;zbekiston amaliyotida eng ko&apos;p uchraydigan 4 soha bo&apos;yicha tayyor murojaat andozalari
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROMPT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className={`p-5 rounded-2xl bg-white border border-[#E2DCD0] ${cat.color} border-l-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E2DCD0] flex items-center justify-center text-[#0B132B]">
                        <Icon className="h-4 w-4 text-[#C59B27]" />
                      </div>
                      <div>
                        <h3 className="font-editorial-heading font-bold text-base text-[#0B132B]">
                          {cat.title}
                        </h3>
                        <p className="text-[11px] text-slate-500">{cat.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/30">
                      {cat.code}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-[#F2ECE1]">
                    {cat.prompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleLaunchPrompt(p)}
                        className="w-full text-left text-xs p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF0D9]/60 border border-[#E2DCD0] hover:border-[#C59B27] transition-all text-slate-700 hover:text-[#0B132B] flex items-start gap-2 group font-serif"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-[#C59B27] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <span className="leading-snug">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consultations Registry */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD0]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-[#0D47A1]" />
            Sizning Huquqiy Murojaatlaringiz Docketsi ({conversations.length} ta)
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Avtomatik tarzda shaxsiy qurilmangizda saqlanadi
          </span>
        </div>

        {conversations.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-[#E2DCD0] shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF0D9] border border-[#C59B27]/40 flex items-center justify-center text-[#C59B27] mx-auto">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B]">
                Hozircha saqlangan murojaat mavjud emas
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto font-serif">
                Yuqoridagi namuna savollardan birini tanlang yoki yangi huquqiy tahlil ochish tugmasini bosib savolingizni yo&apos;llang.
              </p>
            </div>
            <Link href="/ai-chat/new">
              <Button className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs h-10 px-5 rounded-xl gap-2 shadow-sm border border-[#C59B27]/40">
                <Plus className="h-3.5 w-3.5 text-[#C59B27]" />
                Birinchi tahlilni boshlash
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="parchment-card p-5 sm:p-6 rounded-2xl bg-white border border-[#E2DCD0] hover:border-[#C59B27] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group"
              >
                <Link href={`/ai-chat/${conv.id}`} className="flex items-start gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#C59B27] shrink-0 border border-[#C59B27]/40 group-hover:scale-105 transition-transform shadow-xs">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-editorial-heading text-base sm:text-lg font-bold text-[#0B132B] group-hover:text-[#0D47A1] transition-colors leading-snug">
                      {conv.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/40 font-semibold">
                        {conv.category}
                      </span>
                      <span className="font-mono text-[11px] text-[#0D47A1] bg-[#EEF4FC] px-2 py-0.5 rounded border border-[#B2D0F2]">
                        {conv.statute}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{conv.date}</span>
                      <span>•</span>
                      <span>{conv.messages_count || conv.messages?.length || 0} ta xabar</span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <span className="legal-seal">
                    <ShieldCheck className="h-3 w-3" />
                    {conv.status}
                  </span>

                  <Link href={`/ai-chat/${conv.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3.5 text-xs border-[#E2DCD0] hover:bg-[#FAF0D9] hover:border-[#C59B27] text-[#0B132B] rounded-xl font-medium gap-1"
                    >
                      <span>Ko&apos;rish</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#C59B27]" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    title="Murojaatni o'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C59B27]" />
        </div>
      }
    >
      <AIChatListContent />
    </Suspense>
  );
}
