// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { plannerAPI } from "../api/planner.api";

// Queries
import { plannerKeys } from "./planner.queries";

/**
 * Rejalashtirish kirimlari bir-biriga bog'liq: soat o'zgarsa tayyorgarlik
 * tekshiruvi ham, sig'im hisobi ham o'zgaradi. Shuning uchun kirim tegilganda
 * butun bo'lim yangilanadi — mayda-chuyda kalitlarni qo'lda sanab chiqishdan
 * ko'ra shu ishonchliroq (bo'limda bir nechta yengil so'rov bor, xolos).
 */
const useInvalidateAll = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: plannerKeys.all });
};

/** Haftalik soat + sinflar (Asosiy tab). */
export const useSavePlannerLoad = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (data) => plannerAPI.saveLoad(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** O'qituvchining band kataklari — to'liq almashtirish. */
export const useSetAvailability = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ teacherId, slots }) =>
      plannerAPI.setAvailability(teacherId, slots).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/**
 * Bitta katakni almashtirish (matritsadan bosilganda).
 *
 * Optimistik: matritsada bosish darhol ko'rinishi kerak, aks holda 40×42
 * katakli jadvalda har bosish "kutish" bo'lib qolardi.
 */
export const useToggleSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, day, order }) =>
      plannerAPI.toggleSlot(teacherId, day, order).then((r) => r.data.data),

    onMutate: async ({ teacherId, day, order }) => {
      const key = [...plannerKeys.all, "availability"];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (current) => {
        if (!current) return current;
        return {
          ...current,
          teachers: current.teachers.map((teacher) => {
            if (teacher.id !== teacherId) return teacher;
            const exists = teacher.busy.some(
              (slot) => slot.day === day && slot.order === order,
            );
            return {
              ...teacher,
              busy: exists
                ? teacher.busy.filter(
                    (slot) => !(slot.day === day && slot.order === order),
                  )
                : [...teacher.busy, { day, order, note: null }],
            };
          }),
          slotSummary: current.slotSummary.map((slot) => {
            if (slot.day !== day || slot.order !== order) return slot;
            const teacher = current.teachers.find((t) => t.id === teacherId);
            const wasBusy = teacher?.busy.some(
              (s) => s.day === day && s.order === order,
            );
            const delta = wasBusy ? -1 : 1;
            return { ...slot, busy: slot.busy + delta, free: slot.free - delta };
          }),
        };
      });

      return { previous, key };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(context.key, context.previous);
    },

    // Server haqiqatni aytadi — optimistik holat baribir tekshiriladi.
    onSettled: () => qc.invalidateQueries({ queryKey: plannerKeys.all }),
  });
};

/** Ish jadvalidan band kataklarni to'ldirish. */
export const useFillFromWorkSchedule = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (teacherId) =>
      plannerAPI.fillFromWorkSchedule(teacherId).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Shakllantirish qoidalari. */
export const useUpdatePlannerSettings = () => {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (data) => plannerAPI.updateSettings(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** Yangi variant shakllantirish. */
export const useGeneratePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => plannerAPI.generate(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: plannerKeys.lists() }),
  });
};

export const useRenameRun = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }) => plannerAPI.renameRun(id, name).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: plannerKeys.all }),
  });
};

export const useDeleteRun = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => plannerAPI.deleteRun(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: plannerKeys.lists() }),
  });
};

/**
 * Dars taqsimoti varag'ini SERVERGA saqlaydi.
 *
 * ⚠️ Bu AVTOMATIK emas — foydalanuvchi "Saqlash" tugmasini bosgandagina
 * chaqiriladi. Varaqning doimiy saqlanishi localStorage orqali bo'ladi;
 * bu esa boshqa kompyuterda ochish yoki brauzer xotirasi tozalanib
 * ketishidan himoya qiladigan ixtiyoriy nusxa.
 */
export const useSaveDistribution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      plannerAPI.saveDistribution(data).then((r) => r.data.data),
    onSuccess: (result) =>
      qc.setQueryData([...plannerKeys.all, "distribution"], result),
  });
};

/** Darsni ko'chirish / qadash. */export const useUpdateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, lessonId, data }) =>
      plannerAPI.updateLesson(runId, lessonId, data).then((r) => r.data),
    onSuccess: (_data, { runId }) =>
      qc.invalidateQueries({ queryKey: plannerKeys.detail(runId) }),
  });
};

/** Bo'sh katakka dars qo'shish (joylashmay qolganini qo'lda joylash). */
export const useAddLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, data }) =>
      plannerAPI.addLesson(runId, data).then((r) => r.data.data),
    onSuccess: (_data, { runId }) =>
      qc.invalidateQueries({ queryKey: plannerKeys.detail(runId) }),
  });
};

export const useRemoveLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, lessonId }) =>
      plannerAPI.removeLesson(runId, lessonId).then((r) => r.data),
    onSuccess: (_data, { runId }) =>
      qc.invalidateQueries({ queryKey: plannerKeys.detail(runId) }),
  });
};
