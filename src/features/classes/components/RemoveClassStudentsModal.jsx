// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

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
  const { setCollection, setCollectionLoadingState, invalidateCache } =
    useArrayStore();

  const refetchClassStudents = () => {
    const collectionName = `class-students-${classId}`;
    setCollectionLoadingState(true, collectionName);

    usersAPI
      .getAll({ role: "student", class: classId, limit: 200 })
      .then((res) => setCollection(res.data.data || [], null, collectionName))
      .catch(() => setCollection([], true, collectionName));
  };

  const handleRemove = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = all ? { all: true } : { studentIds };

    classesAPI
      .removeStudents(classId, payload)
      .then(() => {
        close();
        refetchClassStudents();
        invalidateCache("users");
        toast.success("O'quvchilar sinfdan chiqarildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleRemove} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        {all
          ? "Sinfdagi barcha o'quvchilar sinfdan chiqariladi. O'quvchilar o'chirilmaydi — faqat shu sinfdan olib tashlanadi."
          : `${studentIds.length} ta o'quvchi shu sinfdan chiqariladi. O'quvchilar o'chirilmaydi — faqat shu sinfdan olib tashlanadi.`}
      </p>

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
          autoFocus
          variant="danger"
          disabled={isLoading}
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
