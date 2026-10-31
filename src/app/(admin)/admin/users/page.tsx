"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  Shield,
  Mail,
  UserCog,
  Power,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface AdminUserRecord {
  id: string;
  full_name: string;
  email: string;
  role: "user" | "specialist" | "admin";
  role_label: string;
  region: string;
  status: "active" | "suspended";
  joined: string;
}

const SEED_USERS: AdminUserRecord[] = [
  {
    id: "u-1",
    full_name: "Azizbek Nurmatov",
    email: "mijoz@themis.uz",
    role: "user",
    role_label: "Fuqaro (Mijoz)",
    region: "Toshkent shahri",
    status: "active",
    joined: "12-oktabr, 2026",
  },
  {
    id: "u-2",
    full_name: "Azizbek Rahimov",
    email: "yurist@themis.uz",
    role: "specialist",
    role_label: "Litsenziyalangan Advokat",
    region: "Toshkent shahri",
    status: "active",
    joined: "10-yanvar, 2026",
  },
  {
    id: "u-3",
    full_name: "Dilnoza Karimova",
    email: "dilnoza.k@themis.uz",
    role: "specialist",
    role_label: "Litsenziyalangan Advokat",
    region: "Samarqand viloyati",
    status: "active",
    joined: "01-fevral, 2026",
  },
  {
    id: "u-4",
    full_name: "Bosh Administrator",
    email: "admin@themis.uz",
    role: "admin",
    role_label: "Tizim Administratori",
    region: "Toshkent shahri",
    status: "active",
    joined: "01-yanvar, 2026",
  },
  {
    id: "u-5",
    full_name: "Shahnoza Alimova",
    email: "shahnoza.a@themis.uz",
    role: "specialist",
    role_label: "Advokat (Arizachi)",
    region: "Buxoro viloyati",
    status: "active",
    joined: "29-oktabr, 2026",
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("themis_demo_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.email && !SEED_USERS.some((su) => su.email === u.email)) {
          const newUser: AdminUserRecord = {
            id: u.id || "u-demo-" + Date.now(),
            full_name: u.full_name || "Yangi Foydalanuvchi",
            email: u.email,
            role: (u.role as any) || "user",
            role_label:
              u.role === "admin"
                ? "Tizim Administratori"
                : u.role === "specialist"
                ? "Litsenziyalangan Advokat"
                : "Fuqaro (Mijoz)",
            region: "Toshkent shahri",
            status: "active",
            joined: "Bugun",
          };
          setUsers((prev) => [newUser, ...prev]);
        }
      }
    } catch (e) {}
  }, []);

  const handleRoleChange = (userId: string, newRole: "user" | "specialist" | "admin") => {
    const roleLabels = {
      user: "Fuqaro (Mijoz)",
      specialist: "Litsenziyalangan Advokat",
      admin: "Tizim Administratori",
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
              role_label: roleLabels[newRole],
            }
          : u
      )
    );

    const targetUser = users.find((u) => u.id === userId);
    toast.success(
      `${targetUser?.full_name || "Foydalanuvchi"} huquqiy roli "${roleLabels[newRole]}" ga o'zgartirildi!`
    );
  };

  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "active" ? "suspended" : "active";
          toast.info(
            `${u.full_name} hisobi ${nextStatus === "active" ? "faollashtirildi" : "bloklandi"}`
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.region.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "citizens") return u.role === "user";
    if (activeTab === "specialists") return u.role === "specialist";
    if (activeTab === "admins") return u.role === "admin";
    return true;
  });

  const citizenCount = users.filter((u) => u.role === "user").length;
  const specialistCount = users.filter((u) => u.role === "specialist").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Foydalanuvchilar va Rollar Boshqaruvi
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Davlat Reyestri Nazorati
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Platformada ro&apos;yxatdan o&apos;tgan fuqarolar, advokatlar maqomi, rollarni oshirish/pasaytirish va hisob blokirovkasi
          </p>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase">Fuqarolar (Mijozlar)</span>
            <p className="font-serif text-2xl font-bold text-[#0B132B]">{citizenCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase">Litsenziyali Advokatlar</span>
            <p className="font-serif text-2xl font-bold text-emerald-700">{specialistCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E2DCD0] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase">Tizim Administratorlari</span>
            <p className="font-serif text-2xl font-bold text-[#8E6F24]">{adminCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Ism, elektron pochta yoki hudud..."
          className="pl-9 text-xs bg-[#FDFBF7] border-[#E2DCD0]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-4 max-w-lg">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Barchasi ({users.length})
          </TabsTrigger>
          <TabsTrigger
            value="citizens"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Fuqarolar ({citizenCount})
          </TabsTrigger>
          <TabsTrigger
            value="specialists"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Advokatlar ({specialistCount})
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Adminlar ({adminCount})
          </TabsTrigger>
        </TabsList>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E2DCD0] bg-[#FAF8F5] text-slate-600 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Foydalanuvchi</th>
                    <th className="p-3.5">Elektron pochta</th>
                    <th className="p-3.5">Hudud</th>
                    <th className="p-3.5">Amaldagi Roli</th>
                    <th className="p-3.5">Rolni O&apos;zgartirish</th>
                    <th className="p-3.5">Holati</th>
                    <th className="p-3.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0] text-slate-800 bg-white">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-3.5 flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border border-[#C59B27]/40 shrink-0">
                          <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-xs">
                            {getInitials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold text-slate-900 block">{u.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {u.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                      <td className="p-3.5 text-slate-600">{u.region}</td>
                      <td className="p-3.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold border-0 ${
                            u.role === "admin"
                              ? "bg-amber-100 text-amber-900"
                              : u.role === "specialist"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role_label}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        {/* Interactive Role Promotion/Demotion Dropdown */}
                        <Select
                          value={u.role}
                          onValueChange={(val: any) => handleRoleChange(u.id, val)}
                        >
                          <SelectTrigger className="h-7 w-32 text-[11px] bg-[#FAF8F5] border-[#E2DCD0]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user" className="text-xs">
                              Fuqaro
                            </SelectItem>
                            <SelectItem value="specialist" className="text-xs">
                              Advokat
                            </SelectItem>
                            <SelectItem value="admin" className="text-xs">
                              Administrator
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          className={`text-[10px] border-0 ${
                            u.status === "active"
                              ? "bg-emerald-100 text-[#166534]"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {u.status === "active" ? "Faol" : "Bloklangan"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(u.id)}
                          className={`text-[11px] h-7 px-2.5 ${
                            u.status === "active"
                              ? "text-rose-600 hover:bg-rose-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          <Power className="h-3 w-3 mr-1" />
                          {u.status === "active" ? "Bloklash" : "Faollashtirish"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
