// React
import { useRef } from "react";

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
  useDeleteItem,
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
// Jihozni KATALOGDAN o'chirish
// ─────────────────────────────────────────────

/**
 * O'CHIRISH — ARXIVLASH EMAS.
 *
 * Arxivlash jihozni tanlagichlardan olib tashlaydi, lekin tarixni
 * saqlaydi: o'tgan zararlar, aktlar va hisobotlar unga ishora qilib
 * turaveradi. O'chirish esa KIRITISH XATOSI uchun — "Proyekter" deb xato
 * yozilgan, ikki marta kiritilgan, sinab ko'rilgan qator.
 *
 * ⚠️ Nima to'sib turgani tugmani bosishdan OLDIN o'qiladi (`itemUsage`):
 * to'siqni serverning xato xabari sifatida ko'rsatish kech bo'lardi va
 * xodim har safar boshqa sababni ko'rib chalkashardi (server hammasini
 * BITTA ro'yxatda qaytaradi — shuning uchun ular ham birga chiziladi).
 */
export const DeleteItemModal = () => (
  <ResponsiveModal name="inventoryDeleteItem" title="Jihozni o'chirish">
    <DeleteItemForm />
  </ResponsiveModal>
);

const DeleteItemForm = ({ close, isLoading, setIsLoading, item }) => {
  const { data: usage, isLoading: isChecking } = useQuery(
    inventoryQueries.itemUsage(item?.id),
  );
  const { mutate: deleteItem } = useDeleteItem();

  const handleDelete = (e) => {
    e.preventDefault();
    setIsLoading(true);

    deleteItem(item.id, {
      onSuccess: (result) => {
        close();
        toast.success(`"${result.name}" o'chirildi`);
      },
      onError: showError,
      onSettled: () => setIsLoading(false),
    });
  };

  if (!item) return null;

  if (isChecking || !usage) {
    return <p className="py-6 text-center text-sm text-gray-500">Tekshirilmoqda...</p>;
  }

  return (
    <InputGroup as="form" onSubmit={handleDelete}>
      <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        <span className="font-medium">{item.name}</span>
        <span className="block text-xs text-gray-500">
          {usage.stockRows} ta xatlov qatori · {usage.totalQuantity} ta jami
        </span>
      </p>

      {usage.canDelete ? (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Jihoz butunlay o'chiriladi va qaytarilmaydi.</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            <li>{usage.stockRows} ta xatlov qatori</li>
            <li>{usage.movements} ta daftar yozuvi</li>
            <li>{usage.draftCheckLines} ta qoralama hisobot qatori</li>
          </ul>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Bu jihoz o'chirilmaydi:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
            {usage.blockers.map((blocker, index) => (
              <li key={index}>{blocker}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs">
            O'chirish o'rniga ARXIVLANG: jihoz tanlagichlardan yo'qoladi,
            tarixi esa joyida qoladi.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={close}
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        {usage.canDelete && (
          <Button
            type="submit"
            variant="danger"
            disabled={isLoading}
            className="w-full xs:w-32"
          >
            O'chirish
          </Button>
        )}
      </div>
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

/**
 * Sinf nomidan xona nomi.
 *
 * Sinf nomi ikki xil yoziladi — "1-A" va "1-A sinf". Ikkinchisiga "sinf"
 * so'zini yana qo'shsak "1-A sinf sinf xonasi" chiqardi.
 */
const roomNameForClass = (className = "") => {
  const base = className.trim();
  if (!base) return "";
  return /sinf$/i.test(base) ? `${base} xonasi` : `${base} sinf xonasi`;
};

/**
 * Xona qo'shish/tahrirlash.
 *
 * ── SINFDAN TANLASH ≠ QO'LDA YOZISH ──────────
 *
 * Maktabda sinflar allaqachon ro'yxatga olingan, shuning uchun har bir
 * sinf xonasining nomini qaytadan terish ortiqcha ish va xato manbai
 * ("1-A sinf xonasi" va "1A sinf xonsi" ikki xil xona bo'lib qolardi).
 * Sinf tanlansa nom AVTOMAT to'ladi.
 *
 * Lekin qo'lda yozish YO'Q QILINMAYDI: oshxona, ombor, yo'lak — bularning
 * sinfi yo'q. Shuning uchun nom baribir oddiy matn maydoni bo'lib qoladi
 * va foydalanuvchi bir marta tekkanidan keyin avtomatika unga qayta
 * tegmaydi (`autoName`).
 */
const LocationForm = ({ close, isLoading, setIsLoading, location }) => {
  const { mutate: create } = useCreateLocation();
  const { mutate: update } = useUpdateLocation();

  // Mas'ul — XODIM bo'lishi shart (o'quvchiga hisobot mas'uliyati
  // yuklanmaydi, server ham buni rad etadi). `allShort` barcha
  // foydalanuvchini beradi, rol bo'yicha filtr mijozda — bu ro'yxatning
  // hujjatlashtirilgan ishlatilish usuli.
  const { data: allUsers = [] } = useQuery(usersQueries.allShort());
  const { data: classes = [] } = useQuery(classesQueries.list());
  // Mavjud xonalar — sinf yonida "xonasi bor" belgisini chiqarish va band
  // nomni avtomat qo'ymaslik uchun. Server nomni UNIQUE qiladi, ya'ni
  // tayyor to'ldirilgan nom bilan yiqilish foydalanuvchiga tushunarsiz
  // xato bo'lib ko'rinardi.
  const { data: locations = [] } = useQuery(inventoryQueries.activeLocations());

  const staff = allUsers.filter((u) => u.role !== "student");

  const { name, type, classId, responsibleId, note, sortOrder, setField, setFields } =
    useObjectState({
      name: location?.name ?? "",
      type: location?.type ?? "classroom",
      classId: location?.classId ?? "",
      responsibleId: location?.responsibleId ?? "",
      note: location?.note ?? "",
      sortOrder: location?.sortOrder ?? 0,
    });

  // Oxirgi AVTOMAT qo'yilgan nom. Maydondagi matn shundan farq qilsa —
  // demak uni odam yozgan va avtomatika unga tegmaydi.
  const autoName = useRef("");

  // Bir sinfda bir nechta xona bo'lishi MUMKIN (sinf xonasi + laboratoriya),
  // shuning uchun variant o'chirilmaydi — faqat belgilanadi.
  const classIdsWithRoom = new Set(
    locations.filter((l) => l.classId && l.id !== location?.id).map((l) => l.classId),
  );
  // ⚠️ Arxivlangan xonalar bu ro'yxatda YO'Q, server esa nomni ular bilan
  // birga UNIQUE qiladi. O'sha kamdan-kam holatda serverning aniq matnli
  // xatosi ishlaydi — har modal ochilishida ikkinchi so'rov yuborish bu
  // foyda uchun juda qimmat.
  const takenNames = new Set(
    locations
      .filter((l) => l.id !== location?.id)
      .map((l) => l.name.trim().toLowerCase()),
  );

  // Faol bo'lmagan sinf yangi xonaga taklif qilinmaydi, lekin tahrirdagi
  // xona o'shanga bog'langan bo'lsa ro'yxatdan tushib qolmasligi kerak —
  // aks holda saqlashda biriktirish jimgina uzilardi.
  const classOptions = classes
    .filter((c) => c.isActive !== false || c.id === location?.classId)
    .map((c) => ({
      value: c.id,
      label: classIdsWithRoom.has(c.id) ? `${c.name} — xonasi bor` : c.name,
    }));

  const suggestedName = roomNameForClass(
    classes.find((c) => c.id === classId)?.name,
  );
  // Yozilgan nom bandmi? Serverning UNIQUE xatosini OLDINDAN aytish
  // "Saqlash" bosgandan keyin chiqadigan toastdan yaxshiroq.
  const typedName = name.trim().toLowerCase();
  const nameTaken = Boolean(typedName) && takenNames.has(typedName);

  // Sinf tanlandi-yu, tayyor nom band bo'lgani uchun QO'YILMADI — maydon
  // nega bo'sh qolganini tushuntiradi. Nom yozilgan bo'lsa `nameTaken`
  // gapiradi, ya'ni tahrirdagi xonaga yolg'on ogohlantirish chiqmaydi.
  const suggestionTaken =
    !typedName &&
    Boolean(suggestedName) &&
    takenNames.has(suggestedName.toLowerCase());

  /** Sinf tanlandi: biriktirish + (nom bo'sh yoki avtomat bo'lsa) nomni to'ldirish. */
  const handleClassChange = (value) => {
    const isAuto = !name.trim() || name === autoName.current;
    if (!isAuto) {
      setField("classId", value);
      return;
    }

    const suggested = roomNameForClass(classes.find((c) => c.id === value)?.name);
    const nextName = suggested && !takenNames.has(suggested.toLowerCase()) ? suggested : "";

    autoName.current = nextName;
    setFields({ classId: value, name: nextName });
  };

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
      {/* Sinf NOMDAN OLDIN: u nomni to'ldiradigan yorliq, ixtiyoriy qadam */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Sinf (ixtiyoriy)</p>
        <Select
          value={classId}
          placeholder="Tanlanmagan"
          onChange={handleClassChange}
          options={[{ label: "Tanlanmagan", value: "" }, ...classOptions]}
        />
        <p className="text-xs text-gray-500">
          Mavjud sinfni tanlasangiz xona nomi avtomat to'ladi. Oshxona, ombor
          kabi xonalarning sinfi yo'q — nomini quyida qo'lda yozing.
        </p>
      </div>

      <InputField
        required
        name="name"
        label="Xona nomi"
        value={name}
        placeholder="1-A sinf xonasi"
        description={
          nameTaken ? (
            <span className="text-amber-700">
              "{name.trim()}" nomli xona allaqachon bor — boshqa nom bering
            </span>
          ) : suggestionTaken ? (
            <span className="text-amber-700">
              "{suggestedName}" nomli xona allaqachon bor — bu xonaga boshqa
              nom bering
            </span>
          ) : (
            ""
          )
        }
        onChange={(e) => {
          // Qo'lda yozildi — avtomatika bu matnga boshqa tegmaydi
          autoName.current = null;
          setField("name", e.target.value);
        }}
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
