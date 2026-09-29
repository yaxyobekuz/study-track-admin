// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { classesAPI } from "../api/classes.api";

// Keys
import { classesKeys } from "./classes.queries";
import { usersKeys } from "@/features/users/queries/users.queries";

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => classesAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: classesKeys.lists() }),
  });
};

export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => classesAPI.update(id, data).then((r) => r.data),
    // Refresh both the list and the edited class's detail.
    onSuccess: () => qc.invalidateQueries({ queryKey: classesKeys.all }),
  });
};

export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => classesAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: classesKeys.lists() }),
  });
};

export const useAddStudentsToClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentIds }) =>
      classesAPI.addStudents(classId, studentIds).then((r) => r.data),
    // Refresh the affected class roster/detail + the users cache (membership changed).
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classesKeys.all });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};

/**
 * Sinfdan chiqarish / ko'chirish — ro'yxat, jurnal va o'quvchilar keshi.
 *
 * ⚠️ `onSettled`, `onSuccess` EMAS: server eskirgan tanlovni ("o'quvchi bu
 * sinfda topilmadi") rad etadi — shunda ham ro'yxat yangilanishi kerak,
 * aks holda admin o'sha eskirgan ro'yxat bilan qayta-qayta urinardi.
 */
const invalidateMembership = (qc) => {
  qc.invalidateQueries({ queryKey: classesKeys.all });
  qc.invalidateQueries({ queryKey: usersKeys.all });
};

export const useRemoveClassStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    // `payload` — `{ studentIds | all, reason }`
    mutationFn: ({ classId, payload }) =>
      classesAPI.removeStudents(classId, payload).then((r) => r.data),
    onSettled: () => invalidateMembership(qc),
  });
};

export const useMoveClassStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentIds, targetClassId, reason }) =>
      classesAPI
        .moveStudents(classId, { studentIds, targetClassId, reason })
        .then((r) => r.data),
    // Both source and target class rosters change → invalidate the whole feature.
    onSettled: () => invalidateMembership(qc),
  });
};
