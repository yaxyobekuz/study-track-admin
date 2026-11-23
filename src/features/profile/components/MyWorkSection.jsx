// Hooks
import useAuth from "@/shared/hooks/useAuth";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import CheckInOutCard from "@/features/myAttendance/components/CheckInOutCard";
import MySalarySummaryCard from "@/features/mySalary/components/MySalarySummaryCard";

// Data
import { SELF_PAYROLL_VISIBLE } from "@/shared/data/selfPayroll.data";

/**
 * PROFILDAGI SHAXSIY QATOR — "men keldim/ketdim" va "mening oyligim".
 *
 * ⚠️ NIMA UCHUN PROFILDA, BOSH SAHIFADA EMAS (biznes qarori, 2026-10-13):
 * admin panelining bosh sahifasi — MAKTAB manzarasi (o'quvchilar, xodimlar,
 * bot, tangalar). Rahbarning O'Z davomati va O'Z oyligi esa shaxsiy
 * ma'lumot: u bosh sahifaning eng tepasida turganda ekranga birinchi
 * bo'lib rahbarning o'z maoshi chiqardi — yonida kim turgani bilan.
 * Ikkala karta ham o'z sahifasida qoladi ("Shaxsiy → Mening davomatim /
 * Mening oyligim"), bu yerda faqat kirish nuqtasi.
 *
 * ⚠️ OWNER'DA CHIZILMAYDI: tizim egasida davomat yozuvi ham, oylik ham
 * yo'q (`attendance.service.js` uni `student` bilan birga rad etadi) —
 * hech qachon ishlamaydigan tugma ko'rsatilmaydi. Sidebardagi "Shaxsiy"
 * bo'limi ham AYNI shartda yashiriladi (`hideForOwner`).
 *
 * ⚠️ RUXSAT KALITI YO'Q: ikkala karta ham faqat tokendagi odam haqida.
 *
 * ⚠️ OYLIK KARTASI VAQTINCHA YOPIQ (`selfPayroll.data.js`, biznes qarori
 * 2026-11-23): xodim o'z oyligini ko'rmaydi, shuning uchun qator faqat
 * davomat kartasidan iborat bo'lib qoladi.
 */
const MyWorkSection = () => {
  const { user } = useAuth();

  if (!user || user.role === "owner") return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start gap-4",
        SELF_PAYROLL_VISIBLE && "lg:grid-cols-2",
      )}
    >
      <CheckInOutCard showTitle />
      {/* Oyligi belgilanmagan xodimda karta o'zini chizmaydi */}
      {SELF_PAYROLL_VISIBLE && <MySalarySummaryCard />}
    </div>
  );
};

export default MyWorkSection;
