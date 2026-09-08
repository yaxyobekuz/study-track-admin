// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { lessonHoursAPI, substitutionAPI } from "../api/lessonHours.api";

export const lessonHoursKeys = createQueryKeys("lessonHours");

const overviewKey = [...lessonHoursKeys.all, "overview"];
const ledgerKey = [...lessonHoursKeys.all, "ledger"];
const teacherKey = [...lessonHoursKeys.all, "teacher"];
const substitutionsKey = [...lessonHoursKeys.all, "substitutions"];

export const lessonHoursQueries = {
  /** Boshliq ko'rinishi → `{ totals, modes, series, topTeachers }`. */
  overview: (params) =>
    queryOptions({
      queryKey: [...overviewKey, params],
      queryFn: () => lessonHoursAPI.getOverview(params).then((r) => r.data.data),
      // Oy almashtirilganda ekran bo'shab qolmasin — eski raqam turadi
      placeholderData: keepPreviousData,
    }),

  /** Vedomost → `{ items, totals }`. Sahifalanmaydi. */
  ledger: (params) =>
    queryOptions({
      queryKey: [...ledgerKey, params],
      queryFn: () => lessonHoursAPI.getLedger(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta o'qituvchi → soat, kesimlar, o'rinbosarlik, tarix. */
  teacher: (teacherId, params) =>
    queryOptions({
      queryKey: [...teacherKey, teacherId, params],
      queryFn: () =>
        lessonHoursAPI.getTeacher(teacherId, params).then((r) => r.data.data),
      enabled: Boolean(teacherId),
    }),
};

export const substitutionQueries = {
  /** O'rinbosarlik ro'yxati → `{ data, pagination, totals }`. */
  list: (params) =>
    queryOptions({
      queryKey: [...substitutionsKey, params],
      queryFn: () => substitutionAPI.getList(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Tanlov ro'yxati — kamdan-kam o'zgaradi, uzoq saqlanadi. */
  teachers: () =>
    queryOptions({
      queryKey: [...substitutionsKey, "teachers"],
      queryFn: () => substitutionAPI.getTeachers().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    }),

  one: (id) =>
    queryOptions({
      queryKey: [...substitutionsKey, "one", id],
      queryFn: () => substitutionAPI.getOne(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * Ko'chirish mumkin bo'lgan darslar.
   *
   * ⚠️ `enabled` UCHALA shartga bog'liq: davr tanlanmaguncha so'rov
   * ketmaydi, chunki javob AYNAN o'sha davrga bog'liq (davrga tushmaydigan
   * hafta kunlari ro'yxatdan chiqariladi).
   */
  available: (teacherId, params) =>
    queryOptions({
      queryKey: [...substitutionsKey, "available", teacherId, params],
      queryFn: () =>
        substitutionAPI.getAvailable(teacherId, params).then((r) => r.data.data),
      enabled: Boolean(teacherId && params?.fromDate && params?.toDate),
    }),
};
