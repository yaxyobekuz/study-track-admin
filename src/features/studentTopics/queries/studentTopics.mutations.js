// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { studentTopicsAPI } from "../api/studentTopics.api";

// Keys
import { studentTopicsKeys } from "./studentTopics.queries";
import { topicsKeys } from "@/features/subjects/queries/topics.queries";
import { schedulesKeys } from "@/features/schedules/queries/schedules.queries";

/**
 * ⚠️ UCHTA KESH BIRGA BEKOR QILINADI. O'quvchining mavzu o'rni:
 *   · shu ekrandagi ro'yxatni (`studentTopics`),
 *   · fan → sinflar ekranidagi "shaxsiy rejasi bor" sanog'ini (`topics`),
 *   · diagnostika testining qamrovini (`schedules` — jadval va mavzular)
 * o'zgartiradi. Faqat bittasi bekor qilinsa, qo'shni ekranda eski raqam
 * qolib ketardi.
 */
const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: studentTopicsKeys.all });
  qc.invalidateQueries({ queryKey: topicsKeys.all });
  qc.invalidateQueries({ queryKey: schedulesKeys.all });
};

/** Mavzu o'rni va qadamni belgilash (bitta yoki bir nechta o'quvchiga). */
export const useSetStudentTopicPlans = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => studentTopicsAPI.set(payload).then((r) => r.data),
    onSuccess: () => invalidate(qc),
  });
};

/** Shaxsiy rejani bekor qilish. */
export const useRevokeStudentTopicPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => studentTopicsAPI.revoke(id).then((r) => r.data),
    onSuccess: () => invalidate(qc),
  });
};
