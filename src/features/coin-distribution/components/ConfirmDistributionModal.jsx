// Toast
import { toast } from "sonner";

// Hooks
import { useDistributeCoins } from "../queries/coin-distribution.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const ConfirmDistributionModal = () => (
  <ResponsiveModal
    title="Tanga tarqatish"
    name="confirmDistribution"
    description="Haqiqatdan ham amalani bajarmoqchimisiz?"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  action,
  amount,
  reason,
  onSuccess,
  isLoading,
  filterType,
  filterValue,
  setIsLoading,
}) => {
  const { mutate: distributeCoins } = useDistributeCoins();

  const actionLabel = action === "give" ? "beriladi" : "olinadi";

  const handleConfirm = (e) => {
    e.preventDefault();
    setIsLoading(true);

    distributeCoins(
      { action, amount, reason, filterType, filterValue },
      {
        onSuccess: (res) => {
          const { data } = res;
          let message = `${data.successCount} ta foydalanuvchiga tanga ${actionLabel}`;
          if (data.skippedCount > 0) {
            message += `. ${data.skippedCount} ta o'tkazib yuborildi (balans yetarli emas)`;
          }
          toast.success(message);
          close();
          onSuccess?.();
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      }
    );
  };

  return (
    <form
      onSubmit={handleConfirm}
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

      <Button autoFocus disabled={isLoading} className="w-full xs:w-32">
        Tasdiqlash
        {isLoading && "..."}
      </Button>
    </form>
  );
};

export default ConfirmDistributionModal;
