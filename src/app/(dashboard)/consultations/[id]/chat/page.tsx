"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Paperclip,
  CheckCheck,
  Video,
  FileText,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { getConsultationById, StoredConsultation } from "@/lib/consultation-storage";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";

interface Message {
  id: string;
  sender: "user" | "specialist";
  text: string;
  attachment?: {
    name: string;
    size: string;
  };
  time: string;
}

export default function ConsultationChatPage() {
  const params = useParams();
  const id = params.id as string;

  const [consultation, setConsultation] = useState<StoredConsultation | null>(null);
  const [specialistName, setSpecialistName] = useState("Azizbek Rahimov");
  const [specialistTitle, setSpecialistTitle] = useState("Mehnat huquqi bo'yicha advokat");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/thm-legal-aid");

  const [isTyping, setIsTyping] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "specialist",
      text: "Assalomu alaykum! Murojaatingizni qabul qildim. Belgilangan vaqtgacha ishga oid yoki nizoga taalluqli hujjatlar nusxasi bo'lsa, xavfsiz kanaldan ushbu chatga yuklashingiz mumkin.",
      time: "10:30",
    },
    {
      id: "2",
      sender: "user",
      text: "Vaalaykum assalom, albatta. Mehnat shartnomasi va so'nggi to'lovlar nusxasini tayyorlab qo'yganman.",
      time: "10:35",
    },
    {
      id: "3",
      sender: "specialist",
      text: "Ajoyib. Belgilangan vaqtda onlayn video xonaga ham ulanamiz. Savollaringizni ketma-ket yozib qoldirishingiz mumkin.",
      time: "10:38",
    },
  ]);

  // Load consultation details dynamically
  useEffect(() => {
    const found = getConsultationById(id);
    if (found) {
      setConsultation(found);
      setSpecialistName(found.specialist_name);
      setSpecialistTitle(found.specialist_title || found.specialist_role || "Malakali Advokat");
      if (found.meeting_link) setMeetingLink(found.meeting_link);
    } else {
      const spec = MOCK_SPECIALISTS.find((s) => s.id === id) || MOCK_SPECIALISTS[0];
      setSpecialistName(spec.full_name);
      setSpecialistTitle(`${spec.categories[0]?.name_uz || "Fuqarolik"} advokati`);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Contextual realistic attorney replies
    const replies = [
      `Xabaringizni diqqat bilan o'rganib chiqdim. Ushbu holatda O'zbekiston Respublikasi Mehnat va Fuqarolik kodekslarining tegishli normalari sizning tarafingizda. Belgilangan soatda barcha qonuniy choralar bo'yicha yo'l xaritasini taqdim etaman.`,
      `Ma'lumotlar uchun tashakkur. Hujjatlarning yuridik kuchini tekshirib, sud amaliyotidagi o'xshash pretsedentlarni tahlil qilib chiqmoqdaman. Uchrashuvimizda batafsil tushuntiraman.`,
      `Xabaringiz qabul qilindi. Advokatlik siri kafolatlangan. Qo'shimcha dalillar kerak bo'lsa, sessiyamiz davomida aniqlashtirib olamiz.`,
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "specialist",
          text: replyText,
          time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
  };

  const handleAttachMockDoc = (docName: string, docSize: string) => {
    const docMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: `Biriktirilgan hujjat: ${docName}`,
      attachment: {
        name: docName,
        size: docSize,
      },
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, docMsg]);
    setAttachmentModalOpen(false);
    toast.success(`${docName} muvaffaqiyatli chatga biriktirildi`);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "specialist",
          text: `"${docName}" hujjati qabul qilindi. Hujjatning huquqiy tahlili va shartnoma bandlarini ekspertizadan o'tkazmoqdaman.`,
          time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-4xl mx-auto border border-[#E2DCD0] rounded-2xl bg-[#FAF8F5] shadow-sm overflow-hidden">
      {/* Editorial Header */}
      <div className="p-4 bg-[#0B132B] text-white flex items-center justify-between border-b border-[#C59B27]/40 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href={`/consultations/${id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
              title="Konsultatsiya tafsilotlariga qaytish"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-10 w-10 border border-[#C59B27]/60">
            <AvatarFallback className="bg-[#FAF8F5] text-[#0B132B] font-serif font-bold text-sm">
              {getInitials(specialistName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif font-bold text-sm text-white">{specialistName}</h3>
              <ShieldCheck className="h-4 w-4 text-[#C59B27]" />
            </div>
            <p className="text-[11px] text-[#C59B27] font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Onlayn • {specialistTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={meetingLink} target="_blank" rel="noreferrer">
            <Button
              size="sm"
              className="bg-[#0D47A1] hover:bg-[#1565C0] text-white gap-1.5 text-xs shadow-xs font-medium"
            >
              <Video className="h-3.5 w-3.5 text-[#D4AF37]" />
              Video Xona
            </Button>
          </a>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAF8F5]">
        <div className="text-center my-2">
          <span className="text-[11px] font-mono bg-[#FAF0D9] text-[#7E5919] border border-[#C59B27]/30 px-3 py-1 rounded-full shadow-2xs">
            Xavfsiz Advokatlik Kanali • 256-bit Shifrlangan
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] sm:max-w-md ${
              m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div
              className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#0D47A1] text-white rounded-tr-none shadow-xs"
                  : "bg-white border border-[#E2DCD0] text-[#0B132B] rounded-tl-none shadow-xs"
              }`}
            >
              {m.attachment && (
                <div
                  className={`mb-2 p-2.5 rounded-xl border flex items-center gap-2.5 ${
                    m.sender === "user"
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-[#FAF8F5] border-[#E2DCD0] text-[#0B132B]"
                  }`}
                >
                  <FileText className="h-5 w-5 text-[#C59B27] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs truncate">{m.attachment.name}</p>
                    <p className="text-[10px] font-mono opacity-80">{m.attachment.size}</p>
                  </div>
                </div>
              )}
              {m.text}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1 px-1">
              {m.time}
              {m.sender === "user" && <CheckCheck className="h-3 w-3 text-[#0D47A1]" />}
            </span>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mr-auto flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/70 border border-[#E2DCD0] px-3 py-1.5 rounded-full">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0D47A1]" />
            <span>Advokat javob yozmoqda...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#E2DCD0] bg-white flex items-center gap-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setAttachmentModalOpen(true)}
          className="text-slate-500 hover:text-[#0B132B] hover:bg-[#FAF8F5] shrink-0"
          title="Hujjat biriktirish"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Advokatga xabar yozing..."
          className="text-xs sm:text-sm bg-[#FAF8F5] border-[#E2DCD0] focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim()}
          className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] shrink-0"
        >
          <Send className="h-4 w-4 text-[#D4AF37]" />
        </Button>
      </form>

      {/* Attachment Selector Dialog */}
      <Dialog open={attachmentModalOpen} onOpenChange={setAttachmentModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-[#0B132B]">
              Huquqiy Hujjat Biriktirish
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Konsultatsiyaga tegishli shartnoma, dalolatnoma yoki sud hujjati nusxasini yuboring
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <button
              type="button"
              onClick={() => handleAttachMockDoc("mehnat_shartnomasi_2026.pdf", "1.4 MB • PDF")}
              className="w-full text-left p-3 rounded-xl border border-[#E2DCD0] bg-white hover:border-[#C59B27] hover:bg-[#FAF0D9]/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#0D47A1]" />
                <div>
                  <p className="text-xs font-bold text-[#0B132B]">mehnat_shartnomasi_2026.pdf</p>
                  <p className="text-[10px] text-slate-500 font-mono">1.4 MB • PDF Hujjat</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#0D47A1] font-semibold">Biriktirish</span>
            </button>

            <button
              type="button"
              onClick={() => handleAttachMockDoc("sud_ajrimi_nusxasi.pdf", "850 KB • PDF")}
              className="w-full text-left p-3 rounded-xl border border-[#E2DCD0] bg-white hover:border-[#C59B27] hover:bg-[#FAF0D9]/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#0D47A1]" />
                <div>
                  <p className="text-xs font-bold text-[#0B132B]">sud_ajrimi_nusxasi.pdf</p>
                  <p className="text-[10px] text-slate-500 font-mono">850 KB • Fuqarolik sudi ajrimi</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#0D47A1] font-semibold">Biriktirish</span>
            </button>

            <button
              type="button"
              onClick={() => handleAttachMockDoc("bank_tolov_kvitansiyasi.pdf", "420 KB • PDF")}
              className="w-full text-left p-3 rounded-xl border border-[#E2DCD0] bg-white hover:border-[#C59B27] hover:bg-[#FAF0D9]/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#0D47A1]" />
                <div>
                  <p className="text-xs font-bold text-[#0B132B]">bank_tolov_kvitansiyasi.pdf</p>
                  <p className="text-[10px] text-slate-500 font-mono">420 KB • Bank to&apos;lov cheki</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#0D47A1] font-semibold">Biriktirish</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
