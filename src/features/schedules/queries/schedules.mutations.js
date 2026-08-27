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
