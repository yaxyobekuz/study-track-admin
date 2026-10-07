// React
import { useMemo, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowRight, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { todayInputValue } from "@/shared/utils/date.utils";
import { formatMoney } from "@/shared/utils/formatMoney";

// Hooks & queries
import useBranch from "@/shared/hooks/useBranch";
import useObjectState from "@/shared/hooks/useObjectState";
import usePermissions from "@/shared/hooks/usePermissions";
import { branchTransfersQueries } from "../queries/branchTransfers.queries";
import { useExecuteTransfer, usePreviewTransfer } from "../queries/branchTransfers.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import AckChecklist from "@/features/schedule-sync/components/AckChecklist";

// Helpers & data
import {
  errorMessage,
  hasMoney,
  isStalePlan,
  missingAckCodes,
  monthStartInputValue,
  sortPlanItems,
} from "../helpers/branchTransfers.helpers";
import {
  KIND_TITLES,
  PERMISSION_MODES,
  STAFF_MODES,
  TARIFF_MODES,
  TRANSFER_REASON_MIN,
  isTransferReasonValid,
} from "../data/branchTransfers.data";

/**
 * FILIALGA KO'CHIRISH — uch bosqich: sozlash → ko'rib chiqish → natija.
 *
 * ⚠️ BIRDANIGA KO'CHIRILMAYDI. "Ko'rib chiqish" serverdan har bir odam
 * uchun REJA oladi (nima ko'chadi, nima qoladi, qaysi oy qayerda
 * hisoblanadi, nima to'sadi). Tasdiqlash AYNI rejaning xeshi bilan
 * yuboriladi — oraliqda ma'lumot o'zgarsa server rad etadi va reja qayta
 * olinadi. Har bir oqibat alohida belgilanadi ("hammasini belgilash" yo'q),
 * sabab majburiy.
 *
 * Oyna ma'lumoti: `{ kind: "student"|"staff"|"class", items: [{id, label}], onDone }`.
 */
const BranchTransferModal = () => (
  <ResponsiveModal name="branchTransfer" title="Boshqa filialga ko'chirish" className="max-w-3xl">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, kind = "student", items = [], onDone }) => {
  const [step, setStep] = useState("settings");
  const [ids, setIds] = useState(() => items.map((item) => item.id));
  const [plan, setPlan] = useState(null);
  const [payload, setPayload] = useState(null);
  const [result, setResult] = useState(null);
  const { mutate: preview } = usePreviewTransfer();

  const today = todayInputValue();
  const settings = useObjectState({
    targetBranchId: "",
    effectiveDate: today,
    targetClassId: "",
    tariffMode: "keep",
    keepDiscounts: true,
    staffMode: "share",
    permissionsMode: "roleDefaults",
  });

  const labelOf = useMemo(() => new Map(items.map((item) => [item.id, item.label])), [items]);

  const buildPayload = (list) => {
    const s = settings.state;
    const base = { targetBranchId: s.targetBranchId, effectiveDate: s.effectiveDate };
    if (kind === "staff") {
      const mode = STAFF_MODES.find((m) => m.value === s.staffMode) ?? STAFF_MODES[0];
      return {
        ...base,
        staffIds: list,
        mode: mode.mode,
        keepSource: mode.keepSource,
        permissionsMode: s.permissionsMode,
      };
    }
    const money = { tariffMode: s.tariffMode, keepDiscounts: s.keepDiscounts };
    if (kind === "class") return { ...base, ...money, classIds: list };
    return { ...base, ...money, studentIds: list, targetClassId: s.targetClassId || null };
  };

  /** Rejani (qayta) olish — har safar YANGI so'rov. */
  const runPreview = (list = ids) => {
    if (!settings.state.targetBranchId) return toast.warning("Maqsad filialni tanlang");
    if (list.length === 0) return toast.warning("Ro'yxat bo'sh");
    const next = buildPayload(list);
    setIsLoading(true);
    preview(
      { kind, payload: next },
      {
        onSuccess: (data) => {
          setPayload(next);
          setPlan(data);
          setStep("review");
        },
        onError: (err) => toast.error(errorMessage(err)),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const removeBlocked = () => {
    const blocked = new Set(plan.items.filter((i) => i.status === "blocked").map((i) => i.id));
    const next = ids.filter((id) => !blocked.has(id));
    setIds(next);
    if (next.length) runPreview(next);
    else {
      setPlan(null);
      setStep("settings");
    }
  };

  if (step === "done" && result) {
    return <DoneStep result={result} close={close} />;
  }

  if (step === "review" && plan) {
    return (
      <ReviewStep
        // Yangi reja — tasdiqlar va sabab qaytadan (eski reja uchun berilgan edi)
        key={plan.planHash}
        kind={kind}
        plan={plan}
        payload={payload}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onBack={() => setStep("settings")}
        onRemoveBlocked={removeBlocked}
        onStale={() => runPreview()}
        onDone={(data) => {
          setResult(data);
          setStep("done");
          onDone?.();
        }}
      />
    );
  }

  return (
    <SettingsStep
      kind={kind}
      ids={ids}
      labelOf={labelOf}
      settings={settings}
      today={today}
      isLoading={isLoading}
      close={close}
      onSubmit={() => runPreview()}
    />
  );
};

// ─────────────────────────────────────────────
// 1. Sozlash
// ─────────────────────────────────────────────

const SettingsStep = ({ kind, ids, labelOf, settings, today, isLoading, close, onSubmit }) => {
  const { branch, branches } = useBranch();
  const { isOwner } = usePermissions();
  const s = settings.state;

  const branchOptions = branches
    .filter((b) => b.id !== branch?.id)
    .map((b) => ({ value: b.id, label: b.name }));

  const { data: targetClasses = [] } = useQuery({
    ...branchTransfersQueries.targetClasses(s.targetBranchId),
    enabled: kind === "student" && Boolean(s.targetBranchId),
  });

  const names = ids.map((id) => labelOf.get(id)).filter(Boolean);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-xl bg-gray-50 px-3.5 py-3 text-sm text-gray-700">
        <p className="font-medium text-gray-900">
          {KIND_TITLES[kind]}: {ids.length} ta
        </p>
        <p className="mt-0.5 line-clamp-2 text-gray-600">{names.join(", ")}</p>
      </div>

      {branchOptions.length === 0 ? (
        <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          Ko'chirish uchun boshqa filial yo'q yoki unga kirish huquqingiz yo'q.
        </p>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <SelectField
            required
            label="Qaysi filialga"
            value={s.targetBranchId}
            options={branchOptions}
            placeholder="Filialni tanlang"
            onChange={(value) => settings.setFields({ targetBranchId: value, targetClassId: "" })}
          />
          <label className="space-y-1.5">
            <span className="block text-sm font-medium text-gray-900">Yangi filialdagi birinchi kun</span>
            <Input
              type="date"
              value={s.effectiveDate}
              min={monthStartInputValue(today)}
              max={today}
              onChange={(e) => settings.setField("effectiveDate", e.target.value || today)}
            />
            <span className="block text-xs text-gray-500">Faqat joriy oy ichida, bugundan kech emas</span>
          </label>
        </div>
      )}

      {kind === "staff" ? (
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium text-gray-900">Qanday ko'chadi</legend>
          {STAFF_MODES.map((mode) => (
            <label
              key={mode.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3",
                s.staffMode === mode.value ? "border-primary/40 bg-primary/5" : "border-gray-200",
              )}
            >
              <input
                type="radio"
                name="staffMode"
                className="mt-1"
                checked={s.staffMode === mode.value}
                onChange={() => settings.setField("staffMode", mode.value)}
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">{mode.label}</span>
                <span className="block text-xs leading-relaxed text-gray-600">{mode.description}</span>
              </span>
            </label>
          ))}
          {isOwner && (
            <SelectField
              label="Yangi filialdagi ruxsatlari"
              value={s.permissionsMode}
              options={PERMISSION_MODES}
              onChange={(value) => settings.setField("permissionsMode", value)}
            />
          )}
        </fieldset>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <SelectField
            label="Tarif"
            value={s.tariffMode}
            options={TARIFF_MODES}
            onChange={(value) => settings.setField("tariffMode", value)}
          />
          {kind === "student" && (
            <SelectField
              label="Yangi filialdagi sinfi"
              value={s.targetClassId || "none"}
              disabled={!s.targetBranchId}
              options={[
                { value: "none", label: "Keyin belgilanadi" },
                ...targetClasses.map((c) => ({ value: c.id, label: c.name })),
              ]}
              onChange={(value) => settings.setField("targetClassId", value === "none" ? "" : value)}
            />
          )}
          <label className="flex items-center gap-2.5 text-sm text-gray-700 sm:col-span-2">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={s.keepDiscounts}
              onChange={(e) => settings.setField("keepDiscounts", e.target.checked)}
            />
            Chegirmalari saqlansin
          </label>
        </div>
      )}

      <div className="rounded-xl bg-blue-50 px-3.5 py-3 text-sm text-blue-800">
        Hozir hech narsa o'zgarmaydi: avval har bir odam uchun nima ko'chishi, nima qolishi va
        nimaga e'tibor berish kerakligi ko'rsatiladi.
      </div>

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button type="button" variant="secondary" onClick={close}>
          Bekor qilish
        </Button>
        <Button disabled={isLoading || branchOptions.length === 0 || !s.targetBranchId}>
          Ko'rib chiqish{isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────
// 2. Ko'rib chiqish va tasdiqlash
// ─────────────────────────────────────────────

const ReviewStep = ({
  kind,
  plan,
  payload,
  isLoading,
  setIsLoading,
  onBack,
  onRemoveBlocked,
  onStale,
  onDone,
}) => {
  const [acked, setAcked] = useState(() => new Set());
  const [missing, setMissing] = useState(() => new Set());
  const [reason, setReason] = useState("");
  const { mutate: execute } = useExecuteTransfer();

  const requiredAcks = plan.acknowledgements ?? [];
  const allAcked = requiredAcks.every((ack) => acked.has(ack.code));
  const reasonValid = isTransferReasonValid(reason);
  const canSubmit = plan.canExecute && allAcked && reasonValid && !isLoading;
  const blocked = plan.counts.blocked;

  const toggle = (code) =>
    setAcked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const handleSubmit = () => {
    setMissing(new Set());
    setIsLoading(true);
    execute(
      {
        kind,
        payload: {
          ...payload,
          planHash: plan.planHash,
          reason: reason.trim(),
          acknowledged: [...acked],
        },
      },
      {
        onSuccess: (data) => {
          if (data.status === "attention") toast.warning(data.message);
          else toast.success(data.message);
          onDone(data);
        },
        onError: (err) => {
          if (isStalePlan(err)) {
            toast.warning("Ma'lumot o'zgargan — reja qayta olindi, ko'rib chiqib qayta tasdiqlang");
            onStale();
            return;
          }
          const codes = missingAckCodes(err);
          if (codes.length) setMissing(new Set(codes));
          toast.error(errorMessage(err));
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-3 text-sm">
        <span className="font-medium text-gray-900">{plan.source.name}</span>
        <ArrowRight className="size-4 text-gray-400" />
        <span className="font-medium text-gray-900">{plan.target.name}</span>
        <span className="text-gray-500">
          · yangi filialda {plan.effectiveDateLabel} dan, bu filialda oxirgi kun {plan.lastSourceDayLabel}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Chip className="border-gray-200 bg-white text-gray-700">Jami: {plan.counts.total}</Chip>
        <Chip className="border-green-200 bg-green-50 text-green-700">Tayyor: {plan.counts.ready}</Chip>
        {blocked > 0 && (
          <Chip className="border-red-200 bg-red-50 text-red-700">To'siq bor: {blocked}</Chip>
        )}
      </div>

      {blocked > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Ko'chirish "hammasi yoki hech narsa": to'siqli {blocked} ta qatorni olib tashlang yoki
            sababini bartaraf qiling.
          </span>
          {kind !== "class" && (
            <Button type="button" size="sm" variant="outline" onClick={onRemoveBlocked} disabled={isLoading}>
              Ro'yxatdan olib tashlash
            </Button>
          )}
        </div>
      )}

      {kind === "class" && plan.classes?.length > 0 && (
        <div className="space-y-2">
          {plan.classes.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-100 px-3.5 py-3">
              <p className="text-sm font-medium text-gray-900">
                {c.name} · {c.studentIds.length} ta o'quvchi
              </p>
              <Lines items={c.notes} tone="note" />
              <Lines items={c.warnings} tone="warning" />
            </div>
          ))}
        </div>
      )}

      {plan.items.length > 0 && (
        <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
          {sortPlanItems(plan.items).map((item) => (
            <PlanItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {plan.canExecute && (
        <>
          <AckChecklist acks={requiredAcks} acked={acked} missing={missing} onToggle={toggle} disabled={isLoading} />

          <label className="block space-y-1.5">
            <span className="block text-sm font-medium text-gray-900">
              Sabab <span className="text-primary">*</span>
            </span>
            <Input
              type="textarea"
              value={reason}
              maxLength={500}
              className="min-h-20"
              placeholder="Nega ko'chirilmoqda (masalan: oila boshqa tumanga ko'chdi)"
              onChange={(e) => setReason(e.target.value)}
            />
            {!reasonValid && reason.length > 0 && (
              <span className="block text-xs text-red-600">Kamida {TRANSFER_REASON_MIN} belgi</span>
            )}
          </label>
        </>
      )}

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button type="button" variant="secondary" onClick={onBack} disabled={isLoading}>
          Orqaga
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          Tasdiqlash va ko'chirish{isLoading && "..."}
        </Button>
      </div>
    </div>
  );
};

const Chip = ({ className, children }) => (
  <span className={cn("rounded-full border px-2.5 py-0.5 font-medium", className)}>{children}</span>
);

const TONES = {
  blocker: { icon: CircleAlert, className: "text-red-700" },
  warning: { icon: TriangleAlert, className: "text-amber-700" },
  note: { icon: Info, className: "text-gray-600" },
};

const Lines = ({ items = [], tone }) => {
  if (!items.length) return null;
  const { icon: Icon, className } = TONES[tone];
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((text) => (
        <li key={text} className={cn("flex gap-2 text-xs leading-relaxed", className)}>
          <Icon className="mt-0.5 size-3.5 shrink-0" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
};

/** Bitta odamning rejasi. */
const PlanItem = ({ item }) => {
  const isBlocked = item.status === "blocked";
  const finance = item.finance;
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3",
        isBlocked ? "border-red-200 bg-red-50/40" : "border-gray-100 bg-white",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{item.label}</p>
          <p className="truncate text-xs text-gray-500">
            {item.username}
            {item.classes?.length ? ` · ${item.classes.map((c) => c.name).join(", ")}` : ""}
          </p>
        </div>
        {finance && (hasMoney(finance.debt) || hasMoney(finance.deposit) || hasMoney(finance.damageDue)) && (
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {hasMoney(finance.debt) && (
              <Chip className="border-red-200 bg-red-50 text-red-700">
                Qarz shu filialda: {formatMoney(finance.debt)}
              </Chip>
            )}
            {hasMoney(finance.deposit) && (
              <Chip className="border-blue-200 bg-blue-50 text-blue-700">
                Depozit: {formatMoney(finance.deposit)}
              </Chip>
            )}
            {hasMoney(finance.damageDue) && (
              <Chip className="border-amber-200 bg-amber-50 text-amber-800">
                Zarar qarzi: {formatMoney(finance.damageDue)}
              </Chip>
            )}
          </div>
        )}
      </div>
      <Lines items={item.blockers} tone="blocker" />
      <Lines items={item.warnings} tone="warning" />
      {!isBlocked && <Lines items={item.notes} tone="note" />}
    </div>
  );
};

// ─────────────────────────────────────────────
// 3. Natija
// ─────────────────────────────────────────────

const DoneStep = ({ result, close }) => {
  const withWarnings = result.items.filter((item) => item.warnings.length);
  const attention = result.status === "attention";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm",
          attention ? "bg-amber-50 text-amber-800" : "bg-green-50 text-green-800",
        )}
      >
        {attention ? <TriangleAlert className="mt-0.5 size-4 shrink-0" /> : <CircleCheck className="mt-0.5 size-4 shrink-0" />}
        <span>{result.message}</span>
      </div>

      {withWarnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Qo'lda hal qilinadigan qadamlar</p>
          {withWarnings.map((item) => (
            <div key={item.id} className="rounded-xl border border-amber-200 px-3.5 py-3">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <Lines items={item.warnings} tone="warning" />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Ko'chirish "Filiallararo ko'chirish → Tarix" bo'limida saqlandi.
      </p>

      <div className="flex justify-end">
        <Button type="button" onClick={close}>
          Yopish
        </Button>
      </div>
    </div>
  );
};

export default BranchTransferModal;
