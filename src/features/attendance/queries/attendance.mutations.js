// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";
import { attendanceAPI } from "../api/attendance.api";
import { studentAttendanceAPI } from "../api/studentAttendance.api";

// Keys
import {
  attendanceKeys,
  attendanceReportsKeys,
  studentAttendanceKeys,
} from "./attendance.queries";

/** Matches every absence-reason query (list + active). */
const absenceReasonsKey = [...attendanceKeys.all, "absence-reasons"];

export const useCreateAbsenceReason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => absenceReasonAPI.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: absenceReasonsKey }),
  });
};

export const useUpdateAbsenceReason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      absenceReasonAPI.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: absenceReasonsKey }),
  });
};

export const useDeleteAbsenceReason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => absenceReasonAPI.remove(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: absenceReasonsKey }),
  });
};

export const useUpdateAttendanceSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => attendanceAPI.updateSettings(data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [...attendanceKeys.all, "settings"] }),
  });
};

/**
 * O'quvchilar davomatini belgilash (belgilash sahifasi va kunlik sahifadagi
 * tahrirlash oynasi). Kunlik ro'yxatlar ham, hisobot foizlari ham, bitta
 * o'quvchining oylik paneli ham shu yozuvlardan hisoblanadi — uchalasi eskiradi.
 */
export const useMarkStudentAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => studentAttendanceAPI.mark(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentAttendanceKeys.all });
      qc.invalidateQueries({ queryKey: attendanceReportsKeys.all });
      qc.invalidateQueries({ queryKey: [...attendanceKeys.all, "student"] });
    },
  });
};
