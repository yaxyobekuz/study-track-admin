// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { myAttendanceAPI } from "../api/myAttendance.api";

// Keys
import { checkoutReadinessKey, myAttendanceKeys } from "./myAttendance.queries";

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

/**
 * Rahbariyatga "ishlarni tugatmay ketish" so'rovi (`CheckoutRequest`).
 *
 * ⚠️ Faqat TAYYORLIK kaliti eskiradi: so'rov davomat yozuviga tegmaydi —
 * u ketishni emas, ketishga RUXSATNI hal qiladi. Bugungi yozuvni ham
 * eskirtirsak, karta sababsiz qayta yuklanardi.
 */
export const useCreateCheckoutRequest = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      myAttendanceAPI.createCheckoutRequest(data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: checkoutReadinessKey }),
  });
};

/** Kutilayotgan so'rovni bekor qilish (faqat `pending` holatida). */
export const useCancelCheckoutRequest = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      myAttendanceAPI.cancelCheckoutRequest(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: checkoutReadinessKey }),
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
