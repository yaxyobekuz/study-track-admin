// React
import { useMemo, useState } from "react";

// Router
import { Link, useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { Download, ClipboardList, ChevronRight, Trash2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import Can from "@/shared/components/guards/Can";
import { Badge, GradeBadge } from "../components/ToneBadge";
import DateRangeFilter from "../components/DateRangeFilter";
import DeleteAttemptModal from "../components/DeleteAttemptModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import { classesQueries } from "@/features/classes/queries/classes.queries";
import { attemptQueries } from "../queries/diagnostics.queries";

// API
import { diagnosticAttemptsAPI } from "../api/diagnostics.api";

// Data
import {
  ATTEMPT_STATUS_LABELS,
  ATTEMPT_STATUS_BADGE,
  MODE_LABELS,
  defaultRange,
} from "../data/diagnostics.data";

// Utils
import { formatDateTimeUz, formatDurationShortUz } from "@/shared/utils/date.utils";

/**
 * O'QUVCHILAR NATIJALARI.
 *
 * ⚠️ SINF USTUNI URINISHDAGI SURATDAN (`student.className`), joriy
 * sinfdan EMAS (`education.md` §5): o'quvchini boshqa sinfga o'tkazish
 * o'tgan hisobotni jimgina qayta yozib yubormasligi kerak.
 */
const AttemptsPage = () => {
  const { filterSlot } = useOutletContext();
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [range, setRange] = useState(defaultRange);
  const [filters, setFilters] = useState({
    search: "",
    subjectId: "",
    classId: "",
    status: "",
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const params = useMemo(
    () => ({
      page,
      limit: 25,
      from: range.from,
      to: range.to,
      search: debouncedSearch,
      subjectId: filters.subjectId,
      classId: filters.classId,
      status: filters.status,
    }),
    [page, range, debouncedSearch, filters],
  );

  const { data, isLoading } = useQuery(attemptQueries.list(params));
  const { data: subjects = [] } = useSubjects();
  const { data: classes = [] } = useQuery(classesQueries.list());

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const response = await diagnosticAttemptsAPI.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `diagnostika_natijalar_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Eksport qilinmadi");
    }
  };

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div className="w-[170px]">
              <InputField
                type="search"
                name="search"
                label="O'quvchi"
                placeholder="Ism yoki familiya"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>
            <div className="w-[140px]">
              <SelectField
                name="classId"
                label="Sinf"
                value={filters.classId}
                options={[
                  { value: "", label: "Barcha sinflar" },
                  ...classes.map((c) => ({ value: c.id, label: c.name })),
                ]}
                onChange={(value) => setFilter("classId", value)}
              />
            </div>
            <div className="w-[140px]">
              <SelectField
                name="subjectId"
                label="Fan"
                value={filters.subjectId}
                options={[
                  { value: "", label: "Barcha fanlar" },
                  ...subjects.map((s) => ({ value: s.id, label: s.name })),
                ]}
                onChange={(value) => setFilter("subjectId", value)}
              />
            </div>
            <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
          </>,
          filterSlot,
        )}

      <Can do="diagnostics.export">
        <div className="flex justify-end">
          <Button variant="secondary" className="px-3.5" onClick={handleExport}>
            <Download className="mr-2 size-5" strokeWidth={1.5} />
            Excel
          </Button>
        </div>
      </Can>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-400">Yuklanmoqda…</Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Natija topilmadi"
            description="Tanlangan davrda va filtrlar bo'yicha diagnostika topshirilmagan."
          />
        </Card>
      ) : (
        <>
          <Table
            columns={[
              "O'quvchi",
              "Sinf",
              "Fan / test",
              "Rejim",
              { label: "Natija", align: "right" },
              "Daraja",
              { label: "To'g'ri", align: "right" },
              { label: "Vaqt", align: "right" },
              "Topshirilgan",
              "Holati",
              { label: "", align: "right" },
            ]}
          >
            {rows.map((attempt) => (
              <Tr key={attempt.id} className="hover:bg-gray-50">
                <Td className="font-medium text-gray-900">
                  {[attempt.student?.lastName, attempt.student?.firstName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </Td>

                <Td className="text-gray-500">
                  {attempt.student?.className || "—"}
                </Td>

                <Td nowrap={false} className="max-w-[200px]">
                  <p className="truncate text-gray-700">
                    {attempt.subjectName || "Aralash"}
                  </p>
                  {attempt.testTitle && (
                    <p className="truncate text-xs text-gray-400">
                      {attempt.testTitle}
                    </p>
                  )}
                </Td>

                <Td className="text-gray-500">{MODE_LABELS[attempt.mode]}</Td>

                <Td align="right" className="font-semibold tabular-nums text-gray-900">
                  {attempt.score != null ? `${Math.round(attempt.score)}%` : "—"}
                </Td>

                <Td>
                  <GradeBadge grade={attempt.grade} />
                </Td>

                <Td align="right" className="tabular-nums text-gray-500">
                  {attempt.correctCount ?? 0}/{attempt.totalQuestions ?? 0}
                </Td>

                <Td align="right" className="tabular-nums text-gray-500">
                  {formatDurationShortUz(
                    Math.round((attempt.timeSpentSec ?? 0) / 60),
                    "—",
                  )}
                </Td>

                <Td className="text-gray-500">
                  {attempt.submittedAt ? formatDateTimeUz(attempt.submittedAt) : "—"}
                </Td>

                <Td>
                  <Badge className={ATTEMPT_STATUS_BADGE[attempt.status]}>
                    {ATTEMPT_STATUS_LABELS[attempt.status]}
                  </Badge>
                </Td>

                <Td align="right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      to={`/diagnostics/attempts/${attempt.id}`}
                      className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
                    >
                      Natija
                      <ChevronRight className="size-4" strokeWidth={1.5} />
                    </Link>

                    <Can do="diagnostics.delete">
                      <button
                        onClick={() => openModal("deleteDiagnosticAttempt", { attempt })}
                        className="text-rose-600 hover:text-rose-900"
                        title="O'chirish"
                      >
                        <Trash2 className="size-4" strokeWidth={1.5} />
                      </button>
                    </Can>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <DeleteAttemptModal />
    </div>
  );
};

export default AttemptsPage;
