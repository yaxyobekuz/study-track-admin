// React
import { useEffect, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Copy, Plus, X } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatMonthKey, prevMonthKey } from "@/shared/helpers/month.helpers";

// Queries
import { usersQueries } from "@/features/users/queries/users.queries";
import {
  dashboardQueries,
  useSaveIncomePlans,
} from "../queries/financeDashboard.queries";

/** Hali saqlanmagan qator uchun vaqtincha kalit. */
let tempSeq = 0;
const nextTempId = () => `new-${(tempSeq += 1)}`;

/**
 * YIG'ISH REJASI — mas'ul xodim × kirim turi kesimida oylik reja.
 *
 * ⚠️ Kirim turlari ro'yxati BU YERDA yaratilmaydi — ular "Tashqi kirimlar →
 * Sozlamalar" da boshqariladi. Bu oyna faqat mavjudlariga raqam qo'yadi.
 *
 * "O'tgan oydan ko'chirish" — eng ko'p ishlatiladigan amal: rejalar odatda
 * oydan oyga o'zgarmaydi va ularni har oy qo'lda qayta terish rahbarning
 * umuman qo'ymasligiga olib kelardi.
 */
export const IncomePlanModal = () => (
  <ResponsiveModal
    name="incomePlans"
    title="Bo'limlar bo'yicha yig'im rejasi"
    className="max-w-3xl"
  >
    <PlanForm />
  </ResponsiveModal>
);

