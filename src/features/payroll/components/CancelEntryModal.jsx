// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronDown } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import { Notice, Segmented } from "./DeductionModals";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  PAYROLL_SEAL_HINT,
  SUSPENSION_MAX_MONTHS,
  SUSPENSION_PERIOD_OPTIONS,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import { useCancelEntry, useCreateSuspension } from "../queries/payroll.mutations";

/** YYYYMM oraliqdagi oylar soni (inklyuziv). */
const monthSpan = (from, to) =>
  Math.floor(to / 100) * 12 + (to % 100) - (Math.floor(from / 100) * 12 + (from % 100)) + 1;

const ALL_KEY = "all";
const BASE_KEY = "base";

export const CancelPayrollEntryModal = () => (
  <ResponsiveModal name="cancelPayrollEntry" title="Oylikni bekor qilish" className="max-w-2xl">
    <CancelEntryForm />
  </ResponsiveModal>
);

/**
 * OYLIKNI BEKOR QILISH — majburiyat qatoridan.
 *
 * Asosiy yo'l — "Oylikni to'xtatish" (`PayrollSuspension`): qaysi OY (bitta
 * yoki oraliq) va NIMA (butun oylik, asosiy oylik, har bir ustama yoki tyutor
 * sinfi) tanlanadi, sabab yoziladi. Bu keyingi shakllantirishda qaytib
 * kelmaydi, xodim o'z profilida sababi bilan ko'radi va bekor qilinsa oylik
 * qaytadi.
 *
 * ⚠️ Eski "majburiyatni bekor qilish" (`cancelEntry`) oylikni TO'XTATMAYDI:
 * keyingi shakllantirish qatorni amaldagi qoidalar bo'yicha qayta tiklaydi.
 * Shuning uchun u pastda alohida — "summa xato hisoblangan" holati uchun.
 *
 * ⚠️ PUL FRONTENDDA HISOBLANMAYDI: natija serverdan (`/payroll/suspensions/preview`).
 */
