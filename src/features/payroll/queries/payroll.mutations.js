// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import {
  staffSalariesAPI,
  payrollAPI,
  salaryCategoriesAPI,
  departmentsAPI,
  positionsAPI,
  payrollViewAPI,
  payrollRequestsAPI,
} from "../api/payroll.api";
import { payrollKeys } from "./payroll.queries";

// Oylik to'lovi KASSAGA tegadi, ya'ni to'lov turlari qoldig'i va moliya
// hisobotlari ham eskiradi.
import { financeKeys } from "@/features/finance/queries/finance.queries";
import { reportKeys } from "@/features/financeReports/queries/financeReports.queries";

const useInvalidate = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    queryClient.invalidateQueries({ queryKey: financeKeys.all });
    queryClient.invalidateQueries({ queryKey: reportKeys.all });
  };
};

// ── Bo'limlar ────────────────────────────────
export const useCreateDepartment = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data) => departmentsAPI.create(data).then((r) => r.data.data), onSuccess: invalidate });
};
export const useUpdateDepartment = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: ({ id, data }) => departmentsAPI.update(id, data).then((r) => r.data.data), onSuccess: invalidate });
};
export const useDeleteDepartment = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id) => departmentsAPI.remove(id).then((r) => r.data), onSuccess: invalidate });
};

// ── Lavozimlar ───────────────────────────────
export const useCreatePosition = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (data) => positionsAPI.create(data).then((r) => r.data.data), onSuccess: invalidate });
};
export const useUpdatePosition = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: ({ id, data }) => positionsAPI.update(id, data).then((r) => r.data.data), onSuccess: invalidate });
};
export const useDeletePosition = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id) => positionsAPI.remove(id).then((r) => r.data), onSuccess: invalidate });
};

// ── Xodimni biriktirish ──────────────────────
export const useAssignStaff = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: ({ staffId, data }) => payrollViewAPI.assign(staffId, data).then((r) => r.data.data), onSuccess: invalidate });
};

// ── Malaka toifalari (KPI stavka katalogi) ───

export const useCreateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => salaryCategoriesAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) =>
      salaryCategoriesAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useArchiveCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isArchived }) =>
      salaryCategoriesAPI.archive(id, isArchived).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

export const useDeleteCategory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => salaryCategoriesAPI.remove(id).then((r) => r.data),
    onSuccess: invalidate,
  });
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

// ── Oylik zayavkalari ────────────────────────
// Tasdiq/rad oylik strukturasiga tegishi mumkin (toifa biriktirish / ustama
// yaratish) — shuning uchun butun payroll cache'ini invalidatsiya qilamiz.
export const useReviewPayrollRequest = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status, rejectionReason }) =>
      payrollRequestsAPI.review(id, { status, rejectionReason }).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};
