// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { schedulesAPI } from "../api/schedules.api";

// Keys
import { schedulesKeys } from "./schedules.queries";

/** Replace the whole-week schedule of a class as a new version (with a validity range). */
export const useSaveClassSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, schedules, effectiveFrom, effectiveTo }) =>
      schedulesAPI
        .saveClassSchedule(classId, { schedules, effectiveFrom, effectiveTo })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};

/**
 * QORALAMANI ZAXIRALASH — forma buni tahrir tinchigach avtomatik chaqiradi.
 *
 * ⚠️ Cache ATAYLAB invalidatsiya qilinmaydi: qoralamaning yagona egasi —
 * ochiq turgan forma. Qayta so'rov serverdagi nusxani qaytarib, odam
 * yozayotgan paytda formani orqaga tashlab yuborardi.
 */
export const useSaveScheduleDraft = () =>
  useMutation({
    mutationFn: ({ classId, week, baseHash }) =>
      schedulesAPI.saveDraft(classId, { week, baseHash }).then((r) => r.data),
  });

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
  return useMutation({
    mutationFn: (data) => schedulesAPI.createOrUpdate(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
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
  return useMutation({
    mutationFn: (id) => schedulesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};

/** Tarixdagi versiyaga qaytarish (restore). */
export const useRestoreRevision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (revId) => schedulesAPI.restoreRevision(revId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: schedulesKeys.all }),
  });
};
