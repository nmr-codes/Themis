"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Scale,
  Send,
  BookOpen,
  ArrowRight,
  Loader2,
  Sparkles,
  ArrowLeft,
  Gavel,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Printer,
  Check,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Briefcase,
  Heart,
  Home,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getInitials, formatPrice } from "@/lib/utils";
import {
  ChatMessage,
  AIConversation,
  getStoredAIConversations,
  getAIConversationById,
  saveAIConversation,
  createNewAIConversation,
  getPendingInquiry,
} from "@/lib/ai-chat-storage";
import { AISource } from "@/lib/triage";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { ConsultationBookingDialog } from "@/components/modals/consultation-booking-dialog";

// Quick suggestion prompts for Uzbek citizens
const QUICK_PROMPTS = [
  "Ish haqi kechiktirilganda kompensatsiya undirish",
  "Ijara garov depozitini qaytarib olish tartibi",
  "2 nafar bola uchun aliment miqdori qancha?",
  "Noqonuniy bo'shatilganda ishga qayta tiklash",
  "Qarz tilxati bo'yicha sudga da'vo berish",
  "Meros ochilganda 6 oylik muddatni tiklash",
  "Doimiy propiskadan uydan chiqarish tartibi",
  "Tadbirkorlik faoliyatida shartnoma buzilishi",
];

// Helper to resolve canonical Lex.uz statutory URLs
function getLexUrl(source: AISource): string {
  if (source.url && source.url.startsWith("http")) return source.url;

  const title = source.title.toLowerCase();
  if (title.includes("mehnat")) return "https://lex.uz/docs/6257288";
  if (title.includes("oila")) return "https://lex.uz/docs/104720";
  if (title.includes("uy-joy")) return "https://lex.uz/docs/106136";
  if (title.includes("fuqarolik")) return "https://lex.uz/docs/180552";
  if (title.includes("jinoyat-protsessual") || title.includes("jpk")) return "https://lex.uz/docs/111460";
  if (title.includes("jinoyat")) return "https://lex.uz/docs/111453";
  if (title.includes("ma'muriy javobgarlik") || title.includes("mjtk")) return "https://lex.uz/docs/97661";
  if (title.includes("ma'muriy sud") || title.includes("msik")) return "https://lex.uz/docs/3516618";
  if (title.includes("soliq")) return "https://lex.uz/docs/4674902";
  if (title.includes("bojxona")) return "https://lex.uz/docs/2876354";
  if (title.includes("tadbirkorlik")) return "https://lex.uz/docs/2006777";
  if (title.includes("konstitutsiya")) return "https://lex.uz/docs/6445145";

  return `https://lex.uz/search/all?query=${encodeURIComponent(source.title)}`;
}

