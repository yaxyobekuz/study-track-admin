// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import { CalendarRange, LayoutGrid, Search, ShieldAlert, Timer, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Input from "@/shared/components/ui/input/Input";
import Pagination from "@/shared/components/ui/Pagination";
import Select from "@/shared/components/ui/select/Select";
import Panel from "../components/Panel";
import { GuardTable, GuardRow, GuardCell } from "../components/GuardTable";
import StudentDeviceModal from "../components/StudentDeviceModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries, tokens & data
import { useClasses } from "@/features/classes/queries/classes.queries";
import { MOTION, T, gridDelay } from "../data/guard.tokens";
import { RANGE_OPTIONS, formatMinutes } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";

const GRID = "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-12";

/**
 * FOYDALANISH HISOBOTI — "vaqt qayerga ketdi".
 *
 * ⚠️ ALOHIDA RUXSAT ORTIDA (`devices.reports`). Qurilmalar ro'yxatini
 * ko'rish texnik ish, bolaning qaysi ilovada qancha o'tirgani esa
 * SHAXSIY MA'LUMOT — `security.view` va `security.sessions` ajratilgani
 * bilan aynan bir xil mulohaza.
 *
 * ⚠️ FAQAT YIG'MA: kun + ilova + daqiqa. "Soat nechada ochdi" degan
 * kesim yo'q va bo'lmaydi — bunday ma'lumot umuman saqlanmaydi
 * (`devices.md` §0.2). Bu chekov emas, arxitektura qarori.
 */
