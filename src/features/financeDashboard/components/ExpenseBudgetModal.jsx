// React
import { useEffect, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Copy } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatMonthKey, prevMonthKey } from "@/shared/helpers/month.helpers";

// Queries
import {
  dashboardQueries,
  useSaveExpenseBudgets,
} from "../queries/financeDashboard.queries";

/**
 * XARAJAT LIMITLARI — kategoriya bo'yicha oylik shift.
 *
 * ⚠️ Kategoriyalar ro'yxati BU YERDA yaratilmaydi. Ular "Chiqimlar →
 * Kategoriyalar" bo'limida boshqariladi va bu oyna faqat mavjudlariga
 * raqam qo'yadi. Ikkinchi yaratish nuqtasi bo'lsa, bir xil nomli ikkita
 * kategoriya paydo bo'lardi.
 *
 * "O'tgan oydan ko'chirish" — eng ko'p ishlatiladigan amal: limitlar
 * odatda oydan oyga o'zgarmaydi va ularni har oy qo'lda qayta terish
 * rahbarning umuman qo'ymasligiga olib kelardi.
 */
export const ExpenseBudgetModal = () => (
  <ResponsiveModal
    name="expenseBudgets"
    title="Xarajat limitlari"
    className="max-w-2xl"
  >
    <BudgetForm />
  </ResponsiveModal>
);

