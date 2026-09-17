// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Search } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";
import { Notice, SectionTitle, Segmented } from "./DeductionModals";

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
  SEAL_STATE_META,
  SUSPENSION_COMPONENT_OPTIONS,
  SUSPENSION_HINTS,
  SUSPENSION_MAX_MONTHS,
  SUSPENSION_SCOPE_OPTIONS,
} from "../data/payroll.data";
import { payrollQueries } from "../queries/payroll.queries";
import { useCancelSuspension, useCreateSuspension } from "../queries/payroll.mutations";

/** YYYYMM oraliqdagi oylar soni (inklyuziv). */
const monthSpan = (from, to) =>
  Math.floor(to / 100) * 12 + (to % 100) - (Math.floor(from / 100) * 12 + (from % 100)) + 1;

// ─────────────────────────────────────────────
// To'xtatish
// ─────────────────────────────────────────────

export const CreateSuspensionModal = () => (
  <ResponsiveModal name="createSuspension" title="Oylikni to'xtatish" className="max-w-4xl">
    <CreateSuspensionForm />
  </ResponsiveModal>
);

/**
 * OYLIKNI TO'XTATISH FORMASI.
 *
 * ⚠️ PUL FRONTENDDA HISOBLANMAYDI: natija serverdan
 * (`/payroll/suspensions/preview`, payroll dvigateli) — saqlangandan keyin
 * aynan shu raqam yoziladi.
 *
 * ⚠️ "BARCHA XODIMLAR" — alohida tasdiq belgisi; server ham `confirmAll`
 * bo'lmasa rad etadi (tasdiq faqat oynada turmasligi uchun).
 */
