import http from "@/shared/api/http";

// GURUH SIGNALLARI — "Muammolar → Guruh signallari" tabi.
//
// ⚠️ PREFIKS `/group-signals`, `/issues` EMAS: signallar PLATFORMA
// schema'sida (guruh birorta filialga tegishli emas), muammolar esa
// filialda. Biriktirilganda server ikkalasiga ham yozadi.
//
// ⚠️ SIGNAL — MUAMMO EMAS. Bu AI chiqargan taxmin; muammolar ro'yxatiga
// faqat odam kategoriya tanlab biriktirgandan keyin tushadi.
export const groupSignalsAPI = {
  getAll: (params) => http.get("/group-signals", { params }),

  getCounts: () => http.get("/group-signals/counts"),

  // TEZKOR BIRIKTIRISH — faqat kategoriya so'raladi, qolgani signaldan
  // ko'chiriladi (matn, iqtibos, guruh nomi, xabar havolasi).
  attach: (id, categoryId) =>
    http.post(`/group-signals/${id}/attach`, { categoryId }),

  // "Bu muammo emas" — signal o'chirilmaydi, belgilanadi.
  dismiss: (id) => http.post(`/group-signals/${id}/dismiss`),
};