const ReportsPage = () => {
  const { filterSlot } = useOutletContext();
  const { openModal } = useModal();

  const [days, setDays] = useState("7");
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  /**
   * ⚠️ Filtr o'zgarganda birinchi sahifaga qaytamiz — EFFEKT bilan emas,
   * o'zgartirgan hodisada (`DevicesPage` bilan AYNI naqsh).
   */
  const onFilter = (apply) => (value) => {
    apply(value);
    setPage(1);
  };

  const { data: classes = [] } = useClasses();
  const { data, isLoading, isError } = useQuery(
    devicesQueries.usage({
      page,
      limit: 25,
      days: Number(days),
      classId: classId || undefined,
      search: debounced || undefined,
    }),
  );

  const state = { isLoading, isError };

  return (
    <div className="flex flex-col gap-3">
      {filterSlot &&
        createPortal(
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => onFilter(setSearch)(e.target.value)}
                placeholder="O'quvchi"
                className="h-9 w-40 pl-8 text-[12.5px]"
              />
            </div>
            <Select
              triggerClassName="h-9 min-w-36"
              value={classId}
              options={[
                { value: "", label: "Barcha sinflar" },
                ...classes.map((c) => ({ value: c.id, label: c.name })),
              ]}
              onChange={onFilter(setClassId)}
            />
            <div className="flex items-center gap-2">
              <CalendarRange className="size-4 shrink-0 text-slate-400" />
              <Select
                triggerClassName="h-9 min-w-28"
                value={days}
                options={RANGE_OPTIONS}
                onChange={onFilter(setDays)}
              />
            </div>
          </div>,
          filterSlot,
        )}

      {/* ── Uchta raqam ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          icon={Timer}
          label="Jami ekran vaqti"
          value={data?.totals?.label ?? "—"}
          hint={`${data?.range?.days || 0} kun`}
          delay={0}
        />
        <Metric
          icon={CalendarRange}
          label="Kuniga o'rtacha"
          value={data ? formatMinutes(data.totals.avgPerDay) : "—"}
          hint="butun tanlov bo'yicha"
          delay={40}
        />
        <Metric
          icon={ShieldAlert}
          label="To'silgan urinishlar"
          value={data?.totals?.blocked ?? "—"}
          hint="cheklov ishlagan holatlar"
          delay={80}
        />
      </div>

      <div className={GRID}>
        {/* ── Kunlik dinamika ── */}
        <Panel
          title="Kunlik dinamika"
          hint="Tanlangan kesim bo'yicha jami"
          icon={CalendarRange}
          tone="neutral"
          delay={gridDelay(0)}
          className="xl:col-span-12"
          {...state}
          isEmpty={!isLoading && !data?.byDay?.length}
          emptyText="Bu davr uchun hisobot yo'q."
        >
          <DayChart series={data?.byDay || []} />
        </Panel>

        {/* ── Ilovalar ── */}
        <Panel
          title="Ilovalar kesimi"
          hint="Eng ko'p vaqt olgan ilovalar"
          icon={LayoutGrid}
          tone="limited"
          delay={gridDelay(1)}
          className="xl:col-span-5"
          {...state}
          isEmpty={!isLoading && !data?.byApp?.length}
          emptyText="Hisobot hali kelmagan."
          padding="flush"
        >
          <ul className="max-h-[420px] space-y-2.5 overflow-y-auto px-5 pb-5">
            {(data?.byApp || []).map((row) => {
              const max = data.byApp[0]?.minutes || 1;
              return (
                <li key={row.appKey}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[12.5px] text-slate-700">{row.name}</p>
                    <p className={T.tdNum}>{row.label}</p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full bg-amber-400", MOTION.bar)}
                      style={{ width: `${Math.round((row.minutes / max) * 100)}%` }}
                    />
                  </div>
                  {row.blocked > 0 && (
                    <p className={cn(T.hint, "mt-0.5")}>{row.blocked} marta to'sildi</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* ── O'quvchilar ── */}
        <Panel
          title="O'quvchilar kesimi"
          hint={`${data?.pagination?.total ?? 0} ta o'quvchi · ismga bosing, qurilmalari va qoidasi ochiladi`}
          icon={Users}
          tone="allowed"
          delay={gridDelay(2)}
          className="xl:col-span-7"
          {...state}
          isEmpty={!isLoading && !data?.byStudent?.length}
          emptyText="Hisobot hali kelmagan."
          padding="flush"
        >
          <div className="max-h-[420px] overflow-auto px-5 pb-5">
            <GuardTable
              minWidth={520}
              template="minmax(150px,1.3fr) minmax(110px,1fr) 100px 100px"
              columns={[
                { label: "O'quvchi" },
                { label: "Qoida" },
                { label: "Jami", align: "right" },
                { label: "Kuniga", align: "right" },
              ]}
            >
              {(data?.byStudent || []).map((row, index) => (
                <GuardRow key={row.studentId} index={index}>
                  <GuardCell>
                    <button
                      type="button"
                      onClick={() =>
                        openModal("studentDevice", {
                          studentId: row.studentId,
                          name: `${row.firstName} ${row.lastName}`.trim(),
                        })
                      }
                      className="w-full text-left hover:underline"
                    >
                      <span className={cn(T.tdName, "block truncate")}>
                        {row.firstName} {row.lastName}
                      </span>
                      <span className={cn(T.hint, "block truncate")}>
                        {row.className || "Sinfsiz"}
                      </span>
                    </button>
                  </GuardCell>
                  <GuardCell>
                    <span className={cn(T.td, "block truncate")}>{row.policyName || "—"}</span>
                  </GuardCell>
                  <GuardCell align="right">
                    <span className={T.tdNum}>{row.label}</span>
                  </GuardCell>
                  <GuardCell align="right">
                    <span className={cn(T.td, "tabular-nums")}>
                      {formatMinutes(row.avgPerDay)}
                    </span>
                  </GuardCell>
                </GuardRow>
              ))}
            </GuardTable>
          </div>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              className="mt-4"
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={data.pagination.hasNextPage}
              hasPrevPage={data.pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </Panel>
      </div>

      <StudentDeviceModal />
    </div>
  );
};

/* ─────────────────────── QISMLAR ─────────────────────── */

const Metric = ({ icon: Icon, label, value, hint, delay }) => (
  <div
    className={cn(
      "rounded-2xl bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]",
      MOTION.enter,
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-slate-400" strokeWidth={2} />
      <p className={T.label}>{label}</p>
    </div>
    <p className={cn(T.metric, "mt-1.5")}>{value}</p>
    <p className={cn(T.hint, "mt-0.5")}>{hint}</p>
  </div>
);

const DayChart = ({ series, delay = 0 }) => {
  const max = Math.max(1, ...series.map((row) => row.minutes));

  return (
    <div>
      {/*
        ⚠️ USTUNLAR VA YORLIQLAR IKKI ALOHIDA QATOR. Ilgari ular bitta
        ustunli flex ichida edi va ustunning `height: N%` qiymati
        balandligi AVTOMATIK bo'lgan ota-elementga nisbatan hisoblanib,
        diagramma butunlay bo'sh chiqardi. Foiz balandlik faqat aniq
        balandlikdagi konteyner ichida ishlaydi (`h-32`).
      */}
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
              animationDelay: `${delay + index * 22}ms`,
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
};

export default ReportsPage;
