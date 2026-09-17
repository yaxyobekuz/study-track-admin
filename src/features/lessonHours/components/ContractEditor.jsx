// React
import { Fragment, useMemo } from "react";

// Icons
import { Loader2, Plus, TriangleAlert, X } from "lucide-react";

// Notifications
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputNumber from "@/shared/components/ui/input/InputNumber";
import Select from "@/shared/components/ui/select/Select";
import MonthPicker from "./MonthPicker";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data & queries
import { CHIP, SURFACE, T, modeOf } from "../data/ledger.tokens";
import {
  ALLOWANCE_KIND_OPTIONS,
  CONTRACT_HINTS,
  RATE_SOURCE_OPTIONS,
} from "../data/lessonHours.data";
import { contractQueries } from "../queries/lessonHours.queries";
import { allowanceLineLabel, deductionLineLabel } from "@/features/payroll/data/payroll.data";
import { useSaveContract } from "../queries/lessonHours.mutations";

/**
 * SHARTNOMA SHARTI — vedomost oynasining ichida, boshqa bo'limga o'tmasdan.
 *
 * Bitta forma uch narsani birga yozadi: fiksa oylik, soat narxi (toifadan
 * yoki qo'lda) va ustamalar. Ilgari buning uchun "Xodimlar oyligi"
 * bo'limining ikki xil ekraniga kirish kerak edi.
 *
 * ⚠️ PUL FRONTENDDA HISOBLANMAYDI. "Natija" bloki serverdan keladi
 * (`/contract/preview`) va u vedomost bilan AYNI dvigateldan o'tadi —
 * formadagi raqam saqlangandan keyin qatorda boshqacha chiqmasligi kerak.
 *
 * ⚠️ NIMA YOZILISHI SAQLASHDAN OLDIN AYTILADI: qaysi davr yopiladi,
 * qaysi oylar muhrlangan va toifa tanlansa lavozim yo'qolishi.
 */
