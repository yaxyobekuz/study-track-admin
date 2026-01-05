// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/api/client";

// Components
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

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
  const { invalidateCache } = useArrayStore("users");

  const handleDeleteUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .delete(user._id)
      .then(() => {
        close();
        invalidateCache();
        toast.success("Foydalanuvchi o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form
      onSubmit={handleDeleteUser}
      className="flex flex-col-reverse gap-3.5 w-full xs:m-0 xs:flex-row xs:justify-end"
    >
      <Button
        type="button"
        onClick={close}
        variant="neutral"
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
