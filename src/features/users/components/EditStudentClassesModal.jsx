// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { ArrowRight } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import MultiSelect from "@/shared/components/form/multi-select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import ClassChangeReasonField from "@/features/classes/components/ClassChangeReasonField";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useUpdateStudentClasses } from "@/features/users/queries/users.mutations";

// Data
import { isClassChangeReasonValid } from "@/features/classes/data/classChanges.data";

/**
 * O'quvchining sinflari: qo'shish, boshqa sinfga o'tkazish va sinfdan
 * chiqarish (hammasini olib tashlash ham mumkin).
 *
 * ⚠️ O'quvchi biror sinfini YO'QOTSA (ko'chirish yoki chiqarish) — SABAB
 * MAJBURIY va u "Sinf o'zgarishlari" registriga yoziladi. Sof qo'shish
 * sababsiz. Qaysi holat ekani forma ostida oldindan ko'rsatiladi: admin
 * "Saqlash" ni bosishdan oldin nima bo'lishini bilishi kerak.
 *
 * Arxivlangan o'quvchiga sinf biriktirib bo'lmaydi — server rad etadi,
 * shuning uchun forma ham ogohlantirish ko'rsatadi.
 */
const EditStudentClassesModal = () => (
  <ResponsiveModal name="editStudentClasses" title="Sinflarni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { data: classes = [] } = useClasses();
  const { mutate: updateClasses } = useUpdateStudentClasses();

  const currentIds = user.classes?.map((cls) => cls.id) ?? [];
  const [selected, setSelected] = useState(currentIds);
  const [reason, setReason] = useState("");

  const nameOf = (id) =>
    classes.find((cls) => cls.id === id)?.name ??
    user.classes?.find((cls) => cls.id === id)?.name ??
    "—";

  const removed = currentIds.filter((id) => !selected.includes(id));
  const added = selected.filter((id) => !currentIds.includes(id));
  const hasChanges = removed.length > 0 || added.length > 0;
  const needsReason = removed.length > 0;
  const reasonValid = isClassChangeReasonValid(reason);

  // Holat: ko'chirish (chiqdi + qo'shildi) / chiqarish (faqat chiqdi) / qo'shish
  const kind = !needsReason ? "added" : added.length > 0 ? "moved" : "removed";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!hasChanges) return close();
    if (needsReason && !reasonValid) {
      return toast.warning(
        kind === "moved" ? "Ko'chirish sababini yozing" : "Sinfdan chiqarish sababini yozing",
      );
    }

    setIsLoading(true);

    updateClasses(
      {
        id: user.id,
        classes: selected,
        reason: needsReason ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          close();
          toast.success(
            kind === "moved"
              ? "O'quvchi boshqa sinfga ko'chirildi"
              : kind === "removed"
                ? "O'quvchi sinfdan chiqarildi"
                : "Sinflar saqlandi",
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {user.isArchived && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          O'quvchi arxivlangan. Sinf biriktirish uchun avval uni arxivdan
          qaytaring.
        </p>
      )}

      <div className="space-y-1.5">
        <MultiSelect
          label="Sinflar"
          value={selected}
          onChange={setSelected}
          disabled={user.isArchived}
          placeholder="Sinf tanlanmagan"
          options={classes.map((cls) => ({ label: cls.name, value: cls.id }))}
        />

        {selected.length > 0 && !user.isArchived && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Barcha sinflardan chiqarish
          </button>
        )}
      </div>

      {hasChanges && (
        <ChangeSummary
          kind={kind}
          removed={removed.map(nameOf)}
          added={added.map(nameOf)}
          leavesNoClass={selected.length === 0}
        />
      )}

      {needsReason && (
        <ClassChangeReasonField
          value={reason}
          onChange={setReason}
          placeholder={
            kind === "moved"
              ? "Masalan: ota-onasining iltimosi bilan boshqa sinfga o'tkazildi"
              : "Masalan: maktabdan ketmoqda"
          }
        />
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          variant={kind === "removed" ? "danger" : "default"}
          className="w-full xs:w-32"
          disabled={
            isLoading ||
            user.isArchived ||
            !hasChanges ||
            (needsReason && !reasonValid)
          }
        >
          {kind === "moved" ? "Ko'chirish" : kind === "removed" ? "Chiqarish" : "Saqlash"}
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

/** Nima bo'lishini oldindan aytadi — "5-A → 6-B", "5-A dan chiqariladi". */
const ChangeSummary = ({ kind, removed, added, leavesNoClass }) => {
  if (kind === "added") {
    return (
      <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
        Qo'shiladi: <b>{added.join(", ")}</b>
      </p>
    );
  }

  if (kind === "moved") {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
        <span>Ko'chiriladi:</span>
        <b>{removed.join(", ")}</b>
        <ArrowRight className="size-4 shrink-0" strokeWidth={2} />
        <b>{added.join(", ")}</b>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
      <p>
        Sinfdan chiqariladi: <b>{removed.join(", ")}</b>
      </p>
      {leavesNoClass && (
        <p className="mt-1 text-red-700">
          O'quvchi hech bir sinfda qolmaydi.
        </p>
      )}
    </div>
  );
};

export default EditStudentClassesModal;