const ContractEditor = ({ staffId, month, onDone }) => {
  const { data, isLoading, isError } = useQuery(contractQueries.one(staffId, month));

  if (isLoading) {
    return (
      <div className={cn(SURFACE.tile, "space-y-2.5 py-6")}>
        {[88, 64, 42].map((width, index) => (
          <div
            key={width}
            className="h-2.5 rounded-full bg-slate-200/70 motion-safe:animate-breathe"
            style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={cn(SURFACE.tile, "flex items-center justify-between gap-3")}>
        <p className={T.hint}>Shartnoma shartini yuklab bo'lmadi</p>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Yopish
        </Button>
      </div>
    );
  }

  // `key` — boshqa o'qituvchi yoki oy ochilsa forma YANGI qiymatlardan
  // boshlanadi, eski kiritilgan raqam ko'chib o'tmaydi.
  return <ContractForm key={`${staffId}:${month}`} contract={data} onDone={onDone} />;
};

// Serverdagi summa ("5000000.00") → input qiymati ("5000000").
// ⚠️ `Number()` orqali EMAS — satr o'zi kesiladi, aniqlik yo'qolmaydi.
const toInput = (value) => {
  if (value == null) return "";
  const text = String(value).replace(/\.0+$/, "");
  return /^0*$/.test(text) ? "" : text;
};

let allowanceSeq = 0;
const withKey = (allowance) => ({
  key: `allowance-${(allowanceSeq += 1)}`,
  label: allowance.label ?? "",
  type: allowance.type ?? "fixed",
  value: allowance.value == null ? "" : String(allowance.value),
});

const ContractForm = ({ contract, onDone }) => {
  const { mutate: save, isPending } = useSaveContract();

  const {
    startMonth,
    fixedAmount,
    rateSource,
    categoryId,
    perHourRate,
    allowances,
    note,
    setField,
  } = useObjectState({
    startMonth: contract.month,
    fixedAmount: toInput(contract.fixedAmount),
    rateSource: contract.rateSource,
    categoryId: contract.categoryId ?? "",
    perHourRate: toInput(contract.perHourRate),
    allowances: contract.allowances.map(withKey),
    note: contract.note ?? "",
  });

  // ── Qoralama ──────────────────────────────────────────────
  // Hali to'liq kiritilmagan holat serverga yuborilmaydi: 400 xatosi
  // "noto'g'ri" emas, "yozib bo'lmadi" degani.
  const draftError =
    rateSource === "category" && !categoryId
      ? "Toifani tanlang"
      : rateSource === "manual" && !(Number(perHourRate) > 0)
        ? "1 soat narxini kiriting"
        : allowances.some((a) => a.label.trim() && !(Number(a.value) > 0))
          ? "Ustama qiymatini kiriting"
          : null;

  // ⚠️ SATR sifatida kechiktiriladi. Obyekt har renderda yangi bo'lgani
  // uchun `useDebounce` uni cheksiz qayta o'rnatib, har 350 ms da render
  // aylanasini boshlab yuborardi; satr esa qiymat bo'yicha taqqoslanadi.
  const draftKey = draftError
    ? null
    : JSON.stringify({
        month: startMonth,
        fixedAmount: fixedAmount || "0",
        rateSource,
        categoryId: rateSource === "category" ? categoryId : null,
        perHourRate: rateSource === "manual" ? perHourRate : null,
        allowances: allowances
          .filter((a) => Number(a.value) > 0)
          .map((a) => ({ label: a.label.trim(), type: a.type, value: a.value })),
        note: note.trim(),
      });

  const debouncedKey = useDebounce(draftKey, 350);
  const draft = useMemo(
    () => (debouncedKey ? JSON.parse(debouncedKey) : null),
    [debouncedKey],
  );
  const isSettling = draftKey !== debouncedKey;

  const {
    data: preview,
    isFetching: isPreviewing,
    error: previewError,
  } = useQuery(contractQueries.preview(contract.staffId, draft));

  const canSave =
    Boolean(draftKey) &&
    Boolean(preview) &&
    !previewError &&
    !isSettling &&
    !isPreviewing &&
    !isPending &&
    preview.changeKind !== "none";

  const handleSave = () => {
    if (!canSave) return;

    save(
      { staffId: contract.staffId, ...JSON.parse(draftKey) },
      {
        onSuccess: () => {
          toast.success(preview.hasSalary ? "Shartnoma sharti saqlandi" : "Oylik olib tashlandi");
          onDone();
        },
        onError: (error) =>
          toast.error(error.response?.data?.message || "Saqlab bo'lmadi"),
      },
    );
  };

  // ── Ustamalar ─────────────────────────────────────────────
  const addAllowance = () =>
    setField("allowances", [...allowances, withKey({ type: "fixed" })]);
  const removeAllowance = (key) =>
    setField("allowances", allowances.filter((a) => a.key !== key));
  const updateAllowance = (key, field, value) =>
    setField(
      "allowances",
      allowances.map((a) => (a.key === key ? { ...a, [field]: value } : a)),
    );

  const categoryOptions = contract.categories.map((c) => ({
    value: c.id,
    label:
      `${c.name} — ${formatMoney(c.perHourRate)}/soat` +
      (c.departmentName ? ` · ${c.departmentName}` : "") +
      (c.isArchived ? " (nofaol)" : ""),
  }));

  return (
    <div className="space-y-4">
      {/* ── Sarlavha ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={T.label}>Shartnoma sharti</p>
          <p className={cn(T.hint, "mt-1")}>
            {contract.rule
              ? `Amaldagi qoida: ${contract.rule.periodLabel}`
              : "Oylik qoidasi hali yozilmagan"}
          </p>
        </div>

        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          aria-label="Tahrirni yopish"
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-3.5" strokeWidth={2.2} />
        </button>
      </div>

      {/* ── Qaysi oydan · Fiksa ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Qaysi oydan">
          {/* O'tgan oylar tarixi eski summada qoladi — yangi shart
              shu oydan boshlab yoziladi */}
          <MonthPicker
            month={startMonth}
            onChange={(value) => setField("startMonth", value)}
            allowFuture
            className="h-11 justify-between bg-slate-50 shadow-none"
          />
        </Field>

        <Field label="Fiksa oylik" suffix="so'm / oy">
          <InputNumber
            scale={0}
            value={fixedAmount}
            placeholder="0"
            onChange={(event) => setField("fixedAmount", event.target.value)}
            className={AMOUNT_INPUT}
          />
        </Field>
      </div>

      {/* ── Soat narxi ───────────────────────────────────────── */}
      <Field label="Dars soati narxi">
        <Segmented
          options={RATE_SOURCE_OPTIONS}
          value={rateSource}
          onChange={(value) => setField("rateSource", value)}
        />

        {rateSource === "category" && (
          <div className="mt-2">
            {categoryOptions.length ? (
              <Select
                searchable
                value={categoryId}
                placeholder="Toifani tanlang"
                options={categoryOptions}
                onChange={(value) => setField("categoryId", value)}
                triggerClassName="h-11 w-full rounded-xl border-0 bg-slate-50 text-[12.5px] shadow-none outline-0"
              />
            ) : (
              <p className={cn(SURFACE.tile, T.hint)}>
                Toifalar katalogi bo'sh — soat narxini "Qo'lda" yozing.
              </p>
            )}
          </div>
        )}

        {rateSource === "manual" && (
          <div className="mt-2 flex items-center gap-2">
            <InputNumber
              scale={0}
              value={perHourRate}
              placeholder="45 000"
              onChange={(event) => setField("perHourRate", event.target.value)}
              className={AMOUNT_INPUT}
            />
            <span className={cn(T.meta, "shrink-0")}>so'm / soat</span>
          </div>
        )}
      </Field>

      {/* ── Ustamalar ────────────────────────────────────────── */}
      <section>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className={T.label}>Ustamalar</span>
          <button
            type="button"
            onClick={addAllowance}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium text-indigo-600 transition-colors duration-200 hover:bg-indigo-50"
          >
            <Plus className="size-3" strokeWidth={2.4} />
            Qo'shish
          </button>
        </div>

        {allowances.length === 0 && contract.approvedBonuses.length === 0 && (
          <p className={T.hint}>Sertifikat, tajriba va boshqa qo'shimchalar.</p>
        )}

        <ul className="space-y-1.5">
          {allowances.map((allowance) => (
            <li key={allowance.key} className="flex items-center gap-1.5">
              <input
                value={allowance.label}
                placeholder="Nomi"
                onChange={(event) =>
                  updateAllowance(allowance.key, "label", event.target.value)
                }
                className={cn(INPUT, "min-w-0 flex-1")}
              />
              <InputNumber
                scale={allowance.type === "percent" ? 2 : 0}
                value={allowance.value}
                placeholder={allowance.type === "percent" ? "10" : "200 000"}
                onChange={(event) =>
                  updateAllowance(allowance.key, "value", event.target.value)
                }
                className={cn(AMOUNT_INPUT, "w-28 shrink-0 sm:w-32")}
              />
              <Segmented
                compact
                options={ALLOWANCE_KIND_OPTIONS}
                value={allowance.type}
                onChange={(value) => updateAllowance(allowance.key, "type", value)}
              />
              <button
                type="button"
                onClick={() => removeAllowance(allowance.key)}
                aria-label="Ustamani olib tashlash"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="size-3.5" strokeWidth={2.2} />
              </button>
            </li>
          ))}
        </ul>

        {allowances.some((a) => a.type === "percent") && (
          <p className={cn(T.hint, "mt-1.5")}>{CONTRACT_HINTS.percent}</p>
        )}

        {/* Zayavkadan kelgan ustamalar — bu yerda tahrirlanmaydi */}
        {contract.approvedBonuses.length > 0 && (
          <div className={cn(SURFACE.tile, "mt-2 py-2.5")}>
            <ul className="flex flex-wrap gap-1.5">
              {contract.approvedBonuses.map((bonus) => (
                <li key={bonus.id} className={cn(CHIP, "bg-white text-slate-600")}>
                  {bonus.label} ·{" "}
                  {bonus.type === "percent" ? `${bonus.value}%` : formatMoney(bonus.value)}
                </li>
              ))}
            </ul>
            <p className={cn(T.hint, "mt-1.5")}>{CONTRACT_HINTS.bonuses}</p>
          </div>
        )}
      </section>

      <Field label="Izoh (ixtiyoriy)">
        <input
          value={note}
          maxLength={500}
          placeholder="Masalan: direktor buyrug'i №12"
          onChange={(event) => setField("note", event.target.value)}
          className={INPUT}
        />
      </Field>

      {/* ── Natija ───────────────────────────────────────────── */}
      <ResultPanel
        contract={contract}
        draft={draft}
        preview={preview}
        draftError={draftError}
        previewError={previewError}
        isBusy={isSettling || isPreviewing}
      />

      {/* ── Oqibatlar — saqlashdan OLDIN ─────────────────────── */}
      {preview && !draftError && (
        <div className="space-y-1.5">
          {preview.positionRemoved && contract.position && (
            <Notice>
              Toifa tanlansa lavozim ("{contract.position.name}",{" "}
              {formatMoney(contract.position.baseSalary)}) olib tashlanadi: lavozim va
              toifa birga bo'lmaydi.
            </Notice>
          )}
          {preview.categoryChanged && <Notice>{CONTRACT_HINTS.category}</Notice>}
          {preview.sealedMonths.length > 0 && (
            <Notice>
              <span className="font-medium text-slate-700">
                {preview.sealedMonths
                  .slice(0, 3)
                  .map((m) => m.monthLabel)
                  .join(", ")}
                {preview.sealedMonths.length > 3 &&
                  ` va yana ${preview.sealedMonths.length - 3} oy`}
              </span>
              : {CONTRACT_HINTS.sealed}
            </Notice>
          )}
        </div>
      )}

      {/* ⚠️ STICKY: ustama va ogohlantirishlar qo'shilganda forma oyna
          balandligidan oshadi, aylantirish chizig'i esa yashirin — tugmalar
          pastda qolib, "saqlash qayerda" degan savol tug'ilardi. */}
      <div className="sticky bottom-0 z-10 -mb-px flex gap-2.5 bg-white pt-3 shadow-[0_-14px_14px_-14px_rgba(15,23,42,0.18)]">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={isPending}
          className="flex-1"
        >
          Bekor qilish
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          variant={preview && !preview.hasSalary ? "danger" : undefined}
          className="flex-1"
        >
          {isPending
            ? "Saqlanmoqda..."
            : preview && !preview.hasSalary
              ? "Oylikni olib tashlash"
              : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

/**
 * NATIJA — tanlangan oyda qancha chiqadi va qaysi qatorlar yoziladi.
 *
 * ⚠️ Qatorlar QO'SHILMAYDI: jami summa serverdan (`preview.amount`).
 * Lavozim va fiksa satrlari faqat tushuntirish.
 *
 * ⚠️ `preview.amount` — USHLAB QOLISHDAN KEYIN. Ushlab qolish qatorlari
 * ko'rsatilmasa satrlar yig'indisi jamidan katta chiqadi va oyna "jamini
 * noto'g'ri hisoblayapti" bo'lib ko'rinadi.
 */
const ResultPanel = ({ contract, draft, preview, draftError, previewError, isBusy }) => {
  if (draftError) {
    return <p className={cn(SURFACE.tile, T.hint)}>{draftError}</p>;
  }

  if (previewError) {
    return (
      <p className={cn(SURFACE.tile, "text-[11.5px] text-rose-600")}>
        {previewError.response?.data?.message || "Hisoblab bo'lmadi"}
      </p>
    );
  }

  if (!preview) {
    return (
      <div className={cn(SURFACE.tile, "flex items-center gap-2")}>
        <Loader2 className="size-3.5 animate-spin text-slate-400" strokeWidth={2} />
        <span className={T.hint}>Hisoblanmoqda…</span>
      </div>
    );
  }

  const mode = modeOf(preview.salaryType);
  const keepsPosition = contract.position && !preview.positionRemoved;
  const hasRate = Number(preview.perHourRate) > 0;
  // Nol summali qator (soat narxi yo'q xodimdan soatda ushlab qolish)
  // jamiga ta'sir qilmaydi — ro'yxatni to'ldirmaydi.
  const deductions = (preview.deductionBreakdown ?? []).filter((d) => Number(d.amount) > 0);

  return (
    <div className={cn(SURFACE.tile, "transition-opacity duration-200", isBusy && "opacity-60")}>
      <div className="flex items-center justify-between gap-3">
        <p className={T.label}>{preview.monthLabel} bo'yicha</p>
        <span className={cn(CHIP, mode.chip)}>{mode.label}</span>
      </div>

      {preview.hasSalary ? (
        <>
          <ul className="mt-2.5 space-y-1.5">
            {keepsPosition && (
              <Line
                label={`Lavozim · ${contract.position.name}${preview.baseIsCustom ? " · shaxsiy maosh" : ""}`}
                value={formatMoney(preview.baseAmount)}
              />
            )}
            {Number(draft?.fixedAmount) > 0 && (
              <Line label="Fiksa" value={formatMoney(draft.fixedAmount)} />
            )}
            {hasRate && (
              <Line
                label={`${preview.hours} soat × ${formatMoney(preview.perHourRate)}`}
                value={formatMoney(preview.kpiAmount)}
              />
            )}
            {preview.allowanceBreakdown.map((item, index) => (
              <Line
                key={`${item.label}-${index}`}
                label={allowanceLineLabel(item)}
                value={formatMoney(item.amount)}
              />
            ))}
            {deductions.length > 0 && (
              <>
                <Line
                  label="Ushlab qolishsiz jami"
                  value={formatMoney(preview.grossAmount)}
                  className="mt-1 border-t border-slate-200/70 pt-2"
                  labelClassName="font-medium text-slate-900"
                />
                {deductions.map((item, index) => (
                  <Fragment key={item.id ?? `${item.reason}-${index}`}>
                    <Line
                      label={deductionLineLabel(item)}
                      value={`− ${formatMoney(item.amount)}`}
                      valueClassName="text-rose-600"
                    />
                    <Line
                      label="Qoldi"
                      value={formatMoney(item.remainingAfter)}
                      className="pl-3"
                      labelClassName="text-slate-400"
                    />
                  </Fragment>
                ))}
              </>
            )}
          </ul>

          <div className="mt-3 flex items-end justify-between gap-3">
            <span className={T.meta}>Oy oxirida</span>
            <span className={cn(T.value, T.sizeMd)}>{formatMoney(preview.amount)}</span>
          </div>
        </>
      ) : (
        <p className={cn(T.hint, "mt-2")}>
          Oylik belgilanmagan bo'ladi — vedomostda "Yo'q" bo'lib turadi.
        </p>
      )}

      {preview.effectLabel && (
        <p className={cn(T.meta, "mt-2.5 text-slate-400")}>{preview.effectLabel}</p>
      )}
    </div>
  );
};

const Line = ({ label, value, className, labelClassName, valueClassName }) => (
  <li className={cn("flex items-center justify-between gap-3", className)}>
    <span className={cn(T.td, "min-w-0 truncate", labelClassName)}>{label}</span>
    <span className={cn(T.tdNum, "shrink-0", valueClassName)}>{value}</span>
  </li>
);

const Notice = ({ children }) => (
  <div className={cn(SURFACE.tile, "flex items-start gap-2.5 py-2.5")}>
    <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" strokeWidth={2.2} />
    <p className={cn(T.hint, "leading-relaxed")}>{children}</p>
  </div>
);

/**
 * SEGMENTLI TANLOV — vedomost filtri bilan bir xil shakl.
 *
 * ⚠️ `<select>` EMAS: variantlar ikki-uchta va joriy tanlov doim ko'rinib
 * turishi kerak.
 */
const Segmented = ({ options, value, onChange, compact }) => (
  <div className={cn("flex items-center gap-0.5 rounded-xl bg-slate-50 p-1", compact && "shrink-0")}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "rounded-lg font-medium transition-colors duration-200 ease-out-quint",
          compact ? "px-2 py-1.5 text-[11px]" : "flex-1 px-2.5 py-2 text-[12px]",
          value === option.value
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:bg-slate-100",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const Field = ({ label, suffix, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className={T.label}>{label}</span>
      {suffix && <span className={T.meta}>{suffix}</span>}
    </div>
    {children}
  </div>
);

/**
 * Maydonlar — chegarasiz, tint bilan (`SubstitutionModals` dagi `INPUT`
 * bilan AYNI, bir bo'limda ikki xil maydon ko'rinmasligi uchun).
 */
const INPUT =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-[12.5px] text-slate-900 " +
  "transition-colors duration-200 focus:bg-slate-100 focus:outline-none focus:ring-0";

// ⚠️ `outline-0`: umumiy `InputNumber` doimiy `outline-2 outline-primary`
// beradi va summa maydoni yonidagi oddiy maydonlardan farqli ko'k ramkada
// turardi. Fokus bu yerda fon bilan ko'rsatiladi (`INPUT`).
const AMOUNT_INPUT = cn(INPUT, "outline-0 tabular-nums md:text-[12.5px]");

export default ContractEditor;
