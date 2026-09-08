// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Xodimlar oyligi bo'limining statik ma'lumotlari.
//
// Oylik — CHIQIM tomonining o'quvchi registriga o'xshashi: qoida belgilanadi,
// har oy majburiyat hisoblanadi, to'lov uni yopadi.

/** Bo'limning ichki tablari. */
export const PAYROLL_TABS = [
  { value: "entries", label: "Oyliklar" },
  { value: "rules", label: "Qoidalar" },
];

export const ENTRY_TABLE_COLUMNS = [
  "Xodim",
  "Oy",
  { label: "Hisoblangan", align: "right" },
  { label: "To'langan", align: "right" },
  { label: "Qoldiq", align: "right" },
  "Holat",
  "",
];

export const RULE_TABLE_COLUMNS = [
  "Xodim",
  { label: "Oylik", align: "right" },
  "Davr",
  "Holat",
  "",
];

/**
 * OYLIK REJIMLARI — server `SalaryType` enumi bilan bir xil
 * (`staffSalary.service.js` dagi `TYPE_LABELS`).
 *
 * ⚠️ Yorliqlar shu yerda TURADI va komponent ichida qayta yozilmaydi:
 * bir ekranda "Soatbay", boshqasida "Soat bo'yicha" bo'lib qolmasligi kerak.
 */
export const SALARY_TYPES = {
  FIXED: "fixed",
  HOURLY: "hourly",
  MIXED: "mixed",
};

export const SALARY_TYPE_OPTIONS = [
  { label: "Fiksa — oyiga qat'iy summa", value: SALARY_TYPES.FIXED },
  { label: "Soatbay — soat × stavka", value: SALARY_TYPES.HOURLY },
  { label: "Fiksa + ortiqcha soat", value: SALARY_TYPES.MIXED },
];

/** Rejim tanlanganda oynada chiqadigan izoh. */
export const SALARY_TYPE_HINTS = {
  [SALARY_TYPES.FIXED]:
    "Oylik OY aniqligida hisoblanadi — kun bo'yicha bo'linmaydi. Oy o'rtasida " +
    "ishga kirgan xodim uchun keyingi oydan boshlang.",
  [SALARY_TYPES.HOURLY]:
    "Soat DARS JADVALIDAN hisoblanadi: haftalik jadval oy kunlariga yoyiladi, " +
    "bayram kunlari va ta'til oyi chiqariladi. O'qituvchi o'z panelida har bir " +
    "o'tilgan dars uchun summa qo'shilib borishini ko'radi. ⚠️ Soatbay " +
    "majburiyat OY YOPILGANDAN KEYIN shakllanadi — aks holda oy o'rtasidagi " +
    "soat butun oy deb muhrlanib qolardi.",
  [SALARY_TYPES.MIXED]:
    "Bazaviy summa har oy to'liq to'lanadi, ustiga normadan ORTIQCHA soat " +
    "uchun stavka qo'shiladi. ⚠️ Normadan kam ishlangani uchun bazaviy summa " +
    "kamaytirilmaydi — fiksa kelishilgan minimal kafolat, jarima emas.",
};

/** Majburiyat holati uchun badge. */
export const ENTRY_STATUS_META = {
  unpaid: { label: "To'lanmagan", className: "bg-red-100 text-red-700" },
  partial: { label: "Qisman to'langan", className: "bg-amber-100 text-amber-700" },
  paid: { label: "To'langan", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Bekor qilingan", className: "bg-gray-100 text-gray-600" },
};

/**
 * ⚠️ "BEKOR QILINGAN" RO'YXATDA TURISHI SHART. U yo'q edi va shu sababli
 * bekor qilingan majburiyat ekranda umuman ko'rinmasdi: shakllantirish
 * "2 tasi bekor qilingan, qatordagi Qayta shakllantirish tugmasidan
 * foydalaning" deb yozardi-yu, o'sha qatorni ochib bo'lmasdi.
 *
 * "Barchasi" esa bekor qilinganini KO'RSATMAYDI (server `includeCancelled`
 * siz ularni chiqarib tashlaydi) — bu ataylab: kundalik ish bekor
 * qilinganlar bilan aralashib ketmasligi kerak.
 */
export const ENTRY_STATUS_OPTIONS = [
  { label: "Barchasi", value: "" },
  { label: "To'lanmagan", value: "unpaid" },
  { label: "Qisman to'langan", value: "partial" },
  { label: "To'langan", value: "paid" },
  { label: "Bekor qilingan", value: "cancelled" },
];

/**
 * Qoidaning bir qatorlik formulasi — jadval ustunida shu ko'rinadi.
 *
 * ⚠️ Serverdagi `formulaLabel` ISHLATILMAYDI: u xato xabarlari uchun xom
 * summa bilan yig'iladi ("60000.00 so'm"), panelda esa pul har joyda
 * `formatMoney` bilan chiqadi. Ikkalasi bir jadvalda yonma-yon tursa,
 * bitta ustunda ikki xil pul formati ko'rinardi.
 */
export const getRuleFormula = (rule) => {
  if (rule.type === SALARY_TYPES.HOURLY) {
    return `${formatMoney(rule.hourlyRate)} / soat`;
  }
  if (rule.type === SALARY_TYPES.MIXED) {
    return `${formatMoney(rule.amount)} + ${formatMoney(rule.hourlyRate)} / soat`;
  }
  return `${formatMoney(rule.amount)} / oy`;
};

/** Formulaning ostidagi kichik izoh — rejim va soat normasi. */
export const getRuleFormulaHint = (rule) => {
  if (rule.type === SALARY_TYPES.HOURLY) return "Soatbay — dars jadvalidan";
  if (rule.type === SALARY_TYPES.MIXED) {
    return `Norma: ${rule.monthlyHourNorm ?? 0} soat, ortig'iga stavka`;
  }
  return null;
};

/** Qoida davri holati. */
export const getRuleStatus = (rule, currentMonth) => {
  if (rule.startMonth > currentMonth) {
    return { label: "Kelajakda", className: "bg-blue-100 text-blue-700" };
  }
  if (rule.endMonth != null && rule.endMonth < currentMonth) {
    return { label: "Tugagan", className: "bg-gray-100 text-gray-600" };
  }
  return { label: "Amalda", className: "bg-green-100 text-green-700" };
};

/**
 * Oylik summasini o'zgartirish qoidasi — oynada ko'rsatiladi.
 * Server bilan bir xil (server/src/services/payroll.service.js).
 */
export const PAYROLL_SEAL_HINT =
  "Shakllantirilgan oylik summasi muhrlanadi: uni tahrirlab bo'lmaydi. " +
  "Xato bo'lsa majburiyat bekor qilinadi, qoida to'g'rilanadi va oy " +
  "qaytadan shakllantiriladi.";

export const NO_ADVANCE_HINT =
  "Avans qo'llab-quvvatlanmaydi: to'lov qarzdan ko'p bo'lishi mumkin emas. " +
  "Lekin bitta oylikni bir necha marta bo'lib to'lash mumkin.";
