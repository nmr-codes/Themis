import Link from "next/link";
import {
  Scale,
  Home,
  Users,
  Sparkles,
  ArrowRight,
  Phone,
  FileQuestion,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-court-mesh relative overflow-hidden selection:bg-gold-500/20">
      {/* Background judicial watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
        <Scale className="w-[650px] h-[650px] text-foreground" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-8">
        {/* Main Archival Dossier Box */}
        <div className="paper-card rounded-xl p-6 sm:p-10 border border-[#C5A059]/30 bg-[#FAF7F0] shadow-folio relative">
          {/* Notary Void Seal Motif */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shadow-sm">
                <FileQuestion className="h-7 w-7 text-gold-600" />
              </div>
              <div>
                <span className="font-judicial-sub text-xs text-gold-700 font-bold tracking-widest block">
                  HUQUQIY PROTOKOL • MODDA TOPILMADI
                </span>
                <h1 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-foreground">
                  404 — Sahifa Mavjud Emas
                </h1>
              </div>
            </div>

            <div className="seal-badge shrink-0">
              <Shield className="w-3.5 h-3.5" />
              <span>BEKOR QILINGAN</span>
            </div>
          </div>

          {/* Description & Cultural Legal Motif */}
          <div className="py-6 space-y-4">
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              Siz murojaat qilgan manzil bo&apos;yicha sahifa yoki huquqiy hujjat topilmadi. Havola o&apos;zgargan,
              nomi yangilangan yoki vaqtincha olib tashlangan bo&apos;lishi mumkin.
            </p>

            {/* Classical Amir Temur Legal Quotation */}
            <blockquote className="p-4 rounded-lg bg-gold-500/5 border-l-4 border-gold-500 text-sm italic font-serif text-muted-foreground/90">
              &ldquo;Kuch — adolatdadir. Har bir ishda qonun ustuvorligi va adolat mezon bo&apos;lmog&apos;i lozim.&rdquo;
              <span className="block mt-1 font-sans text-xs not-italic font-semibold text-gold-700">
                — Amir Temur tuzuklari
              </span>
            </blockquote>
          </div>

          {/* Core Navigation Cards (Strict Route Link Contract) */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Tavsiya etilgan yo&apos;nalishlar:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Link 1: Home */}
              <Link
                href="/"
                className="group p-4 rounded-lg bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-gold-500/50 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-gold-500/10 flex items-center justify-center mb-2.5 text-gold-600 group-hover:scale-105 transition-transform">
                    <Home className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-gold-700 transition-colors">
                    Bosh Sahifa
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Asosiy sahifaga qaytish va platforma xizmatlari bilan tanishish
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-gold-700 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>O&apos;tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Link 2: Specialists Catalog (Canonical Route: /specialists) */}
              <Link
                href="/specialists"
                className="group p-4 rounded-lg bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-samarkand-500/50 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-samarkand-500/10 flex items-center justify-center mb-2.5 text-samarkand-600 group-hover:scale-105 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-samarkand-700 transition-colors">
                    Advokatlar Reyestri
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    10 ta soha bo&apos;yicha litsenziyalangan mutaxassislarni topish
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-samarkand-600 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Katalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Link 3: AI Legal Consultation (Canonical Route: /ai-chat) */}
              <Link
                href="/ai-chat"
                className="group p-4 rounded-lg bg-white/70 hover:bg-white border border-[#C5A059]/20 hover:border-emerald-700/40 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-emerald-600/10 flex items-center justify-center mb-2.5 text-emerald-800 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-800 transition-colors">
                    AI Huquqiy Tahlil
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    Lex.uz moddalari va qonunchilik asosida 2 daqiqada tahlil
                  </p>
                </div>
                <div className="mt-3 flex items-center text-xs font-semibold text-emerald-800 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Boshlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Assistance Footer */}
          <div className="mt-8 pt-4 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gold-600" />
              <span>
                Yordam xizmati: <strong className="text-foreground">+998 71 200-01-08</strong>
              </span>
            </div>
            <div>
              Telegram orqali:{" "}
              <a
                href="https://t.me/themis_support_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-samarkand-600 hover:underline font-mono"
              >
                @themis_support_uz
              </a>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button variant="ghost" asChild className="hover:bg-gold-500/10 text-muted-foreground hover:text-foreground">
            <Link href="/" className="inline-flex items-center gap-2 text-xs">
              <Home className="w-3.5 h-3.5" />
              <span>Bosh sahifaga qaytish</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
