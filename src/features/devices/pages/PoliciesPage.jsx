// React
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import {
  Archive,
  ArchiveRestore,
  Link2,
  Link2Off,
  Pencil,
  Plus,
  ShieldCheck,
  Timer,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import Panel from "../components/Panel";
import PolicyEditorModal from "../components/PolicyEditorModal";
import AssignPolicyModal from "../components/AssignPolicyModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens, data & queries
import { CHIP, SURFACE, T, gridDelay, modeOf, scopeOf } from "../data/guard.tokens";
import { weekdayShort } from "../data/devices.data";
import { devicesQueries } from "../queries/devices.queries";
import {
  useArchivePolicy,
  useClearAssignment,
  useRestorePolicy,
} from "../queries/devices.mutations";

/**
 * SIYOSATLAR — qoidalar va ular kimga yoqilgani.
 *
 * ⚠️ IKKI RO'YXAT BITTA EKRANDA va bu ataylab: "qanday qoida bor" va
 * "u kimga qo'llanyapti" — bir-birisiz ma'nosiz savollar. Alohida
 * ekranlarga bo'linsa, admin siyosatni tahrirlab, uning qayerda
 * ishlayotganini ko'rmasdan saqlab qo'yardi.
 *
 * ⚠️ BIRIKTIRILMAGAN SIYOSAT ALOHIDA BELGILANADI ("Hech kimga
 * yoqilmagan"). Bu eng ko'p uchraydigan chalkashlik: qoida yozilgan,
 * saqlangan, lekin hech narsa o'zgarmagan.
 */
const PoliciesPage = () => {
  const { filterSlot } = useOutletContext();
  const { can } = usePermissions();
  const { openModal } = useModal();

  const canEdit = can("devices.policies");
  const canAssign = can("devices.assign");

  const { data: policies = [], isLoading, isError } = useQuery(devicesQueries.policies({}));
  const { data: assignments = [] } = useQuery(devicesQueries.assignments({}));

  const { mutate: archivePolicy } = useArchivePolicy();
  const { mutate: restorePolicy } = useRestorePolicy();
  const { mutate: clearAssignment } = useClearAssignment();

  // Siyosat → unga biriktirilgan nishonlar
  const byPolicy = new Map();
  for (const row of assignments) {
    const list = byPolicy.get(row.policyId) || [];
    list.push(row);
    byPolicy.set(row.policyId, list);
  }

  return (
    <div className="flex flex-col gap-3">
      {filterSlot &&
        canEdit &&
        createPortal(
          <Button
            size="sm"
            className="h-9"
            onClick={() => openModal("devicePolicyEditor", { policyId: null })}
          >
            <Plus className="size-3.5" />
            Yangi siyosat
          </Button>,
          filterSlot,
        )}

      <Panel
        title="Siyosatlar"
        hint="Qoidalar to'plami. Biriktirilgunicha birorta telefonga ta'sir qilmaydi"
        icon={ShieldCheck}
        tone="allowed"
        delay={gridDelay(0)}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && policies.length === 0}
        emptyText="Hali siyosat yo'q. «Yangi siyosat» tugmasi bilan qoida yarating — masalan «Dars vaqti»: faqat MBSI ilovasi ochiq, YouTube kuniga 1 soat."
        padding="flush"
      >
        <ul className="space-y-2 px-5 pb-5">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              assignments={byPolicy.get(policy.id) || []}
              canEdit={canEdit}
              canAssign={canAssign}
              onEdit={() => openModal("devicePolicyEditor", { policyId: policy.id })}
              onAssign={() =>
                openModal("deviceAssignPolicy", { policyId: policy.id, policyName: policy.name })
              }
              onArchive={() =>
                archivePolicy(policy.id, {
                  onSuccess: () => toast.success("Siyosat arxivlandi"),
                  onError: (err) =>
                    toast.error(err.response?.data?.message || "Arxivlanmadi"),
                })
              }
              onRestore={() =>
                restorePolicy(policy.id, {
                  onSuccess: () => toast.success("Arxivdan qaytarildi"),
                })
              }
              onClearAssignment={(id) =>
                clearAssignment(
                  { id },
                  {
                    onSuccess: (res) =>
                      toast.success(res?.message || "Biriktirish olib tashlandi"),
                    onError: (err) =>
                      toast.error(err.response?.data?.message || "Olib tashlanmadi"),
                  },
                )
              }
            />
          ))}
        </ul>
      </Panel>

      <PolicyEditorModal />
      <AssignPolicyModal />
    </div>
  );
};

/* ─────────────────────── KARTA ─────────────────────── */

