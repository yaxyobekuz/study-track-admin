// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateTariff } from "../queries/finance.mutations";
import { financeQueries } from "../queries/finance.queries";

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

  // Yo'nalishlar katalogi — faqat FAOLLARI tanlanadi
  const { data: directionsData } = useQuery(
    financeQueries.directionList({ status: "active" }),
  );
  const directionOptions = (directionsData?.items ?? []).map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const { name, description, directionId, isActive, setField } = useObjectState({
    name: tariff?.name ?? "",
    description: tariff?.description ?? "",
    directionId: tariff?.directionId ?? "",
    isActive: tariff?.isActive ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tariff) return;

    setIsLoading(true);

    updateTariff(
      // ⚠️ `directionId: ""` — yo'nalishni OLIB TASHLASH. `undefined`
      // bo'lsa server maydonga umuman tegmasdi.
      { id: tariff.id, data: { name, description, directionId, isActive } },
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

      {/* YO'NALISH — tarif ustidagi daraja. Ixtiyoriy: biriktirilmagan
          tarif hisobotda o'z nomi bilan turadi. */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Yo'nalish (ixtiyoriy)</p>
        <Select
          value={directionId}
          placeholder="Tanlanmagan"
          options={directionOptions}
          onChange={(v) => setField("directionId", v)}
        />
        <p className="text-xs text-gray-400">
          Hisobotda tariflar shu yo'nalish ostida guruhlanadi — masalan
          "Bog'cha (to'liq kun)" va "Bog'cha (yarim kun)" bitta "Bog'cha"
          qatoriga qo'shiladi.
        </p>
      </div>

      <InputField
        name="description"
        value={description}
        label="Tavsif"
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("description", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Holat</p>
        <Select
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
