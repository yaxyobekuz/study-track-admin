// TanStack Query
import { queryOptions, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { taskSchedulesAPI } from "../api/taskSchedules.api";

// Keys — topshiriqlar namespace'idan ALOHIDA: qoida va topshiriq boshqa
// narsalar. Qoida o'zgarganda topshiriqlar ham eskiradi (yangi qator
// yozilishi mumkin), shuning uchun mutatsiyalar ikkalasini ham bekor qiladi.
export const taskSchedulesKeys = createQueryKeys("taskSchedules");

export const taskSchedulesQueries = {
  /**
   * Qoidalar ro'yxati → `{ data, pagination }`.
   * @param {{ page?: number, status?: "active"|"stopped", search?: string }} params
   */
  list: (params) =>
    queryOptions({
      queryKey: taskSchedulesKeys.list(params),
      queryFn: () => taskSchedulesAPI.getAll(params).then((r) => r.data),
      placeholderData: keepPreviousData,
    }),
};

/** Qoida o'zgarsa topshiriqlar ro'yxati ham eskiradi — ikkalasi bekor qilinadi. */
const useScheduleMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskSchedulesKeys.all });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useCreateTaskSchedule = () =>
  useScheduleMutation((formData) => taskSchedulesAPI.create(formData).then((r) => r.data));

export const useUpdateTaskSchedule = () =>
  useScheduleMutation(({ id, formData }) =>
    taskSchedulesAPI.update(id, formData).then((r) => r.data),
  );

export const useStopTaskSchedule = () =>
  useScheduleMutation(({ id, reason }) => taskSchedulesAPI.stop(id, { reason }));

export const useResumeTaskSchedule = () =>
  useScheduleMutation((id) => taskSchedulesAPI.resume(id));

export const useDeleteTaskSchedule = () =>
  useScheduleMutation((id) => taskSchedulesAPI.remove(id));
