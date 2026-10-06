// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { enrollmentAPI } from "../api/enrollment.api";

// Keys
import { enrollmentKeys } from "./enrollment.queries";
import { financeKeys } from "@/features/finance/queries/finance.queries";
import {
  attendanceReportsKeys,
  studentAttendanceKeys,
} from "@/features/attendance/queries/attendance.queries";

/**
 * O'qish davri o'zgarsa MOLIYA ham eskiradi: hisob-faktura bor-yo'qligi va
 * oy ulushi aynan shundan kelib chiqadi. DAVOMAT ham: kunlik ro'yxatlar va
 * hisobot faqat shu kuni o'qiyotgan o'quvchini ko'rsatadi — davr davomat
 * sahifasidan yopilganda qator darhol yangilanishi kerak.
 */
const invalidate = (qc) => {
  qc.invalidateQueries({ queryKey: enrollmentKeys.all });
  qc.invalidateQueries({ queryKey: financeKeys.all });
  qc.invalidateQueries({ queryKey: studentAttendanceKeys.all });
  qc.invalidateQueries({ queryKey: attendanceReportsKeys.all });
};

export const useCreateEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    // Javobda `warnings` va `generated` (avtomatik shakllantirilgan
    // hisob-faktura hisoboti) ham keladi
    mutationFn: (data) => enrollmentAPI.create(data).then((r) => r.data.data),
    onSuccess: () => invalidate(qc),
  });
};

export const useUpdateEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => enrollmentAPI.update(id, data).then((r) => r.data.data),
    onSuccess: () => invalidate(qc),
  });
};

export const useCloseEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => enrollmentAPI.close(id, data).then((r) => r.data.data),
    onSuccess: () => invalidate(qc),
  });
};

export const useDeleteEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => enrollmentAPI.delete(id).then((r) => r.data),
    onSuccess: () => invalidate(qc),
  });
};
