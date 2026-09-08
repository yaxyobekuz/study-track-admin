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
        /* ─── Dars soatlari ("Ledger") ───────
         *
         * Registr tili: yozuv DAFTARGA TUSHADI. Shuning uchun kirish
         * harakati pastdan yuqoriga emas, chap relsdan boshlanadi —
         * avval chiziq chiziladi, keyin qator to'ladi.
         *
         * ⚠️ UZLUKSIZ HARAKAT — IKKITA, ko'p emas (`Atlas` va `Puls`
         * bilan bir xil byudjet): `tide` hero'da, `flow-dash` sxemada.
         * Uchinchisi qo'shilsa ekran "reklama banneri" bo'lib qolardi. */
        post: {
          "0%": { opacity: "0", transform: "translateY(11px)" },
          "55%": { opacity: "1" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rail-draw": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        /* Sxemadagi bog'lovchilar: soat jadvaldan oylikka OQIB o'tadi.
         * `stroke-dashoffset` — sof bo'yash, layout'ga tegmaydi. */
        "flow-dash": {
          "0%": { strokeDashoffset: "28" },
          "100%": { strokeDashoffset: "0" },
        },
        /* Hero fonidagi sekin suzuvchi yorug'lik. `background-position`
         * — kompozit qatlam, `useFitRows` o'lchovini buzmaydi. */
        tide: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
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

        /**
         * ─── INVENTAR DASHBOARDI ("Atlas") ─────────────────────────
         *
         * Alohida to'plam va bu ATAYLAB: ta'lim/moliya dashboardlari
         * `fade-up` bilan kiradi (14px + scale), inventar esa BOSHQA
         * vizual tilda — chuqurroq siljish va blur bilan. Ikkalasi bitta
         * keyframe'ni bo'lishsa, birини sozlash ikkinchisini jimgina
         * o'zgartirardi.
         *
         * ⚠️ Faqat transform / opacity / filter / stroke-dashoffset —
         * layout'ga tegmaydi, GPU'da arzon. Cheksiz takror faqat
         * `sheen` (hero yaltirashi) va `orbit` (jonli nuqta halqasi).
         */

        /** Blok kirishi — pastdan, biroz blur bilan (Apple naqshi). */
        rise: {
          "0%": { opacity: "0", transform: "translateY(22px)", filter: "blur(6px)" },
          "60%": { filter: "blur(0)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },

        /** Yon tomondan kirish — jadval qatorlari va reyting ustunlari. */
        "rise-x": {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },

        /**
         * HALQA TO'LISHI — SVG `stroke-dashoffset` bo'ylab.
         * Boshlang'ich va yakuniy qiymat CSS o'zgaruvchisidan keladi
         * (`--ring-from` / `--ring-to`), chunki har halqaning radiusi va
         * foizi boshqa: keyframe'ni qattiq raqam bilan yozib bo'lmaydi.
         */
        "ring-fill": {
          "0%": { strokeDashoffset: "var(--ring-from)" },
          "100%": { strokeDashoffset: "var(--ring-to)" },
        },

        /** Chiziqli diagramma chizilishi — bir marta, kirishda. */
        "draw-path": {
          "0%": { strokeDashoffset: "var(--draw-length)" },
          "100%": { strokeDashoffset: "0" },
        },

        /** Segment/ustun ochilishi — pastdan yuqoriga. */
        "grow-y": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },

        /** Plitka paydo bo'lishi — treemap va issiqlik xaritasi. */
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.88)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },

        /**
         * HERO YALTIRASHI — to'q kartaning ustidan sekin o'tadigan
         * yorug'lik. 9 soniyada bir marta: tez-tez bo'lsa "bezak"
         * bo'lib qolardi, umuman bo'lmasa to'q blok o'lik ko'rinardi.
         */
        sheen: {
          "0%": { transform: "translateX(-120%) skewX(-12deg)" },
          "100%": { transform: "translateX(320%) skewX(-12deg)" },
        },

        /** Jonli nuqta atrofidagi halqa — nafas oladi, "ping" EMAS. */
        orbit: {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.6)" },
        },

        /**
         * ─── FAOLLIK DASHBOARDI ("Puls") ───────────────────────────
         *
         * UCHINCHI to'plam va bu ham ATAYLAB. Ta'lim/moliya — oylik
         * HISOBOT (`fade-up`), inventar — bazaning HOLATI (`rise`,
         * blur bilan). Faollik esa JONLI SIGNAL: u "hozir" ni
         * ko'rsatadi va harakat ham shu ma'noni tashishi kerak —
         * pastdan emas, MARKAZDAN ochiladi.
         *
         * ⚠️ Cheksiz takror faqat ikkitasi: `pulse-ring` (jonli
         * ko'rsatkich) va `drift` (hero fonidagi sekin nur). Uchinchisi
         * qo'shilmaydi — ekranda uchta mustaqil takror harakat
         * "reklama bannerи" ta'sirini beradi.
         */

        /** Blok kirishi — markazdan ochiladi, siljishsiz. */
        wake: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },

        /** Qator kirishi — pastdan, qisqa masofa (ro'yxatlar uchun). */
        "wake-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        /**
         * JONLI HALQA — "hozir" belgisining atrofida. `ping` EMAS:
         * ping keskin va diqqatni tortib oladi, bu esa fon signali.
         */
        "pulse-ring": {
          "0%": { opacity: "0.45", transform: "scale(1)" },
          "70%, 100%": { opacity: "0", transform: "scale(2.4)" },
        },

        /** Hero fonidagi nur — juda sekin siljiydi (12s). */
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(6%, -4%, 0)" },
        },

        /** Ustun/segment to'lishi — chapdan o'ngga. */
        sweep: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },

        /** Issiqlik xaritasi katakchasi — joyida paydo bo'ladi. */
        "tick-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },

        /**
         * ─── XAVFSIZLIK DASHBOARDI ("Sentinel") ────────────────────
         *
         * TO'RTINCHI to'plam. Bu yerdagi ma'no — KUZATUV: ekran
         * "hammasi joyidami?" degan savolga javob beradi va harakat
         * ham shuni aytishi kerak. Shu sababli yagona takrorlanuvchi
         * harakat — `scan` (hero ustidan o'tadigan yorug'lik chizig'i).
         *
         * ⚠️ Ogohlantirish qatorlari CHAQNAMAYDI va TEBRANMAYDI:
         * jiddiylik RANG va VAZN bilan beriladi. Chaqnayotgan qator
         * "yong'in signali" bo'lib, ro'yxatni o'qib bo'lmas holga
         * keltirardi.
         */

        /** Kuzatuv chizig'i — hero ustidan sekin o'tadi. */
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "12%, 88%": { opacity: "1" },
          "100%": { transform: "translateY(1200%)", opacity: "0" },
        },

        /** Ogohlantirish qatori — chapdan, jiddiylik chizig'i bilan. */
        "alert-in": {
          "0%": { opacity: "0", transform: "translateX(-6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },

        /**
         * ─── JONLI KO'RSATKICHLAR (Puls + Sentinel) ────────────────
         *
         * ⚠️ UCHINCHI VA OXIRGI doimiy harakat. Fayl boshidagi qoida
         * ("cheksiz takror faqat ikkitasi") shu ikki bo'lim uchun
         * bittaga kengaytirildi va sabab aniq: ular JONLI SIGNAL
         * ko'rsatadi — ekran "hozir" ni aytadi va butunlay qimirlamas
         * bo'lsa, u qotib qolgan hisobotdan farq qilmasdi.
         *
         * Boshqa hech qayerda qo'llanmaydi va to'rtinchisi
         * qo'shilmaydi: uchta mustaqil takror harakat bir-biri bilan
         * raqobatlashib, ro'yxatdagi jiddiy qatorni ko'rishga xalaqit
         * berardi.
         */

        /**
         * TO'LGAN USTUN USTIDAN O'TADIGAN YORUG'LIK.
         * Faqat ASOSIY ko'rsatkich ustunlarida (qamrov, jiddiylik) —
         * har ustunda bo'lsa, ekran chaqnab turgan bo'lardi.
         */
        flow: {
          "0%": { transform: "translateX(-130%)" },
          "100%": { transform: "translateX(430%)" },
        },
      },
      animation: {
        /* ─── Dars soatlari ("Ledger") ─── */
        post: "post 620ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "rail-draw": "rail-draw 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "flow-dash": "flow-dash 1.5s linear infinite",
        tide: "tide 14s cubic-bezier(0.37, 0, 0.63, 1) infinite",

        "fade-up": "fade-up 640ms cubic-bezier(0.22, 1, 0.36, 1) both",
        breathe: "breathe 3.2s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        "shimmer-x": "shimmer-x 7s linear infinite",
        "float-y": "float-y 4.5s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        "grow-x": "grow-x 800ms cubic-bezier(0.22, 1, 0.36, 1) both",

        /* ─── Inventar dashboardi ("Atlas") ─── */
        rise: "rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "rise-x": "rise-x 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "ring-fill": "ring-fill 1400ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "draw-path": "draw-path 1600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "grow-y": "grow-y 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 460ms cubic-bezier(0.22, 1, 0.36, 1) both",
        sheen: "sheen 9s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        orbit: "orbit 3.2s cubic-bezier(0.37, 0, 0.63, 1) infinite",

        /* ─── Faollik dashboardi ("Puls") ─── */
        wake: "wake 560ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "wake-up": "wake-up 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        drift: "drift 12s cubic-bezier(0.37, 0, 0.63, 1) infinite",
        sweep: "sweep 900ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "tick-in": "tick-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both",

        /* ─── Xavfsizlik dashboardi ("Sentinel") ─── */
        scan: "scan 7s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "alert-in": "alert-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both",

        /* ─── Jonli ko'rsatkichlar ─── */
        flow: "flow 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
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
