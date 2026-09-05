// React
import { useEffect, useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
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

/**
 * OYLIK REJA (BYUDJET) — dashboarddagi "Reja:" raqamlarini shu yerdan
 * kiritiladi.
 *
 * ⚠️ "Amalda" ustuni FAQAT NPS uchun ochiq (server `manualActual` bayrog'i
 * bilan aytadi): qolgan hamma ko'rsatkichning amaldagi qiymati tizimdan
 * hisoblanadi va uni qo'lda yozib qo'yish hisobotni yolg'onlashtirishning
 * eng oson yo'li bo'lardi. Server bunday urinishni ham rad etadi — bu
 * yerda maydon shunchaki chizilmaydi.
 */
export const TargetsModal = () => (
  <ResponsiveModal
    name="financeTargets"
    title="Oylik reja (byudjet)"
    className="max-w-2xl"
  >
    <TargetsForm />
  </ResponsiveModal>
);

const TargetsForm = ({ close, isLoading, setIsLoading, month }) => {
  const { data, isLoading: isFetching } = useQuery({
    ...dashboardQueries.targets({ month }),
    enabled: month != null,
  });

  const { mutate: saveTargets } = useSaveTargets();

  // Serverdan kelgan qatorlar formaga ko'chiriladi. `useObjectState` emas:
  // maydonlar ro'yxati SERVERDAN keladi (metrikalar katalogi u yerda), shu
  // sababli boshlang'ich shakl oldindan ma'lum emas.
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!data?.items) return;
    const next = {};
    for (const item of data.items) {
      next[item.metric] = {
        planValue: item.planValue == null ? "" : String(Number(item.planValue)),
        actualValue: item.actualValue == null ? "" : String(Number(item.actualValue)),
      };
    }
    setValues(next);
  }, [data]);

  const setField = (metric, field, value) =>
    setValues((prev) => ({
      ...prev,
      [metric]: { ...(prev[metric] ?? { planValue: "", actualValue: "" }), [field]: value },
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.items) return;

    setIsLoading(true);

    saveTargets(
      {
        month: data.month,
        items: data.items.map((item) => ({
          metric: item.metric,
          // Bo'sh qiymat — rejani OLIB TASHLASH: server o'sha qatorni
          // o'chiradi va dashboardda "Reja: —" bo'lib qoladi
          planValue: values[item.metric]?.planValue?.trim() || null,
          actualValue: item.manualActual
            ? values[item.metric]?.actualValue?.trim() || null
            : undefined,
        })),
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

  const groups = [...new Set(data.items.map((item) => item.group))];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{formatMonthKey(data.month)}</span> uchun
        reja. Bo'sh qoldirilgan qator rejadan olib tashlanadi va dashboardda
        "Reja: —" bo'lib ko'rinadi.
      </p>

      <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group} className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {GROUP_LABELS[group] ?? group}
            </p>

            {data.items
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
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        placeholder="Reja"
                        className="w-36 pr-12 text-right"
                        value={values[item.metric]?.planValue ?? ""}
                        onChange={(e) => setField(item.metric, "planValue", e.target.value)}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                        {UNIT_SUFFIX[item.kind]}
                      </span>
                    </div>

                    {item.manualActual && (
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          placeholder="Amalda"
                          className="w-32 pr-8 text-right"
                          value={values[item.metric]?.actualValue ?? ""}
                          onChange={(e) =>
                            setField(item.metric, "actualValue", e.target.value)
                          }
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                          {UNIT_SUFFIX[item.kind]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
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

export default TargetsModal;
