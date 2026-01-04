// Toast
import { toast } from "sonner";

// API
import { subjectsAPI } from "@/api/client";

// Components
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

const DeleteSubjectModal = () => (
  <ResponsiveModal
    name="deleteSubject"
    title="Fanni o'chirish"
    description="Haqiqatdan ham fanni o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...subject }) => {
  const { invalidateCache } = useArrayStore("subjects");

  const handleDeleteSubject = (e) => {
    e.preventDefault();
    setIsLoading(true);

    subjectsAPI
      .delete(subject._id)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Fan o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleDeleteSubject}
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

export default DeleteSubjectModal;
