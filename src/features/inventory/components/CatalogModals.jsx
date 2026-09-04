// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { LOCATION_TYPES, UNIT_SUGGESTIONS } from "../data/inventory.data";
import { inventoryQueries } from "../queries/inventory.queries";
import {
  useCreateCategory,
  useUpdateCategory,
  useCreateItem,
  useUpdateItem,
  useCreateLocation,
  useUpdateLocation,
} from "../queries/inventory.mutations";
import { usersQueries } from "@/features/users/queries/users.queries";
import { classesQueries } from "@/features/classes/queries/classes.queries";

/** Xato xabarini bir xil ko'rsatish — uch modalda takrorlanmasin. */
const showError = (err) =>
  toast.error(err.response?.data?.message || "Xatolik yuz berdi");

// ─────────────────────────────────────────────
// Toifa
// ─────────────────────────────────────────────

export const CategoryModal = () => (
  <ResponsiveModal name="inventoryCategory" title="Jihoz toifasi">
    <CategoryForm />
  </ResponsiveModal>
);

const CategoryForm = ({ close, isLoading, setIsLoading, category }) => {
  const { mutate: create } = useCreateCategory();
  const { mutate: update } = useUpdateCategory();

  const { name, sortOrder, setField } = useObjectState({
    name: category?.name ?? "",
    sortOrder: category?.sortOrder ?? 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { name, sortOrder: Number(sortOrder) || 0 };
    const handlers = {
      onSuccess: () => {
        close();
        toast.success(category ? "Toifa yangilandi" : "Toifa qo'shildi");
      },
      onError: showError,
      onSettled: () => setIsLoading(false),
    };

    if (category) update({ id: category.id, data: payload }, handlers);
    else create(payload, handlers);
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <InputField
        required
        name="name"
        label="Toifa nomi"
        value={name}
        placeholder="Mebel / Oshxona buyumlari"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        type="number"
        name="sortOrder"
        label="Tartib raqami"
        value={sortOrder}
        description="Kichik raqam yuqorida turadi"
        onChange={(e) => setField("sortOrder", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {category ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Jihoz turi
// ─────────────────────────────────────────────

export const ItemModal = () => (
  <ResponsiveModal name="inventoryItem" title="Jihoz turi">
    <ItemForm />
  </ResponsiveModal>
);

const ItemForm = ({ close, isLoading, setIsLoading, item }) => {
  const { data: categoriesData } = useQuery(inventoryQueries.categories({ status: "active" }));
  const categories = categoriesData?.items ?? [];

  const { mutate: create } = useCreateItem();
  const { mutate: update } = useUpdateItem();

  const { categoryId, name, unit, unitPrice, description, setField } = useObjectState({
    categoryId: item?.categoryId ?? "",
    name: item?.name ?? "",
    unit: item?.unit ?? "dona",
    unitPrice: item?.unitPrice ?? "",
    description: item?.description ?? "",
  });

  // Bitta toifa bo'lsa tanlash shart emas — kiritish ishini qisqartiradi
  const resolvedCategory = categoryId || (categories.length === 1 ? categories[0].id : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      categoryId: resolvedCategory,
      name,
      unit,
      unitPrice: unitPrice === "" ? 0 : unitPrice,
      description,
    };

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(item ? "Jihoz yangilandi" : "Jihoz qo'shildi");
      },
      onError: showError,
      onSettled: () => setIsLoading(false),
    };

    if (item) update({ id: item.id, data: payload }, handlers);
    else create(payload, handlers);
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      {categories.length === 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Faol toifa yo'q — avval "Toifalar" tabida toifa qo'shing.
        </p>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Toifa</p>
        <Select
          value={resolvedCategory}
          placeholder="Toifani tanlang"
          onChange={(v) => setField("categoryId", v)}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />
      </div>

      <InputField
        required
        name="name"
        label="Jihoz nomi"
        value={name}
        placeholder="Parta / Piyola / Proyektor"
        onChange={(e) => setField("name", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">O'lchov birligi</p>
        <Select
          value={unit}
          onChange={(v) => setField("unit", v)}
          options={UNIT_SUGGESTIONS.map((u) => ({ label: u, value: u }))}
        />
      </div>

      <InputField
        min="0"
        type="number"
        name="unitPrice"
        label="Bittasining narxi"
        value={unitPrice}
        placeholder="150000"
        description={
          unitPrice
            ? `${formatMoney(unitPrice)} — zarar shu narxda hisoblanadi va hodisaga muhrlanadi`
            : "Zarar summasi shu narxdan hisoblanadi. Nol qonuniy: qiymatsiz buyum uchun pul undirilmaydi."
        }
        onChange={(e) => setField("unitPrice", e.target.value)}
      />

      <InputField
        name="description"
        label="Izoh (ixtiyoriy)"
        value={description}
        onChange={(e) => setField("description", e.target.value)}
      />

      <Button
        type="submit"
        disabled={isLoading || !name.trim() || !resolvedCategory}
      >
        {item ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Xona
// ─────────────────────────────────────────────

export const LocationModal = () => (
  <ResponsiveModal name="inventoryLocation" title="Xona">
    <LocationForm />
  </ResponsiveModal>
);

const LocationForm = ({ close, isLoading, setIsLoading, location }) => {
  const { mutate: create } = useCreateLocation();
  const { mutate: update } = useUpdateLocation();

  // Mas'ul — XODIM bo'lishi shart (o'quvchiga hisobot mas'uliyati
  // yuklanmaydi, server ham buni rad etadi). `allShort` barcha
  // foydalanuvchini beradi, rol bo'yicha filtr mijozda — bu ro'yxatning
  // hujjatlashtirilgan ishlatilish usuli.
  const { data: allUsers = [] } = useQuery(usersQueries.allShort());
  const { data: classes = [] } = useQuery(classesQueries.list());

  const staff = allUsers.filter((u) => u.role !== "student");

  const { name, type, classId, responsibleId, note, sortOrder, setField } = useObjectState({
    name: location?.name ?? "",
    type: location?.type ?? "classroom",
    classId: location?.classId ?? "",
    responsibleId: location?.responsibleId ?? "",
    note: location?.note ?? "",
    sortOrder: location?.sortOrder ?? 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      type,
      classId: classId || null,
      responsibleId: responsibleId || null,
      note,
      sortOrder: Number(sortOrder) || 0,
    };

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(location ? "Xona yangilandi" : "Xona qo'shildi");
      },
      onError: showError,
      onSettled: () => setIsLoading(false),
    };

    if (location) update({ id: location.id, data: payload }, handlers);
    else create(payload, handlers);
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <InputField
        required
        name="name"
        label="Xona nomi"
        value={name}
        placeholder="1-A sinf xonasi"
        onChange={(e) => setField("name", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Turi</p>
        <Select
          value={type}
          onChange={(v) => setField("type", v)}
          options={LOCATION_TYPES.map((t) => ({ label: t.label, value: t.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Sinf (ixtiyoriy)</p>
        <Select
          value={classId}
          placeholder="Tanlanmagan"
          onChange={(v) => setField("classId", v)}
          options={[
            { label: "Tanlanmagan", value: "" },
            ...classes.map((c) => ({ label: c.name, value: c.id })),
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Mas'ul xodim</p>
        <Select
          value={responsibleId}
          placeholder="Tanlanmagan"
          onChange={(v) => setField("responsibleId", v)}
          options={[
            { label: "Tanlanmagan", value: "" },
            ...staff.map((s) => ({
              label: `${s.firstName} ${s.lastName ?? ""}`.trim(),
              value: s.id,
            })),
          ]}
        />
        <p className="text-xs text-gray-500">
          Kunlik hisobotni shu xodim yuboradi. Mas'ullik — hisobot berishga
          tegishli; zarar aniq odamga alohida yoziladi.
        </p>
      </div>

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {location ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};
