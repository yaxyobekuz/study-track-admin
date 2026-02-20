// Toast
import { toast } from "sonner";

// API
import { classesAPI } from "@/shared/api/classes.api";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

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
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button type="button" className="w-full xs:w-32" variant="neutral" onClick={close}>
        Bekor qilish
      </Button>

      <Button autoFocus className="w-full xs:w-32" variant="danger" disabled={isLoading}>
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteClassModal;
