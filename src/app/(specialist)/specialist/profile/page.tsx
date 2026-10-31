"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Briefcase,
  FileCheck,
  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Clock,
  Shield,
  Award,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LEGAL_CATEGORIES, REGIONS } from "@/lib/constants";
import { toast } from "sonner";

const STORAGE_KEY_PROFILE = "themis_specialist_profile";

export default function SpecialistProfileEditPage() {
  const [fullName, setFullName] = useState("Azizbek Rahimov");
  const [phone, setPhone] = useState("+998 90 123 45 67");
  const [email, setEmail] = useState("azizbek.r@themis.uz");
  const [region, setRegion] = useState("tashkent_city");
  const [experienceYears, setExperienceYears] = useState("9");
  const [university, setUniversity] = useState("Toshkent Davlat Yuridik Universiteti (TDYU)");
  const [education, setEducation] = useState("Yurisprudensiya magistri");
  const [graduationYear, setGraduationYear] = useState("2015");
  const [bio, setBio] = useState(
    "Oliy toifali advokat. Mehnat nizolari, ishdan asossiz bo'shatish va oylik maosh masalalarida 9 yillik muvaffaqiyatli amaliyotga egaman."
  );

  const [categories, setCategories] = useState<string[]>(["labor", "civil"]);

  const [credentials, setCredentials] = useState([
    {
      id: "cred-1",
      title: "Advokatlik faoliyati bilan shug'ullanish litsenziyasi #ADV-1049",
      issuer: "O'zbekiston Respublikasi Adliya vazirligi",
      date: "2018-05-12",
      status: "verified",
    },
    {
      id: "cred-2",
      title: "Oliy ta'lim diplomi (Magistr) #TDYU-9941",
      issuer: "TDYU",
      date: "2015-06-30",
      status: "verified",
    },
  ]);

  // Upload Document Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docIssuer, setDocIssuer] = useState("");
  const [docDate, setDocDate] = useState("");

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (stored) {
        const p = JSON.parse(stored);
        if (p.fullName) setFullName(p.fullName);
        if (p.phone) setPhone(p.phone);
        if (p.email) setEmail(p.email);
        if (p.region) setRegion(p.region);
        if (p.experienceYears) setExperienceYears(p.experienceYears);
        if (p.university) setUniversity(p.university);
        if (p.education) setEducation(p.education);
        if (p.graduationYear) setGraduationYear(p.graduationYear);
        if (p.bio) setBio(p.bio);
        if (p.categories) setCategories(p.categories);
        if (p.credentials) setCredentials(p.credentials);
      }
    } catch (e) {}
  }, []);

  const toggleCategory = (catId: string) => {
    if (categories.includes(catId)) {
      setCategories(categories.filter((c) => c !== catId));
    } else {
      setCategories([...categories, catId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const profilePayload = {
      fullName,
      phone,
      email,
      region,
      experienceYears,
      university,
      education,
      graduationYear,
      bio,
      categories,
      credentials,
    };

    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profilePayload));
    } catch (e) {}

    toast.success("Mutaxassis profili va advokatlik dosyesi muvaffaqiyatli saqlandi!");
  };

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docIssuer) {
      toast.error("Iltimos, hujjat nomi va bergan organni kiriting");
      return;
    }

    const newCred = {
      id: "cred-" + Date.now(),
      title: docTitle,
      issuer: docIssuer,
      date: docDate || new Date().toISOString().split("T")[0],
      status: "pending", // Waiting for admin verification
    };

    const updated = [...credentials, newCred];
    setCredentials(updated);
    setDocModalOpen(false);
    setDocTitle("");
    setDocIssuer("");
    setDocDate("");

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILE);
      const base = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        STORAGE_KEY_PROFILE,
        JSON.stringify({ ...base, credentials: updated })
      );
    } catch (e) {}

    toast.success("Yangi hujjat yuklandi va Adliya tekshiruviga yuborildi!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DCD0] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#0B132B]">
              Advokatlik Dosyesi & Professional Profil
            </h1>
            <Badge variant="outline" className="text-xs font-mono border-[#C59B27]/50 text-[#8E6F24]">
              #ADV-3810
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Mijozlarga ko&apos;rinadigan biografiya, litsenziya va professional tajriba ma&apos;lumotlari
          </p>
        </div>

        <Link href="/specialists/spec-1" target="_blank">
          <Button
            variant="outline"
            size="sm"
            className="border-[#C59B27]/40 text-[#0B132B] hover:bg-[#FAF0D9]/50 text-xs gap-1.5 shadow-xs"
          >
            <Award className="h-3.5 w-3.5 text-[#8E6F24]" />
            Ommaviy profilni ko&apos;rish
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-[#FDFBF7] border border-[#E2DCD0] p-1 rounded-xl grid grid-cols-4 max-w-xl">
          <TabsTrigger
            value="personal"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Shaxsiy
          </TabsTrigger>
          <TabsTrigger
            value="education"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Ta&apos;lim & Soha
          </TabsTrigger>
          <TabsTrigger
            value="experience"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Ish Tajribasi
          </TabsTrigger>
          <TabsTrigger
            value="credentials"
            className="text-xs data-[state=active]:bg-[#0B132B] data-[state=active]:text-white font-semibold"
          >
            Hujjatlar ({credentials.length})
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave}>
          {/* Tab 1: Personal info */}
          <TabsContent value="personal">
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
              <CardHeader className="border-b border-[#E2DCD0] pb-4">
                <CardTitle className="font-serif text-lg font-bold text-[#0B132B]">
                  Asosiy Shaxsiy Ma&apos;lumotlar
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Advokatlik guvohnomasidagi rasmiy aloqa ma&apos;lumotlari va bio
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-[#0B132B]">
                      To&apos;liq ism-sharifingiz
                    </Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-xs bg-white border-[#E2DCD0]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-[#0B132B]">
                      Telefon raqami
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs bg-white border-[#E2DCD0]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-[#0B132B]">
                      Elektron pochta
                    </Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="text-xs bg-slate-100 border-[#E2DCD0] font-mono text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0B132B]">
                      Yurisdiksiya va Hudud
                    </Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="text-xs bg-white border-[#E2DCD0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => (
                          <SelectItem key={r.id} value={r.id} className="text-xs">
                            {r.name_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio" className="text-xs font-semibold text-[#0B132B]">
                    Advokatlik Biografiyasi (Mijozlar uchun ko&apos;rsatma)
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="text-xs bg-white border-[#E2DCD0] min-h-[90px]"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-[#E2DCD0] flex justify-end">
                  <Button type="submit" className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs gap-1.5">
                    <Save className="h-4 w-4 text-[#D4AF37]" /> Ma&apos;lumotlarni saqlash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Education & Categories */}
          <TabsContent value="education">
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
              <CardHeader className="border-b border-[#E2DCD0] pb-4">
                <CardTitle className="font-serif text-lg font-bold text-[#0B132B]">
                  Ta&apos;lim va Mutaxassislik Sohalari
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Oliy yuridik ma&apos;lumotingiz va ixtisoslashgan huquq sohalaringiz
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0B132B]">
                      Oliy ta&apos;lim muassasasi
                    </Label>
                    <Input
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="text-xs bg-white border-[#E2DCD0]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0B132B]">
                      Daraja va Yo&apos;nalish
                    </Label>
                    <Input
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="text-xs bg-white border-[#E2DCD0]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#0B132B]">
                    Amaliyot yuritadigan huquq sohalaringiz:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LEGAL_CATEGORIES.map((cat) => {
                      const isSelected = categories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                            isSelected
                              ? "bg-[#0B132B] text-white border-[#0B132B] shadow-2xs"
                              : "bg-white text-slate-700 border-[#E2DCD0] hover:border-[#C59B27]"
                          }`}
                        >
                          <span className="block truncate">{cat.name_uz}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DCD0] flex justify-end">
                  <Button type="submit" className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs gap-1.5">
                    <Save className="h-4 w-4 text-[#D4AF37]" /> Sohalarni saqlash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Experience */}
          <TabsContent value="experience">
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
              <CardHeader className="border-b border-[#E2DCD0] pb-4">
                <CardTitle className="font-serif text-lg font-bold text-[#0B132B]">
                  Yuridik Ish Staji
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Advokatlik faoliyati va yuridik amaliyot yillari
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0B132B]">
                      Umumiy advokatlik tajribasi (yil)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="text-xs bg-white border-[#E2DCD0]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#0B132B]">
                      Bitirgan yilingiz
                    </Label>
                    <Input
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="text-xs bg-white border-[#E2DCD0]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DCD0] flex justify-end">
                  <Button type="submit" className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs gap-1.5">
                    <Save className="h-4 w-4 text-[#D4AF37]" /> Tajribani saqlash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Credentials */}
          <TabsContent value="credentials">
            <Card className="border border-[#E2DCD0] bg-[#FDFBF7] shadow-xs">
              <CardHeader className="border-b border-[#E2DCD0] pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg font-bold text-[#0B132B]">
                    Malaka va Litsenziya Hujjatlari
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Adliya vazirligi nazorati va tekshiruviga yuborilgan rasmiy hujjatlar
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDocModalOpen(true)}
                  className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5 text-[#D4AF37]" /> Yangi hujjat qo&apos;shish
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="p-4 rounded-xl border border-[#E2DCD0] bg-white flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 text-[#166534] border border-emerald-200 rounded-lg shrink-0 mt-0.5">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{cred.title}</p>
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                          {cred.issuer} • {cred.date}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-[10px] font-semibold border-0 ${
                        cred.status === "verified"
                          ? "bg-emerald-100 text-[#166534]"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {cred.status === "verified" ? "Tasdiqlangan ✓" : "Tekshiruvda"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>

      {/* Upload Document Modal */}
      <Dialog open={docModalOpen} onOpenChange={setDocModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#FAF8F5] border border-[#E2DCD0]">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-[#0B132B]">
              Malaka Hujjatini Yuklash
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Advokatlik litsenziyasi, oliy ta&apos;lim diplomi yoki sertifikat ma&apos;lumotlarini kiriting
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCredential} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B132B]">Hujjat nomi</Label>
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Masalan: Advokatlik litsenziyasi #ADV-8890"
                className="text-xs bg-white border-[#E2DCD0]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B132B]">Bergan tashkilot</Label>
              <Input
                value={docIssuer}
                onChange={(e) => setDocIssuer(e.target.value)}
                placeholder="Masalan: O'zbekiston Respublikasi Adliya vazirligi"
                className="text-xs bg-white border-[#E2DCD0]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B132B]">Berilgan sana</Label>
              <Input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="text-xs bg-white border-[#E2DCD0]"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDocModalOpen(false)}
                className="border-[#E2DCD0] text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="bg-[#0B132B] hover:bg-[#152A4F] text-[#FAF8F5] text-xs"
              >
                Hujjatni yuborish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
