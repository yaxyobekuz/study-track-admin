// Toast
import { toast } from "sonner";

// API
import { rolesAPI } from "@/features/roles/api/roles.api";

// Components
import Button from "@/shared/components/form/button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

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
  const { invalidateCache } = useArrayStore("roles");

  const hasUsers = role.usersCount > 0;

  const handleDeleteRole = (e) => {
    e.preventDefault();
    setIsLoading(true);

    rolesAPI
      .delete(role._id)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Rol o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div>
      {hasUsers && (
        <p className="text-sm text-amber-600 mb-4">
          Bu rolni o'chirib bo'lmaydi, chunki {role.usersCount} ta
          foydalanuvchi mavjud.
        </p>
      )}

      <form
        onSubmit={handleDeleteRole}
        className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
      >
        <Button
          type="button"
          className="w-full xs:w-32"
          variant="neutral"
          onClick={close}
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          variant="danger"
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