const PolicyCard = ({
  policy,
  assignments,
  canEdit,
  canAssign,
  onEdit,
  onAssign,
  onArchive,
  onRestore,
  onClearAssignment,
}) => {
  const counts = policy.appCounts || {};

  return (
    <li className={cn(SURFACE.ghost, "px-4 py-3.5")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[13.5px] font-semibold text-slate-900">{policy.name}</h3>
            <span className={cn(CHIP, "bg-slate-100 text-slate-600")}>
              {policy.defaultMode === "block" ? "Oq ro'yxat" : "Qora ro'yxat"}
            </span>
            {policy.dailyLimitMinutes !== null && (
              <span className={cn(CHIP, "bg-amber-50 text-amber-800")}>
                <Timer className="size-2.5" strokeWidth={2.4} />
                {policy.dailyLimitMinutes} daq/kun
              </span>
            )}
            {policy.isArchived && (
              <span className={cn(CHIP, "bg-slate-100 text-slate-500")}>Arxivlangan</span>
            )}
          </div>

          {policy.description && (
            <p className={cn(T.hint, "mt-1")}>{policy.description}</p>
          )}

          {/* Ilova qoidalari kesimi */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["always", "allowed", "limited", "blocked"]
              .filter((mode) => counts[mode] > 0)
              .map((mode) => (
                <span key={mode} className={cn(CHIP, modeOf(mode).chip)}>
                  <span className={cn("size-1.5 rounded-full", modeOf(mode).dot)} />
                  {modeOf(mode).label}: {counts[mode]}
                </span>
              ))}
            {(policy.apps?.length || 0) === 0 && (
              <span className={cn(CHIP, "bg-slate-100 text-slate-500")}>Ilova qoidasi yo'q</span>
            )}
          </div>

          {/* Vaqt oynalari */}
          {policy.windows?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {policy.windows.slice(0, 7).map((w) => (
                <span key={w.id} className={cn(CHIP, "bg-sky-50 text-sky-700")}>
                  {weekdayShort(w.weekday)} {toClock(w.startMinute)}–{toClock(w.endMinute)}
                </span>
              ))}
              {policy.windows.length > 7 && (
                <span className={cn(CHIP, "bg-slate-100 text-slate-500")}>
                  +{policy.windows.length - 7}
                </span>
              )}
            </div>
          )}

          {/* ⚠️ Platforma identifikatori yetishmaydigan ilovalar — jim bo'shliq */}
          {policy.missingIdentifiers?.length > 0 && (
            <p className={cn(T.hint, "mt-1.5 text-amber-700")}>
              {policy.missingIdentifiers.length} ta ilovada platforma identifikatori
              yetishmaydi — o'sha telefonlarda qoida qo'llanmaydi
            </p>
          )}
        </div>

        {/* Amallar */}
        <div className="flex shrink-0 items-center gap-1.5">
          {canAssign && !policy.isArchived && (
            <Button size="sm" variant="outline" className="h-8" onClick={onAssign}>
              <Link2 className="size-3.5" />
              Biriktirish
            </Button>
          )}
          {canEdit && !policy.isArchived && (
            <Button size="sm" variant="ghost" className="h-8" onClick={onEdit}>
              <Pencil className="size-3.5" />
            </Button>
          )}
          {canEdit &&
            (policy.isArchived ? (
              <Button size="sm" variant="ghost" className="h-8" onClick={onRestore}>
                <ArchiveRestore className="size-3.5" />
              </Button>
            ) : (
              <ConfirmPopover
                title="Siyosatni arxivlash"
                description="Biriktirilgan siyosat arxivlanmaydi — avval biriktirishni olib tashlang."
                confirmLabel="Arxivlash"
                onConfirm={onArchive}
              >
                <Button size="sm" variant="ghost" className="h-8">
                  <Archive className="size-3.5" />
                </Button>
              </ConfirmPopover>
            ))}
        </div>
      </div>

      {/* ── Kimga yoqilgan ── */}
      <div className="mt-3 border-t border-slate-100 pt-2.5">
        {assignments.length === 0 ? (
          <p className={cn(T.hint, "italic")}>
            Hech kimga yoqilmagan — bu qoida hozircha hech qanday telefonga ta'sir qilmaydi
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={T.label}>Yoqilgan:</span>
            {assignments.map((row) => (
              <span
                key={row.id}
                className={cn(CHIP, scopeOf(row.scope).chip, "gap-1.5 pr-1")}
              >
                {row.targetName}
                {canAssign && (
                  <ConfirmPopover
                    title="Biriktirishni olib tashlash"
                    description={`${row.targetName} uchun bu qoida bekor qilinadi.`}
                    confirmLabel="Olib tashlash"
                    danger
                    onConfirm={() => onClearAssignment(row.id)}
                  >
                    <button
                      type="button"
                      className="rounded-full p-0.5 transition-colors hover:bg-black/10"
                      aria-label="Olib tashlash"
                    >
                      <Link2Off className="size-2.5" strokeWidth={2.6} />
                    </button>
                  </ConfirmPopover>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

/** Daqiqa → "HH:mm" (1440 → "24:00", `PolicyEditorModal` bilan AYNI qoida). */
const toClock = (minute) => {
  if (minute >= 1440) return "24:00";
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
};

export default PoliciesPage;
