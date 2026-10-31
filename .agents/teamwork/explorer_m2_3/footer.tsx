"use client";

import Link from "next/link";
import { Scale, Shield, Phone, Mail, Send, MapPin, ExternalLink } from "lucide-react";
import { PrivacyModal } from "@/components/modals/privacy-modal";
import { TermsModal } from "@/components/modals/terms-modal";

export function EditorialFooter() {
  return (
    <footer className="bg-[#081021] text-slate-400 py-12 lg:py-16 border-t border-amber-900/20 text-xs">
      <div className="container mx-auto px-4">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand & Mission (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-[#C5A059]/20 flex items-center justify-center border border-[#C5A059]/40 transition-transform group-hover:scale-105">
                <Scale className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="font-editorial-heading text-lg font-bold text-white block leading-tight">
                  Huquqiy Yordam (Themis)
                </span>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                  O&apos;zbekiston Respublikasi Huquqiy Portali
                </p>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Fuqarolar va tadbirkorlarga malakali yuridik yordam ko&apos;rsatish, litsenziyalangan advokatlar reyestri va Lex.uz qonunchilik bazasiga asoslangan AI tahlil tizimi.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono">
                <Shield className="h-3 w-3" />
                <span>Advokatlik siri kafolatlangan</span>
              </span>
            </div>
          </div>

          {/* Nav: Xizmatlar (Col 3) */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs font-mono uppercase tracking-wider">
              Xizmatlar
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/specialists" className="hover:text-white transition-colors">
                  Advokatlar reyestri
                </Link>
              </li>
              <li>
                <Link href="/ai-chat" className="hover:text-white transition-colors">
                  AI Maslahatchi
                </Link>
              </li>
              <li>
                <Link href="/#sohalar" className="hover:text-white transition-colors">
                  10 ta Huquq sohasi
                </Link>
              </li>
              <li>
                <Link href="/#qanday-ishlaydi" className="hover:text-white transition-colors">
                  Qanday ishlaydi?
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav: Platforma & Huquqiy (Col 4) */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs font-mono uppercase tracking-wider">
              Platforma & Qonunchilik
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Maxfiylik siyosati
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Foydalanish shartlari
                </Link>
              </li>
              <li>
                <Link href="/specialist" className="hover:text-white transition-colors">
                  Yuristlar kabineti
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Moderator paneli
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav: Aloqa (Col 5) */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs font-mono uppercase tracking-wider">
              Bog&apos;lanish
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a
                  href="tel:+998712000108"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>+998 (71) 200-01-08</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/themis_support_uz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-[#0D47A1]" />
                  <span>@themis_support_uz</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:yordam@themis.uz"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-amber-400" />
                  <span>yordam@themis.uz</span>
                </a>
              </li>
              <li className="pt-1 text-slate-500 leading-tight">
                Toshkent sh., Sayilgoh ko&apos;chasi, 35-uy
              </li>
            </ul>
          </div>
        </div>

        {/* Modal quick triggers & Legal disclaimer */}
        <div className="pt-6 pb-4 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <PrivacyModal
              trigger={
                <button type="button" className="hover:text-slate-300 underline underline-offset-2">
                  Maxfiylik modali
                </button>
              }
            />
            <span>•</span>
            <TermsModal
              trigger={
                <button type="button" className="hover:text-slate-300 underline underline-offset-2">
                  Oferta modali
                </button>
              }
            />
            <span>•</span>
            <span>O&apos;RQ-547 Qonuni</span>
            <span>•</span>
            <span>Lex.uz integratsiyasi</span>
          </div>

          <div className="text-slate-400">
            Adliya Vazirligi litsenziyalash talablari asosida
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <p>© 2026 Themis (Huquqiy Yordam). Barcha huquqlar qonun bilan himoyalangan.</p>
          <p className="text-slate-400 text-center sm:text-right">
            O&apos;zbekiston Respublikasining &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuni normalari va advokatlik siri qat&apos;iy ta&apos;minlanadi.
          </p>
        </div>
      </div>
    </footer>
  );
}
