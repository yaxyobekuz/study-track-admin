// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

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
  const {
    getCollectionData,
    setCollection,
    setCollectionLoadingState,
    invalidateCache,
  } = useArrayStore();

  const classes = getCollectionData("classes");
  const [targetClassId, setTargetClassId] = useState("");

  // Joriy sinfdan tashqari sinflar
  const options = classes
    .filter((cls) => String(cls._id) !== String(classId))
    .map((cls) => ({ value: cls._id, label: cls.name }));

  const refetchClassStudents = () => {
    const collectionName = `class-students-${classId}`;
    setCollectionLoadingState(true, collectionName);

    usersAPI
      .getAll({ role: "student", class: classId, limit: 200 })
      .then((res) => setCollection(res.data.data || [], null, collectionName))
      .catch(() => setCollection([], true, collectionName));
  };

  const handleMove = (e) => {
    e.preventDefault();

    if (!targetClassId) {
      return toast.warning("Maqsadli sinfni tanlang");
    }

    setIsLoading(true);

    classesAPI
      .moveStudents(classId, studentIds, targetClassId)
      .then(() => {
        close();
        refetchClassStudents();
        invalidateCache("users");
        toast.success("O'quvchilar boshqa sinfga ko'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
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