const CancelEntryForm = ({ close, isLoading, setIsLoading, entry }) => {
  const { mutate: createSuspension } = useCreateSuspension();

  const [selected, setSelected] = useState(() => new Set());
  const { period, startMonth, endMonth, reason, note, setField } = useObjectState({
    period: "once",
    startMonth: monthKeyToInputValue(entry?.month),
    endMonth: monthKeyToInputValue(entry?.month),
    reason: "",
    note: "",
  });

  const startKey = inputValueToMonthKey(startMonth);
  const endKey = period === "once" ? startKey : inputValueToMonthKey(endMonth);

  // Oylik qismlari — tanlangan (boshlanish) oy bo'yicha, muhrlangan bo'lsa muhrdan
  const { data: units, isLoading: unitsLoading } = useQuery(
    payrollQueries.suspensionUnits(entry?.staffId, startKey),
  );

  const options = useMemo(() => {
    const list = [{ key: ALL_KEY, label: "Butun oylik", hint: "Shu oy uchun oylik umuman hisoblanmaydi" }];
    if (Number(units?.base?.amount) > 0) {
      list.push({
        key: BASE_KEY,
        label: "Asosiy oylik",
        hint: "Lavozim maoshi va dars soati puli",
        amount: units.base.amount,
      });
    }
    for (const item of units?.items ?? []) {
      list.push({
        key: item.key,
        label: item.label,
        hint: item.kind === "tutor" ? "Tyutorlik oyligi" : "Qo'shimcha (ustama)",
        amount: item.amount,
      });
    }
    return list;
  }, [units]);

  // Oy almashsa mavjud bo'lmagan qism tanlovdan tushib qoladi
  const validKeys = new Set(options.map((option) => option.key));
  const picked = [...selected].filter((key) => validKeys.has(key));
  const allPicked = picked.includes(ALL_KEY);

  const toggle = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (key === ALL_KEY) {
        next.clear();
        next.add(ALL_KEY);
      } else {
        next.delete(ALL_KEY);
        next.add(key);
      }
      return next;
    });

  const parts = allPicked
    ? [{ component: "all" }]
    : picked.map((key) => (key === BASE_KEY ? { component: "base" } : { component: "item", itemKey: key }));

  const draftError =
    !startKey || !endKey
      ? "Oyni tanlang"
      : endKey < startKey
        ? "Tugash oyi boshlanish oyidan keyin bo'lishi kerak"
        : monthSpan(startKey, endKey) > SUSPENSION_MAX_MONTHS
          ? `Bir amalda ko'pi bilan ${SUSPENSION_MAX_MONTHS} oy`
          : parts.length === 0
            ? "Nimani bekor qilishni belgilang"
            : !reason.trim()
              ? "Sababini yozing"
              : null;

  const draftKey = draftError
    ? null
    : JSON.stringify({
        scope: "staff",
        staffIds: [entry.staffId],
        parts,
        startMonth: startKey,
        endMonth: endKey,
        reason: reason.trim(),
        note: note.trim(),
      });

  const debouncedKey = useDebounce(draftKey, 400);
  const draft = useMemo(() => (debouncedKey ? JSON.parse(debouncedKey) : null), [debouncedKey]);
  const isSettling = draftKey !== debouncedKey;

  const {
    data: preview,
    isFetching: isPreviewing,
    error: previewError,
  } = useQuery(payrollQueries.suspensionPreview(draft));
  const row = preview?.items?.[0] ?? null;

  const canSave =
    Boolean(draftKey) && Boolean(preview) && !previewError && !isSettling && !isPreviewing && !isLoading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;

    setIsLoading(true);
    createSuspension(JSON.parse(draftKey), {
      onSuccess: (result) => {
        close();
        toast.success(`Bekor qilindi: ${result.componentLabel} — ${preview.periodLabel}`);
        if (result.resync.locked.length > 0) {
          toast.warning("Oylikka to'langan pul yangi summadan ko'p — shu oy summasi o'zgarmadi");
        }
      },
      onError: (error) => toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{entry?.staffName}</p>
        <p className="text-gray-500">
          {entry?.monthLabel} · hisoblangan {formatMoney(entry?.amount)}
        </p>
      </div>

      <Can do="payroll.suspend">
        <InputGroup as="form" onSubmit={handleSubmit}>
          {/* ── Qaysi oy ─────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Qaysi oy uchun</p>
            <Segmented
              options={SUSPENSION_PERIOD_OPTIONS}
              value={period}
              onChange={(next) => {
                setField("period", next);
                if (next === "range" && (!endMonth || endMonth < startMonth)) setField("endMonth", startMonth);
              }}
            />
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <InputField
                required
                type="month"
                name="startMonth"
                label={period === "once" ? "Oy" : "Qaysi oydan"}
                value={startMonth}
                onChange={(event) => {
                  setField("startMonth", event.target.value);
                  if (endMonth < event.target.value) setField("endMonth", event.target.value);
                }}
              />
              {period === "range" && (
                <InputField
                  required
                  type="month"
                  name="endMonth"
                  label="Qaysi oygacha"
                  value={endMonth}
                  min={startMonth}
                  onChange={(event) => setField("endMonth", event.target.value)}
                />
              )}
            </div>
          </div>

          {/* ── Nima ─────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Nimani bekor qilish{startKey ? ` — ${formatMonthKey(startKey)} bo'yicha` : ""}
            </p>
            {unitsLoading ? (
              <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Yuklanmoqda...</p>
            ) : (
              <div className="space-y-1.5">
                {options.map((option) => {
                  const checked = picked.includes(option.key);
                  const disabled = allPicked && option.key !== ALL_KEY;
                  return (
                    <label
                      key={option.key}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2",
                        checked ? "border-red-300 bg-red-50/60" : "border-gray-200",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(option.key)}
                        className="size-4 shrink-0 accent-red-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">{option.label}</span>
                        <span className="block text-xs text-gray-500">{option.hint}</span>
                      </span>
                      {option.amount && (
                        <span className="shrink-0 text-sm tabular-nums text-gray-700">
                          {formatMoney(option.amount)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <InputField
            required
            name="reason"
            label="Sabab"
            value={reason}
            maxLength={200}
            placeholder="Masalan: ishga chiqmadi, ta'tilda"
            description="Xodim o'z profilida shu sababni ko'radi"
            onChange={(event) => setField("reason", event.target.value)}
          />

          <InputField
            name="note"
            label="Izoh (ixtiyoriy)"
            value={note}
            maxLength={500}
            onChange={(event) => setField("note", event.target.value)}
          />

          {/* ── Natija ───────────────────────────────── */}
          {draftError ? (
            <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">{draftError}</p>
          ) : previewError ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {previewError.response?.data?.message || "Hisoblab bo'lmadi"}
            </p>
          ) : !row ? (
            <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Hisoblanmoqda...</p>
          ) : (
            <div
              className={cn(
                "space-y-1.5 rounded-xl bg-gray-50 p-3 transition-opacity",
                (isSettling || isPreviewing) && "opacity-60",
              )}
            >
              <p className="text-xs font-medium text-gray-500">
                {preview.monthLabel} · {preview.componentLabel}
              </p>
              <p className="text-xl font-bold text-red-600">− {formatMoney(row.draftAmount)}</p>
              <p className="text-sm text-gray-600">
                Oylik: {formatMoney(row.beforeAmount)} → <b>{formatMoney(row.afterAmount)}</b>
              </p>
              {period === "range" && (
                <p className="text-xs text-gray-500">
                  Hisob {preview.monthLabel} bo'yicha ko'rsatilgan, bekor qilish {preview.periodLabel} uchun amal qiladi.
                </p>
              )}
              {row.sealState === "locked" && (
                <Notice>
                  Bu oyga to'langan pul yangi summadan ko'p — {preview.monthLabel} summasi o'zgarmaydi.
                </Notice>
              )}
              {Number(row.draftAmount) === 0 && (
                <Notice>Tanlangan qism allaqachon bekor qilingan yoki bu oyda yo'q.</Notice>
              )}
            </div>
          )}

          <Button type="submit" variant="danger" className="w-full" loading={isLoading} disabled={!canSave}>
            Bekor qilish
          </Button>
        </InputGroup>
      </Can>

      {/* Eski yo'l — summa xato hisoblangan bo'lsa, oylikni to'xtatmaydi */}
      {Number(entry?.paidAmount) === 0 && (
        <Can do="payroll.cancel">
          <RecalculateSection entry={entry} close={close} />
        </Can>
      )}
    </div>
  );
};

