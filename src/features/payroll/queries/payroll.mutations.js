// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { staffSalariesAPI, payrollAPI } from "../api/payroll.api";
import { payrollKeys } from "./payroll.queries";

// Oylik to'lovi KASSAGA tegadi, ya'ni to'lov turlari qoldig'i va moliya
// hisobotlari ham eskiradi.
import { financeKeys } from "@/features/finance/queries/finance.queries";
import { dashboardKeys } from "@/features/financeDashboard/queries/financeDashboard.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    queryClient.invalidateQueries({ queryKey: financeKeys.all });
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
};

// ── Qoidalar ─────────────────────────────────

export const useCreateSalary = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => staffSalariesAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateSalary = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) =>
      staffSalariesAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCloseSalary = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, endMonth }) =>
      staffSalariesAPI.close(id, endMonth).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useDeleteSalary = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => staffSalariesAPI.remove(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};

// ── Majburiyatlar va to'lovlar ───────────────

export const useGeneratePayroll = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => payrollAPI.generate(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useRegenerateEntry = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      payrollAPI.regenerateEntry(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useCancelEntry = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      payrollAPI.cancelEntry(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const usePreviewSalaryPayment = () =>
  useMutation({
    mutationFn: (data) => payrollAPI.previewPayment(data).then((r) => r.data.data),
  });

export const useCreateSalaryPayment = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => payrollAPI.createPayment(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useVoidSalaryPayment = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, reason }) =>
      payrollAPI.voidPayment(id, reason).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
