import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Uzbek Legal Editorial Typography Pairings
const serifFont = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cinzelFont = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#081021" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://themis.uz"),
  title: {
    default: "Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi",
    template: "%s | Themis — Huquqiy Yordam",
  },
  description:
    "O'zbekiston Respublikasi bo'yicha litsenziyalangan advokatlar reyestri, Lex.uz qonunchilik bazasiga asoslangan AI yuridik tahlili va xavfsiz onlayn huquqiy konsultatsiyalar platformasi.",
  keywords: [
    "Themis",
    "Huquqiy Yordam",
    "advokat",
    "yurist",
    "O'zbekiston yuridik platformasi",
    "advokatlar reyestri",
    "onlayn konsultatsiya",
    "AI huquqiy tahlil",
    "Lex.uz",
    "Adliya vazirligi",
    "Toshkent advokat",
  ],
  authors: [{ name: "Themis Legal Technologies" }],
  creator: "Themis Uzbekistan",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://themis.uz",
    siteName: "Themis — Huquqiy Yordam",
    title: "Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi",
    description:
      "O'zbekiston Respublikasi bo'yicha litsenziyalangan advokatlar reyestri va AI yordamida tezkor yuridik tahlil.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Themis — Huquqiy Yordam | O'zbekiston yuridik platformasi",
    description:
      "O'zbekiston Respublikasi bo'yicha litsenziyalangan advokatlar reyestri va AI yordamida tezkor yuridik tahlil.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${serifFont.variable} ${sansFont.variable} ${cinzelFont.variable}`}
    >
      <body className="font-sans antialiased selection:bg-gold-500/20 selection:text-obsidian bg-background text-foreground min-h-screen">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              borderRadius: "0.5rem",
              border: "1px solid rgba(197, 155, 39, 0.25)",
            },
          }}
        />
      </body>
    </html>
  );
}
