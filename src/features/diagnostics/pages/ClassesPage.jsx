// React
import { useMemo, useState } from "react";

// Router
import { useNavigate, useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { Plus, Download, Pencil, Trash2, School } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import SelectField from "@/shared/components/ui/select/SelectField";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Can from "@/shared/components/guards/Can";
import DateRangeFilter from "../components/DateRangeFilter";

// Queries
import { analyticsQueries } from "../queries/diagnostics.queries";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import useModal from "@/shared/hooks/useModal";

// Data
import { TONES, GRADE_LABELS, defaultRange } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { downloadBlob } from "@/shared/utils/download.utils";

// API
import { classesAPI } from "@/features/classes/api/classes.api";

/**
 * SINFLAR KESIMIDA TAHLIL.
 *
 * ⚠️ SINFLAR SHU LOYIHANING O'Z SINFLARI. Diagnostika o'z sinf
 * ro'yxatini yuritmaydi: qo'shish, tahrirlash va o'chirish "Sinflar"
 * bo'limining AYNI oynalari orqali boradi (`createClass` / `editClass`
 * / `deleteClass`). Ikkinchi ro'yxat paydo bo'lsa, bir joyda
 * o'zgartirilgan sinf ikkinchisida eskirib qolardi.
 *
 * ⚠️ URINISHI YO'Q SINF HAM RO'YXATDA (server shunday qaytaradi) —
 * "bu sinf umuman test ishlamagan" degan ma'lumot aynan e'tibor talab
 * qiladi va uni ro'yxatdan tushirib qoldirish xato bo'lardi.
 */
const ClassesPage = () => {
  const { filterSlot } = useOutletContext();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [range, setRange] = useState(defaultRange);
  const [subjectId, setSubjectId] = useState("");
  const [exporting, setExporting] = useState(false);

  const params = useMemo(
    () => ({ from: range.from, to: range.to, subjectId }),
    [range, subjectId],
  );

  const { data, isLoading } = useQuery(analyticsQueries.cut("classes", params));
  const { data: subjects = [] } = useSubjects();

  const rows = useMemo(() => data?.data ?? [], [data]);

  /**
   * Daraja oraliqlari — SOZLAMADAN. Chegarani admin o'zgartirsa,
   * ustun sarlavhasi ham o'zgaradi.
   */
  const bands = useMemo(() => {
    const t = data?.thresholds;
    const good = t?.good ?? 70;
    const medium = t?.medium ?? 40;
    return {
      good: `${good}–100%`,
      medium: `${medium}–${good - 1}%`,
      bad: `0–${medium - 1}%`,
    };
  }, [data]);

  /**
   * Jami qatori — ustunlar yig'indisi.
   *
   * ⚠️ O'RTACHA BALL URINISHLAR BO'YICHA VAZNLANADI, sinflarning
   * o'rtachalarining o'rtachasi EMAS: 2 o'quvchili sinf 30 o'quvchili
   * sinf bilan teng vaznga ega bo'lib qolardi.
   */
  const totals = useMemo(() => {
    const sum = (fn) => rows.reduce((n, r) => n + fn(r), 0);
    const attempts = sum((r) => r.attempts);
    const good = sum((r) => r.good.count);
    const medium = sum((r) => r.medium.count);
    const bad = sum((r) => r.bad.count);
    const graded = good + medium + bad || 1;
    return {
      students: sum((r) => r.studentCount ?? 0),
      attempts,
      good,
      medium,
      bad,
      share: (n) => Math.round((n / graded) * 100),
      averageScore: attempts
        ? Math.round((sum((r) => (r.averageScore ?? 0) * r.attempts) / attempts) * 10) /
          10
        : null,
    };
  }, [rows]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await classesAPI.exportAll();
      downloadBlob(response, "sinflar.xlsx");
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Sinflar kesimida tahlil</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Sinf ustiga bosib batafsil ko'ring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {/* ⚠️ SINF QO'SHISH "Sinflar" BO'LIMINING OYNASI bilan — shu
              sababli ruxsat ham o'sha bo'limniki (`classes.create`),
              diagnostikaniki emas: sinf butun tizimga tegishli. */}
          <Can do="classes.create">
            <Button className="px-3.5" onClick={() => openModal("createClass")}>
              <Plus className="mr-2 size-4" strokeWidth={2} />
              Sinf qo'shish
            </Button>
          </Can>
        </div>
      </div>

      <Card className="!p-0">
        {isLoading ? (
          <p className="py-16 text-center text-gray-400">Yuklanmoqda…</p>
        ) : !rows.length ? (
          <EmptyState
            icon={School}
            title="Sinf topilmadi"
            description="Avval sinf yarating — keyin bu yerda ularning diagnostika kesimi chiqadi."
          />
        ) : (
          <Table
            columns={[
              "Sinf",
              { label: "O'quvchilar soni", align: "right" },
              { label: "Test ishlaganlar", align: "right" },
              { label: "O'rtacha natija", align: "right" },
              // ⚠️ SO'Z LOYIHA BO'YLAB BITTA: "Zaif", "Yomon" EMAS.
              // Daraja nomi `GRADE_LABELS` da bitta joyda yozilgan va
              // natija nishonlari, taqsimot kartasi hamda bu jadval
              // bir xil so'zni ishlatishi kerak — aks holda bitta
              // ekranda bitta daraja ikki xil atalardi.
              { label: `${GRADE_LABELS.GOOD} (${bands.good})`, align: "right" },
              { label: `${GRADE_LABELS.MEDIUM} (${bands.medium})`, align: "right" },
              { label: `${GRADE_LABELS.BAD} (${bands.bad})`, align: "right" },
              { label: "O'sish", align: "right" },
              { label: "Amallar", align: "center" },
            ]}
          >
            {rows.map((row) => (
              <Tr
                key={row.key}
                className={row.classId ? "cursor-pointer hover:bg-gray-50" : undefined}
                onClick={
                  row.classId
                    ? () => navigate(`/diagnostics/classes/${row.classId}`)
                    : undefined
                }
              >
                <Td className="font-medium text-gray-900">{row.label}</Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {row.studentCount ?? "—"}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {row.attempts}
                </Td>
                <Td align="right" className="font-semibold tabular-nums">
                  {row.averageScore != null ? `${row.averageScore}%` : "—"}
                </Td>
                <ShareCell count={row.good.count} percent={row.good.percent} tone="mastered" />
                <ShareCell count={row.medium.count} percent={row.medium.percent} tone="developing" />
                <ShareCell count={row.bad.count} percent={row.bad.percent} tone="gap" />
                <Td align="right">
                  <Growth value={row.growth} />
                </Td>
                <Td align="center">
                  {row.classId ? (
                    // ⚠️ `stopPropagation` MAJBURIY: qator bosilganda
                    // sinf tafsilotiga o'tiladi, tugma esa oynani
                    // ochishi kerak — ikkalasi bir vaqtda ishlamasin.
                    <span
                      className="inline-flex gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Can do="classes.update">
                        <IconButton
                          title="Tahrirlash"
                          onClick={() =>
                            openModal("editClass", { id: row.classId, name: row.label })
                          }
                        >
                          <Pencil className="size-4" strokeWidth={1.5} />
                        </IconButton>
                      </Can>
                      <Can do="classes.delete">
                        <IconButton
                          title="O'chirish"
                          danger
                          onClick={() =>
                            openModal("deleteClass", { id: row.classId, name: row.label })
                          }
                        >
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </IconButton>
                      </Can>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </Td>
              </Tr>
            ))}

            {/* Jami qatori — ustunlar bir-biriga to'g'ri kelishini
                tekshirishning eng oson yo'li. */}
            <Tr className="bg-gray-50 font-medium">
              <Td className="text-gray-900">Jami</Td>
              <Td align="right" className="tabular-nums">{totals.students}</Td>
              <Td align="right" className="tabular-nums">{totals.attempts}</Td>
              <Td align="right" className="tabular-nums">
                {totals.averageScore != null ? `${totals.averageScore}%` : "—"}
              </Td>
              <ShareCell count={totals.good} percent={totals.share(totals.good)} tone="mastered" />
              <ShareCell count={totals.medium} percent={totals.share(totals.medium)} tone="developing" />
              <ShareCell count={totals.bad} percent={totals.share(totals.bad)} tone="gap" />
              <Td align="right" className="text-gray-300">—</Td>
              <Td align="center" className="text-gray-300">—</Td>
            </Tr>
          </Table>
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
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        positive && "text-emerald-600",
        !positive && !zero && "text-rose-600",
        zero && "text-gray-400",
      )}
    >
      {positive ? "+" : ""}
      {value} punkt
    </span>
  );
};

/** ⚠️ Ikonka TANADA nomlanadi — JSX katta harfli identifikator talab qiladi. */
const IconButton = ({ title, danger, onClick, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      "rounded-lg border border-gray-200 p-1.5 transition-colors",
      danger
        ? "text-rose-600 hover:border-rose-200 hover:bg-rose-50"
        : "text-gray-500 hover:border-gray-300 hover:bg-gray-50",
    )}
  >
    {children}
  </button>
);

export default ClassesPage;
