// Toast
import { toast } from "sonner";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useDeletePenalty } from "../queries/penalties.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const DeletePenaltyModal = ({ onSuccess } = {}) => (
  <ResponsiveModal name="deletePenalty" title="Jarimani o'chirish">
    <Content onSuccess={onSuccess} />
  </ResponsiveModal>
);

const Content = ({ id, onSuccess } = {}) => {
  const { closeModal } = useModal();
  const { mutate: deletePenalty, isPending } = useDeletePenalty();

  const handleDelete = () => {
    deletePenalty(id, {
      onSuccess: () => {
        toast.success("Jarima o'chirildi");
        closeModal("deletePenalty");
        onSuccess?.();
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Bu jarimani o'chirishni tasdiqlaysizmi? Agar jarima tasdiqlangan bo'lsa,
        foydalanuvchi ballari tiklanadi.
      </p>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => closeModal("deletePenalty")}>
          Bekor qilish
        </Button>

        <Button variant="danger" onClick={handleDelete} disabled={isPending}>
          {isPending ? "O'chirilmoqda..." : "O'chirish"}
        </Button>
      </div>
    </div>
  );
};

export default DeletePenaltyModal;
