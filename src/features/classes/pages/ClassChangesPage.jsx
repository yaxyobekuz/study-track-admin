// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeft, ArrowRight, History } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Queries & data
import { classesQueries, useClasses } from "../queries/classes.queries";
import {
  CLASS_CHANGE_SOURCE_LABELS,
  CLASS_CHANGE_TABS,
  CLASS_CHANGES_PAGE_LIMIT,
} from "../data/classChanges.data";

const COLUMNS = {
  moved: ["#", "O'quvchi", "Qaysi sinfdan → qaysi sinfga", "Sabab", "Kim tomonidan", "Sana"],
  removed: ["#", "O'quvchi", "Chiqarilgan sinf", "Sabab", "Kim tomonidan", "Sana"],
};

const EMPTY_TEXT = {
  moved: "Boshqa sinfga ko'chirilgan o'quvchilar yo'q",
  removed: "Sinfdan chiqarilgan o'quvchilar yo'q",
};

const personName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "—";

const classNames = (list = []) =>
  list.length > 0 ? list.map((cls) => cls.name).join(", ") : "—";

/**
 * SINF O'ZGARISHLARI — o'quvchini boshqa sinfga KO'CHIRISH va sinfdan
 * CHIQARISH jurnali, har biri alohida tabda: kim, qaysi sinfdan qaysi
 * sinfga, NEGA (majburiy sabab), kim tomonidan va qachon.
 *
 * Jurnal append-only: yozuvlar tahrirlanmaydi va o'chirilmaydi. Sinf nomi
 * o'sha paytdagisi (keyin sinf qayta nomlansa ham) — "Hozir" qatori esa
 * o'quvchining joriy sinflari.
 *
 * Filtrlar URL da (`tab`, `search`, `class`, `page`) — ro'yxat holatini
 * havola qilib yuborsa bo'ladi; sinf sahifasidan `?class=<id>` bilan keladi.
 *
 * Ruxsat: `classes.history` (route guard — `ROUTE_PERMISSIONS`).
 */
const ClassChangesPage = () => {
  const navigate = useNavigate();
  const { data: classes = [] } = useClasses();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const classFilter = searchParams.get("class") || "all";
  const tabParam = searchParams.get("tab");
  const activeTab = CLASS_CHANGE_TABS.some((t) => t.value === tabParam)
    ? tabParam
    : CLASS_CHANGE_TABS[0].value;

  // Qidiruv inputi darhol yangilanadi, URL esa 300ms dan keyin
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const debounceRef = useRef(null);

  // URL tashqaridan o'zgarsa ("orqaga" tugmasi) input ham yangilanadi —
  // render paytida moslash (`UsersListView` bilan bir xil usul)
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchParams((prev) => {
          if (value.trim()) prev.set("search", value.trim());
          else prev.delete("search");
          prev.delete("page");
          return prev;
        });
      }, 300);
    },
    [setSearchParams],
  );

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Filtr o'zgarsa — birinchi sahifaga (hodisaning o'zida, effektda emas)
  const setParam = (key, value, isDefault) =>
    setSearchParams((prev) => {
      if (isDefault) prev.delete(key);
      else prev.set(key, value);
      prev.delete("page");
      return prev;
    });

  const goToPage = (next) =>
    setSearchParams((prev) => {
      prev.set("page", String(next));
      return prev;
    });

  const { data, isLoading, isError, refetch } = useQuery(
    classesQueries.changes({
      type: activeTab,
      page,
      limit: CLASS_CHANGES_PAGE_LIMIT,
      ...(search && { search }),
      ...(classFilter !== "all" && { classId: classFilter }),
    }),
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const totals = data?.totals;

  const tabs = CLASS_CHANGE_TABS.map((tab) => ({
    value: tab.value,
    label: totals ? `${tab.label} (${totals[tab.value] ?? 0})` : tab.label,
  }));

  const classOptions = [
    { value: "all", label: "Barcha sinflar" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const offset = ((pagination?.page ?? page) - 1) * CLASS_CHANGES_PAGE_LIMIT;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-1.5">
        <Button variant="ghost" onClick={() => navigate("/classes")}>
          <ArrowLeft strokeWidth={1.5} />
        </Button>

        <div>
          <h1 className="page-title">Sinf o'zgarishlari</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Boshqa sinfga ko'chirilgan va sinfdan chiqarilgan o'quvchilar —
            sababi, kim tomonidan va qachon
          </p>
        </div>
      </div>

      <TabsButtons
        items={tabs}
        value={activeTab}
        onChange={(value) =>
          setParam("tab", value, value === CLASS_CHANGE_TABS[0].value)
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          value={searchInput}
          className="sm:flex-1"
          placeholder="O'quvchi ismi, familiyasi yoki username bo'yicha qidirish..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select
          value={classFilter}
          options={classOptions}
          placeholder="Sinf tanlang"
          onChange={(value) => setParam("class", value, !value || value === "all")}
          triggerClassName="w-full sm:w-48 sm:shrink-0"
        />
      </div>

      {isLoading ? (
        <LoaderCard title="Yuklanmoqda..." />
      ) : isError ? (
        <Card>
          <EmptyState
            icon={History}
            title="Ro'yxatni yuklab bo'lmadi"
            description="Internet aloqasini tekshirib, qayta urinib ko'ring."
            action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
          />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={History}
            title={EMPTY_TEXT[activeTab]}
            description={
              search || classFilter !== "all"
                ? "Qidiruv yoki sinf filtrini o'zgartirib ko'ring."
                : "O'quvchi sinfi o'zgartirilganda u sababi bilan shu yerda ko'rinadi."
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={COLUMNS[activeTab]}>
            {rows.map((row, index) => (
              <Tr key={row.id}>
                <Td className="text-gray-500">{offset + index + 1}</Td>

                {/* O'quvchi + hozirgi sinfi */}
                <Td>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/users/${row.student.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {personName(row.student)}
                    </Link>
                    {row.student.isArchived && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Arxivlangan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    @{row.student.username} · Hozir:{" "}
                    {row.student.currentClasses.length > 0
                      ? classNames(row.student.currentClasses)
                      : "sinfsiz"}
                  </p>
                </Td>

                {/* Sinf(lar) */}
                <Td>
                  {activeTab === "moved" ? (
                    <div className="flex items-center gap-2">
                      <ClassChip tone="gray">{classNames(row.fromClasses)}</ClassChip>
                      <ArrowRight className="size-4 shrink-0 text-gray-400" strokeWidth={1.75} />
                      <ClassChip tone="blue">{classNames(row.toClasses)}</ClassChip>
                    </div>
                  ) : (
                    <ClassChip tone="red">{classNames(row.fromClasses)}</ClassChip>
                  )}
                </Td>

                <Td nowrap={false} className="min-w-56 max-w-md whitespace-pre-line break-words text-gray-700">
                  {row.reason}
                </Td>

                <Td className="text-gray-600">
                  {row.createdBy ? personName(row.createdBy) : "Noma'lum"}
                  <p className="text-xs text-gray-400">
                    {CLASS_CHANGE_SOURCE_LABELS[row.source] ?? "—"}
                  </p>
                </Td>

                <Td className="text-gray-600">{formatDateTimeUz(row.createdAt)}</Td>
              </Tr>
            ))}
          </Table>

          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  );
};

const CHIP_TONES = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-700",
};

const ClassChip = ({ tone, children }) => (
  <span
    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-medium ${CHIP_TONES[tone]}`}
  >
    {children}
  </span>
);

export default ClassChangesPage;
