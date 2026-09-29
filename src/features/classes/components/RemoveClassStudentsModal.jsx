// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Hooks
import { useRemoveClassStudents } from "@/features/classes/queries/classes.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import ClassChangeReasonField from "./ClassChangeReasonField";

// Data
import { isClassChangeReasonValid } from "../data/classChanges.data";

/**
 * O'quvchilarni sinfdan chiqarish (tanlangan yoki barchasi).
 *
 * ⚠️ SABAB MAJBURIY: har o'quvchi uchun "Sinf o'zgarishlari" registriga
 * ("Sinfdan chiqarilganlar") yoziladi. Server ham sababsiz so'rovni rad etadi.
 */
const RemoveClassStudentsModal = () => (
  <ResponsiveModal name="removeClassStudents" title="Sinfdan chiqarish">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  classId,
  studentIds = [],
  all = false,
}) => {
  const { mutate: removeStudents } = useRemoveClassStudents();
  const [reason, setReason] = useState("");

  const reasonValid = isClassChangeReasonValid(reason);

  const handleRemove = (e) => {
    e.preventDefault();

    if (!reasonValid) {
      return toast.warning("Sinfdan chiqarish sababini yozing");
    }

    setIsLoading(true);

    const payload = all
      ? { all: true, reason: reason.trim() }
      : { studentIds, reason: reason.trim() };

    removeStudents(
      { classId, payload },
      {
        onSuccess: (res) => {
          close();
          toast.success(
            `${res?.data?.modified ?? studentIds.length} ta o'quvchi sinfdan chiqarildi`,
          );
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleRemove} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        {all
          ? "Sinfdagi barcha o'quvchilar sinfdan chiqariladi. O'quvchilar o'chirilmaydi - faqat shu sinfdan olib tashlanadi."
          : `${studentIds.length} ta o'quvchi shu sinfdan chiqariladi. O'quvchilar o'chirilmaydi - faqat shu sinfdan olib tashlanadi.`}
      </p>

      <ClassChangeReasonField value={reason} onChange={setReason} />

      <div className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          variant="danger"
          disabled={isLoading || !reasonValid}
          className="w-full xs:w-32"
        >
          Chiqarish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default RemoveClassStudentsModal;
