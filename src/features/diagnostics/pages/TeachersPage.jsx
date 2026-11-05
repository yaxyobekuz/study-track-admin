// React
import { useMemo, useState } from "react";

// Router
import { useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { GraduationCap, TrendingDown, TrendingUp, Minus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import SelectField from "@/shared/components/ui/select/SelectField";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import { Badge } from "../components/ToneBadge";
import DateRangeFilter from "../components/DateRangeFilter";

// Queries
import { analyticsQueries } from "../queries/diagnostics.queries";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

// Data
import { TONES, GRADE_LABELS, defaultRange } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * O'QITUVCHILAR KESIMIDA TAHLIL.
 *
 * Sinflar kesimi "qayerda muammo bor" deb aytadi, bu ekran esa "kim
 * bilan gaplashish kerak" deb aytadi. Shuning uchun asosiy ustun —
 * joriy davr BILAN O'TGAN DAVR ORASIDAGI FARQ: "64%" o'z-o'zicha hech
 * narsa aytmaydi, "64%, o'tgan oyga nisbatan −12 punkt" esa qaror
 * qabul qilishga yaraydi.
 *
 * ⚠️ BOG'LANISH SERVERDA: urinish → (sinf, fan) → o'qituvchi (dars
 * jadvalidan). Panel hech narsa hisoblamaydi.
 *
 * ⚠️ QATORLAR YIG'INDISI "JAMI" DAN KATTA BO'LISHI MUMKIN: bir sinfga
 * bir fandan ikki o'qituvchi dars bersa, natija IKKALASIDA ham
 * sanaladi (ikkalasi ham javobgar). Buni ekran OCHIQ aytadi — aks
 * holda raqamlar qo'shilmagani nosozlik bo'lib ko'rinardi.
 */
const TeachersPage = () => {
  const { filterSlot } = useOutletContext();

  const [range, setRange] = useState(defaultRange);
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");

  const params = useMemo(
    () => ({ from: range.from, to: range.to, subjectId, classId }),
    [range, subjectId, classId],
  );

  const { data, isLoading } = useQuery(analyticsQueries.cut("teachers", params));
  const { data: subjects = [] } = useSubjects();
  const { data: classes = [] } = useQuery(classesQueries.list());

  const rows = useMemo(() => data?.data ?? [], [data]);

  /** Daraja oraliqlari — SOZLAMADAN (sinflar ekranidagi AYNI qoida). */
  const bands = useMemo(() => {
    const good = data?.thresholds?.good ?? 70;
    const medium = data?.thresholds?.medium ?? 40;
    return {
      good: `${good}–100%`,
      medium: `${medium}–${good - 1}%`,
      bad: `0–${medium - 1}%`,
    };
  }, [data]);

  /** Eng ko'p ko'tarilgan va eng ko'p tushgan — ekranning asosiy javobi. */
  const movers = useMemo(() => {
    const measured = rows.filter((row) => row.growth != null);
    const sorted = [...measured].sort((a, b) => b.growth - a.growth);
    return {
      up: sorted.filter((row) => row.growth > 0).slice(0, 3),
      down: sorted.filter((row) => row.growth < 0).reverse().slice(0, 3),
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div className="w-[150px]">
              <SelectField
                name="classId"
                label="Sinf"
                value={classId}
                options={[
                  { value: "", label: "Barcha sinflar" },
                  ...classes.map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={setClassId}
              />
            </div>
            <div className="w-[150px]">
              <SelectField
                name="subjectId"
                label="Fan"
                value={subjectId}
                options={[
                  { value: "", label: "Barcha fanlar" },
                  ...subjects.map((s) => ({ value: s.id, label: s.name })),
                ]}
                onChange={setSubjectId}
              />
            </div>
            <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
          </>,
          filterSlot,
        )}

      <div>
        <h2 className="font-semibold text-gray-900">O'qituvchilar kesimi</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Natija dars jadvali bo'yicha bog'lanadi: o'qituvchining sinflari va
          fanlari. Farq o'tgan AYNI UZUNLIKDAGI davr bilan solishtiriladi.
        </p>
      </div>

      {/* ── KO'TARILISH / TUSHISH ────────── */}
      {(movers.up.length > 0 || movers.down.length > 0) && (
        <div className="grid gap-3 lg:grid-cols-2">
          <MoverCard
            title="Eng ko'p ko'tarilgan"
            icon={TrendingUp}
            tone="emerald"
            rows={movers.up}
          />
          <MoverCard
            title="Eng ko'p tushgan"
            icon={TrendingDown}
            tone="rose"
            rows={movers.down}
          />
        </div>
      )}

      <Card className="!p-0">
        {isLoading ? (
          <p className="py-16 text-center text-gray-400">Yuklanmoqda…</p>
        ) : !rows.length ? (
          <EmptyState
            icon={GraduationCap}
            title="O'qituvchi topilmadi"
            description="Kesim dars jadvalidan quriladi — jadvalga dars qo'yilgandan keyin bu yerda o'qituvchilar chiqadi."
          />
        ) : (
          <>
            <Table
              columns={[
                "O'qituvchi",
                "Sinflar / fanlar",
                { label: "Test ishlaganlar", align: "right" },
                { label: "O'quvchilar", align: "right" },
                { label: "O'tgan davr", align: "right" },
                { label: "Joriy davr", align: "right" },
                { label: "Farq", align: "right" },
                { label: `${GRADE_LABELS.GOOD} (${bands.good})`, align: "right" },
                { label: `${GRADE_LABELS.MEDIUM} (${bands.medium})`, align: "right" },
                { label: `${GRADE_LABELS.BAD} (${bands.bad})`, align: "right" },
              ]}
            >
              {rows.map((row) => (
                <Tr key={row.key}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {(row.label?.[0] || "?").toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-900">
                          {row.label}
                          {row.isArchived && (
                            <span className="ml-1.5 text-[11px] font-normal text-gray-400">
                              (arxivlangan)
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-gray-400">
                          {row.username || "—"}
                        </span>
                      </span>
                    </span>
                  </Td>

                  <Td nowrap={false} className="max-w-[260px]">
                    <span className="flex flex-wrap gap-1">
                      {row.subjects.map((name) => (
                        <Badge
                          key={name}
                          className="bg-blue-50 text-blue-700 ring-blue-200"
                        >
                          {name}
                        </Badge>
                      ))}
                    </span>
                    <span className="mt-1 block text-[11px] text-gray-400">
                      {row.classes.join(", ") || "—"}
                    </span>
                  </Td>

                  <Td align="right" className="tabular-nums text-gray-500">
                    {row.attempts}
                  </Td>
                  <Td align="right" className="tabular-nums text-gray-500">
                    {row.students}
                  </Td>

                  <Td align="right" className="tabular-nums text-gray-400">
                    {row.previousScore != null ? `${row.previousScore}%` : "—"}
                  </Td>
                  <Td align="right" className="font-semibold tabular-nums">
                    {row.averageScore != null ? `${row.averageScore}%` : "—"}
                  </Td>
                  <Td align="right">
                    <Growth value={row.growth} />
                  </Td>

                  <ShareCell count={row.good.count} percent={row.good.percent} tone="mastered" />
                  <ShareCell count={row.medium.count} percent={row.medium.percent} tone="developing" />
                  <ShareCell count={row.bad.count} percent={row.bad.percent} tone="gap" />
                </Tr>
              ))}

              {/* ⚠️ "JAMI" URINISHLAR BO'YICHA, qatorlar yig'indisi
                  bo'yicha EMAS: bir sinfga bir fandan ikki o'qituvchi
                  dars bersa, urinish ikki qatorda sanaladi. */}
              <Tr className="bg-gray-50 font-medium">
                <Td className="text-gray-900">Jami</Td>
                <Td className="text-gray-300">—</Td>
                <Td align="right" className="tabular-nums">
                  {data?.totals?.attempts ?? 0}
                </Td>
                <Td align="right" className="tabular-nums">
                  {data?.totals?.students ?? 0}
                </Td>
                <Td align="right" className="text-gray-300">—</Td>
                <Td align="right" className="tabular-nums">
                  {data?.totals?.averageScore != null
                    ? `${data.totals.averageScore}%`
                    : "—"}
                </Td>
                <Td align="right" className="text-gray-300">—</Td>
                <ShareCell
                  count={data?.totals?.good?.count ?? 0}
                  percent={data?.totals?.good?.percent ?? 0}
                  tone="mastered"
                />
                <ShareCell
                  count={data?.totals?.medium?.count ?? 0}
                  percent={data?.totals?.medium?.percent ?? 0}
                  tone="developing"
                />
                <ShareCell
                  count={data?.totals?.bad?.count ?? 0}
                  percent={data?.totals?.bad?.percent ?? 0}
                  tone="gap"
                />
              </Tr>
            </Table>

            <p className="border-t border-gray-100 p-4 text-xs text-gray-400 xs:p-5">
              Bir sinfga bir fandan ikki o'qituvchi dars bersa, natija ikkalasida
              ham sanaladi — shuning uchun qatorlar yig'indisi "Jami" dan katta
              bo'lishi mumkin.
              {data?.unassigned?.attempts > 0 && (
                <>
                  {" "}
                  {data.unassigned.attempts} ta urinish hech bir o'qituvchiga
                  bog'lanmadi ({data.unassigned.hint.toLowerCase()}).
                </>
              )}
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

/** "12 (34%)" — son va ulush birga: son o'z-o'zicha ko'plikni bildirmaydi. */
const ShareCell = ({ count, percent, tone }) => (
  <Td align="right" className="tabular-nums">
    <span className="font-semibold" style={{ color: TONES[tone].color }}>
      {count}
    </span>
    <span className="ml-1 text-gray-400">({percent}%)</span>
  </Td>
);

const Growth = ({ value }) => {
  if (value == null) return <span className="text-gray-300">—</span>;
  const positive = value > 0;
  const zero = value === 0;
  const Icon = zero ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold tabular-nums",
        positive && "text-emerald-600",
        !positive && !zero && "text-rose-600",
        zero && "text-gray-400",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
      {positive ? "+" : ""}
      {value}
    </span>
  );
};

const MOVER_TONES = {
  emerald: "text-emerald-600",
  rose: "text-rose-600",
};

const MoverCard = ({ title, icon: Icon, tone, rows }) => (
  <Card>
    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
      <Icon className={cn("size-4", MOVER_TONES[tone])} strokeWidth={2} />
      {title}
    </h3>

    {rows.length === 0 ? (
      <p className="mt-3 text-sm text-gray-400">Bu davrda bunday o'zgarish yo'q</p>
    ) : (
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-gray-900">
                {row.label}
              </span>
              <span className="block truncate text-[11px] text-gray-400">
                {row.subjects.join(", ")} · {row.classes.join(", ")}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm tabular-nums">
              <span className="text-gray-400">
                {row.previousScore}% → {row.averageScore}%
              </span>
              <Growth value={row.growth} />
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

export default TeachersPage;
