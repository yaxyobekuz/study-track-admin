const STORAGE_KEY = "logoutReason";

/**
 * TIZIMDAN NEGA CHIQARILGANINI eslab qoladi — login sahifasi uni ko'rsatadi.
 *
 * ⚠️ 401 da sahifa `/login` ga TO'LIQ qayta yuklanadi va server xabari
 * ("Seans tugatilgan", "Sizning hisobingiz arxivlangan", "Noto'g'ri yoki
 * muddati o'tgan token") yo'qolardi: foydalanuvchi faqat rol tanlash
 * sahifasini ko'rib, nima bo'lganini bilmay qolardi. Qaysi so'rov chiqargani
 * ham saqlanadi — "arxivlashda chiqarib yubordi" kabi holatni tekshirish uchun.
 *
 * @param {object} [error] - axios xatosi
 */
export const saveLogoutReason = (error) => {
  try {
    const { config, response } = error || {};
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        message: response?.data?.message || null,
        request: config ? `${config.method?.toUpperCase()} ${config.url}` : null,
      }),
    );
  } catch {
    // Saqlab bo'lmasa (maxfiy oyna) — login sahifasi sababsiz ochiladi
  }
};

/**
 * Saqlangan sababni BIR MARTA qaytaradi va o'chiradi.
 *
 * @returns {{message: string|null, request: string|null}|null}
 */
export const takeLogoutReason = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
