// Hooks
import useAuth from "@/shared/hooks/useAuth";

// Components
import CheckInOutCard from "@/features/myAttendance/components/CheckInOutCard";
import MySalarySummaryCard from "@/features/mySalary/components/MySalarySummaryCard";

/**
 * BOSH SAHIFADAGI SHAXSIY QATOR — "men keldim/ketdim" va "mening oyligim".
 *
 * ⚠️ NIMA UCHUN BOSH SAHIFADA: o'qituvchi va xodim panellarida bu ikkisi
 * bosh sahifada turadi, admin panelda esa yo'q edi — admin panelga
 * kiradigan rahbar/ma'mur ishga kelganini qayd etish uchun bo'limni qidirib
 * yurishi kerak bo'lardi. Ikkala karta ham o'z sahifasida ham bor
 * ("Shaxsiy → Mening davomatim / Mening oyligim"), bu yerda faqat kirish
 * nuqtasi (bo'limdagi "ikki kirish nuqtasi, bitta ekran" naqshi).
 *
 * ⚠️ OWNER'DA CHIZILMAYDI: tizim egasida davomat yozuvi ham, oylik ham
 * yo'q (`attendance.service.js` uni `student` bilan birga rad etadi) —
 * hech qachon ishlamaydigan tugma ko'rsatilmaydi. Sidebardagi "Shaxsiy"
 * bo'limi ham AYNI shartda yashiriladi (`hideForOwner`).
 *
 * ⚠️ RUXSAT KALITI YO'Q: ikkala karta ham faqat tokendagi odam haqida.
 */
const MyWorkSection = () => {
  const { user } = useAuth();

  if (!user || user.role === "owner") return null;

  return (
    <div className="mb-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
      <CheckInOutCard showTitle />
      {/* Oyligi belgilanmagan xodimda karta o'zini chizmaydi */}
      <MySalarySummaryCard />
    </div>
  );
};

export default MyWorkSection;
