// React
import { useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ChevronDown, Pencil, Plus, Trash2, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { GROUP_STATUS_META } from "../data/tutorGroups.data";
import { tutorGroupsQueries } from "../queries/tutorGroups.queries";

/**
 * "Tyutor guruhlari" kartasi — xodim sahifasining asosiy tabida.
 *
 * Tyutor roli bor xodimda HAR DOIM, rolsiz xodimda esa faqat guruhi (yoki
 * tarixi) bo'lsa ko'rinadi: rol olib tashlansa ham biriktirilgan guruh va
 * uning qo'shimcha oyligi ko'zdan yo'qolmasligi kerak.
 *
 * Summalar serverdan tayyor keladi — bu yerda arifmetika yo'q.
 */
const TutorGroupsCard = ({ user }) => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const [showHistory, setShowHistory] = useState(false);

  const canView = can("tutors.view");
  const canAssign = can("tutors.assign");

  const { data, isLoading } = useQuery({
    ...tutorGroupsQueries.staff(user.id),
    enabled: canView && user.role !== "student",
  });

  if (!canView || user.role === "student" || isLoading || !data) return null;

  const { staff, groups, history, totals } = data;
  if (!staff.isTutor && groups.length === 0 && history.length === 0) return null;

  const tutor = { id: staff.id, fullName: staff.fullName };
  const canAddGroup = canAssign && staff.isTutor && !staff.isArchived;

  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Tyutor guruhlari</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {totals.groupCount > 0
              ? `${data.monthLabel}: ${totals.groupCount} ta guruh, ${totals.studentCount} ta o'quvchi · qo'shimcha oylik ${formatMoney(totals.monthlyAmount)}`
              : "Guruh biriktirilmagan"}
          </p>
        </div>

        {canAddGroup && (
          <Button
            variant="secondary"
            onClick={() => openModal("tutorGroup", { tutor })}
          >
            <Plus strokeWidth={1.5} />
            Guruh biriktirish
          </Button>
        )}
      </div>

      {!staff.isTutor && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Bu xodimda hozir tyutor roli yo'q, lekin guruh biriktirilgan. Guruh
          amalda bo'lsa qo'shimcha oylik hisoblanishda davom etadi — kerak
          bo'lmasa guruhni olib tashlang.
        </p>
      )}

      {staff.isArchived && groups.length > 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Xodim arxivlangan — unga oylik hisoblanmaydi.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {groups.length === 0 && (
          <p className="text-sm text-gray-500">
            Tyutorga sinf biriktirilsa, sinfdagi o'quvchilar soniga qarab
            qo'shimcha oylik har oy avtomatik hisoblanadi.
          </p>
        )}

        {groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            canAssign={canAssign}
            onEdit={() => openModal("tutorGroup", { tutor, group })}
            onRemove={() => openModal("removeTutorGroup", { group })}
          />
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", showHistory && "rotate-180")}
              strokeWidth={1.75}
            />
            Tugagan biriktirishlar ({history.length})
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2">
              {history.map((group) => (
                <GroupRow key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

/** Bitta guruh qatori: sinf, o'quvchilar soni, formula, oylik summa, davr. */
const GroupRow = ({ group, canAssign = false, onEdit, onRemove }) => {
  const status = GROUP_STATUS_META[group.status];
  const isEnded = group.status === "ended";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/tutor-groups/${group.id}`}
            className="font-medium text-gray-900 hover:text-primary hover:underline"
          >
            {group.className}
          </Link>

          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            <Users className="size-3" strokeWidth={2} />
            {group.studentCount} o'quvchi
          </span>

          {status && (
            <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", status.className)}>
              {status.label}
            </span>
          )}

          {!group.classIsActive && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              Sinf faol emas
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {group.studentCount} o'quvchi × {formatMoney(group.perStudentAmount)}
          {" + "}guruh uchun {formatMoney(group.groupAmount)} · {group.periodLabel}
        </p>

        {group.note && <p className="text-xs text-gray-400">{group.note}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={cn("font-semibold", isEnded ? "text-gray-400" : "text-gray-900")}>
            {formatMoney(group.monthlyAmount)}
          </p>
          <p className="text-xs text-gray-400">oyiga</p>
        </div>

        {canAssign && !isEnded && (
          <>
            <button
              type="button"
              title="Tahrirlash"
              onClick={onEdit}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              title="Olib tashlash"
              onClick={onRemove}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorGroupsCard;
