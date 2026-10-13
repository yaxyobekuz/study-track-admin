// React
import { useMemo } from "react";

// Router
import { Link, useSearchParams } from "react-router-dom";

// Icons
import { ArrowLeft, Lock, School } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Select from "@/shared/components/ui/select/Select";
import { ClassCapacityCard } from "../components/TableCards";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { academicQueries } from "../queries/academicDashboard.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import {
  buildMonthOptions,
  currentMonthKey,
  formatMonthKey,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

// Data
import { formatByUnit } from "../data/academicDashboard.data";
import { SURFACE, T } from "../data/dashboard.tokens";

/**
 * Yorliq ustida, katta raqam ostida — maktab yig'indisining bitta ustuni.
 * O'lcham va rang TOKENDAN (`T.value*`), qo'lda yozilgan shrift yo'q.
 */
const Stat = ({ label, value, accent }) => (
  <div className="min-w-0">
    <p className={T.label}>{label}</p>
    <p className={cn(T.value, "text-lg leading-tight", accent)}>{value}</p>
  </div>
);

/**
 * MAKTAB SIG'IMI — jadval ustidagi bitta qator: jami joy, band, bo'sh va
 * bandlik foizi.
 *
 * ⚠️ Manba — jadvalning O'ZI bilan bitta (`capacity.totals`, serverda
 * hisoblanadi): bu yerda qayta qo'shib chiqilsa, yig'indi "Jami" qatori
 * bilan bir kun kelib ajralib ketardi.
 *
 * ⚠️ Moliya bo'limidagi o'sha chiziq (`ClassBreakdownCard` →
 * `SchoolCapacityBar`) IMPORT QILINMAYDI: u qarz bilan bitta faylda
 * yashaydi va moliya kartasining sirtida chizilgan. Bu yerda ta'lim
 * dashboardining tokenlari ishlaydi — ikki bo'lim bir xil o'qilishi uchun
 * shakl bir xil, lekin bog'liqlik yo'q.
 *
 * ⚠️ Sig'im umuman belgilanmagan bo'lsa raqam EMAS, nima qilish kerakligi
 * yoziladi: "0 joy, 0% band" degan chiziq nosozlikdek ko'rinardi.
 */
