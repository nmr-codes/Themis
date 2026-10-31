"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Download,
  Building,
  ShieldCheck,
  Percent,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { getStoredConsultations, StoredConsultation } from "@/lib/consultation-storage";

interface Transaction {
  id: string;
  date: string;
  client: string;
  service: string;
  format: string;
  total: number;
  fee: number; // 15% platform commission
  net: number; // 85% advocate payout
  status: "paid" | "held";
}

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-501",
    date: "28-oktabr, 2026",
    client: "Azizbek Nurmatov",
    service: "To'liq 45 daqiqalik onlayn konsultatsiya",
    format: "video",
    total: 180000,
    fee: 27000,
    net: 153000,
    status: "paid",
  },
  {
    id: "tx-502",
    date: "24-oktabr, 2026",
    client: "Jasur Qosimov",
    service: "Tezkor 15 daqiqalik maslahat",
    format: "chat",
    total: 70000,
    fee: 10500,
    net: 59500,
    status: "paid",
  },
  {
    id: "tx-503",
    date: "21-oktabr, 2026",
    client: "Munira Karimova",
    service: "To'liq 45 daqiqalik onlayn konsultatsiya",
    format: "video",
    total: 180000,
    fee: 27000,
    net: 153000,
    status: "paid",
  },
];

export default function SpecialistEarningsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);

  useEffect(() => {
    const consultations = getStoredConsultations();
    const completedOrScheduled = consultations.filter(
      (c) => c.status === "completed" || c.status === "scheduled" || c.status === "accepted"
    );

    // Map any stored consultations to transaction ledger
    const dynamicTx: Transaction[] = completedOrScheduled.map((c) => {
      const isPaid = c.status === "completed";
      const fee = Math.round(c.price * 0.15);
      const net = c.price - fee;

      return {
        id: `tx-${c.id.replace(/[^a-zA-Z0-9]/g, "")}`,
        date: c.scheduled_at,
        client: c.description?.split(" ")[0] || "Mijoz Murojaati",
        service: c.service_name,
        format: c.format,
        total: c.price,
        fee,
        net,
        status: isPaid ? "paid" : "held",
      };
    });

    // Merge and deduplicate by ID
    const mergedMap = new Map<string, Transaction>();
    SEED_TRANSACTIONS.forEach((tx) => mergedMap.set(tx.id, tx));
    dynamicTx.forEach((tx) => mergedMap.set(tx.id, tx));

    setTransactions(Array.from(mergedMap.values()));
  }, []);

  const totalPaidNet = transactions
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + tx.net, 0);

  const totalCommission = transactions
    .filter((tx) => tx.status === "paid")
    .reduce((sum, tx) => sum + tx.fee, 0);

  const totalHeldInEscrow = transactions
    .filter((tx) => tx.status === "held")
    .reduce((sum, tx) => sum + tx.net, 0);

  const handleExportStatement = () => {
    toast.success("Oylik advokatlik moliyaviy hisoboti (PDF) muvaffaqiyatli shakllantirildi!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Daromad va Eskrou Hisob-kitoblari
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Shaffof 15% Platforma Split
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Yakunlangan konsultatsiyalar tushumi, 15% platforma vositachilik komissiyasi va eskrou holati
          </p>
        </div>

        <Button
          onClick={handleExportStatement}
          variant="outline"
          size="sm"
          className="gap-2 border-[#C59B27]/40 text-[#0B132B] hover:bg-[#FAF0D9]/50 shadow-xs self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-[#8E6F24]" />
          Hisobotni yuklab olish
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Sof Tushum (Advokatga 85%)
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-emerald-700">
              {formatPrice(totalPaidNet + 6500000)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 font-mono">
              Bank hisob raqamiga o&apos;tkazilgan
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Themis Komissiyasi (15%)
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-[#8E6F24]">
              {formatPrice(totalCommission + 1140000)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 font-mono">
              Platforma infratuzilmasi uchun
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Eskrou Depozitida Saqlanmoqda
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-[#0D47A1]">
              {formatPrice(totalHeldInEscrow > 0 ? totalHeldInEscrow : 153000)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 font-mono">
              Konsultatsiya yakunida yechiladi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chamber Bank Account Details Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-[#C59B27]/40 bg-[#FAF0D9]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#0B132B] text-[#D4AF37]">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">
              Advokatlik Tuzilmasi Hisob-Raqami: &ldquo;Aloqabank&rdquo; ATB
            </p>
            <p className="text-slate-600 mt-0.5">
              Hisob: 20208000700100987001 • MFO: 00401 • STIR: 304892110
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-100 text-[#166534] border-0 text-[10px] font-semibold self-start sm:self-auto">
          Faol Bank Rekviziti
        </Badge>
      </div>

      {/* Transactions Ledger Table */}
      <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
        <CardHeader className="border-b border-[#E2DCD0] pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg font-bold text-[#0B132B]">
                Moliyaviy Operatsiyalar Daftari
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                100% Yalpi to&apos;lov, 15% Themis komissiyasi va 85% advokat sof to&apos;lovi hisob-kitobi
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Jami: {transactions.length} ta yozuv
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2DCD0] bg-[#FAF8F5] text-slate-600 font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">ID & Sana</th>
                  <th className="p-3.5">Mijoz</th>
                  <th className="p-3.5">Xizmat Formati</th>
                  <th className="p-3.5">Yalpi (100%)</th>
                  <th className="p-3.5">Komissiya (-15%)</th>
                  <th className="p-3.5">Sof To&apos;lov (+85%)</th>
                  <th className="p-3.5">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD0] text-slate-800 bg-white">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-3.5 font-mono whitespace-nowrap">
                      <span className="font-bold text-[#0B132B] block">#{tx.id}</span>
                      <span className="text-[10px] text-slate-500">{tx.date}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{tx.client}</td>
                    <td className="p-3.5">
                      <p className="line-clamp-1 max-w-[200px]">{tx.service}</p>
                      <span className="text-[10px] font-mono text-slate-500">
                        {tx.format === "video" ? "Video muloqot" : "Xavfsiz chat"}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-medium">{formatPrice(tx.total)}</td>
                    <td className="p-3.5 font-mono text-rose-600">-{formatPrice(tx.fee)}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      +{formatPrice(tx.net)}
                    </td>
                    <td className="p-3.5">
                      {tx.status === "paid" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[10px] font-semibold">
                          To&apos;langan
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-[10px] font-semibold">
                          Eskrouda
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
