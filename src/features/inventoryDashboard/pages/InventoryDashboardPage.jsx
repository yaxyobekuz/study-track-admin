// React
import { useMemo, useState } from "react";

// Icons
import { CalendarDays, Lock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Select from "@/shared/components/ui/select/Select";
import HeroRings from "../components/HeroRings";
import MetricStrip from "../components/MetricStrip";
import DamageTrend from "../components/DamageTrend";
import DamageFlow from "../components/DamageFlow";
import MonitoringCard from "../components/MonitoringCard";
import { CategoryTreemap, ReasonBreakdown } from "../components/BreakdownCards";
import { LocationRadar, LocationRanking } from "../components/LocationCards";
import { ActivityFeed, DebtorsPanel, ItemsRanking } from "../components/ListCards";

// Hooks
import useAuth from "@/shared/hooks/useAuth";
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { useRoles } from "@/features/roles/queries/roles.queries";
import { inventoryDashboardQueries } from "../queries/inventoryDashboard.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import {
  buildMonthOptions,
  currentMonthKey,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

// Tokens
import { DELAY, MOTION, T, gridDelay } from "../data/atlas.tokens";

/**
 * INVENTAR DASHBOARDI — moddiy-texnik bazaning bosh ekrani.
 *
 * ⚠️ TA'LIM/MOLIYA DASHBOARDLARIDAN BOSHQA JANRDA (`atlas.tokens.js`
 * sarlavhasidagi to'liq izoh). Ular oylik hisobot — teng 3×3 to'r, oq
 * karta, ingichka chegara. Bu esa BAZANING HOLATI: ekranda ustuvorlik
 * bor va u BENTO to'r bilan beriladi — blok kengligi uning og'irligini
 * bildiradi. Chegarasiz sirt, to'q hero va oqim diagrammasi ham shu
 * qarordan kelib chiqadi.
 *
 * ⚠️ BIR EKRANLI REJIM (`fitscreen`) BU YERDA YO'Q va bu ataylab.
 * Ta'lim dashboardida u ishlaydi, chunki u yerdagi to'qqiz blok
 * ro'yxatlardan iborat va ro'yxatni qisqartirish mumkin. Bu yerda esa
 * oqim diagrammasi, issiqlik xaritasi va treemap bor — ularning
 * balandligi MA'NO tashiydi (lenta qalinligi = ulush). Viewportga
 * qulflansa, ular yassilanib o'qib bo'lmas holga kelardi. Sahifa
 * suriladi va bu halol yechim.
 *
 * ⚠️ RUXSAT: `inventory.dashboard` — `inventory.view` DAN ALOHIDA.
 * Bu ekranda bazaning PUL qiymati, zarar summasi va qarzdorlik
 * qoldig'i turadi (`server/src/utils/permissions.js` dagi izoh).
 *
 * ⚠️ BITTA SO'ROV: hamma blok ayni jadvallardan yig'iladi (xatlov
 * qatorlari to'rtta blokka kerak), ikkiga bo'lish faqat o'sha
 * qatorlarni ikkinchi marta o'qishga olib kelardi.
 */

/** 12-ustunli bento to'r — blok kengligi uning og'irligini bildiradi. */
const GRID = "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12";

const InventoryDashboardPage = () => {
  const { can } = usePermissions();

  const allowed = can("inventory.dashboard");

  const [month, setMonth] = useState(() => String(currentMonthKey()));
  const [compareMonth, setCompareMonth] = useState(() =>
    String(prevMonthKey(currentMonthKey())),
  );

  // Kelajakdagi oyning ma'lumoti bo'lmaydi — ro'yxat joriy oyda tugaydi
  const monthOptions = useMemo(
    () => buildMonthOptions({ back: 23, forward: 0 }).reverse(),
    [],
  );

  // ⚠️ Taqqoslash ro'yxati BIR OY UZUNROQ: taqqoslash oyi tanlangan
  // oydan OLDIN bo'lishi shart (server ham tekshiradi va 400 qaytaradi),
  // ya'ni ro'yxatning eng eski oyi tanlanganda oddiy filtr BO'SH ro'yxat
  // qaytarardi (ta'lim dashboardi bilan bir xil qaror).
  const compareOptions = useMemo(() => {
    const all = buildMonthOptions({ back: 24, forward: 0 }).reverse();
    return all.filter((option) => Number(option.value) < Number(month));
  }, [month]);

  // Oy o'zgarganda taqqoslash oyi undan keyinda qolib ketishi mumkin
  const safeCompareMonth = useMemo(() => {
    if (Number(compareMonth) < Number(month)) return compareMonth;
    return String(prevMonthKey(Number(month)));
  }, [compareMonth, month]);

  const overview = useQuery({
    ...inventoryDashboardQueries.overview({ month, compareMonth: safeCompareMonth }),
    enabled: allowed,
  });

  if (!allowed) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Inventar dashboardini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  // Uchala qiymat har blokka bir xil yetib boradi: har biri o'z
  // yuklanish/xato/bo'sh holatini `Panel` ichida chizadi
  const state = {
    data: overview.data,
    isLoading: overview.isLoading,
    isError: overview.isError,
  };

  return (
    <div className="flex flex-col gap-3 pb-6">
      {/* ── Sarlavha ─────────────────────────────────────────────────
          ⚠️ KARTASIZ va bu ataylab: sarlavha kontent emas, MO'LJAL.
          Uni oq kartaga solsak, ekranda birinchi ko'rinadigan narsa
          bo'sh quti bo'lardi va uning ostidagi to'q hero bilan ikkita
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
            Inventar dashboardi
          </h1>
          <p className={cn(T.hint, "mt-0.5")}>
            Moddiy-texnik baza, zarar va undiruvning to'liq manzarasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-slate-400" />
            <Select
              triggerClassName="h-9 min-w-36"
              value={month}
              options={monthOptions}
              onChange={setMonth}
            />
          </div>

          {/* ⚠️ Ikki tanlagich yonma-yon va ikkalasi ham oy ko'rsatadi —
              yorliqsiz ular bir xil boshqaruvdek ko'rinardi */}
          <div className="flex items-center gap-2">
            <span className={cn(T.label, "shrink-0")}>Taqqoslash</span>
            <Select
              triggerClassName="h-9 min-w-36"
              value={safeCompareMonth}
              options={compareOptions}
              onChange={setCompareMonth}
            />
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block" />

          <HeaderUser />
        </div>
      </header>

      {/* ── Hero: uchta halqa ────────────────────────────────────── */}
      <HeroRings
        data={overview.data}
        isLoading={overview.isLoading}
        monthLabel={overview.data?.period?.monthLabel}
        updatedAt={overview.dataUpdatedAt}
      />

      {/* ── Oltita ko'rsatkich ───────────────────────────────────── */}
      <MetricStrip data={overview.data} isLoading={overview.isLoading} />

      {/* ── Bento to'r ───────────────────────────────────────────────
          Kenglik = og'irlik. Dinamika 8 ustun (12 oylik qator uchun
          joy kerak), sabab kesimi 4 (donut kvadrat maydonda yashaydi),
          oqim esa butun kenglikni oladi — u uch bosqichli va tor
          ustunda lentalar bir-biriga yopishib qolardi. */}
      <div className={GRID}>
        <DamageTrend {...state} delay={gridDelay(0)} className="xl:col-span-8" />
        <ReasonBreakdown {...state} delay={gridDelay(1)} className="xl:col-span-4" />

        <DamageFlow {...state} delay={gridDelay(2)} className="lg:col-span-2 xl:col-span-12" />

        <LocationRanking {...state} delay={gridDelay(3)} className="xl:col-span-4" />
        <CategoryTreemap {...state} delay={gridDelay(4)} className="xl:col-span-4" />
        <LocationRadar {...state} delay={gridDelay(5)} className="xl:col-span-4" />

        <MonitoringCard {...state} delay={gridDelay(6)} className="xl:col-span-5" />
        <ItemsRanking {...state} delay={gridDelay(7)} className="xl:col-span-4" />
        <DebtorsPanel {...state} delay={gridDelay(8)} className="xl:col-span-3" />

        <ActivityFeed {...state} delay={gridDelay(9)} className="lg:col-span-2 xl:col-span-12" />
      </div>
    </div>
  );
};

/**
 * SARLAVHADAGI FOYDALANUVCHI.
 *
 * ⚠️ Ma'lumot HAQIQIY manbadan (`useAuth()` → `auth/me`): sahifada
 * "Administrator" kabi qotib qolgan matn turishi mumkin emas — u boshqa
 * odam kirgan ekranda ham o'zgarmasdan qolardi.
 */
const HeaderUser = () => {
  const { user } = useAuth();
  // ⚠️ `/roles` faqat ega uchun ochiq, qolganlarda ro'yxat bo'sh keladi
  // va `getRoleLabel` rolning o'z qiymatini qaytaradi
  const { data: roles = [] } = useRoles();

  if (!user) return null;

  const name =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username;
  const photo =
    user.profilePicture?.variants?.sm?.url ||
    user.profilePicture?.variants?.original?.url;

  return (
    <div className="flex items-center gap-2">
      {photo ? (
        <img src={photo} alt={name} className="size-8 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-sm font-semibold uppercase text-slate-500">
          {name.charAt(0)}
        </div>
      )}

      <div className="min-w-0 leading-tight">
        <p className={cn(T.hint, "truncate text-[10.5px]")}>
          {getRoleLabel(user.role, roles)}
        </p>
        <p className="truncate text-[12.5px] font-semibold text-slate-900">{name}</p>
      </div>
    </div>
  );
};

export default InventoryDashboardPage;
