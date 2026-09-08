// React
import { useState } from "react";

// Icons
import { Lock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import HeroSummary from "../components/HeroSummary";
import HoursCurve from "../components/HoursCurve";
import HoursFlow from "../components/HoursFlow";
import LoadRanking from "../components/LoadRanking";
import ModeSplit from "../components/ModeSplit";
import MonthPicker from "../components/MonthPicker";
import TeacherHoursModal from "../components/TeacherHoursModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { currentMonthKey, formatMonthKey } from "@/shared/helpers/month.helpers";

// Data & queries
import { gridDelay } from "../data/ledger.tokens";
import { lessonHoursQueries } from "../queries/lessonHours.queries";

/**
 * DARS SOATLARI — BOSHLIQ KO'RINISHI.
 *
 * Ekran bitta savolga javob beradi: "shu oyda maktab qancha soat oldi va
 * buning uchun qancha to'laydi".
 *
 * ⚠️ HAR BLOK O'Z HOLATINI CHIZADI (`Panel` ichida). Sahifa darajasidagi
 * "Yuklanmoqda..." bitta sekin blok tufayli butun ekranni bo'shatib
 * qo'yardi (`FinanceDashboardPage` bilan bir xil naqsh).
 *
 * ⚠️ RUXSAT SAHIFA DARAJASIDA HAM TEKSHIRILADI. Router darvozasi bor,
 * lekin bo'lim ichida ikkita boshqa-boshqa ruxsatli tab bor va
 * foydalanuvchi manzilni qo'lda kiritishi mumkin.
 */
const LessonHoursOverviewPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal("teacherHours");

  // ⚠️ HOLAT — RAQAM (YYYYMM), ISO satr emas. Ilgari bu yerda
  // `<input type="month">` uchun "2026-09" satri turardi va u har
  // renderda ikki marta aylantirilardi. Tanlagich endi o'z tanlovini
  // to'g'ridan-to'g'ri oy kaliti bilan beradi.
  const [month, setMonth] = useState(currentMonthKey());

  const { data, isLoading, isError } = useQuery(
    lessonHoursQueries.overview({ month }),
  );

  if (!can("payroll.hours")) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Dars soatlari hisobotini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const state = { data, isLoading, isError };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <MonthPicker month={month} onChange={setMonth} />
      </div>

      <HeroSummary
        {...state}
        monthLabel={data?.monthLabel ?? formatMonthKey(month)}
      />

      {/* Ta'til oyi — bu holatni jim qoldirib bo'lmaydi: ekranda hamma
          raqam nol turadi va sabab ko'rinmasa "tizim buzuq" deb o'qiladi. */}
      {data?.isVacationMonth && (
        <Card className="border-0 bg-amber-50 py-3">
          <p className="text-[12.5px] font-medium text-amber-900">
            {data.monthLabel} — ta'til oyi. Bu oyda dars o'tilmaydi, shuning
            uchun soat hisoblanmaydi. Fiksa oylik esa odatdagidek to'lanadi.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HoursCurve {...state} delay={gridDelay(0)} />
        </div>
        <ModeSplit {...state} delay={gridDelay(1)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <HoursFlow {...state} delay={gridDelay(2)} />
        {/* ⚠️ VEDOMOSTGA O'TILMAYDI, MODAL OCHILADI. Ilgari bu yerda
            `?teacher=&month=` bilan navigatsiya bor edi — lekin vedomost
            sahifasi URL parametrlarini umuman O'QIMAYDI (oyni o'z
            `useState` idan oladi), ya'ni bosish "hech narsa bo'lmadi" deb
            o'qilardi. Kerak bo'lgan narsa esa aynan shu modal. */}
        <LoadRanking
          {...state}
          delay={gridDelay(3)}
          onSelect={(row) =>
            openModal("teacherHours", { staffId: row.staffId, month })
          }
        />
      </div>

      <TeacherHoursModal />
    </div>
  );
};

export default LessonHoursOverviewPage;
