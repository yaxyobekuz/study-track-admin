// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import {
  staffSalariesAPI,
  payrollAPI,
  salaryRequestsAPI,
  departmentsAPI,
  positionsAPI,
  salaryCategoriesAPI,
  payrollViewAPI,
} from "../api/payroll.api";

export const payrollKeys = createQueryKeys("payroll");

const salariesKey = [...payrollKeys.all, "salaries"];
const entriesKey = [...payrollKeys.all, "entries"];
const paymentsKey = [...payrollKeys.all, "payments"];
const requestsKey = [...payrollKeys.all, "salary-requests"];
const deptKey = [...payrollKeys.all, "departments"];
const posKey = [...payrollKeys.all, "positions"];
const categoriesKey = [...payrollKeys.all, "categories"];
const viewKey = [...payrollKeys.all, "view"];

export const payrollQueries = {
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

  /** Oylik so'rovlari → `{ data, pagination, pendingCount }`. */
  salaryRequests: (params) =>
    queryOptions({
      queryKey: [...requestsKey, params],
      queryFn: () => salaryRequestsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  // ── Oylik STRUKTURASI (bo'lim / lavozim / toifa) ──
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

  /** Toifa o'qituvchilari + hisoblangan oylik. */
  teacherPayroll: (params) =>
    queryOptions({
      queryKey: [...viewKey, "teachers", params],
      queryFn: () => payrollViewAPI.teachers(params).then((r) => r.data),
      enabled: Boolean(params?.categoryId),
      placeholderData: keepPreviousData,
    }),

  /** Malaka toifalari (soatlik stavka) — status bo'yicha. */
  categories: (params) =>
    queryOptions({
      queryKey: [...categoriesKey, params],
      queryFn: () => salaryCategoriesAPI.getAll(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),
};
