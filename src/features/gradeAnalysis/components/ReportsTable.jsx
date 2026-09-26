// React
import { useMemo, useRef, useState } from "react";

// Icons
import { BellRing, CheckCheck, ChevronRight, Sparkles, TableProperties } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Select from "@/shared/components/ui/select/Select";
import InputSearch from "@/shared/components/ui/input/InputSearch";
import Pagination from "@/shared/components/ui/Pagination";
import Panel from "./Panel";
import { AverageBar, DeltaChip } from "./OverviewPanels";
import { Initials } from "./InsightPanels";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { REPORT_SORTS, fmtAvg } from "../data/gradeAnalysis.data";
import { LEVEL, LEVEL_ORDER, T, toneOf } from "../data/analysis.tokens";

const PAGE_SIZE = 20;

const LEVEL_OPTIONS = [
  { value: "", label: "Barcha darajalar" },
  ...LEVEL_ORDER.map((key) => ({ value: key, label: LEVEL[key].label })),
];

/**
 * TAHLILDAGI BARCHA O'QUVCHILAR — server tomonda filtrlanadi va
 * sahifalanadi (butun maktab — yuzlab qator, hammasini brauzerga olib
 * bo'lmaydi).
 */
const ReportsTable = ({ run, delay }) => {
  const { openModal } = useModal();
  const containerRef = useRef(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [classId, setClassId] = useState("");
  const [sort, setSort] = useState("risk");
  const q = useDebounce(search.trim(), 350);

  const classOptions = useMemo(
    () => [
      { value: "", label: "Barcha sinflar" },
      ...(run?.overview?.classes ?? []).map((row) => ({ value: row.classId, label: row.name })),
    ],
    [run?.overview?.classes],
  );

  const params = { id: run?.id, page, limit: PAGE_SIZE, level, classId, q, sort };
  const { data, isLoading, isError, isFetching } = useQuery(gradeAnalysisQueries.reports(params));
  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const reset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <Panel
      title="Barcha o'quvchilar"
      hint={pagination ? `${pagination.total} ta hisobot` : "Tahlil qilingan o'quvchilar"}
      icon={TableProperties}
      accent="bg-slate-900 text-white"
      delay={delay}
      flush
    >
      <div ref={containerRef} className="flex flex-wrap items-center gap-2 px-5">
        <div className="min-w-[220px] flex-1">
          <InputSearch
            value={search}
            onChange={(event) => reset(setSearch)(event.target.value)}
            placeholder="O'quvchi ismi bo'yicha qidirish..."
            className="h-9"
          />
        </div>
        {run?.scope !== "student" && (
          <Select triggerClassName="h-9 min-w-36" value={classId} options={classOptions} onChange={reset(setClassId)} />
        )}
        <Select triggerClassName="h-9 min-w-40" value={level} options={LEVEL_OPTIONS} onChange={reset(setLevel)} />
        <Select triggerClassName="h-9 min-w-40" value={sort} options={REPORT_SORTS} onChange={reset(setSort)} />
      </div>

      <div className={cn("mt-3 overflow-x-auto transition-opacity", isFetching && !isLoading && "opacity-60")}>
        <table className="w-full min-w-[860px]">
          <thead className="bg-transparent">
            <tr className="border-y border-slate-100 bg-slate-50/70">
              <th className={cn(T.th, "px-5 py-2.5 text-left")}>O'quvchi</th>
              <th className={cn(T.th, "px-3 py-2.5 text-left")}>O'rtacha</th>
              <th className={cn(T.th, "px-3 py-2.5 text-left")}>Farq</th>
              <th className={cn(T.th, "px-3 py-2.5 text-left")}>Daraja</th>
              <th className={cn(T.th, "px-3 py-2.5 text-left")}>Asosiy sabab</th>
              <th className={cn(T.th, "px-3 py-2.5 text-center")}>Xavf</th>
              <th className={cn(T.th, "px-3 py-2.5 text-center")}>Holat</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: 6 }, (_, index) => (
                <tr key={index} className="last:bg-white">
                  <td colSpan={8} className="px-5 py-3">
                    <div className="h-5 animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ))}

            {!isLoading && (isError || rows.length === 0) && (
              <tr className="last:bg-white">
                <td colSpan={8} className={cn(T.meta, "px-5 py-10 text-center")}>
                  {isError ? "Ro'yxatni yuklab bo'lmadi" : "Filtrga mos o'quvchi topilmadi"}
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => openModal("gradeAnalysisReport", { reportId: row.id })}
                className="group cursor-pointer bg-white transition-colors duration-200 last:bg-white hover:bg-slate-50/80"
              >
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <Initials name={row.name} levelKey={row.level} />
                    <div className="min-w-0">
                      <p className={cn(T.tdName, "truncate")}>{row.name}</p>
                      <p className={cn(T.meta, "truncate")}>
                        {row.className ?? "Sinfsiz"} · {row.gradeCount} baho
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex w-36 items-center gap-2.5">
                    <span className={cn(T.tdNum, "w-9")}>{fmtAvg(row.average)}</span>
                    <div className="flex-1">
                      <AverageBar value={row.average} />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <DeltaChip value={row.delta} />
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ring-1", LEVEL[row.level]?.chip)}>
                    {row.levelLabel}
                  </span>
                </td>
                <td className="max-w-[240px] px-3 py-2.5">
                  {row.topFinding ? (
                    <p className={cn("truncate text-[12px] font-medium", toneOf(row.topFinding.tone).text)}>
                      {row.topFinding.label}
                      {row.topFinding.subject && <span className="text-slate-500"> · {row.topFinding.subject}</span>}
                    </p>
                  ) : (
                    <span className={T.meta}>—</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <RiskPill value={row.riskScore} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusIcons row={row} />
                </td>
                <td className="pr-4">
                  <ChevronRight className="size-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination?.totalPages > 1 && (
        <div className="px-5 py-4">
          <Pagination
            contentRef={containerRef}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.page < pagination.totalPages}
            hasPrevPage={pagination.page > 1}
            onPageChange={setPage}
          />
        </div>
      )}
      {!(pagination?.totalPages > 1) && <div className="h-4" />}
    </Panel>
  );
};

