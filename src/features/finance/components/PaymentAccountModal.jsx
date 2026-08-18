// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateAccount, useUpdateAccount } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * To'lov turi qo'shish yoki tahrirlash.
 *
 * Bitta oyna, chunki maydonlar bir xil: `account` berilsa tahrirlash,
 * berilmasa yaratish.
 *
 * Boshlang'ich qoldiq — TIZIMGA O'TISH paytidagi holat, harakat emas,
 * shuning uchun daftarga yozuv qo'shmaydi. Birinchi harakatdan keyin
 * uni o'zgartirib bo'lmaydi (server rad etadi): butun daftarni qayta
 * hisoblashga majbur qilardi. Farqni to'g'rilash uchun alohida amal bor.
 */
const PaymentAccountModal = () => (
  <ResponsiveModal name="paymentAccount" title="To'lov turi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, account }) => {
  const isEdit = Boolean(account?.id);
  // Harakatlar boshlangan bo'lsa boshlang'ich qoldiq qulflanadi
  const isOpeningLocked = isEdit && account.hasEntries;

  const { mutate: createAccount } = useCreateAccount();
  const { mutate: updateAccount } = useUpdateAccount();

  const { name, openingBalance, isActive, setField } =
    useObjectState({
      name: account?.name ?? "",
      openingBalance: account?.openingBalance ?? "0",
      isActive: account?.isActive ?? true,
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      isActive,
      ...(isOpeningLocked ? {} : { openingBalance: String(openingBalance) }),
    };

    const onSuccess = () => {
      close();
      toast.success(isEdit ? "To'lov turi yangilandi" : "To'lov turi qo'shildi");
    };
    const onError = (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    const onSettled = () => setIsLoading(false);

    if (isEdit) {
      updateAccount({ id: account.id, data: payload }, { onSuccess, onError, onSettled });
    } else {
      createAccount(payload, { onSuccess, onError, onSettled });
    }
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        autoFocus
        name="name"
        label="Nomi"
        value={name}
        placeholder="Naqd"
        onChange={(e) => setField("name", e.target.value)}
      />

      {!isOpeningLocked && (
        <InputField
          min="0"
          step="0.01"
          type="number"
          name="openingBalance"
          label="Boshlang'ich qoldiq (so'm)"
          value={openingBalance}
          onChange={(e) => setField("openingBalance", e.target.value)}
        />
      )}

      {isOpeningLocked && (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          Bu tur bo'yicha harakatlar boshlangan — boshlang'ich qoldiqni
          o'zgartirib bo'lmaydi. Farq bo'lsa "To'g'rilash" amalidan
          foydalaning.
        </p>
      )}

      <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl bg-gray-50 p-3">
        <span className="text-sm">
          <span className="font-medium text-gray-900">Faol</span>
          <span className="block text-xs text-gray-500">
            Nofaol hisob to'lov qabul qilishda tanlanmaydi
          </span>
        </span>
        <Switch checked={isActive} onChange={(v) => setField("isActive", v)} />
      </label>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default PaymentAccountModal;
