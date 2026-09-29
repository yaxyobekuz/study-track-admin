// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useMoveClassStudents } from "@/features/classes/queries/classes.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import ClassChangeReasonField from "./ClassChangeReasonField";

// Data
import { isClassChangeReasonValid } from "../data/classChanges.data";

/**
 * Tanlangan o'quvchilarni boshqa sinfga ko'chirish.
 *
 * ⚠️ SABAB MAJBURIY: har o'quvchi uchun "Sinf o'zgarishlari" registriga
 * ("Ko'chirilganlar") yoziladi. Server ham sababsiz so'rovni rad etadi.
 */
const MoveClassStudentsModal = () => (
  <ResponsiveModal name="moveClassStudents" title="Boshqa sinfga ko'chirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  classId,
  studentIds = [],
}) => {
  const { data: classes = [] } = useClasses();
  const { mutate: moveStudents } = useMoveClassStudents();

  const [targetClassId, setTargetClassId] = useState("");
  const [reason, setReason] = useState("");

  const reasonValid = isClassChangeReasonValid(reason);

  // Joriy sinfdan tashqari sinflar
  const options = classes
    .filter((cls) => String(cls.id) !== String(classId))
    .map((cls) => ({ value: cls.id, label: cls.name }));

  const handleMove = (e) => {
    e.preventDefault();

    if (!targetClassId) {
      return toast.warning("Maqsadli sinfni tanlang");
    }
    if (!reasonValid) {
      return toast.warning("Ko'chirish sababini yozing");
    }

    setIsLoading(true);

    moveStudents(
      { classId, studentIds, targetClassId, reason: reason.trim() },
      {
        onSuccess: (res) => {
          close();
          toast.success(
            `${res?.data?.modified ?? studentIds.length} ta o'quvchi boshqa sinfga ko'chirildi`,
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
    <form onSubmit={handleMove} className="space-y-3.5">
      <p className="text-sm text-gray-500">
        {studentIds.length} ta o'quvchi tanlangan sinfga ko'chiriladi.
      </p>

      <SelectField
        required
        searchable
        inline
        label="Maqsadli sinf"
        options={options}
        value={targetClassId}
        placeholder="Sinfni tanlang"
        onChange={(v) => setTargetClassId(v)}
      />

      <ClassChangeReasonField
        value={reason}
        onChange={setReason}
        placeholder="Masalan: sinf ikkiga bo'lindi"
      />

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
          className="w-full xs:w-32"
          disabled={isLoading || !targetClassId || !reasonValid}
        >
          Ko'chirish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default MoveClassStudentsModal;
