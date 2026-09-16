// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import { Lock, LockOpen, Plus, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import Panel from "../components/Panel";
import {
  CreateGradingUnlockModal,
  RevokeGradingUnlockModal,
} from "../components/GradingUnlockModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { CHIP, SURFACE, T, rowDelay } from "../data/ledger.tokens";
import {
  MISSED_LESSONS_HINT,
  UNLOCK_STATUS_META,
  unlockTargetText,
} from "../data/lessonHours.data";
import { gradingUnlockQueries } from "../queries/lessonHours.queries";

const STATUS_FILTERS = [
  { key: "", label: "Barchasi" },
  { key: "active", label: "Ochiq" },
  { key: "expired", label: "Muddati tugagan" },
  { key: "revoked", label: "Yopilgan" },
];

/**
 * BAHO QO'YISHNI OCHISH — o'tgan kunlar oynalari.
 *
 * Platforma sababli baho qo'yilmay qolgan kunlar shu yerdan ochiladi:
 * kunlar oralig'i → hammaga yoki tanlanganlarga → muddat. Ochilgan kunda
 * baho qo'yilgan dars o'tilgan hisoblanadi va soati oylikka yoziladi.
 *
 * ⚠️ YOPILGAN / MUDDATI TUGAGAN OYNA RO'YXATDA QOLADI: u oylikka ta'sir
 * qilgan (shu kunlarda qo'yilgan baholar o'z kuchida) — "nega bu oy soati
 * ko'paydi" degan savolning javobi shu yerda.
 */
const GradingAccessPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { filterSlot } = useOutletContext() ?? {};

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading, isError } = useQuery(
    gradingUnlockQueries.list({ page, limit: 20, ...(status ? { status } : {}) }),
  );

  if (!can("grades.unlock")) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="O'tgan kunlarga baho qo'yishni ochish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-xl bg-white p-1",
                "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
              )}
            >
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.key || "all"}
                  type="button"
                  onClick={() => {
                    setStatus(option.key);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-200 ease-out-quint",
                    status === option.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100",
                  )}
                >
                  {option.label}
                  {option.key === "active" && data?.totals?.active > 0 && (
                    <span className={cn("tabular-nums", status === "active" ? "text-white/70" : "text-slate-400")}>
                      {data.totals.active}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openModal("createGradingUnlock", {})}
              className={cn(
                "flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2",
                "text-[12px] font-medium text-white",
                "transition-transform duration-300 ease-out-quint motion-safe:hover:-translate-y-0.5",
                "shadow-[0_1px_2px_rgba(15,23,42,0.08),0_12px_28px_-16px_rgba(15,23,42,0.4)]",
              )}
            >
              <Plus className="size-3.5" strokeWidth={2.4} />
              Baho qo'yishni ochish
            </button>
          </>,
          filterSlot,
        )}

      <Panel
        title="Ochilgan kunlar"
        hint={MISSED_LESSONS_HINT.unlock}
        icon={LockOpen}
        tone="taught"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && rows.length === 0}
        emptyText={
          status
            ? "Bu filtr bo'yicha oyna topilmadi"
            : "Hali hech qanday kun ochilmagan. Platforma sababli baho qo'yilmay qolgan kunlarni \"Baho qo'yishni ochish\" tugmasi bilan oching."
        }
        padding="flush"
      >
        <ul className="px-2 pb-2">
          {rows.map((row, index) => (
            <UnlockRow key={row.id} row={row} delay={rowDelay(index)} />
          ))}
        </ul>

        {data?.pagination?.totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Panel>

      <CreateGradingUnlockModal />
      <RevokeGradingUnlockModal />
    </div>
  );
};

/** Bitta oyna — kunlar, kimga, muddat, holat; bosilsa tafsilot ochiladi. */
const UnlockRow = ({ row, delay }) => {
  const [open, setOpen] = useState(false);
  const { openModal } = useModal();
  const meta = UNLOCK_STATUS_META[row.status] ?? UNLOCK_STATUS_META.expired;

  return (
    <li
      className={cn("rounded-xl motion-safe:animate-post", open && "bg-slate-50/60")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("flex items-center gap-3 rounded-xl px-3 py-3", T.row)}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className={cn(T.tdName, "truncate")}>{row.rangeLabel}</p>
            <p className={cn(T.meta, "mt-0.5 flex items-center gap-1 truncate")}>
              {row.scope === "all" && <Users className="size-3 shrink-0" strokeWidth={2.2} />}
              {unlockTargetText(row)}
              {row.reason ? ` · ${row.reason}` : ""}
            </p>
          </div>

          <span className={cn(CHIP, "hidden shrink-0 bg-slate-100 text-slate-600 sm:inline-flex")}>
            {row.dayCount} kun
          </span>

          <span className={cn(T.td, "hidden shrink-0 tabular-nums md:block")}>
            {row.status === "revoked" ? row.revokedAtLabel : `${row.expiresAtLabel} gacha`}
          </span>

          <span className={cn(CHIP, "shrink-0", meta.chip)}>{meta.label}</span>
        </button>

        {row.status === "active" && (
          <Can do="grades.unlock">
            <button
              type="button"
              title="Yopish"
              onClick={() => openModal("revokeGradingUnlock", { unlock: row })}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Lock className="size-3.5" strokeWidth={2} />
            </button>
          </Can>
        )}
      </div>

      {open && (
        <div className="space-y-2 px-3 pb-3">
          <div className={cn(SURFACE.tile, "flex flex-wrap gap-x-6 gap-y-2 py-2.5")}>
            <Meta label="Kim ochdi" value={`${row.grantedByName} · ${row.createdAtLabel}`} />
            <Meta label="Ochiq muddat" value={`${row.expiresAtLabel} gacha`} />
            {row.status === "revoked" && (
              <Meta label="Yopildi" value={`${row.revokedByName} · ${row.revokedAtLabel}`} />
            )}
            {row.reason && <Meta label="Sabab" value={row.reason} />}
          </div>

          {row.scope === "selected" && (
            <ul className="flex flex-wrap gap-1.5">
              {row.teachers.map((teacher) => (
                <li key={teacher.id} className={cn(CHIP, "bg-white text-slate-700")}>
                  {teacher.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

const Meta = ({ label, value }) => (
  <div className="min-w-0">
    <p className={T.label}>{label}</p>
    <p className={cn(T.td, "mt-0.5 truncate text-slate-700")}>{value}</p>
  </div>
);

export default GradingAccessPage;
