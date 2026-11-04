// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { leadsAPI } from "../api/leads.api";
import { leadsKeys } from "./leads.queries";

/**
 * ⚠️ BUTUN BO'LIM ESKIRADI: pog'ona o'zgarishi ro'yxatni ham, kartochkani
 * ham, funnelni ham, xodimlar kesimini ham o'zgartiradi. Bittasini
 * yangilab qolgani eski raqamda qolsa, ekranda ikki xil haqiqat turardi.
 */
const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: leadsKeys.all });
};

/** Yangi lid — ro'yxatga olish. */
export const useCreateLead = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (data) => leadsAPI.create(data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** Lid ma'lumotlarini tahrirlash (pog'onaga tegmaydi). */
export const useUpdateLead = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, data }) => leadsAPI.update(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** Pog'onani belgilash yoki chiqib ketganini qayd etish. */
export const useUpdateLeadStatus = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...data }) => leadsAPI.updateStatus(id, data).then((r) => r.data.data),
    onSuccess: invalidate,
  });
};

/** Lidni o'chirish (xato kiritilgan qator uchun). */
export const useDeleteLead = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id) => leadsAPI.remove(id).then((r) => r.data),
    onSuccess: invalidate,
  });
};
