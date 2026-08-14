// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { tariffsAPI, studentTariffsAPI } from "../api/finance.api";
import {
  invoicesAPI,
  invoicePaymentsAPI,
  financeStatusAPI,
  financeSettingsAPI,
} from "../api/invoices.api";

export const financeKeys = createQueryKeys("finance");

// Sub-resurslar `all` dan kengaytiriladi — bitta invalidatsiya butun
// bo'limni yangilashi uchun (narx yoki to'lov o'zgarsa hisoblangan summalar
// ham eskiradi).
const tariffsKey = [...financeKeys.all, "tariffs"];
const assignmentsKey = [...financeKeys.all, "student-tariffs"];
const invoicesKey = [...financeKeys.all, "invoices"];
const statusesKey = [...financeKeys.all, "statuses"];
const settingsKey = [...financeKeys.all, "settings"];

export const financeQueries = {
  /** Tariflar katalogi (sahifalangan) → `{ data, pagination }`. */
  tariffList: (params) =>
    queryOptions({
      queryKey: [...tariffsKey, "list", params],
      queryFn: () => tariffsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta tarif — narx tarixi, bo'shliqlar va biriktirishlar soni bilan. */
  tariffDetail: (id, params) =>
    queryOptions({
      queryKey: [...tariffsKey, "detail", id, params],
      queryFn: () => tariffsAPI.getById(id, params).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Biriktirilishi mumkin bo'lgan tariflar (modal select uchun).
   * Arxivlanganlar chiqmaydi — ularni biriktirib bo'lmaydi.
   */
  assignableTariffs: () =>
    queryOptions({
      queryKey: [...tariffsKey, "assignable"],
      queryFn: () =>
        tariffsAPI
          .getAll({ isActive: "true", limit: 200 })
          .then((r) => r.data.data ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  /** O'quvchi tariflari (sahifalangan) → `{ data, pagination, month }`. */
  assignmentList: (params) =>
    queryOptions({
      queryKey: [...assignmentsKey, "list", params],
      queryFn: () => studentTariffsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta o'quvchining tarif tarixi (foydalanuvchi detali uchun). */
  studentTariffHistory: (studentId) =>
    queryOptions({
      queryKey: [...assignmentsKey, "student", studentId],
      queryFn: () =>
        studentTariffsAPI.getStudentHistory(studentId).then((r) => r.data),
      enabled: Boolean(studentId),
    }),

  // ── Hisob-fakturalar ───────────────────────

  /** Majburiyatlar ro'yxati → `{ data, pagination, totals }`. */
  invoiceList: (params) =>
    queryOptions({
      queryKey: [...invoicesKey, "list", params],
      queryFn: () => invoicesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Oylik yig'ma: kartalar va "shakllantirish mumkinmi?" uchun. */
  invoiceSummary: (month) =>
    queryOptions({
      queryKey: [...invoicesKey, "summary", month],
      queryFn: () =>
        invoicesAPI.getSummary({ month }).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta hisob-faktura — to'lovlari bilan. */
  invoiceDetail: (id) =>
    queryOptions({
      queryKey: [...invoicesKey, "detail", id],
      queryFn: () => invoicesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /** O'quvchining o'quv yili bo'yicha majburiyatlari va qarzi. */
  studentInvoices: (studentId, params) =>
    queryOptions({
      queryKey: [...invoicesKey, "student", studentId, params],
      queryFn: () =>
        invoicesAPI.getForStudent(studentId, params).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /** To'lovlar registri. */
  paymentList: (params) =>
    queryOptions({
      queryKey: [...financeKeys.all, "payments", params],
      queryFn: () => invoicePaymentsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  // ── Moliyaviy holat ────────────────────────

  /** Bitta o'quvchining holat tarixi + joriy holati. */
  studentFinanceStatus: (studentId) =>
    queryOptions({
      queryKey: [...statusesKey, "student", studentId],
      queryFn: () =>
        financeStatusAPI.getForStudent(studentId).then((r) => r.data),
      enabled: Boolean(studentId),
    }),

  // ── Sozlamalar ─────────────────────────────

  settings: () =>
    queryOptions({
      queryKey: settingsKey,
      queryFn: () => financeSettingsAPI.get().then((r) => r.data.data),
    }),

  /** O'quv yili oylari — oy tanlagichi uchun. */
  academicYear: (params) =>
    queryOptions({
      queryKey: [...settingsKey, "academic-year", params],
      queryFn: () =>
        financeSettingsAPI.getAcademicYear(params).then((r) => r.data.data),
    }),
};

export { tariffsKey, assignmentsKey, invoicesKey, statusesKey, settingsKey };
