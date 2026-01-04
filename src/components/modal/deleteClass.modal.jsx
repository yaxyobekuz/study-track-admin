// Toast
import { toast } from "sonner";

// API
import { classesAPI } from "@/api/client";

// Components
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

const DeleteClassModal = () => (
  <ResponsiveModal
    name="deleteClass"
    title="Sinfni o'chirish"
    description="Haqiqatdan ham sinfni o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...classData }) => {
  const { invalidateCache } = useArrayStore("classes");

  const handleDeleteClass = (e) => {
    e.preventDefault();
    setIsLoading(true);

    classesAPI
      .delete(classData._id)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Sinf o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleDeleteClass}
      className="flex justify-end gap-5 w-full"
    >
      <Button type="button" className="w-32" variant="neutral" onClick={close}>
        Bekor qilish
      </Button>

      <Button autoFocus className="w-32" variant="danger" disabled={isLoading}>
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteClassModal;
