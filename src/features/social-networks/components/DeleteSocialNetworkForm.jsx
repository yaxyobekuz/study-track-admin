// Toast
import { toast } from "sonner";

// Hooks
import { useDeleteSocialNetwork } from "../queries/social-networks.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteSocialNetworkForm = ({
  close,
  isLoading,
  setIsLoading,
  ...socialNetwork
}) => {
  const { mutate: deleteSocialNetwork } = useDeleteSocialNetwork();

  const handleDelete = () => {
    setIsLoading(true);

    deleteSocialNetwork(socialNetwork.id, {
      onSuccess: () => {
        close();
        toast.success("Ijtimoiy tarmoq o'chirildi");
      },
      onError: () => toast.error("O'chirishda xatolik"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="flex justify-end gap-4">
      <Button variant="secondary" onClick={close}>
        Bekor qilish
      </Button>

      <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
        O'chirish{isLoading && "..."}
      </Button>
    </div>
  );
};

export default DeleteSocialNetworkForm;
