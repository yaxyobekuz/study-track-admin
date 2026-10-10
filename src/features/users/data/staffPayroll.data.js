// Xodim profilidagi "Oylik" tabining statik ma'lumotlari.
//
// Bu tab — CHIQIM tomonining bitta odam kesimi: qoida (kimga qancha) →
// har oylik majburiyat → to'lov. Registrning o'zi "Xodimlar oyligi"
// bo'limida, bu yerda faqat SHU xodimning holati.
//
// Holat rangi va qoida holati `payroll.data.js` dan olinadi: bitta holat
// ikki ekranda boshqa rangda ko'rinmasligi kerak.

// Icons
import { CalendarOff, HandCoins, TrendingDown, Wallet } from "lucide-react";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { entryStatusMetaOf } from "@/features/payroll/data/payroll.data";

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
 * Joriy oy majburiyati — qoida bo'lsa ham shakllantirilmagan bo'lishi
 * mumkin: majburiyat oyda bir marta alohida hosil qilinadi.
 */
export const findCurrentEntry = ({ salary, entries }) =>
  entries?.items?.find((item) => item.month === salary?.currentMonth) ?? null;

/**
 * Oylik ko'rsatkichlari.
 *
 * ⚠️ Summalar ustida arifmetika QILINMAYDI — jami hisoblangan, to'langan va
 * qarz serverdan tayyor keladi (`getStaffEntries.totals`). Frontendda
 * `Number()` bilan qo'shilsa katta summalarda aniqlik yo'qolardi.
 *
 * ⚠️ IKKI KONTEKST, BITTA QURUVCHI (`self`): ma'muriyat xodim kartasida
 * "qancha qarzdormiz" deb o'qiydi, xodimning o'zi esa "qancha oldim" deb.
 * Yorliqlar boshqa, SUMMALAR AYNI — ikkinchi quruvchi yozilsa, bir xil
 * raqam ikki ekranda boshqacha hisoblanib ketardi.
 *
 * @param {object} args
 * @param {object|null} args.salary - `GET /payroll/salaries/staff/:id` (yoki `/salaries/my`)
 * @param {object|null} args.entries - `GET /payroll/staff/:id` (yoki `/payroll/my`)
 * @param {object|null} [args.stats] - `GET /payroll/my-stats` (faqat o'z oyligida):
 *   joriy oy majburiyati hali shakllantirilmagan bo'lsa JONLI summa shundan
 *   olinadi — aks holda xodim o'z ekranida "—" ko'rib, oyligi yo'q deb o'ylardi.
 * @param {boolean} [args.self] - ekran xodimning O'ZINIKIMI
 * @returns {Array<{key: string, label: string, value: string, hint: string, icon: Function, valueClassName?: string}>}
 */
export const buildPayrollTiles = ({ salary, entries, stats = null, self = false }) => {
  const totals = entries?.totals ?? null;
  const currentEntry = findCurrentEntry({ salary, entries });

  // Shakllanmagan oyning jonli hisobi — serverda hal qilingan (dvigatel
  // vedomost bilan AYNI). Muhrlangan qator bo'lsa u YUTADI: summa muhrlangan.
  const live = !currentEntry && stats?.hasSalary ? stats : null;

  const tiles = [
    {
      key: "currentMonth",
      label: "Joriy oy oyligi",
      value: formatMoney(currentEntry ? currentEntry.amount : live?.current?.amount),
      icon: Wallet,
      hint: currentEntry
        ? `${currentEntry.monthLabel}: ${entryStatusMetaOf(currentEntry).label}`
        : live
          ? `${live.monthLabel}: hisoblanmoqda — hali shakllantirilmagan`
          : `${salary?.currentMonthLabel ?? "Joriy oy"} uchun shakllantirilmagan`,
    },
    {
      key: "paid",
      label: self ? "Jami olingan" : "Jami to'langan",
      value: formatMoney(totals?.paid),
      icon: HandCoins,
      valueClassName: "text-green-700",
      hint: "Barcha oylar bo'yicha",
    },
    {
      key: "debt",
      label: self ? "To'lanmagan qoldiq" : "Qarzimiz",
      value: formatMoney(totals?.debt),
      icon: TrendingDown,
      valueClassName: "text-red-600",
      hint: totals?.unpaidCount
        ? `${totals.unpaidCount} ta oy to'liq yopilmagan`
        : "To'lanmagan oylik yo'q",
    },
  ];

  // KELMAGAN KUNLAR (`finance.md` §10) — faqat o'z ekranida va faqat
  // SUMMA bo'lsa: fiksasiz (sof soatbay) xodimda kun 0 so'm bilan yoziladi
  // va "− 0 so'm" chalg'itardi.
  const absence = stats?.current?.absence ?? null;
  if (Number(stats?.current?.absenceAmount) > 0 && absence) {
    tiles.push({
      key: "absence",
      label: "Kelmagan kunlar uchun ayrildi",
      value: `− ${formatMoney(stats.current.absenceAmount)}`,
      icon: CalendarOff,
      valueClassName: "text-red-600",
      hint: `${stats.monthLabel}: ${absence.dayCount} kun × ${formatMoney(absence.dailyRate)}`,
    });
  }

  return tiles;
};
