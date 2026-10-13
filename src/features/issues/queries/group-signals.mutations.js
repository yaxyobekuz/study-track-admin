// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { groupSignalsAPI } from "../api/group-signals.api";

// Keys
import { groupSignalsKeys } from "./group-signals.queries";
import { issuesKeys } from "./issues.queries";

/**
 * HOZIR TEKSHIRISH — navbatdagi xabarlarni darhol tahlil qiladi.
 *
 * ⚠️ UZOQ KETISHI MUMKIN: ichida AI chaqiruvi bor (har guruh uchun
 * bittadan). Tugma shuning uchun `isPending` da bloklanadi.
 */
export const useRefreshGroupSignals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => groupSignalsAPI.refresh().then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupSignalsKeys.all }),
  });
};

/**
 * SIGNALNI MUAMMOLARGA BIRIKTIRISH — "tezkor" usul.
 *
 * ⚠️ IKKI KALIT HAM BEKOR QILINADI: signal holati o'zgaradi (platforma)
 * VA yangi muammo paydo bo'ladi (filial). Faqat bittasi yangilansa,
 * ma'muriyat muammolar ro'yxatini qayta ochmaguncha yangi yozuvni
 * ko'rmasdi.
 */
export const useAttachGroupSignal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, categoryId }) =>
      groupSignalsAPI.attach(id, categoryId).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupSignalsKeys.all });
      qc.invalidateQueries({ queryKey: issuesKeys.all });
    },
  });
};

/**
 * "BU MUAMMO EMAS" — e'tiborsiz qoldirish.
 *
 * ⚠️ MUAMMOLAR KALITI BEKOR QILINMAYDI: bu amal `issues` ga tegmaydi,
 * faqat signal holatini o'zgartiradi.
 */
export const useDismissGroupSignal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => groupSignalsAPI.dismiss(id).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: groupSignalsKeys.all }),
  });
};
