// React
import { useState } from "react";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// API
import { authAPI } from "@/features/auth/api/auth.api";

/**
 * Joriy filial va uni almashtirish.
 *
 * Filial TOKEN ichida turadi (imzolangan), header'da emas — ya'ni uni mijoz
 * tomondan o'zgartirib bo'lmaydi. Almashtirish = yangi token olish.
 *
 * ⚠️ ALMASHTIRGANDAN KEYIN KESH TO'LIQ TOZALANADI. Har bir so'rov o'z
 * filialining bazasiga boradi, lekin TanStack kalitlari filialni bilmaydi:
 * `["users","list",{page:1}]` ikkala filialda ham bir xil. Kesh tozalanmasa
 * ekranda boshqa filialning ma'lumoti qolib ketardi — bu butun ajratishni
 * bekor qiladigan yagona joy.
 *
 * @example
 * const { branch, branches, canSwitch, switchBranch, isSwitching } = useBranch();
 */
const useBranch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  const branch = user?.branch ?? null;
  const branches = user?.availableBranches ?? [];
  const canSwitch = Boolean(user?.canSwitchBranch) && branches.length > 1;

  /**
   * Boshqa filialga o'tish.
   * @param {string} branchId
   * @returns {Promise<void>}
   */
  const switchBranch = async (branchId) => {
    if (!branchId || branchId === branch?.id) return;

    setIsSwitching(true);
    try {
      const res = await authAPI.switchBranch(branchId);
      localStorage.setItem("authToken", res.data.data.token);

      // Keshni tozalash va to'liq qayta yuklash. `queryClient.clear()` dan
      // keyin `reload` — ochiq sahifadagi lokal holat (tanlangan qatorlar,
      // filtrlar, ochiq modallar) ham boshqa filialga tegishli bo'lib
      // qolmasligi kerak.
      queryClient.clear();
      window.location.reload();
    } finally {
      setIsSwitching(false);
    }
  };

  return { branch, branches, canSwitch, switchBranch, isSwitching };
};

export default useBranch;
