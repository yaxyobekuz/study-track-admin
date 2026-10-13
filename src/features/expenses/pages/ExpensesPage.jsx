// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import {
  Ban,
  Coins,
  Loader2,
  Pencil,
  Plus,
  Archive,
  ArchiveRestore,
  Sheet,
  Trash2,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import EmptyState from "@/shared/components/ui/EmptyState";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import {
  ExpenseEntryModal,
  EditExpenseModal,
  VoidExpenseModal,
  ExpenseCategoryModal,
} from "../components/ExpenseModals";
import {
  EditSalaryPaymentModal,
  VoidSalaryPaymentModal,
} from "@/features/payroll/components/PayrollModals";

// Hooks
import {
  LimitRequestModal,
  LimitRequestsReviewModal,
} from "../components/LimitRequestModals";
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";
import { downloadBlob, readBlobErrorMessage } from "@/shared/utils/download.utils";
import {
  formatMonthKey,
  inputValueToMonthKey,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  CATEGORY_ARCHIVE_HINT,
  CATEGORY_STATUS_OPTIONS,
  CATEGORY_TABLE_COLUMNS,
  EXPENSE_TABLE_COLUMNS,
  EXPENSE_TABS,
  getCategoryStatus,
} from "../data/expenses.data";
import { expenseQueries } from "../queries/expenses.queries";
import { expensesAPI } from "../api/expenses.api";
import {
  useArchiveCategory,
  useDeleteCategory,
} from "../queries/expenses.mutations";
import { financeQueries } from "@/features/finance/queries/finance.queries";

/**
 * XARAJATLAR — o'quvchi to'lovi BO'LMAGAN pul: ijara, kitob sotuvi,
 * homiylik.
 *
 * Ikki tab: "Asosiy" (yozuvlar) va "Sozlamalar" (kategoriyalar katalogi).
 * Kategoriyalar alohida ruxsat talab qiladi, shuning uchun tab ham shartli.
 */
const ExpensesPage = () => {
  const { can } = usePermissions();
  const [tab, setTab] = useState("main");

  const tabs = EXPENSE_TABS.filter(
    (item) => item.value !== "settings" || can("expenses.categories"),
  ).map((item) => ({
    ...item,
    content: item.value === "main" ? <ExpenseList /> : <CategoriesPanel />,
  }));

  return (
    <div className="space-y-4">
      <TabsButtons
        items={tabs}
        value={tab}
        onChange={setTab}
        contentClassName="mt-4"
      />

      {/* Modallar shu bo'lim ichida mount qilinadi */}
      <ExpenseEntryModal />
      <EditExpenseModal />
      <VoidExpenseModal />
      <ExpenseCategoryModal />
      <EditSalaryPaymentModal />
      <VoidSalaryPaymentModal />
      <LimitRequestModal />
      <LimitRequestsReviewModal />
    </div>
  );
};

// ─────────────────────────────────────────────
// Asosiy — yozuvlar
// ─────────────────────────────────────────────

