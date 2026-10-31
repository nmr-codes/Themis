import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-cinzel)", "var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Warm Uzbek Heritage Palette Tokens
        samarkand: {
          DEFAULT: "#0D47A1", // Samarkand Azure
          50: "#EEF4FC",
          100: "#D7E6F8",
          200: "#B2D0F2",
          300: "#7EAFE8",
          400: "#4589DC",
          500: "#1D69CD",
          600: "#0D47A1",
          700: "#0B3982",
          800: "#0D3169",
          900: "#102A56",
          950: "#0A1B38",
        },
        bukhara: {
          DEFAULT: "#B84A2A", // Bukhara Terracotta
          50: "#FDF5F2",
          100: "#FCE7E0",
          200: "#F9D1C3",
          300: "#F3B19B",
          400: "#E98466",
          500: "#D95E3B",
          600: "#B84A2A",
          700: "#9C3B1E",
          800: "#81331C",
          900: "#6C2E1C",
        },
        emerald: {
          seal: "#166534", // Noble Emerald Adliya Seal
          DEFAULT: "#166534",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        gold: {
          crest: "#C59B27", // Antique Gold / Judicial Crest
          DEFAULT: "#C59B27",
          50: "#FAF7EE",
          100: "#F4ECD6",
          200: "#E7D7AC",
          300: "#D9C182",
          400: "#C9AA59",
          500: "#C59B27",
          600: "#A87C1D",
          700: "#845D18",
          800: "#5F4113",
          900: "#432C0D",
        },
        parchment: {
          DEFAULT: "#FAF8F5", // Warm Parchment
          50: "#FDFCF8",
          100: "#FAF8F5",
          200: "#F4EFE0",
          300: "#EAE2CC",
          400: "#DDD2B3",
          500: "#CABE95",
        },
        obsidian: {
          DEFAULT: "#0B132B", // Obsidian Document Ink
          50: "#F4F6FA",
          100: "#E5E9F2",
          200: "#C8D1E3",
          300: "#9FB1CF",
          400: "#6F89B5",
          500: "#4C6899",
          600: "#38507D",
          700: "#2A3C61",
          800: "#172445",
          900: "#0B132B",
        },
        lapis: {
          // Backward compatibility alias for existing codebase
          50: "#EEF4FC",
          100: "#D7E6F8",
          200: "#B2D0F2",
          300: "#7EAFE8",
          400: "#5D8DCD",
          500: "#0D47A1",
          600: "#0B3982",
          700: "#173767",
          800: "#132A4F",
          900: "#0B132B",
          950: "#081021",
        },
        seal: {
          DEFAULT: "#166534", // Noble Emerald Verification Seal
          dark: "#14532D",
          light: "#DCFCE7",
          ruby: "#8B1E1E", // Notary wax seal
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        parchment: "0 2px 10px rgba(11, 19, 43, 0.04), 0 12px 30px rgba(11, 19, 43, 0.06)",
        folio: "0 4px 20px -2px rgba(11, 19, 43, 0.08), 0 16px 40px -6px rgba(11, 19, 43, 0.12)",
        gold: "0 0 25px rgba(197, 155, 39, 0.25)",
        seal: "0 4px 14px rgba(22, 101, 52, 0.25)",
      },
      backgroundImage: {
        "court-mesh": "radial-gradient(at 0% 0%, rgba(197, 155, 39, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 71, 161, 0.07) 0px, transparent 50%)",
        "guilloche": "repeating-linear-gradient(45deg, rgba(197, 155, 39, 0.03) 0px, rgba(197, 155, 39, 0.03) 1px, transparent 1px, transparent 10px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "stamp-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "stamp-pulse": "stamp-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
