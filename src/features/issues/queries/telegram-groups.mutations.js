// TanStack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { telegramGroupsAPI } from "../api/telegram-groups.api";

// Keys
import { telegramGroupsKeys } from "./telegram-groups.queries";

/**
 * TEKSHIRISH — saqlangan guruhlarni Telegram'dan qayta o'qiydi.
 *
 * ⚠️ YANGI GURUH TOPMAYDI va buni foydalanuvchiga tushuntirish kerak:
 * Telegram Bot API "qaysi guruhlarda adminman" degan savolga javob
 * bermaydi, shuning uchun tekshirish faqat MAVJUD qatorlarni yangilaydi
 * (nom, holat, huquqlar). Javobdagi sanoqlar shu uchun ko'rsatiladi.
 */
export const useRefreshTelegramGroups = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => telegramGroupsAPI.refresh().then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: telegramGroupsKeys.all }),
  });
};

/**
 * RASMIY GURUH belgisini qo'yish / olib tashlash.
 *
 * ⚠️ SERVER RAD ETISHI MUMKIN: bot admin bo'lmagan guruhni "rasmiy" deb
 * belgilash taqiqlangan. Tugma admin bo'lmagan qatorda ko'rsatilmaydi,
 * lekin ro'yxat eskirgan bo'lishi mumkin (botni shu orada adminlikdan
 * tushirishgan) — shuning uchun xato matnini ko'rsatish kerak.
 */
export const useSetTelegramGroupOfficial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, isOfficial }) =>
      telegramGroupsAPI.setOfficial(chatId, isOfficial).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: telegramGroupsKeys.all }),
  });
};
