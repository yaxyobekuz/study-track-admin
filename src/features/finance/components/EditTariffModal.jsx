// Toast
import { toast } from "sonner";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateTariff } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Tarifning o'zini tahrirlaydi — narxni EMAS.
 * Narx faqat yangi versiya orqali o'zgaradi (AddTariffVersionModal).
 */
const EditTariffModal = () => (
  <ResponsiveModal name="editTariff" title="Tarifni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, tariff }) => {
  const { mutate: updateTariff } = useUpdateTariff();

  const { name, description, isActive, setField } = useObjectState({
    name: tariff?.name ?? "",
    description: tariff?.description ?? "",
    isActive: tariff?.isActive ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tariff) return;

    setIsLoading(true);

    updateTariff(
      { id: tariff.id, data: { name, description, isActive } },
      {
        onSuccess: () => {
          close();
          toast.success("Tarif yangilandi");
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
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        name="description"
        value={description}
        label="Tavsif"
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("description", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Holat</p>
        <Select searchable
          value={isActive ? "true" : "false"}
          onChange={(v) => setField("isActive", v === "true")}
          options={[
            { label: "Faol", value: "true" },
            { label: "Nofaol", value: "false" },
          ]}
        />
        <p className="text-xs text-gray-500">
          Nofaol tarif yangi biriktirishlar ro'yxatida ko'rinmaydi
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
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default EditTariffModal;
