// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { tutorGroupsAPI } from "../api/tutorGroups.api";
import { tutorGroupsKeys } from "./tutorGroups.queries";

// Tyutor guruhi oylikka ustama bo'lib qo'shiladi: oylik registri, vedomost va
// moliya dashboardidagi "Belgilangan oylik" ham eskiradi
import { payrollKeys } from "@/features/payroll/queries/payroll.queries";
import { lessonHoursKeys } from "@/features/lessonHours/queries/lessonHours.queries";
import { dashboardKeys } from "@/features/financeDashboard/queries/financeDashboard.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tutorGroupsKeys.all });
    queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    queryClient.invalidateQueries({ queryKey: lessonHoursKeys.all });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
};

export const useCreateTutorGroup = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => tutorGroupsAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateTutorGroup = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => tutorGroupsAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useRemoveTutorGroup = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, effective }) =>
      tutorGroupsAPI.remove(id, { effective }).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
