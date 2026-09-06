// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// API
import { securityAPI } from "../api/security.api";

// Keys
import { securityKeys } from "./security.queries";

/**
 * ⚠️ HAR MUTATSIYA BUTUN BO'LIMNI YANGILAYDI (`securityKeys.all`).
 * Sabab: ogohlantirishni yopish manzaradagi sanoqni ham, ro'yxatni
 * ham o'zgartiradi; seansni tugatish esa "bir nechta seansli hisob"
 * blokini ham. Nozik invalidatsiya bu yerda ikkita raqamning bir-biriga
 * mos kelmasligiga olib kelardi va ekranning butun mazmuni — ISHONCH.
 */

/** Ogohlantirish holatini o'zgartirish. */
export const useUpdateAlert = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, note }) =>
      securityAPI.updateAlert(id, { status, note }).then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: securityKeys.all });
      toast.success(res?.message || "Ogohlantirish yangilandi");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xatolik yuz berdi");
    },
  });
};

/** Bitta seansni tugatish. */
export const useRevokeSession = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) => securityAPI.revokeSession(id).then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: securityKeys.all });
      toast.success(res?.message || "Seans tugatildi");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Seansni tugatib bo'lmadi");
    },
  });
};

/** Foydalanuvchining barcha seanslarini tugatish. */
export const useRevokeUserSessions = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (userId) =>
      securityAPI.revokeUserSessions(userId).then((r) => r.data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: securityKeys.all });
      toast.success(res?.message || "Seanslar tugatildi");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Seanslarni tugatib bo'lmadi");
    },
  });
};
