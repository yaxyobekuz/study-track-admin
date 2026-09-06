/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      /**
       * DASHBOARD HARAKAT TOKENLARI (sinf satrlari —
       * `features/academicDashboard/data/dashboard.tokens.js`).
       *
       * Hammasi `motion-safe:` bilan qo'llanadi — `prefers-reduced-motion`
       * da o'chadi. Faqat transform / opacity / background-position:
       * GPU'da arzon, layout'ga tegmaydi (`useFitRows` o'lchovi buzilmaydi).
       *
       * Cheksiz takror FAQAT uchtasi: `breathe` (jonli/oxirgi nuqta),
       * `shimmer-x` (AI kartasi yuqori chizig'i), `float-y` (AI ikonkasi).
       * Bounce, ping, zoom — yo'q: ular "bachkana" o'qiladi.
       */
      transitionTimingFunction: {
        /** Kirishlar — tez boshlanib, uzoq sekinlashadi. */
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        /** Doimiy nafas — simmetrik, keskin nuqtasiz. */
        "in-out-sine": "cubic-bezier(0.37, 0, 0.63, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.985)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        "shimmer-x": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-1.5px)" },
        },
        "grow-x": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 640ms cubic-bezier(0.22, 1, 0.36, 1) both",
        breathe: "breathe 3.2s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        "shimmer-x": "shimmer-x 7s linear infinite",
        "float-y": "float-y 4.5s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        "grow-x": "grow-x 800ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      /**
       * BIR EKRANLI REJIM — ta'lim dashboardi shu ekranda viewport
       * balandligiga qulflanadi (sahifa surilmaydi, karta ichida ham
       * surgich yo'q, qator soni `useFitRows` bilan O'LCHANADI).
       *
       * ⚠️ Kenglik VA balandlik — ikkalasi ham shart. Balandlik chegarasi
       * 960px: u O'LCHANGAN (Chrome, haqiqiy CSS) va hisobi
       * `src/features/academicDashboard/data/fitscreen.data.js` da
       * yozilgan — bundan pastda eng talabchan karta o'zining eng kam
       * ikki qatorini ham sig'dira olmay, oxirgi qatorni YARIM kesib
       * ko'rsatardi. Undan kichigida ODATDAGI oqim ishlaydi: kartalar
       * tabiiy balandlikda, sahifa suriladi, ro'yxatlar to'liq.
       *
       * ⚠️ Shart JS tomonida ham kerak (`useMediaQuery`) va u AYNAN shu
       * matn bo'lishi shart — nusxa `fitscreen.data.js` da, faqat
       * o'sha ikkisi.
       *
       * ⚠️ `extend` ning OXIRIDA turishi shart: variant tartibi shu
       * ro'yxatdan olinadi va `fitscreen:` `xl:` / `2xl:` dan KEYIN
       * chiqishi kerak, aks holda kengroq ekran qoidasi uni bosib
       * ketardi.
       *
       * ⚠️ `raw` — chunki bu oddiy `min-width` emas: `screens` ning
       * qiymat sifatidagi qisqa yozuvi faqat kenglikni bila oladi.
       */
      screens: {
        fitscreen: { raw: "(min-width: 1280px) and (min-height: 960px)" },
      },
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [require("tailwindcss-animate")],
};
