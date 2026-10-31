"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Video,
  MessageSquare,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  Percent,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Service } from "@/lib/types";

const STORAGE_KEY_SERVICES = "themis_specialist_services";

const DEFAULT_SERVICES: Service[] = [
  {
    id: "serv-1",
    specialist_id: "spec-1",
    name: "Tezkor 15 daqiqalik maslahat",
    description: "Muammoni tezkor baholash, shoshilinch yuridik tavsiyalar va keyingi qadamlar bo'yicha ko'rsatma",
    duration_minutes: 15,
    price: 70000,
    currency: "UZS",
    format: "chat",
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "serv-2",
    specialist_id: "spec-1",
    name: "To'liq 45 daqiqalik onlayn konsultatsiya",
    description: "Hujjatlarni to'liq tahlil qilish, nizo strategiyasini tuzish va advokatlik tavsiyalari",
    duration_minutes: 45,
    price: 180000,
    currency: "UZS",
    format: "video",
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "serv-3",
    specialist_id: "spec-1",
    name: "Yozma huquqiy xulosa va shartnoma ekspertizasi",
    description: "Shartnoma, da'vo arizasi yoki sud aktlari bo'yicha rasmiy muhrlangan yozma ekspertiza xulosasi",
    duration_minutes: 60,
    price: 250000,
    currency: "UZS",
    format: "written" as any,
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
];

export default function SpecialistServicesPage() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);

  // Modal State (Create / Edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("100000");
  const [format, setFormat] = useState<"video" | "chat" | "written">("video");

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SERVICES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
          return;
        }
      }
    } catch (e) {}
    setServices(DEFAULT_SERVICES);
  }, []);

  const saveServices = (list: Service[]) => {
    setServices(list);
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(list));
    } catch (e) {}
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDuration("30");
    setPrice("120000");
    setFormat("video");
    setDialogOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingId(s.id);
    setName(s.name);
    setDescription(s.description || "");
    setDuration(s.duration_minutes.toString());
    setPrice(s.price.toString());
    setFormat((s.format as any) || "video");
    setDialogOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price) || 0;
    const parsedDuration = parseInt(duration) || 30;

    if (editingId) {
      // Edit existing
      const updated = services.map((s) =>
        s.id === editingId
          ? {
              ...s,
              name,
              description,
              duration_minutes: parsedDuration,
              price: parsedPrice,
              format: format as any,
              updated_at: new Date().toISOString(),
            }
          : s
      );
      saveServices(updated);
      toast.success("Xizmat tarifi muvaffaqiyatli tahrirlandi!");
    } else {
      // Create new
      const newService: Service = {
        id: "serv-" + Date.now(),
        specialist_id: "spec-1",
        name,
        description,
        duration_minutes: parsedDuration,
        price: parsedPrice,
        currency: "UZS",
        format: format as any,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveServices([...services, newService]);
      toast.success("Yangi xizmat tarifi muvaffaqiyatli qo'shildi!");
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    saveServices(updated);
    toast.success("Tarif o'chirildi");
  };

  const handleToggleActive = (id: string) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    );
    saveServices(updated);
    toast.info("Tarif holati o'zgartirildi");
  };

  // 15% Platform Commission Calculation for Modal Preview
  const numericPrice = parseFloat(price) || 0;
  const commissionAmount = Math.round(numericPrice * 0.15);
  const netAdvocatePayout = numericPrice - commissionAmount;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Xizmatlar va Tariflar
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              15% Platforma Komissiyasi
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Mijozlar buyurtma qilishi mumkin bo&apos;lgan konsultatsiya turlari, muddatlari va narx siyosati
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gap-2 bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] shadow-xs"
        >
          <Plus className="h-4 w-4 text-[#D4AF37]" /> Yangi tarif qo&apos;shish
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => {
          const itemFee = Math.round(s.price * 0.15);
          const itemNet = s.price - itemFee;

          return (
            <Card
              key={s.id}
              className={`border border-[#E2DCD0] flex flex-col justify-between bg-[#FDFBF7] shadow-xs transition-all ${
                !s.is_active ? "opacity-60 bg-slate-50" : "hover:border-[#C59B27]"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs gap-1 border-[#C59B27]/40 bg-[#FAF0D9]/50 text-[#8E6F24] font-medium">
                    {s.format === "video" ? (
                      <Video className="h-3 w-3 text-[#0D47A1]" />
                    ) : (s.format as string) === "written" ? (
                      <FileText className="h-3 w-3 text-purple-700" />
                    ) : (
                      <MessageSquare className="h-3 w-3 text-[#C59B27]" />
                    )}
                    {s.format === "video"
                      ? "Video uchrashuv"
                      : (s.format as string) === "written"
                      ? "Yozma xulosa"
                      : "Matnli chat"}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" /> {s.duration_minutes} daqiqa
                  </span>
                </div>
                <CardTitle className="font-serif text-base font-bold text-[#0B132B] mt-2">
                  {s.name}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {s.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* 15% Commission Breakdown Ledger Card */}
                <div className="p-3 rounded-xl bg-white border border-[#E2DCD0] text-[11px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Yalpi to&apos;lov (Mijoz to&apos;laydi):</span>
                    <span className="font-bold text-[#0B132B]">{formatPrice(s.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-rose-600">
                    <span>Platforma xizmat haqi (15%):</span>
                    <span>-{formatPrice(itemFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 pt-1 border-t border-slate-100 font-bold">
                    <span>Advokatga sof tushum (85%):</span>
                    <span className="text-xs">+{formatPrice(itemNet)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2DCD0]">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(s.id)}
                      className={`text-xs h-8 px-2 ${
                        s.is_active ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5 mr-1" />
                      {s.is_active ? "Faol" : "Nofaol"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-600 hover:text-[#0B132B] hover:bg-[#FAF0D9]/50"
                      onClick={() => openEditModal(s)}
                      title="Tarifni tahrirlash"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(s.id)}
                      title="Tarifni o'chirish"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Dialog with 15% Platform Commission Live Preview */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#0B132B]">
              {editingId ? "Tarifni Tahrirlash" : "Yangi Xizmat Tarifi Qo'shish"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Konsultatsiya nomi, davomiyligi, formati va narx parametrlarini belgilang
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B132B]">Xizmat nomi</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Uy-joy oldi-sotdi shartnomasini tekshirish"
                className="text-xs bg-white border-[#E2DCD0]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B132B]">Qisqa tavsif</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Xizmat doirasiga nimalar kiradi va mijoz qanday natija oladi?"
                className="text-xs bg-white border-[#E2DCD0] min-h-[70px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B132B]">Format</Label>
                <Select value={format} onValueChange={(val: any) => setFormat(val)}>
                  <SelectTrigger className="text-xs bg-white border-[#E2DCD0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video uchrashuv</SelectItem>
                    <SelectItem value="chat">Xavfsiz matnli chat</SelectItem>
                    <SelectItem value="written">Yozma huquqiy xulosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B132B]">Davomiyligi (daqiqa)</Label>
                <Input
                  type="number"
                  min="15"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="text-xs bg-white border-[#E2DCD0]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B132B]">Yalpi narx (UZS)</Label>
              <Input
                type="number"
                min="0"
                step="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                className="text-xs bg-white border-[#E2DCD0]"
                required
              />
            </div>

            {/* Live 15% Platform Commission Preview Box */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2DCD0] text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase text-[10px]">
                <Percent className="h-3.5 w-3.5 text-[#C59B27]" />
                Shaffof Moliya Tahlili (Themis 15%):
              </div>
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>Fuqaro to&apos;laydigan narx:</span>
                <span className="font-bold text-[#0B132B]">{formatPrice(numericPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-rose-600 text-[11px]">
                <span>Platforma komissiyasi (15%):</span>
                <span>-{formatPrice(commissionAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold text-xs pt-1 border-t border-slate-100">
                <span>Advokat hisobiga sof to&apos;lov (85%):</span>
                <span>+{formatPrice(netAdvocatePayout)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#E2DCD0] text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs"
              >
                {editingId ? "O'zgarishlarni saqlash" : "Tarifni yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
