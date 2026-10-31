import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Scale,
  Lock,
  Server,
  Cpu,
  FileText,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Maxfiylik Siyosati",
  description:
    "Themis (Huquqiy Yordam) platformasining maxfiylik siyosati: O'RQ-547-son Qonun, advokatlik siri daxlsizligi va AI tahlil izolyatsiyasi kafolatlari.",
};

export default function PrivacyPolicyPage() {
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

      {/* Hero / Document Header */}
      <section className="bg-gradient-to-b from-[#FAF7F0] via-[#F4EFE6] to-[#FAF7F0] border-b border-[#E5E0D5] py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#166534]/10 border border-[#166534]/30 text-[#166534] text-xs font-mono font-medium mb-4">
            <Shield className="h-3.5 w-3.5 text-[#166534]" />
            <span>O&apos;zbekiston Respublikasi Qonunchiligi bilan himoyalangan</span>
          </div>

          <h1 className="font-editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D1B34] tracking-tight mb-4">
            Maxfiylik Siyosati va Ma&apos;lumotlar Daxlsizligi
          </h1>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 font-serif italic">
            Shaxsga doir ma&apos;lumotlarni himoya qilish, advokatlik siri daxlsizligi va sun&apos;iy intellekt tahlilxonasi izolyatsiyasi to&apos;g&apos;risidagi rasmiy deklaratsiya.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-4 border-t border-[#E5E0D5]/70">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#8E6F24]" />
              Hujjat kodi: <strong className="text-[#0D1B34]">THM-POL-2026/01</strong>
            </span>
            <span>•</span>
            <span>Oxirgi tahrir: <strong>2026-yil 1-fevral</strong></span>
            <span>•</span>
            <span className="text-[#166534] font-semibold">Yuridik kuchga ega</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 max-w-4xl py-12 flex-1">
        <div className="space-y-12 leading-relaxed text-slate-800">
          {/* Executive Summary Callout */}
          <div className="p-6 rounded-xl bg-[#F4EFE6] border border-[#C5A059]/40 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E6F24] font-mono mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#8E6F24]" />
              Uch Ustuvor Kafolatimiz
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="p-3 bg-white/70 rounded-lg border border-[#E5E0D5]">
                <strong className="block text-[#0D1B34] font-semibold mb-1">1. Advokatlik Siri</strong>
                Advokatura to&apos;g&apos;risidagi Qonun (6, 9-moddalar) asosida har qanday muloqot va hujjatlar to&apos;liq daxlsizdir.
              </div>
              <div className="p-3 bg-white/70 rounded-lg border border-[#E5E0D5]">
                <strong className="block text-[#0D1B34] font-semibold mb-1">2. O&apos;RQ-547 Qonuni</strong>
                Barcha fuqarolik ma&apos;lumotlari faqat O&apos;zbekiston Respublikasi hududidagi serverlarda saqlanadi.
              </div>
              <div className="p-3 bg-white/70 rounded-lg border border-[#E5E0D5]">
                <strong className="block text-[#0D1B34] font-semibold mb-1">3. AI Ma&apos;lumot Izolyatsiyasi</strong>
                Sizning yuridik so&apos;rovlaringiz ochiq sun&apos;iy intellekt modellarini o&apos;qitish uchun ASLO ishlatilmaydi.
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section id="asos" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Umumiy qoidalar va Huquqiy asos
              </h2>
            </div>
            <p>
              Mazkur Maxfiylik siyosati (keyingi o&apos;rinlarda — <em>&quot;Siyosat&quot;</em>) <strong>&quot;Themis&quot; (Huquqiy Yordam)</strong> platformasining (sayt manzili: <code>themis.uz</code>) barcha foydalanuvchilari — fuqarolar, tadbirkorlik subyektlari hamda ro&apos;yxatdan o&apos;tgan professional advokatlar va yuristlarning shaxsga doir ma&apos;lumotlarini to&apos;plash, saqlash, qayta ishlash va himoya qilish tartibini belgilaydi.
            </p>
            <p>
              Platforma o&apos;z faoliyatini O&apos;zbekiston Respublikasining quyidagi qonun hujjatlari asosida amalga oshiradi:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
              <li>
                <strong>O&apos;zbekiston Respublikasi Konstitutsiyasi</strong> (xususan, 28-modda — malakali yuridik yordam olish huquqi hamda 31-modda — shaxsiy hayot, yozishmalar va axborot daxlsizligi);
              </li>
              <li>
                <strong>O&apos;zbekiston Respublikasining 2019-yil 2-iyuldagi O&apos;RQ-547-son &quot;Shaxsga doir ma&apos;lumotlar to&apos;g&apos;risida&quot;gi Qonuni</strong>;
              </li>
              <li>
                <strong>O&apos;zbekiston Respublikasining 1996-yil 27-dekabrdagi &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuni</strong> (keyingi o&apos;zgartirish va qo&apos;shimchalar bilan);
              </li>
              <li>
                <strong>O&apos;zbekiston Respublikasining &quot;Kiberxavfsizlik to&apos;g&apos;risida&quot;gi</strong> hamda <strong>&quot;Axborotlashtirish to&apos;g&apos;risida&quot;gi</strong> Qonunlari.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="advokatlik-siri" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Advokatlik siri daxlsizligi kafolati
              </h2>
            </div>
            <p>
              Themis platformasi orqali fuqaroning tanlangan litsenziyalangan advokat bilan o&apos;zaro barcha muloqotlari, yuborilgan xabarlari, audio/video qo&apos;ng&apos;iroqlari va taqdim etilgan har qanday hujjatlari <strong>O&apos;zbekiston Respublikasining &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuni 6 va 9-moddalari</strong> talablariga binoan <strong>advokatlik siri</strong> hisoblanadi.
            </p>
            <div className="bg-[#FAF0D9]/60 border-l-4 border-[#C5A059] p-4 rounded-r-lg text-sm text-slate-800 italic font-serif">
              &quot;Advokatdan unga yuridik yordam so&apos;rab murojaat etgan shaxslar to&apos;g&apos;risidagi, shuningdek yuridik yordam ko&apos;rsatish munosabati bilan ma&apos;lum bo&apos;lib qolgan ma&apos;lumotlarni surishtiruv, dastlabki tergov organlari va sud tomonidan talab qilib olish taqiqlanadi. Advokat ishonch bildiruvchining roziligisiz bu ma&apos;lumotlarni oshkor qilishga haqli emas.&quot; (Advokatura to&apos;g&apos;risidagi Qonun, 6-modda).
            </div>
            <p className="text-sm">
              Themis platformasi operatori advokat va mijoz o&apos;rtasidagi xususiy yuridik konsultatsiya mazmuniga aralashmaydi, uning xabarlarini tahrirlamaydi va uchinchi shaxslarga yoxud davlat idoralariga (qonunda to&apos;g&apos;ridan-to&apos;g&apos;ri nazarda tutilgan favqulodda sud qarori mavjud bo&apos;lmagan hollarda) oshkor etmaydi.
            </p>
          </section>

          {/* Section 3 */}
          <section id="server-uzb" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                O&apos;RQ-547 standarti va Ma&apos;lumotlarni O&apos;zbekistonda saqlash (Server Lokalizatsiyasi)
              </h2>
            </div>
            <p>
              O&apos;zbekiston Respublikasining &quot;Shaxsga doir ma&apos;lumotlar to&apos;g&apos;risida&quot;gi Qonunining 27-moddasi talablarini to&apos;liq bajarish maqsadida:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5] flex items-start gap-3">
                <Server className="h-5 w-5 text-[#0D47A1] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="text-sm text-[#0D1B34] block">Lokal Server Bazasi</strong>
                  Fuqarolarning shaxsga doir ma&apos;lumotlar bazasi jismonan O&apos;zbekiston Respublikasi hududida joylashgan davlat sertifikatiga ega ma&apos;lumotlar markazida (Data Center) saqlanadi.
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white border border-[#E5E0D5] flex items-start gap-3">
                <Lock className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="text-sm text-[#0D1B34] block">Bank Standarti Shifrlash</strong>
                  Foydalanuvchi ma&apos;lumotlari uzatish vaqtida TLS 1.3 protokoli bilan, serverda saqlanish vaqtida esa AES-256 algoritmi yordamida shifrlangan holatda yuritiladi.
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Biz foydalanuvchilarning telefon raqami, pasport/JSHSHIR ma&apos;lumotlari va to&apos;lov rekvizitlarini chet el yurisdiksiyasidagi uchinchi tomon serverlariga ruxsatsiz transchegaraviy uzatmaymiz.
            </p>
          </section>

          {/* Section 4 */}
          <section id="ai-izolyatsiya" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Sun&apos;iy Intellekt (AI) Muloqotlarining Maxfiylik Izolyatsiyasi
              </h2>
            </div>
            <p>
              Themis platformasining AI Maslahatchisi fuqarolarga dastlabki qonunchilik yo&apos;nalishini taqdim etishda eng qat&apos;iy ma&apos;lumotlar xavfsizligi protokollariga amal qiladi:
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-[#E5E0D5]">
                <CheckCircle2 className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <strong>Modelni o&apos;qitmaslik kafolati (Zero-Training Guarantee):</strong> Siz kiritgan savollar, shaxsiy nizolar tavsifi va fayllar ochiq sun&apos;iy intellekt modellarini (OpenAI, Claude yoki boshqa global neyrotizimlarni) qayta o&apos;qitish, takomillashtirish yoki umumiy bazaga qo&apos;shish uchun <u>MUTLAQO ISHLATILMAYDI</u>.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-[#E5E0D5]">
                <CheckCircle2 className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <strong>Yopiq va Shifrlangan Sessiyalar:</strong> Har bir AI sessiyasi alohida xavfsiz konteynerda tahlil qilinadi. Boshqa foydalanuvchilar yoki yordamchi modullar ushbu sessiyaga kirish huquqiga ega emas.
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-[#E5E0D5]">
                <CheckCircle2 className="h-5 w-5 text-[#166534] shrink-0 mt-0.5" />
                <div>
                  <strong>Anonimlashtirish filtrlari:</strong> AI tahliliga yuborilayotgan savollar tarkibidagi identifikatsiya qiluvchi ma&apos;lumotlar (familiya, telefon, manzil) tizim orqali avtomatik tarzda anonimlashtirilgan ko&apos;rinishda ishlovdan o&apos;tkaziladi.
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="malumotlar-turlari" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                5
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Qayta ishlanadigan ma&apos;lumotlar toifalari
              </h2>
            </div>
            <p>Platformada qat&apos;iy zaruriy minimum prinsipiga (data minimization) ko&apos;ra quyidagi toifadagi ma&apos;lumotlar qayta ishlanadi:</p>
            <div className="overflow-x-auto border border-[#E5E0D5] rounded-lg bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F4EFE6] text-[#0D1B34] font-semibold uppercase tracking-wider border-b border-[#E5E0D5]">
                  <tr>
                    <th className="py-3 px-4">Ma&apos;lumot toifasi</th>
                    <th className="py-3 px-4">Tarkibi</th>
                    <th className="py-3 px-4">Qayta ishlash maqsadi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D5] text-slate-700">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0D1B34]">Hisob qaydnomasi</td>
                    <td className="py-3 px-4">F.I.Sh., telefon raqami, elektron pochta, parol xeshi</td>
                    <td className="py-3 px-4">Foydalanuvchini autentifikatsiya qilish va shaxsiy kabinetga kirish</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0D1B34]">Advokat litsenziyasi</td>
                    <td className="py-3 px-4">Litsenziya raqami, Advokatlar Palatasi guvohnomasi, TDYU diplomi, faoliyat hududi</td>
                    <td className="py-3 px-4">Adliya vazirligi reyestri bo&apos;yicha mutaxassis malakasini rasmiy verifikatsiyalash</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0D1B34]">Konsultatsiya materiallari</td>
                    <td className="py-3 px-4">Chat yozishmalari, audio/video qo&apos;ng&apos;iroq rejalari, yuklangan shartnoma nusxalari</td>
                    <td className="py-3 px-4">Mijoz va advokat o&apos;rtasida to&apos;g&apos;ridan-to&apos;g&apos;ri yuridik yordam ko&apos;rsatish</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-[#0D1B34]">To&apos;lov tranzaksiyalari</td>
                    <td className="py-3 px-4">Tranzaksiya ID, summa, fiskal chek raqami, to&apos;lov sanasi</td>
                    <td className="py-3 px-4">Xavfsiz eskrou to&apos;lovlarini ta&apos;minlash va soliq hisobdorligi</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 italic">
              * Eslatma: Bank kartalarining to&apos;liq 16 xonali raqami va CVV maxfiy kodlari Themis serverlarida saqlanmaydi. Ular bevosita O&apos;zbekiston Markaziy banki tomonidan litsenziyalangan milliy to&apos;lov tashkilotlari (Payme, Click, Uzum) orqali xavfsiz shifrlangan shlyuzda qayta ishlanadi.
            </p>
          </section>

          {/* Section 6 */}
          <section id="huquqlar" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                6
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Foydalanuvchining huquqlari (O&apos;RQ-547, 30-modda)
              </h2>
            </div>
            <p>
              O&apos;zbekiston Respublikasining &quot;Shaxsga doir ma&apos;lumotlar to&apos;g&apos;risida&quot;gi Qonuniga muvofiq, har bir foydalanuvchi quyidagi huquqlarga ega:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5] space-y-1">
                <strong className="text-[#0D1B34] font-semibold block text-sm">Ma&apos;lumot bilan tanishish huquqi</strong>
                O&apos;z shaxsiy ma&apos;lumotlari qanday maqsadda va hajmda qayta ishlanayotganini shaxsiy kabinet orqali bepul bilish.
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5] space-y-1">
                <strong className="text-[#0D1B34] font-semibold block text-sm">O&apos;zgartirish va tuzatish kiritish</strong>
                Noto&apos;g&apos;ri, eskirgan yoki to&apos;liq bo&apos;lmagan shaxsiy ma&apos;lumotlarni bir zumda tahrirlash yoki to&apos;ldirish.
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5] space-y-1">
                <strong className="text-[#0D1B34] font-semibold block text-sm">Butunlay o&apos;chirish huquqi (Right to Erasure)</strong>
                Profilni va unga biriktirilgan AI tahlil tarixini to&apos;liq va qayta tiklanmas darajada o&apos;chirib tashlashni talab qilish.
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E0D5] space-y-1">
                <strong className="text-[#0D1B34] font-semibold block text-sm">Rozilikni qaytarib olish</strong>
                Istalgan vaqtda shaxsga doir ma&apos;lumotlarni qayta ishlash bo&apos;yicha berilgan rozilikni bekor qilish.
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section id="aloqa" className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E0D5] pb-2">
              <span className="w-7 h-7 rounded-full bg-[#0D1B34] text-[#FAF7EE] text-xs font-mono font-bold flex items-center justify-center">
                7
              </span>
              <h2 className="font-editorial-heading text-2xl font-bold text-[#0D1B34]">
                Ma&apos;lumotlar xavfsizligi xizmati (DPO) va Bog&apos;lanish
              </h2>
            </div>
            <p>
              Shaxsga doir ma&apos;lumotlarni himoya qilish, maxfiylik masalalari yoki ma&apos;lumotlarni o&apos;chirish talablari yuzasidan quyidagi rasmiy kanallar orqali murojaat qilishingiz mumkin:
            </p>
            <div className="p-6 bg-white rounded-xl border border-[#E5E0D5] space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-[#8E6F24]" />
                <span><strong>Mas&apos;ul operator:</strong> &quot;Themis Legal Technologies&quot; MCHJ</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#8E6F24]" />
                <span><strong>Maxfiylik bo&apos;yicha elektron pochta:</strong> <a href="mailto:privacy@themis.uz" className="text-primary hover:underline font-mono">privacy@themis.uz</a> yoxud <a href="mailto:yordam@themis.uz" className="text-primary hover:underline font-mono">yordam@themis.uz</a></span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#8E6F24]" />
                <span><strong>Ishonch telefoni:</strong> <a href="tel:+998712000108" className="text-primary hover:underline font-mono">+998 (71) 200-01-08</a> (Dushanba - Juma, 09:00 - 18:00)</span>
              </div>
            </div>
          </section>

          {/* Closing stamp */}
          <div className="pt-8 border-t border-[#E5E0D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <p>© 2026 Themis (Huquqiy Yordam). Barcha huquqlar himoyalangan.</p>
            <Link href="/terms" className="text-primary hover:underline">
              Foydalanish shartlari (Ommaviy oferta) →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
