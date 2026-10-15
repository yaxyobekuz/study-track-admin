// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { schedulesAPI } from "../api/schedules.api";

// Keys
import { schedulesKeys } from "./schedules.queries";
import { topicsKeys } from "@/features/subjects/queries/topics.queries";
import { scheduleSyncKeys } from "@/features/schedule-sync/queries/scheduleSync.queries";

// Helpers
import { isSheetModeError } from "@/features/schedule-sync/helpers/scheduleSync.helpers";

/**
 * Sheet rejimida platformadagi yozuv rad etilsa (409 `sheet_mode`), manba
 * so'rovi qayta o'qiladi — tahrir sahifasi formani yopib, sabab kartasini
 * ko'rsatadi. Ekran hali ham "platforma" deb turgan bo'lsa, odam
 * saqlanmaydigan ishni davom ettirib yurardi.
 */
const useRefreshModeOnSheetError = () => {
  const qc = useQueryClient();

  return (err) => {
    if (isSheetModeError(err)) {
      qc.invalidateQueries({ queryKey: scheduleSyncKeys.mode() });
    }
  };
};

/** Sinfning butun haftalik jadvalini saqlash. */
export const useSaveClassSchedule = () => {
  const qc = useQueryClient();
  const refreshMode = useRefreshModeOnSheetError();

  return useMutation({
    mutationFn: ({ classId, schedules }) =>
      schedulesAPI.saveClassSchedule(classId, { schedules }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
    onError: refreshMode,
  });
};

/**
 * QORALAMANI ZAXIRALASH — forma buni tahrir tinchigach avtomatik chaqiradi.
 *
 * ⚠️ Cache ATAYLAB invalidatsiya qilinmaydi: qoralamaning yagona egasi —
 * ochiq turgan forma. Qayta so'rov serverdagi nusxani qaytarib, odam
 * yozayotgan paytda formani orqaga tashlab yuborardi.
 */
export const useSaveScheduleDraft = () => {
  const refreshMode = useRefreshModeOnSheetError();

  return useMutation({
    mutationFn: ({ classId, week, baseHash }) =>
      schedulesAPI.saveDraft(classId, { week, baseHash }).then((r) => r.data),
    onError: refreshMode,
  });
};

/** Qoralamani tashlash — "saqlangan jadvalga qaytish". */
export const useDeleteScheduleDraft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId) =>
      schedulesAPI.deleteDraft(classId).then((r) => r.data),
    onSuccess: (_data, classId) =>
      qc.invalidateQueries({
        queryKey: [...schedulesKeys.all, "class", classId, "draft"],
      }),
  });
};

/** Create or update a single schedule entry. */
export const useCreateOrUpdateSchedule = () => {
  const qc = useQueryClient();
  const refreshMode = useRefreshModeOnSheetError();

  return useMutation({
    mutationFn: (data) => schedulesAPI.createOrUpdate(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
    onError: refreshMode,
  });
};

/** Bump the current topic for a class' subject. */
export const useUpdateCurrentTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, subjectId, topicNumber }) =>
      schedulesAPI
        .updateCurrentTopic(classId, subjectId, topicNumber)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};

/** Delete a schedule entry by id. */
export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  const refreshMode = useRefreshModeOnSheetError();

  return useMutation({
    mutationFn: (id) => schedulesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
    onError: refreshMode,
  });
};

/**
 * MAVZUNI BIRIKTIRISH ustidan keyin nimani qayta o'qish kerak.
 *
 * Ikkala kesim ham: jadvaldagi mavzular VA "Dars mavzulari → Sinflar"
 * ekranidagi joriy mavzu. Ular bitta serverdagi hisobdan o'qiydi, shuning
 * uchun biri yangilanib, ikkinchisi eski qolsa — foydalanuvchi ikki xil
 * raqam ko'rardi.
 */
const useInvalidateTopics = () => {
  const qc = useQueryClient();

  return () => {
    qc.invalidateQueries({ queryKey: schedulesKeys.all });
    qc.invalidateQueries({ queryKey: topicsKeys.all });
  };
};

/**
 * Darsga mavzu biriktirish — keyingi darslar o'zidan davom etadi.
 *
 * payload: `{ classId, subjectId, date, lessonOrder, topicOrder, note? }`
 */
export const useBindLessonTopic = () => {
  const invalidate = useInvalidateTopics();

  return useMutation({
    mutationFn: ({ classId, ...payload }) =>
      schedulesAPI.bindTopic(classId, payload).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Biriktirishni bekor qilish — mavzu oldingi ankordan sanaladi. */
export const useUnbindLessonTopic = () => {
  const invalidate = useInvalidateTopics();

  return useMutation({
    mutationFn: (bindingId) => schedulesAPI.unbindTopic(bindingId).then((r) => r.data),
    onSuccess: invalidate,
  });
};
