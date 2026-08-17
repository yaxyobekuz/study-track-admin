// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useCreateAccount, useUpdateAccount } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Data
import { ACCOUNT_TYPE_OPTIONS } from "../data/finance.data";

/**
 * To'lov hisobi (kassa) qo'shish yoki tahrirlash.
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
  <ResponsiveModal name="paymentAccount" title="To'lov hisobi">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, account }) => {
  const isEdit = Boolean(account?.id);
  // Harakatlar boshlangan bo'lsa boshlang'ich qoldiq qulflanadi
  const isOpeningLocked = isEdit && account.hasEntries;

  const { mutate: createAccount } = useCreateAccount();
  const { mutate: updateAccount } = useUpdateAccount();

  const { name, type, description, openingBalance, isActive, setField } =
    useObjectState({
      name: account?.name ?? "",
      type: account?.type ?? "cash",
      description: account?.description ?? "",
      openingBalance: account?.openingBalance ?? "0",
      isActive: account?.isActive ?? true,
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      type,
      description,
      isActive,
      ...(isOpeningLocked ? {} : { openingBalance: String(openingBalance) }),
    };

    const onSuccess = () => {
      close();
      toast.success(isEdit ? "Hisob yangilandi" : "Hisob qo'shildi");
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
        placeholder="Naqd kassa"
        onChange={(e) => setField("name", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Turi</p>
        <Select
          value={type}
          options={ACCOUNT_TYPE_OPTIONS}
          onChange={(v) => setField("type", v)}
        />
        <p className="text-xs text-gray-500">
          Hisobot "naqd / plastik / bank" kesimida shu bo'yicha guruhlanadi.
        </p>
      </div>

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
          Bu hisobda harakatlar boshlangan — boshlang'ich qoldiqni
          o'zgartirib bo'lmaydi. Farq bo'lsa "To'g'rilash" amalidan
          foydalaning.
        </p>
      )}

      <InputField
        name="description"
        label="Izoh"
        value={description}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("description", e.target.value)}
      />

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
