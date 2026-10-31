# Milestone 2: Navigation Architecture & Link Normalization — Handoff Report

## 1. Observation

A systematic codebase audit was conducted across all pages, layouts, and components using pattern matching (`grep_search` for `/dashboard/`, `Link`, and `router.push`/`router.replace`) and manual code inspection.

### Architecture Root Cause Observation
In Next.js App Router, parentheses in folder names define a **Route Group** (e.g. `src/app/(dashboard)/`), meaning `(dashboard)` is stripped from the URL path. Therefore:
- `src/app/(dashboard)/dashboard/page.tsx` maps to `/dashboard`
- `src/app/(dashboard)/specialists/page.tsx` maps to `/specialists`
- `src/app/(dashboard)/specialists/[id]/page.tsx` maps to `/specialists/[id]`
- `src/app/(dashboard)/ai-chat/page.tsx` maps to `/ai-chat`
- `src/app/(dashboard)/ai-chat/[id]/page.tsx` maps to `/ai-chat/[id]`
- `src/app/(dashboard)/consultations/page.tsx` maps to `/consultations`
- `src/app/(dashboard)/consultations/[id]/page.tsx` maps to `/consultations/[id]`
- `src/app/(dashboard)/consultations/[id]/chat/page.tsx` maps to `/consultations/[id]/chat`
- `src/app/(dashboard)/profile/page.tsx` maps to `/profile`

Any hyperlink targeting `/dashboard/specialists*`, `/dashboard/ai-chat*`, `/dashboard/consultations*`, or `/dashboard/profile*` triggers an immediate **HTTP 404 Not Found** response because those paths do not exist under the Next.js router manifest.

### Audit Findings: 33 Broken Links across 11 Files

#### File 1: `src/app/(dashboard)/layout.tsx`
- **Line 95**: `{ href: "/dashboard/ai-chat", label: "AI Huquqiy Tahlil", icon: Sparkles },`
- **Line 96**: `{ href: "/dashboard/specialists", label: "Advokatlar Reyestri", icon: Users },`
- **Line 97**: `{ href: "/dashboard/consultations", label: "Konsultatsiyalarim", icon: Calendar },`
- **Line 98**: `{ href: "/dashboard/profile", label: "Shaxsiy Kabinet", icon: User },`
*(Note: Line 94 `{ href: "/dashboard", label: "Mening Ishlarim", icon: LayoutDashboard }` and Line 105 `<Link href="/dashboard" ...>` are valid and must remain `/dashboard`)*.

#### File 2: `src/app/(dashboard)/dashboard/page.tsx`
- **Line 59**: `<Link href="/dashboard/ai-chat">`
- **Line 65**: `<Link href="/dashboard/specialists">`
- **Line 124**: `<Link href="/dashboard/consultations/c-101/chat">`
- **Line 130**: `<Link href="/dashboard/consultations/c-101">`
- **Line 151**: `<Link href="/dashboard/specialists">`
- **Line 196**: `<Link href={`/dashboard/specialists/${spec.id}`}>`

#### File 3: `src/app/(dashboard)/specialists/page.tsx`
- **Line 254**: `<Link href={`/dashboard/specialists/${spec.id}`}>`

#### File 4: `src/app/(dashboard)/specialists/[id]/page.tsx`
- **Line 79**: `router.push("/dashboard/consultations");` (in `handleConfirmBooking`)
- **Line 86**: `href="/dashboard/specialists"` (back button)

#### File 5: `src/app/(dashboard)/ai-chat/page.tsx`
- **Line 50**: `<Link href="/dashboard/ai-chat/new">`
- **Line 72**: `<Link key={conv.id} href={`/dashboard/ai-chat/${conv.id}`} className="block">`

#### File 6: `src/app/(dashboard)/ai-chat/[id]/page.tsx`
- **Line 160**: `<Link href="/dashboard/ai-chat">` (docket header back button)
- **Line 279**: `<Link href={`/dashboard/specialists/${spec.id}`} className="shrink-0 self-end sm:self-auto">`

