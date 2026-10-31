"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Award,
  BookOpen,
  Lock,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { REGIONS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("Azizbek Nurmatov");
  const [email, setEmail] = useState("foydalanuvchi@themis.uz");
  const [phone, setPhone] = useState("+998 90 123 45 67");
  const [region, setRegion] = useState("tashkent_city");
  const [language, setLanguage] = useState("uz");
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            setFullName(profile.full_name || "");
            setPhone(profile.phone || "");
            setRegion(profile.region || "tashkent_city");
            setLanguage(profile.preferred_language || "uz");
            setUserRole(profile.role || "user");
            return;
          }
        }
      } catch (err) {}

      const stored = localStorage.getItem("themis_demo_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.full_name) setFullName(u.full_name);
          if (u.email) setEmail(u.email);
          if (u.phone) setPhone(u.phone);
          if (u.region) setRegion(u.region);
          if (u.preferred_language) setLanguage(u.preferred_language);
          if (u.role) setUserRole(u.role);
        } catch (e) {}
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            phone,
            region,
            preferred_language: language,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      // Save locally as well for offline demo resilience
      const stored = localStorage.getItem("themis_demo_user");
      const base = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "themis_demo_user",
        JSON.stringify({
          ...base,
          full_name: fullName,
          email,
          phone,
          region,
          preferred_language: language,
        })
      );

      toast.success("Shaxsiy ma'lumotlaringiz va huquqiy dockets muvaffaqiyatli saqlandi!");
    } catch (err: any) {
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const selectedRegionName =
    REGIONS.find((r) => r.id === region)?.name_uz || "Toshkent shahri";

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Docket Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD0]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0D9] border border-[#C59B27]/40 text-[#845D18] text-xs font-mono mb-2">
            <Scale className="h-3.5 w-3.5 text-[#C59B27]" />
            <span>FUQARO HUQUQIY IDENTIFIKATSIYASI</span>
          </div>
          <h1 className="font-editorial-heading text-3xl sm:text-4xl font-bold text-[#0B132B]">
            Shaxsiy Kabinet & Huquqiy Profil
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Konstitutsiyaviy kafolatlar ostidagi shaxsiy identifikatsiya va advokatlik aloqasi ma&apos;lumotlari
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="legal-seal">
            <ShieldCheck className="h-3.5 w-3.5" />
            256-bit Shifrlangan
          </span>
        </div>
      </div>

      {/* Official Citizen Folio Card */}
      <div className="parchment-card rounded-2xl bg-[#FAF8F5] border-2 border-[#C59B27]/40 overflow-hidden shadow-sm">
        {/* Folio Masthead */}
        <div className="bg-[#0B132B] p-6 sm:p-8 text-white relative overflow-hidden border-b border-[#C59B27]/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-[#C59B27] shadow-md ring-4 ring-[#C59B27]/20">
                <AvatarFallback className="bg-[#FAF8F5] text-[#0B132B] font-editorial-heading font-bold text-2xl">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-editorial-heading text-2xl font-bold text-white tracking-wide">
                    {fullName}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C59B27]/20 text-[#C59B27] border border-[#C59B27]/40 font-bold uppercase">
                    {userRole === "admin"
                      ? "Bosh Administrator"
                      : userRole === "specialist"
                      ? "Litsenziyalangan Advokat"
                      : "Fuqaro (Mijoz)"}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-1">{email}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1 text-[#C59B27]">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedRegionName}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Profil faol
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs font-mono text-right hidden md:block">
              <span className="text-slate-400 block text-[10px] uppercase">
                Yurisdiksiya kodi:
              </span>
              <span className="font-bold text-white text-sm">
                UZ-JUR/2026-F
              </span>
              <span className="text-[10px] text-[#C59B27] block mt-0.5">
                Lex.uz milliy qamrovi
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Personal credentials */}
            <div>
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B] mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#0D47A1]" />
                Asosiy Identifikatsiya Ma&apos;lumotlari
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-xs font-mono uppercase tracking-wider text-slate-700">
                    To&apos;liq Ism-Sharif (F.I.SH)
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="fullname"
                      className="pl-10 h-11 bg-white border-[#E2DCD0] focus:border-[#0D47A1] text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-slate-700">
                    Rasmiy Elektron Pochta
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10 h-11 bg-slate-100 border-[#E2DCD0] text-slate-600 text-sm font-mono cursor-not-allowed"
                      value={email}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-mono uppercase tracking-wider text-slate-700">
                    Aloqa Telefon Raqami (SMS va Xabarnomalar uchun)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      className="pl-10 h-11 bg-white border-[#E2DCD0] focus:border-[#0D47A1] text-sm font-mono"
                      placeholder="+998 90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wider text-slate-700">
                    Yashash Hududi / Sud Yurisdiksiyasi
                  </Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="h-11 bg-white border-[#E2DCD0] focus:border-[#0D47A1] text-sm">
                      <SelectValue placeholder="Hududni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name_uz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Language & Preference */}
            <div className="pt-6 border-t border-[#E2DCD0]">
              <h3 className="font-editorial-heading text-lg font-bold text-[#0B132B] mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#0D47A1]" />
                Muloqot va Yuridik Hujjatlar Tili
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wider text-slate-700">
                    Asosiy til tanlovi
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-11 bg-white border-[#E2DCD0] focus:border-[#0D47A1] text-sm">
                      <SelectValue placeholder="Tilni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uz">O&apos;zbek tili (Lotin alifbosida)</SelectItem>
                      <SelectItem value="ru">Русский язык</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E2DCD0] text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#0B132B]">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Advokatlik siri himoyasi</span>
                  </div>
                  <p>
                    Ushbu ma&apos;lumotlar O&apos;zR &ldquo;Advokatura to&apos;g&apos;risida&rdquo;gi Qonunining
                    9-moddasi bilan himoyalangan va faqat siz konsultatsiyaga yozilgan advokatga taqdim etiladi.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-[#E2DCD0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500">
                Oxirgi yangilanish: Bugun • Shifrlangan kanal
              </span>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] px-8 h-12 rounded-xl text-sm font-semibold gap-2 shadow-sm border border-[#C59B27]/40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 text-[#C59B27]" />
                )}
                Profil ma&apos;lumotlarini tasdiqlash
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Constitutional Safeguard Card */}
      <div className="statute-border-gold p-6 rounded-xl bg-white border border-[#E2DCD0] shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#FAF0D9] flex items-center justify-center text-[#845D18] shrink-0 border border-[#C59B27]/40">
            <BookOpen className="h-5 w-5 text-[#C59B27]" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-editorial-heading font-bold text-base text-[#0B132B]">
              O&apos;zbekiston Respublikasi Konstitutsiyasi 28-moddasi Kafolati
            </h4>
            <p className="text-xs font-serif italic text-slate-700 leading-relaxed">
              &ldquo;Har kimga malakali yuridik yordam olish huquqi kafolatlanadi.
              Qonunda nazarda tutilgan hollarda yuridik yordam davlat hisobidan ko&apos;rsatiladi.&rdquo;
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#0D47A1]">
              <Link href="/specialists" className="hover:underline flex items-center gap-1">
                Advokatlar reyestrini ko&apos;rish <ArrowRight className="h-3 w-3" />
              </Link>
              <span>•</span>
              <Link href="/ai-chat" className="hover:underline flex items-center gap-1">
                AI Huquqiy Tahlilxona <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
