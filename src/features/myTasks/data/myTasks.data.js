/**
 * "Topshiriqlarim" ekranining statik ma'lumotlari.
 */

/**
 * Soat `hour` ga qo'yilgan, `daysAhead` kun keyingi sana.
 * @param {number} daysAhead
 * @param {number} hour
 */
const atHour = (daysAhead, hour) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d;
};

/**
 * MUDDAT PRESETLARI — biriktirish oynasidagi tez tanlov.
 *
 * ⚠️ Manbaning muddati KO'CHIRILMAYDI (server ham qabul qilmaydi: u o'tgan
 * bo'lishi mumkin, holbuki yangi topshiriq muddati kelajakda bo'lishi
 * shart). Shuning uchun bu ro'yxat shunchaki qulaylik emas — eng ko'p
 * uchraydigan tanlovni bir bosishga qisqartiradi.
 *
 * ⚠️ `issues.data.js` dagi `DUE_PRESETS` bilan shakli bir xil, lekin
 * NUSXA ATAYLAB: ikki bo'lim bitta ro'yxatni bo'lishsa, biri ikkinchisining
 * ichki tuzilishiga bog'lanib qolardi (o'sha fayldagi izoh bilan AYNI
 * mulohaza). Ro'yxat ikki qatorlik.
 */
export const DELEGATE_DUE_PRESETS = [
  { label: "Bugun 18:00", build: () => atHour(0, 18) },
  { label: "Ertaga", build: () => atHour(1, 18) },
  { label: "3 kun", build: () => atHour(3, 18) },
  { label: "1 hafta", build: () => atHour(7, 18) },
];
