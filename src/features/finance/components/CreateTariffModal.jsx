// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateTariff } from "../queries/finance.mutations";

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

const CreateTariffModal = () => (
  <ResponsiveModal name="createTariff" title="Yangi tarif">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { mutate: createTariff } = useCreateTariff();

  const { name, description, startMonth, monthlyAmount, setField } =
    useObjectState({
      name: "",
      description: "",
      // Birinchi narx odatda joriy oydan boshlanadi
      startMonth: monthKeyToInputValue(currentMonthKey()),
      monthlyAmount: "",
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createTariff(
      {
        name,
        description,
        // Narx bo'sh bo'lsa tarif narxsiz yaratiladi — bu qonuniy,
        // narxni keyin "Narxni o'zgartirish" orqali qo'shsa bo'ladi.
        initialVersion: monthlyAmount
          ? {
              startMonth: inputValueToMonthKey(startMonth),
              monthlyAmount: String(monthlyAmount),
            }
          : undefined,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Tarif yaratildi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        name="name"
        value={name}
        label="Tarif nomi"
        placeholder="Masalan: Standart 1-4 sinf"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        name="description"
        value={description}
        label="Tavsif"
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("description", e.target.value)}
      />

      {/* Birinchi narx */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700">Boshlang'ich narx</p>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            type="month"
            name="startMonth"
            label="Qaysi oydan"
            value={startMonth}
            onChange={(e) => setField("startMonth", e.target.value)}
          />

          <InputField
            min="0"
            step="0.01"
            type="amount"
            name="monthlyAmount"
            label="Oylik summa (so'm)"
            value={monthlyAmount}
            placeholder="450000"
            onChange={(e) => setField("monthlyAmount", e.target.value)}
          />
        </div>

        <p className="text-xs text-gray-500">
          Bo'sh qoldirsangiz, narxni keyinroq qo'shishingiz mumkin
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Yaratish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default CreateTariffModal;
