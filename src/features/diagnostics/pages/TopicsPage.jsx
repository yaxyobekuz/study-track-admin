// React
import { useMemo, useState } from "react";

// Router
import { useOutletContext, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { Download, BookOpen, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import SelectField from "@/shared/components/ui/select/SelectField";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Can from "@/shared/components/guards/Can";
import { Badge } from "../components/ToneBadge";
import DateRangeFilter from "../components/DateRangeFilter";

// Queries
import { analyticsQueries } from "../queries/diagnostics.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// API
import { diagnosticAnalyticsAPI } from "../api/diagnostics.api";

// Data
import {
  defaultRange,
  gradeColor,
  GRADE_LABELS,
  GRADE_BADGE,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { downloadBlob } from "@/shared/utils/download.utils";

/**
 * MAVZULAR KESIMI — "qaysi mavzu o'zlashtirilmayapti".
 *
 * ⚠️ ENG ZAIF MAVZU TEPADA. Bu ro'yxatning butun ma'nosi shu: rahbar
 * ochganda birinchi ko'radigan qatori — eng ko'p e'tibor talab
 * qiladigani. Alifbo yoki nom bo'yicha saralash uni ro'yxat ichida
 * yo'qotib yuborardi.
 *
 * ⚠️ MANBA — URINISHNING MUHRLANGAN KESIMI (`breakdown`), jonli hisob
 * emas. Mavzu nomi keyin o'zgarsa yoki mavzu o'chirilsa, o'tgan
 * hisobot buzilmaydi.
 */
const TopicsPage = () => {
  const { filterSlot } = useOutletContext();

  const [range, setRange] = useState(defaultRange);
  /**
   * ⚠️ FAN URL DAN OLINADI. "Fanlar" kesimidan qatorga bosilganda
   * `?subjectId=` bilan kelinadi va mavzular darhol o'sha fan
   * bo'yicha filtrlanadi — foydalanuvchi filtrni qo'lda qayta
   * tanlashi shart emas.
   */
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    subjectId: searchParams.get("subjectId") || "",
    classId: "",
  });
  const [exporting, setExporting] = useState(false);

  const params = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      subjectId: filters.subjectId,
      classId: filters.classId,
    }),
    [range, filters],
  );

  const { data, isLoading } = useQuery(analyticsQueries.cut("topics", params));
  const { data: subjects = [] } = useSubjects();
  const { data: classes = [] } = useQuery(classesQueries.list());

  const rows = data?.data ?? [];
  const totals = data?.totals;

  const bands = useMemo(() => {
    const t = data?.thresholds;
    const good = t?.good ?? 70;
    const medium = t?.medium ?? 40;
    return { good, medium };
  }, [data]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await diagnosticAnalyticsAPI.exportTopics(params);
      downloadBlob(response, "diagnostika_mavzular.xlsx");
    } catch (error) {
      toast.error(error.response?.data?.message || "Eksport qilinmadi");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div className="w-[150px]">
              <SelectField
                name="subjectId"
                label="Fan"
                value={filters.subjectId}
                options={[
                  { value: "", label: "Barcha fanlar" },
                  ...subjects.map((s) => ({ value: s.id, label: s.name })),
                ]}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, subjectId: value }))
                }
              />
            </div>
            <div className="w-[150px]">
              <SelectField
                name="classId"
                label="Sinf"
                value={filters.classId}
                options={[
                  { value: "", label: "Barcha sinflar" },
                  ...classes.map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, classId: value }))
                }
              />
            </div>
            <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
          </>,
          filterSlot,
        )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            Mavzu bo'yicha to'liq statistika
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Eng zaif mavzu tepada — shu yerdan boshlansa, o'sish eng tez bo'ladi
          </p>
        </div>

        <Can do="diagnostics.export">
          <Button
            variant="secondary"
            className="px-3.5"
            disabled={exporting}
            onClick={handleExport}
          >
            <Download
              className={cn("mr-2 size-4", exporting && "animate-pulse")}
              strokeWidth={1.5}
            />
            Excelga export
          </Button>
        </Can>
      </div>

      <Card className="!p-0">
        {isLoading ? (
          <p className="py-16 text-center text-gray-400">Yuklanmoqda…</p>
        ) : !rows.length ? (
          <EmptyState
            icon={BookOpen}
            title="Mavzu topilmadi"
            description="Tanlangan davrda diagnostika topshirilmagan yoki savollar mavzuga biriktirilmagan."
          />
        ) : (
          <Table
            columns={[
              "Mavzu",
              { label: "Testlar soni", align: "right" },
              { label: "Savollar soni", align: "right" },
              { label: "To'g'ri javoblar", align: "right" },
              { label: "Noto'g'ri javoblar", align: "right" },
              { label: "O'tkazib yuborilgan", align: "right" },
              { label: "O'rtacha natija", align: "right" },
              "Daraja",
              { label: "O'sish", align: "right" },
            ]}
          >
            {rows.map((row) => (
              <Tr key={row.key}>
                <Td nowrap={false} className="max-w-[420px]">
                  <span className="block truncate font-medium text-gray-900">
                    {row.label}
                  </span>
                  {/* Fan nomi mavzuning yonida, kulrang: "III bob"
                      degan mavzu qaysi fanniki ekani nomidan
                      ko'rinmaydi. */}
                  <span className="text-xs text-gray-400">
                    {row.subjectName || "Fan belgilanmagan"}
                  </span>
                </Td>

                <Td align="right" className="tabular-nums text-gray-500">
                  {row.attempts}
                </Td>
                <Td align="right" className="tabular-nums text-gray-700">
                  {row.questions}
                </Td>
                <Td align="right" className="font-semibold tabular-nums text-emerald-600">
                  {row.correct}
                </Td>
                <Td align="right" className="font-semibold tabular-nums text-rose-600">
                  {row.wrong}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {row.skipped}
                </Td>

                <Td align="right">
                  <ScorePill value={row.averageScore} bands={bands} />
                </Td>

                <Td>
                  {row.grade ? (
                    <Badge className={GRADE_BADGE[row.grade]}>
                      {GRADE_LABELS[row.grade]}
                    </Badge>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </Td>

                <Td align="right">
                  <Growth value={row.growth} />
                </Td>
              </Tr>
            ))}

            {/* ── JAMI ───────────────────────── */}
            {/* ⚠️ O'RTACHA — QATORLARNING O'RTACHASI EMAS, umumiy
                to'g'ri javob ulushi (serverda hisoblanadi). Qatorlarni
                o'rtachalash bitta savolli mavzuga ellik savolli mavzu
                bilan teng vazn berardi. */}
            {totals && (
              <Tr className="bg-gray-50 font-semibold">
                <Td className="text-gray-900">Jami</Td>
                <Td align="right" className="tabular-nums text-gray-700">
                  {totals.attempts}
                </Td>
                <Td align="right" className="tabular-nums text-gray-900">
                  {totals.questions}
                </Td>
                <Td align="right" className="tabular-nums text-emerald-600">
                  {totals.correct}
                </Td>
                <Td align="right" className="tabular-nums text-rose-600">
                  {totals.wrong}
                </Td>
                <Td align="right" className="tabular-nums text-gray-700">
                  {totals.skipped}
                </Td>
                <Td align="right">
                  <ScorePill value={totals.averageScore} bands={bands} />
                </Td>
                <Td />
                <Td />
              </Tr>
            )}
          </Table>
        )}
      </Card>
    </div>
  );
};

/** Foiz nishoni — rang daraja chegarasi bo'yicha. */
const ScorePill = ({ value, bands }) => {
  if (value == null) return <span className="text-gray-300">—</span>;
  const color = gradeColor(value, bands);
  return (
    <span
      className="rounded-lg px-2 py-1 text-sm font-semibold tabular-nums"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {value}%
    </span>
  );
};

/**
 * O'SISH — PUNKT farqi, foiz emas.
 *
 * ⚠️ `null` va `0` HAR XIL: birinchisi "taqqoslash uchun ma'lumot
 * yo'q" (o'tgan davrda bu mavzu o'lchanmagan), ikkinchisi
 * "o'zgarmadi".
 */
const Growth = ({ value }) => {
  if (value == null) return <span className="text-gray-300">—</span>;
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        value > 0 && "text-emerald-600",
        value < 0 && "text-rose-600",
        value === 0 && "text-gray-400",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {value > 0 ? "+" : ""}
      {value}
    </span>
  );
};

export default TopicsPage;