#### File 7: `src/app/(dashboard)/consultations/page.tsx`
- **Line 135**: `<Link href={`/dashboard/consultations/${c.id}/chat`}>`
- **Line 141**: `<Link href={`/dashboard/consultations/${c.id}`}>`
- **Line 194**: `<Link href={`/dashboard/consultations/${c.id}`}>`

#### File 8: `src/app/(dashboard)/consultations/[id]/page.tsx`
- **Line 79**: `<Link href="/dashboard/consultations" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">`
- **Line 172**: `<Link href={`/dashboard/consultations/${consultation.id}/chat`}>`

#### File 9: `src/app/(dashboard)/consultations/[id]/chat/page.tsx`
- **Line 86**: `<Link href={`/dashboard/consultations/${id}`}>`

#### File 10: `src/app/page.tsx`
- **Line 127**: `<Link href="/dashboard/specialists" className="hover:text-[#0D1B34] transition-colors">`
- **Line 186**: `<Link href="/dashboard/ai-chat" className="w-full sm:w-auto">`
- **Line 193**: `<Link href="/dashboard/specialists" className="w-full sm:w-auto">`
- **Line 341**: `<Link href={`/dashboard/specialists/${sampleDossiers[activeDossier].advocate.id}`}>`
- **Line 462**: `<Link href="/dashboard/specialists">`
- **Line 529**: `<Link href={`/dashboard/specialists/${spec.id}`}>`
- **Line 560**: `href={`/dashboard/specialists?category=${cat.id}`}`
- **Line 634**: `<Link href="/dashboard/specialists" className="hover:text-white transition-colors">`
- **Line 637**: `<Link href="/dashboard/ai-chat" className="hover:text-white transition-colors">`

#### File 11: `src/app/(specialist)/specialist/requests/page.tsx`
- **Line 174**: `<Link href={`/dashboard/consultations/${req.id}/chat`}>`

---

## 2. Logic Chain

1. **Premise**: Next.js App Router rules dictate that parenthetical segments `(group)` do not contribute to URL paths. The file structure shows:
   - Route group folder: `src/app/(dashboard)/`
   - Child routes: `specialists/`, `ai-chat/`, `consultations/`, `profile/`, and `dashboard/`.
2. **Inference**: Therefore, valid endpoints are `/specialists`, `/ai-chat`, `/consultations`, `/profile`, and `/dashboard`. Routes with `/dashboard/specialists`, `/dashboard/ai-chat`, `/dashboard/consultations`, and `/dashboard/profile` resolve to 404.
3. **Contract Alignment**: In `PROJECT.md § Interface Contract 1 (Route Link Structure Contract)`:
   - Specialist catalog: `/specialists` (NOT `/dashboard/specialists`)
   - Specialist detail: `/specialists/[id]` (NOT `/dashboard/specialists/[id]`)
   - AI consultation list: `/ai-chat` (NOT `/dashboard/ai-chat`)
   - AI consultation session: `/ai-chat/[id]` (NOT `/dashboard/ai-chat/[id]`)
   - User consultations: `/consultations` (NOT `/dashboard/consultations`)
   - Consultation detail: `/consultations/[id]` (NOT `/dashboard/consultations/[id]`)
   - Consultation chat: `/consultations/[id]/chat` (NOT `/dashboard/consultations/[id]/chat`)
   - User profile: `/profile` (NOT `/dashboard/profile`)
   - Client dashboard: `/dashboard`
4. **Conclusion**: Replacing all 33 occurrences with normalized URLs satisfies Interface Contract 1 and completely eliminates internal 404 errors during navigation.

---

## 3. Concrete Code Diffs

Below are the exact before/after code changes for implementers:

