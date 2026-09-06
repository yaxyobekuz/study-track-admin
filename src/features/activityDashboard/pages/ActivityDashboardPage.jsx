// React
import { useMemo, useState } from "react";

// Icons
import { CalendarRange, Lock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Select from "@/shared/components/ui/select/Select";
import PulseHero from "../components/PulseHero";
import MetricStrip from "../components/MetricStrip";
import TrendChart from "../components/TrendChart";
import ClassCoverage from "../components/ClassCoverage";
import { HourHeatmap, ChannelSplit } from "../components/RhythmPanel";
import { DeliveryPanel, ActionsPanel } from "../components/DeliveryPanels";
import SubjectSheet from "../components/SubjectSheet";
import ClassSheet from "../components/ClassSheet";
import {
  ActiveStaffPanel,
  SilentStaffPanel,
  SilentParentsPanel,
  UnlinkedPanel,
} from "../components/PeoplePanels";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { activityQueries } from "../queries/activity.queries";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { DELAY, MOTION, T, gridDelay } from "../data/pulse.tokens";

/**
 * FAOLLIK DASHBOARDI — "tizimdan KIM foydalanyapti?".
 *
 * ⚠️ TA'LIM / MOLIYA / INVENTAR DASHBOARDLARIDAN BOSHQA SAVOL. Ular
 * NATIJANI o'lchaydi (baho, pul, mulk), bu esa JALB QILINGANLIKNI:
 * ota-ona botni ochdimi, o'qituvchi panelga kirdimi. Ikkinchisi
 * boshqacha qaror chiqaradi — "bu sinfning ota-onalari xabarni
 * ko'rmayapti, sinf rahbariga aytish kerak" yoki "bu o'qituvchi bir
 * oydan beri tizimga kirmagan". Dizayn tili ham shu sababdan alohida
 * (`pulse.tokens.js` sarlavhasidagi to'liq izoh).
 *
 * ⚠️ DAVR — KUN, OY EMAS. Qolgan uchala dashboard oy bilan ishlaydi,
 * chunki ular moliyaviy/o'quv davriga bog'langan. Faollik esa kunlik
 * hodisa: "bugun nechta ota-ona kirdi" degan savolning oylik javobi
 * yo'q. Shuning uchun tanlagichda 7 / 14 / 30 / 90 kun turadi.
 *
 * ⚠️ BIR EKRANLI REJIM (`fitscreen`) YO'Q — inventar dashboardidagi
 * bilan bir xil sabab: issiqlik xaritasi va diagrammalarning
 * balandligi MA'NO tashiydi, viewportga qulflansa ular yassilanib
 * o'qib bo'lmas holga kelardi.
 *
 * ⚠️ IKKI RUXSAT: `activity.view` butun ekranni ochadi,
 * `activity.roster` esa FOYDALANMAYOTGANLARNING ISM-RO'YXATINI.
 * Ikkinchisini server hal qiladi (`roster.available`) — bu yerda
 * qo'shimcha tekshiruv yo'q, aks holda ikkita haqiqat manbai bo'lardi.
 */

/** 12-ustunli bento to'r — blok kengligi uning og'irligini bildiradi. */
const GRID = "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12";

/**
 * GRANULYARLIK — kunlik / haftalik / oylik.
 *
 * ⚠️ HAR GRANULYARLIKNING O'Z VARIANTLARI BOR. "30" degan raqam
 * kunlikda ham, haftalikda ham turishi mumkin edi-yu, foydalanuvchi
 * qaysi birini tanlaganini bilmasdi. Shuning uchun tanlagich birlikni
 * ham yozadi: "12 hafta", "6 oy".
 *
 * ⚠️ RO'YXAT SERVER BILAN AYNAN BIR XIL (`activityDashboard.service.js`
 * dagi `GRANULARITY`). Server javobda o'z variantlarini ham qaytaradi
 * (`period.granularities`) — mos kelmagan qiymat 400 bilan rad etiladi,
 * ya'ni bu yerdagi nusxa faqat birinchi renderda kerak.
 */
const GRAIN_OPTIONS = [
  { value: "day", label: "Kunlik", unit: "kun", counts: [7, 14, 30, 90], fallback: 30 },
  { value: "week", label: "Haftalik", unit: "hafta", counts: [4, 8, 12, 26], fallback: 12 },
  { value: "month", label: "Oylik", unit: "oy", counts: [3, 6, 12, 24], fallback: 6 },
];

const grainOf = (key) => GRAIN_OPTIONS.find((g) => g.value === key) ?? GRAIN_OPTIONS[0];

const ActivityDashboardPage = () => {
  const { can } = usePermissions();
  const allowed = can("activity.view");

  // ⚠️ BITTA ODAMNING TARIXI — ALOHIDA RUXSAT (`activity.sessions`).
  // Umumiy foizlarni ko'rish huquqi aniq odamning kun-kunlik
  // harakatini ochib bermasligi kerak: birinchisi hisobot,
  // ikkinchisi shaxsiy kuzatuv. Ruxsat bo'lmasa qator umuman
  // bosilmaydigan bo'ladi (`onSelect` uzatilmaydi) — o'chirilgan
  // tugma ko'rsatib turish "buzilgan" degan taassurot berardi.
  const canInspect = can("activity.sessions");

  // Sinf kesimi ISM RO'YXATI — u ham alohida ruxsat bilan
  const canSeeRoster = can("activity.roster");

  const [granularity, setGranularity] = useState("day");
  const [count, setCount] = useState("30");
  const [subject, setSubject] = useState(null);
  const [classId, setClassId] = useState(null);

  const grain = grainOf(granularity);

  // ⚠️ Granulyarlik almashganda BO'LAK SONI ham almashadi: "90 kun"
  // dan "haftalik" ga o'tilganda 90 hafta degan variant yo'q va
  // server 400 qaytarardi. Har granulyarlikning o'z standarti bor.
  const changeGranularity = (next) => {
    setGranularity(next);
    setCount(String(grainOf(next).fallback));
  };

  const countOptions = useMemo(
    () =>
      grain.counts.map((value) => ({
        value: String(value),
        label: `${value} ${grain.unit}`,
      })),
    [grain],
  );

  const overview = useQuery({
    ...activityQueries.overview({ granularity, count: Number(count) }),
    enabled: allowed,
  });

  // Uchala qiymat har blokka bir xil yetib boradi: har biri o'z
  // yuklanish/xato/bo'sh holatini `Panel` ichida chizadi
  const state = useMemo(
    () => ({
      data: overview.data,
      isLoading: overview.isLoading,
      isError: overview.isError,
    }),
    [overview.data, overview.isLoading, overview.isError],
  );

  // Server ham shu ruxsatni talab qiladi (`/activity/subject` →
  // `authorizePermission(ACTIVITY_SESSIONS)`), bu yerdagi shart faqat
  // UI qatlami
  const onSelect = canInspect ? setSubject : undefined;

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Faollik bo'limini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-6">
      {/* ── Sarlavha ─────────────────────────────────────────────────
          ⚠️ KARTASIZ: sarlavha kontent emas, MO'LJAL. Oq kartaga
          solsak, ekranda birinchi ko'rinadigan narsa bo'sh quti
          bo'lardi va uning ostidagi to'q hero bilan ikkita
          "boshlanish nuqtasi" hosil qilardi. */}
      <header
        className={cn(
          "flex flex-wrap items-end justify-between gap-3 px-0.5 pt-0.5",
          MOTION.enter,
        )}
        style={{ animationDelay: `${DELAY.header}ms` }}
      >
        <div className="min-w-0">
          <h1 className="text-[19px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
            Faollik
          </h1>
          <p className={cn(T.hint, "mt-0.5")}>
            Ota-onalar va xodimlar tizimni qanchalik ishlatmoqda
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ⚠️ IKKI TANLAGICH, BITTA EMAS. Bitta ro'yxatga
              ("7 kun / 12 hafta / 6 oy") yig'ilsa, o'n ikkita variant
              hosil bo'lardi va ular orasidagi MA'NO farqi (o'lchov
              birligi) yo'qolardi. Ikkitasi esa savolni ikkiga
              bo'ladi: "qanday o'lchaymiz" va "qancha orqaga". */}
          <CalendarRange className="size-4 shrink-0 text-slate-400" />
          <Select
            triggerClassName="h-9 min-w-28"
            value={granularity}
            options={GRAIN_OPTIONS.map((g) => ({ value: g.value, label: g.label }))}
            onChange={changeGranularity}
          />
          <Select
            triggerClassName="h-9 min-w-28"
            value={count}
            options={countOptions}
            onChange={setCount}
          />
        </div>
      </header>

      {/* ── Hero: bugungi qamrov ─────────────────────────────────── */}
      <PulseHero {...state} />

      {/* ── Oltita ko'rsatkich ───────────────────────────────────── */}
      <MetricStrip {...state} />

      {/* ── Bento to'r ───────────────────────────────────────────────
          Kenglik = og'irlik.

          • Dinamika 8 ustun — 30-90 kunlik qator uchun joy kerak.
          • Ritm 4 — issiqlik xaritasi kvadratga yaqin maydonda yashaydi.
          • Sinflar kesimi 5 — foydalanuvchi so'ragan ASOSIY blok, lekin
            u ro'yxat va uzunlik bo'yicha o'sadi, kenglik bo'yicha emas.
          • Kanallar 3, yetkazish 4 — ikkalasi ham qisqa ro'yxat. */}
      <div className={GRID}>
        <TrendChart {...state} delay={gridDelay(0)} className="xl:col-span-8" />
        <HourHeatmap {...state} delay={gridDelay(1)} className="xl:col-span-4" />

        {/* ⚠️ Qator BOSILADI: umumiy ro'yxatdagi "3-A: 8/13 = 61.5%"
            savol tug'diradi — "qaysi 5 tasi ochmayapti?". Javob sinf
            kesimida va u ham `activity.roster` talab qiladi (ISM
            ro'yxati), shuning uchun ruxsati yo'q xodimda qator
            bosilmaydigan bo'lib qoladi. */}
        <ClassCoverage
          {...state}
          onSelectClass={canSeeRoster ? setClassId : undefined}
          delay={gridDelay(2)}
          className="xl:col-span-5"
        />
        <ChannelSplit {...state} delay={gridDelay(3)} className="xl:col-span-3" />
        <DeliveryPanel {...state} delay={gridDelay(4)} className="xl:col-span-4" />

        <ActiveStaffPanel
          {...state}
          onSelect={onSelect}
          delay={gridDelay(5)}
          className="xl:col-span-4"
        />
        <SilentStaffPanel
          {...state}
          onSelect={onSelect}
          delay={gridDelay(6)}
          className="xl:col-span-4"
        />
        <ActionsPanel {...state} delay={gridDelay(7)} className="xl:col-span-4" />

        {/* ⚠️ IKKI RO'YXAT, IKKI BOSHQA MUAMMO va ular ATAYLAB
            ajratilgan: "jim turganlar" botga ULANGAN, lekin ochmagan
            (ularga eslatma yuborish mumkin); "bog'lanmaganlar" esa
            umuman ulanmagan (ularga ko'rsatma berish kerak). Bitta
            ro'yxatga qo'shilsa, ikkala holat uchun bitta harakat
            taklif qilingandek ko'rinardi. */}
        <SilentParentsPanel
          {...state}
          onSelect={onSelect}
          delay={gridDelay(8)}
          className="xl:col-span-6"
        />
        <UnlinkedPanel
          {...state}
          onSelect={onSelect}
          delay={gridDelay(9)}
          className="xl:col-span-6"
        />
      </div>

      {/* Bitta odamning faollik tarixi — to'rtta ro'yxatdan ham
          shu blok ochiladi */}
      <SubjectSheet
        open={Boolean(subject)}
        onOpenChange={(next) => !next && setSubject(null)}
        subject={subject}
        days={overview.data?.period?.days ?? 30}
      />

      {/* Sinf kesimi — "kim foydalanadi, kim yo'q" */}
      <ClassSheet
        open={Boolean(classId)}
        onOpenChange={(next) => !next && setClassId(null)}
        classId={classId}
        days={overview.data?.period?.days ?? 30}
      />
    </div>
  );
};

export default ActivityDashboardPage;
