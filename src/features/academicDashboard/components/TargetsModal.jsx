// React
import { useState } from "react";

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

// Data
import { UNIT_SUFFIX } from "../data/academicDashboard.data";

// Queries
import { academicQueries, useSaveTargets } from "../queries/academicDashboard.queries";

/**
 * OYLIK AKADEMIK REJA — dashboarddagi "Reja:" raqamlari shu yerdan
 * kiritiladi.
 *
 * ⚠️ MOLIYA REJASIDAN IKKI FARQI BOR:
 *   1. Qo'lda qo'shiladigan qator YO'Q — akademik ko'rsatkichlar ro'yxati
 *      yopiq, chunki ularning har biri aniq bir jadvaldan hisoblanadi.
 *   2. "Amalda" ustuni YO'Q — u har safar qaytadan hisoblanadi. Qo'lda
 *      yozib qo'yish hisobotni "chiroyli" qilishning eng oson yo'li
 *      bo'lardi va server bunday urinishni ham qabul qilmaydi.
 */
export const TargetsModal = () => (
  <ResponsiveModal name="academicTargets" title="Oylik akademik reja" className="max-w-2xl">
    <TargetsForm />
  </ResponsiveModal>
);

const TargetsForm = ({ close, isLoading, setIsLoading, month }) => {
  const { data, isLoading: isFetching } = useQuery({
    ...academicQueries.targets({ month }),
    enabled: month != null,
  });

  const { mutate: saveTargets } = useSaveTargets();

  /**
   * FAQAT TAHRIRLANGAN qatorlar holatda saqlanadi (metric → matn).
   *
   * ⚠️ Server qiymatini `useEffect` bilan holatga KO'CHIRMAYMIZ: shu
   * naqsh tufayli so'rov qayta yuklanganda foydalanuvchining yozayotgani
   * jimgina eski qiymatga qaytib qolardi. Ko'rsatiladigan qiymat esa
   * "tahrir bo'lsa — tahrir, bo'lmasa — serverniki".
   */
  const [edits, setEdits] = useState({});

  const valueOf = (item) =>
    edits[item.metric] ?? (item.planValue == null ? "" : String(Number(item.planValue)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.items) return;

    setIsLoading(true);

    saveTargets(
      {
        month: data.month,
        // Bo'sh qiymat rejani OLIB TASHLAYDI — buning uchun alohida
        // tugma kerak emas
        items: data.items.map((item) => ({
          metric: item.metric,
          planValue: valueOf(item).trim() || null,
        })),
      },
      {
        onSuccess: () => {
          close();
          toast.success("Reja saqlandi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Rejani saqlab bo'lmadi"),
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{formatMonthKey(data.month)}</span> uchun
        reja. Bo'sh qoldirilgan qator rejadan olib tashlanadi va dashboardda "Reja"
        qatori umuman ko'rinmaydi.
      </p>

      <div className="max-h-[55vh] space-y-2.5 overflow-y-auto pr-1">
        {data.items.map((item) => (
          <div
            key={item.metric}
            className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">{item.label}</p>
              {item.hint && <p className="truncate text-[11px] text-gray-400">{item.hint}</p>}
            </div>

            <div className="relative shrink-0">
              <Input
                type="number"
                min="0"
                // Baho kasrli (4.30), sanoq esa butun — server ikkalasini
                // ham tekshiradi, bu yerda faqat kiritish qulayligi
                step={item.kind === "count" ? "1" : "any"}
                inputMode="decimal"
                placeholder="Reja"
                className="w-40 pr-12 text-right"
                value={valueOf(item)}
                onChange={(e) =>
                  setEdits((prev) => ({ ...prev, [item.metric]: e.target.value }))
                }
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                {UNIT_SUFFIX[item.kind]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {/* ⚠️ `loading` propi YO'Q: shadcn Button uni tanimaydi va u DOM
            atributi bo'lib o'tib ketardi. Bosilishni `disabled` to'xtatadi. */}
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Saqlanmoqda…" : "Saqlash"}
        </Button>
        <Button type="button" variant="outline" onClick={() => close()} disabled={isLoading}>
          Bekor qilish
        </Button>
      </div>
    </form>
  );
};

export default TargetsModal;
