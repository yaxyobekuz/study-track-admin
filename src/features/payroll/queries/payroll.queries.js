// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { staffSalariesAPI, payrollAPI, salaryCategoriesAPI } from "../api/payroll.api";

export const payrollKeys = createQueryKeys("payroll");

const salariesKey = [...payrollKeys.all, "salaries"];
const entriesKey = [...payrollKeys.all, "entries"];
const paymentsKey = [...payrollKeys.all, "payments"];
const categoriesKey = [...payrollKeys.all, "categories"];

export const payrollQueries = {
  /** Malaka toifalari (soatlik KPI stavka) — status bo'yicha. */
  categories: (params) =>
    queryOptions({
      queryKey: [...categoriesKey, params],
      queryFn: () => salaryCategoriesAPI.getAll(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /** Faol toifalar (oylik formasidagi select uchun). */
  activeCategories: () =>
    queryOptions({
      queryKey: [...categoriesKey, "active"],
      queryFn: () => salaryCategoriesAPI.getActive().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),

  /** Oylik qoidalari (sahifalangan). */
  salaries: (params) =>
    queryOptions({
      queryKey: [...salariesKey, params],
      queryFn: () => staffSalariesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta xodimning oylik tarixi. */
  staffSalary: (staffId) =>
    queryOptions({
      queryKey: [...salariesKey, "staff", staffId],
      queryFn: () => staffSalariesAPI.getStaffHistory(staffId).then((r) => r.data.data),
      enabled: Boolean(staffId),
    }),

  /** Xodimning berilgan oydagi dars soati (KPI preview'i uchun). */
  lessonHours: (staffId, month) =>
    queryOptions({
      queryKey: [...salariesKey, "lesson-hours", staffId, month],
      queryFn: () =>
        staffSalariesAPI.getLessonHours(staffId, month).then((r) => r.data.data),
      enabled: Boolean(staffId),
      staleTime: 60 * 1000,
    }),

  /** Oylik majburiyatlari → `{ data, pagination, totals }`. */
  entries: (params) =>
    queryOptions({
      queryKey: [...entriesKey, params],
      queryFn: () => payrollAPI.getEntries(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta xodimning majburiyatlari va qarzi. */
  staffEntries: (staffId) =>
    queryOptions({
      queryKey: [...entriesKey, "staff", staffId],
      queryFn: () => payrollAPI.getStaffEntries(staffId).then((r) => r.data.data),
      enabled: Boolean(staffId),
    }),

  /** To'lovlar registri. */
  payments: (params) =>
    queryOptions({
      queryKey: [...paymentsKey, params],
      queryFn: () => payrollAPI.getPayments(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