### Diff 1: `src/app/(dashboard)/layout.tsx` (Lines 93-99)
```diff
<<<<
   const navItems = [
     { href: "/dashboard", label: "Mening Ishlarim", icon: LayoutDashboard },
     { href: "/dashboard/ai-chat", label: "AI Huquqiy Tahlil", icon: Sparkles },
     { href: "/dashboard/specialists", label: "Advokatlar Reyestri", icon: Users },
     { href: "/dashboard/consultations", label: "Konsultatsiyalarim", icon: Calendar },
     { href: "/dashboard/profile", label: "Shaxsiy Kabinet", icon: User },
   ];
====
   const navItems = [
     { href: "/dashboard", label: "Mening Ishlarim", icon: LayoutDashboard },
     { href: "/ai-chat", label: "AI Huquqiy Tahlil", icon: Sparkles },
     { href: "/specialists", label: "Advokatlar Reyestri", icon: Users },
     { href: "/consultations", label: "Konsultatsiyalarim", icon: Calendar },
     { href: "/profile", label: "Shaxsiy Kabinet", icon: User },
   ];
>>>>
```

### Diff 2: `src/app/(dashboard)/dashboard/page.tsx` (Lines 58-74, 123-136, 151-155, 196-200)
```diff
<<<<
           <div className="flex flex-wrap gap-3 pt-2">
             <Link href="/dashboard/ai-chat">
               <Button className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0D1B34] font-bold text-xs sm:text-sm gap-2 shadow-gold">
                 <Sparkles className="h-4 w-4" />
                 AI Huquqiy Tahlilni Boshlash
               </Button>
             </Link>
             <Link href="/dashboard/specialists">
               <Button
                 variant="outline"
                 className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm gap-2"
               >
                 <Users className="h-4 w-4 text-[#D4AF37]" />
                 Advokatlar Reyestri
               </Button>
             </Link>
           </div>
====
           <div className="flex flex-wrap gap-3 pt-2">
             <Link href="/ai-chat">
               <Button className="bg-[#C5A059] hover:bg-[#D4AF37] text-[#0D1B34] font-bold text-xs sm:text-sm gap-2 shadow-gold">
                 <Sparkles className="h-4 w-4" />
                 AI Huquqiy Tahlilni Boshlash
               </Button>
             </Link>
             <Link href="/specialists">
               <Button
                 variant="outline"
                 className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm gap-2"
               >
                 <Users className="h-4 w-4 text-[#D4AF37]" />
                 Advokatlar Reyestri
               </Button>
             </Link>
           </div>
>>>>
```

```diff
<<<<
           <div className="flex items-center gap-2.5 self-end md:self-center">
             <Link href="/dashboard/consultations/c-101/chat">
               <Button variant="outline" size="sm" className="border-[#C5A059]/40 hover:bg-[#F2ECE1] text-xs gap-1.5">
                 <MessageSquare className="h-3.5 w-3.5 text-[#0D1B34]" />
                 Chat
               </Button>
             </Link>
             <Link href="/dashboard/consultations/c-101">
               <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1.5">
                 Uchrashuv xonasi
                 <ChevronRight className="h-3.5 w-3.5" />
               </Button>
             </Link>
           </div>
====
           <div className="flex items-center gap-2.5 self-end md:self-center">
             <Link href="/consultations/c-101/chat">
               <Button variant="outline" size="sm" className="border-[#C5A059]/40 hover:bg-[#F2ECE1] text-xs gap-1.5">
                 <MessageSquare className="h-3.5 w-3.5 text-[#0D1B34]" />
                 Chat
               </Button>
             </Link>
             <Link href="/consultations/c-101">
               <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1.5">
                 Uchrashuv xonasi
                 <ChevronRight className="h-3.5 w-3.5" />
               </Button>
             </Link>
           </div>
>>>>
```

```diff
<<<<
           <Link href="/dashboard/specialists">
             <Button variant="ghost" size="sm" className="text-xs text-[#8E6F24] hover:text-[#0D1B34] gap-1">
               Barchasini ko&apos;rish <ArrowRight className="h-3.5 w-3.5" />
             </Button>
           </Link>
====
           <Link href="/specialists">
             <Button variant="ghost" size="sm" className="text-xs text-[#8E6F24] hover:text-[#0D1B34] gap-1">
               Barchasini ko&apos;rish <ArrowRight className="h-3.5 w-3.5" />
             </Button>
           </Link>
>>>>
```