const PlanForm = ({ close, isLoading, setIsLoading, month }) => {
  const { data, isLoading: isFetching } = useQuery({
    ...dashboardQueries.incomePlans({ month }),
    enabled: month != null,
  });

  const previousMonth = month != null ? prevMonthKey(Number(month)) : null;
  const { data: previous } = useQuery({
    ...dashboardQueries.incomePlans({ month: previousMonth }),
    enabled: month != null,
  });

  // `allShort` — ruxsatga bog'liq bo'lmagan qisqa ro'yxat; o'quvchilar
  // mijozda filtrlanadi (server ham rad etadi, bu faqat UI qatlami)
  const { data: people = [] } = useQuery(usersQueries.allShort());
  const { mutate: savePlans } = useSaveIncomePlans();

  const [rows, setRows] = useState([]);
  const [removed, setRemoved] = useState([]);

  useEffect(() => {
    if (!data?.items) return;

    setRows(
      data.items
        // Rejasi yo'q qatorlar ham chiqadi: aynan ularga reja qo'yiladi
        .filter((item) => item.responsibleId)
        .map((item) => ({
          tempId: item.key,
          saved: item.hasPlan,
          responsibleId: item.responsibleId,
          categoryId: item.categoryId,
          targetAmount: item.target == null ? "" : String(Number(item.target)),
          studentCount: item.studentCount ? String(item.studentCount) : "",
          collected: item.collected,
        })),
    );
    setRemoved([]);
  }, [data]);

  const staffOptions = useMemo(
    () =>
      people
        .filter((person) => person.role !== "student")
        .map((person) => ({
          label:
            person.fullName ||
            `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim(),
          value: person.id,
        })),
    [people],
  );

  const categoryOptions = useMemo(
    () => (data?.categories ?? []).map((c) => ({ label: c.name, value: c.id })),
    [data],
  );

  const setField = (tempId, field, value) =>
    setRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, [field]: value } : row)),
    );

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        tempId: nextTempId(),
        saved: false,
        responsibleId: "",
        categoryId: "",
        targetAmount: "",
        studentCount: "",
        collected: "0",
      },
    ]);

  const removeRow = (row) => {
    // Saqlangan qator serverdan O'CHIRILISHI kerak — shunchaki ro'yxatdan
    // olib tashlash yetmaydi: yuborilmagan juftlik o'z holicha qolardi
    if (row.saved) {
      setRemoved((prev) => [
        ...prev,
        { responsibleId: row.responsibleId, categoryId: row.categoryId },
      ]);
    }
    setRows((prev) => prev.filter((item) => item.tempId !== row.tempId));
  };

  const copyPrevious = () => {
    const source = (previous?.items ?? []).filter((item) => item.hasPlan);
    if (source.length === 0) return toast.error("O'tgan oyda reja belgilanmagan");

    setRows((prev) => {
      const byKey = new Map(prev.map((row) => [`${row.responsibleId}::${row.categoryId}`, row]));

      for (const item of source) {
        const key = `${item.responsibleId}::${item.categoryId}`;
        const existing = byKey.get(key);
        const patch = {
          targetAmount: String(Number(item.target)),
          studentCount: item.studentCount ? String(item.studentCount) : "",
        };

        if (existing) byKey.set(key, { ...existing, ...patch });
        else
          byKey.set(key, {
            tempId: nextTempId(),
            saved: false,
            responsibleId: item.responsibleId,
            categoryId: item.categoryId,
            collected: "0",
            ...patch,
          });
      }

      return [...byKey.values()];
    });

    toast.success(`${source.length} ta reja ko'chirildi`);
  };

  const totalTarget = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const n = Number(row.targetAmount);
        return Number.isFinite(n) ? acc + n : acc;
      }, 0),
    [rows],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data) return;

    const filled = rows.filter((row) => row.responsibleId && row.categoryId);
    if (filled.length !== rows.length) {
      return toast.error("Har qatorda mas'ul va kirim turi tanlangan bo'lishi kerak");
    }

    // Bir xil juftlik ikki marta — server ham rad etadi, lekin xabar bu
    // yerda aniqroq bo'ladi
    const keys = filled.map((row) => `${row.responsibleId}::${row.categoryId}`);
    if (new Set(keys).size !== keys.length) {
      return toast.error("Bitta mas'ul va kirim turi ikki marta kiritilgan");
    }

    setIsLoading(true);

    savePlans(
      {
        month: data.month,
        items: [
          ...filled.map((row) => ({
            responsibleId: row.responsibleId,
            categoryId: row.categoryId,
            targetAmount: row.targetAmount?.trim() || null,
            studentCount: Number(row.studentCount) || 0,
          })),
          ...removed.map((row) => ({ ...row, targetAmount: null })),
        ],
      },
      {
        onSuccess: () => {
          close();
          toast.success("Yig'im rejasi saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Rejani saqlab bo'lmadi"),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 p-3">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{formatMonthKey(data.month)}</span>{" "}
          uchun reja. Bo'sh summa qatorni olib tashlaydi.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyPrevious}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Copy className="size-3.5" />
            O'tgan oydan ko'chirish
          </button>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="size-3.5" />
            Yangi qator
          </button>
        </div>
      </div>

      <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-400">
            Hali reja yo'q. "Yangi qator" bilan mas'ul xodim va kirim turini
            tanlab, oylik yig'im summasini qo'ying.
          </p>
        )}

        {rows.map((row) => {
          const collected = Number(row.collected);
          const target = Number(row.targetAmount || 0);
          const behind = target > 0 && collected < target;

          return (
            <div
              key={row.tempId}
              className="space-y-2 rounded-xl border border-gray-100 p-2.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={row.responsibleId}
                  options={staffOptions}
                  placeholder="Mas'ul shaxs"
                  triggerClassName="min-w-44 flex-1"
                  onChange={(v) => setField(row.tempId, "responsibleId", v)}
                />
                <Select
                  value={row.categoryId}
                  options={categoryOptions}
                  placeholder="Kirim turi"
                  triggerClassName="min-w-40 flex-1"
                  onChange={(v) => setField(row.tempId, "categoryId", v)}
                />
                <button
                  type="button"
                  title="Qatorni o'chirish"
                  onClick={() => removeRow(row)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    placeholder="Reja"
                    className="w-40 pr-12 text-right"
                    value={row.targetAmount}
                    onChange={(e) => setField(row.tempId, "targetAmount", e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                    so'm
                  </span>
                </div>

                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="O'quvchi"
                    className="w-28 pr-8 text-right"
                    value={row.studentCount}
                    onChange={(e) => setField(row.tempId, "studentCount", e.target.value)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                    ta
                  </span>
                </div>

                {/* Amaldagi yig'im — reja qo'yayotganda ko'rinib tursin */}
                <p className={cn("text-[11px]", behind ? "text-amber-600" : "text-gray-400")}>
                  Yig'ildi: {formatMoney(row.collected)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs">
        <span className="text-gray-500">Jami reja</span>
        <span className="font-bold tabular-nums text-gray-900">
          {formatMoney(String(totalTarget))}
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

export default IncomePlanModal;
