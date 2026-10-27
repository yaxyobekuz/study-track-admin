// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { BedDouble, Clock, FileSpreadsheet, RefreshCw, Settings2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import DormSummaryCards from "../components/DormSummaryCards";
import DormClassBreakdown from "../components/DormClassBreakdown";
import DormMarkTable from "../components/DormMarkTable";
import DormMarkToolbar from "../components/DormMarkToolbar";
import DormSettingsModal from "../components/DormSettingsModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDormMarks from "../hooks/useDormMarks";

// Utils
import { cn } from "@/shared/utils/cn";
import { todayInputValue } from "@/shared/utils/date.utils";
import { downloadBlob, readBlobErrorMessage } from "@/shared/utils/download.utils";

// Queries & data
import { useClasses } from "@/features/classes/queries/classes.queries";
import { dormAttendanceAPI } from "../api/dormAttendance.api";
import { dormAttendanceQueries } from "../queries/dormAttendance.queries";
import { useMarkDormAttendance } from "../queries/dormAttendance.mutations";
import {
  ALL_CLASSES,
  DORM_FILTER_OPTIONS,
  buildClassOptions,
  formatWaitUz,
} from "../data/dormAttendance.data";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * YOTOQXONA DAVOMATI — "bugun kechqurun yotoqxonada kim qoldi".
 *
 * Tarbiyachi sinfni tanlab yoki butun maktab ro'yxatidan o'quvchilarni
 * belgilaydi (keldi / kelmadi / sababli), sinflar kesimi "qaysi sinfdan
 * nechta qoldi" degan savolga javob beradi, Excel esa ro'yxatni tashqariga
 * chiqaradi.
 *
 * ⚠️ FILTRLAR URL DA (`?date=&class=&status=&q=`): o'quvchi profiliga kirib
 * "orqaga" qaytilganda filtr yo'qolmasin va ro'yxat holatini havola qilib
 * yuborish mumkin bo'lsin (kunlik davomat sahifasi bilan AYNI qaror).
 *
 * ⚠️ TUGMALARNING OCHIQ-YOPIQLIGINI SERVER AYTADI (`gate`): vaqt darvozasi
 * (sukut 16:00), o'tgan kun sharti va "ma'muriyat ozod" qoidasi bitta
 * joyda (`dormAttendance.service.js` → `resolveMarkGate`). Panel o'z
 * nusxasini yuritsa, u "belgilang" deb turib server 403 qaytarardi.
 *
 * Ruxsat: `dormAttendance.view` (route guard — `ROUTE_PERMISSIONS`).
 */
