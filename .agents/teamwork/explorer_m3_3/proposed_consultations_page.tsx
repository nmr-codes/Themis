"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  Video,
  Phone,
  Star,
  ChevronRight,
  Shield,
  FileText,
  User,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, getInitials } from "@/lib/utils";
import {
  getStoredConsultations,
  SEED_CONSULTATIONS,
  StoredConsultation,
} from "@/lib/consultation-storage";

export default function ConsultationsListPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [consultations, setConsultations] = useState<StoredConsultation[]>(SEED_CONSULTATIONS);
  const [isClient, setIsClient] = useState(false);

  // Hydration-safe reading of localStorage
  useEffect(() => {
    setIsClient(true);
    setConsultations(getStoredConsultations());
  }, []);

  const activeConsultations = consultations.filter(
    (c) =>
      c.status === "scheduled" ||
      c.status === "pending" ||
      c.status === "in_progress" ||
      c.status === "confirmed"
  );

  const completedConsultations = consultations.filter(
    (c) => c.status === "completed" || c.status === "cancelled"
  );

  const getFormatBadge = (format: string) => {
    switch (format) {
      case "video":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <Video className="h-3 w-3" /> Video uchrashuv
          </span>
        );
      case "chat":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <MessageSquare className="h-3 w-3" /> Xavfsiz chat
          </span>
        );
      case "call":
      case "audio":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Phone className="h-3 w-3" /> Audio qo&apos;ng&apos;iroq
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
            Konsultatsiya
          </span>
        );
    }
  };

  const getStatusBadge = (status: string, label?: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 text-[11px] font-medium">
            {label || "Kutilmoqda"}
          </Badge>
        );
      case "scheduled":
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 text-[11px] font-medium">
            {label || "Rejalashtirilgan"}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-[11px] font-medium">
            {label || "Yakunlangan"}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-0 text-[11px] font-medium">
            {label || "Bekor qilingan"}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border-0 text-[11px] font-medium">
            {label || status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D5] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Mening Konsultatsiyalarim
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C5A059]/40 text-[#8E6F24]">
              Davlat Reyestri
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Yuristlar bilan belgilangan va o&apos;tkazilgan barcha rasmiy huquqiy uchrashuvlar daftari
          </p>
        </div>

        <Link href="/specialists">
          <Button className="bg-[#0B132B] hover:bg-[#1A2849] text-[#FAF8F5] text-xs gap-1.5 shadow-sm">
            <PlusCircle className="h-3.5 w-3.5 text-[#D4AF37]" />
            Yangi Advokat Tanlash
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-[#FAF8F5] border border-[#C5A059]/40 p-1 rounded-xl grid grid-cols-2 max-w-xs">
          <TabsTrigger
            value="active"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Faol ({activeConsultations.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Yakunlangan ({completedConsultations.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Consultations Tab */}
        <TabsContent value="active" className="space-y-3">
          {activeConsultations.length === 0 ? (
            <Card className="border border-[#C5A059]/30 bg-[#FAF8F5]">
              <CardContent className="p-10 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-[#FAF0D9] flex items-center justify-center text-[#B88E32]">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0B132B]">
                  Hozircha faol konsultatsiyalar mavjud emas
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Advokatlar reyestridan kerakli soha mutaxassisini tanlang va onlayn uchrashuvga yoziling.
                </p>
                <Link href="/specialists" className="inline-block pt-2">
                  <Button size="sm" className="bg-[#0B132B] text-white text-xs">
                    Advokatlar Ro&apos;yxatiga O&apos;tish
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            activeConsultations.map((c) => (
              <Card
                key={c.id}
                className="border border-[#E5E0D5] hover:border-[#C5A059]/60 transition-all bg-white shadow-sm"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-[#C5A059]/40 shrink-0">
                      <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-sm">
                        {getInitials(c.specialist_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-base text-[#0B132B]">
                          {c.specialist_name}
                        </h3>
                        {getStatusBadge(c.status, c.status_label)}
                        {getFormatBadge(c.format)}
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {c.service_name} • {c.specialist_title || c.specialist_role || c.category}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 text-[#0D47A1] font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          {c.scheduled_at}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#0B132B]">
                          {formatPrice(c.price)}
                        </span>
                        {c.duration_minutes && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {c.duration_minutes} daqiqa
                            </span>
                          </>
                        )}
                      </div>

                      {(c.user_notes || c.description) && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1 pt-1 max-w-md">
                          Murojaat: &ldquo;{c.user_notes || c.description}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-0 border-[#E5E0D5]">
                    <Link href={`/consultations/${c.id}/chat`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs border-[#C5A059]/40 hover:bg-[#FAF8F5]">
                        <MessageSquare className="h-3.5 w-3.5 text-[#0D47A1]" />
                        Chat
                      </Button>
                    </Link>
                    <Link href={`/consultations/${c.id}`}>
                      <Button size="sm" className="gap-1 text-xs bg-[#0B132B] hover:bg-[#1A2849] text-white">
                        Batafsil
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Consultations Tab */}
        <TabsContent value="completed" className="space-y-3">
          {completedConsultations.length === 0 ? (
            <Card className="border border-[#C5A059]/30 bg-[#FAF8F5]">
              <CardContent className="p-8 text-center text-xs text-muted-foreground">
                Hozircha yakunlangan konsultatsiyalar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            completedConsultations.map((c) => (
              <Card key={c.id} className="border border-[#E5E0D5] bg-white">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border shrink-0">
                      <AvatarFallback className="bg-slate-100 text-slate-700 font-serif font-bold text-sm">
                        {getInitials(c.specialist_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif font-bold text-base text-[#0B132B]">
                          {c.specialist_name}
                        </h3>
                        {getStatusBadge(c.status, c.status_label)}
                        {getFormatBadge(c.format)}
                      </div>

                      <p className="text-xs text-slate-600">{c.service_name}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500">
                        <span>{c.scheduled_at}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-800">{formatPrice(c.price)}</span>
                        {c.has_review && (
                          <>
                            <span>•</span>
                            <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {c.user_rating || 5} yulduz baho berildi
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/consultations/${c.id}`}>
                      <Button variant="outline" size="sm" className="text-xs border-[#C5A059]/40 hover:bg-[#FAF8F5]">
                        Xulosa va Baho
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
