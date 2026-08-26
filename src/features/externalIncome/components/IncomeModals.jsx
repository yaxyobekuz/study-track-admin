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

// Queries
import { financeQueries } from "@/features/finance/queries/finance.queries";
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
  const { data: categories = [] } = useQuery(incomeQueries.activeCategories());
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { mutate: createIncome } = useCreateIncome();

  const { categoryId, accountId, amount, payer, note, occurredAt, setField } =
    useObjectState({
      categoryId: "",
      accountId: "",
      amount: "",
      payer: "",
      note: "",
      occurredAt: todayInputValue(),
    });

  // Bitta variant bo'lsa tanlash shart emas — kassirning ishini qisqartiradi
  const resolvedCategory = categoryId || (categories.length === 1 ? categories[0].id : "");
  const resolvedAccount = accountId || (accounts.length === 1 ? accounts[0].id : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createIncome(
      {
        categoryId: resolvedCategory,
        accountId: resolvedAccount,
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
  };

  const blocked = categories.length === 0 || accounts.length === 0;

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {categories.length === 0 && (
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
        <p className="text-sm font-medium text-gray-700">Kategoriya</p>
        <Select
          value={resolvedCategory}
          placeholder="Kategoriyani tanlang"
          onChange={(v) => setField("categoryId", v)}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />
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
        disabled={blocked || !resolvedCategory || !resolvedAccount || !amount}
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
