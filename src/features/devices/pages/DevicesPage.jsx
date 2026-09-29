// React
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext, useSearchParams } from "react-router-dom";

// Icons
import {
  KeyRound,
  Pause,
  Play,
  Search,
  Smartphone,
  Trash2,
  Unlock,
  UserRound,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Pagination from "@/shared/components/ui/Pagination";
import Select from "@/shared/components/ui/select/Select";
import Panel from "../components/Panel";
import { GuardTable, GuardRow, GuardCell } from "../components/GuardTable";
import DeviceActionModals from "../components/DeviceActionModals";
import EnrollCodeModal from "../components/EnrollCodeModal";
import UnlockModal from "../components/UnlockModal";
import StudentDeviceModal from "../components/StudentDeviceModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDebounce from "@/shared/hooks/useDebounce";

// Queries
import { useClasses } from "@/features/classes/queries/classes.queries";
import { devicesQueries } from "../queries/devices.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Tokens & data
import { CHIP, T, healthOf } from "../data/guard.tokens";
import { HEALTH_FILTERS } from "../data/devices.data";

/**
 * QURILMALAR RO'YXATI — "kimda nima, va u ishlayaptimi".
 *
 * ⚠️ HOLAT USTUNI BIRINCHI O'RINDA TURADIGAN MA'LUMOT. Ro'yxatning
 * maqsadi "nechta telefon bor" emas: admin bu ekranga aynan HIMOYASI
 * O'CHIRILGAN qatorlarni topish uchun keladi. Shuning uchun filtr
 * URL da saqlanadi (`?health=degraded`) — manzarada ustiga bosilgan
 * karta to'g'ridan-to'g'ri shu ro'yxatni ochadi.
 *
 * ⚠️ "ESKIRGAN" BELGISI (`outdated`) ALOHIDA ko'rsatiladi: qurilma
 * ulangan, himoya ishlayapti, lekin unda ESKI qoida turibdi (push
 * yetmagan yoki ilova ochilmagan). Buni "himoyada" ichiga yashirish
 * eng chalg'ituvchi holat bo'lardi — qoida o'zgargan, telefon esa
 * eskisini bajarayapti.
 */
const DevicesPage = () => {
  const { filterSlot } = useOutletContext();
  const { can } = usePermissions();
  const { openModal } = useModal();

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const health = params.get("health") || "";
  const classId = params.get("classId") || "";
  const [page, setPage] = useState(1);

  /**
   * ⚠️ FILTR O'ZGARGANDA BIRINCHI SAHIFAGA QAYTAMIZ va buni EFFEKT
   * QILMAYMIZ: sahifani tiklash — filtrni o'zgartirgan HODISANING
   * qismi, holatni kuzatishning natijasi emas (effekt bilan yozilsa
   * kaskadli render bo'lardi). Usiz 5-sahifada turib qidirilganda
   * natija bor bo'la turib ro'yxat "bo'sh" ko'rinardi.
   */
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const { data: classes = [] } = useClasses();
  const { data, isLoading, isError } = useQuery(
    devicesQueries.list({
      page,
      limit: 30,
      health: health || undefined,
      classId: classId || undefined,
      search: debouncedSearch || undefined,
    }),
  );

  const devices = data?.data ?? [];

  const classOptions = useMemo(
    () => [
      { value: "", label: "Barcha sinflar" },
      ...classes.map((c) => ({ value: c.id, label: c.name })),
    ],
    [classes],
  );

  const canEnroll = can("devices.enroll");
  const canUnlock = can("devices.unlock");
  const canReports = can("devices.reports");

  return (
    <div className="flex flex-col gap-3">
      {filterSlot &&
        createPortal(
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="O'quvchi yoki qurilma"
                className="h-9 w-48 pl-8 text-[12.5px]"
              />
            </div>
            <Select
              triggerClassName="h-9 min-w-36"
              value={classId}
              options={classOptions}
              onChange={(value) => setParam("classId", value)}
            />
            <Select
              triggerClassName="h-9 min-w-44"
              value={health}
              options={HEALTH_FILTERS}
              onChange={(value) => setParam("health", value)}
            />
            {canEnroll && (
              <Button size="sm" className="h-9" onClick={() => openModal("deviceEnrollCode")}>
                <KeyRound className="size-3.5" />
                Qurilma biriktirish
              </Button>
            )}
          </div>,
          filterSlot,
        )}

      <Panel
        title="Qurilmalar"
        hint={`${data?.pagination?.total ?? 0} ta qurilma · cheklovni telefon bajaradi, server faqat qoidani beradi`}
        icon={Smartphone}
        tone="allowed"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && devices.length === 0}
        emptyText="Bu filtrga mos qurilma yo'q. Qurilma biriktirish uchun o'quvchiga bir martalik kod bering — u kodni o'z telefonidagi MBSI ilovasiga kiritadi."
        padding="flush"
      >
        <div className="px-5 pb-5">
          <GuardTable
            minWidth={900}
            template="minmax(170px,1.3fr) minmax(150px,1fr) minmax(150px,1fr) minmax(150px,1fr) 150px 110px"
            columns={[
              { label: "O'quvchi" },
              { label: "Qurilma" },
              { label: "Holat" },
              { label: "Siyosat" },
              { label: "Oxirgi aloqa" },
              { label: "Amallar", align: "right" },
            ]}
          >
            {devices.map((device, index) => (
              <DeviceRow
                key={device.id}
                device={device}
                index={index}
                canEnroll={canEnroll}
                canUnlock={canUnlock}
                canReports={canReports}
              />
            ))}
          </GuardTable>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              className="mt-4"
              currentPage={page}
              totalPages={data.pagination.totalPages}
              hasNextPage={data.pagination.hasNextPage}
              hasPrevPage={data.pagination.hasPrevPage}
              onPageChange={setPage}
            />
          )}
        </div>
      </Panel>

      {/* Oynalar */}
      <EnrollCodeModal />
      <UnlockModal />
      <DeviceActionModals />
      <StudentDeviceModal />
    </div>
  );
};

