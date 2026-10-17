// TanStack Query
import { queryOptions, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tasksAPI } from "@/features/tasks/api/tasks.api";

// Keys — topshiriqlar namespace'i ichida: boshqaruv tomonidagi o'zgarish
// (tasdiqlash, muddat uzaytirish) xodimning o'z ro'yxatini ham eskirtiradi.
import { tasksKeys } from "@/features/tasks/queries/tasks.queries";

export const myTasksQueries = {
  /**
   * Xodimning O'Z topshiriqlari — vaqt kesimi bo'yicha filtrlangan.
   *
   * ⚠️ Kesim SERVERDA (`state` parametri): sahifalangan ro'yxatni xotirada
   * filtrlash ikkinchi sahifadagi topshiriqni "yo'q" qilib ko'rsatardi.
   *
   * Javobda `submissionRules` ham keladi — ishni ro'yxatdan chiqmasdan
   * topshirish uchun ikkinchi so'rov kerak emas.
   *
   * @param {{ page: number, state?: string }} params
   */
  list: ({ page = 1, state = "all" } = {}) =>
    queryOptions({
      queryKey: [...tasksKeys.all, "my", page, state],
      queryFn: () => {
        const params = { page, limit: 20, sort: "due_asc" };
        if (state && state !== "all") params.state = state;
        return tasksAPI.getMy(params).then((r) => r.data);
      },
      placeholderData: keepPreviousData,
      // Vaqt oynasi jonli — uzoq kesh "hozir vaqti" belgisini eskirtirardi
      staleTime: 30 * 1000,
    }),
};

/**
 * Ishni tekshiruvga yuborish (multipart: isbot fayllari + izoh).
 * Topshiriq id'si payload bilan keladi — ro'yxatdan turib topshiriladi.
 */
export const useSubmitMyTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => tasksAPI.submitCompletion(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.all }),
  });
};

/**
 * TOPSHIRIQNI BOSHQA XODIMGA BIRIKTIRISH — ro'yxatdan chiqmasdan.
 *
 * ⚠️ MANBA RO'YXATDAN YO'QOLMAYDI: server YANGI topshiriq yaratadi,
 * ijrochini ko'chirmaydi — biriktirgan odam baribir javobgar. Shuning
 * uchun ro'yxat qayta o'qilganda topshiriq o'z joyida turadi, faqat
 * vaqt chizig'ida "kimga biriktirildi" degan iz paydo bo'ladi.
 */
export const useDelegateMyTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.delegate(id, data).then((r) => r.data),
    // Yangi topshiriq boshqaruv ro'yxatiga, hisoblagichlarga va
    // hisobotga ham tushadi — hammasi bitta namespace ostida
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKeys.all }),
  });
};
