/**
 * DIAGNOSTIKA — statik ma'lumotlar (yorliqlar, ranglar, tablar, ustunlar).
 *
 * ⚠️ CLAUDE.md: qayta ishlatiladigan statik ma'lumot sahifaga yozilmaydi.
 * Bu yerdagi yorliqlar SERVER bilan bir xil bo'lishi shart — server
 * tomonda ular `helpers/diagnostic.helpers.js` va service'larda.
 */

import {
  Brain,
  ClipboardCheck,
  Timer,
  Layers,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  HelpCircle,
} from "lucide-react";

// ── QIYINLIK ─────────────────────────────────

export const LEVELS = ["easy", "medium", "hard", "expert"];

export const LEVEL_LABELS = {
  easy: "Oson",
  medium: "O'rta",
  hard: "Qiyin",
  expert: "Murakkab",
};

/** Qiyinlik yorlig'ining rangi — pastdan yuqoriga issiqlashadi. */
export const LEVEL_BADGE = {
  easy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-blue-50 text-blue-700 ring-blue-200",
  hard: "bg-amber-50 text-amber-700 ring-amber-200",
  expert: "bg-rose-50 text-rose-700 ring-rose-200",
};

// ── SAVOL TURLARI ────────────────────────────

export const QUESTION_TYPES = [
  { value: "single", label: "Bitta to'g'ri javob", needsOptions: true },
  { value: "multiple", label: "Bir nechta to'g'ri javob", needsOptions: true },
  { value: "truefalse", label: "To'g'ri / Noto'g'ri", needsOptions: true },
  { value: "gap", label: "Bo'sh joyni to'ldirish", needsOptions: true },
  { value: "short", label: "Qisqa javob", needsOptions: false },
  { value: "essay", label: "Insho", needsOptions: false },
];

export const TYPE_LABELS = Object.fromEntries(
  QUESTION_TYPES.map((t) => [t.value, t.label]),
);

export const typeNeedsOptions = (type) =>
  QUESTION_TYPES.find((t) => t.value === type)?.needsOptions ?? false;

// ── SAVOL HOLATI ─────────────────────────────

export const QUESTION_STATUSES = [
  { value: "draft", label: "Qoralama" },
  { value: "review", label: "Ko'rikda" },
  { value: "approved", label: "Tasdiqlangan" },
  { value: "archived", label: "Arxivlangan" },
];

export const QUESTION_STATUS_LABELS = Object.fromEntries(
  QUESTION_STATUSES.map((s) => [s.value, s.label]),
);

export const QUESTION_STATUS_BADGE = {
  draft: "bg-gray-100 text-gray-700 ring-gray-200",
  review: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-gray-100 text-gray-400 ring-gray-200",
};

/**
 * ⚠️ SERVER BILAN BIR XIL O'TISHLAR (`diagnosticQuestion.service.js`).
 * UI faqat mumkin bo'lgan tugmalarni ko'rsatadi; server baribir qayta
 * tekshiradi — bu ikkinchi qavat emas, qulaylik qatlami.
 */
export const QUESTION_STATUS_TRANSITIONS = {
  draft: ["review", "archived"],
  review: ["approved", "draft", "archived"],
  approved: ["review", "archived"],
  archived: ["draft"],
};

// ── TEST REJIMLARI ───────────────────────────

export const TEST_MODES = [
  {
    value: "practice",
    label: "Amaliyot",
    description: "Vaqt chegarasisiz mashq",
    icon: ClipboardCheck,
  },
  {
    value: "timed",
    label: "Vaqtli imtihon",
    description: "Real imtihon sharoiti",
    icon: Timer,
  },
  {
    value: "adaptive",
    label: "Adaptiv test",
    description: "Qiyinlik javobga qarab moslashadi",
    icon: Brain,
  },
  {
    value: "section",
    label: "Bo'lim testi",
    description: "Bitta mavzuga fokus",
    icon: Layers,
  },
];

export const MODE_LABELS = Object.fromEntries(
  TEST_MODES.map((m) => [m.value, m.label]),
);

/** Savol banki filtri uchun sinflar. */
export const GRADES = Array.from({ length: 11 }, (_, i) => i + 1);

