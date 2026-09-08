// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { substitutionAPI } from "../api/lessonHours.api";
import { lessonHoursKeys } from "./lessonHours.queries";

// O'rinbosarlik SOATNI ko'chiradi, soat esa oylikka kiradi — shuning uchun
// oylik registri ham eskiradi. Dars jadvali o'zgarmaydi (yozuv jadvalga
// TEGMAYDI), shuning uchun `schedulesKeys` bu yerda YO'Q.
import { payrollKeys } from "@/features/payroll/queries/payroll.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: lessonHoursKeys.all });
    queryClient.invalidateQueries({ queryKey: payrollKeys.all });
  };
};

export const useCreateSubstitution = () => {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (data) => substitutionAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCancelSubstitution = () => {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, reason }) =>
      substitutionAPI.cancel(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
