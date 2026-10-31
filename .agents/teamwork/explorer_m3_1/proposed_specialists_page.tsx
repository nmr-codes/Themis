"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  Shield,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Gavel,
  CheckCircle2,
  X,
  BookOpen,
  Award,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  Home,
  Building2,
  TrendingUp,
  Key,
  FileText,
  Calculator,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Video,
  MessageSquare,
  Landmark,
  Check,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LEGAL_CATEGORIES, REGIONS } from "@/lib/constants";
import { MOCK_SPECIALISTS } from "@/lib/mock-data";
import { formatPrice, getInitials } from "@/lib/utils";
import { Specialist } from "@/lib/types";

// ============================================================================
// Legal Branch Distinct Icon Mapping
// ============================================================================
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  labor: Briefcase,
  family: Heart,
  civil: Users,
  housing: Home,
  criminal: Shield,
  administrative: Building2,
  business: TrendingUp,
  property: Key,
  contract: FileText,
  tax: Calculator,
};

// ============================================================================
// Helper: Extract Official Advocate License Registry Number (#ADV-xxxx)
// ============================================================================
function getAdvocateLicenseNumber(spec: { id: string; admin_notes?: string | null }): string {
  const match = spec.admin_notes?.match(/#ADV-\d+/);
  if (match) return match[0];
  if (spec.id === "spec-1") return "#ADV-3810";
  if (spec.id === "spec-2") return "#ADV-4192";
  if (spec.id === "spec-3") return "#ADV-4921";
  return `#ADV-${Math.abs(spec.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 1000) % 9000 + 1000)}`;
}

// ============================================================================
// Specialists Catalog Content Component
// ============================================================================
function SpecialistsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL query parameter synchronization
  const categoryParam = searchParams.get("category");
  const regionParam = searchParams.get("region");
  const searchParam = searchParams.get("search");
  const onlineParam = searchParams.get("online");
  const ratingParam = searchParams.get("rating");

  // Filter states
  const [search, setSearch] = useState<string>(searchParam || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [selectedRegion, setSelectedRegion] = useState<string>(regionParam || "all");
  const [onlyOnline, setOnlyOnline] = useState<boolean>(onlineParam === "true");
  const [minRating, setMinRating] = useState<string>(ratingParam || "all");
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "consultations">("rating");

  // Keep state in sync with URL search params changes (e.g., incoming links from landing page or browser back/forward)
  useEffect(() => {
    if (categoryParam !== null && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (regionParam !== null && regionParam !== selectedRegion) {
      setSelectedRegion(regionParam);
    }
  }, [regionParam]);

  useEffect(() => {
    if (searchParam !== null && searchParam !== search) {
      setSearch(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    const isOnlineBool = onlineParam === "true";
    if (onlineParam !== null && isOnlineBool !== onlyOnline) {
      setOnlyOnline(isOnlineBool);
    }
  }, [onlineParam]);

  useEffect(() => {
    if (ratingParam !== null && ratingParam !== minRating) {
      setMinRating(ratingParam);
    }
  }, [ratingParam]);

  // Synchronize state back into URL query params (without full page reloads)
  const syncUrlParams = useCallback(
    (newParams: {
      category?: string;
      region?: string;
      search?: string;
      online?: boolean;
      rating?: string;
    }) => {
      const current = new URLSearchParams(searchParams.toString());

      const nextCategory = newParams.category !== undefined ? newParams.category : selectedCategory;
      const nextRegion = newParams.region !== undefined ? newParams.region : selectedRegion;
      const nextSearch = newParams.search !== undefined ? newParams.search : search;
      const nextOnline = newParams.online !== undefined ? newParams.online : onlyOnline;
      const nextRating = newParams.rating !== undefined ? newParams.rating : minRating;

      if (nextCategory && nextCategory !== "all") {
        current.set("category", nextCategory);
      } else {
        current.delete("category");
      }

      if (nextRegion && nextRegion !== "all") {
        current.set("region", nextRegion);
      } else {
        current.delete("region");
      }

      if (nextSearch.trim()) {
        current.set("search", nextSearch.trim());
      } else {
        current.delete("search");
      }

      if (nextOnline) {
        current.set("online", "true");
      } else {
        current.delete("online");
      }

      if (nextRating && nextRating !== "all") {
        current.set("rating", nextRating);
      } else {
        current.delete("rating");
      }

      const queryString = current.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [searchParams, selectedCategory, selectedRegion, search, onlyOnline, minRating, pathname, router]
  );

  // Filter handlers with URL sync
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    syncUrlParams({ category: catId });
  };

  const handleRegionChange = (regId: string) => {
    setSelectedRegion(regId);
    syncUrlParams({ region: regId });
  };

  const handleSearchChange = (term: string) => {
    setSearch(term);
    syncUrlParams({ search: term });
  };

  const handleOnlineToggle = (val: boolean) => {
    setOnlyOnline(val);
    syncUrlParams({ online: val });
  };

  const handleRatingChange = (rating: string) => {
    setMinRating(rating);
    syncUrlParams({ rating: rating });
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedRegion("all");
    setOnlyOnline(false);
    setMinRating("all");
    router.replace(pathname, { scroll: false });
  };

  // Filter and sort specialists
  const filteredSpecialists = useMemo(() => {
    const list = MOCK_SPECIALISTS.filter((spec) => {
      // Full-text search: name, bio, university, education, categories, or license
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const nameMatch = spec.full_name.toLowerCase().includes(query);
        const bioMatch = spec.bio?.toLowerCase().includes(query) ?? false;
        const universityMatch = spec.university?.toLowerCase().includes(query) ?? false;
        const educationMatch = spec.education?.toLowerCase().includes(query) ?? false;
        const licenseMatch = getAdvocateLicenseNumber(spec).toLowerCase().includes(query);
        const categoryMatch = spec.categories.some((c) =>
          c.name_uz.toLowerCase().includes(query) || c.name_ru.toLowerCase().includes(query)
        );
        const regionMatch =
          REGIONS.find((r) => r.id === spec.region)?.name_uz.toLowerCase().includes(query) ?? false;

        if (
          !nameMatch &&
          !bioMatch &&
          !universityMatch &&
          !educationMatch &&
          !licenseMatch &&
          !categoryMatch &&
          !regionMatch
        ) {
          return false;
        }
      }

      // Legal Branch Category
      if (selectedCategory !== "all") {
        const hasCategory = spec.categories.some((c) => c.id === selectedCategory);
        if (!hasCategory) return false;
      }

      // Regional Jurisdiction (all 14 regions of Uzbekistan)
      if (selectedRegion !== "all" && spec.region !== selectedRegion) {
        return false;
      }

      // Real-time Online Presence
      if (onlyOnline && !spec.is_online) {
        return false;
      }

      // Minimum Rating Threshold
      if (minRating !== "all" && spec.rating_avg < parseFloat(minRating)) {
        return false;
      }

      return true;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating_avg - a.rating_avg;
      if (sortBy === "experience") return b.experience_years - a.experience_years;
      if (sortBy === "consultations") return b.consultation_count - a.consultation_count;
      return 0;
    });
  }, [search, selectedCategory, selectedRegion, onlyOnline, minRating, sortBy]);

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedRegion !== "all") count++;
    if (search.trim() !== "") count++;
    if (onlyOnline) count++;
    if (minRating !== "all") count++;
    return count;
  }, [selectedCategory, selectedRegion, search, onlyOnline, minRating]);

  // Count specialists per legal category for live indicator badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_SPECIALISTS.forEach((spec) => {
      spec.categories.forEach((cat) => {
        counts[cat.id] = (counts[cat.id] || 0) + 1;
      });
    });
    return counts;
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ======================================================================
          1. Institutional Masthead & Judicial Registry Seal
          ====================================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#0D1F3F] to-[#12284D] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-[#C59B27]/40">
        {/* Subtle decorative judicial watermark background */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
          <Landmark className="w-96 h-96 text-white" />
        </div>
        <div className="absolute -left-12 -bottom-12 opacity-5 pointer-events-none">
          <Gavel className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Top Judicial Stamp */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase bg-[#C59B27]/20 text-[#E7D7AC] border border-[#C59B27]/50 backdrop-blur-sm">
                <Landmark className="h-3.5 w-3.5 text-[#D4AF37]" />
                O&apos;zbekiston Respublikasi Davlat Reyestri
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Adliya Vazirligi Nazoratida
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-editorial-heading text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FAF8F5] leading-tight">
              Rasmiy Advokatlar va Huquqshunoslar Reyestri
            </h1>

            {/* Chamber of Advocates Accreditation Notice */}
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-xl">
              Har bir advokat O&apos;zbekiston Respublikasi Adliya Vazirligidan litsenziyaga ega,
              Advokatlar Palatasi a&apos;zosi hisoblanadi va barcha sud instantsiyalarida fuqarolar
              manfaatlarini qonuniy himoya qilish huquqiga ega.
            </p>
          </div>

          {/* Right Metrics Medallion */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-white/10 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase block font-semibold">
                Jami Ro&apos;yxatda
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-editorial-heading font-bold text-white">
                  {MOCK_SPECIALISTS.length}
                </span>
                <span className="text-xs font-sans text-slate-300">nafar advokat</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 md:hidden" />

            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase block font-semibold">
                Faol Qidiruvda
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-editorial-heading font-bold text-emerald-300">
                  {filteredSpecialists.length}
                </span>
                <span className="text-xs font-sans text-slate-300">natija</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-sans text-slate-200">
              Onlayn yuridik maslahat va videouzoq uchrashuv xizmati faol
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
            <span>Lex.uz Qonunchilik Bazasi Bilan Sinxron</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">100% Eskrou Kafolati</span>
          </div>
        </div>
      </section>

      {/* ======================================================================
          2. 10 Legal Branches Horizontal Navigation Directory
          ====================================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#C59B27]" />
            <h2 className="font-editorial-heading text-lg font-bold text-[#0B132B]">
              Huquqiy Sohalar Bo&apos;yicha Saralash
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            10 ta ixtisoslashgan yo&apos;nalish
          </span>
        </div>

        {/* Legal Branch Interactive Cards / Chips Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
          {/* All branches option */}
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs font-sans ${
              selectedCategory === "all"
                ? "bg-[#0D47A1] text-white border-[#0D47A1] shadow-md shadow-blue-900/10 font-bold"
                : "bg-white/80 hover:bg-white text-slate-800 border-[#E2DCD0] hover:border-[#C59B27]/50"
            }`}
          >
            <div
              className={`p-1.5 rounded-lg shrink-0 ${
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">Barcha sohalar</div>
              <div
                className={`text-[10px] font-mono ${
                  selectedCategory === "all" ? "text-blue-100" : "text-slate-600"
                }`}
              >
                {MOCK_SPECIALISTS.length} nafar advokat
              </div>
            </div>
          </button>

          {/* 10 Individual Legal Branches */}
          {LEGAL_CATEGORIES.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.id] || Briefcase;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs font-sans ${
                  isSelected
                    ? "bg-[#0D47A1] text-white border-[#0D47A1] shadow-md shadow-blue-900/10 font-bold"
                    : "bg-white/80 hover:bg-white text-slate-800 border-[#E2DCD0] hover:border-[#C59B27]/50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-amber-50 text-amber-800 border border-amber-200/40"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{cat.name_uz}</div>
                  <div
                    className={`text-[10px] font-mono ${
                      isSelected ? "text-blue-100" : "text-slate-600"
                    }`}
                  >
                    {count > 0 ? `${count} nafar advokat` : "Mutaxassis mavjud"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================================
          3. Multi-Criteria Filtering Docket & Search Console
          ====================================================================== */}
      <section className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD0] shadow-sm space-y-4">
        {/* Top Filter Row: Search + Region + Rating + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Full-text keyword search (span 5) */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Advokat ismi, OTM (TDYU, JIDU), litsenziya (#ADV-xxxx) yoki soha..."
              className="pl-10 pr-9 bg-white border-[#E2DCD0] focus-visible:ring-[#0D47A1] text-xs sm:text-sm h-10 rounded-xl"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                title="Tozalash"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Region selector (14 regions of Uzbekistan) (span 3) */}
          <div className="lg:col-span-3">
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-full bg-white border-[#E2DCD0] text-xs h-10 rounded-xl">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-[#C59B27] shrink-0" />
                  <SelectValue placeholder="Barcha hududlar (14 ta)" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Barcha hududlar (O&apos;zbekiston bo&apos;yicha)</SelectItem>
                {REGIONS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name_uz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating threshold filter (span 2) */}
          <div className="lg:col-span-2">
            <Select value={minRating} onValueChange={handleRatingChange}>
              <SelectTrigger className="w-full bg-white border-[#E2DCD0] text-xs h-10 rounded-xl">
                <div className="flex items-center gap-1.5 truncate">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <SelectValue placeholder="Minimal reyting" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha reytinglar</SelectItem>
                <SelectItem value="4.8">★ 4.8+ A&apos;lo daraja</SelectItem>
                <SelectItem value="4.5">★ 4.5+ Yuqori ishonch</SelectItem>
                <SelectItem value="4.0">★ 4.0+ Yaxshi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort order (span 2) */}
          <div className="lg:col-span-2">
            <Select
              value={sortBy}
              onValueChange={(val: "rating" | "experience" | "consultations") => setSortBy(val)}
            >
              <SelectTrigger className="w-full bg-white border-[#E2DCD0] text-xs h-10 rounded-xl">
                <SelectValue placeholder="Saralash tartibi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Reyting bo&apos;yicha</SelectItem>
                <SelectItem value="experience">Sud staji bo&apos;yicha</SelectItem>
                <SelectItem value="consultations">Ishlar soni bo&apos;yicha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bottom Bar: Online toggle + Active filter counters + Reset button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2DCD0] text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Real-time online switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none py-1 px-2.5 rounded-lg hover:bg-white/60 transition-colors">
              <input
                type="checkbox"
                checked={onlyOnline}
                onChange={(e) => handleOnlineToggle(e.target.checked)}
                className="rounded border-[#C59B27] text-[#0D47A1] focus:ring-[#0D47A1] h-4 w-4"
              />
              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Faqat hozir onlayn bo&apos;lgan advokatlar
              </span>
            </label>

            {/* Active filters badge */}
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-50 text-blue-800 border border-blue-200">
                <Filter className="h-3 w-3" />
                {activeFiltersCount} ta faol filtr
              </span>
            )}
          </div>

          {/* Clear filters button */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs text-slate-600 hover:text-[#0B132B] hover:bg-white gap-1.5 font-medium"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Filtrlarni tozalash
            </Button>
          )}
        </div>

        {/* Removable Active Filter Chips Strip */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-600 mr-1">Faol filtrlar:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#FAF0D9] text-[#7E5919] border border-[#C5A059]/40">
                Soha: {LEGAL_CATEGORIES.find((c) => c.id === selectedCategory)?.name_uz}
                <button
                  type="button"
                  onClick={() => handleCategoryChange("all")}
                  className="hover:text-black ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedRegion !== "all" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                Hudud: {REGIONS.find((r) => r.id === selectedRegion)?.name_uz}
                <button
                  type="button"
                  onClick={() => handleRegionChange("all")}
                  className="hover:text-black ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {search.trim() !== "" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                Qidiruv: &ldquo;{search}&rdquo;
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="hover:text-black ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {onlyOnline && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Faqat onlayn
                <button
                  type="button"
                  onClick={() => handleOnlineToggle(false)}
                  className="hover:text-black ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {minRating !== "all" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Reyting: {minRating}+ yulduz
                <button
                  type="button"
                  onClick={() => handleRatingChange("all")}
                  className="hover:text-black ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* ======================================================================
          4. Results Count Header Bar
          ====================================================================== */}
      <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-600">
        <p>
          Topilgan advokatlar:{" "}
          <span className="font-bold text-[#0B132B] font-sans text-sm">
            {filteredSpecialists.length}
          </span>{" "}
          nafar tasdiqlangan mutaxassis
        </p>

        <p className="hidden sm:block text-[11px]">
          Litsenziya: O&apos;zR Adliya Vazirligi davlat reyestri asosida
        </p>
      </div>

      {/* ======================================================================
          5. Attorney Dossier Cards Grid (or Graceful Empty State)
          ====================================================================== */}
      {filteredSpecialists.length === 0 ? (
        /* Graceful Empty State with 1-click reset */
        <div className="paper-card rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-[#C5A059]/40 bg-[#FDFBF7] space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#FAF0D9] border border-[#C5A059]/40 flex items-center justify-center text-[#8E6F24] shadow-inner">
            <Search className="h-8 w-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-editorial-heading text-2xl font-bold text-[#0B132B]">
              Kriteriyalar bo&apos;yicha advokat topilmadi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Tanlangan filtrlar yoki qidiruv so&apos;rovi bo&apos;yicha hozircha mutaxassis mavjud emas.
              Qidiruv so&apos;rovini o&apos;zgartiring yoki barcha filtrlarni qayta o&apos;rnating.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleResetFilters}
              className="bg-[#0D47A1] hover:bg-[#15468D] text-white text-xs gap-2 px-5 py-2.5 rounded-xl shadow-md font-semibold"
            >
              <RotateCcw className="h-4 w-4" /> Barcha filtrlarni tozalash
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCategoryChange("all")}
              className="border-[#E2DCD0] text-xs gap-1.5"
            >
              Barcha sohalarni ko&apos;rish
            </Button>
          </div>

          {/* Quick suggestions */}
          <div className="pt-4 border-t border-[#E2DCD0] max-w-sm mx-auto text-[11px] text-slate-600">
            <span>Tavsiya etilgan sohalar: </span>
            <button
              type="button"
              onClick={() => handleCategoryChange("labor")}
              className="text-[#0D47A1] hover:underline font-medium ml-1"
            >
              Mehnat huquqi
            </button>
            ,{" "}
            <button
              type="button"
              onClick={() => handleCategoryChange("family")}
              className="text-[#0D47A1] hover:underline font-medium"
            >
              Oila huquqi
            </button>
            ,{" "}
            <button
              type="button"
              onClick={() => handleCategoryChange("housing")}
              className="text-[#0D47A1] hover:underline font-medium"
            >
              Uy-joy huquqi
            </button>
          </div>
        </div>
      ) : (
        /* Attorney Dossier Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSpecialists.map((spec) => {
            const licenseNo = getAdvocateLicenseNumber(spec);
            const primaryService = spec.services[0];
            const regionName = REGIONS.find((r) => r.id === spec.region)?.name_uz || "O'zbekiston";

            return (
              <div
                key={spec.id}
                className="paper-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 border border-[#E2DCD0] hover:border-[#C59B27]/60 hover:shadow-lg transition-all relative overflow-hidden bg-white/80 backdrop-blur-sm"
              >
                {/* Subtle top gold accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D47A1] via-[#C59B27] to-[#0D47A1] opacity-70" />

                <div className="space-y-4">
                  {/* Top Header: Avatar + Identity + Ministry Seal */}
                  <div className="flex items-start gap-4">
                    {/* Portrait Avatar Frame with Online Beacon */}
                    <div className="relative shrink-0">
                      <Avatar className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl border-2 border-[#C5A059]/50 shadow-md bg-[#0B132B]">
                        <AvatarFallback className="bg-[#0B132B] text-[#D4AF37] font-serif font-bold text-2xl">
                          {getInitials(spec.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {spec.is_online && (
                        <span
                          title="Hozir onlayn"
                          className="absolute -bottom-1 -right-1 flex h-4 w-4"
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border-2 border-white" />
                        </span>
                      )}
                    </div>

                    {/* Advocate Credentials & Pedigree */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Name & Primary Category */}
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/specialists/${spec.id}`} className="hover:underline">
                          <h3 className="font-editorial-heading font-bold text-xl sm:text-2xl text-[#0B132B] truncate leading-tight">
                            {spec.full_name}
                          </h3>
                        </Link>
                      </div>

                      {/* Official Verification Seal Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="legal-seal text-[10px] font-mono tracking-wider font-bold">
                          <ShieldCheck className="h-3 w-3 text-emerald-700" />
                          {licenseNo}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
                          <Award className="h-3 w-3 text-[#C59B27]" />
                          Advokatlar Palatasi
                        </span>
                      </div>

                      {/* Academic Pedigree: Degree & University */}
                      <p className="text-xs text-slate-700 font-medium flex items-center gap-1.5 pt-1 truncate">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {spec.education} • {spec.university} ({spec.graduation_year})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Professional Practice Indicators Bar */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-600 font-mono py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#E2DCD0]/80">
                    <span className="flex items-center gap-1 text-[#845D18] font-bold">
                      <Star className="h-3.5 w-3.5 fill-[#C59B27] text-[#C59B27]" />
                      {spec.rating_avg}
                      <span className="text-slate-600 font-normal">({spec.rating_count} sharh)</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      {spec.experience_years} yil sud amaliyoti
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {regionName}
                    </span>
                  </div>

                  {/* Bio statement */}
                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E2DCD0] italic font-sans">
                    &ldquo;{spec.bio}&rdquo;
                  </p>

                  {/* Specialization Branches Tags (Clickable to Filter) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-slate-600 uppercase block font-semibold">
                      Amaliyot yo&apos;nalishlari:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.categories.map((c) => {
                        const IconComponent = CATEGORY_ICON_MAP[c.id] || Briefcase;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleCategoryChange(c.id)}
                            className="text-[10px] font-sans px-2.5 py-1 rounded-lg bg-[#FAF0D9] text-[#7E5919] border border-[#C5A059]/30 hover:border-[#C59B27] transition-colors flex items-center gap-1 font-medium"
                            title={`${c.name_uz} bo'yicha saralash`}
                          >
                            <IconComponent className="h-3 w-3" />
                            {c.name_uz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Dossier Action: Transparent Tariff & Canonical Profile Link */}
                <div className="pt-4 border-t border-[#E2DCD0] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-slate-600 block tracking-wider">
                      Boshlang&apos;ich konsultatsiya
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-bold text-[#0B132B] font-mono">
                        {primaryService ? formatPrice(primaryService.price) : "Kelishuv asosida"}
                      </span>
                      {primaryService && (
                        <span className="text-[10px] text-slate-600 font-sans hidden sm:inline">
                          / {primaryService.duration_minutes} daqiqa ({primaryService.format === "video" ? "video" : "chat"})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Canonical Profile & Booking Link */}
                  <Link href={`/specialists/${spec.id}`} className="shrink-0">
                    <Button
                      size="sm"
                      className="bg-[#0B132B] hover:bg-[#0D47A1] text-[#FAF8F5] text-xs gap-2 px-4 py-2 rounded-xl shadow-md transition-all font-semibold"
                    >
                      Profil va Yozilish
                      <ArrowRight className="h-3.5 w-3.5 text-[#D4AF37]" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================
          6. Judicial Guarantee & Lex.uz Legal Compliance Notice
          ====================================================================== */}
      <section className="paper-card rounded-2xl p-6 border border-[#E2DCD0] bg-gradient-to-r from-[#FAF8F5] to-[#F5EFE6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#0D47A1]/10 text-[#0D47A1] border border-[#0D47A1]/20 shrink-0 mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-editorial-heading font-bold text-base text-[#0B132B]">
              Davlat Litsenziyasi va Eskrou To&apos;lov Himoyasi
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans max-w-2xl">
              Themis platformasidagi har bir advokat davlat reyestridan tekshirilgan. Konsultatsiya
              uchun to&apos;lovingiz mutaxassis bilan uchrashuv to&apos;liq va muvaffaqiyatli
              o&apos;tgunga qadar eskrou hisobida xavfsiz saqlanadi.
            </p>
          </div>
        </div>

        <Link href="/ai-chat" className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white text-xs gap-1.5 rounded-xl font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Huquqiy Tahlil
          </Button>
        </Link>
      </section>
    </div>
  );
}

// ============================================================================
// Root Page Component with Suspense Boundary for URL Search Params
// ============================================================================
export default function SpecialistsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center space-y-3">
          <div className="inline-block animate-spin text-[#C59B27]">
            <RotateCcw className="h-8 w-8" />
          </div>
          <p className="text-sm font-mono text-slate-500">
            Rasmiy advokatlar reyestri yuklanmoqda...
          </p>
        </div>
      }
    >
      <SpecialistsCatalogContent />
    </Suspense>
  );
}
