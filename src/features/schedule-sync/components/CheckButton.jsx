// Toast
import { toast } from "sonner";

// Icons
import { RefreshCw } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";

// Queries & helpers
import { useCheckSheet } from "../queries/scheduleSync.mutations";
import { errorMessage } from "../helpers/scheduleSync.helpers";

/**
 * "Tekshirish" — sheet'ni hozir o'qiydi. Jadvalga TEGMAYDI: natija yangi
 * "o'qilgan holat" bo'lib, ko'rib chiqishga tushadi.
 *
 * Ruxsat: `review` YOKI `source` (server bilan bir xil). Havola
 * sozlanmagan bo'lsa tugma yopiq — so'rov baribir rad etilardi.
 *
 * @param {object} props
 * @param {object} props.status - `Status`
 * @param {() => void} [props.onCreated] - yangi o'zgarish topilganda "Ko'rish"
 */
const CheckButton = ({ status, onCreated, ...props }) => {
  const { mutate: check, isPending } = useCheckSheet();

  if (!status?.can?.review && !status?.can?.source) return null;

  const isConfigured = Boolean(status.sheetUrl && status.sheetTab);

  const handleCheck = () =>
    check(undefined, {
      onSuccess: (data) => {
        if (data?.created) {
          toast.success("Sheet'da yangi o'zgarish topildi", {
            action: onCreated ? { label: "Ko'rish", onClick: onCreated } : undefined,
          });
        } else {
          toast.success("Sheet'da yangi o'zgarish yo'q");
        }
      },
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <Button
      variant="outline"
      disabled={!isConfigured || isPending}
      title={isConfigured ? undefined : "Avval sheet havolasini sozlang"}
      onClick={handleCheck}
      {...props}
    >
      <RefreshCw
        className={cn("size-4", isPending && "animate-spin")}
        strokeWidth={1.5}
      />
      Tekshirish{isPending && "..."}
    </Button>
  );
};

export default CheckButton;
