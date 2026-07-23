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

  // Joriy sinfdan tashqari sinflar
  const options = classes
    .filter((cls) => String(cls.id) !== String(classId))
    .map((cls) => ({ value: cls.id, label: cls.name }));

  const handleMove = (e) => {
    e.preventDefault();

    if (!targetClassId) {
      return toast.warning("Maqsadli sinfni tanlang");
    }

    setIsLoading(true);

    moveStudents(
      { classId, studentIds, targetClassId },
      {
        onSuccess: () => {
          close();
          toast.success("O'quvchilar boshqa sinfga ko'chirildi");
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
        label="Maqsadli sinf"
        options={options}
        value={targetClassId}
        placeholder="Sinfni tanlang"
        onChange={(v) => setTargetClassId(v)}
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
          autoFocus
          className="w-full xs:w-32"
          disabled={isLoading || !targetClassId}
        >
          Ko'chirish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default MoveClassStudentsModal;
