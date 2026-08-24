// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { tariffsAPI, studentTariffsAPI } from "../api/finance.api";
import {
  invoicesAPI,
  paymentsAPI,
  paymentAccountsAPI,
  studentAccountsAPI,
  discountsAPI,
  vacationMonthsAPI,
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
const paymentsKey = [...financeKeys.all, "payments"];
const accountsKey = [...financeKeys.all, "accounts"];
const depositsKey = [...financeKeys.all, "deposits"];
const discountsKey = [...financeKeys.all, "discounts"];
const vacationsKey = [...financeKeys.all, "vacations"];
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

  /** Qarzdorlar registri → `{ data, pagination, totals }`. */
  debtors: (params) =>
    queryOptions({
      queryKey: [...invoicesKey, "debtors", params],
      queryFn: () => invoicesAPI.getDebtors(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** O'quvchining o'quv yili bo'yicha majburiyatlari va qarzi. */
  studentInvoices: (studentId, params) =>
    queryOptions({
      queryKey: [...invoicesKey, "student", studentId, params],
      queryFn: () =>
        invoicesAPI.getForStudent(studentId, params).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /** Hisob-fakturaga tushgan to'lovlar (chek raqami bilan). */
  invoicePayments: (id) =>
    queryOptions({
      queryKey: [...invoicesKey, "payments", id],
      queryFn: () => invoicesAPI.getPayments(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  // ── To'lovlar (cheklar) ───────────────────

  /** To'lovlar registri → `{ data, pagination, totals }`. */
  paymentList: (params) =>
    queryOptions({
      queryKey: [...paymentsKey, "list", params],
      queryFn: () => paymentsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta chek — taqsimotlari bilan. */
  paymentDetail: (id) =>
    queryOptions({
      queryKey: [...paymentsKey, "detail", id],
      queryFn: () => paymentsAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /** Bitta o'quvchining to'lov tarixi. */
  studentPayments: (studentId) =>
    queryOptions({
      queryKey: [...paymentsKey, "student", studentId],
      queryFn: () => paymentsAPI.getForStudent(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  // ── To'lov turlari ───────────────────────

  /** To'lov turlari ro'yxati (sahifalanmaydi) → `{ items, totals }`. */
  accountList: (params) =>
    queryOptions({
      queryKey: [...accountsKey, "list", params],
      queryFn: () => paymentAccountsAPI.getAll(params).then((r) => r.data),
    }),

  /** To'lov qabul qilish uchun faol to'lov turlari (modal select). */
  activeAccounts: () =>
    queryOptions({
      queryKey: [...accountsKey, "active"],
      queryFn: () =>
        paymentAccountsAPI
          .getAll({ status: "active" })
          .then((r) => r.data.items ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  /** Kassa hisoboti — "qaysi hisobga qancha tushdi". */
  accountReport: (params) =>
    queryOptions({
      queryKey: [...accountsKey, "report", params],
      queryFn: () => paymentAccountsAPI.getReport(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta to'lov turining daftari (seq bo'yicha, balanceAfter ustuni bilan). */
  accountEntries: (id, params) =>
    queryOptions({
      queryKey: [...accountsKey, "entries", id, params],
      queryFn: () => paymentAccountsAPI.getEntries(id, params).then((r) => r.data),
      enabled: Boolean(id),
      placeholderData: keepPreviousData,
    }),

  /** To'lov turlari orasidagi o'tkazmalar. */
  transferList: (params) =>
    queryOptions({
      queryKey: [...accountsKey, "transfers", params],
      queryFn: () => paymentAccountsAPI.getTransfers(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  // ── Depozit ────────────────────────────────

  /** O'quvchining qoldig'i va joriy qarzi. */
  studentAccount: (studentId) =>
    queryOptions({
      queryKey: [...depositsKey, "account", studentId],
      queryFn: () => studentAccountsAPI.get(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /** Depozit harakatlari (hosila — alohida jadval yo'q). */
  studentMovements: (studentId) =>
    queryOptions({
      queryKey: [...depositsKey, "movements", studentId],
      queryFn: () =>
        studentAccountsAPI.getMovements(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  // ── Chegirmalar ────────────────────────────

  /** Chegirma katalogi → `{ data, pagination }`. */
  discountList: (params) =>
    queryOptions({
      queryKey: [...discountsKey, "list", params],
      queryFn: () => discountsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Biriktirilishi mumkin bo'lgan chegirmalar (modal select). */
  assignableDiscounts: () =>
    queryOptions({
      queryKey: [...discountsKey, "assignable"],
      queryFn: () =>
        discountsAPI
          .getAll({ status: "active", limit: 200 })
          .then((r) => r.data.data ?? []),
      staleTime: 10 * 60 * 1000,
    }),

  /** Chegirma biriktirishlari → `{ data, pagination, month }`. */
  discountAssignments: (params) =>
    queryOptions({
      queryKey: [...discountsKey, "assignments", params],
      queryFn: () => discountsAPI.getAssignments(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta o'quvchining chegirmalari (joriy + tarix). */
  studentDiscounts: (studentId) =>
    queryOptions({
      queryKey: [...discountsKey, "student", studentId],
      queryFn: () => discountsAPI.getForStudent(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  // ── Ta'til oylari ──────────────────────────

  /** O'quv yili oylari, har biri ta'til bayrog'i bilan. */
  vacationMonths: (params) =>
    queryOptions({
      queryKey: [...vacationsKey, params],
      queryFn: () => vacationMonthsAPI.getAll(params).then((r) => r.data.data),
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

export {
  tariffsKey,
  assignmentsKey,
  invoicesKey,
  paymentsKey,
  accountsKey,
  depositsKey,
  discountsKey,
  vacationsKey,
  statusesKey,
  settingsKey,
};