// Helper to parse unstructured AI content into memorandum sections if needed
function parseMemorandumContent(content: string, userPrompt?: string) {
  let issue = userPrompt || "Fuqaroning taqdim etilgan huquqiy masalasi va da'vo talabi bo'yicha tahlil.";
  let analysis = content;
  let steps: string[] = [];

  const stepsSplit = content.split(
    /\*\*Tavsiya etiladigan amaliy qadamlar:\*\*|\*\*Keyingi qadamlar:\*\*|\*\*Amaliy qadamlar:\*\*|\*\*Amaliy himoya bosqichlari:\*\*/i
  );

  if (stepsSplit.length > 1) {
    const analysisPart = stepsSplit[0];
    const stepsPart = stepsSplit[1];

    const explainSplit = analysisPart.split(
      /\*\*Dastlabki huquqiy tushuntirish:\*\*|\*\*Dastlabki tushuntirish:\*\*|\*\*Dastlabki himoya tushuntirishi:\*\*|\*\*Dastlabki huquqiy yo'l-yo'riq:\*\*/i
    );
    if (explainSplit.length > 1) {
      analysis = explainSplit[1].trim();
    } else {
      analysis = analysisPart.replace(/^Sizning murojaatingiz.*?\n\n/i, "").trim();
    }

    steps = stepsPart
      .split(/\n(?=\d+\.)/)
      .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  return { issue, analysis, steps };
}

function AIChatDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const isNew = conversationId === "new";

  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Booking modal state for 1-click specialist handoff (Contract 3)
  const [selectedSpecialist, setSelectedSpecialist] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation on mount or param change
  useEffect(() => {
    if (isNew) {
      setConversation(null);
      setMessages([
        {
          id: "intro",
          role: "assistant",
          content:
            "Assalomu alaykum. Men O'zbekiston Respublikasi qonunchiligi bo'yicha sun'iy intellekt huquqiy tahlilchisiman (Themis Adolat Tahlilxonasi).\n\nSiz duch kelgan har qanday huquqiy muammoni erkin tilda bayon qiling (masalan: ish haqim to'lanmadi, ijara shartnomasi buzildi, aliment yoki meros nizosi). Men milliy qonunchilik (Lex.uz) normalari asosida rasmiy dastlabki huquqiy xulosa (Legal Memorandum) tuzib, amaliy qadamlarni ko'rsataman hamda Adliya vazirligi tasdiqlagan advokatni tavsiya qilaman.",
          sources: [
            {
              title: "O'zbekiston Respublikasining Yangi Mehnat Kodeksi",
              article: "161, 244-moddalar",
              url: "https://lex.uz/docs/6257288",
            },
            {
              title: "O'zbekiston Respublikasining Oila Kodeksi",
              article: "96, 99-moddalar",
              url: "https://lex.uz/docs/104720",
            },
            {
              title: "O'zbekiston Respublikasining Fuqarolik Kodeksi",
              article: "574, 600-moddalar",
              url: "https://lex.uz/docs/180552",
            },
          ],
        },
      ]);
    } else {
      const stored = getAIConversationById(conversationId);
      if (stored) {
        setConversation(stored);
        setMessages(stored.messages || []);
      } else {
        // Fallback seed lookup
        const all = getStoredAIConversations();
        const found = all.find((c) => c.id === conversationId);
        if (found) {
          setConversation(found);
          setMessages(found.messages || []);
        }
      }
    }
  }, [conversationId, isNew]);

  // Handle incoming inquiry from query (?q=...) or pending localStorage
  useEffect(() => {
    if (isNew) {
      const queryParam = searchParams.get("q");
      const storedPending = getPendingInquiry(true);
      const initialQuery = (queryParam || storedPending || "").trim();

      if (initialQuery) {
        handleSend(initialQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew, searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    setInput("");

    const now = new Date();
    const timeStr = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

    const newUserMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: isNew ? undefined : conversationId,
          message: textToSend,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Javob olishda xatolik yuz berdi");

      const data = await res.json();
      const aiReply = data.response;

      const newAiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: aiReply.content,
        category: aiReply.category,
        sources: aiReply.sources,
        recommended_specialists: aiReply.recommended_specialists,
        structured_sections: aiReply.structured_sections,
        timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedMessages = [...messages.filter((m) => m.id !== "intro"), newUserMsg, newAiMsg];
      setMessages(updatedMessages);

      if (isNew) {
        // Create new conversation in persistent storage
        const categoryLabel =
          aiReply.category === "labor"
            ? "Mehnat huquqi"
            : aiReply.category === "family"
            ? "Oila huquqi"
            : aiReply.category === "housing"
            ? "Uy-joy huquqi"
            : aiReply.category === "criminal"
            ? "Jinoyat huquqi"
            : aiReply.category === "tax"
            ? "Soliq huquqi"
            : aiReply.category === "business"
            ? "Tadbirkorlik huquqi"
            : "Fuqarolik huquqi";

        const newConv = createNewAIConversation(textToSend, categoryLabel);
        newConv.messages = [newUserMsg, newAiMsg];
        newConv.messages_count = 2;
        newConv.status = "Tahlil yakunlangan";
        if (aiReply.sources?.[0]) {
          newConv.statute = `${aiReply.sources[0].title} • ${aiReply.sources[0].article}`;
        }
        saveAIConversation(newConv);
        setConversation(newConv);
        router.replace(`/ai-chat/${newConv.id}`);
      } else if (conversation) {
        // Append to existing conversation in storage
        const updatedConv: AIConversation = {
          ...conversation,
          messages: updatedMessages,
          messages_count: updatedMessages.length,
          status: "Tahlil yakunlangan",
          updated_at: new Date().toISOString(),
        };
        saveAIConversation(updatedConv);
        setConversation(updatedConv);
      }
    } catch (err: any) {
      toast.error("AI xizmati bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyConclusion = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    toast.success("Huquqiy xulosa nusxasi olindi");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleOpenBooking = (spec: any) => {
    // Fill required details if needed
    const completeSpec = MOCK_SPECIALISTS.find((s) => s.id === spec.id) || {
      ...spec,
      categories: spec.categories || [],
      services: spec.services || [
        {
          id: `serv-${spec.id}-1`,
          specialist_id: spec.id,
          name: "Onlayn huquqiy konsultatsiya",
          description: "Nizo bo'yicha hujjatlarni tekshirish va strategiya tuzish",
          duration_minutes: 45,
          price: spec.price || 150000,
          currency: "UZS",
          format: "video",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };

    setSelectedSpecialist(completeSpec);
    setIsBookingOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5.5rem)] md:h-[calc(100dvh-4.5rem)] max-w-4xl mx-auto overflow-hidden font-sans">
      {/* Top Judicial Docket Header */}
      <div className="flex items-center justify-between pb-3.5 pt-1 border-b border-[#E2DCD0] bg-[#FAF8F5] shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/ai-chat">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#C59B27]/40 hover:bg-[#FAF0D9] text-[#0B132B] rounded-xl"
              title="Murojaatlar ro'yxatiga qaytish"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B132B] flex items-center justify-center text-[#C59B27] border border-[#C59B27]/50 shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial-heading font-bold text-base sm:text-lg text-[#0B132B] leading-tight">
                  {conversation?.title || (isNew ? "Yangi Huquqiy Ekspertiza Docketsi" : "Huquqiy Ekspertiza")}
                </h2>
              </div>
              <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                № HQ-2026/{conversationId.slice(-6).toUpperCase()} • Lex.uz rasmiy qonunchilik bazasi bilan integratsiyalashgan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs border-[#C59B27]/40 hover:bg-[#FAF0D9] text-[#0B132B] rounded-lg hidden sm:flex items-center gap-1.5"
            title="Huquqiy xulosani chop etish yoki PDF sifatida saqlash"
          >
            <Printer className="h-3.5 w-3.5 text-[#C59B27]" />
            <span>Chop etish</span>
          </Button>

          <span className="legal-seal hidden sm:inline-flex text-[10px]">
            <ShieldCheck className="h-3 w-3" />
            Advokatlik siri himoyalangan
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-4 space-y-6">
        {messages.map((msg, index) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex gap-3 max-w-2xl ml-auto justify-end print:hidden">
                <div className="space-y-1">
                  <div className="bg-[#0B132B] text-[#FAF8F5] rounded-2xl rounded-tr-none p-4 sm:p-5 text-xs sm:text-sm shadow-md border border-[#C59B27]/30 font-serif leading-relaxed">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.timestamp && (
                    <p className="text-[10px] font-mono text-slate-400 text-right pr-1">
                      {msg.timestamp}
                    </p>
                  )}
                </div>
                <Avatar className="h-8 w-8 mt-1 border border-[#C59B27]/40 shrink-0 shadow-xs">
                  <AvatarFallback className="bg-[#FAF0D9] text-[#845D18] font-semibold text-xs font-mono">
                    Siz
                  </AvatarFallback>
                </Avatar>
              </div>
            );
          }

          // Formal Judicial Legal Memorandum Layout for Assistant
          const userPrompt =
            index > 0 && messages[index - 1]?.role === "user"
              ? messages[index - 1].content
              : undefined;

          const parsed = parseMemorandumContent(msg.content, userPrompt);
          const issueStatement = msg.structured_sections?.issue_statement || parsed.issue;
          const substantiveAnalysis = msg.structured_sections?.substantive_analysis || parsed.analysis;
          const actionSteps =
            msg.structured_sections?.action_steps && msg.structured_sections.action_steps.length > 0
              ? msg.structured_sections.action_steps
              : parsed.steps;

          return (
            <div key={msg.id} className="space-y-4 max-w-3xl mr-auto w-full">
              {/* Formal Legal Memorandum Document Container */}
              <div
                id={`memo-${msg.id}`}
                className="legal-memorandum rounded-2xl bg-white border-2 border-[#C59B27]/40 shadow-sm overflow-hidden"
              >
                {/* Official Judicial Header */}
                <div className="p-4 sm:p-5 bg-[#FDFBF7] border-b border-[#E2DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B132B] flex items-center justify-center text-[#C59B27] border-2 border-[#C59B27]/60 shadow-xs shrink-0">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-[#845D18] font-bold">
                          O&apos;ZBEKISTON RESPUBLIKASI QONUNCHILIK EKSPERTIZASI
                        </span>
                      </div>
                      <h3 className="font-editorial-heading font-bold text-base sm:text-lg text-[#0B132B]">
                        YURIDIK KONSULTATSIYA XULOSASI (LEGAL MEMORANDUM)
                      </h3>
                      <p className="text-[10px] font-mono text-slate-500">
                        № HQ-2026/{msg.id.slice(-6).toUpperCase()} • Themis Adliya Tahlil Tizimi • Lex.uz
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center print:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyConclusion(msg.id, msg.content)}
                      className="h-8 px-2.5 text-xs border-[#C59B27]/40 hover:bg-[#FAF0D9] text-[#0B132B] rounded-lg gap-1.5"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Nusxalandi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-[#C59B27]" />
                          <span>Nusxa olish</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-6 text-sm">
                  {/* Section I: Holat Bayoni (Citizen Issue Statement) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0D47A1]">
                      <FileCheck className="h-4 w-4" />
                      <span>I. Holat Bayoni (Murojaat Mazmuni)</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E2DCD0] text-xs sm:text-sm text-slate-800 font-serif leading-relaxed">
                      {issueStatement}
                    </div>
                  </div>

                  {/* Section II: Moddiy va Protsessual Huquq Tahlili (Substantive & Procedural Law Analysis) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#845D18]">
                      <BookOpen className="h-4 w-4 text-[#C59B27]" />
                      <span>II. Moddiy va Protsessual Huquq Tahlili</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed whitespace-pre-wrap space-y-2">
                      {substantiveAnalysis}
                    </div>
                  </div>

                  {/* Section III: Tegishli Qonun va Kodeks Moddalari (Lex.uz Statutory Citation Cards) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0D47A1]">
                          <Scale className="h-4 w-4 text-[#0D47A1]" />
                          <span>III. Tegishli Qonun va Kodeks Moddalari (Lex.uz Rasmiy Manbasi)</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                          Rasmiy normativ-huquqiy hujjatlar
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.sources.map((src, i) => {
                          const lexUrl = getLexUrl(src);
                          return (
                            <div
                              key={i}
                              className="p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E2DCD0] border-l-4 border-l-[#0D47A1] shadow-2xs hover:shadow-xs transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-serif font-bold text-sm text-[#0B132B]">
                                      {src.title}
                                    </span>
                                    {src.article && (
                                      <span className="font-mono text-xs text-[#845D18] bg-[#FAF0D9] px-2 py-0.5 rounded border border-[#C59B27]/30 font-semibold">
                                        {src.article}
                                      </span>
                                    )}
                                  </div>
                                  {src.quote && (
                                    <blockquote className="font-serif italic text-xs text-slate-700 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E2DCD0] mt-1.5 leading-relaxed">
                                      &quot;{src.quote}&quot;
                                    </blockquote>
                                  )}
                                </div>

                                <a
                                  href={lexUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-mono text-[#0D47A1] hover:text-[#082B66] bg-[#EEF4FC] hover:bg-[#E1ECF9] px-2.5 py-1.5 rounded-lg border border-[#B2D0F2] transition-colors"
                                >
                                  <span>Lex.uz da ko&apos;rish</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section IV: Amaliy Harakatlar Ketma-ketligi (Actionable Roadmap) */}
                  {actionSteps && actionSteps.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#166534]">
                        <Gavel className="h-4 w-4 text-[#166534]" />
                        <span>IV. Huquqni Himoya Qilish Bo&apos;yicha Bosqichma-bosqich Harakatlar</span>
                      </div>
                      <div className="space-y-2">
                        {actionSteps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E2DCD0] flex items-start gap-3"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#FAF0D9] border border-[#C59B27]/40 flex items-center justify-center text-[#845D18] text-xs font-mono font-bold shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 font-serif leading-relaxed">
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section V: Tavsiya Etilgan Amaliyotchi Advokatlar (Matched Specialists & 1-Click Booking) */}
                  {msg.recommended_specialists && msg.recommended_specialists.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-[#E2DCD0] print:hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#845D18]">
                          <ShieldCheck className="h-4 w-4 text-[#C59B27]" />
                          <span>V. Mazkur Soha Bo&apos;yicha Adliya Vazirligi Tasdiqlagan Advokatlar</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
                          Litsenziyalangan advokatlar
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.recommended_specialists.map((spec: any) => (
                          <div
                            key={spec.id}
                            className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E2DCD0] hover:border-[#C59B27] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3.5">
                              <Avatar className="h-11 w-11 border-2 border-[#C59B27]/40 shadow-xs">
                                <AvatarFallback className="bg-[#0B132B] text-[#C59B27] font-editorial-heading font-bold text-sm">
                                  {getInitials(spec.full_name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-editorial-heading font-bold text-base text-[#0B132B]">
                                    {spec.full_name}
                                  </h4>
                                  <span className="legal-seal text-[9px] py-0 px-2">
                                    {spec.license_number || "#ADV-VERIFIED"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-serif">
                                  {spec.education || spec.bio?.slice(0, 50) || "Advokat • Oliy toifa"}
                                </p>
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pt-0.5">
                                  <span className="text-[#C59B27] font-bold">
                                    ★ {spec.rating_avg} ({spec.rating_count || 12} sharh)
                                  </span>
                                  <span>•</span>
                                  <span>{formatPrice(spec.services?.[0]?.price || spec.price || 120000)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <Link href={`/specialists/${spec.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-3 text-xs border-[#E2DCD0] hover:bg-[#FAF0D9] text-[#0B132B] rounded-xl font-medium"
                                >
                                  Profilni ko&apos;rish
                                </Button>
                              </Link>

                              <Button
                                size="sm"
                                onClick={() => handleOpenBooking(spec)}
                                className="h-9 px-4 text-xs bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] border border-[#C59B27]/40 rounded-xl gap-1.5 shadow-sm font-medium"
                              >
                                <span>Konsultatsiyaga yozilish</span>
                                <ArrowRight className="h-3.5 w-3.5 text-[#C59B27]" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Notary Legal Disclaimer Stamp at the Bottom of Memorandum */}
                  <div className="notary-stamp p-3.5 rounded-xl bg-[#FAF0D9]/40 border border-[#C59B27]/40 text-xs font-serif italic text-slate-800 leading-relaxed flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-[#C59B27] shrink-0 mt-0.5" />
                    <div>
                      <p>
                        &quot;Ushbu sun&apos;iy intellekt tahlili dastlabki axborot xarakteriga ega bo&apos;lib, rasmiy yuridik xulosa yoki advokat maqomidagi himoya hisoblanmaydi. Huquqlaringizni himoya qilish uchun amaldagi litsenziyaga ega advokatga murojaat qiling.&quot;
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 not-italic mt-1">
                        O&apos;zbekiston Respublikasi &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuni talablariga muvofiq.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="space-y-3 max-w-3xl mr-auto w-full">
            <div className="legal-memorandum rounded-2xl bg-white border-2 border-[#C59B27]/40 p-6 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FAF0D9] border border-[#C59B27]/50 flex items-center justify-center text-[#C59B27] shrink-0">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-editorial-heading font-bold text-sm text-[#0B132B]">
                  Lex.uz Qonunchilik Ekspertizasi O&apos;tkazilmoqda...
                </h4>
                <p className="text-xs text-slate-600 font-serif">
                  Milliy kodeks moddalari taqqoslanmoqda, moddiy-protsessual huquq tahlili shakllantirilmoqda.
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Pills (Horizontally Scrollable) */}
      <div className="px-1 sm:px-2 pt-2 border-t border-[#E2DCD0] bg-[#FAF8F5] shrink-0 print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none touch-pan-x whitespace-nowrap">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 pr-1 shrink-0">
            <Sparkles className="h-3 w-3 text-[#C59B27]" />
            Namuna:
          </span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-serif px-3 py-1 rounded-full bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/30 hover:bg-[#F2E5C2] transition-colors shrink-0"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Backdrop-Blurred Input Bar */}
      <div className="sticky bottom-0 z-20 bg-[#FAF8F5]/95 backdrop-blur-md px-1 sm:px-2 pt-2 pb-3 border-t border-[#E2DCD0] shadow-xs shrink-0 print:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Huquqiy savol yoki vaziyatingizni batafsil yozing (masalan: ish haqim to'lanmadi, ijara depoziti qaytarilmadi...)"
            className="min-h-[52px] max-h-[120px] pr-28 resize-none text-xs sm:text-sm bg-white border-2 border-[#C59B27]/40 focus:border-[#0B132B] rounded-xl shadow-xs font-serif"
          />
          <div className="absolute right-2.5 bottom-2.5">
            <Button
              type="submit"
              size="sm"
              disabled={loading || !input.trim()}
              className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] gap-1.5 shadow-sm text-xs px-4 h-9 border border-[#C59B27]/40 rounded-lg font-medium"
            >
              <span>Yuborish</span>
              <Send className="h-3.5 w-3.5 text-[#C59B27]" />
            </Button>
          </div>
        </form>

        <p className="text-[10px] font-mono text-slate-500 text-center mt-2">
          Enter — yuborish, Shift+Enter — yangi qator. Dastlabki yuridik tahlil O&apos;zR qonunlariga asoslanadi.
        </p>
      </div>

      {/* Consultation Booking Dialog for 1-Click Advocate Handoff */}
      {selectedSpecialist && (
        <ConsultationBookingDialog
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedSpecialist(null);
          }}
          specialist={selectedSpecialist}
          onSuccess={() => {
            setIsBookingOpen(false);
            setSelectedSpecialist(null);
            toast.success("Konsultatsiya so'rovingiz qabul qilindi va kutilmoqda!");
          }}
        />
      )}
    </div>
  );
}

export default function AIChatDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C59B27]" />
        </div>
      }
    >
      <AIChatDetailContent />
    </Suspense>
  );
}
