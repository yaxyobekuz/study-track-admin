// React
import { useEffect, useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Plus, X } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { formatMonthKey } from "@/shared/helpers/month.helpers";

// Queries
import { dashboardQueries, useSaveTargets } from "../queries/financeDashboard.queries";

/** Guruh sarlavhalari — server `group` maydonini yuboradi. */
const GROUP_LABELS = {
  pnl: "Moliyaviy natija",
  kpi: "Maktab ko'rsatkichlari",
};

const UNIT_SUFFIX = {
  money: "so'm",
  percent: "%",
  count: "ta",
};

/** Qo'lda qo'shilgan qatorning o'lchov turi. */
const KIND_OPTIONS = [
  { label: "So'm", value: "money" },
  { label: "Foiz (%)", value: "percent" },
  { label: "Dona", value: "count" },
];

/** Hali saqlanmagan qator uchun vaqtincha kalit. */
let tempSeq = 0;
const nextTempId = () => `temp-${(tempSeq += 1)}`;

/**
 * OYLIK REJA (BYUDJET) — dashboarddagi "Reja:" raqamlari shu yerdan
 * kiritiladi.
 *
 * Ikki xil qator bor:
 *   KATALOG  — tizim biladigan ko'rsatkichlar (tushum, xarajat, davomat…).
 *              Nomi va turi o'zgarmaydi, amaldagi qiymati hisoblanadi.
 *   QO'LDA   — rahbar o'zi qo'shgan satrlar ("Tashqi qarz", "Ta'sischiga
 *              to'lov"). Tizimda manbasi yo'q, shuning uchun amaldagi
 *              qiymat ham qo'lda kiritiladi.
 *
 * ⚠️ Katalog qatorining "amalda" ustuni FAQAT NPS uchun ochiq (server
 * `manualActual` bayrog'i bilan aytadi): hisoblanadigan ko'rsatkichga
 * qo'lda "amalda" yozib qo'yish hisobotni yolg'onlashtirishning eng oson
 * yo'li bo'lardi. Server bunday urinishni ham rad etadi.
 */
export const TargetsModal = () => (
  <ResponsiveModal name="financeTargets" title="Oylik reja (byudjet)" className="max-w-3xl">
    <TargetsForm />
  </ResponsiveModal>
);

