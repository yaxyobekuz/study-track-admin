// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { enrollmentAPI } from "../api/enrollment.api";

export const enrollmentKeys = createQueryKeys("enrollment");

export const enrollmentQueries = {
  /** Bitta o'quvchining davrlari + hozirgi holati + joriy oy ulushi. */
  forStudent: (studentId) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "student", studentId],
      queryFn: () => enrollmentAPI.getForStudent(studentId).then((r) => r.data.data),
      enabled: Boolean(studentId),
    }),

  /**
   * Davr shu sanalar bilan saqlansa hisob-fakturalar bilan NIMA bo'ladi:
   * to'liq to'lanadigan ketish oyi va bekor qilinadigan oylar. Yopish va
   * tahrirlash oynasi saqlashdan oldin ko'rsatadi.
   *
   * @param {string} id - davr id
   * @param {{startDate?: string, endDate?: string|null}} data
   */
  preview: (id, data) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "preview", id, data],
      queryFn: () => enrollmentAPI.preview(id, data).then((r) => r.data.data),
      enabled: Boolean(id),
      placeholderData: keepPreviousData,
      // Noto'g'ri sana 400 qaytaradi — qayta urinish foydasiz
      retry: false,
    }),

  /**
   * CHIQIB KETGANLAR REGISTRI — sahifalangan ro'yxat + kesimlar.
   *
   * Javobda `data`/`pagination` dan tashqari `stats` (sabab kesimi) va
   * `byMonth` (oylar) ham keladi, shuning uchun `r.data` TO'LIQ olinadi.
   */
  departures: (params) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "departures", params],
      queryFn: () => enrollmentAPI.getDepartures(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bosh sahifadagi karta (oxirgi 30 kun + so'nggi 5 ketish). */
  departureSummary: () =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "departures", "summary"],
      queryFn: () => enrollmentAPI.getDepartureSummary().then((r) => r.data.data),
    }),

  /**
   * O'QUVCHILAR HARAKATI — to'liq hisobot (ko'rsatkichlar, oylar kesimi,
   * kelganlar va ketganlar ro'yxati). Word fayli ham AYNI ma'lumotdan
   * quriladi, shuning uchun ekranda va faylda bir xil raqam turadi.
   */
  movement: (params) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "movement", params],
      queryFn: () => enrollmentAPI.getMovement(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
    }),

  /** Bosh sahifadagi "O'quvchilar" kartasi — joriy oy va joriy yil. */
  movementSummary: () =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "movement", "summary"],
      queryFn: () =>
        enrollmentAPI.getMovementSummary().then((r) => r.data.data),
    }),

  /** Umumiy ro'yxat (sahifalangan) — kelajakdagi alohida ekran uchun. */
  list: (params) =>
    queryOptions({
      queryKey: [...enrollmentKeys.all, "list", params],
      queryFn: () => enrollmentAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};
