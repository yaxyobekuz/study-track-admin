// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import { useDeleteUser } from "@/features/users/queries/users.mutations";

const DeleteUserModal = () => (
  <ResponsiveModal
    name="deleteUser"
    title="Foydalanuvchini o'chirish"
    description="Haqiqatdan ham foydalanuvchini o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: deleteUser } = useDeleteUser();

  const handleDeleteUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    deleteUser(user.id, {
      onSuccess: () => {
        close();
        toast.success("Foydalanuvchi o'chirildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form
      onSubmit={handleDeleteUser}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
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
        O'chirish
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default DeleteUserModal;
