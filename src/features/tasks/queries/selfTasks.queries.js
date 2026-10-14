// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { selfTasksAPI } from "../api/selfTasks.api";

/**
 * XODIM O'ZIGA O'ZI BELGILAGAN TOPSHIRIQLAR — o'z namespace'i.
 *
 * ⚠️ `tasksKeys` DAN ALOHIDA. Server tomonda ikki oqim bir jadvalda
 * yashaydi, lekin ro'yxatlari ARALASHMAYDI (`self_assigned`) — kesh ham
 * shunday bo'lishi kerak: Lavozimlar markazidagi tasdiqlash yoki muddat
 * uzaytirish shaxsiy ro'yxatni eskirtirmaydi va teskarisi ham. Bitta
 * namespace bo'lsa, har bir amal ikkala bo'limning hamma so'rovini
 * qaytadan yuklab turardi.
 */
export const selfTasksKeys = createQueryKeys("selfTasks");

export const selfTasksQueries = {
  /**
   * XODIMNING O'Z RO'YXATI — vaqt kesimi bo'yicha.
   *
   * ⚠️ Kesim SERVERDA (`state`): sahifalangan ro'yxatni xotirada filtrlash
   * ikkinchi sahifadagi topshiriqni "yo'q" qilib ko'rsatardi.
   *
   * Javobda `submissionRules` ham keladi — ro'yxatdan chiqmasdan yakunlash
   * uchun ikkinchi so'rov kerak emas.
   *
   * @param {{ page?: number, state?: string, kind?: string }} params
   */
  my: ({ page = 1, state = "all", kind = "all" } = {}) =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "my", page, state, kind],
      queryFn: () => {
        const params = { page, limit: 20, sort: "due_asc" };
        if (state && state !== "all") params.state = state;
        if (kind && kind !== "all") params.kind = kind;
        return selfTasksAPI.getMy(params).then((r) => r.data);
      },
      placeholderData: keepPreviousData,
      // Vaqt oynasi jonli — uzoq kesh "hozir vaqti" belgisini eskirtirardi
      staleTime: 30 * 1000,
    }),

  /** Xodimning o'z hisoblagichlari (ro'yxat tepasidagi kartalar). */
  myStats: () =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "my", "stats"],
      queryFn: () => selfTasksAPI.getStats().then((r) => r.data.data),
      staleTime: 30 * 1000,
    }),

  /** Xodimning o'z doimiy (takrorlanuvchi) ishlari. */
  myRules: ({ page = 1, status = "active" } = {}) =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "my", "rules", page, status],
      queryFn: () => selfTasksAPI.getMyRules({ page, limit: 20, status }).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Bitta shaxsiy topshiriq (o'zining). */
  detail: (id) =>
    queryOptions({
      queryKey: selfTasksKeys.detail(id),
      queryFn: () => selfTasksAPI.getById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),

  /**
   * BOSHQARUVCHI DASHBOARDI (`tasks.self`) — Lavozimlar markazi hisobot
   * dvigatelining AYNI payload'i, faqat shaxsiy oqim kesimida.
   *
   * ⚠️ Yetakchilar, rollar va topshiriq beruvchilar kesimi KELMAYDI: ular
   * `tasks.reports` ortidagi qism (server `full: false` bilan chaqiradi).
   *
   * @param {{ period: "day"|"week"|"month"|"year" }} params
   */
  overview: (params) =>
    queryOptions({
      queryKey: [...selfTasksKeys.all, "overview", params],
      queryFn: () => selfTasksAPI.getOverview(params).then((r) => r.data.data),
      placeholderData: keepPreviousData,
      // Jonli ro'yxatlar payload ichida — uzoq kesh ularni eskirtirardi
      staleTime: 30 * 1000,
    }),

  /** Boshqaruvchi ro'yxati — xodim / holat / vaqt holati / tur / qidiruv. */
  all: (params) =>
    queryOptions({
      queryKey: selfTasksKeys.list(params),
      queryFn: () => selfTasksAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /** Boshqaruvchi bitta shaxsiy topshiriqni ochadi (faqat ko'rish). */
  anyDetail: (id) =>
    queryOptions({
      queryKey: [...selfTasksKeys.details(), "any", id],
      queryFn: () => selfTasksAPI.getAnyById(id).then((r) => r.data.data),
      enabled: Boolean(id),
    }),
};
