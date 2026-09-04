// Xodim profilidagi "Oylik" tabining statik ma'lumotlari.
//
// Bu tab — CHIQIM tomonining bitta odam kesimi: qoida (kimga qancha) →
// har oylik majburiyat → to'lov. Registrning o'zi "Xodimlar oyligi"
// bo'limida, bu yerda faqat SHU xodimning holati.
//
// Holat rangi va qoida holati `payroll.data.js` dan olinadi: bitta holat
// ikki ekranda boshqa rangda ko'rinmasligi kerak.

// Icons
import { CalendarClock, HandCoins, TrendingDown, Wallet } from "lucide-react";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

/** Oylik qoidalari jadvalining ustunlari. */
export const PAYROLL_RULE_COLUMNS = [
  { label: "Oylik", align: "right" },
  "Davr",
  "Holat",
];

/** Oylik majburiyatlari jadvalining ustunlari. */
export const PAYROLL_ENTRY_COLUMNS = [
  "Oy",
  { label: "Hisoblangan", align: "right" },
  { label: "To'langan", align: "right" },
  { label: "Qoldiq", align: "right" },
  "Holat",
];

/**
 * Oylik ko'rsatkichlari.
 *
 * ⚠️ Summalar ustida arifmetika QILINMAYDI — jami hisoblangan, to'langan va
 * qarz serverdan tayyor keladi (`getStaffEntries.totals`). Frontendda
 * `Number()` bilan qo'shilsa katta summalarda aniqlik yo'qolardi.
 *
 * @param {object} args
 * @param {object|null} args.salary - `GET /payroll/salaries/staff/:id` payload'i
 * @param {object|null} args.entries - `GET /payroll/staff/:id` payload'i
 * @returns {Array<{key: string, label: string, value: string, hint: string, icon: Function, valueClassName?: string}>}
 */
export const buildPayrollTiles = ({ salary, entries }) => {
  const rule = salary?.current ?? null;
  const totals = entries?.totals ?? null;

  // Joriy oy majburiyati — qoida bo'lsa ham shakllantirilmagan bo'lishi
  // mumkin: majburiyat oyda bir marta alohida hosil qilinadi.
  const currentEntry =
    entries?.items?.find((item) => item.month === salary?.currentMonth) ?? null;

  return [
    {
      key: "rule",
      label: "Amaldagi oylik",
      value: formatMoney(rule?.amount),
      icon: Wallet,
      hint: rule?.periodLabel ?? "Oylik qoidasi belgilanmagan",
    },
    {
      key: "currentMonth",
      label: "Joriy oy majburiyati",
      value: formatMoney(currentEntry?.amount),
      icon: CalendarClock,
      hint: currentEntry
        ? `${currentEntry.monthLabel}: ${currentEntry.statusLabel}`
        : `${salary?.currentMonthLabel ?? "Joriy oy"} uchun shakllantirilmagan`,
    },
    {
      key: "paid",
      label: "Jami to'langan",
      value: formatMoney(totals?.paid),
      icon: HandCoins,
      valueClassName: "text-green-700",
      hint: "Barcha oylar bo'yicha",
    },
    {
      key: "debt",
      label: "Qarzimiz",
      value: formatMoney(totals?.debt),
      icon: TrendingDown,
      valueClassName: "text-red-600",
      hint: totals?.unpaidCount
        ? `${totals.unpaidCount} ta oy to'liq yopilmagan`
        : "To'lanmagan oylik yo'q",
    },
  ];
};
