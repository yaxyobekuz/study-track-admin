// React
import { useMemo, useState } from "react";

// Icons
import { BookOpen, CalendarDays, Lock, Target, Trophy } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import KpiCards from "../components/KpiCards";
import {
  AttendanceTrendChart,
  DistributionCard,
  SubjectChart,
} from "../components/ChartCards";
import {
  ClassesCard,
  LevelsCard,
  TeachersCard,
  TopStudentsCard,
} from "../components/TableCards";
import { AchievementsCard, ClubsCard, ManageButton } from "../components/SideCards";
import { TargetsModal } from "../components/TargetsModal";
import { AchievementsModal } from "../components/AchievementsModal";
import { ClubsModal } from "../components/ClubsModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { buildMonthOptions, currentMonthKey, prevMonthKey } from "@/shared/helpers/month.helpers";

// Queries
import { academicQueries } from "../queries/academicDashboard.queries";

/**
 * TA'LIM DASHBOARDI — o'quv bo'limining bosh ekrani.
 *
 * Bitta ekranda: oltita KPI, fanlar kesimi, sinflar reytingi, 12 oylik
 * davomat dinamikasi, baholar taqsimoti, fanlar bo'yicha eng yaxshi
 * o'quvchilar, o'qituvchilar samaradorligi, olimpiada yutuqlari va
 * to'garaklar.
 *
 * ⚠️ MOLIYA DASHBOARDI BILAN BIR XIL SHAKL: bir xil karta qobig'i
 * (`DashboardCard`), bir xil boshqaruv paneli (oy + taqqoslash oyi), bir
 * xil KPI kartasi. Foydalanuvchi ikkalasini bitta tizim deb o'qiydi —
 * ikki xil ko'rinish uni har o'tishda qaytadan mo'ljal olishga majbur
 * qilardi.
 *
 * ⚠️ BITTA SO'ROV, sababi ham bitta: moliya tomonida KPI alohida so'rov
 * edi (u boshqa jadvallarga borardi), bu yerda esa hamma blok AYNI
 * jadvallardan yig'iladi — ikkiga bo'lish faqat ikkinchi marta o'sha
 * baholarni sanashga olib kelardi.
 *
 * ⚠️ RUXSAT: `education.view` — ko'rish, `education.plan` — reja
 * belgilash. Sahifada ROLGA qarab tekshiruv YO'Q: rol emas, ruxsat hal
 * qiladi (moliya dashboardi bilan bir xil qoida).
 */
const AcademicDashboardPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();

  const allowed = can("education.view");
  const canPlan = can("education.plan");
  const canSeeAchievements = can("achievements.view");
  const canSeeClubs = can("clubs.view");

  const [month, setMonth] = useState(() => String(currentMonthKey()));
  const [compareMonth, setCompareMonth] = useState(() =>
    String(prevMonthKey(currentMonthKey())),
  );

  // Kelajakdagi oyning ma'lumoti bo'lmaydi — ro'yxat joriy oyda tugaydi
  const monthOptions = useMemo(() => buildMonthOptions({ back: 23, forward: 0 }).reverse(), []);

  // Taqqoslash oyi tanlangan oydan OLDIN bo'lishi shart (server ham
  // tekshiradi) — ro'yxatdan keyingi oylar olib tashlanadi
  const compareOptions = useMemo(
    () => monthOptions.filter((option) => Number(option.value) < Number(month)),
    [monthOptions, month],
  );

  // Oy o'zgarganda taqqoslash oyi undan keyinda qolib ketishi mumkin —
  // avtomatik oldingi oyga tushiriladi
  const safeCompareMonth = useMemo(() => {
    if (Number(compareMonth) < Number(month)) return compareMonth;
    return String(prevMonthKey(Number(month)));
  }, [compareMonth, month]);

  const overview = useQuery({
    ...academicQueries.overview({ month, compareMonth: safeCompareMonth }),
    enabled: allowed,
  });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Ta'lim dashboardini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const state = {
    data: overview.data,
    isLoading: overview.isLoading,
    isError: overview.isError,
  };

  return (
    <div className="space-y-4 pb-10">
      {/* ── Boshqaruv paneli: oy, taqqoslash oyi va reja ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 xs:p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">Ta'lim ko'rsatkichlari</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {overview.data
              ? `${overview.data.monthLabel} — ${overview.data.compareMonthLabel} bilan taqqoslanmoqda`
              : "Yuklanmoqda…"}
          </p>
        </div>

        {/* ⚠️ Ikki tanlagich YONMA-YON turadi va ikkalasi ham oy
            ko'rsatadi — yorliqsiz ular bir xil boshqaruvdek ko'rinardi.
            Chapdagisi "qaysi oyni ko'ryapmiz", o'ngdagisi "nima bilan
            solishtiramiz". */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-gray-400" />
            <Select
              triggerClassName="min-w-36"
              value={month}
              options={monthOptions}
              onChange={setMonth}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium text-gray-500">Taqqoslash:</span>
            <Select
              triggerClassName="min-w-36"
              value={safeCompareMonth}
              options={compareOptions}
              onChange={setCompareMonth}
            />
          </div>

          {canPlan && (
            <Button
              variant="outline"
              onClick={() => openModal("academicTargets", { month: Number(month) })}
            >
              <Target className="size-4" />
              Reja
            </Button>
          )}
        </div>
      </div>

      {/* ── 1-qator: oltita KPI kartasi ──────────────────────────────── */}
      <KpiCards data={overview.data} isLoading={overview.isLoading} />

      {/* ── 2-qator: fanlar diagrammasi (keng) + sinflar jadvali ─────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SubjectChart {...state} className="xl:col-span-2" />
        <ClassesCard {...state} />
      </div>

      {/* ── 3-qator: davomat dinamikasi (keng) + baholar taqsimoti ───── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AttendanceTrendChart {...state} className="xl:col-span-2" />
        <DistributionCard {...state} />
      </div>

      {/* ── 4-qator: top o'quvchilar + sinf darajalari ───────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopStudentsCard {...state} />
        <LevelsCard {...state} />
      </div>

      {/* ── 5-qator: o'qituvchilar KPI si (to'liq kenglik) ───────────── */}
      <TeachersCard {...state} />

      {/* ── 6-qator: olimpiada + to'garaklar ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* ⚠️ Blok ruxsatsiz ham KO'RINADI (raqam dashboardning bir qismi),
            lekin "Boshqarish" tugmasi faqat ruxsat bilan chiqadi: ko'rish
            va kiritish alohida qarorlar */}
        <AchievementsCard
          {...state}
          action={
            canSeeAchievements ? (
              <ManageButton
                icon={Trophy}
                label="Yutuqlar"
                onClick={() => openModal("academicAchievements", { month: Number(month) })}
              />
            ) : null
          }
        />
        <ClubsCard
          {...state}
          action={
            canSeeClubs ? (
              <ManageButton
                icon={BookOpen}
                label="To'garaklar"
                onClick={() => openModal("academicClubs")}
              />
            ) : null
          }
        />
      </div>

      <TargetsModal />
      <AchievementsModal />
      <ClubsModal />
    </div>
  );
};

export default AcademicDashboardPage;
