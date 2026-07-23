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

export const useRemoveClassStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, payload }) =>
      classesAPI.removeStudents(classId, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classesKeys.all });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};

export const useMoveClassStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, studentIds, targetClassId }) =>
      classesAPI
        .moveStudents(classId, studentIds, targetClassId)
        .then((r) => r.data),
    // Both source and target class rosters change → invalidate the whole feature.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: classesKeys.all });
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};
