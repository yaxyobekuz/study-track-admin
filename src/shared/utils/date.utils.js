/**
 * SANA FORMATLASH — PANEL BO'YICHA YAGONA MANBA
 *
 * Butun tizimda sana FAQAT bitta ko'rinishda chiqadi:
 *
 *     kun          →  "21-may, 2025"        formatDateUz
 *     kun + vaqt   →  "21-may, 2025 14:30"  formatDateTimeUz
 *     oy           →  "Yanvar, 2026"        formatMonthUz
 *     vaqt         →  "14:30"               formatTimeUz
 *
 * ⚠️ `toLocaleDateString()` / `toLocaleString()` / `Intl.DateTimeFormat` va
 * qo'lda yozilgan `${day}.${month}.${year}` shablonlari UI'da ISHLATILMAYDI —
 * ular brauzer sozlamasiga qarab "21.05.2025", "5/21/2025" yoki "2025-05-21"
 * berib, bir ekranda uch xil format hosil qiladi. Sabab va to'liq qoida:
 * `.claude/rules/dates.md`.
 *
 * `toISOString().split("T")[0]` — ISO qiymat, format emas: u faqat
 * `<input type="date">` va API parametrlari uchun. Uni ekranga chiqarmang.
 */

/** Oy nomlari — matn ichida (kun bilan birga): "21-may, 2025". */
export const MONTHS_UZ = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

/** Oy nomlari — mustaqil yorliq sifatida: "Yanvar, 2026". */
export const MONTHS_UZ_CAP = MONTHS_UZ.map(
  (m) => m[0].toUpperCase() + m.slice(1),
);

/** Hafta kunlari — `getDay()` tartibida (0 = yakshanba). */
export const DAYS_UZ = [
  "yakshanba",
  "dushanba",
  "seshanba",
  "chorshanba",
  "payshanba",
  "juma",
  "shanba",
];

/**
 * Kiruvchi qiymatni Date'ga aylantiradi. Yaroqsiz bo'lsa `null`.
 * Barcha formatlovchilar shu yerdan o'tadi — "Invalid Date" ekranga
 * "NaN-undefined, NaN" bo'lib chiqib ketmasligi uchun.
 * @param {Date|string|number|null|undefined} value
 * @returns {Date|null}
 */
const toDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Kanonik sana: "21-may, 2025".
 * @param {Date|string|number|null} value
 * @param {{fallback?: string, hideYear?: boolean}} [options]
 *   `hideYear` — faqat diagramma o'qi uchun ("21-may"), matnda ishlatilmaydi.
 * @returns {string}
 */
export const formatDateUz = (value, options = {}) => {
  const { fallback = "—", hideYear = false } = options;
  const date = toDate(value);
  if (!date) return fallback;

  const day = date.getDate();
  const month = MONTHS_UZ[date.getMonth()];

  return hideYear ? `${day}-${month}` : `${day}-${month}, ${date.getFullYear()}`;
};

/**
 * Kanonik sana + vaqt: "21-may, 2025 14:30".
 * @param {Date|string|number|null} value
 * @param {{fallback?: string}} [options]
 * @returns {string}
 */
export const formatDateTimeUz = (value, options = {}) => {
  const { fallback = "—" } = options;
  const date = toDate(value);
  if (!date) return fallback;

  return `${formatDateUz(date)} ${formatTimeUz(date)}`;
};

/**
 * Vaqt: "14:30" (sana qismisiz).
 * @param {Date|string|number|null} value
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export const formatTimeUz = (value, fallback = "—") => {
  const date = toDate(value);
  if (!date) return fallback;

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Oy yorlig'i: "Yanvar, 2026".
 *
 * Ikkala ko'rinishni ham qabul qiladi:
 *   - moliya oy kaliti (`Int` YYYYMM, masalan 202601)
 *   - Date / ISO satr (o'sha sananing oyi olinadi)
 *
 * @param {number|Date|string|null} value
 * @param {{fallback?: string}} [options]
 * @returns {string}
 */
export const formatMonthUz = (value, options = {}) => {
  const { fallback = "—" } = options;
  if (value === null || value === undefined || value === "") return fallback;

  // YYYYMM oy kaliti — moliyaning o'lchov birligi (`finance.md` §0).
  if (typeof value === "number" && value >= 100001) {
    const year = Math.trunc(value / 100);
    const name = MONTHS_UZ_CAP[(value % 100) - 1];
    return name ? `${name}, ${year}` : fallback;
  }

  const date = toDate(value);
  if (!date) return fallback;

  return `${MONTHS_UZ_CAP[date.getMonth()]}, ${date.getFullYear()}`;
};

