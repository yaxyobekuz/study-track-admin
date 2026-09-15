// React
import { useId, useState } from "react";

// Icons
import { Check, TriangleAlert, X } from "lucide-react";

// Toast
import { toast } from "sonner";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import AssistantButton from "./AssistantButton";
import Chip from "./Chip";
import Spinner from "./Spinner";

// Hooks
import useNow from "../hooks/useNow";

// Queries
import { useConfirmAction, useRejectAction } from "../queries/aiAssistant.mutations";

// Lib
import { getErrorMessage, getErrorReason } from "../lib/errors";

// Data
import { ACTION_COPY, COPY } from "../data/aiAssistant.data";
import { riskTone, statusTone, T } from "../data/assistant.tokens";

/**
 * AMAL TAKLIFI — ega nimani tasdiqlayotganini TO'LIQ ko'radi.
 *
 * ⚠️ KARTA HECH NARSANI TAXMIN QILMAYDI. Holat, xavf yorlig'i, ko'rinish
 * va natija serverdan keladi; tasdiqdan keyin server qaytargan amal kartani
 * almashtiradi. Karta o'zicha "bajarildi" deb yozmaydi.
 *
 * ⚠️ `preview_changed` (409). Taklif va tasdiq orasida ma'lumot o'zgargan
 * — server yangi ko'rinishni qaytaradi va karta shunga almashadi. "Tushundim"
 * belgisi ham TOZALANADI: ega eski raqamlarga bergan roziligi yangi
 * raqamlarga o'tib ketmasligi kerak.
 *
 * ⚠️ QULF (`locked`) — javob hali yozilmoqda. Model taklifdan keyin
 * tushuntirishni yozadi; ega uni o'qimasdan tasdiqlamasligi uchun tugmalar
 * javob tugaguncha o'chiq.
 *
 * ⚠️ MUDDAT MAHALLIY SANALADI (30 soniyada bir), lekin qaror serverniki:
 * mahalliy "muddati o'tdi" faqat tugmani o'chiradi, holatni server
 * keyingi o'qishda o'zi yozadi.
 *
 * @param {object} props
 * @param {object} props.action - server `Action` shakli
 * @param {boolean} [props.locked]
 * @param {(action: object) => void} [props.onUpdated] - server yangi holat qaytarganda
 * @param {string} [props.className]
 */
