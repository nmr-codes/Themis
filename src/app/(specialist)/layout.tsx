"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  User,
  Briefcase,
  Inbox,
  CalendarDays,
  DollarSign,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export default function SpecialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [specialist, setSpecialist] = useState({
    full_name: "Azizbek Rahimov",
    email: "azizbek.r@themis.uz",
    status: "approved",
    license: "#ADV-3810 (Toshkent)",
  });

  const navItems = [
    { href: "/specialist", label: "Advokat Docketsi", icon: LayoutDashboard },
    { href: "/specialist/requests", label: "Mijoz So'rovlari", icon: Inbox, badge: "2" },
    { href: "/specialist/profile", label: "Advokatlik Dosyesi", icon: User },
    { href: "/specialist/services", label: "Yuridik Xizmatlar", icon: Briefcase },
    { href: "/specialist/schedule", label: "Qabul Jadvali", icon: CalendarDays },
    { href: "/specialist/earnings", label: "Eskrou & Daromad", icon: DollarSign },
  ];

  const handleLogout = () => {
    localStorage.removeItem("themis_demo_user");
    toast.info("Advokat kabinetidan chiqildi");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5] text-[#0B132B]">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B132B] text-white border-b border-[#C59B27]/40 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C59B27]/20 flex items-center justify-center border border-[#C59B27]/40">
            <Scale className="h-4 w-4 text-[#C59B27]" />
          </div>
          <div>
            <span className="font-editorial-heading font-bold text-base text-white tracking-wide">
              Advokat Kabineti
            </span>
            <span className="text-[10px] font-mono text-slate-300 block">
              Themis Chambers
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-68 bg-[#0B132B] text-white border-r border-[#C59B27]/30 md:min-h-screen flex flex-col z-30`}
      >
        {/* Brand / Chamber Masthead */}
        <div className="p-5 border-b border-[#C59B27]/25 hidden md:flex items-center justify-between">
          <Link href="/specialist" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#C59B27]/20 flex items-center justify-center border border-[#C59B27]/50 shadow-sm">
              <Scale className="h-5 w-5 text-[#C59B27]" />
            </div>
            <div>
              <span className="font-editorial-heading font-bold text-lg text-white tracking-tight leading-none block">
                Advokat Palatasi
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#C59B27] mt-1 block">
                Rasmiy Portal
              </span>
            </div>
          </Link>
          <span className="legal-seal bg-emerald-950/60 text-emerald-400 border-emerald-500/40 text-[9px]">
            Litsenziyali
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/specialist" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#C59B27] text-[#0B132B] font-bold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-[#0B132B] text-[#C59B27]"
                        : "bg-[#C59B27]/30 text-[#C59B27]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
            <Link
              href="/specialists/spec-1"
              target="_blank"
              className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#C59B27] hover:text-amber-200 transition-colors"
            >
              <Award className="h-3.5 w-3.5" />
              Ommaviy dosye ko&apos;rinishi
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Mijoz sahifasiga o&apos;tish
            </Link>
          </div>
        </nav>

        {/* Advocate User Card in Sidebar */}
        <div className="p-4 border-t border-[#C59B27]/25 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-9 w-9 border border-[#C59B27]/50">
              <AvatarFallback className="bg-[#C59B27] text-[#0B132B] font-editorial-heading font-bold text-xs">
                {getInitials(specialist.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {specialist.full_name}
              </p>
              <p className="text-[10px] font-mono text-[#C59B27] truncate">
                {specialist.license}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
            title="Kabinetdan chiqish"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