/**
 * Sana oralig'i: "21-may, 2025 — 30-iyun, 2025".
 * Oxiri bo'lmasa (ochiq davr) — "21-may, 2025 dan (hozirgacha)".
 * @param {Date|string|null} start
 * @param {Date|string|null} end
 * @param {{fallback?: string, openLabel?: string}} [options]
 * @returns {string}
 */
export const formatDateRangeUz = (start, end, options = {}) => {
  const { fallback = "—", openLabel = "hozirgacha" } = options;
  const from = toDate(start);
  if (!from) return fallback;

  const to = toDate(end);
  return to
    ? `${formatDateUz(from)} — ${formatDateUz(to)}`
    : `${formatDateUz(from)} dan (${openLabel})`;
};

/**
 * Hafta kuni nomi: "seshanba".
 * @param {Date|string|number|null} value
 * @returns {string}
 */
export const getDayOfWeekUz = (value) => {
  const date = toDate(value);
  return date ? DAYS_UZ[date.getDay()] : "";
};

/**
 * Daqiqalarni "8 soat 36 daqiqa" ko'rinishida formatlaydi.
 * Masalan: 516 -> "8 soat 36 daqiqa", 60 -> "1 soat", 45 -> "45 daqiqa"
 * @param {number} totalMinutes - Jami daqiqalar
 * @returns {string} Soat va daqiqada ifodalangan davomiylik
 */
export const formatDurationUz = (totalMinutes) => {
  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  if (hours && minutes) return `${hours} soat ${minutes} daqiqa`;
  if (hours) return `${hours} soat`;
  return `${minutes} daqiqa`;
};

/**
 * Daqiqalarni ixcham "8s 57d" ko'rinishida formatlaydi (jadval ustuni uchun —
 * to'liq `formatDurationUz` u yerga sig'maydi).
 * @param {number|null} totalMinutes
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export const formatDurationShortUz = (totalMinutes, fallback = "—") => {
  if (totalMinutes == null) return fallback;

  const mins = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  if (hours && minutes) return `${hours}s ${minutes}d`;
  if (hours) return `${hours}s`;
  return `${minutes}d`;
};

/** Oy tanlash uchun variantlar (select/form). */
export const months = MONTHS_UZ_CAP.map((label, value) => ({ label, value }));

/**
 * Bayram sanasini turiga qarab formatlaydi.
 * @param {Object} holiday - Bayram obyekti
 * @returns {string} Formatlangan sana
 */
export const formatHolidayDate = (holiday) => {
  if (holiday.type === "single" && holiday.date) {
    return formatDateUz(holiday.date);
  }

  if (holiday.type === "range" && holiday.startDate && holiday.endDate) {
    return `${formatDateUz(holiday.startDate)} — ${formatDateUz(holiday.endDate)}`;
  }

  if (holiday.type === "recurring") {
    if (holiday.recurringDate?.month !== undefined) {
      return `Har yili ${holiday.recurringDate.day}-${
        MONTHS_UZ[holiday.recurringDate.month]
      }`;
    }

    if (
      holiday.recurringStartDate?.month !== undefined &&
      holiday.recurringEndDate?.month !== undefined
    ) {
      return `Har yili ${holiday.recurringStartDate.day}-${
        MONTHS_UZ[holiday.recurringStartDate.month]
      } — ${holiday.recurringEndDate.day}-${
        MONTHS_UZ[holiday.recurringEndDate.month]
      }`;
    }
  }
  return "—";
};

/* ------------------------------------------------------------------ *
 * Eski nomlar (deprecated)
 *
 * Bir vaqtlar uchta nom bir xil ishni qilardi — `formatDateUZ`,
 * `formatUzDate` va `formatDateUz` — va ular orasida oy nomlari ham
 * farq qilardi ("sentabr" / "sentyabr"). Endi hammasi shu fayldagi
 * `formatDateUz` ga ishora qiladi. YANGI KODDA ISHLATMANG.
 * ------------------------------------------------------------------ */
export const formatDateUZ = formatDateUz;
export const formatUzDate = formatDateUz;
export const formatTimeUZ = formatTimeUz;
export const getDayOfWeekUZ = getDayOfWeekUz;
export const formatDurationUZ = formatDurationUz;
export const formatDurationShortUZ = formatDurationShortUz;
