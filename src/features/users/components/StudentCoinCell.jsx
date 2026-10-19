// Utils
import { cn } from "@/shared/utils/cn";

/**
 * O'quvchilar ro'yxatidagi TANGA katagi.
 *
 * Ikki kesim bitta ustunda ko'rsatilgani uchun raqamning O'ZI ham qaysi
 * kesim ekanini aytib turishi kerak: qoldiq — oddiy son, haftalik topilgan
 * tanga esa ishora bilan (`+120`). Aks holda sarlavhani o'qimagan odam
 * "nega hammaning tangasi kamayib qoldi" deb o'ylardi.
 *
 * @param {object} props
 * @param {{coinBalance?: number, periodCoins?: number}} props.user
 * @param {boolean} props.isWeekly
 */
const StudentCoinCell = ({ user, isWeekly }) => {
  if (!isWeekly) {
    return <span className="text-gray-500">{user.coinBalance ?? 0}</span>;
  }

  const earned = user.periodCoins;

  // ⚠️ Hisoblanmagan qiymat NOL deb ko'rsatilmaydi (eski server, javobda
  // maydon yo'q): "0 tanga topgan" bilan "hisoblanmagan" ni aralashtirish
  // jim yolg'on bo'lardi.
  if (typeof earned !== "number") {
    return <span className="text-gray-400">—</span>;
  }

  if (earned === 0) return <span className="text-gray-400">0</span>;

  return (
    <span
      className={cn(
        "font-medium",
        earned > 0 ? "text-amber-600" : "text-red-600",
      )}
      // Manfiy qiymat — qo'lda olib qo'yilgan tanga (`manual_take`),
      // sarflangani emas: do'kon xaridi haftalik hisobga umuman kirmaydi.
      title={
        earned > 0
          ? "Tanlangan haftada topilgan tanga"
          : "Tanlangan haftada qaytarib olingan tanga"
      }
    >
      {earned > 0 ? `+${earned}` : earned}
    </span>
  );
};

export default StudentCoinCell;
