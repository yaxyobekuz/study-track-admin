// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { myAttendanceAPI } from "../api/myAttendance.api";

// Keys
import { myAttendanceKeys } from "./myAttendance.queries";

/**
 * Kelganlikni qayd etish.
 *
 * ⚠️ BUTUN `myAttendanceKeys.all` eskiradi, faqat "today" emas: check-in
 * bugungi yozuvni ham, joriy oy kalendarini ham o'zgartiradi. Bittasini
 * yangilab, ikkinchisini eskirtirmaslik — "kartada keldim, kalendarda yo'q"
 * degan holatning aynan o'zi.
 */
export const useCheckIn = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (location) => myAttendanceAPI.checkIn(location).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: myAttendanceKeys.all }),
  });
};

/** Ketganlikni qayd etish. */
export const useCheckOut = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (location) => myAttendanceAPI.checkOut(location).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: myAttendanceKeys.all }),
  });
};

/** Uzrli yo'qlik so'rovi yuborish. */
export const useCreateMyExcuse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      myAttendanceAPI.createExcuseRequest(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: myAttendanceKeys.all }),
  });
};

/** O'z so'rovini bekor qilish (faqat `pending` holatida). */
export const useCancelMyExcuse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => myAttendanceAPI.cancelExcuseRequest(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: myAttendanceKeys.all }),
  });
};
