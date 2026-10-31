"use client";

import { useState } from "react";
import {
  Star,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Flag,
  MessageSquare,
  AlertTriangle,
  User,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";

interface AdminReviewItem {
  id: string;
  client: string;
  specialist: string;
  specialist_id: string;
  rating: number;
  comment: string;
  specialist_reply?: string;
  date: string;
  status: "active" | "flagged" | "removed";
}

const INITIAL_REVIEWS: AdminReviewItem[] = [
  {
    id: "rev-1",
    client: "Jasur Qosimov",
    specialist: "Azizbek Rahimov",
    specialist_id: "spec-1",
    rating: 5,
    comment: "Ish beruvchim bilan nizoni juda tez va qonuniy asosda tushuntirib berdilar. Rahmat!",
    specialist_reply: "Arzimaydi, fuqarolik va mehnat huquqlaringiz doimo qonun himoyasida bo'lsin!",
    date: "28-oktabr, 2026",
    status: "active",
  },
  {
    id: "rev-2",
    client: "Alisher Vohidov",
    specialist: "Dilnoza Karimova",
    specialist_id: "spec-2",
    rating: 5,
    comment: "Juda xushmuomala va o'z ishining yetuk mutaxassisi. Aliment va mulk masalasini xolisona tushuntirdilar.",
    specialist_reply: "Tashakkur! Oila kodeksiga muvofiq barcha talablar to'g'ri rasmiylashtirilgan.",
    date: "20-oktabr, 2026",
    status: "active",
  },
  {
    id: "rev-3",
    client: "Anonim Foydalanuvchi",
    specialist: "Rustam Mahmudov",
    specialist_id: "spec-3",
    rating: 2,
    comment: "Maslahat vaqti kechiktirildi va to'liq tushuntirilmadi deb hisoblayman.",
    specialist_reply: "Hurmatli mijoz, texnik aloqa nosozligi sababli qo'shimcha bepul 30 daqiqa konsultatsiya taqdim etilgan.",
    date: "12-oktabr, 2026",
    status: "flagged",
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState("all");

  const handleFlagReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "flagged" as const } : r))
    );
    toast.warning("Sharh tekshiruv uchun shubhali deb belgilandi");
  };

  const handleApproveReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "active" as const } : r))
    );
    toast.success("Sharh muvaffaqiyatli tasdiqlandi va reyestrga qaytarildi");
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success("Sharh muvaffaqiyatli moderatsiyadan o'chirildi");
  };

  const filtered = reviews.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "flagged") return r.status === "flagged";
    if (activeTab === "active") return r.status === "active";
    return true;
  });

  const activeCount = reviews.filter((r) => r.status === "active").length;
  const flaggedCount = reviews.filter((r) => r.status === "flagged").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Sharhlar va Reytinglar Moderatsiyasi
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Advokatlik Odob-axloq Nazorati
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real o&apos;tkazilgan konsultatsiyalar yakunidagi mijoz baholari, advokatlarning rasmiy javoblari va shikoyatlar nazorati
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-3 max-w-md">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Barchasi ({reviews.length})
          </TabsTrigger>
          <TabsTrigger
            value="flagged"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Shubhali / Tekshiruvda ({flaggedCount})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Tasdiqlangan ({activeCount})
          </TabsTrigger>
        </TabsList>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7]">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                Ushbu bo&apos;limda sharhlar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            filtered.map((rev) => (
              <Card
                key={rev.id}
                className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs hover:border-[#C59B27]/60 transition-all"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-semibold text-slate-900 text-sm">{rev.client}</span>
                      <span className="text-slate-400 text-xs">→</span>
                      <span className="font-serif font-bold text-[#0B132B] text-sm">
                        {rev.specialist}
                      </span>
                      <div className="flex text-[#C59B27] gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= rev.rating ? "text-[#C59B27] fill-[#C59B27]" : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 ml-1">{rev.date}</span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-serif italic bg-white p-3 rounded-xl border border-[#E2DCD0]">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Specialist Official Professional Reply Box */}
                    {rev.specialist_reply && (
                      <div className="p-3 rounded-xl bg-[#FAF0D9]/50 border-l-2 border-[#C59B27] text-xs">
                        <span className="font-semibold text-[#845D18] flex items-center gap-1.5 font-mono text-[11px]">
                          <MessageSquare className="h-3.5 w-3.5" /> Advokatning rasmiy javobi:
                        </span>
                        <p className="text-slate-700 italic mt-1">&ldquo;{rev.specialist_reply}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                    {rev.status === "flagged" ? (
                      <>
                        <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] font-semibold">
                          Shubhali
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveReview(rev.id)}
                          className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-8 px-2.5"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Tasdiqlash
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-emerald-100 text-[#166534] border-0 text-[10px] font-semibold">
                          Tasdiqlangan
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagReview(rev.id)}
                          className="text-xs text-[#845D18] border-amber-300 hover:bg-amber-50 h-8 px-2.5"
                        >
                          <Flag className="h-3.5 w-3.5 mr-1" />
                          Shubhali
                        </Button>
                      </>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(rev.id)}
                      title="Sharhni o'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
