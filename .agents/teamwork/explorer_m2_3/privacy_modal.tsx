"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Server, Cpu, ExternalLink } from "lucide-react";

interface PrivacyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PrivacyModal({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: PrivacyModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange || (() => {}) : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl bg-[#FAF7F0] border-[#E5E0D5] text-[#0D1B34] p-0 shadow-2xl flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b border-[#E5E0D5]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#166534]/15 border border-[#166534]/30 flex items-center justify-center text-[#166534]">
              <Shield className="h-4 w-4" />
            </div>
            <DialogTitle className="font-editorial-heading text-xl font-bold text-[#0D1B34]">
              Maxfiylik Siyosati
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-600">
            O&apos;zbekiston Respublikasining O&apos;RQ-547-son Qonuni va &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonun talablari
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 text-xs text-slate-700 leading-relaxed space-y-5">
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-[#FAF0D9]/70 border border-[#C5A059]/40 text-[#8E6F24] font-medium">
              Mazkur xulosa Themis platformasida shaxsga doir ma&apos;lumotlar va advokatlik siri daxlsizligi qat&apos;iy kafolatlanganligini bildiradi.
            </div>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#8E6F24]" />
                1. Advokatlik siri kafolati
              </h4>
              <p>
                O&apos;zbekiston Respublikasining &quot;Advokatura to&apos;g&apos;risida&quot;gi Qonuni 6 va 9-moddalariga asosan, foydalanuvchining advokat bilan barcha yozishmalari, taqdim etgan hujjatlari va audio/video qo&apos;ng&apos;iroqlari <strong>advokatlik siri</strong> hisoblanadi. Tergov yoki sud organlari ushbu ma&apos;lumotlarni advokatdan talab qilib olishga haqli emas.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34] flex items-center gap-2">
                <Server className="h-4 w-4 text-[#0D47A1]" />
                2. Serverlar O&apos;zbekistonda joylashuvi (O&apos;RQ-547)
              </h4>
              <p>
                &quot;Shaxsga doir ma&apos;lumotlar to&apos;g&apos;risida&quot;gi Qonunning 27-moddasiga muvofiq, O&apos;zbekiston fuqarolarining shaxsiy ma&apos;lumotlar bazasi faqat O&apos;zbekiston hududidagi sertifikatlangan ma&apos;lumotlar markazlarida saqlanadi va AES-256 hamda TLS 1.3 protokollari bilan shifrlanadi.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34] flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#166534]" />
                3. AI Tahlili — Modelni o&apos;qitmaslik kafolati
              </h4>
              <p>
                Sizning AI Maslahatchiga yo&apos;llagan huquqiy savollaringiz va matnlaringiz umumiy ochiq AI modellarini (OpenAI, Claude va b.) qayta o&apos;qitish uchun <strong>ASLO ISHLATILMAYDI</strong>. Har bir muloqot alohida izolyatsiyalangan shaxsiy sessiyada amalga oshiriladi.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34]">
                4. Foydalanuvchining unutilish huquqi
              </h4>
              <p>
                Siz istalgan payt o&apos;z shaxsiy hisobingizni, yozishmalar tarixini va kiritilgan ma&apos;lumotlarni to&apos;liq o&apos;chirib tashlash huquqiga egasiz.
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-[#E5E0D5] bg-[#F4EFE6] flex flex-row items-center justify-between sm:justify-between">
          <Link
            href="/privacy"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <span>To&apos;liq matn bilan alohida sahifada tanishish</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs px-4"
          >
            Tushundim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