const CapacitySummary = ({ totals, isLoading }) => {
  if (isLoading) {
    return <div className={cn(SURFACE.card, "h-[72px] animate-pulse bg-slate-50 p-4")} />;
  }

  if (!totals || totals.capacity <= 0) {
    return (
      <div
        className={cn(
          SURFACE.card,
          "motion-safe:hover:translate-y-0",
          "flex flex-wrap items-center gap-2 p-4 text-[12.5px] text-slate-500",
        )}
      >
        <School className="size-4 shrink-0" />
        Maktab sig'imi belgilanmagan —
        <Link to="/classes" className="font-semibold text-primary hover:underline">
          "Sinflar"
        </Link>
        bo'limida har sinfga sig'im qo'ying.
      </div>
    );
  }

  const percent = Math.min(100, Math.max(0, Number(totals.fillRate ?? 0)));

  return (
    <div
      className={cn(
        SURFACE.card,
        "motion-safe:hover:translate-y-0",
        "flex flex-wrap items-center gap-x-8 gap-y-3 p-4",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-600 text-white shadow-sm">
          <School className="size-[18px]" />
        </span>
        <span className="text-[13px] font-semibold text-slate-700">Maktab sig'imi</span>
      </div>

      <Stat label="Jami sig'im" value={formatByUnit(totals.capacity, "count")} />
      <Stat
        label="Band (o'quvchilar)"
        value={formatByUnit(totals.occupied, "count")}
        accent="text-blue-700"
      />
      <Stat
        label="Bo'sh joy"
        value={formatByUnit(totals.freeSpots, "count")}
        // ⚠️ Manfiy bo'sh joy — sig'imdan oshib ketgan maktab: jadvaldagi
        // qator rangi bilan AYNI shkala (`freeSpotTone`)
        accent={totals.freeSpots < 0 ? "text-red-600" : "text-green-700"}
      />
      {totals.withoutCapacity > 0 && (
        <Stat
          label="Sig'imi yo'q sinflar"
          value={formatByUnit(totals.withoutCapacity, "count")}
          accent="text-amber-700"
        />
      )}

      <div className="flex min-w-[160px] flex-1 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full",
              percent >= 100 ? "bg-red-500" : "bg-blue-500",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={cn(T.valueMeta, "shrink-0")}>
          {formatByUnit(totals.fillRate, "percent")} band
        </span>
      </div>
    </div>
  );
};

/** Kelajakdagi oyning ma'lumoti bo'lmaydi — ro'yxat joriy oyda tugaydi. */
const MONTH_OPTIONS = buildMonthOptions({ back: 23, forward: 0 }).reverse();

/**
 * URL'dagi oy — ISHONCHSIZ manba (qo'lda tahrirlangan havola, eskirgan
 * xatcho'p). Faqat YYYYMM va 01..12 oralig'idagi oy qabul qilinadi, aks
 * holda zaxira qiymat.
 *
 * ⚠️ Tekshiruv shu yerda ham kerak: serverda yaroqsiz oy 400 bilan rad
 * etiladi va sahifa foydalanuvchiga "xatolik" ko'rsatardi — holbuki
 * uning aybi yo'q, havola buzilgan. Server tekshiruvi O'Z JOYIDA qoladi.
 */
const safeMonthKey = (raw, fallback) => {
  const value = String(raw ?? "");
  if (!/^\d{6}$/.test(value)) return fallback;

  const monthPart = Number(value) % 100;
  return monthPart >= 1 && monthPart <= 12 ? value : fallback;
};

/**
 * SINFLAR SIG'IMI — BATAFSIL (ta'lim dashboardidagi kartaning to'liq
 * ro'yxati).
 *
 * ⚠️ JADVAL AYNI KOMPONENT (`ClassCapacityCard` → `full`): ustunlar,
 * tartib, rang shkalasi va JAMI qatori kartaniki bilan bir xil bo'lishi
 * SHART. Ikkinchi jadval yozilsa, foydalanuvchi "ko'proq" ni bosganda
 * boshqacha ko'rinishga tushib, raqamlarni qaytadan solishtirishga majbur
 * bo'lardi (moliya tomonidagi `ClassesCapacityPage` bilan ayni naqsh).
 *
 * ⚠️ SO'ROV HAM AYNI (`academicQueries.overview`): karta oyni havolada
 * uzatadi, sahifa esa o'sha kalit bilan so'raydi — ya'ni ro'yxat KESHDAN
 * darhol ochiladi, qo'shimcha so'rov ketmaydi va ikki ekranda bitta raqam
 * turadi. Alohida "faqat sig'im" endpointi ataylab yozilmagan: u ikkinchi
 * hisob yo'li bo'lib, bir kun kelib dashboard bilan ajralib ketardi.
 *
 * ⚠️ Taqqoslash oyi URL'dan olinadi va u tanlangan oydan OLDIN bo'lishi
 * shart (server shuni talab qiladi, aks holda 400). Oy almashtirilganda
 * taqqoslash oyi avtomatik oldingi oyga suriladi — bu sahifada taqqoslash
 * ko'rsatilmaydi, lekin kalit baribir to'g'ri bo'lishi kerak.
 *
 * ⚠️ Ruxsat — `education.view`, dashboard bilan AYNI: bu o'sha ekranning
 * davomi, yangi ma'lumot ochmaydi.
 */
const ClassCapacityPage = () => {
  const { can } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const allowed = can("education.view");

  const month = safeMonthKey(searchParams.get("month"), String(currentMonthKey()));
  const compareMonth = useMemo(() => {
    const raw = safeMonthKey(searchParams.get("compareMonth"), null);
    // Server taqqoslash oyi tanlangandan OLDIN bo'lishini talab qiladi
    if (raw && Number(raw) < Number(month)) return raw;
    return String(prevMonthKey(Number(month)));
  }, [searchParams, month]);

  // ⚠️ Ro'yxatda yo'q oy (eski havola) YO'QOLMAYDI — tanlagichga qo'shiladi,
  // aks holda sahifa o'sha oyning ma'lumotini ko'rsatib turib, tanlagichda
  // bo'sh katak chiqarardi.
  const monthOptions = useMemo(
    () =>
      MONTH_OPTIONS.some((option) => option.value === month)
        ? MONTH_OPTIONS
        : [{ label: formatMonthKey(Number(month)), value: month }, ...MONTH_OPTIONS],
    [month],
  );

  const { data, isLoading, isError } = useQuery({
    ...academicQueries.overview({ month, compareMonth }),
    enabled: allowed,
  });

  const setMonth = (value) =>
    setSearchParams((prev) => {
      prev.set("month", value);
      prev.set("compareMonth", String(prevMonthKey(Number(value))));
      return prev;
    });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Sinflar sig'imini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3 pb-10">
      {/* Sarlavha paneli — dashboarddagi bilan bir xil sirt va ierarxiya */}
      <div
        className={cn(
          SURFACE.card,
          "motion-safe:hover:translate-y-0",
          "flex flex-wrap items-center justify-between gap-3 p-3.5",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/education"
            aria-label="Ta'lim dashboardiga qaytish"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900">
              SINFLAR SIG'IMI
            </h1>
            <p className={cn(T.cardHint, "mt-0.5 leading-none")}>
              Har sinfdagi joy, bandlik va bo'sh o'rin — eng band sinfdan boshlab
            </p>
          </div>
        </div>

        <Select
          triggerClassName="h-9 min-w-36"
          value={month}
          options={monthOptions}
          onChange={setMonth}
        />
      </div>

      <CapacitySummary totals={data?.capacity?.totals} isLoading={isLoading} />

      <ClassCapacityCard data={data} isLoading={isLoading} isError={isError} full />

      {/* Sig'im shu sahifada o'zgarmaydi — qayerda belgilanishi aytiladi */}
      <p className={cn(T.cardHint, "px-1")}>
        Sig'im har sinfning o'z kartasida belgilanadi —{" "}
        <Link to="/classes" className="font-semibold text-primary hover:underline">
          Sinflar
        </Link>{" "}
        bo'limi.
      </p>
    </div>
  );
};

export default ClassCapacityPage;
