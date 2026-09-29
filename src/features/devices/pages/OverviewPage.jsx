// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { Link, useOutletContext } from "react-router-dom";

// Icons
import {
  CalendarRange,
  Layers,
  ShieldAlert,
  Smartphone,
  Timer,
  Unlock,
  History,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Select from "@/shared/components/ui/select/Select";
import Panel from "../components/Panel";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data & queries
import { CHIP, DELAY, MOTION, T, gridDelay, healthOf, metricDelay } from "../data/guard.tokens";
import { RANGE_OPTIONS, auditLabel, formatMinutes } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";
import GuardHero from "../components/GuardHero";

/** 12-ustunli bento to'r (Sentinel/Ledger bilan bir xil). */
const GRID = "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12";

/**
 * UMUMIY MANZARA — "hammasi joyidami?".
 *
 * ⚠️ BIRINCHI BO'LIB MUAMMO KO'RSATILADI, statistika emas. Bo'limning
 * bosh savoli "nechta telefon ulangan" emas, "qoida haqiqatda
 * bajarilyaptimi": himoyasi o'chirilgan qurilma va qoida ostida bo'lib
 * turib telefoni ulanmagan o'quvchi — ikkalasi ham JIM nosozlik,
 * ya'ni ularni qidirib topish kerak bo'lsa, hech kim topmaydi.
 */
const OverviewPage = () => {
  const { filterSlot } = useOutletContext();
  const [days, setDays] = useState("7");

  const { data, isLoading, isError } = useQuery(devicesQueries.dashboard({ days: Number(days) }));

  const state = { isLoading, isError };

  return (
    <div className="flex flex-col gap-3">
      {/* Davr tanlagich — layoutdagi tablar qatoriga joylanadi */}
      {filterSlot &&
        createPortal(
          <div className="flex items-center gap-2">
            <CalendarRange className="size-4 shrink-0 text-slate-400" />
            <Select
              triggerClassName="h-9 min-w-28"
              value={days}
              options={RANGE_OPTIONS}
              onChange={setDays}
            />
          </div>,
          filterSlot,
        )}

      <GuardHero data={data} {...state} />

      <MetricStrip data={data} {...state} />

      <div className={GRID}>
        <AttentionPanel data={data} {...state} delay={gridDelay(0)} className="xl:col-span-5" />
        <CoveragePanel data={data} {...state} delay={gridDelay(1)} className="xl:col-span-7" />
        <TopAppsPanel data={data} {...state} delay={gridDelay(2)} className="xl:col-span-5" />
        <TrendPanel data={data} {...state} delay={gridDelay(3)} className="xl:col-span-7" />
        <AuditPanel data={data} {...state} delay={gridDelay(4)} className="xl:col-span-12" />
      </div>
    </div>
  );
};

/* ─────────────────────── KO'RSATKICHLAR ─────────────────────── */

const MetricStrip = ({ data, isLoading }) => {
  const devices = data?.devices;
  const items = [
    {
      key: "devices",
      icon: Smartphone,
      label: "Ulangan qurilma",
      value: devices?.total ?? "—",
      hint: `${devices?.studentsWithDevice || 0} o'quvchi`,
    },
    {
      key: "healthy",
      icon: Layers,
      label: "Himoyada",
      value: devices?.health?.healthy ?? "—",
      hint: `${devices?.health?.offline || 0} oflayn`,
    },
    {
      key: "degraded",
      icon: ShieldAlert,
      label: "Himoya o'chirilgan",
      value: devices?.health?.degraded ?? "—",
      hint: "telefonda ruxsat olingan",
      tone: (devices?.health?.degraded || 0) > 0 ? "text-rose-600" : undefined,
    },
    {
      key: "screen",
      icon: Timer,
      label: "Bugun ekranda",
      value: data ? formatMinutes(data.today?.totalMinutes) : "—",
      hint: `${data?.today?.blockedAttempts || 0} ta urinish to'sildi`,
    },
    {
      key: "unlocks",
      icon: Unlock,
      label: "Vaqtinchalik ruxsat",
      value: data?.activeUnlocks ?? "—",
      hint: "hozir amalda",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((item, index) => (
        <div
          key={item.key}
          className={cn(
            "rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]",
            MOTION.enter,
          )}
          style={{ animationDelay: `${metricDelay(index)}ms` }}
        >
          <div className="flex items-center gap-1.5">
            <item.icon className="size-3.5 text-slate-400" strokeWidth={2} />
            <p className={T.label}>{item.label}</p>
          </div>
          <p className={cn(T.metric, "mt-1.5", item.tone)}>
            {isLoading ? "—" : item.value}
          </p>
          <p className={cn(T.hint, "mt-0.5 truncate")}>{item.hint}</p>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────── E'TIBOR ─────────────────────── */

/**
 * ⚠️ BU PANEL BO'SH BO'LSA — YAXSHI XABAR, shuning uchun u "ma'lumot
 * yo'q" emas, "hammasi joyida" deb yozadi. Bo'sh holatning matni
 * noto'g'ri bo'lsa, admin muammo bor deb o'ylab qidirib yurardi.
 */
const AttentionPanel = ({ data, isLoading, isError, delay, className }) => {
  const devices = data?.devices;
  const rows = [
    {
      key: "degraded",
      count: devices?.health?.degraded || 0,
      title: "Himoya o'chirilgan",
      hint: "O'quvchi telefondagi maxsus ruxsatni olib qo'ygan — cheklov bajarilmayapti",
      tone: "rose",
      to: "/devices/list?health=degraded",
    },
    {
      key: "withoutDevice",
      count: devices?.coveredWithoutDevice || 0,
      title: "Qoida bor, telefon ulanmagan",
      hint: "Siyosat biriktirilgan, lekin o'quvchida biriktirilgan qurilma yo'q",
      tone: "amber",
      to: "/devices/list",
    },
    {
      key: "offline",
      count: devices?.health?.offline || 0,
      title: "Oflayn qurilmalar",
      hint: "Ancha vaqtdan beri ko'rinmadi — oxirgi qoida ularda kuchda qoladi",
      tone: "slate",
      to: "/devices/list?health=offline",
    },
  ].filter((row) => row.count > 0);

  return (
    <Panel
      title="E'tibor talab qiladi"
      hint="Jim nosozliklar — qoida bor-u, bajarilmayotgan holatlar"
      icon={ShieldAlert}
      tone={rows.length ? "alert" : "open"}
      delay={delay}
      className={className}
      isLoading={isLoading}
      isError={isError}
    >
      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6">
          <p className="max-w-[260px] text-center text-[11.5px] leading-relaxed text-slate-400">
            Hammasi joyida — ulangan qurilmalarning barchasida cheklov ishlayapti.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.key}>
              <Link
                to={row.to}
                className="flex items-start gap-3 rounded-xl bg-slate-50/80 px-3.5 py-3 transition-colors hover:bg-slate-100/80"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold tabular-nums",
                    row.tone === "rose"
                      ? "bg-rose-50 text-rose-600"
                      : row.tone === "amber"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {row.count}
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-slate-900">{row.title}</p>
                  <p className={cn(T.hint, "mt-0.5")}>{row.hint}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

/* ─────────────────────── QAMROV ─────────────────────── */

const CoveragePanel = ({ data, isLoading, isError, delay, className }) => {
  const coverage = data?.coverage;
  const total = coverage?.students || 0;

  return (
    <Panel
      title="Siyosatlar qamrovi"
      hint="Qaysi qoida nechta o'quvchida amalda — biriktirishlar soni emas, HAQIQIY yechim"
      icon={Layers}
      tone="allowed"
      delay={delay}
      className={className}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !coverage?.byPolicy?.length}
      emptyText="Hali birorta siyosat biriktirilmagan. «Siyosatlar» tabida qoida yarating va uni sinfga yoki butun maktabga yoqing."
    >
      <div className="space-y-2.5">
        {(coverage?.byPolicy || []).map((row) => {
          const percent = total ? Math.round((row.students / total) * 100) : 0;
          return (
            <div key={row.policyId}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-[12.5px] font-medium text-slate-900">{row.name}</p>
                <p className={T.tdNum}>
                  {row.students}
                  <span className="ml-1 text-[11px] font-normal text-slate-400">
                    ({percent}%)
                  </span>
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full bg-sky-500", MOTION.bar)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}

        {coverage?.uncovered > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5">
            <p className="text-[12px] text-slate-500">Hech qanday qoida qo'llanmagan</p>
            <p className={T.tdNum}>{coverage.uncovered}</p>
          </div>
        )}
      </div>
    </Panel>
  );
};

/* ─────────────────────── TOP ILOVALAR ─────────────────────── */

const TopAppsPanel = ({ data, isLoading, isError, delay, className }) => {
  const apps = data?.topApps || [];
  const max = apps[0]?.minutes || 1;

  return (
    <Panel
      title="Eng ko'p ishlatilgan ilovalar"
      hint={`Tanlangan davr · ${data?.range?.days || 0} kun`}
      icon={Timer}
      tone="limited"
      delay={delay}
      className={className}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && apps.length === 0}
      emptyText="Hali foydalanish hisoboti kelmagan. Telefon ilovasi ulangach kun yakunida hisobot yuboradi."
    >
      <ul className="space-y-2.5">
        {apps.map((app) => (
          <li key={app.appKey}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[12.5px] text-slate-700">{app.name}</p>
              <p className={T.tdNum}>{app.label}</p>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full bg-amber-400", MOTION.bar)}
                style={{ width: `${Math.round((app.minutes / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

/* ─────────────────────── DINAMIKA ─────────────────────── */

const TrendPanel = ({ data, isLoading, isError, delay, className }) => {
  const series = data?.trend || [];
  const max = Math.max(1, ...series.map((row) => row.minutes));

  return (
    <Panel
      title="Kunlik ekran vaqti"
      hint="Butun maktab bo'yicha jami"
      icon={CalendarRange}
      tone="neutral"
      delay={delay}
      className={className}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && series.length === 0}
      emptyText="Bu davr uchun hisobot yo'q."
    >
      <DayChart series={series} max={max} delay={delay} />
    </Panel>
  );
};

/**
 * KUNLIK USTUNLAR.
 *
 * ⚠️ USTUNLAR VA YORLIQLAR IKKI ALOHIDA QATOR. Ilgari ular bitta ustunli
 * flex ichida edi va `height: N%` balandligi AVTOMATIK bo'lgan
 * ota-elementga nisbatan hisoblanib, diagramma bo'sh chiqardi. Foiz
 * balandlik faqat aniq balandlikdagi konteyner ichida ishlaydi (`h-32`).
 */
const DayChart = ({ series, max, delay = 0 }) => (
  <div>
    <div className="flex h-32 items-end gap-1.5">
      {series.map((row, index) => (
        <div
          key={row.day}
          title={`${row.day}: ${formatMinutes(row.minutes)}`}
          className={cn(
            "min-w-0 flex-1 rounded-t-[3px] bg-slate-300 transition-colors hover:bg-sky-400",
            MOTION.enter,
          )}
          style={{
            height: `${Math.max(2, Math.round((row.minutes / max) * 100))}%`,
            animationDelay: `${delay + index * 24}ms`,
          }}
        />
      ))}
    </div>

    <div className="mt-1.5 flex gap-1.5">
      {series.map((row) => (
        <span
          key={row.day}
          className="min-w-0 flex-1 text-center text-[9px] tabular-nums text-slate-400"
        >
          {row.day.slice(8)}
        </span>
      ))}
    </div>
  </div>
);

/* ─────────────────────── TARIX ─────────────────────── */

/**
 * ⚠️ AUDIT MANZARADA TURADI, alohida ekranda emas. Bu modulda "kim
 * ruxsat berdi / kim qulfladi" degan savol kundalik: uni ikkinchi
 * sahifaga yashirish "hech kim ko'rmaydigan jurnal" ga aylantirardi.
 */
const AuditPanel = ({ data, isLoading, isError, delay, className }) => (
  <Panel
    title="So'nggi o'zgarishlar"
    hint="Bolaning qurilmasiga tegadigan har amal yozib boriladi"
    icon={History}
    tone="neutral"
    delay={delay}
    className={className}
    isLoading={isLoading}
    isError={isError}
    isEmpty={!isLoading && !data?.audit?.length}
    emptyText="Hozircha o'zgarish yo'q."
    padding="flush"
  >
    <ul className="divide-y divide-slate-100 px-5 pb-5">
      {(data?.audit || []).map((row) => (
        <li key={row.id} className="flex items-start gap-3 py-2.5 first:pt-0">
          <span className={cn(CHIP, "mt-0.5 shrink-0 bg-slate-100 text-slate-600")}>
            {auditLabel(row.action)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] leading-snug text-slate-700">{row.summary}</p>
            {row.reason && <p className={cn(T.hint, "mt-0.5")}>Sabab: {row.reason}</p>}
          </div>
          <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
            {formatDateTimeUz(row.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  </Panel>
);

export default OverviewPage;
