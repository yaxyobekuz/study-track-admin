// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import {
  devicesAPI,
  devicePoliciesAPI,
  deviceAppsAPI,
  deviceUnlocksAPI,
  deviceReportsAPI,
} from "../api/devices.api";

export const devicesKeys = createQueryKeys("devices");

const dashboardKey = [...devicesKeys.all, "dashboard"];
const policiesKey = [...devicesKeys.all, "policies"];
const assignmentsKey = [...devicesKeys.all, "assignments"];
const appsKey = [...devicesKeys.all, "apps"];
const unlocksKey = [...devicesKeys.all, "unlocks"];
const usageKey = [...devicesKeys.all, "usage"];
const studentKey = [...devicesKeys.all, "student"];
const settingsKey = [...devicesKeys.all, "settings"];
const auditKey = [...devicesKeys.all, "audit"];
const codeKey = [...devicesKeys.all, "code"];

export const devicesQueries = {
  /** Manzara: qamrov, qurilmalar holati, bugungi ekran vaqti. */
  dashboard: (params) =>
    queryOptions({
      queryKey: [...dashboardKey, params],
      queryFn: () => deviceReportsAPI.getDashboard(params).then((r) => r.data.data),
      // Davr almashtirilganda ekran bo'shab qolmasin
      placeholderData: keepPreviousData,
    }),

  /**
   * Qurilmalar ro'yxati — SAHIFALANGAN.
   * ⚠️ `r.data` (butun javob), `r.data.data` EMAS: qidiruv va filtrlar
   * server tomonda ishlaydi, shuning uchun `pagination` ham kerak.
   */
  list: (params) =>
    queryOptions({
      queryKey: devicesKeys.list(params),
      queryFn: () => devicesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  detail: (id) =>
    queryOptions({
      queryKey: devicesKeys.detail(id),
      queryFn: () => devicesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  policies: (params) =>
    queryOptions({
      queryKey: [...policiesKey, params],
      queryFn: () => devicePoliciesAPI.getAll(params).then((r) => r.data.data),
    }),

  policy: (id) =>
    queryOptions({
      queryKey: [...policiesKey, "detail", id],
      queryFn: () => devicePoliciesAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * "Nechta o'quvchiga ta'sir qiladi".
   *
   * ⚠️ `staleTime: 0` — bu raqam biriktirishdan OLDIN ko'rsatiladi va
   * eskirgani yaramaydi: admin "12 ta o'quvchi" deb o'qib, aslida 300
   * tasining telefonini qulflab qo'yishi mumkin edi.
   */
  policyImpact: (id) =>
    queryOptions({
      queryKey: [...policiesKey, "impact", id],
      queryFn: () => devicePoliciesAPI.impact(id).then((r) => r.data.data),
      enabled: Boolean(id),
      staleTime: 0,
    }),

  assignments: (params) =>
    queryOptions({
      queryKey: [...assignmentsKey, params],
      queryFn: () => devicePoliciesAPI.getAssignments(params).then((r) => r.data.data),
    }),

  apps: (params) =>
    queryOptions({
      queryKey: [...appsKey, params],
      // ⚠️ `r.data` (BUTUN javob), `r.data.data` EMAS: javobda ro'yxatdan
      // tashqari `pagination`, `discovered` va `discoveredTotal` ham bor.
      queryFn: () => deviceAppsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * Siyosat muharriri uchun ilovalar ro'yxati.
   * Kamdan-kam o'zgaradi — uzunroq `staleTime` (ma'lumotnoma qoidasi).
   */
  appOptions: () =>
    queryOptions({
      queryKey: [...appsKey, "options"],
      queryFn: () => deviceAppsAPI.getOptions().then((r) => r.data.data),
      staleTime: 10 * 60 * 1000,
    }),

  /** Vaqtinchalik ruxsatlar registri — sahifalangan. */
  unlocks: (params) =>
    queryOptions({
      queryKey: [...unlocksKey, params],
      queryFn: () => deviceUnlocksAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  usage: (params) =>
    queryOptions({
      queryKey: [...usageKey, params],
      queryFn: () => deviceReportsAPI.getUsage(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  studentOverview: (studentId, params) =>
    queryOptions({
      queryKey: [...studentKey, studentId, params],
      queryFn: () =>
        deviceReportsAPI.getStudentOverview(studentId, params).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /** Oynalardagi o'quvchi tanlagichi. */
  students: (params) =>
    queryOptions({
      queryKey: [...devicesKeys.all, "students", params],
      queryFn: () => devicesAPI.searchStudents(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
    }),

  settings: () =>
    queryOptions({
      queryKey: settingsKey,
      queryFn: () => devicesAPI.getSettings().then((r) => r.data.data),
    }),

  /** Qisqa tasma (dashboard, o'quvchi kartasi) — massiv qaytadi. */
  audit: (params) =>
    queryOptions({
      queryKey: [...auditKey, params],
      queryFn: () => devicesAPI.getAudit(params).then((r) => r.data.data),
    }),

  /** To'liq registr — sahifalangan (`paginate=true`). */
  auditPage: (params) =>
    queryOptions({
      queryKey: [...auditKey, "page", params],
      queryFn: () =>
        devicesAPI.getAudit({ ...params, paginate: "true" }).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * O'quvchining amaldagi biriktirish kodi.
   *
   * ⚠️ KESHLANMAYDI (`staleTime: 0`, `gcTime: 0`): kod qisqa muddatli va
   * bir martalik. Eski kod ekranda turib qolsa, o'quvchi uni kiritib
   * "kod ishlamayapti" degan xulosaga kelardi.
   */
  studentCode: (studentId) =>
    queryOptions({
      queryKey: [...codeKey, studentId],
      queryFn: () => devicesAPI.getStudentCode(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
      staleTime: 0,
      gcTime: 0,
    }),
};