export const RiskPill = ({ value }) => {
  const tone = value >= 70 ? "critical" : value >= 50 ? "warning" : "neutral";
  return (
    <span
      title="Xavf balli (0–100): qancha yuqori — shuncha tezroq e'tibor kerak"
      className={cn("inline-flex min-w-9 justify-center rounded-md px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums ring-1", toneOf(tone).soft)}
    >
      {value}
    </span>
  );
};

/** Nashr va ko'rilganlik belgilari — ota-ona/o'quvchi ochganmi. */
const StatusIcons = ({ row }) => (
  <div className="flex items-center justify-center gap-1.5">
    {row.source === "ai" && (
      <span title="Matnni AI yozgan" className="text-violet-500">
        <Sparkles className="size-3.5" />
      </span>
    )}
    <span
      title={row.isPublished ? "O'quvchi va ota-onaga yuborilgan" : "Hali yuborilmagan"}
      className={row.isPublished ? "text-sky-500" : "text-slate-300"}
    >
      <BellRing className="size-3.5" />
    </span>
    <span
      title={
        row.parentSeen || row.studentSeen
          ? `Ko'rildi: ${[row.parentSeen && "ota-ona", row.studentSeen && "o'quvchi"].filter(Boolean).join(", ")}`
          : "Hali ko'rilmagan"
      }
      className={row.parentSeen || row.studentSeen ? "text-emerald-500" : "text-slate-300"}
    >
      <CheckCheck className="size-3.5" />
    </span>
  </div>
);

export default ReportsTable;
