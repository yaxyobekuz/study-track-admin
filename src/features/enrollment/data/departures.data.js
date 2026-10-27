/**
 * CHIQIB KETGAN O'QUVCHILAR bo'limining statik ma'lumotlari.
 *
 * Ketish — o'qish davrining YOPILGANI (`endDate` + sabab toifasi + erkin
 * izoh). Alohida jadval yo'q, shuning uchun bu fayl ham `enrollment`
 * feature'i ichida turadi: yorliqlar va toifalar bitta joydan o'qiladi
 * (`END_REASON_OPTIONS` — davr yopish oynasi bilan AYNI manba).
 */

import { END_REASON_OPTIONS } from "./enrollment.data";

/**
 * Sabab toifasining RANG TILI.
 *
 * ⚠️ Ranglar ma'noli, bezak emas: chetlatish — qizil (salbiy qaror),
 * bitirish — yashil (maqsadga yetgan), boshqa filialga o'tish — ko'k
 * (maktabdan ketmagan, tarmoq ichida), o'z ixtiyori — sariq (ketgan,
 * lekin maktabning qarori emas). Shu tufayli jadval, kartalar va grafik
 * bitta rangni bitta ma'noda ishlatadi.
 *
 * `chip` — yorliq, `bar` — foiz chizig'i, `fill` — grafik ustuni
 * (Recharts SVG `fill` ni Tailwind sinfidan o'qiy olmaydi).
 */
export const DEPARTURE_REASON_TONES = {
  left: {
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    bar: "bg-amber-400",
    fill: "#f59e0b",
  },
  expelled: {
    chip: "border-red-200 bg-red-50 text-red-700",
    bar: "bg-red-500",
    fill: "#ef4444",
  },
  graduated: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
    fill: "#10b981",
  },
  transferred: {
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    bar: "bg-blue-500",
    fill: "#3b82f6",
  },
};

export const DEPARTURE_REASON_FALLBACK_TONE = {
  chip: "border-gray-200 bg-gray-50 text-gray-600",
  bar: "bg-gray-400",
  fill: "#9ca3af",
};

export const toneOfReason = (reason) =>
  DEPARTURE_REASON_TONES[reason] ?? DEPARTURE_REASON_FALLBACK_TONE;

/** Sabab filtri — "Barchasi" + to'rtta toifa (yopish oynasi bilan AYNI). */
export const DEPARTURE_REASON_FILTER = [
  { value: "all", label: "Barcha sabablar" },
  ...END_REASON_OPTIONS,
];

/**
 * Davr presetlari.
 *
 * ⚠️ Sukut — 12 oy, "Hammasi" EMAS: registr birinchi ochilishda ma'noli
 * manzara ko'rsatishi kerak, lekin butun tarix (bitirganlar bilan birga)
 * joriy holatni bosib ketardi. "Hammasi" bir bosishda.
 *
 * `custom` — tanlangan oraliq: tabni bosganda ikki sana maydoni ochiladi.
 */
export const DEPARTURE_PERIODS = [
  { value: "30", label: "30 kun" },
  { value: "90", label: "3 oy" },
  { value: "365", label: "12 oy" },
  { value: "all", label: "Hammasi" },
  { value: "custom", label: "Oraliq" },
];

export const DEPARTURE_PERIOD_DEFAULT = "365";

export const DEPARTURE_PAGE_LIMIT = 20;

export const DEPARTURE_COLUMNS = [
  "#",
  "O'quvchi",
  "Sinf",
  "Ketgan sana",
  "Ketish sababi",
  "Qancha o'qigan",
  "Holat",
];

/**
 * Qatorning HOZIRGI holati — "ketgan" degani "yo'q" degani emas.
 *
 * Bir o'quvchida bir nechta davr bo'lishi mumkin (ketdi, qaytib keldi):
 * shuning uchun qaytib kelgani alohida belgilanadi, aks holda registr
 * qaytgan bolani ham ketganlar qatorida ushlab turardi.
 */
export const departureStateOf = (row) => {
  if (row.isStudyingNow) {
    return {
      label: row.returnedAt ? "Qaytib kelgan" : "Hozir o'qiyapti",
      className: "border-green-200 bg-green-50 text-green-700",
    };
  }
  if (row.returnedAt) {
    return {
      label: "Qaytgan, keyin ketgan",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (row.student?.isArchived) {
    return {
      label: "Arxivlangan",
      className: "border-gray-200 bg-gray-100 text-gray-600",
    };
  }
  return {
    label: "O'qimayapti",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  };
};

/** O'quvchining to'liq ismi — bo'sh familiya "undefined" bo'lib chiqmasin. */
export const studentNameOf = (student) =>
  [student?.firstName, student?.lastName].filter(Boolean).join(" ") || "Noma'lum o'quvchi";

/**
 * Oldingi davrga nisbatan o'zgarish.
 *
 * ⚠️ FOIZ EMAS, SONLAR AYIRMASI: oldingi oynada 1 ta ketish bo'lsa,
 * 3 ta "+200%" bo'lib chiqardi va bu maktab o'lchovida ma'nosiz raqam.
 * Yo'nalish esa muhim: ketish KO'PAYSA — bu yomon xabar, shuning uchun
 * o'sish qizil (odatdagi "o'sish — yaxshi" naqshining aksi).
 */
export const departureDelta = (total, prevTotal) => {
  const diff = (total ?? 0) - (prevTotal ?? 0);
  if (diff === 0) return { diff, label: "o'zgarmadi", className: "text-gray-500" };

  // ⚠️ Manfiy ayirma MATNDA emas, SO'ZDA ko'rsatiladi: `${diff} kam`
  // "-2 kam" bo'lib chiqardi va ikki marta inkor bo'lib o'qilardi.
  return diff > 0
    ? { diff, label: `${diff} ta ko'p`, className: "text-red-600" }
    : { diff, label: `${Math.abs(diff)} ta kam`, className: "text-emerald-600" };
};
