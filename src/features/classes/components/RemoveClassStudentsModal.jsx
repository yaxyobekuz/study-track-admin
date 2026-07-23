// Toast
import { toast } from "sonner";

// Hooks
import { useRemoveClassStudents } from "@/features/classes/queries/classes.mutations";

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
  const { mutate: removeStudents } = useRemoveClassStudents();

  const handleRemove = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = all ? { all: true } : { studentIds };

    removeStudents(
      { classId, payload },
      {
        onSuccess: () => {
          close();
          toast.success("O'quvchilar sinfdan chiqarildi");
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
