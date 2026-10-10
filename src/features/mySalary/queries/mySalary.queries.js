// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { mySalaryAPI } from "../api/mySalary.api";

/**
 * ⚠️ ILDIZ KALIT `payroll` DAN ALOHIDA (`mySalary`).
 *
 * Ma'muriyat birovning oyligini to'lasa `payrollKeys.all` eskiradi; o'z
 * oyligim ham shu ildizda tursa, kassir birovga to'lov qilganda mening
 * ekranim ham qayta yuklanardi — va aksincha.
 */
export const mySalaryKeys = createQueryKeys("mySalary");

export const mySalaryQueries = {
  /** Oylik qoidam → `{ current, items, currentMonth, currentMonthLabel }`. */
  rules: () =>
    queryOptions({
      queryKey: [...mySalaryKeys.all, "rules"],
      queryFn: () => mySalaryAPI.getRules().then((r) => r.data.data),
    }),

  /** Oylik majburiyatlarim → `{ totals, items }`. */
  entries: () =>
    queryOptions({
      queryKey: [...mySalaryKeys.all, "entries"],
      queryFn: () => mySalaryAPI.getEntries().then((r) => r.data.data),
    }),

  /**
   * Joriy oy jonli hisobi → `{ current, live, hours, totals, hasSalary }`.
   *
   * Majburiyat oyda bir marta shakllantiriladi, shuning uchun oy boshida
   * muhrlangan qator bo'lmaydi — summa shu so'rovdan ko'rsatiladi
   * (dvigatel vedomost bilan AYNI, `finance.md` §10).
   */
  stats: () =>
    queryOptions({
      queryKey: [...mySalaryKeys.all, "stats"],
      queryFn: () => mySalaryAPI.getStats().then((r) => r.data.data),
    }),

  /** Ushlab qolishlarim → `{ items, totals: { withheld, currentMonth } }`. */
  deductions: () =>
    queryOptions({
      queryKey: [...mySalaryKeys.all, "deductions"],
      queryFn: () => mySalaryAPI.getDeductions().then((r) => r.data.data),
    }),

  /** To'xtatilgan oyligim → `{ items, month, monthLabel }`. */
  suspensions: () =>
    queryOptions({
      queryKey: [...mySalaryKeys.all, "suspensions"],
      queryFn: () => mySalaryAPI.getSuspensions().then((r) => r.data.data),
    }),
};
