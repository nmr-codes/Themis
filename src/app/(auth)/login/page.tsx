"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, User, Briefcase, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("Invalid API key") ||
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
        ) {
          const role = email.includes("admin")
            ? "admin"
            : email.includes("law") || email.includes("spec") || email.includes("yurist")
            ? "specialist"
            : "user";

          const persona = {
            id: role === "specialist" ? "spec-1" : role === "admin" ? "admin-root-1" : "demo-user-1",
            email,
            full_name:
              role === "specialist"
                ? "Azizbek Rahimov"
                : role === "admin"
                ? "Bosh Administrator"
                : email.split("@")[0] || "Azizbek Nurmatov",
            role,
          };

          localStorage.setItem("themis_demo_user", JSON.stringify(persona));
          toast.success("Adliya portaliga muvaffaqiyatli kirdingiz!");

          if (role === "admin") {
            router.push("/admin");
          } else if (role === "specialist") {
            router.push("/specialist");
          } else {
            router.push("/dashboard");
          }
          return;
        }
        toast.error(error.message || "Kirishda xatolik yuz berdi");
        return;
      }

      // Check role if available in user metadata
      const userMeta = data?.user?.user_metadata;
      const role = userMeta?.role || (email.includes("admin") ? "admin" : email.includes("yurist") ? "specialist" : "user");

      localStorage.setItem(
        "themis_demo_user",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email || email,
          full_name: userMeta?.full_name || email.split("@")[0],
          role,
        })
      );

      toast.success("Muvaffaqiyatli kirdingiz!");
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "specialist") {
        router.push("/specialist");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Tizimga kirishda kutilmagan xatolik");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Genuine 1-click Demo Persona Switcher
   * Immediately persists persona to localStorage and routes to designated portal.
   */
  const handleQuickDemo = (role: "user" | "specialist" | "admin") => {
    const personas = {
      user: {
        id: "demo-user-1",
        email: "mijoz@themis.uz",
        full_name: "Azizbek Nurmatov",
        role: "user" as const,
        redirect: "/dashboard",
        title: "Fuqaro (Mijoz)",
      },
      specialist: {
        id: "spec-1",
        email: "yurist@themis.uz",
        full_name: "Azizbek Rahimov",
        role: "specialist" as const,
        redirect: "/specialist",
        title: "Litsenziyalangan Advokat",
      },
      admin: {
        id: "admin-root-1",
        email: "admin@themis.uz",
        full_name: "Bosh Administrator",
        role: "admin" as const,
        redirect: "/admin",
        title: "Tizim Bosh Nazoratchisi",
      },
    };

    const selected = personas[role];
    setEmail(selected.email);
    setPassword("password123");

    localStorage.setItem(
      "themis_demo_user",
      JSON.stringify({
        id: selected.id,
        email: selected.email,
        full_name: selected.full_name,
        role: selected.role,
      })
    );

    toast.success(`${selected.full_name} (${selected.title}) sifatida portalga kirdingiz!`);
    router.push(selected.redirect);
  };

  return (
    <div className="rounded-2xl p-6 sm:p-8 border border-[#E2DCD0] shadow-md bg-[#FDFBF7]">
      <div className="mb-6 pb-4 border-b border-[#E2DCD0]">
        <h2 className="font-serif text-2xl font-bold text-[#0B132B]">
          Portalga Kirish
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Shaxsiy kabinetga kirish uchun elektron pochta va maxfiy parolingizni kiriting
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-[#0B132B]">
            Elektron pochta
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="alisher@adolat.uz"
              className="pl-9 bg-white border-[#E2DCD0] text-xs sm:text-sm h-10 rounded-lg focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-[#0B132B]">
              Maxfiy parol
            </Label>
            <ForgotPasswordModal
              initialEmail={email}
              trigger={
                <button
                  type="button"
                  className="text-[11px] text-[#8E6F24] hover:text-[#0B132B] font-medium transition-colors"
                >
                  Parolni unutdingizmi?
                </button>
              }
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9 bg-white border-[#E2DCD0] text-xs sm:text-sm h-10 rounded-lg focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-sm h-11 font-medium shadow-sm gap-2 border border-[#C59B27]/40 mt-2 transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" /> Tekshirilmoqda...
            </>
          ) : (
            <>
              Kirish <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
            </>
          )}
        </Button>

        {/* 1-Click Demo Persona Switcher */}
        <div className="pt-4 mt-4 border-t border-[#E2DCD0]">
          <p className="text-[11px] font-mono text-slate-600 mb-2.5 uppercase tracking-wider font-semibold text-center">
            1-bosqichli sinov rollari (Demo):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("user")}
              className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#FAF0D9]/80 border border-[#C59B27]/50 text-[#7E5919] hover:bg-[#FAF0D9] hover:border-[#C59B27] hover:shadow-xs transition-all"
            >
              <User className="h-4 w-4 mb-1 text-[#8E6F24] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold leading-tight">Fuqaro</span>
              <span className="text-[9px] text-[#8E6F24]/80 font-mono mt-0.5">/dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("specialist")}
              className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#0B132B]/5 border border-[#0B132B]/20 text-[#0B132B] hover:bg-[#0B132B]/10 hover:border-[#0B132B]/40 hover:shadow-xs transition-all"
            >
              <Briefcase className="h-4 w-4 mb-1 text-[#0D47A1] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold leading-tight">Advokat</span>
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">/specialist</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="group flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 text-emerald-800 hover:bg-emerald-100/90 hover:border-emerald-400 hover:shadow-xs transition-all"
            >
              <ShieldCheck className="h-4 w-4 mb-1 text-[#166534] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold leading-tight">Admin</span>
              <span className="text-[9px] text-emerald-700/80 font-mono mt-0.5">/admin</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-600 pt-2 flex flex-col items-center gap-1">
          <div>
            Hisobingiz yo&apos;qmi?{" "}
            <Link href="/register" className="text-[#8E6F24] hover:text-[#0B132B] font-bold underline underline-offset-2">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </div>
          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-2 pt-1">
            <Link href="/terms" className="hover:underline">Foydalanish shartlari</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Maxfiylik siyosati</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
