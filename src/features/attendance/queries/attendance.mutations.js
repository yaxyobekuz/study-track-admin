// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";
import { attendanceAPI } from "../api/attendance.api";

// Keys
import { attendanceKeys } from "./attendance.queries";

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
