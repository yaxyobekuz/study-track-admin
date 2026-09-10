// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import {
  diagnosticQuestionsAPI,
  diagnosticTestsAPI,
  diagnosticAttemptsAPI,
  diagnosticAnalyticsAPI,
  diagnosticSettingsAPI,
} from "../api/diagnostics.api";

export const diagnosticsKeys = createQueryKeys("diagnostics");

/** Sozlamalar va bank qamrovi — kam o'zgaradigan ma'lumot. */
const REFERENCE_STALE_TIME = 10 * 60 * 1000;

/**
 * Tahlil so'rovlari qimmatroq (bir necha yig'ma), lekin ular ham
 * real vaqt talab qilmaydi — 2 daqiqa yetarli.
 */
const ANALYTICS_STALE_TIME = 2 * 60 * 1000;

// ── SAVOLLAR BANKI ───────────────────────────

export const questionKeys = {
  all: [...diagnosticsKeys.all, "questions"],
  lists: () => [...questionKeys.all, "list"],
  list: (params) => [...questionKeys.all, "list", params],
  detail: (id) => [...questionKeys.all, "detail", id],
  stats: () => [...questionKeys.all, "stats"],
  coverage: (subjectId) => [...questionKeys.all, "coverage", subjectId ?? null],
};

export const questionQueries = {
  list: (params = {}) =>
    queryOptions({
      queryKey: questionKeys.list(params),
      queryFn: () => diagnosticQuestionsAPI.getAll(params).then((r) => r.data),
      // Sahifalashda eski ro'yxat ekranda qoladi — jadval "sakramaydi".
      placeholderData: keepPreviousData,
    }),

  detail: (id) =>
    queryOptions({
      queryKey: questionKeys.detail(id),
      queryFn: () => diagnosticQuestionsAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  stats: () =>
    queryOptions({
      queryKey: questionKeys.stats(),
      queryFn: () => diagnosticQuestionsAPI.getStats().then((r) => r.data.data),
      staleTime: ANALYTICS_STALE_TIME,
    }),

  coverage: (subjectId) =>
    queryOptions({
      queryKey: questionKeys.coverage(subjectId),
      queryFn: () =>
        diagnosticQuestionsAPI.getCoverage(subjectId).then((r) => r.data.data),
      staleTime: ANALYTICS_STALE_TIME,
    }),
};

// ── TESTLAR ──────────────────────────────────

export const testKeys = {
  all: [...diagnosticsKeys.all, "tests"],
  lists: () => [...testKeys.all, "list"],
  list: (params) => [...testKeys.all, "list", params],
  detail: (id) => [...testKeys.all, "detail", id],
  availability: (id) => [...testKeys.all, "availability", id],
  mine: () => [...testKeys.all, "mine"],
};

export const testQueries = {
  list: (params = {}) =>
    queryOptions({
      queryKey: testKeys.list(params),
      queryFn: () => diagnosticTestsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  detail: (id) =>
    queryOptions({
      queryKey: testKeys.detail(id),
      queryFn: () => diagnosticTestsAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  availability: (id) =>
    queryOptions({
      queryKey: testKeys.availability(id),
      queryFn: () =>
        diagnosticTestsAPI.getAvailability(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  mine: () =>
    queryOptions({
      queryKey: testKeys.mine(),
      queryFn: () => diagnosticTestsAPI.mine().then((r) => r.data.data),
    }),
};

// ── URINISHLAR ───────────────────────────────

export const attemptKeys = {
  all: [...diagnosticsKeys.all, "attempts"],
  lists: () => [...attemptKeys.all, "list"],
  list: (params) => [...attemptKeys.all, "list", params],
  result: (id) => [...attemptKeys.all, "result", id],
  insights: (id) => [...attemptKeys.all, "insights", id],
  mine: () => [...attemptKeys.all, "mine"],
  active: (id) => [...attemptKeys.all, "active", id],
};

export const attemptQueries = {
  list: (params = {}) =>
    queryOptions({
      queryKey: attemptKeys.list(params),
      queryFn: () => diagnosticAttemptsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  result: (id) =>
    queryOptions({
      queryKey: attemptKeys.result(id),
      queryFn: () => diagnosticAttemptsAPI.getResult(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * AI tahlili — FONDA tayyorlanadi, shuning uchun tayyor bo'lgunicha
   * so'rab turiladi.
   *
   * ⚠️ POLLING TAYYOR BO'LGACH TO'XTAYDI (`refetchInterval` funksiyasi
   * `false` qaytaradi). Doimiy interval sahifa ochiq turgan har daqiqada
   * bekorga so'rov yuborardi.
   */
  insights: (id) =>
    queryOptions({
      queryKey: attemptKeys.insights(id),
      queryFn: () => diagnosticAttemptsAPI.getInsights(id).then((r) => r.data.data),
      enabled: Boolean(id),
      refetchInterval: (query) => {
        const rows = query.state.data;
        // ⚠️ BO'SH RO'YXATDA POLLING QILINMAYDI. Tahlil so'ralmagan
        // urinishda (masalan import qilingan yoki eski natijada) qator
        // umuman bo'lmaydi — ilgari bu holat "hali tayyor emas" deb
        // o'qilib, sahifa ochiq turgan har 3 soniyada bekorga so'rov
        // yuborardi va ekranda abadiy "tayyorlanmoqda" turardi.
        // Qatorlar `requestAnalysis` da SINXRON yaratiladi, ya'ni
        // haqiqiy kutish holatida ular albatta bo'ladi.
        if (!Array.isArray(rows) || rows.length === 0) return false;
        const pending = rows.some((row) =>
          ["queued", "processing"].includes(row.status),
        );
        return pending ? 3000 : false;
      },
    }),

  mine: (limit) =>
    queryOptions({
      queryKey: [...attemptKeys.mine(), limit ?? null],
      queryFn: () => diagnosticAttemptsAPI.mine(limit).then((r) => r.data.data),
    }),

  active: (id) =>
    queryOptions({
      queryKey: attemptKeys.active(id),
      queryFn: () => diagnosticAttemptsAPI.getActive(id).then((r) => r.data.data),
      enabled: Boolean(id),
      // Test topshirilayotgan paytda eski nusxa ko'rsatilmasin.
      staleTime: 0,
      gcTime: 0,
    }),
};

// ── TAHLIL ───────────────────────────────────

export const analyticsKeys = {
  all: [...diagnosticsKeys.all, "analytics"],
  summary: (params) => [...analyticsKeys.all, "summary", params],
  trend: (params) => [...analyticsKeys.all, "trend", params],
  cut: (view, params) => [...analyticsKeys.all, "cut", view, params],
  participation: (params) => [...analyticsKeys.all, "participation", params],
  classParticipation: (params) => [
    ...analyticsKeys.all,
    "class-participation",
    params,
  ],
  today: () => [...analyticsKeys.all, "today"],
  classDetail: (classId, params) => [
    ...analyticsKeys.all,
    "class-detail",
    classId,
    params,
  ],
  studentDashboard: (studentId) => [
    ...analyticsKeys.all,
    "student-dashboard",
    studentId,
  ],
  student: (studentId, params) => [
    ...analyticsKeys.all,
    "student",
    studentId,
    params,
  ],
};

const CUT_FETCHERS = {
  subjects: diagnosticAnalyticsAPI.subjects,
  topics: diagnosticAnalyticsAPI.topics,
  classes: diagnosticAnalyticsAPI.classes,
  students: diagnosticAnalyticsAPI.students,
};

export const analyticsQueries = {
  summary: (params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.summary(params),
      queryFn: () => diagnosticAnalyticsAPI.summary(params).then((r) => r.data.data),
      staleTime: ANALYTICS_STALE_TIME,
      placeholderData: keepPreviousData,
    }),

  trend: (params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.trend(params),
      queryFn: () => diagnosticAnalyticsAPI.trend(params).then((r) => r.data.data),
      staleTime: ANALYTICS_STALE_TIME,
      placeholderData: keepPreviousData,
    }),

  /** Bitta kesim (`subjects` | `topics` | `classes` | `students`). */
  cut: (view, params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.cut(view, params),
      queryFn: () => CUT_FETCHERS[view](params).then((r) => r.data.data),
      enabled: Boolean(CUT_FETCHERS[view]),
      staleTime: ANALYTICS_STALE_TIME,
      placeholderData: keepPreviousData,
    }),

  participation: (params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.participation(params),
      queryFn: () =>
        diagnosticAnalyticsAPI.participation(params).then((r) => r.data.data),
      staleTime: ANALYTICS_STALE_TIME,
    }),

  classDetail: (classId, params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.classDetail(classId, params),
      queryFn: () =>
        diagnosticAnalyticsAPI.classDetail(classId, params).then((r) => r.data.data),
      enabled: Boolean(classId),
      staleTime: ANALYTICS_STALE_TIME,
      placeholderData: keepPreviousData,
    }),

  classParticipation: (params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.classParticipation(params),
      queryFn: () =>
        diagnosticAnalyticsAPI.classParticipation(params).then((r) => r.data.data),
      staleTime: ANALYTICS_STALE_TIME,
      placeholderData: keepPreviousData,
    }),

  /**
   * "Bugun" kartalari.
   *
   * ⚠️ KALITDA PARAMETR YO'Q va bo'lmasligi ham kerak: oraliq
   * o'zgarganda bu blok qayta so'ralmaydi, chunki u oraliqqa
   * bog'liq emas.
   */
  today: () =>
    queryOptions({
      queryKey: analyticsKeys.today(),
      queryFn: () => diagnosticAnalyticsAPI.today().then((r) => r.data.data),
      staleTime: 60 * 1000,
    }),

  studentDashboard: (studentId) =>
    queryOptions({
      queryKey: analyticsKeys.studentDashboard(studentId),
      queryFn: () =>
        diagnosticAnalyticsAPI.studentDashboard(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
      staleTime: ANALYTICS_STALE_TIME,
    }),

  student: (studentId, params = {}) =>
    queryOptions({
      queryKey: analyticsKeys.student(studentId, params),
      queryFn: () =>
        diagnosticAnalyticsAPI
          .studentProfile(studentId, params)
          .then((r) => r.data.data),
      enabled: Boolean(studentId),
      staleTime: ANALYTICS_STALE_TIME,
    }),
};

// ── SOZLAMALAR ───────────────────────────────

export const settingsKeys = {
  all: [...diagnosticsKeys.all, "settings"],
};

export const settingsQueries = {
  get: () =>
    queryOptions({
      queryKey: settingsKeys.all,
      queryFn: () => diagnosticSettingsAPI.get().then((r) => r.data.data),
      staleTime: REFERENCE_STALE_TIME,
    }),
};
