// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Ban, Coins, Pencil, Plus, Archive, ArchiveRestore } from "lucide-react";

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
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import {
  ExpenseEntryModal,
  VoidExpenseModal,
  ExpenseCategoryModal,
} from "../components/ExpenseModals";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUz } from "@/shared/utils/date.utils";

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
import { useArchiveCategory } from "../queries/expenses.mutations";
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
      <VoidExpenseModal />
      <ExpenseCategoryModal />
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

  const { data, isLoading } = useQuery(
    expenseQueries.list({
      page,
      limit: 20,
      ...(categoryId ? { categoryId } : {}),
      ...(accountId ? { accountId } : {}),
    }),
  );

  const { data: categories = [] } = useQuery(expenseQueries.activeCategories());
  const { data: accounts = [] } = useQuery(financeQueries.activeAccounts());

  const items = data?.data ?? [];
  const isFiltered = Boolean(categoryId || accountId);

  return (
    <div className="space-y-4">
      {/* Filtr paneli */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-gray-100 xs:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select
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

          <Select
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
        </div>

        <Can do="expenses.create">
          <Button onClick={() => openModal("expense", {})}>
            <Plus />
            Xarajat qo'shish
          </Button>
        </Can>
      </div>

      {data?.totals && (
        <Card>
          <p className="text-xs font-medium text-gray-500">
            {isFiltered ? "Tanlangan filtr bo'yicha" : "Jami xarajat"}
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
              isFiltered
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
                    ) : (
                      <Can do="expenses.void">
                        <button
                          title="Bekor qilish"
                          onClick={() => openModal("voidExpense", { expense })}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Ban className="size-3.5" />
                        </button>
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

  const items = data?.items ?? [];

  const handleArchive = (category) => {
    archiveCategory(
      { id: category.id, isArchived: !category.isArchived },
      {
        onSuccess: (result) => toast.success(result.message),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
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
