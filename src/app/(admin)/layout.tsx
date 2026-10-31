"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Star,
  CreditCard,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Award,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingSpecCount, setPendingSpecCount] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("themis_specialist_verifications");
      if (stored) {
        const verifs = JSON.parse(stored);
        // spec-5 is pending by default unless marked approved/rejected
        if (verifs["spec-5"] === "approved" || verifs["spec-5"] === "rejected") {
          setPendingSpecCount(0);
        } else {
          setPendingSpecCount(1);
        }
      }
    } catch (e) {}
  }, [pathname]);

  const navItems = [
    { href: "/admin", label: "Nazorat Palatasi", icon: LayoutDashboard },
    {
      href: "/admin/specialists",
      label: "Litsenziyalar Tekshiruvi",
      icon: UserCheck,
      badge: pendingSpecCount > 0 ? String(pendingSpecCount) : undefined,
    },
    { href: "/admin/users", label: "Fuqarolar Reyestri", icon: Users },
    { href: "/admin/consultations", label: "Konsultatsiyalar Nazorati", icon: Calendar },
    { href: "/admin/reviews", label: "Sharhlar Moderatsiyasi", icon: Star },
    { href: "/admin/transactions", label: "Eskrou & Moliyaviy Oqim", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F5] text-[#0B132B]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B132B] text-white border-b border-[#C59B27]/40 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C59B27]/20 flex items-center justify-center border border-[#C59B27]/40">
            <Scale className="h-4 w-4 text-[#C59B27]" />
          </div>
          <div>
            <span className="font-serif font-bold text-base text-white tracking-wide">
              Nazorat Palatasi
            </span>
            <span className="text-[10px] font-mono text-[#C59B27] block">Bosh Nazoratchi</span>
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
        } md:block w-full md:w-68 bg-[#0B132B] text-white border-r border-[#C59B27]/30 flex flex-col z-30 md:min-h-screen`}
      >
        <div className="p-5 border-b border-[#C59B27]/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#C59B27]/20 flex items-center justify-center border border-[#C59B27]/50 shadow-sm">
              <Scale className="h-5 w-5 text-[#C59B27]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white tracking-tight leading-none block">
                Nazorat Palatasi
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#C59B27] mt-1 block">
                Davlat Nazorati
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C59B27] text-[#0B132B] font-bold">
            Root
          </span>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
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
                        : "bg-[#B84A2A] text-white"
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
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Bosh sahifaga qaytish
            </Link>
          </div>
        </nav>

        {/* Administrator Footnote */}
        <div className="p-4 border-t border-[#C59B27]/25 bg-white/5 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-semibold text-white">Xavfsizlik Nazorati Faol</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Lex.uz qonunchilik sinxronizatsiyasi va Eskrou depozit kafolati ta&apos;minlangan.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
