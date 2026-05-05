// Toast
import { toast } from "sonner";

// Hooks
import useModal from "@/shared/hooks/useModal";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

const DeletePenaltyModal = ({ onSuccess } = {}) => (
  <ResponsiveModal name="deletePenalty" title="Jarimani o'chirish">
    <Content onSuccess={onSuccess} />
  </ResponsiveModal>
);

const Content = ({ _id, onSuccess } = {}) => {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => penaltiesAPI.delete(_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "list"] });
      toast.success("Jarima o'chirildi");
      closeModal("deletePenalty");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

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

        <Button
          variant="danger"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
        </Button>
      </div>
    </div>
  );
};

export default DeletePenaltyModal;
