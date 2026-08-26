// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { staffSalariesAPI, payrollAPI } from "../api/payroll.api";

export const payrollKeys = createQueryKeys("payroll");

const salariesKey = [...payrollKeys.all, "salaries"];
const entriesKey = [...payrollKeys.all, "entries"];
const paymentsKey = [...payrollKeys.all, "payments"];

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
};