const TargetsForm = ({ close, isLoading, setIsLoading, month }) => {
  const { data, isLoading: isFetching } = useQuery({
    ...dashboardQueries.targets({ month }),
    enabled: month != null,
  });

  const { mutate: saveTargets } = useSaveTargets();

  // Katalog qatorlari: metric → { planValue, actualValue }
  const [values, setValues] = useState({});
  // Qo'lda qo'shilganlari: alohida ro'yxat — ular tartibli va o'chiriladi
  const [customRows, setCustomRows] = useState([]);
  // Saqlangan-u endi o'chirilayotgan qatorlar (serverga null bilan ketadi)
  const [removed, setRemoved] = useState([]);

  useEffect(() => {
    if (!data?.items) return;

    const next = {};
    const custom = [];

    for (const item of data.items) {
      if (item.isCustom) {
        custom.push({
          tempId: item.metric,
          metric: item.metric,
          label: item.label,
          kind: item.kind,
          planValue: item.planValue == null ? "" : String(Number(item.planValue)),
          actualValue: item.actualValue == null ? "" : String(Number(item.actualValue)),
        });
        continue;
      }

      next[item.metric] = {
        planValue: item.planValue == null ? "" : String(Number(item.planValue)),
        actualValue: item.actualValue == null ? "" : String(Number(item.actualValue)),
      };
    }

    setValues(next);
    setCustomRows(custom);
    setRemoved([]);
  }, [data]);

  const setField = (metric, field, value) =>
    setValues((prev) => ({
      ...prev,
      [metric]: { ...(prev[metric] ?? { planValue: "", actualValue: "" }), [field]: value },
    }));

  const setCustomField = (tempId, field, value) =>
    setCustomRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, [field]: value } : row)),
    );

  const addCustomRow = () =>
    setCustomRows((prev) => [
      ...prev,
      { tempId: nextTempId(), metric: null, label: "", kind: "money", planValue: "", actualValue: "" },
    ]);

  const removeCustomRow = (row) => {
    // Saqlangan qator serverdan O'CHIRILISHI kerak — shunchaki ro'yxatdan
    // olib tashlash yetmaydi: yuborilmagan metrika o'z holicha qolardi
    if (row.metric) setRemoved((prev) => [...prev, row.metric]);
    setCustomRows((prev) => prev.filter((item) => item.tempId !== row.tempId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.items) return;

    const named = customRows.filter((row) => row.label.trim());
    if (named.length !== customRows.length) {
      return toast.error("Qo'lda qo'shilgan qatorning nomini kiriting");
    }

    setIsLoading(true);

    saveTargets(
      {
        month: data.month,
        items: [
          // Katalog qatorlari — bo'sh qiymat rejani OLIB TASHLAYDI
          ...data.items
            .filter((item) => !item.isCustom)
            .map((item) => ({
              metric: item.metric,
              planValue: values[item.metric]?.planValue?.trim() || null,
              actualValue: item.manualActual
                ? values[item.metric]?.actualValue?.trim() || null
                : undefined,
            })),

          // Qo'lda qo'shilganlari — yangi qatorda `metric` yo'q, kalitni
          // server beradi
          ...named.map((row) => ({
            ...(row.metric ? { metric: row.metric } : {}),
            label: row.label.trim(),
            kind: row.kind,
            planValue: row.planValue?.trim() || null,
            actualValue: row.actualValue?.trim() || null,
          })),

          // O'chirilganlari
          ...removed.map((metric) => ({ metric, planValue: null })),
        ],
      },
      {
        onSuccess: () => {
          close();
          toast.success("Reja saqlandi");
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

  const catalog = data.items.filter((item) => !item.isCustom);
  const groups = [...new Set(catalog.map((item) => item.group))];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{formatMonthKey(data.month)}</span> uchun
        reja. Bo'sh qoldirilgan qator rejadan olib tashlanadi va dashboardda
        "Reja: —" bo'lib ko'rinadi.
      </p>

      <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
        {/* ── Katalog ko'rsatkichlari ─────────────────────────────── */}
        {groups.map((group) => (
          <div key={group} className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {GROUP_LABELS[group] ?? group}
            </p>

            {catalog
              .filter((item) => item.group === group)
              .map((item) => (
                <div
                  key={item.metric}
                  className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-700">{item.label}</p>
                    {item.hint && (
                      <p className="truncate text-[11px] text-gray-400">{item.hint}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <ValueInput
                      placeholder="Reja"
                      suffix={UNIT_SUFFIX[item.kind]}
                      value={values[item.metric]?.planValue ?? ""}
                      onChange={(v) => setField(item.metric, "planValue", v)}
                    />

                    {item.manualActual && (
                      <ValueInput
                        placeholder="Amalda"
                        className="w-32"
                        suffix={UNIT_SUFFIX[item.kind]}
                        value={values[item.metric]?.actualValue ?? ""}
                        onChange={(v) => setField(item.metric, "actualValue", v)}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}

        {/* ── Qo'lda qo'shilgan qatorlar ──────────────────────────── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Boshqa qatorlar
            </p>
            <button
              type="button"
              onClick={addCustomRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              Yangi qator
            </button>
          </div>

          {customRows.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-400">
              Tizimda hisoblanmaydigan ko'rsatkichni shu yerdan qo'shasiz —
              masalan "Tashqi qarz" yoki "Ta'sischiga to'lov". Bunday
              qatorning amaldagi qiymati ham qo'lda kiritiladi.
            </p>
          )}

          {customRows.map((row) => (
            <div
              key={row.tempId}
              className="grid grid-cols-1 items-center gap-2 rounded-xl border border-gray-100 p-2.5 sm:grid-cols-[1fr_auto]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Input
                  value={row.label}
                  placeholder="Qator nomi"
                  className="min-w-0 flex-1"
                  onChange={(e) => setCustomField(row.tempId, "label", e.target.value)}
                />
                <Select
                  value={row.kind}
                  options={KIND_OPTIONS}
                  triggerClassName="w-28 shrink-0"
                  onChange={(v) => setCustomField(row.tempId, "kind", v)}
                />
              </div>

              <div className="flex items-center gap-2">
                <ValueInput
                  placeholder="Reja"
                  suffix={UNIT_SUFFIX[row.kind]}
                  value={row.planValue}
                  onChange={(v) => setCustomField(row.tempId, "planValue", v)}
                />
                <ValueInput
                  placeholder="Amalda"
                  className="w-32"
                  suffix={UNIT_SUFFIX[row.kind]}
                  value={row.actualValue}
                  onChange={(v) => setCustomField(row.tempId, "actualValue", v)}
                />
                <button
                  type="button"
                  title="Qatorni o'chirish"
                  onClick={() => removeCustomRow(row)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
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

/** Raqam maydoni — o'ng chetida o'lchov birligi. */
const ValueInput = ({ value, onChange, placeholder, suffix, className = "w-36" }) => (
  <div className="relative shrink-0">
    <Input
      type="number"
      min="0"
      step="any"
      inputMode="decimal"
      placeholder={placeholder}
      className={`${className} pr-12 text-right`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
      {suffix}
    </span>
  </div>
);

export default TargetsModal;
