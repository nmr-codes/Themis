"use client";

import { useState } from "react";
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Download,
  Clock,
  RotateCcw,
  Eye,
  Building,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

interface AdminTransactionItem {
  id: string;
  date: string;
  client: string;
  specialist: string;
  service: string;
  total: number;
  fee: number; // 15% platform split
  net: number; // 85% specialist payout
  provider: "Payme" | "Click" | "Uzum Bank";
  fiscal_code: string;
  status: "completed" | "held" | "refunded";
  status_label: string;
}

const SEED_ADMIN_TRANSACTIONS: AdminTransactionItem[] = [
  {
    id: "tx-501",
    date: "28-oktabr, 2026",
    client: "Azizbek Nurmatov",
    specialist: "Azizbek Rahimov",
    service: "To'liq 45 daqiqalik onlayn konsultatsiya",
    total: 180000,
    fee: 27000,
    net: 153000,
    provider: "Payme",
    fiscal_code: "FISCAL-UZ-992019-PYM",
    status: "completed",
    status_label: "Advokatga o'tkazilgan",
  },
  {
    id: "tx-502",
    date: "24-oktabr, 2026",
    client: "Jasur Qosimov",
    specialist: "Azizbek Rahimov",
    service: "Tezkor 15 daqiqalik maslahat",
    total: 70000,
    fee: 10500,
    net: 59500,
    provider: "Click",
    fiscal_code: "FISCAL-UZ-881023-CLK",
    status: "completed",
    status_label: "Advokatga o'tkazilgan",
  },
  {
    id: "tx-503",
    date: "Bugun, 15:30",
    client: "Shahnoza Alimova",
    specialist: "Dilnoza Karimova",
    service: "Oila va aliment masalalari bo'yicha konsultatsiya",
    total: 250000,
    fee: 37500,
    net: 212500,
    provider: "Uzum Bank",
    fiscal_code: "FISCAL-UZ-441209-UZM",
    status: "held",
    status_label: "Eskrouda ushlab turilibdi",
  },
  {
    id: "tx-504",
    date: "18-oktabr, 2026",
    client: "Sirojiddin Olimov",
    specialist: "Rustam Mahmudov",
    service: "Ko'chmas mulk shartnomasini ekspertiza qilish",
    total: 120000,
    fee: 18000,
    net: 102000,
    provider: "Payme",
    fiscal_code: "FISCAL-UZ-110293-RFD",
    status: "refunded",
    status_label: "Mijozga to'liq qaytarilgan",
  },
];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>(SEED_ADMIN_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTx, setSelectedTx] = useState<AdminTransactionItem | null>(null);

  const filtered = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    if (activeTab === "held") return tx.status === "held";
    if (activeTab === "completed") return tx.status === "completed";
    if (activeTab === "refunded") return tx.status === "refunded";
    return true;
  });

  const totalGross = 49400000;
  const platformRevenue = 7410000;
  const specialistPayouts = 41990000;
  const heldEscrowAmount = 250000;

  const handleExportStatement = () => {
    toast.success("Davlat eskrou moliyaviy audit hisoboti (CSV / PDF) muvaffaqiyatli shakllantirildi!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Eskrou va Moliyaviy Komissiya Nazorati
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              Davlat Eskrou Hisob-kitobi
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            To&apos;lov shlyuzlari (Payme / Click / Uzum), 15% platforma vositachilik komissiyasi va kafolatlangan depozitlar nazorati
          </p>
        </div>

        <Button
          onClick={handleExportStatement}
          variant="outline"
          size="sm"
          className="gap-2 border-[#C59B27]/40 text-[#0B132B] hover:bg-[#FAF0D9]/50 shadow-xs self-start sm:self-auto"
        >
          <Download className="h-4 w-4 text-[#8E6F24]" />
          Audit hisobotini eksport qilish
        </Button>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Jami Aylanma (GMV)
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-[#0B132B]">
              {formatPrice(totalGross)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 font-mono">286 ta rasmiy operatsiya</p>
          </CardContent>
        </Card>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Themis Komissiyasi (15%)
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-emerald-700">
              {formatPrice(platformRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-700 font-medium font-mono">Sof platforma tushumi</p>
          </CardContent>
        </Card>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Advokatlarga To&apos;langan (85%)
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-[#0D47A1]">
              {formatPrice(specialistPayouts)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 font-mono">Bank rekvizitlariga o&apos;tkazildi</p>
          </CardContent>
        </Card>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500 font-mono">
              Eskrou Depozit Zaxirasi
            </CardDescription>
            <CardTitle className="font-serif text-2xl font-bold text-[#8E6F24]">
              {formatPrice(heldEscrowAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#8E6F24] font-medium font-mono">Jarayondagi dockets mablag&apos;i</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-4 max-w-lg">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Barchasi ({transactions.length})
          </TabsTrigger>
          <TabsTrigger
            value="held"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Depozitda ({transactions.filter((t) => t.status === "held").length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            O&apos;tkazilgan ({transactions.filter((t) => t.status === "completed").length})
          </TabsTrigger>
          <TabsTrigger
            value="refunded"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Qaytarilgan ({transactions.filter((t) => t.status === "refunded").length})
          </TabsTrigger>
        </TabsList>

        <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E2DCD0] bg-[#FAF8F5] text-slate-600 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">ID & Sana</th>
                    <th className="p-3.5">Mijoz</th>
                    <th className="p-3.5">Advokat</th>
                    <th className="p-3.5">Yalpi (100%)</th>
                    <th className="p-3.5">Platforma (15%)</th>
                    <th className="p-3.5">Advokatga (85%)</th>
                    <th className="p-3.5">Provayder</th>
                    <th className="p-3.5">Eskrou Holati</th>
                    <th className="p-3.5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD0] text-slate-800 bg-white">
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-3.5 font-mono whitespace-nowrap">
                        <span className="font-bold text-[#0B132B] block">#{tx.id}</span>
                        <span className="text-[10px] text-slate-500">{tx.date}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">{tx.client}</td>
                      <td className="p-3.5">{tx.specialist}</td>
                      <td className="p-3.5 font-mono font-medium">{formatPrice(tx.total)}</td>
                      <td className="p-3.5 font-mono text-rose-600">+{formatPrice(tx.fee)}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        {formatPrice(tx.net)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{tx.provider}</td>
                      <td className="p-3.5">
                        <Badge
                          className={`text-[10px] border-0 font-semibold ${
                            tx.status === "completed"
                              ? "bg-emerald-100 text-[#166534]"
                              : tx.status === "held"
                              ? "bg-blue-100 text-[#0D47A1]"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {tx.status_label}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          className="text-[11px] h-7 px-2 border-[#E2DCD0] text-[#0B132B] hover:bg-[#FAF0D9]/50"
                        >
                          <Eye className="h-3 w-3 mr-1 text-[#8E6F24]" />
                          Fiskal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      {/* Fiscal Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        {selectedTx && (
          <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-[#0B132B]">
                Fiskal Tranzaksiya #{selectedTx.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-600 font-mono">
                {selectedTx.fiscal_code}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-[#E2DCD0] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>To&apos;lov provayderi:</span>
                  <span className="font-bold text-[#0B132B]">{selectedTx.provider}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Operatsiya vaqti:</span>
                  <span>{selectedTx.date}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Eskrou holati:</span>
                  <span className="font-bold text-[#0D47A1]">{selectedTx.status_label}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2DCD0] space-y-1.5">
                <div className="flex justify-between">
                  <span>Yalpi to&apos;lov:</span>
                  <span className="font-bold">{formatPrice(selectedTx.total)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Themis 15% komissiyasi:</span>
                  <span>+{formatPrice(selectedTx.fee)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-100">
                  <span>Advokatga o&apos;tkazilgan (85%):</span>
                  <span>{formatPrice(selectedTx.net)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[11px] space-y-0.5">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#166534]" />
                  Bank Eskrou Kafolati:
                </p>
                <p>
                  Ushbu mablag&apos; O&apos;zbekiston Respublikasi Markaziy Banki litsenziyasiga ega to&apos;lov tizimi orqali himoyalangan.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTx(null)}
                className="border-[#E2DCD0] text-xs"
              >
                Yopish
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