```diff
<<<<
                 <Link href={`/dashboard/specialists/${spec.id}`}>
                   <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-8">
                     Yozilish
                   </Button>
                 </Link>
====
                 <Link href={`/specialists/${spec.id}`}>
                   <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-8">
                     Yozilish
                   </Button>
                 </Link>
>>>>
```

### Diff 3: `src/app/(dashboard)/specialists/page.tsx` (Lines 254-260)
```diff
<<<<
               <Link href={`/dashboard/specialists/${spec.id}`}>
                 <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1.5 shadow-sm">
                   Profil va Yozilish
                   <ArrowRight className="h-3.5 w-3.5" />
                 </Button>
               </Link>
====
               <Link href={`/specialists/${spec.id}`}>
                 <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1.5 shadow-sm">
                   Profil va Yozilish
                   <ArrowRight className="h-3.5 w-3.5" />
                 </Button>
               </Link>
>>>>
```

### Diff 4: `src/app/(dashboard)/specialists/[id]/page.tsx` (Lines 78-80, 85-90)
```diff
<<<<
       toast.success("Konsultatsiya so'rovingiz qabul qilindi va eskrou tizimida ro'yxatga olindi!");
       router.push("/dashboard/consultations");
     }, 1000);
====
       toast.success("Konsultatsiya so'rovingiz qabul qilindi va eskrou tizimida ro'yxatga olindi!");
       router.push("/consultations");
     }, 1000);
>>>>
```

```diff
<<<<
       <Link
         href="/dashboard/specialists"
         className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0D1B34] font-medium"
       >
         <ArrowLeft className="h-3.5 w-3.5" /> Advokatlar reyestriga qaytish
       </Link>
====
       <Link
         href="/specialists"
         className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0D1B34] font-medium"
       >
         <ArrowLeft className="h-3.5 w-3.5" /> Advokatlar reyestriga qaytish
       </Link>
>>>>
```

### Diff 5: `src/app/(dashboard)/ai-chat/page.tsx` (Lines 50-55, 71-73)
```diff
<<<<
         <Link href="/dashboard/ai-chat/new">
           <Button className="gap-2 shadow-sm">
             <Plus className="h-4 w-4" />
             Yangi huquqiy suhbat
           </Button>
         </Link>
====
         <Link href="/ai-chat/new">
           <Button className="gap-2 shadow-sm">
             <Plus className="h-4 w-4" />
             Yangi huquqiy suhbat
           </Button>
         </Link>
>>>>
```

```diff
<<<<
         {conversations.map((conv) => (
           <Link key={conv.id} href={`/dashboard/ai-chat/${conv.id}`} className="block">
====
         {conversations.map((conv) => (
           <Link key={conv.id} href={`/ai-chat/${conv.id}`} className="block">
>>>>
```

### Diff 6: `src/app/(dashboard)/ai-chat/[id]/page.tsx` (Lines 160-168, 279-284)
```diff
<<<<
           <Link href="/dashboard/ai-chat">
             <Button
               variant="outline"
               size="icon"
               className="h-8 w-8 border-[#C5A059]/40 hover:bg-[#F2ECE1] text-[#0D1B34]"
             >
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
====
           <Link href="/ai-chat">
             <Button
               variant="outline"
               size="icon"
               className="h-8 w-8 border-[#C5A059]/40 hover:bg-[#F2ECE1] text-[#0D1B34]"
             >
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
>>>>
```

```diff
<<<<
                         <Link href={`/dashboard/specialists/${spec.id}`} className="shrink-0 self-end sm:self-auto">
                           <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-8 gap-1">
                             Yozilish <ArrowRight className="h-3 w-3" />
                           </Button>
                         </Link>
====
                         <Link href={`/specialists/${spec.id}`} className="shrink-0 self-end sm:self-auto">
                           <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-8 gap-1">
                             Yozilish <ArrowRight className="h-3 w-3" />
                           </Button>
                         </Link>
>>>>
```

