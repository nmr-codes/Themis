"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Video,
  MessageSquare,
  Search,
  Eye,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import {
  getStoredConsultations,
  updateConsultationStatus,
  StoredConsultation,
} from "@/lib/consultation-storage";
import { toast } from "sonner";

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [inspectModalItem, setInspectModalItem] = useState<StoredConsultation | null>(null);

  const refreshData = () => {
    setConsultations(getStoredConsultations());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusOverride = (id: string, status: StoredConsultation["status"]) => {
    updateConsultationStatus(id, status);
    refreshData();
    setInspectModalItem(null);
    toast.success(`Konsultatsiya holati muvaffaqiyatli "${status}" ga o'zgartirildi!`);
  };

  const filtered = consultations.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.specialist_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.user_notes && c.user_notes.toLowerCase().includes(search.toLowerCase())) ||
      c.service_name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "pending") return c.status === "pending";
    if (activeTab === "scheduled")
      return (
        c.status === "scheduled" ||
        c.status === "accepted" ||
        c.status === "confirmed" ||
        c.status === "in_progress"
      );
    if (activeTab === "completed") return c.status === "completed";
    if (activeTab === "cancelled") return c.status === "cancelled";
    return true;
  });

  const pendingList = consultations.filter((c) => c.status === "pending");
  const scheduledList = consultations.filter(
    (c) =>
      c.status === "scheduled" ||
      c.status === "accepted" ||
      c.status === "confirmed" ||
      c.status === "in_progress"
  );
  const completedList = consultations.filter((c) => c.status === "completed");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Konsultatsiyalar Nazorati va Monitoringi
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Global Adliya Nazorati
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Fuqarolar va advokatlar o&apos;rtasidagi barcha rasmiy konsultatsiyalar daftari, eskrou to&apos;lovlari va formatlari
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="ID (#c-...), advokat yoki mijoz bo'yicha..."
          className="pl-9 text-xs bg-[#FDFBF7] border-[#E2DCD0]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-4 max-w-lg">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Barchasi ({consultations.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Kutilmoqda ({pendingList.length})
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Tasdiqlangan ({scheduledList.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Yakunlangan ({completedList.length})
          </TabsTrigger>
        </TabsList>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E2DCD0] bg-[#FAF8F5] text-slate-600 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">ID & Vaqt</th>
                    <th className="p-3.5">Advokat</th>
                    <th className="p-3.5">Xizmat & Format</th>
                    <th className="p-3.5">Yalpi Summa</th>
                    <th className="p-3.5">Komissiya (15%)</th>
                    <th className="p-3.5">Advokatga (85%)</th>
                    <th className="p-3.5">Holati</th>
                    <th className="p-3.5 text-right">Tekshirish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0] text-slate-800 bg-white">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-slate-500 font-mono">
                        Konsultatsiya yozuvlari topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const fee = Math.round(c.price * 0.15);
                      const net = c.price - fee;

                      return (
                        <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="p-3.5 font-mono whitespace-nowrap">
                            <span className="font-bold text-[#0B132B] block">#{c.id}</span>
                            <span className="text-[10px] text-slate-500">{c.scheduled_at}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-900 block">{c.specialist_name}</span>
                            <span className="text-[10px] font-mono text-slate-500">{c.category}</span>
                          </td>
                          <td className="p-3.5">
                            <p className="line-clamp-1 max-w-[200px]">{c.service_name}</p>
                            <span className="text-[10px] font-mono text-blue-700">
                              {c.format === "video" ? "Video uchrashuv" : "Xavfsiz chat"}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-medium">{formatPrice(c.price)}</td>
                          <td className="p-3.5 font-mono text-rose-600">+{formatPrice(fee)}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-700">
                            {formatPrice(net)}
                          </td>
                          <td className="p-3.5">
                            <Badge
                              className={`text-[10px] border-0 font-semibold ${
                                c.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : c.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : c.status === "cancelled"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {c.status_label || (c.status === "pending" ? "Kutilmoqda" : "Tasdiqlangan")}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInspectModalItem(c)}
                              className="text-xs h-7 px-2.5 border-[#E2DCD0] text-[#0B132B] hover:bg-[#FAF0D9]/50"
                            >
                              <Eye className="h-3 w-3 mr-1 text-[#8E6F24]" />
                              Ko&apos;rish
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Inspection Modal */}
      <Dialog open={!!inspectModalItem} onOpenChange={(open) => !open && setInspectModalItem(null)}>
        {inspectModalItem && (
          <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-[#0B132B]">
                Konsultatsiya Docketsi #{inspectModalItem.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 font-mono">
                {inspectModalItem.service_name} • {inspectModalItem.scheduled_at}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E2DCD0] space-y-1">
                <span className="text-slate-400 font-mono uppercase text-[10px]">Advokat</span>
                <p className="font-bold text-slate-900 text-sm">{inspectModalItem.specialist_name}</p>
                <p className="text-slate-500">{inspectModalItem.specialist_title || inspectModalItem.category}</p>
              </div>

              {(inspectModalItem.user_notes || inspectModalItem.description) && (
                <div className="p-3 rounded-xl bg-white border border-[#E2DCD0] space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Mijoz Murojaati</span>
                  <p className="text-slate-700 italic">
                    &ldquo;{inspectModalItem.user_notes || inspectModalItem.description}&rdquo;
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white border border-[#E2DCD0] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Yalpi to&apos;lov:</span>
                  <span className="font-bold">{formatPrice(inspectModalItem.price)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Platforma ulushi (15%):</span>
                  <span>+{formatPrice(Math.round(inspectModalItem.price * 0.15))}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Advokat hisobiga (85%):</span>
                  <span>{formatPrice(inspectModalItem.price - Math.round(inspectModalItem.price * 0.15))}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link href={`/consultations/${inspectModalItem.id}/chat`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs border-[#C59B27]/40 text-[#0B132B]">
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#0D47A1]" />
                    Chat xonasi
                  </Button>
                </Link>
                {inspectModalItem.format === "video" && (
                  <a
                    href={inspectModalItem.meeting_link || "https://meet.google.com/thm-legal-aid"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button size="sm" className="w-full text-xs bg-[#0D47A1] text-white">
                      <Video className="h-3.5 w-3.5 mr-1" />
                      Video xona
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#E2DCD0]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInspectModalItem(null)}
                className="border-[#E2DCD0] text-xs"
              >
                Yopish
              </Button>
              {inspectModalItem.status !== "completed" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleStatusOverride(inspectModalItem.id, "completed")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  Yakunlangan deb belgilash
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
