// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { selfTasksAPI } from "../api/selfTasks.api";

// Keys
import { selfTasksKeys } from "./selfTasks.queries";

/**
 * XODIM O'ZIGA O'ZI BELGILAGAN TOPSHIRIQLAR — mutatsiyalar.
 *
 * ⚠️ Har qanday o'zgarish `selfTasksKeys.all` bo'yicha eskiradi: ro'yxat,
 * hisoblagichlar, doimiy ishlar ro'yxati va boshqaruvchi dashboardi bir
 * manbadan o'qiydi, ya'ni biri o'zgarsa qolganlari ham qayta so'raladi.
 *
 * ⚠️ Lavozimlar markazi keshiga (`tasksKeys`) TEGILMAYDI — ikki oqim
 * aralashmaydi (`selfTasks.queries.js` boshidagi izoh).
 */
const useInvalidateSelfTasks = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: selfTasksKeys.all });
};

/** O'ziga bir martalik topshiriq belgilash (multipart). */
export const useCreateSelfTask = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: (formData) => selfTasksAPI.create(formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** O'ziga doimiy (takrorlanuvchi) ish belgilash (multipart). */
export const useCreateSelfRule = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: (formData) => selfTasksAPI.createRule(formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/**
 * YAKUNLASH — "Tekshiruvda" bosqichisiz, darhol "Yakunlangan".
 * @example complete({ id, formData })
 */
export const useCompleteSelfTask = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: ({ id, formData }) => selfTasksAPI.complete(id, formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Tahrirlash (multipart). @example update({ id, formData }) */
export const useUpdateSelfTask = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: ({ id, formData }) => selfTasksAPI.update(id, formData).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Muddatni surish — jarimasiz, sabab majburiy. @example extend({ id, data }) */
export const useExtendSelfTask = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.extend(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** To'xtatish ("kerak bo'lmay qoldi"). @example stop({ id, data }) */
export const useStopSelfTask = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.stop(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** Qayta ochish — yangi muddat bilan. @example reopen({ id, data }) */
export const useReopenSelfTask = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.reopen(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

/** O'chirish. */
export const useDeleteSelfTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => selfTasksAPI.remove(id).then((r) => r.data),
    onSuccess: (_, id) => {
      // O'chirilgan detal qayta so'ralmasin (404)
      qc.removeQueries({ queryKey: selfTasksKeys.detail(id) });
      qc.invalidateQueries({ queryKey: selfTasksKeys.all });
    },
  });
};

// ─── Doimiy ish qoidasi ───────────────────────────────────────────

/** @example stopRule({ id, data }) */
export const useStopSelfRule = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: ({ id, data }) => selfTasksAPI.stopRule(id, data).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useResumeSelfRule = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: (id) => selfTasksAPI.resumeRule(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};

export const useDeleteSelfRule = () => {
  const invalidate = useInvalidateSelfTasks();
  return useMutation({
    mutationFn: (id) => selfTasksAPI.removeRule(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};
