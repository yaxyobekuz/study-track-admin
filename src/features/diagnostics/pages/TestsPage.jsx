// React
import { useMemo, useState } from "react";

// Router
import { useOutletContext } from "react-router-dom";
import { createPortal } from "react-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { Edit, Trash2, ClipboardList, Search } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import SelectField from "@/shared/components/ui/select/SelectField";
import InputField from "@/shared/components/ui/input/InputField";
import Can from "@/shared/components/guards/Can";
import { Badge } from "../components/ToneBadge";
import TestBuilder from "../components/TestBuilder";
import TestFormModal from "../components/TestFormModal";
import DeleteTestModal from "../components/DeleteTestModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";
import { classesQueries } from "@/features/classes/queries/classes.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import { testQueries } from "../queries/diagnostics.queries";
import { useCreateTest } from "../queries/diagnostics.mutations";

// Data
import {
  TEST_STATUSES,
  TEST_STATUS_LABELS,
  TEST_STATUS_BADGE,
  TEST_STATUS_TRANSITIONS,
  MODE_LABELS,
  LEVEL_LABELS,
} from "../data/diagnostics.data";

// Utils
import { formatDateUz } from "@/shared/utils/date.utils";
import { cn } from "@/shared/utils/cn";

/**
 * DIAGNOSTIKA TESTLARI.
 *
 * ⚠️ NASHR QILISHDA SERVER BANKNI TEKSHIRADI: mos savol yetmasa test
 * "faol" bo'lmaydi va sabab shu yerda ko'rsatiladi. Muammo o'quvchining
 * oldida emas, testni tuzayotgan odam oldida chiqishi kerak.
 */
/**
 * HOLAT TABLARI.
 *
 * ⚠️ `scheduled` — "Rejalashtirilgan": sanasi kelmagan test. `active`
 * — hozir ochiq. `archived` — yopilgan. `draft` ataylab YO'Q:
 * yaratilgan test darhol `draft` bo'ladi va u ro'yxatda "Barchasi"
 * ostida ko'rinadi; alohida tab qo'shilsa, foydalanuvchi uni "faol
 * test" deb o'ylardi.
 */
const STATUS_TABS = [
  { value: "", label: "Barchasi" },
  { value: "scheduled", label: "Rejalashtirilgan" },
  { value: "active", label: "Faol" },
  { value: "archived", label: "Tugallangan" },
];

