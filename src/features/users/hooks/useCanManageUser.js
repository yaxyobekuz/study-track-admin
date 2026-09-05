// Hooks
import useAuth from "@/shared/hooks/useAuth";

/**
 * "Bu odamni men boshqara olamanmi?" — serverdagi `assertCanManageUser`
 * ning UI ko'zgusi.
 *
 * ⚠️ Bu HIMOYA EMAS, faqat ko'rinish qatlami: haqiqiy tekshiruv har so'rovda
 * serverda bo'ladi (`middleware/userScope.middleware.js`). Bu yerdagi
 * maqsad — bosilganda 403 beradigan tugmani ko'rsatmaslik.
 *
 * ⚠️ Qoida FAQAT O'QITUVCHIGA tegishli. Qabulxona va ma'muriyat butun
 * ro'yxatni boshqaradi (ularning ishi shu), o'qituvchi esa faqat O'ZI
 * QO'SHGAN o'quvchini: `users.update` ruxsati unga berilganda ham u
 * boshqa o'qituvchining o'quvchisini tahrirlay olmasligi kerak.
 *
 * ⚠️ `createdBy = null` — "hech kim qo'shmagan" (tizimga o'tishdan
 * oldingi qatorlar). Ular o'qituvchiga OCHILMAYDI: eski ma'lumot
 * egasizligi sababli hammaga ochiq bo'lib qolardi.
 *
 * @param {{ id?: string, role?: string, createdBy?: string|null }} target
 * @returns {boolean}
 */
const useCanManageUser = (target) => {
  const { user } = useAuth();

  if (!user || !target) return false;
  if (user.role !== "teacher") return true;

  return target.role === "student" && target.createdBy === user.id;
};

export default useCanManageUser;
