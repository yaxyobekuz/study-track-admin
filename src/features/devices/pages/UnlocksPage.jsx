// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { History, Plus, Search, Unlock, X } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Pagination from "@/shared/components/ui/Pagination";
import Select from "@/shared/components/ui/select/Select";
import Panel from "../components/Panel";
import { GuardTable, GuardRow, GuardCell } from "../components/GuardTable";
import UnlockModal from "../components/UnlockModal";
import CancelUnlockModal from "../components/CancelUnlockModal";
import StudentDeviceModal from "../components/StudentDeviceModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Tokens, data & queries
import { CHIP, T, rowDelay } from "../data/guard.tokens";
import { AUDIT_FILTERS, UNLOCK_FILTERS, auditLabel } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";

/**
 * RUXSATLAR VA TARIX — "kim yumshatdi va kim o'zgartirdi".
 *
 * ⚠️ BU EKRAN AVVAL YO'Q EDI va bu jiddiy bo'shliq edi: vaqtinchalik
 * ruxsat berish mumkin bo'lgani holda, uni BEKOR QILISH yo'li panelda
 * umuman yo'q edi — server buni qo'llab-quvvatlagani bilan. "Adashib
 * 12 soatga ochib qo'ydim" holatining yagona yechimi muddat tugashini
 * kutish bo'lardi.
 *
 * ⚠️ IKKI BLOK BITTA EKRANDA: ruxsatlar va audit tarixi. Ikkalasi ham
 * bitta savolga javob beradi — "bolaning telefoniga kim tegdi". Alohida
 * ekranlarga bo'linsa, ruxsatni tekshirayotgan odam uni kim bergani
 * uchun boshqa sahifaga o'tishi kerak bo'lardi.
 */
const UnlocksPage = () => {
  const { filterSlot } = useOutletContext();
  const { can } = usePermissions();
  const { openModal } = useModal();

  const canUnlock = can("devices.unlock");

  return (
    <div className="flex flex-col gap-3">
      {filterSlot &&
        canUnlock &&
        createPortal(
          <Button size="sm" className="h-9" onClick={() => openModal("deviceUnlock", {})}>
            <Plus className="size-3.5" />
            Vaqtinchalik ruxsat
          </Button>,
          filterSlot,
        )}

      <UnlocksPanel canUnlock={canUnlock} />
      <AuditPanel />

      <UnlockModal />
      <CancelUnlockModal />
      <StudentDeviceModal />
    </div>
  );
};

/* ─────────────────────── RUXSATLAR ─────────────────────── */