const BudgetForm = ({ close, isLoading, setIsLoading, month }) => {
  const { data, isLoading: isFetching } = useQuery({
    ...dashboardQueries.expenseBudgets({ month }),
    enabled: month != null,
  });

  // O'tgan oy — "ko'chirish" tugmasi uchun. `enabled` bilan chegaralangan:
  // oyna ochilmaguncha so'rov yuborilmaydi.
  const previousMonth = month != null ? prevMonthKey(Number(month)) : null;
  const { data: previous } = useQuery({
    ...dashboardQueries.expenseBudgets({ month: previousMonth }),
    enabled: month != null,
  });

  const { mutate: saveBudgets } = useSaveExpenseBudgets();

  // Har kategoriya: { kind: "money" | "percentIncome", value: "<so'm yoki foiz>" }
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!data?.items) return;
    const next = {};
    for (const item of data.items) {
      const kind = item.limitKind === "percentIncome" ? "percentIncome" : "money";
      // money → amaldagi so'm (item.limit), percent → foiz (item.limitPercent)
      const value =
        kind === "percentIncome"
          ? item.limitPercent == null
            ? ""
            : String(Number(item.limitPercent))
          : item.limit == null
            ? ""
            : String(Number(item.limit));
      next[item.categoryId] = { kind, value };
    }
    setValues(next);
  }, [data]);

  // Jami hisoblangan majburiyat — "% majburiyat" rejimida amaldagi limitni
  // jonli ko'rsatish uchun
  const accrued = Number(data?.accrued ?? 0);

  /** O'tgan oyning limitlari — kategoriya bo'yicha xarita ({kind, value}). */
  const previousByCategory = useMemo(() => {
    const map = new Map();
    for (const item of previous?.items ?? []) {
      if (item.limitKind === "percentIncome" && item.limitPercent != null) {
        map.set(item.categoryId, {
          kind: "percentIncome",
          value: String(Number(item.limitPercent)),
        });
      } else if (item.limit != null) {
        map.set(item.categoryId, { kind: "money", value: String(Number(item.limit)) });
      }
    }
    return map;
  }, [previous]);

  const copyPrevious = () => {
    if (previousByCategory.size === 0) {
      return toast.error("O'tgan oyda limit belgilanmagan");
    }
    setValues((prev) => {
      const next = { ...prev };
      for (const [categoryId, entry] of previousByCategory) next[categoryId] = { ...entry };
      return next;
    });
    toast.success(`${previousByCategory.size} ta limit ko'chirildi`);
  };

  // Kiritilayotgan AMALDAGI limitlar yig'indisi — foiz rejimi majburiyatdan
  // hisoblanadi. Rahbar saqlashdan OLDIN "jami qancha" ni ko'rishi kerak.
  const totalLimit = useMemo(
    () =>
      Object.values(values).reduce((acc, entry) => {
        if (!entry || entry.value === "") return acc;
        const n = Number(entry.value);
        if (!Number.isFinite(n)) return acc;
        const eff =
          entry.kind === "percentIncome" ? (Math.max(0, accrued) * n) / 100 : n;
        return acc + eff;
      }, 0),
    [values, accrued],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.items) return;

    setIsLoading(true);

    saveBudgets(
      {
        month: data.month,
        // Arxivlangan kategoriya ro'yxatda faqat KO'RSATISH uchun turadi
        // (unga o'tgan xarajat tushgan), lekin unga limit qo'yilmaydi
        items: data.items
          .filter((item) => !item.isArchived)
          .map((item) => {
            const entry = values[item.categoryId] ?? { kind: "money", value: "" };
            const value = entry.value?.trim() || null; // bo'sh → limitni OLIB TASHLASH
            return {
              categoryId: item.categoryId,
              limitKind: entry.kind,
              limitAmount: entry.kind === "money" ? value : null,
              limitPercent: entry.kind === "percentIncome" ? value : null,
            };
          }),
      },
      {
        onSuccess: () => {
          close();
          toast.success("Limitlar saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Limitlarni saqlab bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  if (isFetching || !data) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    );
  }

  const editable = data.items.filter((item) => !item.isArchived);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 p-3">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{formatMonthKey(data.month)}</span>{" "}
          uchun limit. Bo'sh qator limitsiz qoladi.
        </p>

        {previousByCategory.size > 0 && (
          <button
            type="button"
            onClick={copyPrevious}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Copy className="size-3.5" />
            O'tgan oydan ko'chirish
          </button>
        )}
      </div>

      <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
        {editable.map((item) => {
          const entry = values[item.categoryId] ?? { kind: "money", value: "" };
          const isPct = entry.kind === "percentIncome";
          const n = Number(entry.value);
          const hasValue = entry.value !== "" && Number.isFinite(n);
          // Amaldagi limit — foiz rejimida hisoblangan majburiyatdan hisoblanadi
          const effective = !hasValue
            ? 0
            : isPct
              ? (Math.max(0, accrued) * n) / 100
              : n;
          const spent = Number(item.spent);
          // Limit allaqachon sarflanganidan kam bo'lsa — darhol ko'rsatiladi
          const willOverflow = effective > 0 && spent > effective;

          const setEntry = (patch) =>
            setValues((prev) => ({
              ...prev,
              [item.categoryId]: {
                ...(prev[item.categoryId] ?? { kind: "money", value: "" }),
                ...patch,
              },
            }));

          return (
            <div key={item.categoryId} className="rounded-xl border border-gray-100 p-2.5">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-700">{item.name}</p>
                  <p
                    className={cn(
                      "truncate text-[11px]",
                      willOverflow ? "text-red-500" : "text-gray-400",
                    )}
                  >
                    Sarflandi: {formatMoney(item.spent)}
                    {willOverflow && " — limitdan ko'p"}
                  </p>
                </div>

                {/* Rejim: qat'iy summa yoki majburiyat foizi */}
                <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setEntry({ kind: "money" })}
                    className={cn(
                      "px-2.5 py-1.5 font-medium transition-colors",
                      !isPct ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50",
                    )}
                  >
                    so'm
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntry({ kind: "percentIncome" })}
                    className={cn(
                      "px-2.5 py-1.5 font-medium transition-colors",
                      isPct ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50",
                    )}
                  >
                    % majburiyat
                  </button>
                </div>

                <div className="relative shrink-0">
                  <Input
                    type="number"
                    min="0"
                    step={isPct ? "1" : "1000"}
                    inputMode="numeric"
                    placeholder={isPct ? "Foiz" : "Limit"}
                    className={cn(
                      "w-32 pr-10 text-right",
                      willOverflow && "border-red-300",
                    )}
                    value={entry.value}
                    onChange={(e) => setEntry({ value: e.target.value })}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                    {isPct ? "%" : "so'm"}
                  </span>
                </div>
              </div>

              {/* Foiz rejimida amaldagi so'm — majburiyat o'zgarsa o'zgaradi */}
              {isPct && hasValue && (
                <p className="mt-1.5 text-right text-[11px] text-gray-500">
                  Amaldagi limit:{" "}
                  <b className="tabular-nums text-gray-700">
                    {formatMoney(String(Math.round(effective)))}
                  </b>{" "}
                  so'm <span className="text-gray-400">(majburiyatning {n}% i)</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs">
        <span className="text-gray-500">Jami limit</span>
        <span className="font-bold tabular-nums text-gray-900">
          {formatMoney(String(totalLimit))}
        </span>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" loading={isLoading} disabled={isLoading}>
          Saqlash
        </Button>
        <Button type="button" variant="outline" onClick={() => close()} disabled={isLoading}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default ExpenseBudgetModal;