### Diff 7: `src/app/(dashboard)/consultations/page.tsx` (Lines 134-147, 194-198)
```diff
<<<<
                   <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0">
                     <Link href={`/dashboard/consultations/${c.id}/chat`}>
                       <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                         <MessageSquare className="h-3.5 w-3.5 text-primary" />
                         Chat
                       </Button>
                     </Link>
                     <Link href={`/dashboard/consultations/${c.id}`}>
                       <Button size="sm" className="gap-1 text-xs">
                         Batafsil
                         <ChevronRight className="h-3.5 w-3.5" />
                       </Button>
                     </Link>
                   </div>
====
                   <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0">
                     <Link href={`/consultations/${c.id}/chat`}>
                       <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                         <MessageSquare className="h-3.5 w-3.5 text-primary" />
                         Chat
                       </Button>
                     </Link>
                     <Link href={`/consultations/${c.id}`}>
                       <Button size="sm" className="gap-1 text-xs">
                         Batafsil
                         <ChevronRight className="h-3.5 w-3.5" />
                       </Button>
                     </Link>
                   </div>
>>>>
```

```diff
<<<<
                 <div className="flex items-center gap-2">
                   <Link href={`/dashboard/consultations/${c.id}`}>
                     <Button variant="outline" size="sm" className="text-xs">
                       Xulosa va Baho
                     </Button>
                   </Link>
                 </div>
====
                 <div className="flex items-center gap-2">
                   <Link href={`/consultations/${c.id}`}>
                     <Button variant="outline" size="sm" className="text-xs">
                       Xulosa va Baho
                     </Button>
                   </Link>
                 </div>
>>>>
```

### Diff 8: `src/app/(dashboard)/consultations/[id]/page.tsx` (Lines 79-81, 172-177)
```diff
<<<<
       <Link href="/dashboard/consultations" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
         <ArrowLeft className="h-3.5 w-3.5" /> Konsultatsiyalar ro&apos;yxatiga qaytish
       </Link>
====
       <Link href="/consultations" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
         <ArrowLeft className="h-3.5 w-3.5" /> Konsultatsiyalar ro&apos;yxatiga qaytish
       </Link>
>>>>
```

```diff
<<<<
           <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
             <Link href={`/dashboard/consultations/${consultation.id}/chat`}>
               <Button variant="outline" className="gap-2">
                 <MessageSquare className="h-4 w-4 text-primary" />
                 Yurist bilan chat
               </Button>
             </Link>
====
           <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
             <Link href={`/consultations/${consultation.id}/chat`}>
               <Button variant="outline" className="gap-2">
                 <MessageSquare className="h-4 w-4 text-primary" />
                 Yurist bilan chat
               </Button>
             </Link>
>>>>
```

### Diff 9: `src/app/(dashboard)/consultations/[id]/chat/page.tsx` (Lines 86-90)
```diff
<<<<
         <div className="flex items-center gap-3">
           <Link href={`/dashboard/consultations/${id}`}>
             <Button variant="ghost" size="icon" className="h-8 w-8">
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
====
         <div className="flex items-center gap-3">
           <Link href={`/consultations/${id}`}>
             <Button variant="ghost" size="icon" className="h-8 w-8">
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
>>>>
```

### Diff 10: `src/app/page.tsx` (Lines 127-129, 186-200, 341-346, 462-467, 529-533, 558-562, 634-639)
```diff
<<<<
           <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
             <Link href="#tahlil" className="hover:text-[#0D1B34] transition-colors">
               AI Tahlilxonasi
             </Link>
             <Link href="/dashboard/specialists" className="hover:text-[#0D1B34] transition-colors">
               Advokatlar Reyestri
             </Link>
====
           <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
             <Link href="#tahlil" className="hover:text-[#0D1B34] transition-colors">
               AI Tahlilxonasi
             </Link>
             <Link href="/specialists" className="hover:text-[#0D1B34] transition-colors">
               Advokatlar Reyestri
             </Link>
>>>>
```

