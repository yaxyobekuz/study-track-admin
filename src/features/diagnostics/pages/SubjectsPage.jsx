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
import { Download, Database, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Can from "@/shared/components/guards/Can";
import DateRangeFilter from "../components/DateRangeFilter";

// Queries
import { analyticsQueries } from "../queries/diagnostics.queries";

// API
import { diagnosticAnalyticsAPI } from "../api/diagnostics.api";

// Data
import { defaultRange, gradeColor, TONES } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { downloadBlob } from "@/shared/utils/download.utils";

/**
 * FANLAR KESIMI — "qaysi fan orqada qolyapti".
 *
 * ⚠️ ENG PAST NATIJA TEPADA — mavzular kesimi bilan bir xil qoida:
 * ro'yxat "kim yutdi" degan savolga emas, "qayerga yordam kerak"
 * degan savolga javob beradi.
 *
 * ⚠️ KESIM SAVOLNING O'Z FANI BO'YICHA (server `getBySubject`).
 * Aralash test o'z fanlariga bo'linadi va "Aralash" degan ma'nosiz
 * qator chiqmaydi.
 */
const SubjectsPage = () => {
  const { filterSlot } = useOutletContext();
  const navigate = useNavigate();

  const [range, setRange] = useState(defaultRange);
  const [onlyWeak, setOnlyWeak] = useState(false);
  const [exporting, setExporting] = useState(false);

  const params = useMemo(() => ({ from: range.from, to: range.to }), [range]);
  const { data, isLoading } = useQuery(analyticsQueries.cut("subjects", params));

  const thresholds = data?.thresholds;
  const weakLine = thresholds?.good ?? 70;

  /**
   * ⚠️ FILTR MIJOZDA — server so'rovi o'zgarmaydi. Sabab: "Jami"
   * qatori BUTUN kesimni ko'rsatishi kerak; filtr serverga ketsa,
   * jami ham torayib, "maktabda o'rtacha necha foiz" degan javob
   * belgiga qarab o'zgarib turardi.
   */
  const rows = useMemo(() => {
    const list = data?.data ?? [];
    const filtered = onlyWeak
      ? list.filter((r) => (r.averageScore ?? 100) < weakLine)
      : list;

    /**
     * ⚠️ ENG PAST NATIJA TEPADA — sarlavha aynan shuni va'da qiladi.
     * Server umumiy kesimni yuqoridan pastga saralaydi (u boshqa
     * ekranlarda ham ishlatiladi); bu yerdagi savol esa "qayerga
     * yordam kerak", shuning uchun tartib teskari. O'lchanmagan fan
     * eng oxirida — u zaif emas, shunchaki noma'lum.
     */
    return [...filtered].sort(
      (a, b) => (a.averageScore ?? 101) - (b.averageScore ?? 101),
    );
  }, [data, onlyWeak, weakLine]);

  const totals = data?.totals;

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await diagnosticAnalyticsAPI.exportSubjects(params);
      downloadBlob(response, "diagnostika_fanlar.xlsx");
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
          <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />,
          filterSlot,
        )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Fanlar kesimida tahlil</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Eng past natijali fan tepada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={onlyWeak}
              onChange={(e) => setOnlyWeak(e.target.checked)}
              className="size-4 rounded border-gray-300 accent-primary"
            />
            Faqat past natijali (&lt;{weakLine}%)
          </label>

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
      </div>

      <Card className="!p-0">
        {isLoading ? (
          <p className="py-16 text-center text-gray-400">Yuklanmoqda…</p>
        ) : !rows.length ? (
          <EmptyState
            icon={Database}
            title={onlyWeak ? "Past natijali fan yo'q" : "Ma'lumot yo'q"}
            description={
              onlyWeak
                ? `Barcha fanlarda o'rtacha natija ${weakLine}% dan yuqori.`
                : "Tanlangan davrda diagnostika topshirilmagan."
            }
          />
        ) : (
          <>
            <Table
              columns={[
                "Fan",
                { label: "Testlar soni", align: "right" },
                { label: "Test ishlaganlar", align: "right" },
                { label: "O'rtacha natija", align: "right" },
                { label: "Yaxshi", align: "right" },
                { label: "O'rta", align: "right" },
                { label: "Zaif", align: "right" },
                { label: "O'sish", align: "right" },
              ]}
            >
              {rows.map((row) => (
                <Tr
                  key={row.key}
                  className="cursor-pointer hover:bg-gray-50"
                  /* ⚠️ FAN NOMIGA BOSILGANDA MAVZULAR KESIMI ochiladi —
                     shu fan bo'yicha filtrlangan holda. "Ingliz tili
                     43%" degan qatordan keyingi savol har doim bitta:
                     "aynan qaysi mavzu?" */
                  onClick={() =>
                    row.subjectId &&
                    navigate(`/diagnostics/topics?subjectId=${row.subjectId}`)
                  }
                >
                  <Td className="font-medium text-gray-900">{row.label}</Td>

                  <Td align="right" className="tabular-nums text-gray-500">
                    {row.testCount}
                  </Td>
                  <Td align="right" className="tabular-nums text-gray-700">
                    {row.attempts}
                  </Td>

                  <Td align="right">
                    <ScorePill value={row.averageScore} bands={thresholds} />
                  </Td>

                  <Td align="right">
                    <Share cell={row.good} color={TONES.mastered.color} />
                  </Td>
                  <Td align="right">
                    <Share cell={row.medium} color={TONES.developing.color} />
                  </Td>
                  <Td align="right">
                    <Share cell={row.bad} color={TONES.gap.color} />
                  </Td>

                  <Td align="right">
                    <Growth value={row.growth} />
                  </Td>
                </Tr>
              ))}

              {/* ⚠️ JAMI — USTUNLARNING YIG'INDISI (serverda). Ekranda
                  ustunlar qo'shilganda jami bilan to'g'ri kelishi
                  kerak, aks holda hisobotga ishonch yo'qolardi. */}
              {totals && !onlyWeak && (
                <Tr className="bg-gray-50 font-semibold">
                  <Td className="text-gray-900">Jami</Td>
                  <Td align="right" className="tabular-nums text-gray-700">
                    {totals.testCount}
                  </Td>
                  <Td align="right" className="tabular-nums text-gray-900">
                    {totals.attempts}
                  </Td>
                  <Td align="right">
                    <ScorePill value={totals.averageScore} bands={thresholds} />
                  </Td>
                  <Td align="right">
                    <Share cell={totals.good} color={TONES.mastered.color} />
                  </Td>
                  <Td align="right">
                    <Share cell={totals.medium} color={TONES.developing.color} />
                  </Td>
                  <Td align="right">
                    <Share cell={totals.bad} color={TONES.gap.color} />
                  </Td>
                  <Td />
                </Tr>
              )}
            </Table>

            <p className="p-4 text-center text-sm text-gray-400 xs:p-5">
              Fan nomiga bosib, mavzular kesimidagi tahlilga o'ting.
            </p>
          </>
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

/** ⚠️ SON VA ULUSH BIRGA: "85 ta" o'z-o'zicha ko'p yoki ozligini bildirmaydi. */
const Share = ({ cell, color }) => (
  <span className="whitespace-nowrap text-sm tabular-nums" style={{ color }}>
    {cell?.count ?? 0}{" "}
    <span className="text-xs opacity-70">({cell?.percent ?? 0}%)</span>
  </span>
);

/** O'sish — PUNKT farqi. `null` ("ma'lumot yo'q") va 0 ("o'zgarmadi") har xil. */
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

export default SubjectsPage;