/**
 * Savol tili.
 *
 * ⚠️ Bu savolning O'ZI qaysi tilda yozilganini bildiradi (server
 * `DiagnosticQuestion.language`), panelning tili emas. Rus sinfiga
 * ruscha savol berilishi kerak — filtr aynan shu uchun.
 */
export const QUESTION_LANGUAGES = [
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Rus" },
  { value: "en", label: "Ingliz" },
];

export const QUESTION_LANGUAGE_LABELS = Object.fromEntries(
  QUESTION_LANGUAGES.map((l) => [l.value, l.label]),
);

/**
 * Savollar bankini saralash.
 *
 * ⚠️ "Eng qiyin" — to'g'ri javob foizi eng past savollar. Ular bank
 * sifatining asosiy ko'rsatkichi: ko'p ishlatilgan-u hech kim to'g'ri
 * javob bermaydigan savolda ko'pincha savolning o'zida xato bo'ladi.
 */
export const QUESTION_SORTS = [
  { value: "newest", label: "Eng yangi" },
  { value: "oldest", label: "Eng eski" },
  { value: "grade", label: "Sinf bo'yicha" },
  { value: "subject", label: "Fan bo'yicha" },
  { value: "difficulty", label: "Qiyinlik bo'yicha" },
  { value: "hardest", label: "Eng qiyin (past %)" },
  { value: "easiest", label: "Eng oson (yuqori %)" },
  { value: "popular", label: "Ko'p ishlatilgan" },
];

export const TEST_STATUSES = [
  { value: "draft", label: "Qoralama" },
  { value: "scheduled", label: "Rejalashtirilgan" },
  { value: "active", label: "Faol" },
  { value: "archived", label: "Arxivlangan" },
];

export const TEST_STATUS_LABELS = Object.fromEntries(
  TEST_STATUSES.map((s) => [s.value, s.label]),
);

export const TEST_STATUS_BADGE = {
  draft: "bg-gray-100 text-gray-700 ring-gray-200",
  scheduled: "bg-blue-50 text-blue-700 ring-blue-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-gray-100 text-gray-400 ring-gray-200",
};

export const TEST_STATUS_TRANSITIONS = {
  draft: ["scheduled", "active", "archived"],
  scheduled: ["active", "draft", "archived"],
  active: ["archived", "scheduled"],
  archived: ["draft"],
};

// ── URINISH HOLATI ───────────────────────────

export const ATTEMPT_STATUS_LABELS = {
  in_progress: "Davom etmoqda",
  submitted: "Yakunlangan",
  evaluated: "Tahlil qilingan",
  expired: "Vaqti tugagan",
};

export const ATTEMPT_STATUS_BADGE = {
  in_progress: "bg-blue-50 text-blue-700 ring-blue-200",
  submitted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  evaluated: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  expired: "bg-amber-50 text-amber-700 ring-amber-200",
};

// ── NATIJA DARAJASI ──────────────────────────
//
// ⚠️ SEMANTIK PALITRA — DIAGNOSTIKANING BUTUN TILI. Xuddi shu to'rt
// tushuncha grafiklarda, heatmap'da, jadval kataklarida va yorliqlarda
// AYNAN bir xil rang bilan chiziladi. Ma'no faqat rang bilan berilmaydi:
// har joyda matn yorlig'i ham bo'ladi (rang ko'rmaydiganlar uchun).

export const GRADE_LABELS = { GOOD: "Yaxshi", MEDIUM: "O'rta", BAD: "Zaif" };

export const GRADE_BADGE = {
  GOOD: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  BAD: "bg-rose-50 text-rose-700 ring-rose-200",
};

