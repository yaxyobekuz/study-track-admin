/**
 * Telefon raqami — ko'rsatish va `tel:` havola yordamchilari.
 *
 * Bazada raqam `+998XXXXXXXXX` (12 raqam) ko'rinishida yotadi, serverda
 * normalizatsiya qilinadi. Bu yerda faqat EKRAN uchun bo'laklarga ajratiladi:
 * `+998 90 123 45 67`. Boshqa uzunlikdagi (eski/yaroqsiz) qiymat bo'lsa
 * borligicha ko'rsatiladi — yashirib qo'yish raqamni yo'qotgandek tuyulardi.
 */

/** Faqat raqamlar. */
const digitsOf = (value) => String(value ?? "").replace(/\D/g, "");

/**
 * `+998901234567` → `+998 90 123 45 67`. Bo'sh qiymat → `—`.
 * @param {string|null|undefined} value
 * @returns {string}
 */
export const formatPhoneUz = (value) => {
  if (!value) return "—";
  const d = digitsOf(value);
  if (d.length === 12 && d.startsWith("998")) {
    return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
  }
  return String(value);
};

/**
 * `tel:` havolasi uchun qiymat (`tel:+998901234567`). Bo'sh bo'lsa `null`.
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export const toTelHref = (value) => {
  const d = digitsOf(value);
  if (!d) return null;
  return `tel:+${d}`;
};

/** Raqam kiritilganmi (ekranda tugma chizish uchun). */
export const hasPhone = (value) => digitsOf(value).length > 0;
