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
import { Download, Pencil, Trash2, Search, Users, Crown, Medal, Award } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import EmptyState from "@/shared/components/ui/EmptyState";
import SelectField from "@/shared/components/ui/select/SelectField";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Can from "@/shared/components/guards/Can";
import { GradeBadge } from "../components/ToneBadge";
import DateRangeFilter from "../components/DateRangeFilter";

// Queries
import { analyticsQueries } from "../queries/diagnostics.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data
import { defaultRange, gradeColor } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";
import { downloadBlob } from "@/shared/utils/download.utils";

// API
import { usersAPI } from "@/features/users/api/users.api";

/**
 * O'QUVCHILAR REYTINGI.
 *
 * ⚠️ RO'YXATDA BARCHA O'QUVCHILAR, test ishlaganlari emas. Sarlavhadagi
 * son ("O'quvchilar — 162 ta") maktabning haqiqiy hajmi bo'lishi kerak;
 * faqat ishlaganlarni ko'rsatib "162 ta" deb yozish maxrajni yolg'on
 * qilardi. Test ishlamagan o'quvchi ro'yxat oxirida, natijasiz turadi —
 * u aynan e'tibor talab qiladi.
 *
 * ⚠️ QIDIRUV VA FILTR JADVALNI TORAYTIRADI, sarlavhadagi sonni EMAS:
 * "nechta o'quvchi bor" degan javob ekrandagi filtrga qarab
 * o'zgarmasligi kerak.
 *
 * ⚠️ TAHRIRLASH VA O'CHIRISH — "O'quvchilar" bo'limining AYNI oynalari
 * va AYNI ruxsatlari (`users.update` / `users.delete`). Diagnostika
 * o'z foydalanuvchi boshqaruvini ochmaydi.
 */
const StudentsPage = () => {
  const { filterSlot } = useOutletContext();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [range, setRange] = useState(defaultRange);
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const params = useMemo(
    () => ({ from: range.from, to: range.to, classId }),
    [range, classId],
  );

  const { data, isLoading } = useQuery(analyticsQueries.cut("students", params));
  const { data: classes = [] } = useQuery(classesQueries.list());

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((row) =>
      `${row.label} ${row.username ?? ""} ${row.className ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [data, search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await usersAPI.exportUsers("student");
      downloadBlob(response, "oquvchilar.xlsx");
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
            <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
          </>,
          filterSlot,
        )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            O'quvchilar
            <span className="ml-2 text-sm font-normal text-gray-400">
              — {data?.total ?? 0} ta
            </span>
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            O'quvchi ustiga bosib batafsil tahlilni ko'ring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-[220px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'quvchi qidirish…"
              className="pl-9"
            />
          </div>

          <Can do="users.export">
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
            icon={Users}
            title={search ? "Mos o'quvchi topilmadi" : "O'quvchi yo'q"}
            description={
              search
                ? "Qidiruv so'zini o'zgartirib ko'ring."
                : "Tanlangan sinfda o'quvchi topilmadi."
            }
          />
        ) : (
          <Table
            columns={[
              { label: "#", align: "right" },
              "O'quvchi",
              "Reyting",
              "Sinf",
              { label: "Testlar soni", align: "right" },
              { label: "Jami savol", align: "right" },
              { label: "To'g'ri", align: "right" },
              { label: "Noto'g'ri", align: "right" },
              { label: "O'rtacha natija", align: "right" },
              "Daraja",
              "So'nggi faoliyat",
              { label: "Amallar", align: "center" },
            ]}
          >
            {rows.map((row, index) => (
              <Tr
                key={row.studentId}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/diagnostics/students/${row.studentId}`)}
              >
                <Td align="right" className="tabular-nums text-gray-400">
                  {index + 1}
                </Td>

                <Td>
                  <span className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {[row.label?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-900">
                        {row.label}
                      </span>
                      <span className="block truncate text-[11px] text-gray-400">
                        {row.username}
                      </span>
                    </span>
                  </span>
                </Td>

                <Td>
                  <RankBadge rank={row.rank} />
                </Td>

                <Td className="text-gray-500">{row.className || "—"}</Td>

                <Td align="right" className="tabular-nums text-gray-500">
                  {row.attempts}
                </Td>
                <Td align="right" className="tabular-nums text-gray-500">
                  {row.totalQuestions}
                </Td>
                <Td align="right" className="font-semibold tabular-nums text-emerald-600">
                  {row.correct}
                </Td>
                <Td align="right" className="font-semibold tabular-nums text-rose-600">
                  {row.wrong}
                </Td>

                <Td align="right">
                  {row.averageScore != null ? (
                    <span
                      className="rounded-lg px-2 py-1 text-sm font-semibold tabular-nums"
                      style={{
                        backgroundColor: `${gradeColor(row.averageScore)}1A`,
                        color: gradeColor(row.averageScore),
                      }}
                    >
                      {row.averageScore}%
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </Td>

                <Td>
                  <GradeBadge grade={row.grade} />
                </Td>

                <Td className="whitespace-nowrap text-gray-500">
                  {row.lastActivity ? formatDateUz(row.lastActivity) : "—"}
                </Td>

                <Td align="center">
                  {/* ⚠️ `stopPropagation`: qator bosilganda profilga
                      o'tiladi, tugma esa oynani ochishi kerak. */}
                  <span
                    className="inline-flex gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Can do="users.update">
                      <IconButton
                        title="Tahrirlash"
                        onClick={() =>
                          openModal("editUserBasic", { id: row.studentId })
                        }
                      >
                        <Pencil className="size-4" strokeWidth={1.5} />
                      </IconButton>
                    </Can>
                    <Can do="users.delete">
                      <IconButton
                        title="O'chirish"
                        danger
                        onClick={() =>
                          openModal("deleteUser", {
                            id: row.studentId,
                            firstName: row.label,
                          })
                        }
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </IconButton>
                    </Can>
                  </span>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

/**
 * O'RIN NISHONI.
 *
 * ⚠️ RANG BILAN BIRGA MATN HAM ("1-o'rin"): faqat oltin/kumush/bronza
 * rangiga tayanish rang ko'rmaydigan foydalanuvchi uchun hech narsa
 * anglatmasdi.
 */
const RANKS = {
  1: { icon: Crown, className: "bg-amber-50 text-amber-700 ring-amber-200" },
  2: { icon: Medal, className: "bg-gray-100 text-gray-600 ring-gray-200" },
  3: { icon: Award, className: "bg-orange-50 text-orange-700 ring-orange-200" },
};

const RankBadge = ({ rank }) => {
  if (rank == null) {
    return <span className="text-xs text-gray-300">Test ishlamagan</span>;
  }

  const meta = RANKS[rank];
  const Icon = meta?.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ring-1",
        meta?.className || "bg-gray-50 text-gray-500 ring-gray-200",
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2} />}
      {rank}-o'rin
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

export default StudentsPage;