const ExpenseList = () => {
  const { openModal } = useModal();

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // ⚠️ OY — BO'SH BOSHLANADI ("Butun tarix"). Joriy oy qo'yilsa, sahifa
  // ochilganda ro'yxat jimgina qisqarib, o'tgan oydagi xarajat
  // "yo'qolgan" bo'lib ko'rinardi. Moliyada oy — o'lchov birligi
  // (`finance.md` §0), lekin registr butun tarixni ko'rsatadi.
  const [month, setMonth] = useState("");

  // ⚠️ FILTRLAR BITTA JOYDA — ro'yxat ham, Excel ham SHU obyektni oladi.
  // Ikki joyda yig'ilsa, biri o'zgarib ikkinchisi eskirardi va fayl
  // ekrandagidan boshqa ro'yxat qaytarardi.
  const monthKey = inputValueToMonthKey(month);
  const filters = {
    ...(monthKey ? { month: monthKey } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(accountId ? { accountId } : {}),
  };

  const { data, isLoading } = useQuery(
    expenseQueries.list({ page, limit: 20, ...filters }),
  );

  /**
   * ⚠️ XATO XABARI BLOB'DAN O'QILADI. So'rov `responseType: "blob"` bilan
   * ketgani uchun server qaytargan JSON xato ham Blob bo'lib keladi va
   * `error.response.data.message` HAR DOIM `undefined` bo'lardi — ya'ni
   * foydalanuvchi haqiqiy sababni hech qachon ko'rmasdi.
   *
   * ⚠️ SAHIFA RAQAMI YUBORILMAYDI: faylda filtrga tushgan HAMMA yozuv
   * bo'ladi, ko'rinib turgan 20 tasi emas.
   */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await expensesAPI.export(filters);
      downloadBlob(response, "chiqimlar.xlsx");
    } catch (error) {
      toast.error(await readBlobErrorMessage(error, "Faylni yuklab bo'lmadi"));
    } finally {
      setIsExporting(false);
    }
  };

  const { data: categories = [] } = useQuery(expenseQueries.activeCategories());
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());

  const items = data?.data ?? [];
  const isFiltered = Boolean(monthKey || categoryId || accountId);

  return (
    <div className="space-y-4">
      {/* Filtr paneli */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Oy — eng yirik kesim, shuning uchun birinchi turadi.
              Bo'sh qoldirilsa butun tarix ko'rinadi. */}
          <input
            type="month"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPage(1);
            }}
            title="Oy bo'yicha filtr — bo'sh qoldirilsa butun tarix"
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-primary"
          />

          {/* Oy tanlanganda uni bir bosishda tozalash — nativ
              `input[type=month]` da "tozalash" tugmasi hamma brauzerda
              ham yo'q, oyni qo'lda o'chirish esa noqulay */}
          {month && (
            <button
              type="button"
              onClick={() => {
                setMonth("");
                setPage(1);
              }}
              title="Oy filtrini olib tashlash"
              className="h-10 rounded-xl px-2.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              Butun tarix
            </button>
          )}

          <Select searchable
            triggerClassName="min-w-44"
            value={categoryId}
            placeholder="Barcha kategoriyalar"
            onChange={(v) => {
              setCategoryId(v);
              setPage(1);
            }}
            options={[
              { label: "Barcha kategoriyalar", value: "" },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
          />

          <Select searchable
            triggerClassName="min-w-40"
            value={accountId}
            placeholder="Barcha to'lov turlari"
            onChange={(v) => {
              setAccountId(v);
              setPage(1);
            }}
            options={[
              { label: "Barcha to'lov turlari", value: "" },
              ...accounts.map((a) => ({ label: a.name, value: a.id })),
            ]}
          />

          {/* Excel — filtrlar YONIDA va bu ataylab: fayl ekrandagi
              ro'yxatning nusxasi, ya'ni u filtr qarorining davomi.
              Ro'yxat bo'sh bo'lsa tugma o'chiriladi. */}
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || isLoading || !items.length}
            title="Chiqimlarni Excel'ga yuklab olish"
          >
            {isExporting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sheet className="text-green-600" />
            )}
            {isExporting ? "Tayyorlanmoqda…" : "Excel"}
          </Button>
        </div>

        <Can do="expenses.limitReview">
          <Button variant="outline" onClick={() => openModal("limitRequestsReview", {})}>
            Limit so'rovlari
          </Button>
        </Can>

        <Can do="expenses.create">
          <Button variant="outline" onClick={() => openModal("limitRequest", {})}>
            Limit oshirish so'rovi
          </Button>
        </Can>

        <Can do="expenses.create">
          <Button onClick={() => openModal("expense", {})}>
            <Plus />
            Xarajat qo'shish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <Card>
          {/* Oy tanlangan bo'lsa uning NOMI turadi: "qaysi oyning
              summasi" degan savol ochiq qolmasligi kerak */}
          <p className="text-xs font-medium text-gray-500">
            {monthKey
              ? `${formatMonthKey(monthKey)} — jami chiqim`
              : isFiltered
                ? "Tanlangan filtr bo'yicha"
                : "Jami xarajat"}
          </p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {formatMoney(data.totals.amount)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {data.totals.count} ta yozuv · bekor qilinganlari sanalmaydi
          </p>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Coins}
            title={isFiltered ? "Yozuv topilmadi" : "Xarajat yo'q"}
            description={
              monthKey
                ? `${formatMonthKey(monthKey)} oyida chiqim qayd etilmagan. Boshqa oyni tanlang yoki filtrni olib tashlang.`
                : isFiltered
                  ? "Filtrni o'zgartirib ko'ring."
                  : "O'quvchi to'lovidan tashqari kelgan pul shu yerda qayd etiladi: ijara, kitob sotuvi, homiylik."
            }
            action={
              <Can do="expenses.create">
                <Button onClick={() => openModal("expense", {})}>
                  <Plus />
                  Xarajat qo'shish
                </Button>
              </Can>
            }
          />
        </Card>
      ) : (
        <>
          <Table columns={EXPENSE_TABLE_COLUMNS}>
            {items.map((expense) => (
              <Tr key={expense.id} className={cn(expense.isVoided && "opacity-50")}>
                <Td className="text-gray-500">{formatDateUz(expense.occurredAt)}</Td>

                <Td className="font-medium text-gray-900">
                  {expense.categoryName}
                  {expense.note && (
                    <span className="block text-xs font-normal text-gray-400">
                      {expense.note}
                    </span>
                  )}
                </Td>

                <Td className="text-gray-500">{expense.payee || "—"}</Td>
                <Td className="text-gray-500">{expense.accountName ?? "—"}</Td>

                <Td
                  align="right"
                  className={cn(
                    "font-semibold",
                    expense.isVoided ? "text-gray-400 line-through" : "text-green-700",
                  )}
                >
                  {formatMoney(expense.amount)}
                </Td>

                <Td>
                  <div className="flex items-center justify-end">
                    {expense.isVoided ? (
                      <span className="text-xs text-gray-400">
                        Bekor qilingan
                      </span>
                    ) : expense.kind === "salary" ? (
                      // Oylik to'lovi — xarajat emas, payroll ruxsatlari bilan
                      // tahrirlanadi/bekor qilinadi (tahrirlash ikkalasini so'raydi)
                      <div className="flex items-center gap-1">
                        <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-600">
                          Oylik
                        </span>

                        <Can do="payroll.void">
                          <Can do="payroll.pay">
                            <button
                              title="Tahrirlash"
                              onClick={() => openModal("editSalaryPayment", { payment: expense })}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          </Can>

                          <button
                            title="Bekor qilish"
                            onClick={() => openModal("voidSalaryPayment", { payment: expense })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Ban className="size-3.5" />
                          </button>
                        </Can>
                      </div>
                    ) : (
                      // Tahrirlash = bekor qilish + qaytadan yozish, shuning
                      // uchun u IKKALA huquqni so'raydi (server ham shunday
                      // tekshiradi). Bekor qilish esa yolg'iz yetarli.
                      <Can do="expenses.void">
                        <div className="flex items-center gap-1">
                          <Can do="expenses.create">
                            <button
                              title="Tahrirlash"
                              onClick={() => openModal("editExpense", { expense })}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          </Can>

                          <button
                            title="Bekor qilish"
                            onClick={() => openModal("voidExpense", { expense })}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <Ban className="size-3.5" />
                          </button>
                        </div>
                      </Can>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {data?.pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sozlamalar — kategoriyalar katalogi
// ─────────────────────────────────────────────

const CategoriesPanel = () => {
  const { openModal } = useModal();
  const [status, setStatus] = useState("active");

  const { data, isLoading } = useQuery(expenseQueries.categories({ status }));
  const { mutate: archiveCategory } = useArchiveCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const items = data?.items ?? [];

  const showError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleArchive = (category) => {
    archiveCategory(
      { id: category.id, isArchived: !category.isArchived },
      {
        onSuccess: (result) => toast.success(result.message),
        onError: showError,
      },
    );
  };

  // ⚠️ Tugma FAQAT ishlatilmagan kategoriyada ko'rinadi (`usageCount === 0`).
  // Yozuvi bor kategoriyani o'chirish o'tgan hisobotni buzardi — u faqat
  // arxivlanadi. Server ham shu shartni qayta tekshiradi.
  const handleDelete = (category) => {
    deleteCategory(category.id, {
      onSuccess: (result) => toast.success(result.message),
      onError: showError,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select searchable
          triggerClassName="min-w-36"
          value={status}
          options={CATEGORY_STATUS_OPTIONS}
          onChange={setStatus}
        />

        <Button onClick={() => openModal("expenseCategory", {})}>
          <Plus />
          Kategoriya qo'shish
        </Button>
      </div>

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : items.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Coins}
            title="Kategoriya yo'q"
            description="Xarajat manbalarini kategoriyalarga ajrating: Kommunal, Kitob sotuvi, Homiylik."
            action={
              <Button onClick={() => openModal("expenseCategory", {})}>
                <Plus />
                Kategoriya qo'shish
              </Button>
            }
          />
        </Card>
      ) : (
        <Table columns={CATEGORY_TABLE_COLUMNS}>
          {items.map((category) => {
            const badge = getCategoryStatus(category);

            return (
              <Tr key={category.id}>
                <Td className="font-medium text-gray-900">{category.name}</Td>

                <Td align="right" className="text-gray-500">
                  {category.usageCount > 0 ? `${category.usageCount} ta` : "—"}
                </Td>

                <Td>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </Td>

                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Tahrirlash"
                      onClick={() => openModal("expenseCategory", { category })}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    <button
                      title={category.isArchived ? "Arxivdan qaytarish" : "Arxivlash"}
                      onClick={() => handleArchive(category)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600"
                    >
                      {category.isArchived ? (
                        <ArchiveRestore className="size-3.5" />
                      ) : (
                        <Archive className="size-3.5" />
                      )}
                    </button>

                    {category.usageCount === 0 && (
                      <ConfirmPopover
                        tooltip="O'chirish"
                        title="Kategoriya o'chirilsinmi?"
                        description="Bu kategoriyada birorta yozuv yo'q, shuning uchun uni butunlay o'chirish mumkin."
                        confirmLabel="O'chirish"
                        danger
                        onConfirm={() => handleDelete(category)}
                      >
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </ConfirmPopover>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      <p className="text-xs text-gray-500">{CATEGORY_ARCHIVE_HINT}</p>
    </div>
  );
};

export default ExpensesPage;
