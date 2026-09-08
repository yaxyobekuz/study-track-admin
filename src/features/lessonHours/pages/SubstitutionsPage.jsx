// React
import { useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import { ArrowRight, Ban, Lock, Pencil, Plus, Repeat2, Trash2 } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import Panel from "../components/Panel";
import {
  CancelSubstitutionModal,
  CreateSubstitutionModal,
  DeleteSubstitutionModal,
  EditSubstitutionModal,
} from "../components/SubstitutionModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { CHIP, SURFACE, T, rowDelay } from "../data/ledger.tokens";
import { PHASE_META } from "../data/lessonHours.data";
import { substitutionQueries } from "../queries/lessonHours.queries";

/**
 * DARS O'RINBOSARLIGI — operatsion ekran.
 *
 * ⚠️ IKKI FILTR ATAYLAB AJRATILGAN: "hozir amalda" (SANA bo'yicha) va
 * "bekor qilinmagan" (QAROR bo'yicha). Ular bir xil emas — o'tib ketgan
 * o'rinbosarlik ham `active` bo'lib qoladi, chunki u haqiqatan bo'lib
 * o'tgan va o'sha oyning oyligida hisobga olingan.
 *
 * ⚠️ O'CHIRISH VA BEKOR QILISH — IKKI XIL AMAL:
 *   · hali BOSHLANMAGAN yozuv o'chiriladi — u hech qachon kuchga
 *     kirmagan, hech qanday jurnal huquqi ochilmagan va soat
 *     hisoblanmagan. Bu xato kiritilgan reja, tarixda qolishi shart emas;
 *   · BOSHLANGAN yozuv faqat bekor qilinadi — sabab va aktyor bilan
 *     (`payroll` doktrinasi). O'chirilsa, o'sha davrdagi baholar va
 *     hisoblangan soat "sababsiz" bo'lib qolardi.
 *
 * Tahrirlash ham faqat boshlanmagan yozuvda ochiq va server buni qayta
 * tekshiradi — panel bayrog'i (`canEdit`) faqat UI qatlami.
 */
const SubstitutionsPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal("createSubstitution");

  // Boshqaruvlar layoutdagi tablar qatoriga joylanadi — alohida qator
  // ochilsa, ro'yxat ekranda pastroqdan boshlanardi.
  const { filterSlot } = useOutletContext() ?? {};

  const [page, setPage] = useState(1);
  const [ongoing, setOngoing] = useState(false);
  const [status, setStatus] = useState("");

  const { data, isLoading, isError } = useQuery(
    substitutionQueries.list({
      page,
      limit: 20,
      ...(ongoing ? { ongoing: "true" } : {}),
      ...(status ? { status } : {}),
    }),
  );

  if (!can("substitutions.view")) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="Dars o'rinbosarligini ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* ── Boshqaruvlar — LAYOUTDAGI tablar qatoriga portal orqali ── */}
      {filterSlot &&
        createPortal(
          <>
            <Toggle
              active={ongoing}
              onClick={() => {
                setOngoing((prev) => !prev);
                setPage(1);
              }}
              label="Hozir amalda"
              count={data?.totals?.ongoing}
            />

            <Segmented
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { key: "", label: "Barchasi" },
                { key: "active", label: "Amaldagi" },
                { key: "cancelled", label: "Bekor qilingan" },
              ]}
            />

            <Can do="substitutions.create">
              <button
                type="button"
                onClick={() => openModal("createSubstitution", {})}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2",
                  "text-[12px] font-medium text-white",
                  "transition-transform duration-300 ease-out-quint motion-safe:hover:-translate-y-0.5",
                  "shadow-[0_1px_2px_rgba(15,23,42,0.08),0_12px_28px_-16px_rgba(15,23,42,0.4)]",
                )}
              >
                <Plus className="size-3.5" strokeWidth={2.4} />
                O'rinbosar biriktirish
              </button>
            </Can>
          </>,
          filterSlot,
        )}

      {/* ── Ro'yxat ──────────────────────────────────────────── */}
      <Panel
        title="O'rinbosarlik yozuvlari"
        hint="Kim kimning o'rniga, qaysi darslar va qaysi kunlar"
        icon={Repeat2}
        tone="taken"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && rows.length === 0}
        emptyText="Bu filtr bo'yicha o'rinbosarlik topilmadi"
        padding="flush"
      >
        <ul className="px-2 pb-2">
          {rows.map((row, index) => (
            <SubstitutionRow key={row.id} row={row} delay={rowDelay(index)} />
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

      <CreateSubstitutionModal />
      <EditSubstitutionModal />
      <DeleteSubstitutionModal />
      <CancelSubstitutionModal />
    </div>
  );
};

/**
 * Bitta yozuv — ikki ism, davr, darslar va holat.
 *
 * ⚠️ DARSLAR RO'YXATI QATOR ICHIDA ochiladi, alohida sahifada emas: bu
 * ekrandagi eng ko'p beriladigan savol "aynan qaysi darslar" va uni
 * ko'rish uchun kontekstni yo'qotish shart emas.
 */
const SubstitutionRow = ({ row, delay }) => {
  const [open, setOpen] = useState(false);
  // ⚠️ `useModal` nomi faqat `isOpen` ni kuzatish uchun kerak; `openModal`
  // istalgan modalni nomi bilan ochadi, shuning uchun bitta chaqiruv yetadi.
  const { openModal } = useModal("cancelSubstitution");
  const phase = PHASE_META[row.phase?.key] ?? PHASE_META.upcoming;

  return (
    <li
      className={cn("rounded-xl motion-safe:animate-post", open && "bg-slate-50/60")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn("flex items-center gap-3 px-3 py-3", T.row, "rounded-xl")}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {/* Ikki ism — yo'nalish o'q bilan */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className={cn(T.tdName, "truncate")}>{row.originalTeacherName}</span>
            <ArrowRight className="size-3 shrink-0 text-slate-300" strokeWidth={2.4} />
            <span className={cn(T.tdName, "truncate text-indigo-700")}>
              {row.substituteTeacherName}
            </span>
          </div>

          <span className={cn(T.td, "hidden shrink-0 tabular-nums md:block")}>
            {row.periodLabel}
          </span>

          <span className={cn(CHIP, "shrink-0 bg-slate-100 text-slate-600")}>
            {row.lessonCount} dars
          </span>

          <span className={cn(CHIP, "shrink-0", phase.chip)}>{phase.label}</span>
        </button>

        {/* ⚠️ TUGMALAR YOZUV BOSQICHIGA QARAB O'ZGARADI.
            · hali boshlanmagan (`canEdit`) → tahrirlash va o'chirish:
              hech qanday jurnal huquqi ochilmagan, soat hisoblanmagan;
            · boshlangan yoki tugagan → faqat bekor qilish: yozuv dalil
              bo'lib qolgan va u sababi bilan yopiladi.
            Server ikkala qoidani ham qayta tekshiradi. */}
        {row.status === "active" && (
          <div className="flex shrink-0 items-center gap-0.5">
            {row.canEdit && (
              <>
                <Can do="substitutions.create">
                  <button
                    type="button"
                    title="Tahrirlash"
                    onClick={() => openModal("editSubstitution", { substitution: row })}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil className="size-3.5" strokeWidth={2} />
                  </button>
                </Can>

                <Can do="substitutions.cancel">
                  <button
                    type="button"
                    title="O'chirish"
                    onClick={() => openModal("deleteSubstitution", { substitution: row })}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} />
                  </button>
                </Can>
              </>
            )}

            {!row.canEdit && (
              <Can do="substitutions.cancel">
                <button
                  type="button"
                  title="Bekor qilish"
                  onClick={() => openModal("cancelSubstitution", { substitution: row })}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Ban className="size-3.5" strokeWidth={2} />
                </button>
              </Can>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="space-y-2 px-3 pb-3">
          <div className={cn(SURFACE.tile, "flex flex-wrap gap-x-6 gap-y-2 py-2.5")}>
            <Meta label="Sabab" value={row.reasonLabel} />
            <Meta label="Davr" value={row.periodLabel} />
            {row.note && <Meta label="Izoh" value={row.note} />}
            {row.status === "cancelled" && (
              <Meta label="Bekor qilish sababi" value={row.cancelReason} />
            )}
          </div>

          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {row.items.map((item) => (
              <li
                key={item.id}
                className={cn(SURFACE.tile, "flex items-center gap-2.5 py-2")}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-semibold tabular-nums text-slate-600">
                  {item.lessonOrder}
                </span>
                <div className="min-w-0">
                  <p className={cn(T.td, "truncate font-medium text-slate-900")}>
                    {item.className} · {item.subjectName}
                  </p>
                  <p className={cn(T.meta, "mt-0.5 truncate")}>
                    {item.dayLabel}
                    {item.startTime ? ` · ${item.startTime}–${item.endTime}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
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

const Toggle = ({ active, onClick, label, count }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium transition-colors duration-200 ease-out-quint",
      "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
      active ? "bg-slate-900 text-white" : "bg-white text-slate-500",
    )}
  >
    <span
      className={cn(
        "size-1.5 rounded-full",
        active ? "bg-emerald-400 motion-safe:animate-breathe" : "bg-slate-300",
      )}
    />
    {label}
    {count != null && (
      <span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-400")}>
        {count}
      </span>
    )}
  </button>
);

const Segmented = ({ value, onChange, options }) => (
  <div
    className={cn(
      "flex items-center gap-0.5 rounded-xl bg-white p-1",
      "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
    )}
  >
    {options.map((option) => (
      <button
        key={option.key || "all"}
        type="button"
        onClick={() => onChange(option.key)}
        className={cn(
          "rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-200 ease-out-quint",
          value === option.key
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export default SubstitutionsPage;