const ActionCard = ({ action, locked = false, onUpdated, className }) => {
  const confirm = useConfirmAction();
  const reject = useRejectAction();
  const now = useNow(30 * 1000);
  const acknowledgeId = useId();

  const [acknowledgedFor, setAcknowledgedFor] = useState(null);
  const [notice, setNotice] = useState(null);

  const preview = action.preview ?? {};
  const tone = riskTone(action.risk);

  const expiresAt = Date.parse(action.expiresAt);
  const remainingMs = Number.isFinite(expiresAt) ? expiresAt - now : 0;
  const locallyExpired = action.status === "pending" && remainingMs <= 0;
  const status = locallyExpired ? "expired" : action.status;
  const statusLabel = locallyExpired ? ACTION_COPY.expiredLabel : action.statusLabel;

  // Rozilik AYNAN shu ko'rinishga bog'lanadi: `preview_changed` dan keyin
  // server yangi muddat beradi va belgi o'z-o'zidan tushadi. Obyekt
  // identifikatori emas — kesh qayta so'ralganda ham belgi saqlanadi.
  const consentKey = `${action.id}|${action.expiresAt}`;
  const acknowledged = acknowledgedFor === consentKey;
  const isPending = status === "pending";
  const isExecuting = status === "executing" || confirm.isPending;
  const busy = confirm.isPending || reject.isPending;

  const handleFresh = (fresh) => {
    if (fresh) onUpdated?.(fresh);
  };

  const handleConfirm = () => {
    setNotice(null);
    confirm.mutate(
      { id: action.id, acknowledge: acknowledged },
      {
        onSuccess: (updated) => handleFresh(updated),
        onError: (error) => {
          const reason = getErrorReason(error);
          handleFresh(error?.response?.data?.details?.action);
          if (reason === "preview_changed") {
            setAcknowledgedFor(null);
            setNotice(ACTION_COPY.previewChanged);
            return;
          }
          if (reason === "expired" || reason === "not_pending") {
            toast.info(getErrorMessage(error, COPY.genericError));
            return;
          }
          toast.error(getErrorMessage(error, COPY.genericError));
        },
      },
    );
  };

  const handleReject = () => {
    setNotice(null);
    reject.mutate(action.id, {
      onSuccess: (updated) => handleFresh(updated),
      onError: (error) => {
        handleFresh(error?.response?.data?.details?.action);
        const reason = getErrorReason(error);
        const message = getErrorMessage(error, COPY.genericError);
        if (reason === "expired" || reason === "not_pending") toast.info(message);
        else toast.error(message);
      },
    });
  };

  return (
    <article
      aria-label={action.title}
      className={cn("relative overflow-hidden rounded-[14px] bg-white ring-1 ring-slate-200", className)}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", tone.rail)} />

      <div className="px-4 pb-4 pl-5 pt-3.5">
        {/* ── Sarlavha ──────────────────────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <h4 className={cn(T.title, "min-w-0 flex-1 basis-48 [overflow-wrap:anywhere]")}>{action.title}</h4>
          <div className="flex shrink-0 items-center gap-1.5">
            <Chip tone={tone.chip}>{action.riskLabel}</Chip>
            <Chip tone={statusTone(status)}>
              {status === "executing" && <Spinner className="size-2.5 border" />}
              {statusLabel}
            </Chip>
          </div>
        </header>

        {preview.summary && (
          <p className="mt-2 text-[14px] leading-6 text-slate-800 [overflow-wrap:anywhere]">{preview.summary}</p>
        )}
        {preview.target && <p className="mt-0.5 text-[12px] leading-5 text-slate-500 [overflow-wrap:anywhere]">{preview.target}</p>}

        {preview.fields?.length > 0 && <FieldsTable fields={preview.fields} />}

        {preview.effects?.length > 0 && (
          <div className="mt-3.5">
            <p className={T.label}>{ACTION_COPY.effects}</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-5 text-slate-600 marker:text-slate-400">
              {preview.effects.map((effect, index) => (
                <li key={index}>{effect}</li>
              ))}
            </ul>
          </div>
        )}

        {preview.warnings?.length > 0 && (
          <div className="mt-3.5 rounded-[10px] bg-amber-50 px-3 py-2.5 ring-1 ring-inset ring-amber-200/70">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-amber-800">
              <TriangleAlert className="size-3.5" strokeWidth={2} aria-hidden="true" />
              {ACTION_COPY.warnings}
            </p>
            <ul className="mt-1.5 space-y-1 text-[13px] leading-5 text-amber-900">
              {preview.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {notice && isPending && (
          <p
            role="status"
            className="mt-3.5 rounded-[10px] bg-amber-50 px-3 py-2 text-[12.5px] font-medium leading-5 text-amber-900 ring-1 ring-inset ring-amber-200/70"
          >
            {notice}
          </p>
        )}
      </div>

      {/* ── Qaror / natija ─────────────────────────────────────── */}
      <footer className="border-t border-slate-100 px-4 py-3 pl-5">
        {isPending && !confirm.isPending ? (
          <PendingFooter
            action={action}
            remainingMs={remainingMs}
            locked={locked}
            busy={busy}
            rejecting={reject.isPending}
            acknowledgeId={acknowledgeId}
            acknowledged={acknowledged}
            onAcknowledge={(checked) => setAcknowledgedFor(checked ? consentKey : null)}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        ) : isExecuting ? (
          <div className="flex justify-end">
            <AssistantButton tone={action.requiresAcknowledge ? "danger" : "primary"} size="compact" loading>
              {ACTION_COPY.executing}
            </AssistantButton>
          </div>
        ) : (
          <Outcome action={action} status={status} />
        )}
      </footer>
    </article>
  );
};

