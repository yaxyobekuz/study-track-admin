/**
 * Oy kaliti (YYYYMM) — moliya bo'limining vaqt o'lchovi.
 *
 * Backend oylarni `202608` ko'rinishidagi butun son sifatida qaytaradi
 * (kun darajasidagi maydon yo'q: "narx yangi oydan boshlab" qoidasi shundan
 * kelib chiqadi). Bu yerda faqat ko'rsatish va tanlash uchun yordamchilar.
 */

import { MONTHS_UZ_CAP, formatMonthUz } from "@/shared/utils/date.utils";

// Oy nomlari `date.utils.js` dan keladi — tizimda sana atamalarining
// yagona manbai o'sha fayl (`.claude/rules/dates.md`).
const MONTH_NAMES_UZ = MONTHS_UZ_CAP;

/** Joriy oy — YYYYMM. */
export const currentMonthKey = () => {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
};

/** Keyingi oy — narx o'zgartirishning standart boshlanish nuqtasi. */
export const nextMonthKey = (monthKey) =>
  monthKey % 100 === 12 ? monthKey + 89 : monthKey + 1;

/** Oldingi oy. */
export const prevMonthKey = (monthKey) =>
  monthKey % 100 === 1 ? monthKey - 89 : monthKey - 1;

/** 202608 → "2026-08" (input[type=month] qiymati). */
export const monthKeyToInputValue = (monthKey) =>
  monthKey == null
    ? ""
    : `${Math.trunc(monthKey / 100)}-${String(monthKey % 100).padStart(2, "0")}`;

/** "2026-08" → 202608. Bo'sh qiymat uchun null. */
export const inputValueToMonthKey = (value) => {
  if (!value) return null;
  const [year, month] = String(value).split("-");
  const key = Number(year) * 100 + Number(month);
  return Number.isNaN(key) ? null : key;
};

/** 202608 → "Avgust, 2026". Kanonik oy yorlig'i. */
export const formatMonthKey = (monthKey, { fallback = "—" } = {}) =>
  formatMonthUz(monthKey, { fallback });

/**
 * Davr matni: "Yanvar, 2026 — Avgust, 2026" yoki
 * "Yanvar, 2026 dan (muddatsiz)".
 * `endMonth = null` — butun o'qish davri / ochiq narx versiyasi.
 */
export const formatMonthRange = (startMonth, endMonth) =>
  endMonth == null
    ? `${formatMonthKey(startMonth)} dan (muddatsiz)`
    : `${formatMonthKey(startMonth)} — ${formatMonthKey(endMonth)}`;

/**
 * Oy tanlash uchun variantlar: joriy oydan oldinga/orqaga.
 * @param {{back?: number, forward?: number, from?: number}} options
 * @returns {Array<{label: string, value: string}>}
 */
export const buildMonthOptions = ({ back = 12, forward = 12, from } = {}) => {
  const base = from ?? currentMonthKey();
  const options = [];

  let key = base;
  for (let i = 0; i < back; i += 1) key = prevMonthKey(key);

  for (let i = 0; i < back + forward + 1; i += 1) {
    options.push({ label: formatMonthKey(key), value: String(key) });
    key = nextMonthKey(key);
  }

  return options;
};

export { MONTH_NAMES_UZ };
