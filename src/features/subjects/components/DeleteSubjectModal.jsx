// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useDeleteSubject } from "@/features/subjects/queries/subjects.mutations";

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
  const { mutate: deleteSubject } = useDeleteSubject();

  const handleDeleteSubject = (e) => {
    e.preventDefault();
    setIsLoading(true);

    deleteSubject(subject.id, {
      onSuccess: () => {
        close();
        toast.success("Fan o'chirildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form
      onSubmit={handleDeleteSubject}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button type="button" className="w-full xs:w-32" variant="secondary" onClick={close}>
        Bekor qilish
      </Button>

      <Button autoFocus className="w-full xs:w-32" variant="danger" disabled={isLoading}>
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteSubjectModal;
