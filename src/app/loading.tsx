import { Scale } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 sm:p-6 md:p-10 bg-court-mesh relative overflow-hidden">
      {/* Subtle Judicial Scale Watermark in the background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.025] select-none">
        <Scale className="w-[700px] h-[700px] text-[#132A4F]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8">
        {/* Central Judicial Spinner & Sync Indicator */}
        <div className="flex flex-col items-center justify-center text-center pt-8 pb-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Outer Gilded Subtle Rotating Ring */}
            <div className="w-16 h-16 rounded-full border-2 border-[#C5A059]/20 border-t-[#C5A059] animate-spin" />

            {/* Inner Judicial Crest with Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-[#C5A059]/40 flex items-center justify-center shadow-sm animate-stamp-pulse">
                <Scale className="w-5 h-5 text-gold-600" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <h2 className="font-editorial-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Huquqiy ma&apos;lumotlar yuklanmoqda...
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              O&apos;zbekiston Respublikasi Adliya axborot tizimi va Lex.uz qonunchilik bazasi bilan sinxronlashtirilmoqda
            </p>
          </div>
        </div>

        {/* Editorial Skeleton Masthead */}
        <div className="paper-card rounded-xl p-6 sm:p-8 border border-[#C5A059]/25 bg-[#FAF7F0]/80 shadow-parchment space-y-4">
          {/* Legal Article Pill Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-full bg-parchment-300/70" />
            <Skeleton className="h-5 w-44 rounded-full bg-parchment-200/60" />
          </div>

          {/* Heading Skeletons */}
          <div className="space-y-2 pt-1">
            <Skeleton className="h-8 sm:h-10 w-3/4 sm:w-2/3 bg-parchment-300/80 rounded-md" />
            <Skeleton className="h-4 sm:h-5 w-full sm:w-4/5 bg-parchment-200/70 rounded-md" />
            <Skeleton className="h-4 w-1/2 bg-parchment-200/50 rounded-md" />
          </div>
        </div>

        {/* Dossier Card Skeletons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="paper-card rounded-xl p-5 border border-[#C5A059]/20 bg-[#FAF7F0]/90 space-y-4 shadow-sm relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar Skeleton */}
                  <Skeleton className="w-12 h-12 rounded-full bg-parchment-300/80 shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 bg-parchment-300/80 rounded" />
                    <Skeleton className="h-3 w-20 bg-parchment-200/70 rounded" />
                  </div>
                </div>

                {/* Rating Badge Skeleton */}
                <Skeleton className="h-6 w-14 rounded-full bg-parchment-200/60 shrink-0" />
              </div>

              {/* Specialization & Bio Lines */}
              <div className="space-y-2 py-2 border-y border-[#C5A059]/15">
                <Skeleton className="h-3 w-full bg-parchment-200/80 rounded" />
                <Skeleton className="h-3 w-5/6 bg-parchment-200/60 rounded" />
                <Skeleton className="h-3 w-3/5 bg-parchment-200/40 rounded" />
              </div>

              {/* Card Footer / Action Skeleton */}
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-24 bg-parchment-200/70 rounded" />
                <Skeleton className="h-8 w-28 bg-parchment-300/80 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
