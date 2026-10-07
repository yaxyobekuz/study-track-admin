// Server javoblari: `{ success:false, message, details:{ reason, codes } }`

export const errorStatus = (err) => err?.response?.status ?? null;
export const errorMessage = (err, fallback = "Xatolik yuz berdi") =>
  err?.response?.data?.message || fallback;
export const errorDetails = (err) => err?.response?.data?.details ?? {};

/** Ko'rib chiqilgandan keyin ma'lumot o'zgargan — qayta ko'rib chiqish kerak. */
export const isStalePlan = (err) =>
  errorStatus(err) === 409 && errorDetails(err).reason === "stale_plan";

/** Server "tasdiqlanmagan" degan oqibatlar kodlari. */
export const missingAckCodes = (err) =>
  errorDetails(err).reason === "not_acknowledged" ? errorDetails(err).codes ?? [] : [];

/** Joriy oyning 1-kuni — ko'chish sanasi undan erta bo'lmaydi (server qoidasi). */
export const monthStartInputValue = (today) => `${today.slice(0, 8)}01`;

/**
 * Ko'rib chiqish ro'yxati tartibi: to'siqlilar, keyin ogohlantirishlilar —
 * e'tibor kerak bo'lgani tepada.
 */
export const sortPlanItems = (items = []) => {
  const rank = (item) => (item.status === "blocked" ? 0 : item.warnings?.length ? 1 : 2);
  return [...items].sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label));
};

/** Qarzi bormi (summa satr — frontend hisob qilmaydi, faqat nolga solishtiradi). */
export const hasMoney = (value) => Number(value ?? 0) > 0;