/** Ko'rsatkichlar: "Ko'rsatkich | Hozir | Keyin". Tor ekranda qatorlar ustma-ust. */
const FieldsTable = ({ fields }) => (
  <div role="table" className="mt-3.5 overflow-hidden rounded-[10px] ring-1 ring-inset ring-slate-200">
    <div
      role="row"
      className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 bg-slate-50 px-3 py-2 sm:grid"
    >
      <span role="columnheader" className={T.label}>
        {ACTION_COPY.columns.indicator}
      </span>
      <span role="columnheader" className={T.label}>
        {ACTION_COPY.columns.before}
      </span>
      <span role="columnheader" className={T.label}>
        {ACTION_COPY.columns.after}
      </span>
    </div>

    {fields.map((field, index) => (
      <div
        role="row"
        key={`${field.label}-${index}`}
        className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-t border-slate-100 px-3 py-2 [&:nth-child(2)]:border-t-0 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] sm:[&:nth-child(2)]:border-t"
      >
        <span role="cell" className="col-span-2 min-w-0 text-[12.5px] leading-5 text-slate-600 [overflow-wrap:anywhere] sm:col-span-1">
          {field.label}
        </span>
        <span role="cell" className="min-w-0 text-[13px] leading-5 text-slate-600 [overflow-wrap:anywhere]">
          <span className="text-slate-500 sm:hidden">{ACTION_COPY.columns.before}: </span>
          {field.before}
        </span>
        <span role="cell" className="min-w-0 text-[13px] font-semibold leading-5 text-slate-900 [overflow-wrap:anywhere]">
          <span className="font-normal text-slate-500 sm:hidden">{ACTION_COPY.columns.after}: </span>
          {field.after}
        </span>
      </div>
    ))}
  </div>
);

const PendingFooter = ({
  action,
  remainingMs,
  locked,
  busy,
  rejecting,
  acknowledgeId,
  acknowledged,
  onAcknowledge,
  onConfirm,
  onReject,
}) => {
  const minutes = Math.ceil(remainingMs / 60000);
  const expiryText = minutes <= 1 ? ACTION_COPY.expiresSoon : `${minutes} daqiqa ichida tasdiqlang`;
  const critical = action.requiresAcknowledge;

  return (
    <div className="flex flex-col gap-3">
      {critical && (
        <label
          htmlFor={acknowledgeId}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-[10px] bg-rose-50/60 px-3 py-2 ring-1 ring-inset ring-rose-200/70",
            (locked || busy) && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            id={acknowledgeId}
            type="checkbox"
            checked={acknowledged}
            disabled={locked || busy}
            onChange={(event) => onAcknowledge(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-rose-600 disabled:cursor-not-allowed"
          />
          <span className="text-[13px] font-medium leading-5 text-rose-900">{ACTION_COPY.acknowledge}</span>
        </label>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className={cn(T.meta, "min-w-0")}>{locked ? ACTION_COPY.waitForAnswer : expiryText}</p>
        <div className="ml-auto flex items-center gap-2">
          <AssistantButton size="compact" tone="secondary" onClick={onReject} loading={rejecting} disabled={locked || busy}>
            {ACTION_COPY.reject}
          </AssistantButton>
          <AssistantButton
            size="compact"
            tone={critical ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={locked || busy || (critical && !acknowledged)}
          >
            {ACTION_COPY.confirm}
          </AssistantButton>
        </div>
      </div>
    </div>
  );
};

const Outcome = ({ action, status }) => {
  if (status === "succeeded") {
    const details = action.result?.details ?? [];
    return (
      <div>
        <p className="flex items-start gap-2 text-[13.5px] font-medium leading-5 text-emerald-800">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden="true" />
          <span className="min-w-0">{action.result?.summary}</span>
        </p>
        {details.length > 0 && (
          <dl className="mt-2 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1 pl-6 text-[12.5px] leading-5">
            {details.map((item, index) => (
              <div key={`${item.label}-${index}`} className="contents">
                <dt className="text-slate-500">{item.label}</dt>
                <dd className="min-w-0 font-medium text-slate-800 [overflow-wrap:anywhere]">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {action.executedAtLabel && <p className={cn(T.meta, "mt-2 pl-6")}>{action.executedAtLabel}</p>}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-start gap-2 text-[13.5px] leading-5">
        <X className="mt-0.5 size-4 shrink-0 text-rose-600" strokeWidth={2} aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-medium text-rose-800">{ACTION_COPY.failedTitle}</p>
          {action.errorMessage && <p className="mt-0.5 text-rose-700">{action.errorMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <p className="text-[13px] leading-5 text-slate-500">
      {status === "expired" ? ACTION_COPY.expiredHint : ACTION_COPY.rejectedHint}
    </p>
  );
};

export default ActionCard;
