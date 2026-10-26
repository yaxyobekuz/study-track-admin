// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { Link, useParams, useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowLeft, BedDouble, CalendarDays, Clock, FileSpreadsheet } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import DormSummaryCards from "../components/DormSummaryCards";
import DormMarkTable from "../components/DormMarkTable";
import DormMarkToolbar from "../components/DormMarkToolbar";
import DormDayTrend from "../components/DormDayTrend";
import DormStudentHistoryModal from "../components/DormStudentHistoryModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDormMarks from "../hooks/useDormMarks";

// Utils
import { todayInputValue } from "@/shared/utils/date.utils";
import { downloadBlob, readBlobErrorMessage } from "@/shared/utils/download.utils";

// Queries & data
import { dormAttendanceAPI } from "../api/dormAttendance.api";
import { dormAttendanceQueries } from "../queries/dormAttendance.queries";
import { useMarkDormAttendance } from "../queries/dormAttendance.mutations";
import {
  DORM_FILTER_OPTIONS,
  HISTORY_WINDOW_OPTIONS,
  formatWaitUz,
} from "../data/dormAttendance.data";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * BITTA SINFNING YOTOQXONA SAHIFASI — "guruh ichiga kirish".
 *
 * Umumiy ro'yxatdan farqi — bu yerda BITTA sinf bor, shuning uchun o'rin
 * to'liqroq ma'lumotga ketadi:
 *   · har o'quvchi qatorida "oxirgi kunlarda necha kun qolgan";
 *   · ism bosilsa — o'sha o'quvchining kun-ba-kun tarixi;
 *   · pastda sinfning "kunlar bo'yicha" kesimi (qaysi kuni nechta qoldi),
 *     qatori bosilsa o'sha kunga o'tadi.
 *
 * Belgilash umumiy ro'yxat bilan AYNI komponentlar orqali
 * (`DormMarkToolbar` + `DormMarkTable`): ikkinchi nusxa bo'lsa, tanlov,
 * saqlanmagan qatorning sariq foni va izoh qoidasi ikki joyda ayri-ayri
 * eskirardi.
 *
 * Ruxsat: `dormAttendance.view` (route guard — `ROUTE_PERMISSIONS`).
 */
const DormClassPage = () => {
  const { classId } = useParams();
  const { openModal } = useModal();
  const { can } = usePermissions();
  const canMarkPermission = can("dormAttendance.mark");
  const canExport = can("dormAttendance.export");

  const { mutateAsync: save, isPending: isSaving } = useMarkDormAttendance();
  const [isExporting, setIsExporting] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const today = todayInputValue();
  const rawDate = searchParams.get("date");
  const date = rawDate && DAY_RE.test(rawDate) && rawDate <= today ? rawDate : today;
  const status = searchParams.get("status") || "";
  const search = searchParams.get("q") || "";
  const days = searchParams.get("days") || "14";

  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const debounceRef = useRef(null);

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

  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery(
    dormAttendanceQueries.classDetail(classId, {
      date,
      days,
      ...(status && { status }),
      ...(search && { search }),
    }),
  );

  const rows = data?.students ?? [];
  const gate = data?.gate;
  const canMark = canMarkPermission && Boolean(gate?.canMark);

  const syncKey = data ? `${dataUpdatedAt}|${classId}|${date}|${status}|${search}` : null;
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
        classId,
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

  const openHistory = (row) =>
    openModal("dormStudentHistory", {
      studentId: row.student.id,
      name: [row.student.lastName, row.student.firstName].filter(Boolean).join(" "),
      date,
      days,
    });

  if (isLoading) return <LoaderCard title="Yuklanmoqda..." />;

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={BedDouble}
          title="Sinfni yuklab bo'lmadi"
          description="Internet aloqasini tekshirib, qayta urinib ko'ring."
          action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/dorm-attendance"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} />
            Yotoqxona davomati
          </Link>
          <h1 className="page-title mt-1">{data.classInfo.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {data.dateLabel} · kechqurun yotoqxonada kim qoldi
          </p>
        </div>

        {canExport && (
          <Button onClick={handleExport} disabled={isExporting} className="shrink-0 px-3.5">
            <FileSpreadsheet strokeWidth={1.5} />
            {isExporting ? "Yuklanmoqda..." : "Excelga yuklash"}
          </Button>
        )}
      </div>

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
        summary={data.summary}
        scopeLabel={data.classInfo.name}
        status={status}
        onFilter={(value) => setParam("status", value, !value)}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          type="search"
          value={searchInput}
          className="lg:flex-1"
          placeholder="O'quvchi ismi, familiyasi yoki login bo'yicha qidirish..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:flex lg:shrink-0">
          <Select
            value={status || "all"}
            options={DORM_FILTER_OPTIONS}
            placeholder="Barcha holatlar"
            onChange={(value) => setParam("status", value, value === "all")}
            triggerClassName="w-full lg:w-44"
          />

          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setParam("date", e.target.value, e.target.value === today)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-2 outline-primary"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={BedDouble}
            title="O'quvchi topilmadi"
            description={
              status || search
                ? "Qidiruv yoki holat filtrini o'zgartirib ko'ring."
                : "Bu sinfda shu kuni o'qiyotgan o'quvchi yo'q."
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
            showHistory
            rows={rows}
            marks={marks}
            selected={selected}
            showClass={false}
            canMark={canMark}
            onStudentClick={openHistory}
            onStatusChange={setStatus}
            onNoteChange={setNote}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
        </>
      )}

      {/* Kunlar bo'yicha — sinfning yo'nalishi */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CalendarDays className="size-4" strokeWidth={1.75} />
            Kunlar bo&apos;yicha
            <span className="font-normal text-gray-500">
              — davomat olingan {data.history.trackedDays} kun
            </span>
          </div>

          <Select
            value={days}
            options={HISTORY_WINDOW_OPTIONS}
            onChange={(value) => setParam("days", value, value === "14")}
            triggerClassName="w-44"
          />
        </div>

        <DormDayTrend
          days={data.trend}
          selected={date}
          onSelect={(value) => setParam("date", value, value === today)}
        />
      </div>

      <DormStudentHistoryModal />
    </div>
  );
};

export default DormClassPage;
