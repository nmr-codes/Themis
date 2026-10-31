"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Video,
  User,
  ExternalLink,
  ShieldCheck,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, getInitials } from "@/lib/utils";
import {
  getStoredConsultations,
  updateConsultationStatus,
  StoredConsultation,
} from "@/lib/consultation-storage";
import { toast } from "sonner";

export default function SpecialistRequestsPage() {
  const [consultations, setConsultations] = useState<StoredConsultation[]>([]);
  const [activeTab, setActiveTab] = useState("pending");

  const refreshData = () => {
    setConsultations(getStoredConsultations());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAccept = (id: string) => {
    updateConsultationStatus(id, "accepted");
    refreshData();
    toast.success("So'rov muvaffaqiyatli qabul qilindi! Konsultatsiya jadvalga kiritildi.");
  };

  const handleReject = (id: string) => {
    updateConsultationStatus(id, "cancelled");
    refreshData();
    toast.info("So'rov rad etildi va mijozga xabar berildi.");
  };

  const pendingRequests = consultations.filter((c) => c.status === "pending");
  const acceptedRequests = consultations.filter(
    (c) =>
      c.status === "accepted" ||
      c.status === "scheduled" ||
      c.status === "confirmed" ||
      c.status === "in_progress"
  );
  const historyRequests = consultations.filter(
    (c) => c.status === "completed" || c.status === "cancelled"
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
            Mijoz Konsultatsiya So&apos;rovlari
          </h1>
          <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
            Advokatlik Docketsi
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Fuqarolar tomonidan yuborilgan rasmiy buyurtmalarni ko&apos;rib chiqish, qabul qilish yoki rad etish
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-3 max-w-md">
          <TabsTrigger
            value="pending"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Kutilayotgan ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Qabul qilingan ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Tarix ({historyRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Requests */}
        <TabsContent value="pending" className="space-y-3">
          {pendingRequests.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-10 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-1" />
                <h3 className="font-serif text-base font-bold text-[#0B132B]">
                  Hozircha yangi so&apos;rovlar mavjud emas
                </h3>
                <p className="text-xs text-slate-500">
                  Mijozlar yangi konsultatsiyaga yozilganda, ular ushbu ro&apos;yxatda aks etadi.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((req) => {
              const platformFee = Math.round(req.price * 0.15);
              const netPayout = req.price - platformFee;

              return (
                <Card
                  key={req.id}
                  className="border border-[#E2DCD0] hover:border-[#C59B27]/60 transition-all bg-[#FDFBF7] shadow-xs"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#C59B27]/40">
                          <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-xs">
                            {getInitials(req.description?.split(" ")[0] || "Mijoz")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-[#0B132B] text-base">
                              {req.description?.split(" ")[0] || "Fuqaro Murojaati"}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              #{req.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">
                            {req.category} • Eskrou Kafolati
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 self-start sm:self-auto text-xs font-semibold">
                        Tasdiqlash kutilmoqda
                      </Badge>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#E2DCD0] text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <span className="font-semibold text-slate-900">{req.service_name}</span>
                        <span className="font-mono text-[#0D47A1] font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {req.scheduled_at} ({req.duration_minutes || 45} daq)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 block">Yalpi to&apos;lov:</span>
                          <span className="font-bold text-[#0B132B]">{formatPrice(req.price)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Themis komissiyasi (15%):</span>
                          <span className="text-rose-600 font-semibold">-{formatPrice(platformFee)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Advokatga sof tushum (85%):</span>
                          <span className="text-emerald-700 font-bold text-xs">+{formatPrice(netPayout)}</span>
                        </div>
                      </div>

                      {(req.user_notes || req.description) && (
                        <div className="pt-2 border-t border-slate-100 italic text-slate-600">
                          Murojaat izohi: &ldquo;{req.user_notes || req.description}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Rad etish
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Qabul qilish
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Tab 2: Accepted Requests */}
        <TabsContent value="accepted" className="space-y-3">
          {acceptedRequests.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                Hozircha qabul qilingan faol konsultatsiyalar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            acceptedRequests.map((req) => (
              <Card key={req.id} className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-base text-[#0B132B]">
                        {req.service_name}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-800 border-0 text-[10px]">
                        Tasdiqlangan
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-mono">
                      Vaqt: {req.scheduled_at} • Xizmat haqi: {formatPrice(req.price)}
                    </p>
                    {req.user_notes && (
                      <p className="text-xs text-slate-500 italic max-w-lg line-clamp-1">
                        &ldquo;{req.user_notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/consultations/${req.id}/chat`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-[#C59B27]/40 hover:bg-[#FAF0D9]/50 text-[#0B132B]"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-[#0D47A1]" />
                        Mijoz bilan Chat
                      </Button>
                    </Link>
                    {req.format === "video" && (
                      <a href={req.meeting_link || "https://meet.google.com/thm-legal-aid"} target="_blank" rel="noreferrer">
                        <Button size="sm" className="bg-[#0D47A1] text-white hover:bg-[#1565C0] text-xs">
                          <Video className="h-3.5 w-3.5 mr-1" />
                          Uchrashuv
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="space-y-3">
          {historyRequests.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                Tarixda yakunlangan yoki bekor qilingan buyurtmalar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            historyRequests.map((req) => (
              <Card key={req.id} className="border border-[#E2DCD0] bg-white opacity-85">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{req.service_name}</span>
                      <Badge
                        className={`text-[10px] border-0 ${
                          req.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {req.status_label || (req.status === "completed" ? "Yakunlangan" : "Rad etilgan")}
                      </Badge>
                    </div>
                    <p className="text-slate-500 mt-0.5 font-mono">
                      #{req.id} • {req.scheduled_at} • {formatPrice(req.price)}
                    </p>
                  </div>

                  <Link href={`/consultations/${req.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-[#0B132B]">
                      Dossier
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
