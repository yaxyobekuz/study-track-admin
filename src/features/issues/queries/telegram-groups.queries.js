// TanStack Query
import { queryOptions } from "@tanstack/react-query";

// Shared
import { createQueryKeys } from "@/shared/lib/query";

// API
import { telegramGroupsAPI } from "../api/telegram-groups.api";

// ⚠️ MUAMMOLAR KALITIDAN ALOHIDA (`issuesKeys` emas): guruhlar reyestri
// PLATFORMA ma'lumoti, muammolar esa filialning. Bitta kalit ostida
// turishsa, muammo holatini o'zgartirish guruhlar ro'yxatini ham
// bekor qilib, keraksiz so'rov yuborardi.
export const telegramGroupsKeys = createQueryKeys("telegram-groups");

export const telegramGroupsQueries = {
  /**
   * Bot ko'rgan guruhlar → har biri `isAdmin` / `isPresent` bilan.
   *
   * ⚠️ Holat satrini (`"administrator"`, `"restricted"`) panel QAYTA
   * TALQIN QILMAYDI — serverda hisoblangan bayroqlar ishlatiladi
   * (`telegramGroup.service.js#listGroups`), aks holda "admin nimani
   * bildiradi" degan savolga ikki joyda javob berilardi.
   */
  list: () =>
    queryOptions({
      queryKey: telegramGroupsKeys.lists(),
      queryFn: () => telegramGroupsAPI.getAll().then((r) => r.data.data),
    }),
};
