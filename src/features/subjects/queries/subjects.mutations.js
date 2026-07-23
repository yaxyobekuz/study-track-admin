// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { subjectsAPI } from "../api/subjects.api";

// Keys
import { subjectsKeys } from "./subjects.queries";

export const useCreateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => subjectsAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectsKeys.lists() }),
  });
};

export const useUpdateSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subjectsAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectsKeys.all }),
  });
};

export const useDeleteSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => subjectsAPI.delete(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: subjectsKeys.lists() }),
  });
};
