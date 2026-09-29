// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { Link, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { FileSpreadsheet, ListChecks, RefreshCw } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import BulkMarkHeader from "../components/BulkMarkHeader";
import SystemMarkCell from "../components/SystemMarkCell";
import SystemSummaryCards from "../components/SystemSummaryCards";
import ExportStudentSystemsModal from "../components/ExportStudentSystemsModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries & data
import { useClasses } from "@/features/classes/queries/classes.queries";
import { studentSystemsQueries } from "../queries/studentSystems.queries";
import { useSetStudentSystemMarks } from "../queries/studentSystems.mutations";
import {
  NO_CLASS,
  PRESENCE,
  STUDENT_SYSTEMS,
  STUDENT_SYSTEMS_PAGE_LIMIT,
  defaultExportList,
  presenceOptions,
} from "../data/studentSystems.data";

const ALL_CLASSES = "all";

const PRESENCE_VALUES = Object.values(PRESENCE);

const personName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "—";

/**
 * ERP VA KUNDALIK.COM — o'quvchi shu ikki tashqi tizimga kiritilganmi.
 *
 * Har o'quvchi qatorida ikkita katakcha: belgilangan — "bor", bo'sh —
 * "yo'q". Sukutda hammasi bo'sh; mas'ul xodim tizimga kiritgan sari
 * belgilab boradi (`studentSystems.mark`). Ruxsat bo'lmasa katakchalar
 * faqat holatni ko'rsatadi.
 *
 * Filtrlar URL da (`search`, `class`, `erp`, `kundalik`, `page`) — ro'yxat
 * holatini havola qilib yuborsa bo'ladi. Excel — butun maktab yoki sinflar
 * bo'yicha (`studentSystems.export`).
 *
 * Ruxsat: `studentSystems.view` (route guard — `ROUTE_PERMISSIONS`).
 */
