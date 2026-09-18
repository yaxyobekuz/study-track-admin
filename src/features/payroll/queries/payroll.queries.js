// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import {
  staffSalariesAPI,
  payrollAPI,
  salaryCategoriesAPI,
  departmentsAPI,
  positionsAPI,
  payrollViewAPI,
  payrollRequestsAPI,
  deductionsAPI,
  suspensionsAPI,
} from "../api/payroll.api";

export const payrollKeys = createQueryKeys("payroll");

const salariesKey = [...payrollKeys.all, "salaries"];
const entriesKey = [...payrollKeys.all, "entries"];
const paymentsKey = [...payrollKeys.all, "payments"];
const categoriesKey = [...payrollKeys.all, "categories"];
const deptKey = [...payrollKeys.all, "departments"];
const posKey = [...payrollKeys.all, "positions"];
const viewKey = [...payrollKeys.all, "view"];
const requestsKey = [...payrollKeys.all, "requests"];
const auditKey = [...payrollKeys.all, "audit"];
const deductionsKey = [...payrollKeys.all, "deductions"];
const suspensionsKey = [...payrollKeys.all, "suspensions"];

export const payrollQueries = {
  /** Bo'limlar (staff/teaching). */
  departments: (params) =>
    queryOptions({
      queryKey: [...deptKey, params],
      queryFn: () => departmentsAPI.getAll(params).then((r) => r.data.data),
    }),

  /** Bir bo'lim lavozimlari. */
  positions: (departmentId) =>
    queryOptions({
      queryKey: [...posKey, departmentId],
      queryFn: () => positionsAPI.getAll({ departmentId }).then((r) => r.data.data),
      enabled: Boolean(departmentId),
    }),

  /** Staff bo'lim xodimlari + hisoblangan oylik. */
  staffPayroll: (params) =>
    queryOptions({
      queryKey: [...viewKey, "staff", params],
      queryFn: () => payrollViewAPI.staff(params).then((r) => r.data),
      enabled: Boolean(params?.departmentId),
      placeholderData: keepPreviousData,
    }),

  /** Biriktirish nomzodlari — shu bo'limda allaqachon borlar chiqarilgan. */
  assignCandidates: (departmentId) =>
    queryOptions({
      queryKey: [...viewKey, "assign-candidates", departmentId],
      queryFn: () => payrollViewAPI.assignCandidates(departmentId).then((r) => r.data.data),
      enabled: Boolean(departmentId),
    }),

  /** Toifa o'qituvchilari + hisoblangan oylik. */
  /** Ustama haq registri (manba/holat bilan). */
  allowancesView: (params) =>
    queryOptions({
      queryKey: [...viewKey, "allowances", params],
      queryFn: () => payrollViewAPI.allowances(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  teacherPayroll: (params) =>
    queryOptions({
      queryKey: [...viewKey, "teachers", params],
      queryFn: () => payrollViewAPI.teachers(params).then((r) => r.data),
      enabled: Boolean(params?.categoryId),
      placeholderData: keepPreviousData,
    }),

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

  /**
   * Qayta hisoblash ro'yxati ("eski → yangi") — hech narsa yozilmaydi.
   * `entriesKey` ostida: majburiyatlar yangilanganda u ham eskiradi.
   */
  recalcPreview: ({ month, entryIds } = {}) =>
    queryOptions({
      queryKey: [...entriesKey, "recalc", month, entryIds ?? null],
      queryFn: () =>
        payrollAPI
          .previewRecalc({ month, ...(entryIds ? { entryIds } : {}) })
          .then((r) => r.data.data),
      enabled: Boolean(month),
      retry: false,
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

  /** Oylik zayavkalari → `{ data, pagination, pendingCount }`. */
  requests: (params) =>
    queryOptions({
      queryKey: [...requestsKey, params],
      queryFn: () => payrollRequestsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Ushlab qolishlar registri → `{ data, pagination, totals }`. */
  deductions: (params) =>
    queryOptions({
      queryKey: [...deductionsKey, "list", params],
      queryFn: () => deductionsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Kimdan ushlab qolish mumkin — shu oyda oyligi borlar. */
  deductionCandidates: (month) =>
    queryOptions({
      queryKey: [...deductionsKey, "candidates", month],
      queryFn: () => deductionsAPI.candidates(month).then((r) => r.data.data),
      enabled: Boolean(month),
      placeholderData: keepPreviousData,
    }),

  /**
   * Jonli hisob. `draft` — KECHIKTIRILGAN qoralama (har harfda so'rov
   * ketmasligi uchun). `retry: false`: 400 — "hali to'liq emas" degani.
   */
  deductionPreview: (draft) =>
    queryOptions({
      queryKey: [...deductionsKey, "preview", draft],
      queryFn: () => deductionsAPI.preview(draft).then((r) => r.data.data),
      enabled: Boolean(draft),
      placeholderData: keepPreviousData,
      retry: false,
    }),

  /** Oylikni to'xtatish registri → `{ data, pagination, totals }`. */
  suspensions: (params) =>
    queryOptions({
      queryKey: [...suspensionsKey, "list", params],
      queryFn: () => suspensionsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Kimning oyligini to'xtatish mumkin — shu oyda oyligi borlar. */
  suspensionCandidates: (month) =>
    queryOptions({
      queryKey: [...suspensionsKey, "candidates", month],
      queryFn: () => suspensionsAPI.candidates(month).then((r) => r.data.data),
      enabled: Boolean(month),
      placeholderData: keepPreviousData,
    }),

  /** Bitta xodimning oylik qismlari — "aniq qo'shimcha" tanlovi. */
  suspensionUnits: (staffId, month) =>
    queryOptions({
      queryKey: [...suspensionsKey, "units", staffId, month],
      queryFn: () => suspensionsAPI.units(staffId, month).then((r) => r.data.data),
      enabled: Boolean(staffId) && Boolean(month),
    }),

  /** Jonli hisob (kechiktirilgan qoralama). `retry: false` — 400 "hali to'liq emas". */
  suspensionPreview: (draft) =>
    queryOptions({
      queryKey: [...suspensionsKey, "preview", draft],
      queryFn: () => suspensionsAPI.preview(draft).then((r) => r.data.data),
      enabled: Boolean(draft),
      placeholderData: keepPreviousData,
      retry: false,
    }),

  /** Oylik strukturasi audit qaydlari → `{ data, pagination }`. */
  audit: (params) =>
    queryOptions({
      queryKey: [...auditKey, params],
      queryFn: () => payrollRequestsAPI.getAudit(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
