// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowRight } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import { Notice } from "./DeductionModals";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { payrollQueries } from "../queries/payroll.queries";
import { useRecalcPayroll } from "../queries/payroll.mutations";

export const RecalcPayrollModal = () => (
  <ResponsiveModal name="recalcPayroll" title="Oylikni qayta hisoblash" className="max-w-2xl">
    <RecalcPayrollForm />
  </ResponsiveModal>
);

/** Qator nima uchun o'zgarayotgani — oynada qisqa izoh. */
const changeNotes = (item) => {
  const notes = [];
  const { before, after } = item;
  if (!after) return notes;
  if (before.salaryTypeLabel !== after.salaryTypeLabel) {
    notes.push(`${before.salaryTypeLabel} → ${after.salaryTypeLabel}`);
  }
  if (Number(before.baseAmount) !== Number(after.baseAmount)) {
    notes.push(`oylik ${formatMoney(before.baseAmount)} → ${formatMoney(after.baseAmount)}`);
  }
  if (Number(before.deductionAmount) !== Number(after.deductionAmount)) {
    notes.push(
      Number(after.deductionAmount) === 0
        ? "ushlab qolish yechildi"
        : `ushlab qolish ${formatMoney(before.deductionAmount)} → ${formatMoney(after.deductionAmount)}`,
    );
  }
  if (Number(before.suspendedAmount) !== Number(after.suspendedAmount)) {
    notes.push(`to'xtatilgan ${formatMoney(before.suspendedAmount)} → ${formatMoney(after.suspendedAmount)}`);
  }
  if (Number(before.allowanceAmount) !== Number(after.allowanceAmount)) {
    notes.push(`ustama ${formatMoney(before.allowanceAmount)} → ${formatMoney(after.allowanceAmount)}`);
  }
  return notes;
};

/**
 * QAYTA HISOBLASH — muhrlangan oylikni AMALDAGI shartnomaga keltiradi.
 *
 * Shartnoma muhrdan keyin o'zgarsa (soatbaydan fiksaga o'tdi, maosh oshdi)
 * yoki ushlab qolish bekor qilinsa, to'lov tushgan qator eski summada qotib
 * qolardi. Bu oyna qatorni joyida qayta yozadi: to'lov, chek va kassa
 * TEGILMAYDI, faqat oylik summasi va qoldiq qarz.
 *
 * ⚠️ PUL FRONTENDDA HISOBLANMAYDI: ro'yxat serverdan (`/payroll/recalc/preview`),
 * yozish ham AYNI hisob bilan — oynada ko'rilgan raqam yoziladi.
 *
 * @param {object} props - `openModal("recalcPayroll", { month, entryIds?, staffName? })`
 */
const RecalcPayrollForm = ({ close, isLoading, setIsLoading, month, entryIds, staffName }) => {
  const { can } = usePermissions();
  // Yozish uchun `assign` ham kerak (server ham tekshiradi)
  const canApply = can("payroll.assign");

  const [reason, setReason] = useState("");
  const { mutate: recalc } = useRecalcPayroll();

  const { data: preview, isLoading: isPreviewing, error } = useQuery(
    payrollQueries.recalcPreview({ month, entryIds }),
  );

  const items = preview?.items ?? [];
  const changed = items.filter((item) => item.status === "changed");
  const blocked = items.filter((item) => item.status === "blocked");
  const totals = preview?.totals;

  const canSave = canApply && changed.length > 0 && Boolean(reason.trim()) && !isLoading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;

    setIsLoading(true);
    recalc(
      { month, ...(entryIds ? { entryIds } : {}), reason: reason.trim() },
      {
        onSuccess: (result) => {
          close();
          toast.success(`${result.monthLabel}: ${result.updated} ta oylik qayta hisoblandi`);
          if (result.conflicts > 0) {
            toast.warning(
              `${result.conflicts} ta oylik shu orada o'zgardi (to'lov tushgan bo'lishi mumkin) — qaytadan oching`,
            );
          }
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">
          {staffName || "Barcha xodimlar"}
          {preview?.monthLabel ? ` · ${preview.monthLabel}` : ""}
        </p>
        <p className="mt-0.5 text-gray-500">
          Oylik amaldagi shartnoma bo'yicha qayta yoziladi. To'lovlar, chek va kassa o'zgarmaydi —
          faqat oylik summasi va qoldiq qarz.
        </p>
      </div>

      {isPreviewing ? (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Hisoblanmoqda...</p>
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error.response?.data?.message || "Hisoblab bo'lmadi"}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
          Hamma oyliklar amaldagi shartnomaga mos — o'zgaradigan narsa yo'q.
        </p>
      ) : (
        <>
          {changed.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-gray-700">
                  {changed.length} ta oylik o'zgaradi
                </p>
                <p className="text-sm text-gray-600">
                  {formatMoney(totals.beforeAmount)} → <b>{formatMoney(totals.afterAmount)}</b>
                </p>
              </div>

              <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200">
                {changed.map((item) => {
                  const diff = Number(item.diffAmount);
                  const notes = changeNotes(item);
                  return (
                    <div key={item.entryId} className="space-y-1 px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="min-w-0 truncate text-sm font-medium text-gray-900">
                          {item.staffName}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm tabular-nums">
                          <span className="text-gray-500">{formatMoney(item.before.amount)}</span>
                          <ArrowRight className="size-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {formatMoney(item.after.amount)}
                          </span>
                          <span
                            className={cn(
                              "text-xs",
                              diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-400",
                            )}
                          >
                            ({diff > 0 ? "+" : diff < 0 ? "−" : ""}
                            {formatMoney(Math.abs(diff))})
                          </span>
                        </p>
                      </div>
                      {notes.length > 0 && (
                        <p className="text-xs text-gray-500">{notes.join(" · ")}</p>
                      )}
                      {Number(item.paidAmount) > 0 && (
                        <p className="text-xs text-teal-700">
                          To'langan {formatMoney(item.paidAmount)} — o'zgarmaydi, qoldiq{" "}
                          {formatMoney(Number(item.after.amount) - Number(item.paidAmount))}
                        </p>
                      )}
                      {item.hoursPending && (
                        <Notice>
                          Dars soati bo'yicha qism oy yopilgach yangilanadi — hozir faqat ushlab
                          qolish, to'xtatish va tyutor puli.
                        </Notice>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {blocked.length > 0 && (
            <div className="space-y-1.5 rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800">
                {blocked.length} ta oylik o'zgartirilmaydi
              </p>
              {blocked.map((item) => (
                <p key={item.entryId} className="text-xs text-amber-800">
                  <b>{item.staffName}</b> — {item.reasonLabel}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {changed.length > 0 &&
        (canApply ? (
          <>
            <InputField
              required
              name="reason"
              label="Sabab"
              value={reason}
              maxLength={200}
              placeholder="Masalan: shartnoma fiksaga o'tkazildi, ushlab qolish bekor qilingan"
              onChange={(event) => setReason(event.target.value)}
            />
            <Button type="submit" className="w-full" loading={isLoading} disabled={!canSave}>
              Qayta hisoblash ({changed.length} ta)
            </Button>
          </>
        ) : (
          <Notice>Qo'llash uchun "Oylik belgilash" ruxsati ham kerak.</Notice>
        ))}
    </form>
  );
};
