import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  ShieldAlert,
  FileCheck2,
  Percent,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Building,
  CreditCard,
  AlertCircle,
  BadgeAlert,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Foydalanish Shartlari",
  description:
    "Themis (Huquqiy Yordam) platformasining foydalanish shartlari: AI dastlabki tahlili chegaralari, advokatlar verifikatsiyasi va 15% xizmat komissiyasi.",
};

export default function TermsOfServicePage() {
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

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FAF7F0] via-[#F4EFE6] to-[#FAF7F0] border-b border-[#E5E0D5] py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8E6F24]/10 border border-[#8E6F24]/30 text-[#8E6F24] text-xs font-mono font-medium mb-4">
            <FileText className="h-3.5 w-3.5 text-[#8E6F24]" />
            <span>Ommaviy Oferta va Xizmat Ko&apos;rsatish Shartnomasi</span>
          </div>

          <h1 className="font-editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D1B34] tracking-tight mb-4">
            Foydalanish Shartlari
          </h1>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 font-serif italic">
            Platformadan foydalanish qoidalari, AI huquqiy tahlilining dastlabki xususiyati, advokatlar litsenziyasi verifikatsiyasi va 15% platforma xizmat komissiyasi tartibi.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-4 border-t border-[#E5E0D5]/70">
            <span>O&apos;zbekiston Fuqarolik kodeksi 367, 369-moddalari</span>
            <span>•</span>
            <span>Oxirgi tahrir: <strong>2026-yil 1-fevral</strong></span>
            <span>•</span>
            <span className="text-[#166534] font-semibold">Barcha foydalanuvchilar uchun majburiy</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 max-w-4xl py-12 flex-1">
        <div className="space-y-12 leading-relaxed text-slate-800">
          {/* Executive Summary Callout */}
          <div className="p-6 rounded-xl bg-[#F4EFE6] border border-[#C5A059]/40 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E6F24] font-mono mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#8E6F24]" />
              Muhim Huquqiy Ogohlantirishlar
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="p-3 bg-white/70 rounded-lg border border-[#E5E0D5]">
                <strong className="block text-[#0D1B34] font-semibold mb-1">1. AI — Dastlabki Tahlil</strong>
                Sun&apos;iy intellekt xulosasi birlamchi ma&apos;lumot xarakterida bo&apos;lib, rasmiy advokatlik orderi yoki sud xulosasi hisoblanmaydi.
              </div>
              <div className="p-3 bg-white/70 rounded-lg border border-[#E5E0D5]">
                <strong className="block text-[#0D1B34] font-semibold mb-1">2. Tekshirilgan Advokatlar</strong>
                Faqat O&apos;zbekiston Adliya vazirligi litsenziyasiga va Advokatlar Palatasi a&apos;zoligiga ega mutaxassislar konsultatsiya beradi.
              </div>
              <div className="p-3 bg-white/70 rounded-lg border border-[#E5E0D5]">
                <strong className="block text-[#0D1B34] font-semibold mb-1">3. 15% Platforma Komissiyasi</strong>
                To&apos;lovlar xavfsiz eskrou orqali amalga oshiriladi. Platforma 15% xizmat haqi ushlaydi, 85% advokatga to&apos;lanadi.
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section id="maqom" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Xizmat ko&apos;rsatish predmeti va Platforma maqomi
              </h2>
            </div>
            <p>
              Mazkur Foydalanish shartlari (keyingi o&apos;rinlarda — <em>&quot;Shartlar&quot;</em>) <strong>&quot;Themis Legal Technologies&quot; MCHJ</strong> (keyingi o&apos;rinlarda — <em>&quot;Platforma&quot;</em> yoki <em>&quot;Themis&quot;</em>) hamda Platformaning Internet tarmog&apos;idagi (<code>themis.uz</code>) xizmatlaridan foydalanuvchi har qanday jismoniy yoki yuridik shaxs (keyingi o&apos;rinlarda — <em>&quot;Foydalanuvchi&quot;</em>) o&apos;rtasidagi ommaviy oferta hisoblanadi.
            </p>
            <p>
              Themis platformasi mustaqil advokatlik byurosi yoki sud organi hisoblanmaydi. Themis — fuqarolar, tadbirkorlar va O&apos;zbekiston Respublikasi qonunlariga muvofiq litsenziyalangan professional advokatlar o&apos;rtasida axborot almashish, uchrashuvlarni rejalashtirish, qonunchilik ma&apos;lumotlarini qidirish va xavfsiz to&apos;lovlarni amalga oshirish imkonini beruvchi <strong>texnologik va infratuzilma vositachisi</strong> hisoblanadi.
            </p>
          </section>

          {/* Section 2 */}
          <section id="ai-dastlabki-tahlil" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Sun&apos;iy intellekt (AI) tahlilining dastlabki xususiyati
              </h2>
            </div>
            <p>
              Themis platformasidagi sun&apos;iy intellekt moduli (AI Huquqiy Tahlilchi) O&apos;zbekiston Respublikasining <em>Lex.uz</em> milliy qonunchilik bazasidagi kodeks va qonun moddalarini qidirish, fuqaroning bayonotini 10 ta asosiy huquq sohasiga tasniflash hamda tegishli ixtisoslashgan advokatni tavsiya qilish maqsadida ishlab chiqilgan.
            </p>
            <div className="p-4 rounded-lg bg-[#FAF0D9]/80 border-l-4 border-[#C5A059] text-xs sm:text-sm text-slate-800 space-y-2">
              <strong className="block text-[#0D1B34] font-semibold text-sm">
                Qat&apos;iy huquqiy chegara va mas&apos;uliyat radnomasi:
              </strong>
              <p>
                1. AI tahlilchisi tomonidan berilgan javoblar, keltirilgan moddalar va umumiy tavsiyalar <strong>rasmiy advokatlik xulosasi, sud vakilligi yoki yakuniy yuridik hujjat hisoblanmaydi</strong>.
              </p>
              <p>
                2. AI tizimi tomonidan yaratilgan axborot faqat <strong>birlamchi yo&apos;naltiruvchi ma&apos;lumot</strong> hisoblanadi. Fuqaroning bevosita sud organlariga da&apos;vo arizasi kiritishi, bitimlar tuzishi yoki ma&apos;muriy nizolarda ishtirok etishi uchun litsenziyalangan professional advokat bilan rasmiy shartnoma tuzishi tavsiya etiladi.
              </p>
              <p>
                3. Themis platformasi foydalanuvchining professional advokat maslahatisiz faqat AI tahliliga tayanib amalga oshirgan mustaqil xatti-harakatlari va ularning oqibatlari uchun javobgar bo&apos;lmaydi.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="advokatlar-verifikatsiyasi" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Advokatlar malakasi va litsenziyasini tekshirish (Verifikatsiya)
              </h2>
            </div>
            <p>
              Platforma orqali mijozlarga pullik yoki bepul konsultatsiya ko&apos;rsatuvchi har bir mutaxassis O&apos;zbekiston Respublikasining <strong>&quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuni</strong> talablariga to&apos;liq javob berishi shart:
            </p>
            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5] flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <strong>Adliya vazirligi litsenziyasi:</strong> Advokat O&apos;zbekiston Respublikasi Adliya vazirligi tomonidan berilgan maxsus litsenziya raqamini (masalan, <code>#ADV-0842</code>) va uning amal qilish muddatini taqdim etadi. Platforma ushbu ma&apos;lumotlarni rasmiy ochiq davlat reyestrlari orqali tekshiradi.
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5] flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <strong>Advokatlar Palatasi a&apos;zoligi:</strong> Mutaxassis O&apos;zbekiston Respublikasi Advokatlar Palatasining tegishli hududiy boshqarmasi a&apos;zosi ekanligini tasdiqlovchi amaldagi guvohnomaga ega bo&apos;lishi shart.
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5] flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <strong>Kasb etikasi qoidalariga rioya:</strong> Advokat O&apos;zbekiston advokatlarining kasb etikasi qoidalariga, advokatlik siri talablariga va mijoz huquqlarining ustuvorligi prinsipiga qat&apos;iy amal qiladi. Soxta ma&apos;lumot taqdim etgan mutaxassislar tizimdan chetlatiladi.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="platforma-komissiyasi" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                15% Platforma xizmat komissiyasi va Xavfsiz to&apos;lovlar (Eskrou)
              </h2>
            </div>
            <p>
              Themis platformasida pullik konsultatsiyalar (onlayn chat, videoqo&apos;ng&apos;iroq, hujjat ekspertizasi) bo&apos;yicha hisob-kitoblar shaffoflik va adolat prinsiplari asosida tashkil etilgan:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5]">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                  <CreditCard className="h-4 w-4" />
                  Xavfsiz Bitim (Eskrou Depoziti)
                </div>
                <p className="text-xs text-slate-700">
                  Mijoz konsultatsiya uchun to&apos;lagan mablag&apos; to&apos;g&apos;ridan-to&apos;g&apos;ri emas, balki Themis xavfsiz eskrou hisobida muzlatiladi. Mablag&apos; faqat konsultatsiya to&apos;liq va sifatli o&apos;tkazilgandan keyingina advokat hisobiga o&apos;tkaziladi.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5]">
                <div className="flex items-center gap-2 text-[#8E6F24] font-bold text-sm mb-2">
                  <Percent className="h-4 w-4" />
                  15% Platforma Xizmat Haqi
                </div>
                <p className="text-xs text-slate-700">
                  Muvaffaqiyatli yakunlangan konsultatsiya summasidan Platformaning texnik ta&apos;minoti, AI qidiruv serverlari, Lex.uz integratsiyasi va to&apos;lov shlyuzlari xarajatlari uchun <strong>15% (o&apos;n besh foiz) miqdorida platforma komissiyasi</strong> ushlab qolinadi.
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E5E0D5] text-xs space-y-2">
              <strong className="block text-sm text-[#0D1B34]">Hisob-kitob namunasi:</strong>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 font-mono">
                <span>Advokat belgilagan konsultatsiya narxi:</span>
                <span className="font-bold text-[#0D1B34]">200 000 UZS</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 font-mono text-slate-600">
                <span>Themis platforma komissiyasi (15%):</span>
                <span>- 30 000 UZS</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 font-mono text-[#166534] font-bold text-sm">
                <span>Advokat hisobiga o&apos;tkaziladigan sof daromad (85%):</span>
                <span>170 000 UZS</span>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              * Konsultatsiya advokat sababli o&apos;tkazilmagan yoki texnik nosozlik yuz bergan hollarda mijoz to&apos;lagan 100% to&apos;lov summasi uning kartasiga to&apos;liq qaytariladi.
            </p>
          </section>

          {/* Section 5 */}
          <section id="majburiyatlar" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                5
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Foydalanuvchilarning huquq va majburiyatlari
              </h2>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong>Foydalanuvchi majburiyatlari:</strong> Ro&apos;yxatdan o&apos;tishda to&apos;g&apos;ri va amaldagi ma&apos;lumotlarni kiritish; tizim orqali noqonuniy, ekstremistik, tuhmat yoki boshqa shaxslarning sha&apos;ni va qadr-qimmatini kamsituvchi ma&apos;lumotlarni tarqatmaslik; advokat bilan muloqotda odob-axloq normalariga rioya qilish.
              </p>
              <p>
                <strong>Advokat majburiyatlari:</strong> Mijozga o&apos;z vaqtida, vijdonan va O&apos;zbekiston Respublikasi qonunlariga muvofiq professional yuridik yordam ko&apos;rsatish; advokatlik sirini qat&apos;iy saqlash; belgilangan vaqtda onlayn konsultatsiyaga ulanish.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="nizolar" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                6
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Nizolarni hal etish va Sudlovga taalluqlilik
              </h2>
            </div>
            <p className="text-sm text-slate-700">
              Ushbu Shartlardan kelib chiqadigan barcha nizolar dastlab muzokaralar va da&apos;vo xati (pretenziya) yuborish yo&apos;li bilan hal etiladi. Pretenziyani ko&apos;rib chiqish muddati — 15 (o&apos;n besh) ish kuni. O&apos;zaro kelishuvga erishilmagan taqdirda, nizo O&apos;zbekiston Respublikasining moddiy va protsessual qonunchiligiga binoan Toshkent shahri fuqarolik yoki iqtisodiy sudlarida ko&apos;rib chiqiladi.
            </p>
          </section>

          {/* Closing stamp */}
          <div className="pt-8 border-t border-[#E5E0D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <p>© 2026 Themis (Huquqiy Yordam). Barcha huquqlar himoyalangan.</p>
            <Link href="/privacy" className="text-primary hover:underline">
              Maxfiylik siyosati bilan tanishish →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
