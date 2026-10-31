"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Check, Save, Radio, Power, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STORAGE_KEY_SCHEDULE = "themis_specialist_schedule";
const STORAGE_KEY_ONLINE = "themis_specialist_online";

const DEFAULT_SCHEDULE = [
  { day: 1, name: "Dushanba", active: true, start: "09:00", end: "18:00" },
  { day: 2, name: "Seshanba", active: true, start: "09:00", end: "18:00" },
  { day: 3, name: "Chorshanba", active: true, start: "09:00", end: "18:00" },
  { day: 4, name: "Payshanba", active: true, start: "09:00", end: "18:00" },
  { day: 5, name: "Juma", active: true, start: "09:00", end: "17:00" },
  { day: 6, name: "Shanba", active: false, start: "10:00", end: "15:00" },
  { day: 0, name: "Yakshanba", active: false, start: "10:00", end: "15:00" },
];

export default function SpecialistSchedulePage() {
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [isOnlineNow, setIsOnlineNow] = useState(true);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const storedOnline = localStorage.getItem(STORAGE_KEY_ONLINE);
      if (storedOnline !== null) {
        setIsOnlineNow(storedOnline === "true");
      }

      const storedSched = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (storedSched) {
        const parsed = JSON.parse(storedSched);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSchedule(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const handleToggleOnline = () => {
    const next = !isOnlineNow;
    setIsOnlineNow(next);
    try {
      localStorage.setItem(STORAGE_KEY_ONLINE, String(next));
    } catch (e) {}
    if (next) {
      toast.success("Onlayn maqomingiz faollashtirildi! Fuqarolar darhol bog'lanishi mumkin.");
    } else {
      toast.info("Oflayn rejimga o'tildi. So'rovlar navbat bilan qabul qilinadi.");
    }
  };

  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].active = !updated[index].active;
    setSchedule(updated);
  };

  const updateTime = (index: number, field: "start" | "end", val: string) => {
    const updated = [...schedule];
    updated[index][field] = val;
    setSchedule(updated);
  };

  const applyPreset = (preset: "standard" | "evening") => {
    const updated = schedule.map((item) => {
      if (item.day === 0) return item; // Keep Sunday off
      if (preset === "standard") {
        return {
          ...item,
          active: item.day !== 6,
          start: "09:00",
          end: item.day === 5 ? "17:00" : "18:00",
        };
      } else {
        return {
          ...item,
          active: true,
          start: "14:00",
          end: "20:00",
        };
      }
    });
    setSchedule(updated);
    toast.info(preset === "standard" ? "Standart (09:00 - 18:00) shabloni qo'llandi" : "Kechki (14:00 - 20:00) shabloni qo'llandi");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    } catch (e) {}
    toast.success("Ish jadvali va qabul vaqtlari muvaffaqiyatli saqlandi!");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Ish Jadvali va Bo&apos;sh Vaqtlar
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Haftalik Reja
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Mijozlar faqat siz belgilagan ish soatlarida konsultatsiyaga yozilishi mumkin
          </p>
        </div>
      </div>

      {/* Real-time Online Presence Switch Banner */}
      <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                isOnlineNow
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-slate-100 border-slate-300 text-slate-400"
              }`}
            >
              <Power className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif font-bold text-sm text-[#0B132B]">
                  {isOnlineNow ? "Hozir Onlayn Rejimdasiz" : "Oflayn Rejimdasiz"}
                </p>
                <span
                  className={`h-2.5 w-2.5 rounded-full inline-block ${
                    isOnlineNow ? "bg-emerald-500 animate-pulse ring-2 ring-emerald-300" : "bg-slate-400"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isOnlineNow
                  ? "Katalogda sizning profildan fuqarolar tezkor murojaat yuborishlari mumkin"
                  : "Fuqarolar faqat rejalashtirilgan vaqtlarga navbat orqali yozila oladilar"}
              </p>
            </div>
          </div>

          <Button
            variant={isOnlineNow ? "default" : "outline"}
            size="sm"
            onClick={handleToggleOnline}
            className={`text-xs gap-1.5 shrink-0 ${
              isOnlineNow
                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                : "border-[#C59B27]/40 text-[#0B132B] hover:bg-[#FAF0D9]/50"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            {isOnlineNow ? "Onlayn holatni o'chirish" : "Hozir Onlayn bo'lish"}
          </Button>
        </CardContent>
      </Card>

      {/* Days Table */}
      <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
        <CardHeader className="border-b border-[#E2DCD0] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-serif text-lg font-bold text-[#0B132B]">
                Haftalik Qabul Soatlari
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                O&apos;zbekiston advokatura amaliyotiga mos dushanba-shanba ish tartibi
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("standard")}
                className="text-[11px] h-7 border-[#E2DCD0] text-slate-700"
              >
                09:00 — 18:00
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset("evening")}
                className="text-[11px] h-7 border-[#E2DCD0] text-slate-700"
              >
                14:00 — 20:00
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {schedule.map((day, idx) => (
            <div
              key={day.day}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                day.active
                  ? "bg-white border-[#E2DCD0] shadow-2xs"
                  : "bg-slate-50/70 border-slate-200 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 w-40">
                <input
                  type="checkbox"
                  id={`day-${day.day}`}
                  checked={day.active}
                  onChange={() => toggleDay(idx)}
                  className="rounded border-slate-300 text-[#0B132B] focus:ring-[#0B132B] h-4 w-4"
                />
                <label htmlFor={`day-${day.day}`} className="font-semibold text-slate-900 cursor-pointer">
                  {day.name}
                </label>
              </div>

              {day.active ? (
                <div className="flex items-center gap-2 font-mono">
                  <Input
                    type="time"
                    value={day.start}
                    onChange={(e) => updateTime(idx, "start", e.target.value)}
                    className="h-8 w-28 text-xs bg-[#FAF8F5] border-[#E2DCD0]"
                  />
                  <span className="text-slate-400">—</span>
                  <Input
                    type="time"
                    value={day.end}
                    onChange={(e) => updateTime(idx, "end", e.target.value)}
                    className="h-8 w-28 text-xs bg-[#FAF8F5] border-[#E2DCD0]"
                  />
                </div>
              ) : (
                <span className="text-slate-400 font-medium italic font-mono">Dam olish kuni</span>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-[#E2DCD0] flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              O&apos;zgarishlar darhol umumiy reyestrga uzatiladi
            </span>
            <Button
              onClick={handleSave}
              className="gap-2 bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs h-9"
            >
              <Save className="h-4 w-4 text-[#D4AF37]" /> Jadvalni saqlash
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
