// Icons
import { Pencil, Plus, Trash2, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { classLeadersQueries } from "../queries/classLeaders.queries";

/**
 * "Sinf rahbarligi" kartasi — xodim sahifasining asosiy tabida.
 *
 * Sinf rahbari roli bor xodimda HAR DOIM, rolsiz xodimda esa faqat
 * biriktirilgan sinfi bo'lsa ko'rinadi: rol olib tashlansa biriktirish
 * ko'zdan yo'qolib ketmasligi kerak — aks holda "huquq yo'q, lekin qator
 * bazada" holati hech qaysi ekranda ko'rinmasdi.
 *
 * ⚠️ TYUTOR KARTASIDAN FARQI: summa yo'q, davr yo'q, tarix yo'q. Sinf
 * rahbarligi pul hisoblamaydi — olib tashlangan biriktirish saqlanmaydi.
 */
const ClassLeadersCard = ({ user }) => {
  const { can } = usePermissions();
  const { openModal } = useModal();

  const canView = can("classLeaders.view");
  const canAssign = can("classLeaders.assign");

  const { data, isLoading } = useQuery({
    ...classLeadersQueries.staff(user.id),
    enabled: canView && user.role !== "student",
  });

  if (!canView || user.role === "student" || isLoading || !data) return null;

  const { staff, items, totalStudents } = data;
  if (!staff.isClassLeader && items.length === 0) return null;

  const leader = { id: staff.id, fullName: staff.name };
  const canAdd = canAssign && staff.isClassLeader && !staff.isArchived;

  return (
    <section className="rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Sinf rahbarligi</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {items.length > 0
              ? `${items.length} ta sinf, ${totalStudents} ta o'quvchi · kunlik davomatni o'zi belgilaydi`
              : "Sinf biriktirilmagan"}
          </p>
        </div>

        {canAdd && (
          <Button variant="secondary" onClick={() => openModal("classLeader", { leader })}>
            <Plus strokeWidth={1.5} />
            Sinf biriktirish
          </Button>
        )}
      </div>

      {!staff.isClassLeader && items.length > 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Bu xodimda hozir sinf rahbari roli yo'q, shuning uchun davomat
          belgilash huquqi ISHLAMAYDI — biriktirish esa qolgan. Rolni qaytaring
          yoki sinfni olib tashlang.
        </p>
      )}

      {staff.isArchived && items.length > 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Xodim arxivlangan — u tizimga kira olmaydi, ya'ni davomat ham
          belgilamaydi.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">
            Sinf biriktirilsa, xodim shu sinfning kunlik davomatini o'z panelida
            belgilay oladi — darsi bo'lmasa ham.
          </p>
        )}

        {items.map((item) => (
          <ClassRow
            key={item.id}
            item={item}
            canAssign={canAssign}
            onEdit={() => openModal("classLeader", { leader, item })}
            onRemove={() => openModal("removeClassLeader", { item })}
          />
        ))}
      </div>
    </section>
  );
};

/** Bitta sinf qatori: nom, o'quvchilar soni, izoh. */
const ClassRow = ({ item, canAssign = false, onEdit, onRemove }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
    <div className="min-w-0 space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-gray-900">{item.className}</span>

        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          <Users className="size-3" strokeWidth={2} />
          {item.studentCount} o'quvchi
        </span>

        {!item.classIsActive && (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            Sinf faol emas
          </span>
        )}
      </div>

      {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
    </div>

    {canAssign && (
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Izohni tahrirlash"
          onClick={onEdit}
          className={cn(
            "rounded-lg p-1.5 text-gray-400",
            "hover:bg-gray-100 hover:text-gray-600",
          )}
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
      </div>
    )}
  </div>
);

export default ClassLeadersCard;
