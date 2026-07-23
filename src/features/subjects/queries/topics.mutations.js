// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { topicsAPI } from "../api/topics.api";

// Keys
import { topicsKeys } from "./topics.queries";

/** Upload topics from an Excel file (all subjects or a single one). */
export const useUploadTopics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, subjectId = null }) =>
      topicsAPI.upload(file, subjectId).then((r) => r.data),
    // Upload may touch any subject's topics — refresh them all.
    onSuccess: () => qc.invalidateQueries({ queryKey: topicsKeys.all }),
  });
};

/** Delete every topic of a subject. */
export const useDeleteSubjectTopics = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subjectId) =>
      topicsAPI.deleteBySubject(subjectId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: topicsKeys.all }),
  });
};
