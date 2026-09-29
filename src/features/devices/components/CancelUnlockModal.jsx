// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { X } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Tokens & queries
import { SURFACE, T } from "../data/guard.tokens";
import { useCancelUnlock } from "../queries/devices.mutations";

/**
 * VAQTINCHALIK RUXSATNI BEKOR QILISH.
 *
 * ⚠️ SABAB MAJBURIY (server ham talab qiladi). Chekovni qaytargan qaror
 * ham, yumshatgan qaror ham sababsiz qolmasligi kerak: keyin "nega bu
 * bolada ruxsat kesildi" degan savolga javob bo'lishi shart.
 *
 * ⚠️ O'CHIRILMAYDI — BEKOR QILINADI: yozuv registrda "bekor qilingan"
 * bo'lib qoladi va tarixdan yo'qolmaydi.
 */
const CancelUnlockModal = () => (
  <ResponsiveModal
    name="cancelDeviceUnlock"
    title="Ruxsatni bekor qilish"
    description="Cheklov darhol qaytadi va telefonga bildirishnoma boradi."
  >
    <CancelForm />
  </ResponsiveModal>
);

const CancelForm = ({ close, setIsLoading, unlock }) => {
  const [reason, setReason] = useState("");
  const { mutate: cancelUnlock } = useCancelUnlock();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Bekor qilish sababi majburiy");

    setIsLoading(true);
    cancelUnlock(
      { id: unlock.id, reason: reason.trim() },
      {
        onSuccess: () => {
          close();
          toast.success("Ruxsat bekor qilindi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Bekor qilinmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={cn(SURFACE.inset, "px-3.5 py-2.5")}>
        <p className={T.tdName}>
          {unlock?.student
            ? `${unlock.student.firstName} ${unlock.student.lastName || ""}`.trim()
            : "O'quvchi"}
        </p>
        <p className={cn(T.hint, "mt-0.5")}>
          {unlock?.kind === "full"
            ? "Butun cheklov to'xtatilgan"
            : `${unlock?.app?.name || "Ilova"} · +${unlock?.extraMinutes} daqiqa`}
          {unlock?.endsAt && ` · ${formatDateTimeUz(unlock.endsAt)} gacha`}
        </p>
        {unlock?.reason && (
          <p className={cn(T.hint, "mt-0.5")}>Berilish sababi: {unlock.reason}</p>
        )}
      </div>

      <div>
        <p className={cn(T.label, "mb-1.5")}>Bekor qilish sababi *</p>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Masalan: adashib berilgan"
          maxLength={300}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Yopish
        </Button>
        <Button type="submit" variant="destructive" className="flex-1">
          <X className="size-4" />
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default CancelUnlockModal;
