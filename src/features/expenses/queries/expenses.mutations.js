// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { expenseCategoriesAPI, expensesAPI } from "../api/expenses.api";
import { expenseKeys } from "./expenses.queries";

// Xarajat KASSAGA tegadi, ya'ni to'lov turlari qoldig'i va moliya hisobotlari
// ham eskiradi. Shuning uchun uch bo'lim birga yangilanadi.
import { financeKeys } from "@/features/finance/queries/finance.queries";
import { dashboardKeys } from "@/features/financeDashboard/queries/financeDashboard.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    queryClient.invalidateQueries({ queryKey: financeKeys.all });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
};

export const useCreateExpense = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => expensesAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useVoidExpense = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      expensesAPI.void(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCreateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => expenseCategoriesAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) =>
      expenseCategoriesAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      expenseCategoriesAPI.archive(id, isArchived).then((r) => r.data),
    onSuccess: invalidate,
  });
};
