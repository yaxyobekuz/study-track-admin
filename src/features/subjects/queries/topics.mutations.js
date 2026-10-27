// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { topicsAPI } from "../api/topics.api";

// Keys
import { topicsKeys } from "./topics.queries";
import { schedulesKeys } from "@/features/schedules/queries/schedules.queries";

/**
 * Mavzular ro'yxati o'zgarsa DARS JADVALI ham qayta o'qiladi: jadvaldagi
 * har bir darsning mavzusi (nomi, darajasi, kitobi) shu ro'yxatdan
 * hisoblanadi va keshda eski nom qolib ketardi.
 */
const invalidateTopicViews = (qc) => {
  qc.invalidateQueries({ queryKey: topicsKeys.all });
  qc.invalidateQueries({ queryKey: schedulesKeys.all });
};

/** Upload topics from an Excel file (all subjects or a single one). */
export const useUploadTopics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, subjectId = null }) =>
      topicsAPI.upload(file, subjectId).then((r) => r.data),
    // Upload may touch any subject's topics — refresh them all.
    onSuccess: () => invalidateTopicViews(qc),
  });
};

/** Delete every topic of a subject. */
export const useDeleteSubjectTopics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId) =>
      topicsAPI.deleteBySubject(subjectId).then((r) => r.data),
    onSuccess: () => invalidateTopicViews(qc),
  });
};
