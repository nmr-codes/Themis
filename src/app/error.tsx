"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  RotateCcw,
  Home,
  ShieldAlert,
  Phone,
  Mail,
  Send,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorBoundaryProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Audit log for runtime exceptions
    console.error("[Themis Root Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-court-mesh relative selection:bg-gold-500/20">
      {/* Background judicial watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden">
        <Scale className="w-[600px] h-[600px] text-foreground" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Parchment Dossier Card */}
        <div className="paper-card rounded-xl p-6 sm:p-10 border border-[#C5A059]/30 shadow-folio bg-[#FAF7F0]">
          {/* Header Seal & Protocol Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-seal/10 border border-seal/30 flex items-center justify-center shadow-sm">
                <ShieldAlert className="h-7 w-7 text-seal" />
              </div>
              <div>
                <span className="font-judicial-sub text-xs text-seal font-bold tracking-widest block">
                  XATOLIK PROTOKOLI • XAVFSIZLIK REJIMI
                </span>
                <h1 className="font-editorial-heading text-2xl sm:text-3xl font-bold text-foreground">
                  Kutilmagan xatolik yuz berdi
                </h1>
              </div>
            </div>

            <div className="seal-badge shrink-0">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Status 500</span>
            </div>
          </div>

          {/* Bilingual Explanatory Notice */}
          <div className="py-6 space-y-4">
            {/* Uzbek Notice (Primary) */}
            <div className="p-4 rounded-lg bg-white/70 border border-[#C5A059]/25 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  O&apos;zbekiston Respublikasi Huquqiy Xavfsizlik Kafolati
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                Tizimda texnik uzilish yuz berdi. Sizning shaxsiy ma&apos;lumotlaringiz, yuridik yozishmalaringiz va
                konsultatsiya holati daxlsiz saqlanmoqda. Sahifani qayta yuklash orqali davom ettirishingiz mumkin.
              </p>
            </div>

            {/* Russian Notice (Secondary Bilingual) */}
            <div className="p-4 rounded-lg bg-white/40 border border-[#C5A059]/15 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 font-mono">
                Уведомление правовой системы
              </span>
              <p className="text-xs leading-relaxed text-muted-foreground">
                В работе защищённого узла произошла непредвиденная ошибка. Конфиденциальность правовой информации
                сохранена в полном объеме. Пожалуйста, попробуйте обновить страницу или обратиться в службу поддержки.
              </p>
            </div>

            {/* Digest / Diagnostic Code Block */}
            {error.digest && (
              <div className="text-xs font-mono bg-parchment-100 p-2.5 rounded border border-[#C5A059]/20 flex items-center justify-between text-muted-foreground">
                <span>Protokol kodi (Digest):</span>
                <span className="font-semibold text-foreground select-all">{error.digest}</span>
              </div>
            )}

            {/* Expandable Technical Details (Collapsible) */}
            {error.message && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{detailsOpen ? "Texnik tafsilotlarni yashirish" : "Texnik tafsilotlarni ko'rish"}</span>
                </button>
                {detailsOpen && (
                  <pre className="mt-2 p-3 rounded bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-40 border border-slate-700">
                    {error.name}: {error.message}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#C5A059]/20">
            <Button
              onClick={() => reset()}
              className="w-full sm:w-auto bg-[#132A4F] hover:bg-[#1E3A6D] text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta urinish / Повторить попытку</span>
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full sm:w-auto border-[#C5A059]/40 bg-white/80 hover:bg-white text-foreground px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all"
            >
              <Link href="/">
                <Home className="w-4 h-4 text-gold-600" />
                <span>Bosh sahifaga qaytish</span>
              </Link>
            </Button>
          </div>

          {/* Direct Support Contacts */}
          <div className="mt-8 pt-6 border-t border-[#C5A059]/20 bg-parchment-100/60 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 rounded-b-xl">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-gold-600" />
              <span>Adliya axborot-maslahat va texnik ko&apos;mak xizmati</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Call Center */}
              <a
                href="tel:+998712000108"
                className="flex items-center gap-2 p-2.5 rounded-md bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
              >
                <Phone className="w-4 h-4 text-gold-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Ishonch telefoni</div>
                  <div className="font-mono font-semibold text-foreground truncate">+998 71 200-01-08</div>
                </div>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/themis_support_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-md bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
              >
                <Send className="w-4 h-4 text-samarkand-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Telegram yordam</div>
                  <div className="font-mono font-semibold text-foreground truncate">@themis_support_uz</div>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:yordam@themis.uz"
                className="flex items-center gap-2 p-2.5 rounded-md bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/50 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-800 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">Elektron pochta</div>
                  <div className="font-mono font-semibold text-foreground truncate">yordam@themis.uz</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Sub-footer */}
        <p className="mt-4 text-center text-xs text-muted-foreground/80 font-serif italic">
          &ldquo;Kuch adolatdadir&rdquo; — Themis Huquqiy Yordam Platformasi. O&apos;zbekiston Respublikasi qonunlariga
          qat&apos;iy muvofiq faoliyat yuritadi.
        </p>
      </div>
    </div>
  );
}
