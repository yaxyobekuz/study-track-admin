// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useAddTariffVersion } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
  nextMonthKey,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

/**
 * Narxni o'zgartirish = yangi versiya qo'shish.
 *
 * Standart holat: keyingi oydan boshlanadi va eski (ochiq) versiya avtomatik
 * shu oydan oldingi oyda yopiladi — server buni bitta tranzaksiyada bajaradi.
 * O'quvchilarning biriktirishlariga tegilmaydi: ular narxni saqlamaydi.
 */
const AddTariffVersionModal = () => (
  <ResponsiveModal name="addTariffVersion" title="Narxni o'zgartirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, tariff }) => {
  const { mutate: addVersion } = useAddTariffVersion();

  const { startMonth, monthlyAmount, note, setField } = useObjectState({
    startMonth: monthKeyToInputValue(nextMonthKey(currentMonthKey())),
    monthlyAmount: "",
    note: "",
  });

  const startMonthKey = inputValueToMonthKey(startMonth);
  const current = tariff?.currentVersion;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tariff) return;

    setIsLoading(true);

    addVersion(
      {
        id: tariff.id,
        data: {
          startMonth: startMonthKey,
          monthlyAmount: String(monthlyAmount),
          note,
          // Ochiq versiyani avtomatik yopish — odatdagi ssenariy
          autoCloseCurrent: true,
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Yangi narx qo'shildi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {current && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">Joriy narx</p>
          <p className="font-medium text-gray-900">
            {formatMoney(current.monthlyAmount)}
          </p>
        </div>
      )}

      <InputField
        required
        type="month"
        name="startMonth"
        label="Yangi narx qaysi oydan"
        value={startMonth}
        onChange={(e) => setField("startMonth", e.target.value)}
      />

      <InputField
        required
        min="0"
        step="0.01"
        type="number"
        name="monthlyAmount"
        label="Yangi oylik summa (so'm)"
        value={monthlyAmount}
        placeholder="600000"
        onChange={(e) => setField("monthlyAmount", e.target.value)}
      />

      <InputField
        name="note"
        value={note}
        label="Izoh"
        placeholder="Masalan: 2026 yil uchun ko'tarildi"
        onChange={(e) => setField("note", e.target.value)}
      />

      {startMonthKey && (
        <p className="text-xs text-gray-500">
          {current
            ? `Joriy narx ${formatMonthKey(prevMonthKey(startMonthKey))} oyida yopiladi. `
            : ""}
          Yangi narx {formatMonthKey(startMonthKey)} oyidan boshlab barcha
          biriktirilgan o'quvchilarga avtomatik qo'llanadi.
        </p>
      )}

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
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default AddTariffVersionModal;
