// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteRole } from "@/features/roles/queries/roles.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const DeleteRoleModal = () => (
  <ResponsiveModal
    name="deleteRole"
    title="Rolni o'chirish"
    description="Haqiqatdan ham rolni o'chirmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...role }) => {
  const { mutate: deleteRole } = useDeleteRole();

  const hasUsers = role.usersCount > 0;

  const handleDeleteRole = (e) => {
    e.preventDefault();
    setIsLoading(true);

    deleteRole(role.id, {
      onSuccess: () => {
        close();
        toast.success("Rol o'chirildi");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      },
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div>
      {hasUsers && (
        <p className="text-sm text-amber-600 mb-4">
          Bu rolni o'chirib bo'lmaydi, chunki {role.usersCount} ta foydalanuvchi
          mavjud.
        </p>
      )}

      <form
        onSubmit={handleDeleteRole}
        className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
      >
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="secondary"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          variant="danger"
          className="w-full xs:w-32"
          disabled={isLoading || hasUsers}
        >
          O'chirish
          {isLoading && "..."}
        </Button>
      </form>
    </div>
  );
};

export default DeleteRoleModal;
