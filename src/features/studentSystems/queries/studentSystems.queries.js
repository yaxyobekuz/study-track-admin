// TanStack Query
import { queryOptions, keepPreviousData } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { studentSystemsAPI } from "../api/studentSystems.api";

export const studentSystemsKeys = createQueryKeys("studentSystems");

export const studentSystemsQueries = {
  /**
   * O'quvchilar ro'yxati — ERP va Kundalik.com belgilari bilan. Javob to'liq
   * qaytadi (`data`, `pagination`, `summary`): kartalardagi sanoq ham shu
   * so'rovdan.
   */
  list: (params) =>
    queryOptions({
      queryKey: studentSystemsKeys.list(params),
      queryFn: () => studentSystemsAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),

  /**
   * BOSH SAHIFADAGI KARTA — "nechtasi ERP da, nechtasi Kundalik.com da".
   *
   * ⚠️ Ro'yxat so'rovidan (`list`) ALOHIDA: u sahifalangan jadval uchun
   * o'quvchilarni ham yuklaydi, karta esa faqat sanoqchi kutadi.
   */
  summary: () =>
    queryOptions({
      queryKey: [...studentSystemsKeys.all, "summary"],
      queryFn: () => studentSystemsAPI.getSummary().then((r) => r.data.data),
    }),

  /**
   * HISOBOT — ko'rsatkichlar, sinflar kesimi va kiritilmaganlar ro'yxati.
   * Word fayli ham AYNI ma'lumotdan quriladi, shuning uchun ekranda va
   * faylda bir xil raqam turadi.
   */
  report: () =>
    queryOptions({
      queryKey: [...studentSystemsKeys.all, "report"],
      queryFn: () => studentSystemsAPI.getReport().then((r) => r.data.data),
    }),
};
