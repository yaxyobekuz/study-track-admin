// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import usePermissions from "@/shared/hooks/usePermissions";
import { useUpdateTariffVersion } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import {
  currentMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

/**
 * Mavjud narx versiyasini tahrirlash.
 *
 * Hali boshlanmagan versiya erkin tahrirlanadi. Amaldagi yoki o'tgan
 * versiyani o'zgartirish esa allaqachon hisoblangan oylarga ta'sir qiladi,
 * shuning uchun u `force` bilan yuboriladi: alohida `tariflar.adjust`
 * ruxsatini talab qiladi va server logga yozadi.
 */
const EditTariffVersionModal = () => (
  <ResponsiveModal name="editTariffVersion" title="Narxni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, tariffId, version }) => {
  const { can } = usePermissions();
  const { mutate: updateVersion } = useUpdateTariffVersion();

  const { startMonth, endMonth, monthlyAmount, setField } = useObjectState({
    startMonth: monthKeyToInputValue(version?.startMonth),
    endMonth: monthKeyToInputValue(version?.endMonth),
    monthlyAmount: version?.monthlyAmount ?? "",
  });

  const now = currentMonthKey();
  const isInEffect = version != null && version.startMonth <= now;
  const canAdjust = can("tariffs.adjust");
  const blocked = isInEffect && !canAdjust;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!version) return;

    setIsLoading(true);

    updateVersion(
      {
        id: tariffId,
        versionId: version.id,
        force: isInEffect,
        data: {
          startMonth: inputValueToMonthKey(startMonth),
          endMonth: inputValueToMonthKey(endMonth),
          monthlyAmount: String(monthlyAmount),
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Narx yangilandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {isInEffect && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <p>
            {blocked
              ? "Amaldagi yoki o'tgan narxni to'g'rilash uchun sizda ruxsat yo'q."
              : "Bu narx allaqachon amalda. O'zgartirish o'tgan oylar hisob-kitobiga ta'sir qiladi va jurnalga yoziladi."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <InputField
          required
          type="month"
          name="startMonth"
          label="Qaysi oydan"
          value={startMonth}
          disabled={blocked}
          onChange={(e) => setField("startMonth", e.target.value)}
        />

        <InputField
          type="month"
          name="endMonth"
          label="Qaysi oygacha"
          value={endMonth}
          disabled={blocked}
          onChange={(e) => setField("endMonth", e.target.value)}
        />
      </div>

      <InputField
        required
        min="0"
        step="0.01"
        type="amount"
        name="monthlyAmount"
        label="Oylik summa (so'm)"
        value={monthlyAmount}
        disabled={blocked}
        onChange={(e) => setField("monthlyAmount", e.target.value)}
      />

      <p className="text-xs text-gray-500">
        "Qaysi oygacha" bo'sh qolsa, narx muddatsiz — keyingi narx qo'shilguncha
        amal qiladi.
      </p>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          disabled={isLoading || blocked}
        >
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default EditTariffVersionModal;
