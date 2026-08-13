/**
 * Pul summasini ko'rsatish uchun formatlaydi: "450000.00" → "450 000 so'm".
 *
 * Backend summani DOIM 2 xonali STRING sifatida qaytaradi (Postgres NUMERIC),
 * chunki JS'ning `number` turi katta summalarda aniqlikni yo'qotadi.
 * Shuning uchun:
 *
 *   - bu yerda faqat KO'RSATISH uchun `Number()` ga o'giriladi;
 *   - frontendda summalar ustida arifmetika qilinmaydi — yig'indi/farq
 *     kerak bo'lsa, uni backend hisoblab beradi.
 *
 * Ilgari `Intl.NumberFormat("uz-UZ")` uch joyda nusxalangan edi
 * (jarimalar, premium) — yangi nusxa yozish o'rniga shu funksiya ishlatiladi.
 */

// Butun summa kasrsiz ko'rsatiladi ("450 000"), tiyinli summa esa to'liq
// ikki xona bilan ("600 000,50") — bitta xona bilan qisqartirilsa, summa
// noto'g'ri o'qilishi mumkin.
const wholeFormatter = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 0,
});

const fractionalFormatter = new Intl.NumberFormat("uz-UZ", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * @param {string|number|null|undefined} value - summa (odatda "450000.00")
 * @param {object} [options]
 * @param {string} [options.fallback="—"] - qiymat bo'lmasa ko'rsatiladigan matn
 * @param {boolean} [options.withLabel=true] - "so'm" qo'shilsinmi
 * @returns {string}
 */
export const formatMoney = (value, { fallback = "—", withLabel = true } = {}) => {
  if (value == null || value === "") return fallback;

  const amount = Number(value);
  if (Number.isNaN(amount)) return fallback;

  const formatter = Number.isInteger(amount)
    ? wholeFormatter
    : fractionalFormatter;

  return withLabel
    ? `${formatter.format(amount)} so'm`
    : formatter.format(amount);
};

export default formatMoney;
