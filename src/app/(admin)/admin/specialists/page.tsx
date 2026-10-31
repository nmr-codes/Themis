"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  Search,
  Scale,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { REGIONS } from "@/lib/constants";
import { toast } from "sonner";

interface SpecialistVerificationItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  region: string;
  region_name: string;
  university: string;
  experience: string;
  license_number: string;
  categories: string[];
  documents: { title: string; issuer: string; date?: string }[];
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
}

const STORAGE_KEY_VERIFS = "themis_specialist_verifications";

export default function AdminSpecialistsPage() {
  const [specialists, setSpecialists] = useState<SpecialistVerificationItem[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState<SpecialistVerificationItem | null>(null);

  // Initialize specialists from MOCK_SPECIALISTS and merge with localStorage overrides
  useEffect(() => {
    let verifOverrides: Record<string, { status: "pending" | "approved" | "rejected"; admin_notes?: string }> = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERIFS);
      if (stored) {
        verifOverrides = JSON.parse(stored);
      }
    } catch (e) {}

    const mapped: SpecialistVerificationItem[] = MOCK_SPECIALISTS.map((spec) => {
      const override = verifOverrides[spec.id];
      const initialStatus =
        override?.status ||
        (spec.verification_status as "pending" | "approved" | "rejected") ||
        "approved";

      const regionObj = REGIONS.find((r) => r.id === spec.region);
      return {
        id: spec.id,
        full_name: spec.full_name,
        email: `${spec.id}@themis.uz`,
        phone: "+998 90 123 45 67",
        region: spec.region || "tashkent_city",
        region_name: regionObj?.name_uz || spec.region || "Toshkent shahri",
        university: spec.education || "Toshkent Davlat Yuridik Universiteti",
        experience: `${spec.experience_years} yil`,
        license_number: spec.license_number || "#ADV-1049",
        categories: spec.categories.map((c) => c.name_uz),
        documents: [
          {
            title: `Advokatlik faoliyati litsenziyasi ${spec.license_number || "#ADV-1049"}`,
            issuer: "O'zbekiston Respublikasi Adliya vazirligi",
            date: "2018-05-12",
          },
          {
            title: "Oliy yuridik ma'lumot diplomi",
            issuer: (spec.education || "").split("—")[0].trim() || "TDYU",
            date: "2015-06-25",
          },
        ],
        status: initialStatus,
        admin_notes: override?.admin_notes,
      };
    });

    setSpecialists(mapped);
  }, []);

  const persistOverride = (id: string, status: "pending" | "approved" | "rejected", admin_notes?: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VERIFS);
      const overrides = stored ? JSON.parse(stored) : {};
      overrides[id] = { status, admin_notes, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY_VERIFS, JSON.stringify(overrides));
    } catch (e) {}
  };

  const handleApprove = (id: string) => {
    const target = specialists.find((s) => s.id === id);
    const updated = specialists.map((s) =>
      s.id === id ? { ...s, status: "approved" as const, admin_notes: "Adliya vazirligi litsenziyasi tasdiqlandi" } : s
    );
    setSpecialists(updated);
    persistOverride(id, "approved", "Adliya vazirligi litsenziyasi tasdiqlandi");
    setSelectedSpec(null);
    toast.success(`${target?.full_name || "Advokat"} litsenziyasi tasdiqlandi va ommaviy reyestrga chiqarildi!`);
  };

  const handleReject = (id: string) => {
    const target = specialists.find((s) => s.id === id);
    const updated = specialists.map((s) =>
      s.id === id ? { ...s, status: "rejected" as const, admin_notes: "Hujjatlar talabga javob bermadi" } : s
    );
    setSpecialists(updated);
    persistOverride(id, "rejected", "Hujjatlar talabga javob bermadi");
    setSelectedSpec(null);
    toast.error(`${target?.full_name || "Advokat"} arizasi rad etildi.`);
  };

  const filtered = specialists.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.license_number.toLowerCase().includes(search.toLowerCase()) ||
      s.university.toLowerCase().includes(search.toLowerCase())
  );

  const pendingList = filtered.filter((s) => s.status === "pending");
  const approvedList = filtered.filter((s) => s.status === "approved");
  const rejectedList = filtered.filter((s) => s.status === "rejected");

  const renderSpecialistCard = (spec: SpecialistVerificationItem) => (
    <Card
      key={spec.id}
      className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs hover:border-[#C59B27]/60 transition-all"
    >
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-[#C59B27]/40 shrink-0">
            <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-sm">
              {getInitials(spec.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#0B132B]">
                {spec.full_name}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                {spec.license_number}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF0D9] text-[#845D18] border border-[#C59B27]/40">
                {spec.region_name}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {spec.university} • Tajriba: {spec.experience}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {spec.categories.map((c, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E2DCD0] text-slate-700"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="pt-1 flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-[#C59B27]" />
                {spec.documents.length} ta tekshiriluvchi hujjat
              </span>
              <span>•</span>
              <span>{spec.email}</span>
            </div>
          </div>
        </div>

        {/* 1-Click Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedSpec(spec)}
            className="text-xs border-[#E2DCD0] hover:bg-[#FAF0D9]/50 text-[#0B132B]"
          >
            <Eye className="h-3.5 w-3.5 mr-1 text-[#8E6F24]" />
            Hujjatlar
          </Button>

          {spec.status === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(spec.id)}
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Rad etish
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(spec.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-xs font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tasdiqlash
              </Button>
            </>
          )}

          {spec.status === "approved" && (
            <Badge className="bg-emerald-100 text-[#166534] border-0 text-xs py-1 px-2.5 font-semibold">
              Tasdiqlangan ✓
            </Badge>
          )}

          {spec.status === "rejected" && (
            <div className="flex items-center gap-2">
              <Badge className="bg-rose-100 text-rose-800 border-0 text-xs py-1 px-2.5 font-semibold">
                Rad etilgan
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprove(spec.id)}
                className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              >
                Qayta tasdiqlash
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Mutaxassislarni Tekshirish va Litsenziyalash
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Adliya Palatasi Nazorati
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Advokatlik litsenziyasi (#ADV-xxxx), diplom va davlat reyestri guvohnomalarini verifikatsiya qilish
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Ism yoki litsenziya (#ADV-...) bo'yicha qidirish..."
          className="pl-9 text-xs bg-[#FDFBF7] border-[#E2DCD0]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-3 max-w-md">
          <TabsTrigger
            value="pending"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Kutilayotganlar ({pendingList.length})
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Tasdiqlanganlar ({approvedList.length})
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Rad etilganlar ({rejectedList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pendingList.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                Kutilayotgan arizalar mavjud emas. Barcha mutaxassislar tekshiruvdan o&apos;tgan.
              </CardContent>
            </Card>
          ) : (
            pendingList.map(renderSpecialistCard)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-3">
          {approvedList.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                Tasdiqlangan advokatlar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            approvedList.map(renderSpecialistCard)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3">
          {rejectedList.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                Rad etilgan arizalar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            rejectedList.map(renderSpecialistCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Document Dossier Inspection Dialog */}
      <Dialog open={!!selectedSpec} onOpenChange={(open) => !open && setSelectedSpec(null)}>
        {selectedSpec && (
          <DialogContent className="sm:max-w-lg bg-[#FAF8F5] border border-[#E2DCD0]">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#C59B27]" />
                <DialogTitle className="font-serif text-xl font-bold text-[#0B132B]">
                  Litsenziya Dosyesi: {selectedSpec.full_name}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-600 font-mono">
                {selectedSpec.license_number} • {selectedSpec.region_name} • {selectedSpec.university}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                Yuklangan Malaka Hujjatlari:
              </h4>
              {selectedSpec.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#E2DCD0] bg-white flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="h-5 w-5 text-[#0D47A1] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Bergan organ: {doc.issuer} {doc.date ? `(${doc.date})` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-[#166534] border border-emerald-200 text-[10px]">
                    Muhrlangan
                  </Badge>
                </div>
              ))}

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-[#8E6F24]" />
                  Adliya Vazirligi Tekshiruv Xulosasi:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Litsenziya raqami Davlat reyestri bilan solishtirildi. Advokatlik faoliyati amalda va to&apos;xtatilmagan.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSpec(null)}
                className="border-[#E2DCD0] text-xs"
              >
                Yopish
              </Button>
              {selectedSpec.status === "pending" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleReject(selectedSpec.id)}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Rad etish
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleApprove(selectedSpec.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Tasdiqlash & Reyestrga chiqarish
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
