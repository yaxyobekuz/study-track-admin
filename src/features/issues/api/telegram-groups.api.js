import http from "@/shared/api/http";

// BOT GURUHLARI — "Muammolar → Bot sozlamalari" tabi.
//
// ⚠️ PREFIKS `/telegram-groups`, `/issues` EMAS: reyestr PLATFORMA
// schema'sida yashaydi (serverda `telegramGroup.service.js`), muammolar esa
// filialda. Tab muammolar bo'limi ichida bo'lsa ham, ma'lumot boshqa
// qatlamdan keladi.
//
// ⚠️ `chatId` — Telegram beradigan son va MANFIY bo'ladi ("-1001234..."),
// ObjectId emas. URL'da `encodeURIComponent` bilan uzatiladi.
export const telegramGroupsAPI = {
  getAll: () => http.get("/telegram-groups"),

  // Saqlangan guruhlarni Telegram'dan qayta tekshiradi (nom, holat,
  // huquqlar). ⚠️ YANGI GURUH TOPMAYDI — Telegram Bot API bunga imkon
  // bermaydi, ro'yxat botga kelgan hodisadan to'planadi.
  refresh: () => http.post("/telegram-groups/refresh"),

  setOfficial: (chatId, isOfficial) =>
    http.patch(`/telegram-groups/${encodeURIComponent(chatId)}/official`, {
      isOfficial,
    }),
};
