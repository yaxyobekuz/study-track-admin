// Icons
import { Wallet } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAuth from "@/shared/hooks/useAuth";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import MyDeductionsSection from "../components/MyDeductionsSection";
import MySuspensionsSection from "../components/MySuspensionsSection";
import StaffPayrollTab from "@/features/users/components/detail/StaffPayrollTab";

// Queries
import { mySalaryQueries } from "../queries/mySalary.queries";

/**
 * MENING OYLIGIM — "qancha olaman va qanchasi hali to'lanmagan".
 *
 * ⚠️ RUXSAT TALAB QILMAYDI va route guard'i YO'Q (`/my-attendance` bilan
 * AYNI mulohaza). `payroll.view` — BUTUN shtatning oyligini ochadigan huquq;
 * o'z oyligini ko'rish esa har bir xodimning ishi. Ilgari bu ekran faqat
 * o'qituvchi va xodim panellarida bo'lgani uchun admin panelga kiradigan
 * rahbar/ma'mur o'z oyligini umuman ko'ra olmasdi — endi u ham xuddi
 * boshqa xodimlar kabi ko'radi. Tizim egasida (owner) oylik yo'q, shuning
 * uchun bo'lim unga sidebarda ko'rsatilmaydi (`hideForOwner`).
 *
 * FAQAT O'QISH uchun: oylikni belgilash, to'lash, ushlab qolish va bekor
 * qilish — "Moliya → Xodimlar oyligi" bo'limida, o'z ruxsatlari ortida.
 *
 * Ekranning o'zi xodim kartasidagi "Oylik" tabi bilan BITTA komponent
 * (`StaffPayrollTab`), faqat manbasi boshqa: `/payroll/salaries/my` va
 * `/payroll/my`. Ikkita nusxa bo'lsa, biriga qo'shilgan ustun ikkinchisida
 * unutilardi.
 */
const MySalaryPage = () => {
  const { user, loading } = useAuth();

  // Joriy oy hali shakllantirilmagan bo'lsa summa shu jonli hisobdan
  // ko'rsatiladi (ixtiyoriy so'rov: yiqilsa ekran baribir ishlaydi).
  //
  // ⚠️ Owner'ga YUBORILMAYDI: unda oylik yo'q, lekin so'rov serverda
  // oylik dvigatelini bekordan-bekor ishga tushirardi.
  const { data: stats } = useQuery({
    ...mySalaryQueries.stats(),
    enabled: Boolean(user) && user.role !== "owner",
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Mening oyligim</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Oylik qoidangiz, har oy hisoblangan summa, to&apos;lovlar va
          ayirmalar — sabablari bilan.
        </p>
      </div>

      {loading || !user ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : user.role === "owner" ? (
        /* Tizim egasiga oylik biriktirilmaydi — havola bilan kirilsa ham
           bo'sh jadval emas, ochiq sabab ko'rsatiladi. */
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Wallet}
            title="Tizim egasida oylik yo'q"
            description="Oylik majburiyati xodimlarga hisoblanadi. Xodimlarning oyligi 'Moliya → Xodimlar oyligi' bo'limida."
          />
        </Card>
      ) : (
        <>
          <StaffPayrollTab
            self
            user={user}
            stats={stats}
            salaryQuery={mySalaryQueries.rules()}
            entriesQuery={mySalaryQueries.entries()}
          />

          {/* Sabab + izoh bilan: muhrlangan tarkibda izoh yo'q */}
          <MyDeductionsSection />
          <MySuspensionsSection />
        </>
      )}
    </div>
  );
};

export default MySalaryPage;
