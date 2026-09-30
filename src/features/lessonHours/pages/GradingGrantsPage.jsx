// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import { KeyRound, Lock, Plus } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import Panel from "../components/Panel";
import {
  CreateGradingGrantModal,
  RevokeGradingGrantModal,
} from "../components/GradingGrantModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { CHIP, SURFACE, T, rowDelay } from "../data/ledger.tokens";
import {
  GRANT_HINT,
  GRANT_STATUS_FILTERS,
  GRANT_STATUS_META,
} from "../data/lessonHours.data";
import { gradingGrantQueries } from "../queries/lessonHours.queries";

/**
 * FANGA BAHO RUXSATI — o'qituvchiga O'ZINIKI BO'LMAGAN sinf + fanga.
 *
 * Masalan: ingliz tili sertifikati bor o'quvchini ona tili o'qituvchisi
 * tayyorlaydi — unga "11-A · Ingliz tili" ruxsati beriladi va u ingliz
 * tili darsida o'sha o'quvchiga baho qo'yadi. Kimga → qaysi sinf → qaysi
 * fan → qancha muddat (1 hafta / 1 oy / 1 yil / sana) yoki bitta dars.
 *
 * ⚠️ YOPILGAN / MUDDATI TUGAGAN RUXSAT RO'YXATDA QOLADI: shu ruxsat bilan
 * qo'yilgan baholar unga ishora qiladi — "bu bahoni nega boshqa o'qituvchi
 * qo'ygan" degan savolning javobi shu yerda.
 */
const GradingGrantsPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { filterSlot } = useOutletContext() ?? {};

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading, isError } = useQuery(
    gradingGrantQueries.list({ page, limit: 20, ...(status ? { status } : {}) }),
  );

  if (!can("gradeGrants.view")) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="O'qituvchiga boshqa fanga baho qo'yish ruxsatini berish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const canManage = can("gradeGrants.manage");
  const rows = data?.data ?? [];
  const counts = { active: data?.totals?.active, upcoming: data?.totals?.upcoming };

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <div
              className={cn(
                "flex items-center gap-0.5 overflow-x-auto rounded-xl bg-white p-1 hidden-scrollbar",
                "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
              )}
            >
              {GRANT_STATUS_FILTERS.map((option) => (
                <button
                  key={option.key || "all"}
                  type="button"
                  onClick={() => {
                    setStatus(option.key);
                    setPage(1);
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-200 ease-out-quint",
                    status === option.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100",
                  )}
                >
                  {option.label}
                  {counts[option.key] > 0 && (
                    <span className={cn("tabular-nums", status === option.key ? "text-white/70" : "text-slate-400")}>
                      {counts[option.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {canManage && (
              <button
                type="button"
                onClick={() => openModal("createGradingGrant", {})}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2",
                  "text-[12px] font-medium text-white",
                  "transition-transform duration-300 ease-out-quint motion-safe:hover:-translate-y-0.5",
                  "shadow-[0_1px_2px_rgba(15,23,42,0.08),0_12px_28px_-16px_rgba(15,23,42,0.4)]",
                )}
              >
                <Plus className="size-3.5" strokeWidth={2.4} />
                Ruxsat berish
              </button>
            )}
          </>,
          filterSlot,
        )}

      <Panel
        title="Fanga baho ruxsatlari"
        hint={GRANT_HINT.rule}
        icon={KeyRound}
        tone="taught"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && rows.length === 0}
        emptyText={
          status
            ? "Bu filtr bo'yicha ruxsat topilmadi"
            : "Hali hech kimga ruxsat berilmagan. O'qituvchiga boshqa sinf yoki fanga baho qo'yishni \"Ruxsat berish\" tugmasi bilan oching."
        }
        padding="flush"
      >
        <ul className="px-2 pb-2">
          {rows.map((row, index) => (
            <GrantRow key={row.id} row={row} delay={rowDelay(index)} />
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

      {canManage && (
        <>
          <CreateGradingGrantModal />
          <RevokeGradingGrantModal />
        </>
      )}
    </div>
  );
};

/** Bitta ruxsat — kimga, sinf · fan, davr, holat; bosilsa tafsilot ochiladi. */
const GrantRow = ({ row, delay }) => {
  const [open, setOpen] = useState(false);
  const { openModal } = useModal();
  const meta = GRANT_STATUS_META[row.status] ?? GRANT_STATUS_META.expired;
  const canRevoke = row.status === "active" || row.status === "upcoming";

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
            <p className={cn(T.tdName, "truncate")}>{row.teacherName}</p>
            <p className={cn(T.meta, "mt-0.5 truncate")}>
              {row.className} · {row.subjectName} · {row.scopeLabel}
              {row.reason ? ` · ${row.reason}` : ""}
            </p>
          </div>

          <span className={cn(T.td, "hidden shrink-0 tabular-nums md:block")}>
            {row.mode === "lesson" ? `${row.rangeLabel}, ${row.dayName}` : row.rangeLabel}
          </span>

          <span className={cn(CHIP, "shrink-0", meta.chip)}>{meta.label}</span>
        </button>

        {canRevoke && (
          <Can do="gradeGrants.manage">
            <button
              type="button"
              title="Yopish"
              onClick={() => openModal("revokeGradingGrant", { grant: row })}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Lock className="size-3.5" strokeWidth={2} />
            </button>
          </Can>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3">
          <div className={cn(SURFACE.tile, "flex flex-wrap gap-x-6 gap-y-2 py-2.5")}>
            <Meta label="Davr" value={`${row.rangeLabel} · ${row.dayCount} kun`} className="md:hidden" />
            <Meta label="Qaysi darslar" value={row.mode === "lesson" ? `${row.dayName}, ${row.scopeLabel}` : row.scopeLabel} />
            <Meta label="Kim berdi" value={`${row.grantedByName} · ${row.createdAtLabel}`} />
            {row.status === "revoked" && (
              <Meta label="Yopildi" value={`${row.revokedByName} · ${row.revokedAtLabel}`} />
            )}
            {row.reason && <Meta label="Sabab" value={row.reason} />}
            {row.revokeReason && <Meta label="Yopish sababi" value={row.revokeReason} />}
          </div>
        </div>
      )}
    </li>
  );
};

const Meta = ({ label, value, className }) => (
  <div className={cn("min-w-0", className)}>
    <p className={T.label}>{label}</p>
    <p className={cn(T.td, "mt-0.5 truncate text-slate-700")}>{value}</p>
  </div>
);

export default GradingGrantsPage;
