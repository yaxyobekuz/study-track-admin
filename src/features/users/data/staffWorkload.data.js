// O'qituvchi profilidagi "Dars jadvali" tabining statik ma'lumotlari.
//
// ⚠️ SOAT = DARS. Domenda haftalik soat har doim dars sonini bildiradi
// (`PlannerLoad.weeklyHours` bilan bir xil o'lchov), astronomik soat emas.
// Ikkinchi o'lchov kiritilsa reja va amaldagi jadval raqamlari bir-biriga
// taqqoslanmay qolardi.
//
// Komponent RAQAM O'YLAB TOPMAYDI: kartalar tarkibi shu yerda yig'iladi,
// qiymatlar esa serverdan keladi (`staffReport.data.js` bilan bir xil qoida).

// Icons
import { BookOpen, CalendarDays, Layers, Wallet } from "lucide-react";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { days } from "@/shared/data/days.data";

/**
 * `{ dushanba: "Dushanba", ... }` — yorliqlar YAGONA manbadan
 * (`days.data.js`). Nusxa massiv yozilmaydi: aynan shu xato oy nomlarida
 * bir marta sodir bo'lgan.
 */
export const DAY_LABEL = Object.fromEntries(
  days.map((day) => [day.value, day.label]),
);

/** Sinflar kesimi jadvalining ustunlari. */
export const WORKLOAD_CLASS_COLUMNS = [
  "Sinf",
  "Fan",
  { label: "Haftalik soat", align: "right" },
];

/**
 * Yuklama kartalari.
 *
 * Oylik kartasi FAQAT server oylik ma'lumotini yuborganda chiziladi —
 * ya'ni foydalanuvchida `payroll.view` bo'lganda. Ruxsat tekshiruvi shu
 * yerda TAKRORLANMAYDI: yagona qaror serverda qabul qilinadi, aks holda
 * ikkita haqiqat manbai paydo bo'lardi.
 *
 * @param {object} workload - `GET /schedules/teacher/:id` payload'i
 * @returns {Array<{key: string, label: string, value: string|number, hint: string, icon: Function}>}
 */
export const buildWorkloadTiles = (workload) => {
  const { totals, salary } = workload;
  const busiest = totals.busiestDay;

  const tiles = [
    {
      key: "hours",
      label: "Haftalik dars soati",
      value: totals.weeklyHours,
      icon: CalendarDays,
      hint: busiest
        ? `Eng band kun — ${DAY_LABEL[busiest.day] ?? busiest.day}: ${busiest.hours} soat`
        : "Jadvalda dars yo'q",
    },
    {
      key: "classes",
      label: "Sinflar",
      value: totals.classCount,
      icon: Layers,
      hint: `Haftada ${totals.activeDays} kun dars bor`,
    },
    {
      key: "subjects",
      label: "Fanlar",
      value: totals.subjectCount,
      icon: BookOpen,
      hint: "Jadvalda amalda o'tilayotgan fanlar",
    },
  ];

  if (salary) {
    tiles.push({
      key: "perHour",
      label: "Bir haftalik soatga",
      value: formatMoney(salary.perWeeklyHour),
      icon: Wallet,
      // ⚠️ "Bitta darsning narxi" EMAS: uning uchun oyda necha hafta
      // borligini taxmin qilish kerak bo'lardi, bunday raqam domenda yo'q.
      hint: salary.amount
        ? `${salary.monthLabel}: ${formatMoney(salary.amount)} oylik`
        : "Oylik belgilanmagan",
    });
  }

  return tiles;
};
