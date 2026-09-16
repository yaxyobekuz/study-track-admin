// React
import { useMemo, useState } from "react";

// Notifications
import { toast } from "sonner";

// Icons
import { CalendarRange, Check, LockOpen, Search, TriangleAlert, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import DateField from "./DateField";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { CHIP, SURFACE, T } from "../data/ledger.tokens";
import {
  MISSED_LESSONS_HINT,
  UNLOCK_MAX_RANGE_DAYS,
  UNLOCK_PRESET_OPTIONS,
  UNLOCK_SCOPE_OPTIONS,
  formatHourNumber,
  unlockTargetText,
} from "../data/lessonHours.data";
import { gradingUnlockQueries } from "../queries/lessonHours.queries";
import {
  useCreateGradingUnlock,
  useRevokeGradingUnlock,
} from "../queries/lessonHours.mutations";

const DAY_MS = 24 * 3600 * 1000;

/** Brauzer kunidan "YYYY-MM-DD" (siljish bilan). MASHINA QIYMATI — ekranga chiqmaydi. */
const inputDay = (offsetDays = 0) => {
  const date = new Date(Date.now() + offsetDays * DAY_MS);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

/** Ikki "YYYY-MM-DD" orasidagi kalendar kunlari (INKLYUZIV). */
const daysBetween = (from, to) => {
  if (!from || !to) return 0;
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Number.isNaN(a) || Number.isNaN(b) ? 0 : Math.round((b - a) / DAY_MS) + 1;
};

/**
 * BAHO QO'YISHNI OCHISH — uch savol, bir ekranda:
 *   1. qaysi kunlar (oraliq, faqat o'tgan kunlar);
 *   2. kimga — "Hammaga joriy qilish" yoki tanlangan o'qituvchilar;
 *   3. qancha muddatga (3 kun / hafta / oy oxiri / sana).
 *
 * ⚠️ OQIBAT SAQLASHDAN OLDIN AYTILADI: ochilgan kunda baho bor dars
 * davomatdan qat'i nazar o'tilgan hisoblanadi — ya'ni bu oylikka tegadi.
 *
 * Oldindan to'ldirish (`openModal("createGradingUnlock", {...})`):
 * `{ dateFrom, dateTo, scope, teacherIds }` — vedomostdagi o'qituvchi
 * oynasi shu bilan "shu kunni shu o'qituvchiga ochish"ni tayyorlab beradi.
 */
export const CreateGradingUnlockModal = () => (
  <ResponsiveModal
    name="createGradingUnlock"
    title="Baho qo'yishni ochish"
    description="O'tgan kunlarni tanlang, keyin kimga va qancha muddatga ochilishini belgilang."
    className="max-w-xl"
  >
    <UnlockForm />
  </ResponsiveModal>
);

const UnlockForm = ({
  close,
  isLoading,
  setIsLoading,
  dateFrom: presetFrom,
  dateTo: presetTo,
  scope: presetScope,
  teacherIds: presetIds,
}) => {
  const { mutate: create } = useCreateGradingUnlock();
  const yesterday = inputDay(-1);

  const { dateFrom, dateTo, scope, preset, until, reason, setField } = useObjectState({
    dateFrom: presetFrom ?? yesterday,
    dateTo: presetTo ?? presetFrom ?? yesterday,
    scope: presetScope ?? "all",
    preset: "1w",
    until: "",
    reason: "",
  });
  const [picked, setPicked] = useState(() => presetIds ?? []);

  const dayCount = daysBetween(dateFrom, dateTo);

  const problem =
    !dateFrom || !dateTo
      ? "Kunlarni tanlang"
      : dayCount < 1
        ? "Oxirgi kun boshlanishidan oldin bo'lmasin"
        : dayCount > UNLOCK_MAX_RANGE_DAYS
          ? `Oraliq ${UNLOCK_MAX_RANGE_DAYS} kundan oshmasin`
          : scope === "selected" && picked.length === 0
            ? "Kamida bitta o'qituvchini tanlang"
            : preset === "custom" && !until
              ? "Qaysi kungacha ochiq turishini tanlang"
              : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (problem) return;
    setIsLoading(true);

    create(
      {
        dateFrom,
        dateTo,
        scope,
        ...(scope === "selected" ? { teacherIds: picked } : {}),
        preset,
        ...(preset === "custom" ? { until } : {}),
        reason: reason.trim(),
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(
            `${result.rangeLabel} ochildi — ${
              result.scope === "all" ? "hamma o'qituvchiga" : `${result.teacherIds.length} ta o'qituvchiga`
            }, ${result.expiresAtLabel} gacha`,
          );
          if (result.sealedCount > 0) {
            toast.warning(
              `${result.sealedMonthsLabel}: ${result.sealedCount} ta oylik allaqachon shakllantirilgan. ${MISSED_LESSONS_HINT.sealed}`,
              { duration: 10000 },
            );
          }
        },
        onError: (error) => toast.error(error.response?.data?.message || "Ochib bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── 1. Qaysi kunlar ───────────────────────────────────── */}
      <section>
        <SectionHead label="Qaysi kunlar">
          {dayCount > 0 && (
            <span className={cn(CHIP, "bg-slate-100 text-slate-600")}>{dayCount} kun</span>
          )}
        </SectionHead>

        <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2">
          <DateField
            label="Qaysi kundan"
            value={dateFrom}
            max={yesterday}
            onChange={(next) => {
              setField("dateFrom", next);
              if (!dateTo || next > dateTo) setField("dateTo", next);
            }}
          />
          <DateField
            label="Qaysi kungacha"
            value={dateTo}
            min={dateFrom}
            max={yesterday}
            hint="Shu kun ham kiradi"
            onChange={(next) => setField("dateTo", next)}
          />
        </div>
      </section>

      {/* ── 2. Kimga ──────────────────────────────────────────── */}
      <section>
        <SectionHead label="Kimga">
          {scope === "selected" && picked.length > 0 && (
            <span className={cn(CHIP, "bg-indigo-50 text-indigo-700")}>{picked.length} ta tanlandi</span>
          )}
        </SectionHead>

        <div className="grid grid-cols-2 gap-1.5">
          {UNLOCK_SCOPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setField("scope", option.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium",
                "transition-colors duration-200 ease-out-quint",
                scope === option.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              {option.value === "all" ? (
                <Users className="size-3.5" strokeWidth={2.2} />
              ) : (
                <Check className="size-3.5" strokeWidth={2.4} />
              )}
              {option.label}
            </button>
          ))}
        </div>

        {scope === "all" ? (
          <p className={cn(T.hint, "mt-2")}>
            Hamma o'qituvchi — keyin qo'shiladiganlari ham — shu kunlarga baho qo'ya oladi.
          </p>
        ) : (
          <TeacherChecklist picked={picked} onChange={setPicked} />
        )}
      </section>

      {/* ── 3. Muddat ─────────────────────────────────────────── */}
      <section>
        <SectionHead label="Qancha muddat ochiq tursin" />

        <div className="flex flex-wrap gap-1.5">
          {UNLOCK_PRESET_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setField("preset", option.value)}
              className={cn(
                "rounded-xl px-3 py-2 text-[12px] font-medium transition-colors duration-200 ease-out-quint",
                preset === option.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="mt-2.5">
            <DateField
              label="Qaysi kungacha ochiq"
              value={until}
              min={inputDay(0)}
              hint="Shu kun oxirigacha baho qo'yish mumkin"
              onChange={(next) => setField("until", next)}
            />
          </div>
        )}
      </section>

      <label className="block">
        <span className={cn(T.label, "mb-1.5 block")}>Sabab (ixtiyoriy)</span>
        <input
          value={reason}
          maxLength={200}
          placeholder="Masalan: platforma ishlamay qolgan kunlar"
          onChange={(event) => setField("reason", event.target.value)}
          className={INPUT}
        />
      </label>

      {/* Oqibat — saqlashdan OLDIN aytiladi */}
      <div className={cn(SURFACE.tile, "flex items-start gap-2.5")}>
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" strokeWidth={2.2} />
        <p className={cn(T.hint, "leading-relaxed")}>{MISSED_LESSONS_HINT.unlock}</p>
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-white pt-1">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={isLoading || Boolean(problem)}
          title={problem ?? undefined}
          className="flex-1"
        >
          <LockOpen />
          {isLoading ? "Ochilmoqda..." : "Ochish"}
        </Button>
      </div>
    </form>
  );
};

/**
 * O'QITUVCHILAR RO'YXATI — belgilash bilan, qidiruvli.
 *
 * ⚠️ OQIM ICHIDA, portal emas — `TeacherPicker` sarlavhasidagi sabab bilan
 * (modal ichida portal qatlamini aylantirib bo'lmaydi).
 * ⚠️ "HAMMASINI BELGILASH" — FAQAT ko'rinib turganlarni: qidiruv
 * yozilgan bo'lsa, odam aynan shu natijani belgilamoqchi.
 */
const TeacherChecklist = ({ picked, onChange }) => {
  const { data: teachers = [], isLoading } = useQuery(gradingUnlockQueries.teachers());
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? teachers.filter(
          (t) => t.name?.toLowerCase().includes(needle) || t.username?.toLowerCase().includes(needle),
        )
      : teachers;
    // Darsi borlar tepada — baho qo'yadiganlar aynan ular
    return [...list].sort((a, b) => Number(b.weeklyHours > 0) - Number(a.weeklyHours > 0));
  }, [teachers, query]);

  const pickedSet = new Set(picked);
  const allVisiblePicked = visible.length > 0 && visible.every((t) => pickedSet.has(t.id));

  const toggle = (id) =>
    onChange(pickedSet.has(id) ? picked.filter((x) => x !== id) : [...picked, id]);

  const toggleVisible = () => {
    if (allVisiblePicked) {
      const hide = new Set(visible.map((t) => t.id));
      onChange(picked.filter((id) => !hide.has(id)));
    } else {
      onChange([...new Set([...picked, ...visible.map((t) => t.id)])]);
    }
  };

  return (
    <div className="mt-2.5 overflow-hidden rounded-2xl bg-slate-50/80">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Search className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ism yoki login"
          className={cn(
            T.td,
            "h-auto w-full border-0 bg-transparent p-0 placeholder:text-slate-400 focus:outline-none focus:ring-0",
          )}
        />
        <button
          type="button"
          onClick={toggleVisible}
          disabled={visible.length === 0}
          className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 disabled:opacity-40"
        >
          {allVisiblePicked ? "Tozalash" : "Hammasini belgilash"}
        </button>
      </div>

      <span className="block h-px bg-slate-100" />

      {/* ⚠️ `hidden-scrollbar` YO'Q — aylantirgich ko'rinishi kerak */}
      <ul className="max-h-[220px] space-y-0.5 overflow-y-auto p-1.5">
        {isLoading && <li className={cn(T.hint, "px-2 py-5 text-center")}>Yuklanmoqda...</li>}
        {!isLoading && visible.length === 0 && (
          <li className={cn(T.hint, "px-2 py-5 text-center")}>Hech kim topilmadi</li>
        )}
        {visible.map((teacher) => {
          const checked = pickedSet.has(teacher.id);
          return (
            <li key={teacher.id}>
              <button
                type="button"
                onClick={() => toggle(teacher.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left",
                  "transition-colors duration-200 ease-out-quint",
                  checked ? "bg-indigo-50" : "hover:bg-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
                    checked ? "bg-indigo-600 text-white" : "bg-white ring-1 ring-inset ring-slate-300",
                  )}
                >
                  {checked && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn(T.tdName, "block truncate", !teacher.weeklyHours && "text-slate-500")}>
                    {teacher.name}
                  </span>
                  {teacher.username && (
                    <span className={cn(T.meta, "block truncate")}>@{teacher.username}</span>
                  )}
                </span>
                {teacher.weeklyHours > 0 ? (
                  <span className={cn(CHIP, "shrink-0 bg-white text-slate-600")}>
                    {formatHourNumber(teacher.weeklyHours)}/hafta
                  </span>
                ) : (
                  <span className={cn(CHIP, "shrink-0 bg-white text-slate-400")}>jadvalsiz</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/**
 * YOPISH — muddatidan oldin.
 *
 * ⚠️ Faqat baho qo'yishni TO'XTATADI: shu kunlarda qo'yilgan baholar va
 * ularning soati o'z kuchida qoladi — buni oyna oldindan aytadi.
 */
export const RevokeGradingUnlockModal = () => (
  <ResponsiveModal
    name="revokeGradingUnlock"
    title="Baho qo'yishni yopish"
    description={MISSED_LESSONS_HINT.revoke}
  >
    <RevokeForm />
  </ResponsiveModal>
);

const RevokeForm = ({ close, isLoading, setIsLoading, unlock }) => {
  const { mutate: revoke } = useRevokeGradingUnlock();

  const handleRevoke = () => {
    setIsLoading(true);
    revoke(unlock.id, {
      onSuccess: () => {
        close();
        toast.success(`${unlock.rangeLabel} — baho qo'yish yopildi`);
      },
      onError: (error) => toast.error(error.response?.data?.message || "Yopib bo'lmadi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <UnlockSummary unlock={unlock} />

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Bekor qilish
        </Button>
        <Button type="button" variant="danger" disabled={isLoading} onClick={handleRevoke} className="flex-1">
          {isLoading ? "Yopilmoqda..." : "Yopish"}
        </Button>
      </div>
    </div>
  );
};

/** Oynaning qisqa ko'rinishi — kunlar, kimga, muddat. */
const UnlockSummary = ({ unlock }) => (
  <div className={cn(SURFACE.tile, "flex items-center gap-2.5")}>
    <CalendarRange className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
    <div className="min-w-0">
      <p className={cn(T.tdName, "truncate")}>{unlock?.rangeLabel}</p>
      <p className={cn(T.meta, "mt-0.5 truncate")}>
        {unlockTargetText(unlock)} · {unlock?.expiresAtLabel} gacha
      </p>
    </div>
  </div>
);

const SectionHead = ({ label, children }) => (
  <div className="mb-2 flex items-center gap-3">
    <span className={T.label}>{label}</span>
    <span className={SURFACE.rule} />
    {children}
  </div>
);

const INPUT =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-[12.5px] text-slate-900 " +
  "transition-colors duration-200 focus:bg-slate-100 focus:outline-none focus:ring-0";
