/**
 * Ballni 2 xonali kasr va o'zbekcha (vergulli) ko'rinishda formatlaydi.
 * Misol: 165.92 -> "165,92"
 * @param {number|string} value
 * @returns {string}
 */
export const formatScore = (value) =>
  Number(value ?? 0).toLocaleString("uz-UZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
