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
import { FileText, AlertCircle, ShieldCheck, Percent, ExternalLink } from "lucide-react";

interface TermsModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TermsModal({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TermsModalProps) {
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
            <div className="w-8 h-8 rounded-lg bg-[#8E6F24]/15 border border-[#8E6F24]/30 flex items-center justify-center text-[#8E6F24]">
              <FileText className="h-4 w-4" />
            </div>
            <DialogTitle className="font-editorial-heading text-xl font-bold text-[#0D1B34]">
              Foydalanish Shartlari
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-600">
            Themis (Huquqiy Yordam) platformasining ommaviy oferta qoidalari
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 text-xs text-slate-700 leading-relaxed space-y-5">
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-[#FAF0D9]/70 border border-[#C5A059]/40 text-[#8E6F24] font-medium">
              Platforma xizmatlaridan foydalanish orqali siz mazkur rasmiy shartlarga to&apos;liq rozilik bildirasiz.
            </div>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#B84A2A]" />
                1. AI Tahlilining dastlabki xususiyati
              </h4>
              <p>
                Sun&apos;iy intellekt (AI Maslahatchi) tahlili faqat <strong>birlamchi axborot-yo&apos;naltiruvchi</strong> ma&apos;lumot xarakteriga ega. U advokatning rasmiy xulosasi, sud vakilligi yoki qonuniy kafolat hisoblanmaydi. Sudga da&apos;vo kiritish yoki bitim tuzishda litsenziyalangan advokat bilan shartnoma tuzilishi shart.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#166534]" />
                2. Advokatlar litsenziyasi va reyestri
              </h4>
              <p>
                Platformada ro&apos;yxatdan o&apos;tgan advokatlar O&apos;zbekiston Respublikasi Adliya vazirligi litsenziyasiga va Advokatlar Palatasi a&apos;zoligiga ega bo&apos;lib, ularning litsenziya raqamlari davlat reyestri orqali tekshirilgan.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34] flex items-center gap-2">
                <Percent className="h-4 w-4 text-[#0D47A1]" />
                3. 15% Platforma komissiyasi va Xavfsiz Eskrou
              </h4>
              <p>
                Pullik konsultatsiyalar summasi xavfsiz eskrou depozitida saqlanadi va konsultatsiya to&apos;liq o&apos;tkazilgach, 15% platforma xizmat komissiyasi ushlangan holda 85% advokat hisobiga o&apos;tkaziladi. O&apos;tkazilmagan konsultatsiyalar to&apos;lovi 100% qaytariladi.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="font-editorial-heading text-sm font-bold text-[#0D1B34]">
                4. Nizolarni hal etish
              </h4>
              <p>
                Barcha kelishmovchiliklar O&apos;zbekiston Respublikasi qonun hujjatlariga muvofiq Toshkent shahri sudlarida ko&apos;rib chiqiladi.
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-[#E5E0D5] bg-[#F4EFE6] flex flex-row items-center justify-between sm:justify-between">
          <Link
            href="/terms"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <span>To&apos;liq ommaviy ofertani o&apos;qish</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs px-4"
          >
            Qabul qilaman
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
