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
 * Narx qo'shish / o'zgartirish = yangi versiya.
 *
 * Ikki ssenariy bir xil forma bilan hal bo'ladi:
 *  - narxni ko'tarish (keyingi oydan) — eski ochiq versiya avtomatik yopiladi;
 *  - o'tgan davr narxini kiritish — tugash oyi berilmasa, server uni keyingi
 *    versiya boshlanishidan bir oy oldin qilib hisoblaydi.
 *
 * O'quvchilarning biriktirishlariga tegilmaydi: ular narxni saqlamaydi.
 */
const AddTariffVersionModal = () => (
  <ResponsiveModal name="addTariffVersion" title="Narx qo'shish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, tariff }) => {
  const { mutate: addVersion } = useAddTariffVersion();

  const { startMonth, endMonth, monthlyAmount, setField } = useObjectState({
    startMonth: monthKeyToInputValue(nextMonthKey(currentMonthKey())),
    // Bo'sh = keyingi versiyagacha (yoki muddatsiz)
    endMonth: "",
    monthlyAmount: "",
  });

  const startMonthKey = inputValueToMonthKey(startMonth);
  const now = currentMonthKey();
  const current = tariff?.currentVersion;

  // Boshlanish oyi joriy oydan oldin bo'lsa — o'tgan davr narxi kiritilyapti
  const isBackfill = startMonthKey != null && startMonthKey < now;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tariff) return;

    setIsLoading(true);

    addVersion(
      {
        id: tariff.id,
        data: {
          startMonth: startMonthKey,
          endMonth: inputValueToMonthKey(endMonth),
          monthlyAmount: String(monthlyAmount),
        },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Narx qo'shildi");
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

      <div className="grid grid-cols-2 gap-3">
        <InputField
          required
          type="month"
          name="startMonth"
          label="Qaysi oydan"
          value={startMonth}
          onChange={(e) => setField("startMonth", e.target.value)}
        />

        <InputField
          type="month"
          name="endMonth"
          label="Qaysi oygacha"
          value={endMonth}
          onChange={(e) => setField("endMonth", e.target.value)}
        />
      </div>

      <InputField
        required
        min="0"
        step="0.01"
        type="number"
        name="monthlyAmount"
        label="Oylik summa (so'm)"
        value={monthlyAmount}
        placeholder="600000"
        onChange={(e) => setField("monthlyAmount", e.target.value)}
      />

      {startMonthKey && (
        <p className="text-xs text-gray-500">
          {isBackfill ? (
            <>
              O'tgan davr narxi kiritilyapti. "Qaysi oygacha" bo'sh qolsa,
              keyingi narx boshlanishidan bir oy oldin avtomatik yopiladi.
            </>
          ) : (
            <>
              {current
                ? `Joriy narx ${formatMonthKey(prevMonthKey(startMonthKey))} oyida yopiladi. `
                : ""}
              Yangi narx {formatMonthKey(startMonthKey)} oyidan boshlab
              biriktirilgan barcha o'quvchilarga avtomatik qo'llanadi.
            </>
          )}
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