const UnlocksPanel = ({ canUnlock }) => {
  const { openModal } = useModal();

  const [status, setStatus] = useState("live");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const onFilter = (apply) => (value) => {
    apply(value);
    setPage(1);
  };

  const { data, isLoading, isError } = useQuery(
    devicesQueries.unlocks({ page, limit: 20, status, search: debounced || undefined }),
  );

  const rows = data?.data ?? [];

  return (
    <Panel
      title="Vaqtinchalik ruxsatlar"
      hint={`Hozir amalda: ${data?.liveCount ?? 0} ta · muddat tugagach avvalgi qoida o'z-o'zidan qaytadi`}
      icon={Unlock}
      tone="open"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && rows.length === 0}
      emptyText="Bu filtrga mos ruxsat yo'q."
      padding="flush"
      action={
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onFilter(setSearch)(e.target.value)}
              placeholder="O'quvchi"
              className="h-8 w-40 pl-8 text-[12px]"
            />
          </div>
          <Select
            triggerClassName="h-8 min-w-40 text-[12px]"
            value={status}
            options={UNLOCK_FILTERS}
            onChange={onFilter(setStatus)}
          />
        </div>
      }
    >
      <div className="px-5 pb-5">
        <GuardTable
          minWidth={880}
          template="minmax(170px,1.1fr) minmax(170px,1fr) 200px minmax(180px,1.2fr) 150px"
          columns={[
            { label: "O'quvchi" },
            { label: "Nima ochilgan" },
            { label: "Muddat" },
            { label: "Sabab" },
            { label: "Holat", align: "right" },
          ]}
        >
          {rows.map((row, index) => (
            <GuardRow key={row.id} index={index}>
              <GuardCell>
                <button
                  type="button"
                  onClick={() =>
                    openModal("studentDevice", {
                      studentId: row.student?.id,
                      name: `${row.student?.firstName || ""} ${row.student?.lastName || ""}`.trim(),
                    })
                  }
                  className="w-full text-left hover:underline"
                >
                  <span className={cn(T.tdName, "block truncate")}>
                    {row.student
                      ? `${row.student.firstName} ${row.student.lastName || ""}`.trim()
                      : "Nomaʼlum"}
                  </span>
                  <span className={cn(T.hint, "block truncate")}>
                    {row.student?.className || "Sinfsiz"}
                  </span>
                </button>
              </GuardCell>

              <GuardCell>
                <span className={cn(T.td, "block truncate")}>
                  {row.kind === "full"
                    ? "Butun cheklov to'xtatilgan"
                    : `${row.app?.name || "Ilova"} · +${row.extraMinutes} daq`}
                </span>
              </GuardCell>

              <GuardCell>
                <span className={cn(T.td, "tabular-nums")}>
                  {formatDateTimeUz(row.endsAt)} gacha
                </span>
              </GuardCell>

              <GuardCell>
                <span className={cn(T.td, "line-clamp-2")}>{row.reason}</span>
                {row.cancelReason && (
                  <span className={cn(T.hint, "block truncate")}>
                    Bekor: {row.cancelReason}
                  </span>
                )}
              </GuardCell>

              <GuardCell align="right">
                <div className="flex items-center justify-end gap-1.5">
                  <span
                    className={cn(
                      CHIP,
                      row.isLive
                        ? "bg-emerald-50 text-emerald-700"
                        : row.status === "cancelled"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {row.isLive
                      ? "Amalda"
                      : row.status === "cancelled"
                        ? "Bekor qilingan"
                        : "Tugagan"}
                  </span>

                  {canUnlock && row.isLive && (
                    <button
                      type="button"
                      onClick={() => openModal("cancelDeviceUnlock", { unlock: row })}
                      title="Bekor qilish"
                      aria-label="Bekor qilish"
                      className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="size-3.5" strokeWidth={2.4} />
                    </button>
                  )}
                </div>
              </GuardCell>
            </GuardRow>
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
  );
};

/* ─────────────────────── TARIX ─────────────────────── */

const AuditPanel = () => {
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery(
    devicesQueries.auditPage({ page, limit: 25, action }),
  );

  const rows = data?.data ?? [];

  return (
    <Panel
      title="O'zgarishlar tarixi"
      hint="Bolaning qurilmasiga tegadigan har amal yozib boriladi"
      icon={History}
      tone="neutral"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && rows.length === 0}
      emptyText="Bu filtrga mos yozuv yo'q."
      padding="flush"
      action={
        <Select
          triggerClassName="h-8 min-w-48 text-[12px]"
          value={action}
          options={AUDIT_FILTERS}
          onChange={(value) => {
            setAction(value);
            setPage(1);
          }}
        />
      }
    >
      <div className="px-5 pb-5">
        <ul className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={cn("flex items-start gap-3 py-2.5 first:pt-0", "motion-safe:animate-post")}
              style={{ animationDelay: `${rowDelay(index)}ms` }}
            >
              <span className={cn(CHIP, "mt-0.5 shrink-0 bg-slate-100 text-slate-600")}>
                {auditLabel(row.action)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-snug text-slate-700">{row.summary}</p>
                {row.reason && <p className={cn(T.hint, "mt-0.5")}>Sabab: {row.reason}</p>}
              </div>
              <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                {formatDateTimeUz(row.createdAt)}
              </span>
            </li>
          ))}
        </ul>

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
  );
};

export default UnlocksPage;
