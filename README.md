# Huquqiy Yordam (Themis) — Startap MVP

O'zbekiston fuqarolariga huquqiy muammolarni AI yordamida dastlabki tahlil qilish, tekshirilgan yurist va advokatlarni topish hamda masofaviy onlayn konsultatsiya o'tkazish imkonini beruvchi raqamli platforma.

---

## 🚀 Texnologiyalar steki

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Sonner
- **Backend & DB:** Supabase (PostgreSQL, Row Level Security, Auth, Storage, Realtime)
- **AI Tahlil:** OpenAI API (GPT-4o-mini) + Mahalliy O'zbekiston Qonunchiligi Bilimlar Bazasi (Labor, Family, Housing, Civil va hk)
- **To'lov integratsiyasi arxitekturasi:** Payme / Click checkout integratsiyasiga mos hisob-kitob modeli

---

## 📦 MVP Imkoniyatlari (Barcha P0 modullar)

### 1. 🤖 AI Huquqiy Maslahatchi
- Erkin matn shaklida muammoni qabul qilish va 10 ta asosiy huquqiy toifaga ajratish
- Yangi Mehnat, Fuqarolik, Oila, Uy-joy kodekslariga tayangan holda manbali javob berish
- Masala bo'yicha eng mos tekshirilgan yuristlarni tavsiya qilish
- Savollar tarixi va murojaatlarni boshqarish

### 2. 👥 Mutaxassislar Katalogi & Ommaviy Profil
- Ism, huquqiy yo'nalish, viloyat/shahar, narx, reyting va onlayn holat bo'yicha qidiruv va filtrlash
- Yuristning tasdiqlangan ta'limi, tajribasi, diplom va litsenziyalari
- Xizmatlar & Tariflar (15 daqiqalik ekspress maslahat, 45 daqiqalik video konsultatsiya)
- Yozilish va bron qilish dialogi (sana/vaqt va izoh bilan)

### 3. 💼 Mutaxassis Portali (Yurist Kabineti)
- Boshqaruv paneli (konsultatsiyalar, reyting, sof daromad statistikasi)
- Kelib tushgan yangi mijoz so'rovlarini qabul qilish yoki rad etish
- Xizmatlar va tariflarni boshqarish (narx, davomiylik, format)
- Haftalik ish jadvali va kunlik qabul soatlarini sozlash
- Moliya va daromadlar tahlili (15% platforma komissiyasi bilan sof hisob-kitob)
- Hujjatlar yuklash va verifikatsiya holati

### 4. 💬 Konsultatsiya & Xavfsiz Muloqot
- Belgilangan konsultatsiyalar ro'yxati va holatlar (Rejalashtirilgan, Yakunlangan)
- Yurist va mijoz o'rtasidagi alohida himoyalangan chat xonasi
- Video qo'ng'iroq integratsiyasi (xavfsiz video uchrashuv xonasi)
- Konsultatsiya yakunida 1-5 yulduzli baho va fikr qoldirish tizimi

### 5. 🛡️ Admin / Moderator Paneli
- Boshqaruv markazi (jami foydalanuvchilar, arizalar, tushumlar)
- Mutaxassis arizalarini tekshirish, litsenziyalarni ko'rib chiqish va 1 klikda tasdiqlash / rad etish
- Barcha foydalanuvchilar va konsultatsiyalar monitoringi
- Sharhlar moderatsiyasi
- Moliyaviy oqimlar va platforma komissiyasi hisob-kitobi

---

## 🛠️ O'rnatish va Ishga Tushirish

### 1. Loyihani yuklash va bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. Muhit o'zgaruvchilari (.env.local)
`.env.local.example` faylidan nusxa olib `.env.local` yarating:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
```
> *Eslatma:* Loyiha avtomatik ravishda **aqlli oflayn rejimni** qo'llab-quvvatlaydi. API kalitsiz ham to'liq funksional ishlaydi (mock yuristlar, qonuniy manbalar, tezkor demo foydalanuvchilar).

### 3. Supabase ma'lumotlar bazasi sxemasi
`supabase/migrations/001_initial_schema.sql` faylidagi SQL kodni Supabase SQL Editor darchasida ishga tushiring. Bu jadvallarni, xavfsizlik qoidalarini (RLS) va triggerlarni yaratadi.

### 4. Dasturni ishga tushirish
```bash
npm run dev
```
Brauzerda: `http://localhost:3000` manzilini oching.

### 5. Tezkor Demo Kirish
Kirish sahifasida (`/login`) 1 klik orqali test qilish imkoniyati mavjud:
- **Mijoz:** `mijoz@themis.uz` (parol: `password123`)
- **Yurist:** `yurist@themis.uz` (parol: `password123`)
- **Admin:** `admin@themis.uz` (parol: `password123`)

