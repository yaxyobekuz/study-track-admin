// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { dormAttendanceAPI } from "../api/dormAttendance.api";

// Keys
import { dormAttendanceKeys } from "./dormAttendance.queries";

/**
 * BELGILASH — bitta yoki bir nechta o'quvchi.
 *
 * ⚠️ Saqlangandan keyin ro'yxat ham, sinflar kesimi ham yangilanadi: kesim
 * alohida so'rov, ya'ni usiz "qaysi sinfdan nechta qoldi" kartalari eski
 * raqamda qolib, bir ekranda ikki xil haqiqat ko'rinardi.
 */
export const useMarkDormAttendance = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) => dormAttendanceAPI.mark(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: dormAttendanceKeys.all }),
  });
};

/** Boshlanish vaqti — o'zgarsa darvoza ham qayta hisoblanadi. */
export const useUpdateDormSettings = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      dormAttendanceAPI.updateSettings(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: dormAttendanceKeys.all }),
  });
};
