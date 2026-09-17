// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Search, TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import InputNumber from "@/shared/components/ui/input/InputNumber";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  DEDUCTION_HINTS,
  DEDUCTION_MAX_HOURS,
  DEDUCTION_PERIOD_OPTIONS,
  DEDUCTION_SCOPE_OPTIONS,
  DEDUCTION_TYPE_OPTIONS,
  SEAL_STATE_META,
  formatDeductionValue,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import { useCancelDeduction, useCreateDeductions } from "../queries/payroll.mutations";

// ─────────────────────────────────────────────
// Ushlab qolish yozish
// ─────────────────────────────────────────────

export const CreateDeductionModal = () => (
  <ResponsiveModal name="createDeduction" title="Oylikdan ushlab qolish" className="max-w-4xl">
    <CreateDeductionForm />
  </ResponsiveModal>
);

/**
 * USHLAB QOLISH FORMASI.
 *
 * ⚠️ PUL FRONTENDDA HISOBLANMAYDI. Pastdagi natija serverdan
 * (`/payroll/deductions/preview`) va u payroll dvigatelidan o'tadi —
 * saqlangandan keyin aynan shu raqam yoziladi.
 *
 * "HAMMASI" — ro'yxat va `scope: "all"` birga yuboriladi: server ro'yxatga
 * yozadi va guruhni keyin oyligi belgilangan xodimlarga ham yoyadi
 * (`finance.md` §10). "Tanlab" / "Bitta xodim" — faqat saqlash paytidagi ro'yxat.
 */
