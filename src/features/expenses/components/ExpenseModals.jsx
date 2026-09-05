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
import Switch from "@/shared/components/ui/switch/Switch";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { financeQueries } from "@/features/finance/queries/finance.queries";
import { expenseQueries } from "../queries/expenses.queries";
import {
  useCreateExpense,
  useVoidExpense,
  useCreateCategory,
  useUpdateCategory,
} from "../queries/expenses.mutations";

/** Bugungi sana — `<input type="date">` qiymati. */
const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

// ─────────────────────────────────────────────
// Xarajat qo'shish
// ─────────────────────────────────────────────

export const ExpenseEntryModal = () => (
  <ResponsiveModal name="expense" title="Xarajat qo'shish">
    <ExpenseForm />
  </ResponsiveModal>
);

const ExpenseForm = ({ close, isLoading, setIsLoading }) => {
  const { data: categories = [] } = useQuery(expenseQueries.activeCategories());
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());
  const { mutate: createExpense } = useCreateExpense();

  const { categoryId, accountId, amount, payee, note, occurredAt, setField } =
    useObjectState({
      categoryId: "",
      accountId: "",
      amount: "",
      payee: "",
      note: "",
      occurredAt: todayInputValue(),
    });

  // Bitta variant bo'lsa tanlash shart emas — kassirning ishini qisqartiradi
  const resolvedCategory = categoryId || (categories.length === 1 ? categories[0].id : "");
  const resolvedAccount = accountId || (accounts.length === 1 ? accounts[0].id : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    createExpense(
      {
        categoryId: resolvedCategory,
        accountId: resolvedAccount,
        amount,
        payee,
        note,
        occurredAt,
      },
      {
        onSuccess: () => {
          close();
          toast.success("Xarajat qayd etildi");
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
        name="payee"
        label="Kimga (ixtiyoriy)"
        value={payee}
        placeholder="Hududgaz / Anvar aka"
        onChange={(e) => setField("payee", e.target.value)}
      />

      <InputField
        name="note"
        label="Izoh (ixtiyoriy)"
        value={note}
        placeholder="Avgust oyi uchun gaz to'lovi"
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

export const VoidExpenseModal = () => (
  <ResponsiveModal name="voidExpense" title="Xarajatni bekor qilish">
    <VoidForm />
  </ResponsiveModal>
);

const VoidForm = ({ close, isLoading, setIsLoading, expense }) => {
  const { mutate: voidExpense } = useVoidExpense();
  const { reason, setField } = useObjectState({ reason: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    voidExpense(
      { id: expense.id, reason },
      {
        onSuccess: () => {
          close();
          toast.success("Xarajat bekor qilindi");
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
        <p className="font-medium text-gray-900">{expense?.categoryName}</p>
        <p className="text-gray-500">
          {formatMoney(expense?.amount)}
          {expense?.payee ? ` · ${expense.payee}` : ""}
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

export const ExpenseCategoryModal = () => (
  <ResponsiveModal name="expenseCategory" title="Xarajat kategoriyasi">
    <CategoryForm />
  </ResponsiveModal>
);

const CategoryForm = ({ close, isLoading, setIsLoading, category }) => {
  const isEdit = Boolean(category?.id);

  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  const { name, excludeFromEbitda, setField } = useObjectState({
    name: category?.name ?? "",
    excludeFromEbitda: category?.excludeFromEbitda ?? false,
  });

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

    const payload = { name, excludeFromEbitda };

    if (isEdit) updateCategory({ id: category.id, data: payload }, handlers);
    else createCategory(payload, handlers);
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      <InputField
        required
        name="name"
        label="Kategoriya nomi"
        value={name}
        placeholder="Kommunal"
        description="Masalan: Kommunal, Kitob sotuvi, Homiylik"
        onChange={(e) => setField("name", e.target.value)}
      />

      {/* EBITDA — sof foyda + foiz, soliq va amortizatsiya. Tizimda ular
          alohida jadvalda emas, oddiy xarajat qatori bo'lib yotadi, shuning
          uchun "operatsion emas" qarori KATEGORIYA darajasida beriladi. */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 p-3">
        <Switch
          checked={excludeFromEbitda}
          onChange={(value) => setField("excludeFromEbitda", value)}
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-gray-700">
            EBITDA hisobidan chiqarilsin
          </span>
          <span className="block text-xs text-gray-500">
            Soliq va amortizatsiya uchun. Belgilangan kategoriyadagi xarajatlar
            moliya dashboardidagi EBITDA qatoriga qaytarib qo'shiladi.
          </span>
        </span>
      </label>

      {isEdit && (
        <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          Nomni o'zgartirish o'tgan yozuvlarga ta'sir qilmaydi: har bir xarajat
          o'z kategoriyasi nomini yozilgan paytdagi ko'rinishida saqlaydi.
          EBITDA bayrog'i esa JORIY qaror — uni o'zgartirish o'tgan oylarning
          EBITDA raqamini ham qayta hisoblaydi.
        </p>
      )}

      <Button type="submit" className="w-full" loading={isLoading} disabled={!name.trim()}>
        {isEdit ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};
