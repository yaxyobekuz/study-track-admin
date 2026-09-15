// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tasksAPI } from "../api/tasks.api";

// Keys
import { tasksKeys } from "./tasks.queries";

/** Create one or many tasks (multipart/form-data). */
export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => tasksAPI.create(formData).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKeys.lists() }),
  });
};

/**
 * Review a completed task — approve or reject.
 * @example reviewTask({ id, action: "approve" | "reject", data })
 */
export const useReviewTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, data }) =>
      (action === "approve"
        ? tasksAPI.approve(id, data)
        : tasksAPI.reject(id, data)
      ).then((r) => r.data),
    // Refresh both the list and the reviewed task's detail.
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKeys.all }),
  });
};

/** Stop an active task. */
export const useStopTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.stop(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKeys.all }),
  });
};

/** Extend a task's deadline. */
export const useExtendDeadline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.extend(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksKeys.all }),
  });
};
