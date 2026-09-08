// Icons
import { CalendarPlus } from "lucide-react";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";

// Components
import MyExcusesList from "../components/MyExcusesList";
import CheckInOutCard from "../components/CheckInOutCard";
import Button from "@/shared/components/ui/button/Button";
import MyExcuseRequestModal from "../components/MyExcuseRequestModal";
import UserAttendancePanel from "@/features/attendance/components/UserAttendancePanel";

// Queries
import { myAttendanceQueries } from "../queries/myAttendance.queries";

/**
 * MENING DAVOMATIM — xodimning o'zini davomatdan o'tkazish sahifasi.
 *
 * ⚠️ RUXSAT TALAB QILMAYDI va route guard'i YO'Q. Admin panelga kiradigan
 * xodim (rahbar, ma'mur, moliyachi) ham xuddi o'qituvchi kabi ishga keladi:
 * ilgari bu ekran faqat `teacher`/`worker` panellarida bo'lgani uchun ular
 * o'zlarini umuman qayd eta olmasdi. Ma'muriy davomat bo'limi (`/attendance`)
 * esa avvalgidek `attendance.view` ortida qoladi — ikkalasi boshqa-boshqa
 * savolga javob beradi: "men keldimmi" va "kim keldi".
 *
 * Oylik tarix ma'muriy paneldagi bilan AYNI komponentda ko'rsatiladi, faqat
 * ma'lumot manbai boshqa (`/attendance/my`) — bir xil ekran ikki marta
 * yozilsa, ikkisi vaqt o'tib bir-biridan farq qilib ketardi.
 */
const MyAttendancePage = () => {
  const { user } = useAuth();
  const { openModal } = useModal();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Mening davomatim</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Kelgan-ketganingizni o&apos;zingiz qayd etasiz va tarixini shu yerda
          ko&apos;rasiz.
        </p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CheckInOutCard />

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => openModal("myExcuseRequest")}
          >
            <CalendarPlus strokeWidth={1.5} />
            Uzrli yo&apos;qlik so&apos;rovi
          </Button>

          <MyExcusesList />
        </div>
      </div>

      {/* Oylik tarix — ma'muriy panel bilan bir xil ko'rinish, boshqa manba */}
      {user?.id && (
        <UserAttendancePanel
          user={user}
          variant="staff"
          title="Oylik tarixim"
          buildQuery={(month, year) => myAttendanceQueries.month(month, year)}
        />
      )}

      <MyExcuseRequestModal />
    </div>
  );
};

export default MyAttendancePage;
