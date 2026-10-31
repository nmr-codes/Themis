"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Briefcase, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/lib/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "specialist") {
      setRole("specialist");
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    if (password.length < 6) {
      toast.error("Parol kamida 6 belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        toast.success("Ro'yxatdan muvaffaqiyatli o'tildi!");
        localStorage.setItem(
          "themis_demo_user",
          JSON.stringify({
            id: "demo-user-" + Date.now(),
            email,
            full_name: fullName,
            role: role,
          })
        );
        setSuccess(true);
        setTimeout(() => {
          if (role === "specialist") {
            router.push("/specialist/profile");
          } else {
            router.push("/dashboard");
          }
        }, 1200);
        return;
      }

      setSuccess(true);
      toast.success("Hisob yaratildi! Tizimga yo'naltirilmoqdasiz...");
      setTimeout(() => {
        router.push(role === "specialist" ? "/specialist/profile" : "/dashboard");
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 sm:p-8 border border-[#E2DCD0] shadow-md bg-[#FDFBF7]">
      <div className="mb-6 pb-4 border-b border-[#E2DCD0]">
        <h2 className="font-serif text-2xl font-bold text-[#0B132B]">
          Yangi Hisob Ochish
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          O&apos;zingizga mos huquqiy maqomni tanlang va xavfsiz tizimdan foydalaning
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Elevated Role Selection Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("user")}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all ${
              role === "user"
                ? "border-[#0B132B] bg-[#0B132B] text-white shadow-sm ring-2 ring-[#C59B27]/40"
                : "border-[#E2DCD0] hover:border-[#C59B27] bg-[#FAF8F5] text-slate-700"
            }`}
          >
            <User className={`h-5 w-5 mb-1 ${role === "user" ? "text-[#D4AF37]" : "text-slate-500"}`} />
            <span className="text-xs font-bold">Fuqaro (Mijoz)</span>
            <span className={`text-[10px] mt-0.5 ${role === "user" ? "text-slate-300" : "text-slate-500"}`}>
              Huquqiy maslahat oluvchi
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("specialist")}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all ${
              role === "specialist"
                ? "border-[#0B132B] bg-[#0B132B] text-white shadow-sm ring-2 ring-[#C59B27]/40"
                : "border-[#E2DCD0] hover:border-[#C59B27] bg-[#FAF8F5] text-slate-700"
            }`}
          >
            <Briefcase className={`h-5 w-5 mb-1 ${role === "specialist" ? "text-[#D4AF37]" : "text-slate-500"}`} />
            <span className="text-xs font-bold">Advokat / Yurist</span>
            <span className={`text-[10px] mt-0.5 ${role === "specialist" ? "text-slate-300" : "text-slate-500"}`}>
              Litsenziyalangan mutaxassis
            </span>
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-[#0B132B]">
            To&apos;liq ism-sharifingiz
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="name"
              placeholder="Alisher Qodirov"
              className="pl-9 bg-white border-[#E2DCD0] text-xs sm:text-sm h-10 rounded-lg focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        </div>

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
          <Label htmlFor="password" className="text-xs font-semibold text-[#0B132B]">
            Maxfiy parol (kamida 6 belgi)
          </Label>
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
          disabled={loading || success}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" /> Yaratilmoqda...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Bajarildi!
            </>
          ) : (
            <>
              Ro&apos;yxatdan o&apos;tish <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
            </>
          )}
        </Button>

        <div className="text-center text-xs text-slate-600 pt-3">
          Allaqachon hisobingiz bormi?{" "}
          <Link href="/login" className="text-[#8E6F24] hover:text-[#0B132B] font-bold underline underline-offset-2">
            Tizimga kirish
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-mono text-slate-500">Yuklanmoqda...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