/* ─────────────────────── QATOR ─────────────────────── */

const DeviceRow = ({ device, index, canEnroll, canUnlock, canReports }) => {
  const { openModal } = useModal();
  const health = healthOf(device.health?.key);
  const student = device.student;

  const name = student
    ? `${student.firstName} ${student.lastName || ""}`.trim()
    : "Nomaʼlum o'quvchi";

  return (
    <GuardRow index={index}>
      {/* O'quvchi */}
      <GuardCell>
        <button
          type="button"
          disabled={!canReports || !student}
          onClick={() => openModal("studentDevice", { studentId: student?.id, name })}
          className={cn(
            "flex w-full items-center gap-2 text-left",
            canReports && student && "hover:underline",
          )}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <UserRound className="size-3.5" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className={cn(T.tdName, "block truncate")}>{name}</span>
            <span className={cn(T.hint, "block truncate")}>
              {student?.className || "Sinfsiz"}
              {student?.isArchived && " · arxivlangan"}
            </span>
          </span>
        </button>
      </GuardCell>

      {/* Qurilma */}
      <GuardCell>
        <p className={cn(T.td, "truncate")}>{device.label || "Qurilma"}</p>
        <p className={cn(T.hint, "truncate")}>
          {[device.manufacturer, device.model].filter(Boolean).join(" ") || device.platform}
          {device.appVersion && ` · v${device.appVersion}`}
        </p>
      </GuardCell>

      {/* Holat */}
      <GuardCell>
        <span className={cn(CHIP, health.chip)}>
          <span className={cn("size-1.5 rounded-full", health.dot)} />
          {health.label}
        </span>
        {/*
          ⚠️ "Hali olmagan" va "eski versiya" AJRATILADI: birinchisi
          odatiy (qurilma ilovani ochganda oladi), ikkinchisi esa
          bildirishnoma yetmaganini bildiradi.
        */}
        {device.health?.key === "healthy" && device.policyState === "pending" && (
          <p className={cn(T.hint, "mt-1")}>Qoidani hali olmagan</p>
        )}
        {device.health?.key === "healthy" && device.policyState === "outdated" && (
          <p className={cn(T.hint, "mt-1 text-amber-700")}>Eski qoida bilan ishlayapti</p>
        )}
        {device.enforcementNote && (
          <p className={cn(T.hint, "mt-1 truncate")} title={device.enforcementNote}>
            {device.enforcementNote}
          </p>
        )}
      </GuardCell>

      {/* Siyosat */}
      <GuardCell>
        {device.policy?.policyName ? (
          <>
            <p className={cn(T.td, "truncate")}>{device.policy.policyName}</p>
            {/* ⚠️ "Nega shu siyosat" — har doim ko'rinadi (`devices.md` §4) */}
            <p className={cn(T.hint, "truncate")}>{device.policy.reason}</p>
          </>
        ) : (
          <p className={cn(T.hint, "italic")}>Qoida biriktirilmagan</p>
        )}
      </GuardCell>

      {/* Oxirgi aloqa */}
      <GuardCell>
        <p className={cn(T.td, "tabular-nums")}>
          {device.lastSeenAt ? formatDateTimeUz(device.lastSeenAt) : "—"}
        </p>
      </GuardCell>

      {/* Amallar */}
      <GuardCell align="right">
        <div className="flex items-center justify-end gap-1">
          {canUnlock && student && device.status === "active" && (
            <IconButton
              title="Vaqtinchalik ochish"
              icon={Unlock}
              onClick={() =>
                openModal("deviceUnlock", { studentId: student.id, studentName: student.firstName })
              }
            />
          )}
          {canEnroll && device.status === "active" && (
            <IconButton
              title="Cheklovni to'xtatish"
              icon={Pause}
              onClick={() => openModal("devicePause", { device })}
            />
          )}
          {canEnroll && device.status === "paused" && (
            <IconButton
              title="Cheklovni qayta yoqish"
              icon={Play}
              onClick={() => openModal("deviceResume", { device })}
            />
          )}
          {canEnroll && device.status !== "removed" && (
            <IconButton
              title="Qurilmani olib tashlash"
              icon={Trash2}
              tone="danger"
              onClick={() => openModal("deviceRemove", { device })}
            />
          )}
        </div>
      </GuardCell>
    </GuardRow>
  );
};

const IconButton = ({ icon: Icon, title, onClick, tone }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={cn(
      "flex size-7 items-center justify-center rounded-lg transition-colors",
      tone === "danger"
        ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
    )}
  >
    <Icon className="size-3.5" strokeWidth={2} />
  </button>
);

export default DevicesPage;
