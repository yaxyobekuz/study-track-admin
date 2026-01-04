// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/api/client";

// Components
import Button from "../form/button";
import ResponsiveModal from "../ResponsiveModal";

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
  const handleDeleteUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    usersAPI
      .delete(user._id)
      .then(() => {
        close();
        invalidateCache("users");
        toast.success("Foydalanuvchi o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleDeleteUser} className="flex justify-end gap-5 w-full">
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

export default DeleteUserModal;