/** Mavzu darajasi — server `diagnosisTone()` bilan bir xil chegaralar. */
export const TONES = {
  mastered: {
    label: "O'zlashtirilgan",
    color: "#10B981",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
  developing: {
    label: "Rivojlanmoqda",
    color: "#CA8A04",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: AlertTriangle,
  },
  gap: {
    label: "Kamchilik",
    color: "#EF4444",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: MinusCircle,
  },
  untested: {
    label: "Tekshirilmagan",
    color: "#94A3B8",
    badge: "bg-gray-100 text-gray-500 ring-gray-200",
    icon: HelpCircle,
  },
};

/** ⚠️ Server `diagnosisTone()` bilan AYNI chegaralar (80 / 50). */
export const toneOf = (score) => {
  if (score == null) return "untested";
  if (score >= 80) return "mastered";
  if (score >= 50) return "developing";
  return "gap";
};

/** Grafiklar uchun ball rangi — daraja chegaralari bo'yicha. */
export const scoreColor = (score) => TONES[toneOf(score)].color;

/**
 * DARAJA RANGI — `classifyScore` chegaralari bo'yicha (70 / 40).
 *
 * ⚠️ `scoreColor` BILAN CHALKASHTIRMANG, ikkalasi boshqa savolga javob
 * beradi va chegaralari ATAYLAB har xil:
 *   • `scoreColor` — MAVZU o'zlashtirilganmi (80 / 50, `diagnosisTone`);
 *   • `gradeColor` — NATIJA qaysi darajada (70 / 40, `classifyScore`).
 *
 * Fanlar kesimi va natijalar taqsimoti bitta ekranda yonma-yon turadi:
 * 75% li fan mavzu chegarasi bo'yicha sariq, natija chegarasi bo'yicha
 * esa yashil ("Yaxshi") bo'ladi. Ikkovini bir xil rangda ko'rsatish
 * uchun bu yerda NATIJA chegarasi ishlatiladi — aks holda bir ekranda
 * "Yaxshi" deb yozilgan fan sariq chiziq bilan chizilardi.
 *
 * Chegara sozlamadan keladi; berilmasa `classifyScore` ning sukut
 * qiymatlari ishlatiladi.
 */
export const gradeColor = (score, thresholds) => {
  if (score == null) return TONES.untested.color;
  const good = thresholds?.good ?? 70;
  const medium = thresholds?.medium ?? 40;
  if (score >= good) return TONES.mastered.color;
  if (score >= medium) return TONES.developing.color;
  return TONES.gap.color;
};

// ── XATO SABABLARI ───────────────────────────

export const ERROR_REASONS = {
  rushing: {
    label: "Shoshilish",
    color: "#CA8A04",
    hint: "Savolga kutilganidan ancha tez javob berilgan",
  },
  knowledge: {
    label: "Bilim yetishmasligi",
    color: "#EF4444",
    hint: "Mavzu o'zlashtirilmagan",
  },
  misread: {
    label: "Noto'g'ri tushunish",
    color: "#6366F1",
    hint: "Javob bir necha marta o'zgartirilgan — savol tushunarsiz bo'lgan",
  },
};

// ── TABLAR ───────────────────────────────────

export const DIAGNOSTIC_TABS = [
  { to: "/diagnostics", label: "Umumiy", title: "Diagnostika", exact: true },
  {
    to: "/diagnostics/questions",
    label: "Savollar bazasi",
    title: "Savollar bazasi",
    can: "diagnostics.questions",
    exact: false,
  },
  {
    to: "/diagnostics/tests",
    label: "Testlar",
    title: "Diagnostika testlari",
    can: "diagnostics.view",
    exact: false,
  },
  {
    // ⚠️ SINFLAR "Natijalar" DAN OLDIN: rahbar avval sinf kesimida
    // qaraydi, keyin kerakli sinfning ichiga kiradi. Teskarisi —
    // yuzlab natija ro'yxatidan kerakli sinfni qidirish.
    to: "/diagnostics/classes",
    label: "Sinflar",
    title: "Sinflar kesimida tahlil",
    can: "diagnostics.analytics",
    exact: false,
  },
  {
    // ⚠️ "Mavzular" DAN OLDIN: kesim kengdan torga boradi —
    // fan → mavzu. Fan qatoriga bosilganda shu fanning mavzulari
    // ochiladi, ya'ni tartib harakat yo'nalishini ham takrorlaydi.
    to: "/diagnostics/subjects",
    label: "Fanlar",
    title: "Fanlar kesimi",
    can: "diagnostics.analytics",
    exact: false,
  },
  {
    // ⚠️ "Savollar bazasi" bilan yonma-yon: ikkalasi ham BANK haqida —
    // biri savolning o'zi, ikkinchisi mavzu kesimida o'zlashtirish.
    to: "/diagnostics/topics",
    label: "Mavzular",
    title: "Mavzular kesimi",
    can: "diagnostics.analytics",
    exact: false,
  },
  {
    // ⚠️ "Sinflar" DAN KEYIN, "Natijalar" DAN OLDIN: kesim kengdan
    // torga qarab boradi — maktab → sinf → o'quvchi → bitta natija.
    to: "/diagnostics/students",
    label: "O'quvchilar",
    title: "O'quvchilar reytingi",
    can: "diagnostics.analytics",
    exact: false,
  },
  {
    to: "/diagnostics/attempts",
    label: "Natijalar",
    title: "O'quvchilar natijalari",
    can: "diagnostics.attempts",
    exact: false,
  },
  // ⚠️ "TAHLIL" TABI OLIB TASHLANDI VA QAYTA QO'SHILMAYDI.
  //
  // U ichida to'rt kesim (fanlar, mavzular, sinflar, o'quvchilar)
  // ochiladigan almashtirgich edi. Hozir ularning HAR BIRI o'z tabida
  // va o'z filtri, "Jami" qatori hamda Excel eksporti bilan turibdi —
  // ya'ni "Tahlil" o'sha ekranlarning kambag'alroq nusxasiga aylangan
  // edi. Qamrov ko'rsatkichi "Umumiy" da (KPI izohida), test
  // ishlamaganlar ro'yxati esa "O'quvchilar" da.
  // ⚠️ "SOZLAMALAR" TABI OLIB TASHLANDI.
  //
  // Sozlamalar SINGLETONI o'chirilmadi va u avvalgidek ishlaydi:
  // daraja chegaralari (70/40), zaif mavzu chizig'i (80), sukut
  // bo'yicha savollar soni va AI bayrog'i — bularning hammasini
  // servislar o'qiydi. Faqat ularni PANELDAN tahrirlash ekrani
  // yo'q; qiymatlar sukut bo'yicha qoladi.
];

// ── O'QUVCHI TANLAYDIGAN DARAJA ──────────────

export const DECLARED_LEVELS = [
  { value: "beginner", label: "Boshlang'ich" },
  { value: "intermediate", label: "O'rta" },
  { value: "advanced", label: "Yuqori" },
];

// ── IMPORT SHABLONI ──────────────────────────

/**
 * Import faylining ustunlari — foydalanuvchiga ko'rsatiladigan qo'llanma.
 * ⚠️ Server `_prepareImportRow` da kutadigan nomlar bilan bir xil.
 */
export const IMPORT_COLUMNS = [
  { key: "savol", label: "savol", required: true, hint: "Savol matni" },
  { key: "variant_a", label: "variant_a", required: true, hint: "Birinchi variant" },
  { key: "variant_b", label: "variant_b", required: true, hint: "Ikkinchi variant" },
  { key: "variant_c", label: "variant_c", required: false, hint: "Uchinchi variant" },
  { key: "variant_d", label: "variant_d", required: false, hint: "To'rtinchi variant" },
  {
    key: "togri_javob",
    label: "togri_javob",
    required: true,
    hint: "Harf: a / b / c / d. Bir nechta bo'lsa: a,c",
  },
  {
    key: "qiyinlik",
    label: "qiyinlik",
    required: false,
    hint: "Oson / O'rta / Qiyin / Murakkab",
  },
  { key: "mavzu", label: "mavzu", required: false, hint: "Fandagi mavzu nomi" },
  { key: "sinf", label: "sinf", required: false, hint: "1 dan 11 gacha" },
  { key: "ball", label: "ball", required: false, hint: "Standart: 1" },
  { key: "izoh", label: "izoh", required: false, hint: "To'g'ri javob izohi" },
];

// ── SANA ORALIG'I ────────────────────────────

/**
 * Standart oraliq — oxirgi 30 kun.
 *
 * ⚠️ O'QUV YILIGA BOG'LANMAYDI. Asl loyihada oraliq "1-avgustdan
 * bugungacha" deb hisoblanardi; bu domenda esa O'QUV YILI TUSHUNCHASI
 * YO'Q (`education.md` §1) va bunday standart butun bo'limga o'zga
 * mantiqni olib kirardi.
 *
 * ⚠️ Qaytadigan qiymat ISO (`2026-09-09`) — bu FORMAT emas, `<input
 * type="date">` uchun MASHINA O'QIYDIGAN qiymat (`.claude/rules/dates.md`
 * unga ataylab ruxsat beradi). Ekranga chiqadigan sana `formatDateUz`
 * bilan yoziladi.
 */
export const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 24 * 60 * 60 * 1000);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
};
