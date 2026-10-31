"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Sparkles,
  Users,
  Calendar,
  User,
  LogOut,
  Briefcase,
  ShieldCheck,
  Menu,
  X,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    email: string;
    role: string;
  }>({
    id: "demo-user-1",
    full_name: "Azizbek Nurmatov",
    email: "mijoz@themis.uz",
    role: "user",
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            setUserProfile({
              id: profile.user_id,
              full_name: profile.full_name,
              email: profile.email || user.email || "",
              role: profile.role,
            });
            return;
          }
        }
      } catch (err) {}

      const stored = localStorage.getItem("themis_demo_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserProfile(parsed);
        } catch (e) {}
      }
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem("themis_demo_user");
    toast.success("Tizimdan chiqildi");
    router.push("/login");
  };

  const switchRole = (role: "user" | "specialist" | "admin") => {
    const personas = {
      user: {
        id: "demo-user-1",
        email: "mijoz@themis.uz",
        full_name: "Azizbek Nurmatov",
        role: "user",
        redirect: "/dashboard",
      },
      specialist: {
        id: "spec-1",
        email: "yurist@themis.uz",
        full_name: "Azizbek Rahimov",
        role: "specialist",
        redirect: "/specialist",
      },
      admin: {
        id: "admin-root-1",
        email: "admin@themis.uz",
        full_name: "Bosh Administrator",
        role: "admin",
        redirect: "/admin",
      },
    };
    const next = personas[role];
    localStorage.setItem("themis_demo_user", JSON.stringify(next));
    setUserProfile(next);
    toast.info(`${role.toUpperCase()} rejimiga o'tildi`);
    router.push(next.redirect);
  };

  const navItems = [
    { href: "/dashboard", label: "Mening Ishlarim", icon: LayoutDashboard },
    { href: "/ai-chat", label: "AI Huquqiy Tahlil", icon: Sparkles },
    { href: "/specialists", label: "Advokatlar Reyestri", icon: Users },
    { href: "/consultations", label: "Konsultatsiyalarim", icon: Calendar },
    { href: "/profile", label: "Shaxsiy Kabinet", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5] text-[#0B132B]">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B132B] text-white border-b border-[#C59B27]/30 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-[#D4AF37]" />
          <span className="font-serif font-bold text-lg text-white">Huquqiy Yordam</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-[#0B132B] text-white md:min-h-screen flex flex-col z-30 border-r border-[#C59B27]/30 transition-all`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/10 hidden md:block">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C59B27]/20 flex items-center justify-center border border-[#C59B27]/40 shadow-xs">
              <Scale className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white tracking-tight leading-none block">
                Huquqiy Yordam
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#C59B27] uppercase block mt-1">
                Adliya Nazorati
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400 px-3 mb-2 font-semibold">
            Asosiy Bo&apos;limlar
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#C59B27] text-[#0B132B] font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400 px-3 mb-2 font-semibold">
              Maxsus Kabinetlar
            </div>
            <Link
              href="/specialist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-amber-200/90 hover:bg-white/10 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-[#D4AF37]" />
              Advokat Kabineti
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Bosh Nazoratchi Paneli
            </Link>
          </div>

          {/* Quick Persona Switcher in Sidebar */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="text-[9px] font-mono tracking-wider uppercase text-slate-400 px-3 mb-2">
              Tezkor Rol Almashinuvi
            </div>
            <div className="grid grid-cols-3 gap-1 px-2">
              <button
                type="button"
                onClick={() => switchRole("user")}
                className={`px-1.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                  userProfile.role === "user"
                    ? "bg-[#C59B27]/30 text-[#D4AF37] border-[#C59B27]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                Fuqaro
              </button>
              <button
                type="button"
                onClick={() => switchRole("specialist")}
                className={`px-1.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                  userProfile.role === "specialist"
                    ? "bg-[#C59B27]/30 text-[#D4AF37] border-[#C59B27]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                Advokat
              </button>
              <button
                type="button"
                onClick={() => switchRole("admin")}
                className={`px-1.5 py-1 rounded text-[10px] font-medium border transition-colors ${
                  userProfile.role === "admin"
                    ? "bg-[#C59B27]/30 text-[#D4AF37] border-[#C59B27]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </nav>

        {/* User Card with Role Badge */}
        <div className="p-4 border-t border-white/10 bg-[#081021]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-[#C59B27]/40">
                <AvatarFallback className="bg-[#C59B27]/20 text-[#D4AF37] font-bold text-xs">
                  {getInitials(userProfile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {userProfile.full_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 font-semibold uppercase">
                    {userProfile.role === "admin"
                      ? "Admin"
                      : userProfile.role === "specialist"
                      ? "Advokat"
                      : "Fuqaro"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {userProfile.email}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Chiqish"
              className="text-slate-400 hover:text-red-400 hover:bg-white/5 shrink-0 h-8 w-8 ml-1"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
