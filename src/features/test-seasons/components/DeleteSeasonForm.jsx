// Toast
import { toast } from "sonner";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Components
import Button from "@/shared/components/ui/button/Button";

const DeleteSeasonForm = ({
  onSuccess,
  close,
  isLoading,
  setIsLoading,
  ...season
}) => {
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await testSeasonsAPI.delete(season._id);
      onSuccess();
      toast.success("Mavsum o'chirildi");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Diqqat: mavsumda testlar mavjud bo'lsa, u o'chmaydi, faqat "Yopilgan"
        holatga o'tadi.
      </p>
      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={close}>
          Bekor qilish
        </Button>

        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          O'chirish{isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

export default DeleteSeasonForm;
