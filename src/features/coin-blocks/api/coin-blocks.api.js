import http from "@/shared/api/http";

/**
 * TANGA CHEKLOVI — qarzdor o'quvchiga tanga berishni to'xtatish.
 * Yadro serverda: `services/coinBlock.service.js` (darvoza ham shu yerda).
 */
export const coinBlocksAPI = {
  /** Registr: `status=active` (sukut) yoki `status=revoked` (tarix). */
  getAll: (params) => http.get("/coins/blocks", { params }),

  /** Kartalar: nechta cheklangan, jami joriy qarz, qarzi yopilganlar. */
  getSummary: () => http.get("/coins/blocks/summary"),

  /** Cheklash uchun tanlov ro'yxati (sukut bo'yicha — qarzdorlar). */
  getCandidates: (params) => http.get("/coins/blocks/candidates", { params }),

  /** BIR NECHTA o'quvchini bir amalda cheklash. */
  create: (data) => http.post("/coins/blocks", data),

  /** Cheklovni olib tashlash (sabab majburiy). */
  unblock: (data) => http.post("/coins/blocks/unblock", data),
};