const CreateSuspensionForm = ({ close, isLoading, setIsLoading, month: initialMonth }) => {
  const { mutate: createSuspension } = useCreateSuspension();

  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set());

  const {
    scope,
    component,
    itemKey,
    reason,
    note,
    startMonth,
    endMonth,
    confirmAll,
    setField,
  } = useObjectState({
    scope: "staff",
    component: "all",
    itemKey: "",
    reason: "",
    note: "",
    startMonth: monthKeyToInputValue(initialMonth ?? currentMonthKey()),
    endMonth: monthKeyToInputValue(initialMonth ?? currentMonthKey()),
    confirmAll: false,
  });

  const startKey = inputValueToMonthKey(startMonth);
  const endKey = inputValueToMonthKey(endMonth);

  const { data: candidateData, isLoading: candidatesLoading } = useQuery(
    payrollQueries.suspensionCandidates(startKey),
  );
  const candidates = useMemo(() => candidateData?.items ?? [], [candidateData]);
  const candidateIds = useMemo(() => new Set(candidates.map((c) => c.id)), [candidates]);

  // Oy almashsa tanlovdan faqat shu oyda oyligi borlari qoladi
  const staffIds = scope === "all" ? [] : [...picked].filter((id) => candidateIds.has(id));
  const singleStaffId = scope === "staff" && staffIds.length === 1 ? staffIds[0] : null;

  // "Aniq qo'shimcha" — faqat bitta xodimda, uning shu oydagi qismlaridan
  const { data: units, isLoading: unitsLoading } = useQuery({
    ...payrollQueries.suspensionUnits(singleStaffId, startKey),
    enabled: Boolean(singleStaffId) && Boolean(startKey) && component === "item",
  });
  const unitOptions = (units?.items ?? []).map((unit) => ({
    value: unit.key,
    label: `${unit.label} — ${formatMoney(unit.amount)}`,
  }));
  const validItemKey = unitOptions.some((option) => option.value === itemKey) ? itemKey : "";

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
    scope === "staff" && staffIds.length === 0
      ? "Xodim tanlang"
      : component === "item" && !singleStaffId
        ? "Aniq qo'shimchani to'xtatish uchun bitta xodim tanlang"
        : component === "item" && !validItemKey
          ? "Qo'shimchani tanlang"
          : !startKey || !endKey
            ? "Oyni tanlang"
            : endKey < startKey
              ? "Tugash oyi boshlanish oyidan keyin bo'lishi kerak"
              : monthSpan(startKey, endKey) > SUSPENSION_MAX_MONTHS
                ? `Bir amalda ko'pi bilan ${SUSPENSION_MAX_MONTHS} oy`
                : !reason.trim()
                  ? "To'xtatish sababini yozing"
                  : scope === "all" && !confirmAll
                    ? "Barcha xodimlar uchun tasdiqlang"
                    : null;

  // ⚠️ SATR sifatida kechiktiriladi — obyekt har renderda yangi bo'lardi
  const draftKey = draftError
    ? null
    : JSON.stringify({
        scope,
        ...(scope === "staff" ? { staffIds } : { confirmAll: true }),
        component,
        ...(component === "item" ? { itemKey: validItemKey } : {}),
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

  const canSave =
    Boolean(draftKey) && Boolean(preview) && !previewError && !isSettling && !isPreviewing && !isLoading;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSave) return;

    setIsLoading(true);
    createSuspension(JSON.parse(draftKey), {
      onSuccess: (result) => {
        close();
        toast.success(
          scope === "all"
            ? "Barcha xodimlar oyligi to'xtatildi"
            : `${result.created} ta xodim oyligi to'xtatildi`,
        );
        if (result.skippedDuplicates.length > 0) {
          toast.info(
            `${result.skippedDuplicates.length} ta xodimda bu to'xtatish allaqachon bor edi — qayta yozilmadi`,
          );
        }
        if (result.resync.locked.length > 0) {
          toast.warning(
            `${result.resync.locked.length} ta xodimga to'langan pul yangi summadan ko'p — ularning oyligi o'zgarmadi`,
          );
        }
        if (result.resync.conflicts > 0) {
          toast.warning(
            `${result.resync.conflicts} ta oylik shu orada o'zgardi — "Shakllantirish" uni qayta hisoblaydi`,
          );
        }
      },
      onError: (error) => toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* ── Kimga ─────────────────────────────────────── */}
        <section className="min-w-0 space-y-3">
          <SectionTitle
            title="Kimga"
            aside={
              scope === "staff" && candidateData
                ? `${staffIds.length} / ${candidates.length} xodim`
                : null
            }
          />

          <Segmented
            options={SUSPENSION_SCOPE_OPTIONS}
            value={scope}
            onChange={(next) => {
              setField("scope", next);
              setField("confirmAll", false);
              if (next === "all" && component === "item") setField("component", "all");
            }}
          />

          {scope === "all" ? (
            <div className="space-y-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              <p>{SUSPENSION_HINTS.all}</p>
              <label className="flex cursor-pointer items-start gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={confirmAll}
                  onChange={(event) => setField("confirmAll", event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-red-600"
                />
                Barcha xodimlarning oyligi to'xtatilishini tushunaman
              </label>
            </div>
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

              {visible.length > 0 && (
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
                  const seal = SEAL_STATE_META[c.sealState];
                  return (
                    <li key={c.id}>
                      <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={picked.has(c.id)}
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
                            {formatMoney(c.amount)}
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

        {/* ── Nima va qachon ───────────────────────────── */}
        <section className="min-w-0 space-y-3">
          <SectionTitle title="Nima to'xtatiladi" />

          <div className="space-y-1.5">
            {SUSPENSION_COMPONENT_OPTIONS.map((option) => {
              const disabled = option.value === "item" && scope === "all";
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2",
                    component === option.value ? "border-primary bg-primary/5" : "border-gray-200",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="radio"
                    name="component"
                    value={option.value}
                    checked={component === option.value}
                    disabled={disabled}
                    onChange={() => setField("component", option.value)}
                    className="mt-0.5 size-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                    <span className="block text-xs text-gray-500">
                      {disabled ? "Faqat bitta xodim uchun" : option.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {component === "item" && singleStaffId && (
            <Select
              value={validItemKey}
              placeholder={
                unitsLoading
                  ? "Yuklanmoqda..."
                  : unitOptions.length === 0
                    ? "Bu oyda qo'shimcha yo'q"
                    : "Qo'shimchani tanlang"
              }
              options={unitOptions}
              onChange={(next) => setField("itemKey", next)}
            />
          )}

          {component !== "all" && (
            <p className="text-xs text-gray-500">{SUSPENSION_HINTS.independent}</p>
          )}

          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
            <InputField
              required
              type="month"
              name="startMonth"
              label="Qaysi oydan"
              value={startMonth}
              onChange={(event) => {
                setField("startMonth", event.target.value);
                if (!endMonth || event.target.value > endMonth) setField("endMonth", event.target.value);
              }}
            />
            <InputField
              required
              type="month"
              name="endMonth"
              label="Qaysi oygacha"
              value={endMonth}
              min={startMonth}
              onChange={(event) => setField("endMonth", event.target.value)}
            />
          </div>

          <InputField
            required
            name="reason"
            label="Sabab"
            value={reason}
            maxLength={200}
            placeholder="Masalan: ta'tilda, ishga chiqmadi"
            onChange={(event) => setField("reason", event.target.value)}
          />

          <InputField
            name="note"
            label="Izoh (ixtiyoriy)"
            value={note}
            maxLength={500}
            onChange={(event) => setField("note", event.target.value)}
          />
        </section>
      </div>

      <SuspensionPreview
        preview={preview}
        draftError={draftError}
        previewError={previewError}
        isBusy={isSettling || isPreviewing}
      />

      <div className="sticky bottom-0 z-10 bg-white pt-3 shadow-[0_-14px_14px_-14px_rgba(15,23,42,0.18)] xs:-bottom-6 xs:-mx-6 xs:px-6 xs:pb-6">
        <Button type="submit" variant="danger" className="w-full" loading={isLoading} disabled={!canSave}>
          {scope === "all"
            ? "Barcha xodimlar oyligini to'xtatish"
            : staffIds.length > 0
              ? `Oylikni to'xtatish — ${staffIds.length} ta xodim`
              : "Oylikni to'xtatish"}
        </Button>
      </div>
    </InputGroup>
  );
};

/**
 * NATIJA — kimning oyligi qanchadan qanchaga tushadi, qaysi biri o'zgarmaydi.
 * ⚠️ Summalar QO'SHILMAYDI: jami ham serverdan.
 */
const SuspensionPreview = ({ preview, draftError, previewError, isBusy }) => {
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
            {preview.monthLabel} · {preview.componentLabel} · {totals.staffCount} ta xodim
          </p>
          <p className="text-xl font-bold text-red-600">− {formatMoney(totals.stoppedAmount)}</p>
          <p className="text-xs text-gray-500">
            {formatMoney(totals.beforeAmount)} → {formatMoney(totals.afterAmount)}
          </p>
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
                <span className="block text-red-600">− {formatMoney(row.draftAmount)}</span>
                <span className="block text-xs text-gray-400">
                  {formatMoney(row.beforeAmount)} → {formatMoney(row.afterAmount)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {(totals.resyncCount > 0 || totals.lockedCount > 0 || totals.noEffectCount > 0) && (
        <div className="space-y-1.5">
          {totals.resyncCount > 0 && (
            <Notice>
              {totals.resyncCount} ta xodimning {preview.monthLabel} oyligi shakllantirilgan — to'xtatish
              bilan qayta hisoblanadi.
            </Notice>
          )}
          {totals.lockedCount > 0 && (
            <Notice>
              {totals.lockedCount} ta xodimga to'langan pul yangi summadan ko'p — ularning{" "}
              {preview.monthLabel} oyligi o'zgarmaydi.
            </Notice>
          )}
          {totals.noEffectCount > 0 && (
            <Notice>
              {totals.noEffectCount} ta xodimda bu qism yo'q yoki allaqachon to'xtatilgan — summasi
              o'zgarmaydi.
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

export const CancelSuspensionModal = () => (
  <ResponsiveModal name="cancelSuspension" title="Oylik to'xtatishni bekor qilish">
    <CancelSuspensionForm />
  </ResponsiveModal>
);

const CancelSuspensionForm = ({ close, isLoading, setIsLoading, suspension }) => {
  const { mutate: cancel } = useCancelSuspension();
  const { reason, whole, setField } = useObjectState({ reason: "", whole: false });

  const groupSize = suspension?.batchActiveCount ?? 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);

    cancel(
      whole ? { batchId: suspension.batchId, reason } : { id: suspension.id, reason },
      {
        onSuccess: (result) => {
          close();
          toast.success(`${result.cancelled} ta to'xtatish bekor qilindi — oylik qayta hisoblandi`);
          if (result.resync.conflicts > 0) {
            toast.warning(
              `${result.resync.conflicts} ta oylik shu orada o'zgardi — "Shakllantirish" uni qayta hisoblaydi`,
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
        <p className="font-medium text-gray-900">{suspension?.staffName}</p>
        <p className="text-gray-500">
          {suspension?.componentLabel} · {suspension?.periodLabel}
        </p>
        <p className="text-gray-500">Sabab: {suspension?.reason}</p>
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
          <p className="text-xs text-gray-500">Guruh — bitta amalda birga yozilgan to'xtatishlar.</p>
        </div>
      )}

      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{SUSPENSION_HINTS.cancel}</p>

      <InputField
        required
        name="reason"
        label="Bekor qilish sababi"
        value={reason}
        maxLength={200}
        placeholder="Xato kiritilgan"
        onChange={(event) => setField("reason", event.target.value)}
      />

      <Button type="submit" className="w-full" loading={isLoading} disabled={!reason.trim()}>
        {whole ? `Guruhni bekor qilish (${groupSize} ta)` : "Bekor qilish"}
      </Button>
    </InputGroup>
  );
};
