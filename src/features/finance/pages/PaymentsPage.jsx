// React
import { useState } from "react";

// Router
import { Link, useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { Ban, Printer, Receipt } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import ReasonModal from "../components/ReasonModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data & queries
import {
  ALLOCATION_SOURCE_META,
  PAYMENT_TABLE_COLUMNS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { useVoidPayment } from "../queries/finance.mutations";

/**
 * To'lov cheklari registri.
 *
 * Har bir qator — pulni bir marta qabul qilish akti. Qaysi oylarga
 * taqsimlangani darhol ko'rinadi: "1 500 000 → sentabr, oktabr, noyabr"
 * degan javob ota-ona telefon qilganda kerak bo'ladi.
 */
const PaymentsPage = () => {
  const { openModal } = useModal();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const accountId = searchParams.get("accountId") || "";

  const [search, setSearch] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const debouncedSearch = useDebounce(search, 400);

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (value == null || value === "") prev.delete(key);
      else prev.set(key, String(value));
      if (key !== "page") prev.delete("page");
      return prev;
    });

  const { data: accountsData } = useQuery(financeQueries.accountList({}));
  const accounts = accountsData?.items ?? [];

  const { data, isLoading } = useQuery(
    financeQueries.paymentList({
      page,
      limit: 24,
      includeVoided: "true",
      ...(accountId ? { accountId } : {}),
      ...(range.from ? { from: range.from } : {}),
      ...(range.to ? { to: range.to } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
  );

  const payments = data?.data ?? [];
  const pagination = data?.pagination;
  const totals = data?.totals;

  const { mutate: voidPayment } = useVoidPayment();

  const askVoid = (payment) =>
    openModal("financeReason", {
      description: `${payment.receiptLabel} — ${payment.studentName}, ${formatMoney(payment.amount)}`,
      consequences: [
        payment.allocations?.length
          ? `${payment.allocations.length} ta oy qayta ochiladi`
          : "Bu chek hech qaysi oyga taqsimlanmagan",
        "Pul to'lov turidan chiqim sifatida yoziladi",
        "Chek o'chirilmaydi — bekor qilingan deb belgilanadi",
      ],
      warning:
        "Qisman bekor qilish yo'q. Summa xato bo'lsa, to'liq bekor qilib qaytadan kiriting.",
      confirmLabel: "Bekor qilish",
      onConfirm: (reason, { close, setIsLoading }) => {
        setIsLoading(true);
        voidPayment(
          { id: payment.id, reason },
          {
            onSuccess: (result) => {
              close();
              toast.success(
                result.reopened?.length
                  ? `Bekor qilindi — ${result.reopened.length} ta oy qayta ochildi`
                  : "To'lov bekor qilindi",
              );
            },
            onError: (err) =>
              toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
            onSettled: () => setIsLoading(false),
          },
        );
      },
    });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-2">
        <InputField
          name="search"
          type="search"
          value={search}
          placeholder="O'quvchini qidirish..."
          className="min-w-52 flex-1"
          onChange={(e) => setSearch(e.target.value)}
        />

        <InputField
          type="date"
          name="from"
          label="Dan"
          value={range.from}
          onChange={(e) =>
            setRange((prev) => ({ ...prev, from: e.target.value }))
          }
        />

        <InputField
          type="date"
          name="to"
          label="Gacha"
          value={range.to}
          onChange={(e) =>
            setRange((prev) => ({ ...prev, to: e.target.value }))
          }
        />

        <Select searchable
          value={accountId}
          triggerClassName="min-w-44"
          placeholder="Barcha to'lov turlari"
          onChange={(v) => setParam("accountId", v)}
          options={accounts.map((a) => ({ label: a.name, value: a.id }))}
        />
      </div>

      {totals && (
        <Card>
          <p className="text-xs text-gray-500">Tanlangan davr bo'yicha</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {formatMoney(totals.totalAmount)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{totals.count} ta chek</p>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>
      ) : payments.length === 0 ? (
        <Card className="p-0 xs:p-0">
          <EmptyState
            icon={Receipt}
            title="To'lov topilmadi"
            description="Sana oralig'ini yoki to'lov turini o'zgartirib ko'ring."
          />
        </Card>
      ) : (
        <Table columns={PAYMENT_TABLE_COLUMNS}>
          {payments.map((payment) => (
            <Tr
              key={payment.id}
              className={payment.isVoided ? "opacity-50" : ""}
            >
              <Td className="font-mono text-xs text-gray-500">
                {payment.receiptLabel}
              </Td>

              <Td className="text-gray-500">{formatDateUZ(payment.paidAt)}</Td>

              <Td nowrap={false}>
                <p className="font-medium text-gray-900">
                  {payment.studentName}
                </p>
                {payment.isVoided && (
                  <p className="text-xs text-red-500">
                    Bekor qilingan: {payment.voidReason}
                  </p>
                )}
              </Td>

              <Td align="right" className="font-medium">
                {formatMoney(payment.amount)}
              </Td>

              <Td nowrap={false}>
                {payment.allocations?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {payment.allocations.map((allocation) => {
                      const meta = ALLOCATION_SOURCE_META[allocation.source];
                      return (
                        <span
                          key={allocation.id}
                          title={meta?.label}
                          className={`rounded-md px-1.5 py-0.5 text-xs ${meta?.className ?? ""}`}
                        >
                          {allocation.monthLabel} ·{" "}
                          {formatMoney(allocation.amount)}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-blue-600">Depozitga</span>
                )}
              </Td>

              <Td className="text-gray-500">{payment.account?.name ?? "—"}</Td>

              <Td>
                <div className="flex items-center justify-end gap-1">
                  {/* Chek YANGI OYNADA ochiladi: kassirning ro'yxati,
                      filtri va sahifasi joyida qoladi. Bekor qilingani ham
                      chop etiladi — ota-onada qo'lidagi nusxa qolgan
                      bo'lishi mumkin va uni solishtirish kerak bo'ladi. */}
                  <Link
                    target="_blank"
                    title="Chekni chop etish"
                    to={`/finance/receipt/${payment.id}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Printer className="size-3.5" />
                  </Link>

                  {!payment.isVoided && (
                    <Can do="finance.void">
                      <button
                        title="Bekor qilish"
                        onClick={() => askVoid(payment)}
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
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(next) => setParam("page", next)}
        />
      )}

      <ReasonModal />
    </div>
  );
};

export default PaymentsPage;
