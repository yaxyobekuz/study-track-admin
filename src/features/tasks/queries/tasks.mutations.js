// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tasksAPI } from "../api/tasks.api";

// Keys
import { tasksKeys } from "./tasks.queries";

/**
 * Har qanday topshiriq o'zgarishi ro'yxatni, detalni, hisoblagichlarni VA
 * hisobotni eskirtiradi — shuning uchun hammasi `tasksKeys.all` bo'yicha.
 */
const useInvalidateTasks = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: tasksKeys.all });
};

/** Create one or many tasks (multipart/form-data). */
export const useCreateTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (formData) => tasksAPI.create(formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Edit a task (multipart/form-data). @example updateTask({ id, formData }) */
export const useUpdateTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, formData }) =>
      tasksAPI.update(id, formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Delete a task. */
export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => tasksAPI.remove(id).then((r) => r.data),
    onSuccess: (_, id) => {
      // O'chirilgan detal qayta so'ralmasin (404)
      qc.removeQueries({ queryKey: tasksKeys.detail(id) });
      qc.invalidateQueries({ queryKey: tasksKeys.all });
    },
  });
};

/**
 * Review a completed task — approve or reject.
 * @example reviewTask({ id, action: "approve" | "reject", data })
 */
export const useReviewTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, action, data }) =>
      (action === "approve"
        ? tasksAPI.approve(id, data)
        : tasksAPI.reject(id, data)
      ).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Stop an active task. */
export const useStopTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.stop(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Extend a task's deadline. */
export const useExtendDeadline = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.extend(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Reopen a completed / stopped task with a new deadline. */
export const useReopenTask = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, data }) => tasksAPI.reopen(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Save task rules. */
export const useUpdateTaskSettings = () => {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (data) =>
      tasksAPI.updateSettings(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
