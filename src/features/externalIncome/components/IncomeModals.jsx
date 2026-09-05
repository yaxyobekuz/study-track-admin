// React
import { useState } from "react";

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
import Input from "@/shared/components/ui/input/Input";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { financeQueries } from "@/features/finance/queries/finance.queries";
import { usersQueries } from "@/features/users/queries/users.queries";
import { incomeQueries } from "../queries/externalIncome.queries";
import {
  useCreateIncome,
  useVoidIncome,
  useCreateCategory,
  useUpdateCategory,
} from "../queries/externalIncome.mutations";

/** Bugungi sana — `<input type="date">` qiymati. */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// ─────────────────────────────────────────────
// Kirim qo'shish
// ─────────────────────────────────────────────

export const IncomeEntryModal = () => (
  <ResponsiveModal name="externalIncome" title="Tashqi kirim qo'shish">
    <IncomeForm />
  </ResponsiveModal>
);

const IncomeForm = ({ close, isLoading, setIsLoading }) => {
  const { can } = usePermissions();
  const { data: categories = [] } = useQuery(incomeQueries.activeCategories());
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  // Mas'ul xodim ro'yxati — `allShort` ruxsatga bog'liq emas, o'quvchilar
  // mijozda filtrlanadi (server ham rad etadi)
  const { data: people = [] } = useQuery(usersQueries.allShort());
  const { mutate: createIncome } = useCreateIncome();
  const { mutate: createCategory } = useCreateCategory();

  // Katalogni o'zgartirish ALOHIDA huquq — xarajat tomonidagi bilan bir xil
  const canManageCategories = can("income.categories");

  // `null` — ro'yxatdan tanlash rejimi. Satr — yangi kategoriya rejimi.
  const [newCategory, setNewCategory] = useState(null);
  const isNewCategory = newCategory !== null;

  const {
    categoryId,
    accountId,
    responsibleId,
    amount,
    payer,
    note,
    occurredAt,
    setField,
  } = useObjectState({
    categoryId: "",
    accountId: "",
    responsibleId: "",
    amount: "",
    payer: "",
    note: "",
    occurredAt: todayInputValue(),
  });

  const staffOptions = people
    .filter((person) => person.role !== "student")
    .map((person) => ({
      label:
        person.fullName || `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim(),
      value: person.id,
    }));

  // Bitta variant bo'lsa tanlash shart emas — kassirning ishini qisqartiradi
  const resolvedCategory = categoryId || (categories.length === 1 ? categories[0].id : "");
  const resolvedAccount = accountId || (accounts.length === 1 ? accounts[0].id : "");

  /** Kirimning o'zini yozish — kategoriya allaqachon aniq. */
  const submitIncome = (targetCategoryId) =>
    createIncome(
      {
        categoryId: targetCategoryId,
        accountId: resolvedAccount,
        responsibleId: responsibleId || undefined,
        amount,
        payer,
        note,
        occurredAt,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Kirim qayd etildi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ⚠️ IKKI QADAM, BITTA TUGMA (xarajat oynasi bilan bir xil): avval
    // kategoriya yaratiladi, keyin kirim unga yoziladi.
    if (isNewCategory) {
      const name = newCategory.trim();
      if (!name) {
        setIsLoading(false);
        return toast.error("Kategoriya nomini kiriting");
      }

      return createCategory(
        { name },
        {
          onSuccess: (created) => submitIncome(created.id),
          onError: (err) => {
            setIsLoading(false);
            toast.error(
              err.response?.data?.message || "Kategoriyani qo'shib bo'lmadi",
            );
          },
        },
      );
    }

    submitIncome(resolvedCategory);
  };

  const blocked = accounts.length === 0;
  const categoryReady = isNewCategory
    ? newCategory.trim().length > 0
    : Boolean(resolvedCategory);

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {categories.length === 0 && !canManageCategories && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Faol kategoriya yo'q — avval "Sozlamalar" tabida kategoriya qo'shing.
        </p>
      )}
      {accounts.length === 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Faol to'lov turi yo'q — avval "To'lov turlari" bo'limida qo'shing.
        </p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-700">Kategoriya</p>

          {canManageCategories && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setNewCategory(isNewCategory ? null : "")}
            >
              {isNewCategory ? "Ro'yxatdan tanlash" : "+ Yangi kategoriya"}
            </button>
          )}
        </div>

        {isNewCategory ? (
          <>
            <Input
              autoFocus
              name="newCategory"
              value={newCategory}
              placeholder="Masalan: Yozgi lager"
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <p className="text-xs text-gray-400">
              Yangi kategoriya katalogga qo'shiladi va keyingi kirimlarda
              ro'yxatda turadi.
            </p>
          </>
        ) : (
          <Select
            value={resolvedCategory}
            placeholder={
              categories.length === 0 ? "Kategoriya yo'q" : "Kategoriyani tanlang"
            }
            onChange={(v) => setField("categoryId", v)}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        )}
      </div>

      <InputField
        required
        min="1"
        type="number"
        name="amount"
        label="Summa"
        value={amount}
        placeholder="5000000"
        description={amount ? formatMoney(amount) : "So'mda"}
        onChange={(e) => setField("amount", e.target.value)}
      />

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Pul qayerga tushdi</p>
        <Select
          value={resolvedAccount}
          placeholder="To'lov turini tanlang"
          onChange={(v) => setField("accountId", v)}
          options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        />
      </div>

      <InputField
        required
        type="date"
        name="occurredAt"
        label="Sana"
        value={occurredAt}
        max={todayInputValue()}
        description="Pul qachon kirdi"
        onChange={(e) => setField("occurredAt", e.target.value)}
      />

      {/* MAS'UL XODIM — bu pulni yig'ish kimning zimmasida.
          ⚠️ "Kimdan" (to'lovchi) bilan chalkashmasin: ular boshqa-boshqa
          odam. "Bo'limlar bo'yicha yig'im" hisoboti aynan shu maydonga
          tayanadi, shuning uchun izohda ham shu aytilgan. */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Mas'ul xodim (ixtiyoriy)</p>
        <Select
          value={responsibleId}
          placeholder="Tanlanmagan"
          options={staffOptions}
          onChange={(v) => setField("responsibleId", v)}
        />
        <p className="text-xs text-gray-400">
          Bu pulni yig'ish kimning zimmasida — "Bo'limlar bo'yicha yig'im"
          hisobotida shu bo'yicha guruhlanadi.
        </p>
      </div>

      <InputField
        name="payer"
        label="Kimdan (ixtiyoriy)"
        value={payer}
        placeholder="Anvar aka / Korzinka MCHJ"
        onChange={(e) => setField("payer", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        placeholder="Sentabr oyi uchun sport zal ijarasi"
        onChange={(e) => setField("note", e.target.value)}
      />

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={blocked || !categoryReady || !resolvedAccount || !amount}
      >
        Qayd etish
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Bekor qilish
// ─────────────────────────────────────────────

export const VoidIncomeModal = () => (
  <ResponsiveModal name="voidExternalIncome" title="Kirimni bekor qilish">
    <VoidForm />
  </ResponsiveModal>
);

const VoidForm = ({ close, isLoading, setIsLoading, income }) => {
  const { mutate: voidIncome } = useVoidIncome();
  const { reason, setField } = useObjectState({ reason: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    voidIncome(
      { id: income.id, reason },
      {
        onSuccess: () => {
          close();
          toast.success("Kirim bekor qilindi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{income?.categoryName}</p>
        <p className="text-gray-500">
          {formatMoney(income?.amount)}
          {income?.payer ? ` · ${income.payer}` : ""}
        </p>
      </div>

      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        Yozuv o'chirilmaydi — daftarga teskari qator yoziladi va kassa qoldig'i
        shu summaga kamayadi. Ikkala qator ham tarixda qoladi.
      </p>

      <InputField
        required
        name="reason"
        label="Bekor qilish sababi"
        value={reason}
        placeholder="Xato summa kiritilgan"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <Button
        type="submit"
        variant="danger"
        className="w-full"
        loading={isLoading}
        disabled={!reason.trim()}
      >
        Bekor qilish
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Kategoriya
// ─────────────────────────────────────────────

export const IncomeCategoryModal = () => (
  <ResponsiveModal name="incomeCategory" title="Kirim kategoriyasi">
    <CategoryForm />
  </ResponsiveModal>
);

const CategoryForm = ({ close, isLoading, setIsLoading, category }) => {
  const isEdit = Boolean(category?.id);

  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  const { name, setField } = useObjectState({ name: category?.name ?? "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Kategoriya yangilandi" : "Kategoriya qo'shildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updateCategory({ id: category.id, data: { name } }, handlers);
    else createCategory({ name }, handlers);
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        name="name"
        label="Kategoriya nomi"
        value={name}
        placeholder="Ijara"
        description="Masalan: Ijara, Kitob sotuvi, Homiylik"
        onChange={(e) => setField("name", e.target.value)}
      />

      {isEdit && (
        <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          Nomni o'zgartirish o'tgan yozuvlarga ta'sir qilmaydi: har bir kirim
          o'z kategoriyasi nomini yozilgan paytdagi ko'rinishida saqlaydi.
        </p>
      )}

      <Button type="submit" className="w-full" loading={isLoading} disabled={!name.trim()}>
        {isEdit ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};
