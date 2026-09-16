// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { contractAPI, substitutionAPI } from "../api/lessonHours.api";
import { lessonHoursKeys } from "./lessonHours.queries";

// O'rinbosarlik SOATNI ko'chiradi, soat esa oylikka kiradi — shuning uchun
// oylik registri ham eskiradi. Dars jadvali o'zgarmaydi (yozuv jadvalga
// TEGMAYDI), shuning uchun `schedulesKeys` bu yerda YO'Q.
import { payrollKeys } from "@/features/payroll/queries/payroll.queries";
import { dashboardKeys } from "@/features/financeDashboard/queries/financeDashboard.queries";

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

export const useUpdateSubstitution = () => {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: ({ id, ...data }) =>
      substitutionAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useDeleteSubstitution = () => {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (id) => substitutionAPI.remove(id).then((r) => r.data),
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

/**
 * Shartnoma shartini saqlash.
 *
 * ⚠️ Moliya dashboardi ham eskiradi: "Belgilangan oylik" kartasi qoidalardan
 * JONLI hisoblanadi (`finance.md` §10). Kassaga tegmaydi, shuning uchun
 * `financeKeys` bu yerda YO'Q.
 */
export const useSaveContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, ...data }) =>
      contractAPI.save(staffId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonHoursKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
};
