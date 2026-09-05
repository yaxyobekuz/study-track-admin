// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { incomeCategoriesAPI, externalIncomesAPI } from "../api/externalIncome.api";
import { incomeKeys } from "./externalIncome.queries";

// Kirim KASSAGA tegadi, ya'ni to'lov turlari qoldig'i va moliya hisobotlari
// ham eskiradi. Shuning uchun uch bo'lim birga yangilanadi.
import { financeKeys } from "@/features/finance/queries/finance.queries";
import { dashboardKeys } from "@/features/financeDashboard/queries/financeDashboard.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    queryClient.invalidateQueries({ queryKey: financeKeys.all });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
};

export const useCreateIncome = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => externalIncomesAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useVoidIncome = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      externalIncomesAPI.void(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCreateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => incomeCategoriesAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) =>
      incomeCategoriesAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      incomeCategoriesAPI.archive(id, isArchived).then((r) => r.data),
    onSuccess: invalidate,
  });
};
