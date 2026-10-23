// React
import { useState } from "react";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// API
import { authAPI } from "@/features/auth/api/auth.api";

// Data
import { ALL_BRANCHES_ID, isAggregateBranch } from "@/features/branches/data/branch.data";

// Umumiy ko'rinishdagi yozuvlarni to'g'ri filialga yuborish uchun id xaritasi
import { clearBranchHints } from "@/shared/api/branchHints";

/**
 * Joriy filial, umumiy ko'rinish va ularni almashtirish.
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
 * ⚠️ UMUMIY KO'RINISH (`"__all__"`) — filialning o'rniga "hammasi": server
 * so'rovni har filialda bajarib, javoblarni birlashtiradi va har qatorga
 * `_branch` ni yozadi. U ham AYNI yo'l bilan (token almashtirish) yoqiladi,
 * ya'ni keshni tozalash qoidasi ham o'zgarmaydi.
 *
 * @example
 * const { branch, branches, isAggregate, canViewAll, switchBranch } = useBranch();
 */
const useBranch = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSwitching, setIsSwitching] = useState(false);

  const branch = user?.branch ?? null;
  const branches = user?.availableBranches ?? [];
  const canSwitch = Boolean(user?.canSwitchBranch) && branches.length > 1;
  const isAggregate = isAggregateBranch(branch) || Boolean(user?.isAggregate);
  // Huquqni SERVER aytadi (`canViewAllBranches`): rol va filiallar soni shart,
  // ikkalasini ham panel o'zi hisoblasa, qoida ikki joyda yashardi.
  const canViewAll = Boolean(user?.canViewAllBranches);

  /**
   * Boshqa filialga (yoki umumiy ko'rinishga) o'tish.
   *
   * ⚠️ `to` — ALMASHGANDAN KEYIN OCHILADIGAN SAHIFA. Umumiy ko'rinishdagi
   * sanoqchi "qaysi filialda qancha" ni ko'rsatadi va o'sha qator bosilganda
   * odam ikki narsani birga kutadi: o'sha filialga o'tishni VA o'sha
   * ro'yxatni ochishni. Almashtirib, keyin qo'lda bo'limni qidirish —
   * kesimning butun ma'nosini yo'qotadi.
   *
   * @param {string} branchId - filial id si yoki `ALL_BRANCHES_ID`
   * @param {{to?: string}} [options] - almashgandan keyingi yo'l
   * @returns {Promise<void>}
   */
  const switchBranch = async (branchId, { to } = {}) => {
    if (!branchId || branchId === branch?.id) return;

    setIsSwitching(true);
    try {
      const res = await authAPI.switchBranch(branchId);
      localStorage.setItem("authToken", res.data.data.token);

      // Keshni tozalash va to'liq qayta yuklash. `queryClient.clear()` dan
      // keyin `reload` — ochiq sahifadagi lokal holat (tanlangan qatorlar,
      // filtrlar, ochiq modallar) ham boshqa filialga tegishli bo'lib
      // qolmasligi kerak.
      //
      // ⚠️ Filial belgilarining xaritasi ham tozalanadi: u faqat umumiy
      // ko'rinishda ma'noli va eski rejimdan qolgan yozuv keyingi amalni
      // boshqa filialga yuborib qo'yishi mumkin edi.
      clearBranchHints();
      queryClient.clear();

      // ⚠️ To'liq QAYTA YUKLASH, router bilan o'tish EMAS: token almashdi va
      // ochiq sahifadagi lokal holat (tanlangan qatorlar, filtrlar, ochiq
      // oynalar) hali eski filialniki. `to` berilsa o'sha manzilga, aks
      // holda shu sahifaga qaytiladi.
      if (to) window.location.assign(to);
      else window.location.reload();
    } finally {
      setIsSwitching(false);
    }
  };

  /** Umumiy ko'rinishga o'tish ("barcha filiallar"). */
  const switchToAll = () => switchBranch(ALL_BRANCHES_ID);

  return {
    branch,
    branches,
    canSwitch,
    isAggregate,
    canViewAll,
    switchBranch,
    switchToAll,
    isSwitching,
  };
};

export default useBranch;
