import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Huquqiy Yordam — O'zbekistonning Ishonchli Huquqiy Maskani",
  description:
    "AI yordamida huquqiy tahlil, tasdiqlangan advokatlar reyestri va xavfsiz onlayn konsultatsiya. Kuch adolatdadir.",
  icons: {
    icon: "/favicon.ico",
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