```diff
<<<<
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
               <Link href="/dashboard/ai-chat" className="w-full sm:w-auto">
                 <Button className="w-full sm:w-auto bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-base px-8 h-12 shadow-folio border border-[#C5A059]/50 gap-2">
                   <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                   Muammoni bepul tahlil qilish
                   <ArrowRight className="h-4 w-4" />
                 </Button>
               </Link>
               <Link href="/dashboard/specialists" className="w-full sm:w-auto">
                 <Button
                   variant="outline"
                   className="w-full sm:w-auto border-[#C5A059]/40 hover:bg-[#F2ECE1] text-[#0D1B34] text-base px-6 h-12"
                 >
                   Advokatlar ro&apos;yxati
                 </Button>
               </Link>
             </div>
====
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
               <Link href="/ai-chat" className="w-full sm:w-auto">
                 <Button className="w-full sm:w-auto bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-base px-8 h-12 shadow-folio border border-[#C5A059]/50 gap-2">
                   <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                   Muammoni bepul tahlil qilish
                   <ArrowRight className="h-4 w-4" />
                 </Button>
               </Link>
               <Link href="/specialists" className="w-full sm:w-auto">
                 <Button
                   variant="outline"
                   className="w-full sm:w-auto border-[#C5A059]/40 hover:bg-[#F2ECE1] text-[#0D1B34] text-base px-6 h-12"
                 >
                   Advokatlar ro&apos;yxati
                 </Button>
               </Link>
             </div>
>>>>
```

```diff
<<<<
                   <div className="pt-4 mt-4 border-t border-[#E5E0D5]">
                     <Link href={`/dashboard/specialists/${sampleDossiers[activeDossier].advocate.id}`}>
                       <Button className="w-full bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-10 gap-1.5 shadow-sm">
                         Advokat bilan bog&apos;lanish
                         <ArrowRight className="h-3.5 w-3.5" />
                       </Button>
                     </Link>
                   </div>
====
                   <div className="pt-4 mt-4 border-t border-[#E5E0D5]">
                     <Link href={`/specialists/${sampleDossiers[activeDossier].advocate.id}`}>
                       <Button className="w-full bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs h-10 gap-1.5 shadow-sm">
                         Advokat bilan bog&apos;lanish
                         <ArrowRight className="h-3.5 w-3.5" />
                       </Button>
                     </Link>
                   </div>
>>>>
```

```diff
<<<<
             <Link href="/dashboard/specialists">
               <Button variant="outline" className="border-[#C5A059]/40 hover:bg-[#F2ECE1] text-xs gap-1.5">
                 Barcha mutaxassislarni ko&apos;rish
                 <ArrowRight className="h-3.5 w-3.5" />
               </Button>
             </Link>
====
             <Link href="/specialists">
               <Button variant="outline" className="border-[#C5A059]/40 hover:bg-[#F2ECE1] text-xs gap-1.5">
                 Barcha mutaxassislarni ko&apos;rish
                 <ArrowRight className="h-3.5 w-3.5" />
               </Button>
             </Link>
>>>>
```

```diff
<<<<
                   <Link href={`/dashboard/specialists/${spec.id}`}>
                     <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1">
                       Yozilish <ChevronRight className="h-3.5 w-3.5" />
                     </Button>
                   </Link>
====
                   <Link href={`/specialists/${spec.id}`}>
                     <Button size="sm" className="bg-[#0D1B34] hover:bg-[#152A4F] text-[#FAF7EE] text-xs gap-1">
                       Yozilish <ChevronRight className="h-3.5 w-3.5" />
                     </Button>
                   </Link>
>>>>
```

```diff
<<<<
               <Link
                 key={cat.id}
                 href={`/dashboard/specialists?category=${cat.id}`}
                 className="p-5 rounded-xl bg-[#FAF7F0] border border-[#E5E0D5] hover:border-[#C5A059] hover:bg-white transition-all group block"
               >
====
               <Link
                 key={cat.id}
                 href={`/specialists?category=${cat.id}`}
                 className="p-5 rounded-xl bg-[#FAF7F0] border border-[#E5E0D5] hover:border-[#C5A059] hover:bg-white transition-all group block"
               >
>>>>
```

