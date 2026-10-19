// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Mutations
import { useCancelCertificatePlan } from "../queries/certificates.mutations";

/**
 * REJANI BEKOR QILISH.
 *
 * ⚠️ O'CHIRILMAYDI — BEKOR QILINADI va SABAB MAJBURIY (loyihaning umumiy
 * doktrinasi). Qator registrda qoladi: "nega bu o'quvchi ro'yxatdan
 * chiqdi" degan savolga javob tarixda turishi kerak.
 *
 * `openModal("cancelCertificatePlan", { plan })`
 */
const CancelCertificatePlanModal = () => (
  <ResponsiveModal
    name="cancelCertificatePlan"
    title="Rejani bekor qilish"
    description="Qator o'chirilmaydi — sababi bilan registrda qoladi"
    className="max-w-md"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, plan = null }) => {
  const [reason, setReason] = useState("");
  const { mutateAsync: cancelPlan } = useCancelCertificatePlan();

  const submit = async (event) => {
    event.preventDefault();

    const clean = reason.trim();
    if (!clean) return toast.error("Bekor qilish sababini yozing");

    setIsLoading(true);
    try {
      await cancelPlan({ id: plan.id, reason: clean });
      toast.success("Reja bekor qilindi");
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bekor qilib bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm">
        <p className="font-medium text-gray-900">{plan?.student?.fullName}</p>
        <p className="mt-0.5 text-gray-500">
          {plan?.track?.name} · {plan?.dueDateLabel}
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reason" className="text-sm font-medium text-gray-700">
          Sabab <span className="text-red-500">*</span>
        </label>
        <Input
          id="reason"
          name="reason"
          type="textarea"
          value={reason}
          maxLength={300}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Masalan: o'quvchi fikridan qaytdi"
          className="min-h-20"
        />
      </div>

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" className="flex-1" onClick={close}>
          Yopish
        </Button>
        <Button type="submit" variant="destructive" className="flex-1" disabled={isLoading}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default CancelCertificatePlanModal;