const CreateDeductionForm = ({ close, isLoading, setIsLoading, month: initialMonth }) => {
  const { mutate: createDeductions } = useCreateDeductions();

  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set());

  const {
    scope,
    singleId,
    type,
    value,
    reason,
    note,
    startMonth,
    period,
    endMonth,
    setField,
  } = useObjectState({
    scope: "all",
    singleId: "",
    type: "percent",
    value: "",
    reason: "",
    note: "",
    startMonth: monthKeyToInputValue(initialMonth ?? currentMonthKey()),
    period: "once",
    endMonth: "",
  });

  const startKey = inputValueToMonthKey(startMonth);
  const endKey = inputValueToMonthKey(endMonth);

  const { data: candidateData, isLoading: candidatesLoading } = useQuery(
    payrollQueries.deductionCandidates(startKey),
  );
  const candidates = useMemo(() => candidateData?.items ?? [], [candidateData]);
  const candidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);

  // ── Kimdan ─────────────────────────────────────────────
  // Oy almashsa ro'yxat o'zgaradi — tanlovdan faqat shu oyda oyligi borlari qoladi
  const staffIds =
    scope === "all"
      ? candidates.map((c) => c.id)
      : scope === "pick"
        ? [...picked].filter((id) => candidateIds.has(id))
        : singleId && candidateIds.has(singleId)
          ? [singleId]
          : [];

  const needle = search.trim().toLowerCase();
  const visible = needle
    ? candidates.filter((c) =>
        `${c.fullName} ${c.username ?? ""} ${c.departmentName ?? ""} ${c.positionName ?? ""}`
          .toLowerCase()
          .includes(needle),
      )
    : candidates;

  const allVisiblePicked = visible.length > 0 && visible.every((c) => picked.has(c.id));

  const togglePick = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleVisible = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const c of visible) {
        if (allVisiblePicked) next.delete(c.id);
        else next.add(c.id);
      }
      return next;
    });

  // ── Qoralama ───────────────────────────────────────────
  const draftError =
    staffIds.length === 0
      ? "Xodim tanlang"
      : !(Number(value) > 0)
        ? type === "percent"
          ? "Foizni kiriting"
          : type === "hours"
            ? "Dars soatini kiriting"
            : "Summani kiriting"
        : type === "percent" && Number(value) > 100
          ? "Foiz 100 dan oshmasligi kerak"
          : type === "hours" && (!Number.isInteger(Number(value)) || Number(value) > DEDUCTION_MAX_HOURS)
            ? `Dars soati 1 dan ${DEDUCTION_MAX_HOURS} gacha butun son bo'lishi kerak`
            : !reason.trim()
            ? "Sababini yozing"
            : !startKey
              ? "Oyni tanlang"
              : period === "range" && (!endKey || endKey < startKey)
                ? "Tugash oyi boshlanish oyidan keyin bo'lishi kerak"
                : null;

  // ⚠️ SATR sifatida kechiktiriladi: obyekt har renderda yangi va
  // `useDebounce` uni cheksiz qayta o'rnatardi (`ContractEditor` bilan AYNI).
  const draftKey = draftError
    ? null
    : JSON.stringify({
        staffIds,
        ...(scope === "all" ? { scope: "all" } : {}),
        type,
        value,
        reason: reason.trim(),
        note: note.trim(),
        startMonth: startKey,
        endMonth: period === "once" ? startKey : period === "range" ? endKey : null,
      });

  const debouncedKey = useDebounce(draftKey, 400);
  const draft = useMemo(() => (debouncedKey ? JSON.parse(debouncedKey) : null), [debouncedKey]);
  const isSettling = draftKey !== debouncedKey;

  const {
    data: preview,
    isFetching: isPreviewing,
    error: previewError,
  } = useQuery(payrollQueries.deductionPreview(draft));

  const canSave =
    Boolean(draftKey) && Boolean(preview) && !previewError && !isSettling && !isPreviewing && !isLoading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;

    setIsLoading(true);
    createDeductions(JSON.parse(draftKey), {
      onSuccess: (result) => {
        close();
        toast.success(
          result.extended > 0
            ? `${result.created + result.extended} ta xodimdan ushlab qolish yozildi (${result.extended} tasining shu oyda oyligi hali 0)`
            : `${result.created} ta xodimdan ushlab qolish yozildi`,
        );
        if (result.skippedDuplicates.length > 0) {
          toast.info(
            `${result.skippedDuplicates.length} ta xodimda bu ushlab qolish allaqachon bor edi — qayta yozilmadi`,
          );
        }
        if (result.resync.locked.length > 0) {
          toast.info(
            `${result.resync.locked.length} ta xodimning oyligi to'langan — ${formatMonthKey(startKey)} summasi o'zgarmadi`,
          );
        }
        if (result.resync.conflicts > 0) {
          toast.warning(
            `${result.resync.conflicts} ta oylik shu orada to'landi va qayta hisoblanmadi`,
          );
        }
      },
      onError: (error) => toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  const staffOptions = candidates.map((c) => ({
    value: c.id,
    label: `${c.fullName} — ${formatMoney(c.grossAmount)}`,
  }));

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* ── Kimdan ─────────────────────────────────────── */}
        <section className="min-w-0 space-y-3">
          <SectionTitle
            title="Kimdan"
            aside={
              candidateData ? `${staffIds.length} / ${candidates.length} xodim` : null
            }
          />

          <Segmented
            options={DEDUCTION_SCOPE_OPTIONS}
            value={scope}
            onChange={(next) => setField("scope", next)}
          />

          {scope === "all" && (
            <p className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">{DEDUCTION_HINTS.all}</p>
          )}

          {scope === "one" ? (
            <Select
              searchable
              value={singleId}
              placeholder={candidatesLoading ? "Yuklanmoqda..." : "Xodimni tanlang"}
              options={staffOptions}
              onChange={(next) => setField("singleId", next)}
            />
          ) : (
            <div className="rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                <Search className="size-4 shrink-0 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ism, login yoki bo'lim"
                  className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>

              {scope === "pick" && visible.length > 0 && (
                <label className="flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={allVisiblePicked}
                    onChange={toggleVisible}
                    className="size-4 accent-primary"
                  />
                  {needle ? "Topilganlarning hammasini belgilash" : "Hammasini belgilash"}
                </label>
              )}

              <ul className="max-h-72 overflow-y-auto">
                {candidatesLoading && (
                  <li className="px-3 py-6 text-center text-sm text-gray-500">Yuklanmoqda...</li>
                )}
                {!candidatesLoading && visible.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-gray-500">
                    {candidates.length === 0
                      ? `${formatMonthKey(startKey)} da oyligi bor xodim yo'q`
                      : "Hech kim topilmadi"}
                  </li>
                )}
                {visible.map((c) => {
                  const checked = scope === "all" || picked.has(c.id);
                  const seal = SEAL_STATE_META[c.sealState];

                  return (
                    <li key={c.id}>
                      <label
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2",
                          scope === "pick" ? "cursor-pointer hover:bg-gray-50" : "cursor-default",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={scope === "all"}
                          onChange={() => togglePick(c.id)}
                          className="size-4 shrink-0 accent-primary"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {c.fullName}
                          </span>
                          <span className="block truncate text-xs text-gray-400">
                            {[c.positionName || c.categoryName, c.departmentName]
                              .filter(Boolean)
                              .join(" · ") || c.role}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-sm tabular-nums text-gray-700">
                            {formatMoney(c.grossAmount)}
                          </span>
                          {c.sealState !== "none" && (
                            <span
                              className={cn(
                                "mt-0.5 inline-block rounded px-1.5 text-[10px] font-medium",
                                seal.className,
                              )}
                            >
                              {seal.label}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* ── Qancha ─────────────────────────────────────── */}
        <section className="min-w-0 space-y-3">
          <SectionTitle title="Qancha" />

          <Segmented
            options={DEDUCTION_TYPE_OPTIONS}
            value={type}
            onChange={(next) => {
              setField("type", next);
              setField("value", "");
            }}
          />

          <div className="flex items-center gap-2">
            <InputNumber
              scale={type === "percent" ? 2 : 0}
              value={value}
              placeholder={type === "percent" ? "10" : type === "hours" ? "3" : "500 000"}
              onChange={(event) => setField("value", event.target.value)}
              className="h-10"
            />
            <span className="shrink-0 text-sm text-gray-500">
              {type === "percent" ? "% oylikdan" : type === "hours" ? "dars soati" : "so'm"}
            </span>
          </div>
          {(type === "percent" || type === "hours") && (
            <p className="text-xs text-gray-500">{DEDUCTION_HINTS[type]}</p>
          )}

          <InputField
            required
            name="reason"
            label="Sabab"
            value={reason}
            maxLength={200}
            placeholder="Masalan: kechikishlar uchun"
            onChange={(event) => setField("reason", event.target.value)}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Qaysi oy(lar)dan</p>
            <Segmented
              options={DEDUCTION_PERIOD_OPTIONS}
              value={period}
              onChange={(next) => setField("period", next)}
            />
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
              <InputField
                required
                type="month"
                name="startMonth"
                label={period === "once" ? "Oy" : "Qaysi oydan"}
                value={startMonth}
                onChange={(event) => setField("startMonth", event.target.value)}
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

          <InputField
            name="note"
            label="Izoh (ixtiyoriy)"
            value={note}
            maxLength={500}
            onChange={(event) => setField("note", event.target.value)}
          />
        </section>
      </div>

      {/* ── Natija ───────────────────────────────────────── */}
      <DeductionPreview
        preview={preview}
        draftError={draftError}
        previewError={previewError}
        isBusy={isSettling || isPreviewing}
        type={type}
      />

      {/* ⚠️ STICKY: "Hammasi" tanlanganda ro'yxat va natija oynadan uzun bo'ladi
          va tugma pastda yashirinib qolardi. Oyna (≥480px) `p-6` bilan
          aylanadi — manfiy siljish tugmani uning pastki chetiga yopishtiradi;
          mobil pastki panelda aylanadigan blok paddingsiz, shuning uchun 0. */}
      <div className="sticky bottom-0 z-10 bg-white pt-3 shadow-[0_-14px_14px_-14px_rgba(15,23,42,0.18)] xs:-bottom-6 xs:-mx-6 xs:px-6 xs:pb-6">
        <Button type="submit" className="w-full" loading={isLoading} disabled={!canSave}>
          {staffIds.length > 0
            ? `Ushlab qolish — ${staffIds.length} ta xodim`
            : "Ushlab qolish"}
        </Button>
      </div>
    </InputGroup>
  );
};

/**
 * NATIJA — kimdan qancha, qaysi muhr qayta hisoblanadi, qaysi biri o'zgarmaydi.
 * ⚠️ Summalar QO'SHILMAYDI: jami ham serverdan (`totals.totalAmount`).
 */
const DeductionPreview = ({ preview, draftError, previewError, isBusy, type }) => {
  if (draftError) {
    return <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">{draftError}</p>;
  }
  if (previewError) {
    return (
      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
        {previewError.response?.data?.message || "Hisoblab bo'lmadi"}
      </p>
    );
  }
  if (!preview) {
    return <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Hisoblanmoqda...</p>;
  }

  const { totals } = preview;

  return (
    <div className={cn("space-y-3 rounded-xl bg-gray-50 p-3 transition-opacity", isBusy && "opacity-60")}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {preview.monthLabel} · {totals.staffCount} ta xodim
          </p>
          <p className="text-xl font-bold text-red-600">− {formatMoney(totals.totalAmount)}</p>
        </div>
        <p className="text-xs text-gray-500">Davr: {preview.periodLabel}</p>
      </div>

      <ul className="max-h-56 divide-y divide-gray-200/70 overflow-y-auto rounded-lg bg-white">
        {preview.items.map((row) => {
          const seal = SEAL_STATE_META[row.sealState];
          return (
            <li
              key={row.staffId}
              className={cn("flex items-center gap-3 px-3 py-2 text-sm", !row.applies && "opacity-60")}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900">{row.fullName}</span>
                {row.sealState !== "none" && (
                  <span className={cn("mt-0.5 inline-block rounded px-1.5 text-[10px] font-medium", seal.className)}>
                    {seal.label}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right tabular-nums">
                {row.noRate ? (
                  <span className="block text-xs text-amber-600">soat narxi yo'q — ushlanmaydi</span>
                ) : (
                  <span className="block text-red-600">
                    − {formatMoney(row.draftAmount)}
                    {row.capped && <span className="ml-1 text-[10px] text-amber-600">(oylikdan oshmadi)</span>}
                  </span>
                )}
                {type === "hours" && Number(row.perHourRate) > 0 && (
                  <span className="block text-[11px] text-gray-400">soati {formatMoney(row.perHourRate)}</span>
                )}
                <span className="block text-xs text-gray-400">
                  {formatMoney(row.grossAmount)} → {formatMoney(row.netAfter)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {(totals.resyncCount > 0 || totals.lockedCount > 0 || totals.cappedCount > 0 || totals.noRateCount > 0) && (
        <div className="space-y-1.5">
          {totals.noRateCount > 0 && (
            <Notice>
              {totals.noRateCount} ta xodimda soat narxi yo'q (faqat fiksa oylik) — dars soati bo'yicha
              ulardan ushlanmaydi.
            </Notice>
          )}
          {totals.resyncCount > 0 && (
            <Notice>
              {totals.resyncCount} ta xodimning shu oy oyligi shakllantirilgan va hali to'lanmagan —
              ushlab qolish bilan qayta hisoblanadi.
            </Notice>
          )}
          {totals.lockedCount > 0 && (
            <Notice>
              {totals.lockedCount} ta xodimga shu oy oyligi (qisman) to'langan — {preview.monthLabel}
              {" "}summasi o'zgarmaydi, jamiga ham kirmaydi.
            </Notice>
          )}
          {totals.cappedCount > 0 && (
            <Notice>
              {totals.cappedCount} ta xodimda ushlab qolish oylikdan katta — oylik 0 gacha kamayadi.
            </Notice>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Bekor qilish
// ─────────────────────────────────────────────

export const CancelDeductionModal = () => (
  <ResponsiveModal name="cancelDeduction" title="Ushlab qolishni bekor qilish">
    <CancelDeductionForm />
  </ResponsiveModal>
);

const CancelDeductionForm = ({ close, isLoading, setIsLoading, deduction }) => {
  const { mutate: cancel } = useCancelDeduction();
  const { reason, whole, setField } = useObjectState({ reason: "", whole: false });

  const groupSize = deduction?.batchActiveCount ?? 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);

    cancel(
      whole ? { batchId: deduction.batchId, reason } : { id: deduction.id, reason },
      {
        onSuccess: (result) => {
          close();
          toast.success(`${result.cancelled} ta ushlab qolish bekor qilindi`);
          if (result.resync.locked.length > 0) {
            toast.info(
              `${result.resync.locked.length} ta oylik to'langan — muhrlangan summa o'zgarmadi`,
            );
          }
        },
        onError: (error) => toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{deduction?.staffName}</p>
        <p className="text-gray-500">
          {deduction?.reason} ·{" "}
          {formatDeductionValue(deduction?.type, deduction?.value)}
          {" "}· {deduction?.periodLabel}
        </p>
      </div>

      {groupSize > 1 && (
        <div className="space-y-2">
          <Segmented
            options={[
              { value: "one", label: "Faqat shu xodim" },
              { value: "whole", label: `Butun guruh (${groupSize} ta)` },
            ]}
            value={whole ? "whole" : "one"}
            onChange={(next) => setField("whole", next === "whole")}
          />
          <p className="text-xs text-gray-500">
            Guruh — bitta amalda birga yozilgan ushlab qolishlar.
          </p>
        </div>
      )}

      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{DEDUCTION_HINTS.cancel}</p>

      <InputField
        required
        name="reason"
        label="Bekor qilish sababi"
        value={reason}
        maxLength={200}
        placeholder="Xato kiritilgan"
        onChange={(event) => setField("reason", event.target.value)}
      />

      <Button
        type="submit"
        variant="danger"
        className="w-full"
        loading={isLoading}
        disabled={!reason.trim()}
      >
        {whole ? `Guruhni bekor qilish (${groupSize} ta)` : "Bekor qilish"}
      </Button>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// Yordamchilar
// ─────────────────────────────────────────────

export const SectionTitle = ({ title, aside }) => (
  <div className="flex items-baseline justify-between gap-2">
    <p className="text-sm font-semibold text-gray-900">{title}</p>
    {aside && <p className="text-xs text-gray-500">{aside}</p>}
  </div>
);

/** Segmentli tanlov — variantlar kam va joriy tanlov doim ko'rinib turadi. */
export const Segmented = ({ options, value, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "flex-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
          value === option.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const Notice = ({ children }) => (
  <p className="flex items-start gap-2 text-xs text-gray-600">
    <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
    <span>{children}</span>
  </p>
);