```diff
<<<<
             <div className="flex flex-wrap gap-6 text-slate-400">
               <Link href="/dashboard/specialists" className="hover:text-white transition-colors">
                 Advokatlar katalogi
               </Link>
               <Link href="/dashboard/ai-chat" className="hover:text-white transition-colors">
                 AI Maslahatchi
               </Link>
               <Link href="/specialist" className="hover:text-white transition-colors">
====
             <div className="flex flex-wrap gap-6 text-slate-400">
               <Link href="/specialists" className="hover:text-white transition-colors">
                 Advokatlar katalogi
               </Link>
               <Link href="/ai-chat" className="hover:text-white transition-colors">
                 AI Maslahatchi
               </Link>
               <Link href="/specialist" className="hover:text-white transition-colors">
>>>>
```

### Diff 11: `src/app/(specialist)/specialist/requests/page.tsx` (Lines 173-178)
```diff
<<<<
                 <div className="flex items-center gap-2">
                   <Link href={`/dashboard/consultations/${req.id}/chat`}>
                     <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                       <MessageSquare className="h-3.5 w-3.5" /> Chat
                     </Button>
                   </Link>
====
                 <div className="flex items-center gap-2">
                   <Link href={`/consultations/${req.id}/chat`}>
                     <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                       <MessageSquare className="h-3.5 w-3.5" /> Chat
                     </Button>
                   </Link>
>>>>
```

---

## 4. Caveats
- No caveats. Every single internal link and programmatic navigation call across the workspace was searched, verified against the actual Next.js routing tree, and cataloged.
- Note for implementers working on Landing Page (`src/app/page.tsx`) in Milestone 2: If the Landing Page is undergoing a full editorial rewrite, ensure the new landing components use `/specialists`, `/ai-chat`, etc., rather than any legacy `/dashboard/...` links.

---

## 5. Conclusion
A total of **33 erroneous internal links across 11 files** have been identified and mapped to exact line-by-line replacement diffs.
All proposed changes strictly obey `PROJECT.md § Interface Contract 1`:
- Specialist catalog & details: `/specialists` & `/specialists/[id]`
- AI consultation flow: `/ai-chat` & `/ai-chat/[id]` (including `/ai-chat/new`)
- Consultation bookings & chat: `/consultations`, `/consultations/[id]`, `/consultations/[id]/chat`
- Profile: `/profile`
- Dashboard: `/dashboard` (retained only for the dashboard root)

Applying these diffs completely normalizes the navigation graph and resolves the systemic 404 route bugs.

---

## 6. Verification Method

Once changes are applied by the implementer, verify with the following automated and manual checks:

1. **Static Grep Verification**:
   Execute ripgrep to ensure zero occurrences of broken `/dashboard/` prefixes remain in application code:
   ```bash
   rg "/dashboard/(specialists|ai-chat|consultations|profile)" src/
   ```
   **Expected result**: 0 matches found.

2. **Challenger & E2E Verification**:
   Run the challenger probes and E2E test suites:
   ```bash
   node tests/challenger_m1_probes.mjs
   npm run build
   ```
   **Expected result**: Build compiles cleanly without route-manifest errors, probe tests pass without 404 link assertions failing.

3. **Runtime Route Traversal Spot Checks**:
   - Navigate to `/` -> Click "Advokatlar Reyestri" -> verify URL is `/specialists` (HTTP 200).
   - Navigate to `/` -> Click "Muammoni bepul tahlil qilish" -> verify URL is `/ai-chat` (or redirects to `/login` if unauthenticated).
   - In Dashboard sidebar -> Click "AI Huquqiy Tahlil" -> verify URL is `/ai-chat`.
   - In Specialist card -> Click "Yozilish" -> verify URL is `/specialists/[id]`.