/**
 * "SUMMA XATO" — majburiyatni bekor qilib, keyingi shakllantirishda amaldagi
 * qoidalar bo'yicha qayta hisoblash. Oylikni to'xtatish EMAS.
 */
const RecalculateSection = ({ entry, close }) => {
  const { mutate: cancelEntry, isPending } = useCancelEntry();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = () => {
    cancelEntry(
      { id: entry.id, reason },
      {
        onSuccess: () => {
          close();
          toast.success("Majburiyat bekor qilindi — \"Shakllantirish\" uni qayta hisoblaydi");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-gray-600"
      >
        Summa xato hisoblangan — qayta hisoblash uchun
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 p-3">
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            {PAYROLL_SEAL_HINT} Bu oylikni TO'XTATMAYDI: keyingi "Shakllantirish" qatorni amaldagi
            qoidalar bo'yicha qaytadan yozadi.
          </p>
          <InputField
            required
            name="recalcReason"
            label="Sabab"
            value={reason}
            maxLength={200}
            placeholder="Xato summa kiritilgan"
            onChange={(event) => setReason(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            loading={isPending}
            disabled={!reason.trim()}
            onClick={handleCancel}
          >
            Majburiyatni bekor qilish
          </Button>
        </div>
      )}
    </div>
  );
};