const StudentSystemsPage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const canMark = can("studentSystems.mark");
  const canExport = can("studentSystems.export");

  const { data: classes = [] } = useClasses();
  const { mutateAsync: saveMarks } = useSetStudentSystemMarks();
  // Ommaviy belgilash davom etayotgan tizim — sarlavha katakchasi ikkinchi
  // marta bosilmasin
  const [bulkSystem, setBulkSystem] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const classFilter = searchParams.get("class") || ALL_CLASSES;
  const presence = Object.fromEntries(
    STUDENT_SYSTEMS.map(({ key }) => {
      const value = searchParams.get(key);
      return [key, PRESENCE_VALUES.includes(value) ? value : PRESENCE.ALL];
    }),
  );

  // Qidiruv inputi darhol yangilanadi, URL esa 300ms dan keyin
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const debounceRef = useRef(null);

  // URL tashqaridan o'zgarsa ("orqaga" tugmasi) input ham yangilanadi —
  // render paytida moslash (`ClassChangesPage` bilan bir xil usul)
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

  const setPresence = (system, value) =>
    setParam(system, value, !value || value === PRESENCE.ALL);

  const goToPage = (next) =>
    setSearchParams((prev) => {
      prev.set("page", String(next));
      return prev;
    });

  const { data, isLoading, isError, isFetching, refetch } = useQuery(
    studentSystemsQueries.list({
      page,
      limit: STUDENT_SYSTEMS_PAGE_LIMIT,
      ...(search && { search }),
      ...(classFilter !== ALL_CLASSES && { classId: classFilter }),
      ...Object.fromEntries(
        STUDENT_SYSTEMS.filter(({ key }) => presence[key] !== PRESENCE.ALL).map(
          ({ key }) => [key, presence[key]],
        ),
      ),
    }),
  );

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const offset = ((pagination?.page ?? page) - 1) * STUDENT_SYSTEMS_PAGE_LIMIT;

  const classOptions = [
    { value: ALL_CLASSES, label: "Barcha sinflar" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
    { value: NO_CLASS, label: "Sinfsiz o'quvchilar" },
  ];

  const scopeLabel =
    classFilter === ALL_CLASSES
      ? "Butun maktab"
      : classFilter === NO_CLASS
        ? "Sinfsiz o'quvchilar"
        : (classes.find((cls) => cls.id === classFilter)?.name ?? "Tanlangan sinf");

  const hasFilters =
    Boolean(search) ||
    classFilter !== ALL_CLASSES ||
    STUDENT_SYSTEMS.some(({ key }) => presence[key] !== PRESENCE.ALL);

  /**
   * ⚠️ `mutateAsync`, `mutate(..., { onError })` EMAS: TanStack Query
   * `mutate` ga berilgan callback'larni faqat OXIRGI chaqiruv uchun
   * ishlatadi — tez-tez bosilganda oldingi katakcha saqlanmasa, belgi
   * qaytardi-yu, xato xabari jim yo'qolardi.
   */
  const applyMarks = async (studentIds, system, present, { bulk = false } = {}) => {
    if (studentIds.length === 0) return;
    if (bulk) setBulkSystem(system);

    try {
      const response = await saveMarks({ studentIds, system, present });
      if (bulk) {
        const label = STUDENT_SYSTEMS.find((item) => item.key === system)?.label;
        toast.success(
          present
            ? `${response.data.changed} ta o'quvchi "${label} da bor" deb belgilandi`
            : `${response.data.changed} ta o'quvchidan ${label} belgisi olib tashlandi`,
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Belgini saqlab bo'lmadi");
    } finally {
      if (bulk) setBulkSystem(null);
    }
  };

  const openExport = () =>
    openModal("exportStudentSystems", {
      defaultClassIds:
        classFilter !== ALL_CLASSES && classFilter !== NO_CLASS ? [classFilter] : [],
      defaultList: defaultExportList(presence),
    });

  const columns = [
    { key: "no", label: "#", className: "w-14" },
    // `align` berilmasa `Table` chapga tekislaydi (global `th` markazlashtiradi)
    { key: "student", label: "O'quvchi" },
    { key: "class", label: "Sinf" },
    ...STUDENT_SYSTEMS.map(({ key, label }) => ({
      key,
      align: "center",
      className: "w-40",
      label: (
        <BulkMarkHeader
          label={label}
          system={key}
          rows={rows}
          canMark={canMark && !bulkSystem}
          onApply={(studentIds, present) =>
            applyMarks(studentIds, key, present, { bulk: true })
          }
        />
      ),
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">ERP va Kundalik.com</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            O'quvchilar ERP va Kundalik.com tizimlarida bormi. Belgilangan katakcha —
            "bor", bo'sh katakcha — "yo'q".
          </p>
        </div>

        {canExport && (
          <Button onClick={openExport} className="shrink-0 px-3.5">
            <FileSpreadsheet strokeWidth={1.5} />
            Excelga yuklash
          </Button>
        )}
      </div>

      <SystemSummaryCards
        summary={data?.summary}
        scopeLabel={scopeLabel}
        presence={presence}
        onFilter={setPresence}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          value={searchInput}
          className="lg:flex-1"
          placeholder="O'quvchi ismi, familiyasi yoki username bo'yicha qidirish..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-3 lg:flex lg:shrink-0">
          <Select
            value={classFilter}
            options={classOptions}
            placeholder="Sinf tanlang"
            onChange={(value) =>
              setParam("class", value, !value || value === ALL_CLASSES)
            }
            triggerClassName="w-full lg:w-44"
          />

          {STUDENT_SYSTEMS.map(({ key, label }) => (
            <Select
              key={key}
              value={presence[key]}
              options={presenceOptions(label)}
              onChange={(value) => setPresence(key, value)}
              triggerClassName="w-full lg:w-52"
            />
          ))}
        </div>

        <Tooltip content="Ro'yxatni yangilash">
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Ro'yxatni yangilash"
            className="hidden shrink-0 px-3 lg:inline-flex"
          >
            <RefreshCw className={cn(isFetching && "animate-spin")} strokeWidth={1.5} />
          </Button>
        </Tooltip>
      </div>

      {isLoading ? (
        <LoaderCard title="Yuklanmoqda..." />
      ) : isError ? (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="Ro'yxatni yuklab bo'lmadi"
            description="Internet aloqasini tekshirib, qayta urinib ko'ring."
            action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
          />
        </Card>
      ) : rows.length === 0 && page > 1 && pagination?.total > 0 ? (
        // Belgilashdan keyin filtrlangan ro'yxat qisqarib, joriy sahifa
        // bo'shab qolgan — sahifalash ko'rinmaydi, qaytish yo'li shu
        <Card>
          <EmptyState
            icon={ListChecks}
            title="Bu sahifada o'quvchi qolmadi"
            description={`Ro'yxatda ${pagination.total} ta o'quvchi bor.`}
            action={<Button onClick={() => goToPage(1)}>Birinchi sahifaga</Button>}
          />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="O'quvchi topilmadi"
            description={
              hasFilters
                ? "Qidiruv yoki filtrlarni o'zgartirib ko'ring."
                : "Maktabda hali o'quvchi yo'q."
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={columns}>
            {rows.map((row, index) => (
              <Tr key={row.id}>
                <Td className="text-gray-500">{offset + index + 1}</Td>

                <Td>
                  <Link
                    to={`/users/${row.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {personName(row)}
                  </Link>
                  <p className="text-xs text-gray-500">@{row.username}</p>
                </Td>

                <Td className="text-gray-700">
                  {row.classes.length > 0 ? (
                    row.classes.map((cls) => cls.name).join(", ")
                  ) : (
                    <span className="text-gray-400">Sinfsiz</span>
                  )}
                </Td>

                {STUDENT_SYSTEMS.map(({ key, label }) => (
                  <Td key={key} align="center" className="py-1.5">
                    <SystemMarkCell
                      mark={row.systems?.[key] ?? null}
                      label={label}
                      studentName={personName(row)}
                      disabled={!canMark}
                      onToggle={() => applyMarks([row.id], key, !row.systems?.[key])}
                    />
                  </Td>
                ))}
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

      {canExport && <ExportStudentSystemsModal />}
    </div>
  );
};

export default StudentSystemsPage;