const DormAttendancePage = () => {
  const { openModal } = useModal();
  const { can } = usePermissions();
  const canMarkPermission = can("dormAttendance.mark");
  const canExport = can("dormAttendance.export");
  const canSettings = can("dormAttendance.settings");

  const { data: classes = [] } = useClasses();
  const { mutateAsync: save, isPending: isSaving } = useMarkDormAttendance();
  const [isExporting, setIsExporting] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayInputValue();
  const rawDate = searchParams.get("date");
  const date = rawDate && DAY_RE.test(rawDate) && rawDate <= today ? rawDate : today;
  const classFilter = searchParams.get("class") || ALL_CLASSES;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("q") || "";

  // Qidiruv inputi darhol, URL esa 300ms dan keyin yangilanadi
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const debounceRef = useRef(null);

  // URL tashqaridan o'zgarsa ("orqaga" tugmasi) input ham yangilanadi —
  // render paytida moslash (`StudentSystemsPage` bilan AYNI usul)
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  const setParam = useCallback(
    (key, value, isDefault) =>
      setSearchParams(
        (prev) => {
          if (isDefault) prev.delete(key);
          else prev.set(key, value);
          return prev;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(
        () => setParam("q", value.trim(), !value.trim()),
        300,
      );
    },
    [setParam],
  );

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useQuery(
    dormAttendanceQueries.day({
      date,
      ...(classFilter !== ALL_CLASSES && { classId: classFilter }),
      ...(status && { status }),
      ...(search && { search }),
    }),
  );

  const { data: breakdown } = useQuery(dormAttendanceQueries.classes({ date }));

  const rows = data?.students ?? [];
  const gate = data?.gate;
  const canMark = canMarkPermission && Boolean(gate?.canMark);

  // ⚠️ `syncKey` ga FILTRLAR ham kiradi: boshqa sinfga o'tilganda eski
  // tanlov va saqlanmagan belgilar yangi ro'yxatga yopishib qolmasin.
  const syncKey = data ? `${dataUpdatedAt}|${date}|${classFilter}|${status}|${search}` : null;
  const {
    marks,
    selected,
    setStatus,
    setNote,
    setMany,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    dirty,
  } = useDormMarks(rows, syncKey);

  const handleBulk = (nextStatus) => {
    const ids =
      selected.size > 0
        ? rows.filter((row) => selected.has(row.student.id)).map((row) => row.student.id)
        : rows.map((row) => row.student.id);
    setMany(ids, nextStatus);
  };

  const handleSave = async () => {
    if (dirty.length === 0) return;

    try {
      const result = await save({
        date,
        records: dirty.map((row) => ({
          studentId: row.student.id,
          status: marks[row.student.id].status,
          note: marks[row.student.id].note || "",
        })),
      });
      toast.success(`${result.data.saved} ta o'quvchi belgilandi`);
      clearSelection();
    } catch (error) {
      toast.error(error.response?.data?.message || "Davomatni saqlab bo'lmadi");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await dormAttendanceAPI.exportExcel({
        date,
        ...(classFilter !== ALL_CLASSES && { classId: classFilter }),
        ...(status && { status }),
      });
      downloadBlob(response, "yotoqxona_davomati.xlsx");
      toast.success("Fayl yuklab olindi");
    } catch (error) {
      toast.error(await readBlobErrorMessage(error, "Excel faylni yuklab bo'lmadi"));
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters = Boolean(search) || status || classFilter !== ALL_CLASSES;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Yotoqxona davomati</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Kechqurun yotoqxonada kim qoldi — tarbiyachi belgilaydi, sinflar
            kesimi bilan.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canSettings && (
            <Tooltip content="Boshlanish vaqti">
              <Button
                variant="secondary"
                className="px-3"
                aria-label="Sozlamalar"
                onClick={() => openModal("dormAttendanceSettings")}
              >
                <Settings2 strokeWidth={1.5} />
              </Button>
            </Tooltip>
          )}

          {canExport && (
            <Button onClick={handleExport} disabled={isExporting} className="px-3.5">
              <FileSpreadsheet strokeWidth={1.5} />
              {isExporting ? "Yuklanmoqda..." : "Excelga yuklash"}
            </Button>
          )}
        </div>
      </div>

      {/* Darvoza holati — nega tugmalar yopiq */}
      {gate && !gate.canMark && canMarkPermission && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Clock className="size-4 shrink-0" strokeWidth={1.75} />
          <span>
            {gate.message}
            {gate.startsInMinutes != null && (
              <> — {formatWaitUz(gate.startsInMinutes)} qoldi</>
            )}
          </span>
        </div>
      )}

      <DormSummaryCards
        summary={data?.summary}
        scopeLabel={data?.scope?.label ?? "Butun maktab"}
        status={status}
        onFilter={(value) => setParam("status", value, !value)}
      />

      {/* Toolbar: sana, sinf, holat, qidiruv */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          value={searchInput}
          className="lg:flex-1"
          placeholder="O'quvchi ismi, familiyasi yoki login bo'yicha qidirish..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-3 lg:flex lg:shrink-0">
          <Select
            value={classFilter}
            options={buildClassOptions(classes)}
            placeholder="Sinf tanlang"
            onChange={(value) => setParam("class", value, !value || value === ALL_CLASSES)}
            triggerClassName="w-full lg:w-48"
          />

          <Select
            value={status || "all"}
            options={DORM_FILTER_OPTIONS}
            placeholder="Barcha holatlar"
            onChange={(value) => setParam("status", value, value === "all")}
            triggerClassName="w-full lg:w-44"
          />

          {/* Sana — istalgan o'tgan kun; kelajak yopiq (server ham rad etadi) */}
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setParam("date", e.target.value, e.target.value === today)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-2 outline-primary"
          />
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

      {/* Sinflar kesimi — butun maktab bo'yicha */}
      <DormClassBreakdown
        classes={breakdown?.classes ?? []}
        totals={breakdown?.totals}
        selected={classFilter === ALL_CLASSES ? "" : classFilter}
        onSelect={(classId) => setParam("class", classId, !classId)}
      />

      {isLoading ? (
        <LoaderCard title="Yuklanmoqda..." />
      ) : isError ? (
        <Card>
          <EmptyState
            icon={BedDouble}
            title="Ro'yxatni yuklab bo'lmadi"
            description="Internet aloqasini tekshirib, qayta urinib ko'ring."
            action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
          />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={BedDouble}
            title="O'quvchi topilmadi"
            description={
              hasFilters
                ? "Qidiruv yoki filtrlarni o'zgartirib ko'ring."
                : "Bu kuni maktabda o'qiyotgan o'quvchi yo'q."
            }
          />
        </Card>
      ) : (
        <>
          {canMarkPermission && (
            <DormMarkToolbar
              visibleCount={rows.length}
              selectedCount={selected.size}
              onBulk={handleBulk}
              onClearSelection={clearSelection}
              dirtyCount={dirty.length}
              onSave={handleSave}
              isSaving={isSaving}
              disabled={!canMark}
              disabledMessage={gate?.message}
            />
          )}

          <DormMarkTable
            rows={rows}
            marks={marks}
            selected={selected}
            canMark={canMark}
            onStatusChange={setStatus}
            onNoteChange={setNote}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
        </>
      )}

      {canSettings && <DormSettingsModal />}
    </div>
  );
};

export default DormAttendancePage;