const TestsPage = () => {
  const { filterSlot } = useOutletContext();
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "", subjectId: "" });
  const debouncedSearch = useDebounce(filters.search, 400);

  const params = useMemo(
    () => ({
      page,
      limit: 12,
      search: debouncedSearch,
      status: filters.status,
      subjectId: filters.subjectId,
    }),
    [page, debouncedSearch, filters.status, filters.subjectId],
  );

  const { data, isLoading } = useQuery(testQueries.list(params));
  const { data: subjects = [] } = useSubjects();
  const { data: classes = [] } = useQuery(classesQueries.list());
  const { mutate: createTest, isPending: isCreating } = useCreateTest();

  /**
   * ⚠️ OGOHLANTIRISHLAR XATO EMAS — test YARATILDI, faqat bankda
   * so'ralgancha savol topilmadi. Ularni xato deb ko'rsatish
   * o'qituvchini "test yaratilmadi" deb o'ylashga majbur qilardi.
   */
  const handleCreate = (payload) =>
    createTest(payload, {
      onSuccess: (res) => {
        const warnings = res?.data?.warnings ?? [];
        toast.success(
          `Test yaratildi — ${res?.data?.questionCount ?? 0} ta savol tanlandi`,
        );
        warnings.forEach((w) => toast.warning(w, { duration: 8000 }));
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Test yaratilmadi"),
    });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div className="w-[190px]">
              <InputField
                type="search"
                name="search"
                label="Qidiruv"
                placeholder="Test nomi"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>
            <div className="w-[150px]">
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
            <div className="w-[150px]">
              <SelectField
                name="status"
                label="Holati"
                value={filters.status}
                options={[
                  { value: "", label: "Barchasi" },
                  ...TEST_STATUSES.map((s) => ({ value: s.value, label: s.label })),
                ]}
                onChange={(value) => setFilter("status", value)}
              />
            </div>
          </>,
          filterSlot,
        )}

      <Can do="diagnostics.create">
        <TestBuilder
          classes={classes}
          isPending={isCreating}
          onCreate={handleCreate}
        />
      </Can>

      {/* ── MAVJUD TESTLAR ─────────────────── */}
      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 xs:p-5">
          <h2 className="font-semibold text-gray-900">Mavjud faol testlar</h2>

          <div className="relative w-[240px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
            <Input
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Test nomi bo'yicha qidirish"
              className="pl-9"
            />
          </div>
        </div>

        {/* ⚠️ HOLAT TABLARI — filtr emas, KO'RINISH. Ular server
            filtriga bog'langan, ya'ni "Faol" tanlansa sahifalash ham
            faqat faol testlar bo'yicha ishlaydi; mijozda filtrlansa
            ikkinchi sahifada tab bo'shab qolardi. */}
        <div className="flex flex-wrap gap-2 px-4 pb-4 xs:px-5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter("status", tab.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filters.status === tab.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-gray-400">Yuklanmoqda…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Test topilmadi"
            description="Yuqoridagi shakl orqali yangi test yarating — u sinfga biriktiriladi va o'quvchilar panelida ko'rinadi."
          />
        ) : (
          <>
            <Table
              columns={[
                "Test nomi",
                "Sinf",
                "Fan (baza sinfi)",
                { label: "Savollar", align: "right" },
                "Sana",
                "Vaqt",
                "Holati",
                { label: "Amallar", align: "center" },
              ]}
            >
              {rows.map((test) => (
                <Tr key={test.id}>
                  <Td className="font-medium text-gray-900">{test.title}</Td>

                  <Td className="text-gray-500">
                    {(test.classes || []).map((c) => c.name).join(", ") || "—"}
                  </Td>

                  {/* ⚠️ FAN YORLIQLARI SERVERDAN keladi ("Matematika
                      (7-sinf)"): panel va Excel bir xil matn
                      ko'rsatishi uchun. Taqsimoti yo'q eski testda
                      testning o'z fani ko'rsatiladi. */}
                  <Td nowrap={false} className="max-w-[320px]">
                    <span className="flex flex-wrap gap-1.5">
                      {test.blueprintLabels?.length ? (
                        test.blueprintLabels.map((b, i) => (
                          <Badge
                            key={`${b.subjectId}-${i}`}
                            className="bg-blue-50 text-blue-700 ring-blue-200"
                          >
                            {b.label}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">
                          {test.subject?.name || "Aralash"}
                        </span>
                      )}
                    </span>
                  </Td>

                  <Td align="right" className="tabular-nums text-gray-700">
                    {test.questionCount}
                  </Td>

                  <Td className="whitespace-nowrap text-gray-500">
                    {test.availableFrom
                      ? formatDateUz(test.availableFrom)
                      : formatDateUz(test.createdAt)}
                  </Td>

                  <Td className="whitespace-nowrap text-gray-500">
                    {test.durationMin} daqiqa
                  </Td>

                  <Td>
                    <Badge className={TEST_STATUS_BADGE[test.status]}>
                      {TEST_STATUS_LABELS[test.status]}
                    </Badge>
                  </Td>

                  <Td align="center">
                    <span className="inline-flex gap-1.5">
                      <Can do="diagnostics.update">
                        <button
                          type="button"
                          title="Tahrirlash"
                          onClick={() => openModal("diagnosticTest", { test })}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
                        >
                          <Edit className="size-4" strokeWidth={1.5} />
                        </button>
                      </Can>
                      <Can do="diagnostics.delete">
                        <button
                          type="button"
                          title="O'chirish"
                          onClick={() =>
                            openModal("deleteDiagnosticTest", { test })
                          }
                          className="rounded-lg border border-gray-200 p-1.5 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="size-4" strokeWidth={1.5} />
                        </button>
                      </Can>
                    </span>
                  </Td>
                </Tr>
              ))}
            </Table>

            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 xs:p-5">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <TestFormModal />
      <DeleteTestModal />
    </div>
  );
};

export default TestsPage;
