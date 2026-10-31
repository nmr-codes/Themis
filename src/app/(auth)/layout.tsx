import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#FAF8F5] relative overflow-hidden font-sans selection:bg-[#0D47A1]/20 selection:text-[#0B132B]">
      {/* Editorial Guilloche Watermark Pattern */}
      <div className="absolute inset-0 bg-guilloche opacity-25 pointer-events-none" />

      {/* Subtle Warm Gradient Accent */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-radial from-[#C59B27]/10 to-transparent blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Judicial Masthead */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-2 mb-2 group">
            <div className="w-14 h-14 rounded-xl bg-[#0B132B] flex items-center justify-center border-2 border-[#C59B27] shadow-md transition-transform group-hover:scale-105">
              <Scale className="h-7 w-7 text-[#D4AF37]" />
            </div>
            <span className="font-serif text-3xl font-bold text-[#0B132B] tracking-tight">
              Huquqiy Yordam
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#166534]" />
            <p className="text-[11px] font-mono text-[#8E6F24] tracking-widest uppercase font-semibold">
              Adolat va Qonun Ustuvorligi Portali
            </p>
          </div>
        </div>

        {/* Content Card (Login / Register Form) */}
        {children}

        {/* Institutional Regulatory Footnote */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex flex-col items-center gap-2 font-mono">
          <div className="flex items-center justify-center gap-3">
            <Link href="/terms" className="hover:underline hover:text-[#0B132B] transition-colors">
              Foydalanish shartlari
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/privacy" className="hover:underline hover:text-[#0B132B] transition-colors">
              Maxfiylik siyosati
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/specialists" className="hover:underline hover:text-[#0B132B] transition-colors">
              Advokatlar reyestri
            </Link>
          </div>
          <p className="text-[10px] text-slate-400">
            O&apos;zbekiston Respublikasi Adliya Vazirligi va Lex.uz milliy qonunchilik bazasi bilan uyg&apos;unlikda
          </p>
        </div>
      </div>
    </div>
  );
}
