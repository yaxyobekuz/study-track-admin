// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateBranch } from "@/features/branches/queries/branches.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const EditBranchModal = () => (
  <ResponsiveModal name="editBranch" title="Filialni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...branch }) => {
  const { mutate: updateBranch } = useUpdateBranch();

  const { name, shortName, address, phone, sortOrder, isActive, setFields, setField } =
    useObjectState({
      name: "",
      shortName: "",
      address: "",
      phone: "",
      sortOrder: 0,
      isActive: true,
    });

  useEffect(() => {
    if (!branch?.id) return;
    setFields({
      name: branch.name ?? "",
      shortName: branch.shortName ?? "",
      address: branch.address ?? "",
      phone: branch.phone ?? "",
      sortOrder: branch.sortOrder ?? 0,
      isActive: branch.isActive ?? true,
    });
  }, [branch?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updateBranch(
      {
        id: branch.id,
        data: { name, shortName, address, phone, sortOrder: Number(sortOrder) || 0, isActive },
      },
      {
        onSuccess: () => {
          close();
          toast.success("Filial yangilandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Kod va baza nomi O'ZGARMAYDI — baza schema'si shu koddan hosil
          qilingan, qayta nomlash esa migratsiya emas, ma'lumot yo'qotish. */}
      <div className="rounded-xl bg-gray-50 px-3.5 py-3 text-sm">
        <p className="text-gray-500">Filial kodi (o'zgarmaydi)</p>
        <p className="font-medium">{branch.code}</p>
        <p className="mt-1 text-xs text-gray-400">Baza: {branch.schemaName}</p>
      </div>

      <InputField
        required
        name="name"
        value={name}
        maxLength={80}
        label="Filial nomi"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        name="shortName"
        value={shortName}
        maxLength={32}
        label="Qisqa nomi"
        onChange={(e) => setField("shortName", e.target.value)}
      />

      <InputField
        name="address"
        value={address}
        maxLength={200}
        label="Manzil"
        onChange={(e) => setField("address", e.target.value)}
      />

      <InputField
        name="phone"
        value={phone}
        maxLength={32}
        label="Telefon"
        onChange={(e) => setField("phone", e.target.value)}
      />

      <InputField
        type="number"
        name="sortOrder"
        value={sortOrder}
        label="Tartib raqami"
        description="Ro'yxatda qaysi o'rinda turishi"
        onChange={(e) => setField("sortOrder", e.target.value)}
      />

      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-3">
        <div>
          <p className="text-sm font-medium">Filial ochiq</p>
          <p className="text-xs text-gray-500">
            O'chirilsa xodimlar tizimga kira olmaydi, lekin hisob-faktura va
            davomat ishlashda davom etadi
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onChange={(value) => setField("isActive", value)}
        />
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
    </form>
  );
};

export default EditBranchModal;
