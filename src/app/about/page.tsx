import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  Shield,
  BookOpen,
  Users,
  Award,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Biz haqimizda — Huquqiy Yordam (Themis)",
  description:
    "Themis — O'zbekiston fuqarolari va tadbirkorlari uchun malakali yuridik yordamni qulay va ochiq qiluvchi milliy platforma. TDYU ilmiy maktabi va Lex.uz integratsiyasi.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#0D1B34] flex flex-col font-sans">
      {/* Editorial Top Bar */}
      <header className="border-b border-[#E5E0D5] bg-[#FAF7F0]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#0D1B34] transition-colors py-1.5 px-3 rounded-md hover:bg-[#F2ECE1]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Bosh sahifaga qaytish</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0D1B34] flex items-center justify-center border border-[#C5A059]/40 shadow-sm">
                <Scale className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <span className="font-editorial-heading font-bold text-lg text-[#0D1B34] hidden sm:inline">
                Themis Legal
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Mission Preamble */}
      <section className="bg-gradient-to-b from-[#FAF7F0] via-[#F4EFE6] to-[#FAF7F0] border-b border-[#E5E0D5] py-16 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0D9] border border-[#C5A059]/50 text-[#8E6F24] text-xs font-mono font-medium mb-6 shadow-sm">
            <Scale className="h-3.5 w-3.5 text-[#C59B27]" />
            <span>O&apos;zbekiston Respublikasi Huquqiy Portali</span>
          </div>

          <h1 className="font-editorial-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0D1B34] tracking-tight leading-tight mb-6">
            Adolat va Qonun ustuvorligi — har bir fuqaro uchun
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 font-serif italic leading-relaxed mb-8">
            &quot;Themis&quot; (Huquqiy Yordam) — O&apos;zbekiston Respublikasining barcha 14 ta hududidagi fuqarolar, tadbirkorlar va xorijdagi vatandoshlarimizni eng malakali litsenziyalangan advokatlar bilan bog&apos;lovchi milliy yuridik texnologiyalar ekotizimidir.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono text-slate-600 pt-6 border-t border-[#E5E0D5]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#166534]" />
              <span>Konstitutsiyaning 28-moddasi kafolati</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#166534]" />
              <span>Lex.uz milliy qonunchilik bazasi integratsiyasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Foundations */}
      <section className="py-16 border-b border-[#E5E0D5]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8E6F24] font-semibold block mb-2">
              Institutsional Asoslar
            </span>
            <h2 className="font-editorial-heading text-3xl font-bold text-[#0D1B34]">
              Nega aynan Themis platformasi?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#E5E0D5] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#0D47A1]/10 flex items-center justify-center text-[#0D47A1]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0D1B34]">
                Lex.uz Integratsiyasi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platforma Adliya vazirligining Lex.uz milliy qonunchilik bazasi bilan uzviy bog&apos;langan. Tahlilchi taqdim etgan har bir norma, modda va jazo choralari amaldagi qonun hujjatlariga asoslanadi.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E5E0D5] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#166534]/10 flex items-center justify-center text-[#166534]">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0D1B34]">
                Adliya Litsenziyasi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platformada faqat O&apos;zbekiston Respublikasi Adliya vazirligi litsenziyasiga ega va Advokatlar Palatasi a&apos;zosi bo&apos;lgan mutaxassislar akkreditatsiyadan o&apos;tkaziladi.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E5E0D5] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#B84A2A]/10 flex items-center justify-center text-[#B84A2A]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0D1B34]">
                Tezkor AI Tahlil
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Murakkab qonuniy masalani oddiy inson tilida yozing. Sun&apos;iy intellekt muammoni 10 ta soha bo&apos;yicha tasniflab, tegishli moddalar va mutaxassislarni ko&apos;rsatadi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Ticker */}
      <section className="py-12 bg-[#0D1B34] text-white border-b border-[#C5A059]/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                14
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1 uppercase">
                Hudud qamrovi
              </p>
            </div>
            <div>
              <div className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                100+
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1 uppercase">
                Tekshirilgan Advokatlar
              </p>
            </div>
            <div>
              <div className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                10
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1 uppercase">
                Yuridik soha
              </p>
            </div>
            <div>
              <div className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                100%
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1 uppercase">
                Advokatlik siri himoyasi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values & Standards */}
      <section className="py-16 border-b border-[#E5E0D5]">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <h2 className="font-editorial-heading text-2xl sm:text-3xl font-bold text-[#0D1B34]">
            Bizning Qadriyatlarimiz va Kasbiy Standartlarimiz
          </h2>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>1. Fuqaro huquqlarining ustuvorligi:</strong> Biz har bir fuqaro, ijtimoiy mavqei yoki yashash joyidan qat&apos;i nazar, qonun oldida teng ekanligiga va malakali yordam olishga mutlaq haqli ekanligiga ishonamiz.
            </p>
            <p>
              <strong>2. Mutlaq konfidentsiallik:</strong> Har qanday murojaat &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonunning 6 va 9-moddalari talablari bilan kafolatlangan advokatlik siri hisoblanadi. Biz ma&apos;lumotlarni begona shaxslarga bermaymiz va AI modellarini o&apos;qitish uchun ishlatmaymiz.
            </p>
            <p>
              <strong>3. Shaffof narxlar va Xavfsiz Eskrou:</strong> Platformadagi barcha xizmat haqlari ochiq ko&apos;rsatilgan. 15% platforma komissiyasi shaffof ushlanadi, to&apos;lovlar esa faqat konsultatsiya to&apos;liq o&apos;tkazilgandan so&apos;ng advokat hisobiga o&apos;tkaziladi.
            </p>
          </div>
        </div>
      </section>

      {/* Official Contacts & Office */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34] mb-6">
            Bosh ofis va Aloqa rekvizitlari
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#E5E0D5] space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#8E6F24] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#0D1B34]">Yuridik manzil:</strong>
                  O&apos;zbekiston Respublikasi, 100047, Toshkent shahri, Mirobod tumani, Sayilgoh ko&apos;chasi, 35-uy (Adliya maskani)
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#8E6F24] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#0D1B34]">Ishonch telefoni / Call-markaz:</strong>
                  <a href="tel:+998712000108" className="text-primary hover:underline font-mono">
                    +998 (71) 200-01-08
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#8E6F24] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#0D1B34]">Elektron pochta:</strong>
                  <a href="mailto:yordam@themis.uz" className="text-primary hover:underline font-mono">
                    yordam@themis.uz
                  </a>
                  {" / "}
                  <a href="mailto:hamkorlik@themis.uz" className="text-primary hover:underline font-mono">
                    hamkorlik@themis.uz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#8E6F24] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm text-[#0D1B34]">Ish tartibi:</strong>
                  Dushanba — Juma: 09:00 – 18:00 (AI Maslahatchi — 24/7 rejimida)
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#F4EFE6] border border-[#C5A059]/40 flex flex-col justify-between">
              <div>
                <h3 className="font-editorial-heading text-lg font-bold text-[#0D1B34] mb-2">
                  Advokatlar Palatasi A&apos;zolariga
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Agar siz O&apos;zbekiston Respublikasi Adliya vazirligi litsenziyasiga ega advokat bo&apos;lsangiz, Themis platformasiga mutaxassis sifatida qo&apos;shilib, mamlakatimiz bo&apos;ylab fuqarolarga onlayn xizmat ko&apos;rsatishingiz mumkin.
                </p>
              </div>

              <div className="pt-6">
                <Link href="/register">
                  <Button className="w-full bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs">
                    Yurist sifatida ro&apos;yxatdan o&apos;tish →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer link */}
      <div className="container mx-auto px-4 max-w-4xl pb-12 pt-6 border-t border-[#E5E0D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <p>© 2026 Themis (Huquqiy Yordam). Barcha huquqlar qonun bilan himoyalangan.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-primary hover:underline">
            Maxfiylik siyosati
          </Link>
          <Link href="/terms" className="text-primary hover:underline">
            Foydalanish shartlari
          </Link>
        </div>
      </div>
    </div>
  );
}
