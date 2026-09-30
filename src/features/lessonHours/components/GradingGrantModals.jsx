// React
import { useMemo, useState } from "react";

// Notifications
import { toast } from "sonner";

// Icons
import { Check, Info, KeyRound, Search } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import TeacherPicker from "./TeacherPicker";
import DateField from "./DateField";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";
import { DAYS_UZ, formatDateUz } from "@/shared/utils/date.utils";

// Data & queries
import { CHIP, SURFACE, T } from "../data/ledger.tokens";
import {
  GRANT_HINT,
  GRANT_MAX_RANGE_DAYS,
  GRANT_MODE_OPTIONS,
  GRANT_PRESET_OPTIONS,
} from "../data/lessonHours.data";
import { gradingGrantQueries } from "../queries/lessonHours.queries";
import {
  useCreateGradingGrant,
  useRevokeGradingGrant,
} from "../queries/lessonHours.mutations";

const DAY_MS = 24 * 3600 * 1000;

/** Brauzer kunidan "YYYY-MM-DD". MASHINA QIYMATI — ekranga chiqmaydi. */
const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
};

/** UTC yarim tuni → "YYYY-MM-DD". */
const keyOfUtc = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;

const parseKey = (key) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key ?? ""));
  return match ? { y: +match[1], m: +match[2], d: +match[3] } : null;
};

/**
 * Muddat oxiri — server `presetEnd` (`gradingGrant.service.js`) bilan AYNI:
 * 1 hafta = 7 kun, 1 oy / 1 yil — keyingi oy/yilning shu kunidan bir kun
 * oldin. Faqat KO'RSATISH uchun: oxirgi kunni server o'zi hisoblaydi.
 */
const presetEndKey = (fromKey, preset) => {
  const p = parseKey(fromKey);
  if (!p) return "";
  if (preset === "1w") return keyOfUtc(new Date(Date.UTC(p.y, p.m - 1, p.d + 6)));
  if (preset === "1m") return keyOfUtc(new Date(Date.UTC(p.y, p.m, p.d - 1)));
  if (preset === "1y") return keyOfUtc(new Date(Date.UTC(p.y + 1, p.m - 1, p.d - 1)));
  return "";
};

/** Ikki "YYYY-MM-DD" orasidagi kalendar kunlari (INKLYUZIV). */
const daysBetween = (from, to) => {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Number.isNaN(a) || Number.isNaN(b) ? 0 : Math.round((b - a) / DAY_MS) + 1;
};

/** Sananing hafta kuni raqami (0 — yakshanba), `getUTCDay` bilan. */
const weekdayOf = (key) => {
  const time = Date.parse(`${key}T00:00:00Z`);
  return Number.isNaN(time) ? null : new Date(time).getUTCDay();
};

const timeText = (lesson) =>
  lesson.startTime ? `${lesson.startTime}${lesson.endTime ? `–${lesson.endTime}` : ""}` : null;

/**
 * FANGA BAHO RUXSATI — to'rt savol, bir ekranda:
 *   1. kimga (faqat o'qituvchi rolidagilar);
 *   2. qaysi sinf;
 *   3. qaysi fan — faqat shu sinf JADVALIDA bor fanlar (boshqasiga ruxsat
 *      hech narsani ochmasdi), haftalik darslari va kim o'tishi bilan;
 *   4. qachon — muddat bilan (1 hafta / 1 oy / 1 yil / sana) yoki bitta dars.
 *
 * ⚠️ OQIBAT SAQLASHDAN OLDIN AYTILADI: ruxsat pulga tegmaydi va kun
 * qoidalarini o'zgartirmaydi.
 */
export const CreateGradingGrantModal = () => (
  <ResponsiveModal
    name="createGradingGrant"
    title="Fanga baho ruxsati"
    description="O'qituvchi, sinf va fanni tanlang, keyin qancha muddatga ochilishini belgilang."
    className="max-w-xl"
  >
    <GrantForm />
  </ResponsiveModal>
);

const GrantForm = ({ close, isLoading, setIsLoading }) => {
  const { mutate: create } = useCreateGradingGrant();
  const today = todayKey();

  const {
    teacherId,
    classId,
    subjectId,
    mode,
    dateFrom,
    preset,
    dateTo,
    date,
    lessonOrder,
    reason,
    setField,
    setFields,
  } = useObjectState({
    teacherId: "",
    classId: "",
    subjectId: "",
    mode: "period",
    dateFrom: today,
    preset: "1m",
    dateTo: "",
    date: today,
    lessonOrder: null,
    reason: "",
  });

  const { data: options, isLoading: optionsLoading } = useQuery(gradingGrantQueries.options());
  const { data: classLessons, isLoading: lessonsLoading } = useQuery(
    gradingGrantQueries.classLessons(classId),
  );

  const subjects = classLessons?.subjects ?? [];
  const subject = subjects.find((s) => s.subjectId === subjectId) ?? null;

  // Muddat
  const endKey = preset === "custom" ? dateTo : presetEndKey(dateFrom, preset);
  const dayCount = dateFrom && endKey ? daysBetween(dateFrom, endKey) : 0;

  // Bitta dars — tanlangan kunning shu fan darslari
  const weekday = weekdayOf(date);
  const dayLessons = (subject?.lessons ?? []).filter((l) => l.weekday === weekday);
  const pickedLesson = dayLessons.find((l) => l.lessonOrder === lessonOrder) ?? null;

  const allOwn =
    Boolean(subject && teacherId) && subject.lessons.every((l) => l.teacherId === teacherId);

  const problem = !teacherId
    ? "O'qituvchini tanlang"
    : !classId
      ? "Sinfni tanlang"
      : !subjectId
        ? "Fanni tanlang"
        : mode === "period"
          ? allOwn
            ? "Bu fan darslarining hammasi shu o'qituvchining o'zida — ruxsat kerak emas"
            : !dateFrom
              ? "Qaysi kundan ekanini tanlang"
              : preset === "custom" && !dateTo
                ? "Qaysi kungacha ekanini tanlang"
                : dayCount < 1
                  ? "Oxirgi kun boshlanishidan oldin bo'lmasin"
                  : dayCount > GRANT_MAX_RANGE_DAYS
                    ? "Ruxsat 1 yildan oshmasin"
                    : null
          : !date
            ? "Dars kunini tanlang"
            : weekday === 0
              ? "Yakshanba — dars yo'q"
              : dayLessons.length === 0
                ? `Bu kuni jadvalda ${subject?.subjectName ?? "bu fan"} darsi yo'q`
                : !pickedLesson
                  ? "Darsni tanlang"
                  : pickedLesson.teacherId === teacherId
                    ? "Bu dars shu o'qituvchining o'z darsi — ruxsat kerak emas"
                    : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (problem) return;
    setIsLoading(true);

    const payload =
      mode === "period"
        ? {
            teacherId,
            classId,
            subjectId,
            mode,
            dateFrom,
            preset,
            ...(preset === "custom" ? { dateTo } : {}),
            reason: reason.trim(),
          }
        : { teacherId, classId, subjectId, mode, date, lessonOrder, reason: reason.trim() };

    create(payload, {
      onSuccess: (result) => {
        close();
        toast.success(
          `${result.teacherName}: ${result.className} · ${result.subjectName} — ${result.rangeLabel}. ` +
            `${result.openedLessons} ta dars ochildi`,
        );
      },
      onError: (error) => toast.error(error.response?.data?.message || "Ruxsat berib bo'lmadi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── 1. Kimga ─────────────────────────────────────────── */}
      <section>
        <SectionHead label="Kimga" />
        <TeacherPicker
          value={teacherId}
          onChange={(id) => setField("teacherId", id)}
          teachers={options?.teachers ?? []}
          placeholder={optionsLoading ? "Yuklanmoqda..." : "O'qituvchini tanlang"}
        />
      </section>

      {/* ── 2. Qaysi sinf ────────────────────────────────────── */}
      <section>
        <SectionHead label="Qaysi sinf" />
        <ClassChips
          classes={options?.classes ?? []}
          isLoading={optionsLoading}
          value={classId}
          onChange={(id) => setFields({ classId: id, subjectId: "", lessonOrder: null })}
        />
      </section>

      {/* ── 3. Qaysi fan ─────────────────────────────────────── */}
      {classId && (
        <section>
          <SectionHead label="Qaysi fan" />
          {lessonsLoading ? (
            <p className={cn(T.hint, "py-2")}>Yuklanmoqda...</p>
          ) : subjects.length === 0 ? (
            <p className={cn(T.hint, "py-2")}>Bu sinf uchun dars jadvali kiritilmagan.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((item) => (
                <button
                  key={item.subjectId}
                  type="button"
                  onClick={() => setFields({ subjectId: item.subjectId, lessonOrder: null })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium",
                    "transition-colors duration-200 ease-out-quint",
                    subjectId === item.subjectId
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  {item.subjectName}
                  <span
                    className={cn(
                      "tabular-nums",
                      subjectId === item.subjectId ? "text-white/60" : "text-slate-400",
                    )}
                  >
                    {item.weeklyCount}/hafta
                  </span>
                </button>
              ))}
            </div>
          )}

          {subject && mode === "period" && (
            <WeeklyLessons lessons={subject.lessons} teacherId={teacherId} />
          )}
        </section>
      )}

      {/* ── 4. Qachon ────────────────────────────────────────── */}
      <section>
        <SectionHead label="Qachon">
          {mode === "period" && dayCount > 0 && dayCount <= GRANT_MAX_RANGE_DAYS && (
            <span className={cn(CHIP, "bg-slate-100 text-slate-600")}>{dayCount} kun</span>
          )}
        </SectionHead>

        <div className="grid grid-cols-2 gap-1.5">
          {GRANT_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setField("mode", option.value)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-[12px] font-medium transition-colors duration-200 ease-out-quint",
                mode === option.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {mode === "period" ? (
          <div className="mt-2.5 space-y-2.5">
            <DateField
              label="Qaysi kundan"
              value={dateFrom}
              min={today}
              onChange={(next) => {
                setField("dateFrom", next);
                if (dateTo && next > dateTo) setField("dateTo", next);
              }}
            />

            <div className="flex flex-wrap gap-1.5">
              {GRANT_PRESET_OPTIONS.map((option) => (
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

            {preset === "custom" ? (
              <DateField
                label="Qaysi kungacha"
                value={dateTo}
                min={dateFrom || today}
                hint="Shu kun ham kiradi, ko'pi bilan 1 yil"
                onChange={(next) => setField("dateTo", next)}
              />
            ) : (
              endKey && (
                <p className={T.hint}>
                  {formatDateUz(dateFrom)} — {formatDateUz(endKey)} (shu kun ham kiradi)
                </p>
              )
            )}
          </div>
        ) : (
          <div className="mt-2.5 space-y-2.5">
            <DateField
              label="Dars kuni"
              value={date}
              min={today}
              onChange={(next) => setFields({ date: next, lessonOrder: null })}
            />

            {!subject ? (
              <p className={T.hint}>Avval sinf va fanni tanlang — shu kungi darslari chiqadi.</p>
            ) : weekday === 0 ? (
              <p className={T.hint}>Yakshanba — dars yo'q.</p>
            ) : dayLessons.length === 0 ? (
              <p className={T.hint}>
                {capitalize(DAYS_UZ[weekday] ?? "")} kuni jadvalda {subject.subjectName} darsi yo'q.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {dayLessons.map((lesson) => {
                  const own = lesson.teacherId === teacherId;
                  return (
                    <button
                      key={lesson.lessonOrder}
                      type="button"
                      disabled={own}
                      onClick={() => setField("lessonOrder", lesson.lessonOrder)}
                      className={cn(
                        "rounded-xl px-3 py-2 text-left text-[12px] font-medium",
                        "transition-colors duration-200 ease-out-quint disabled:opacity-50",
                        lessonOrder === lesson.lessonOrder
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {lesson.lessonOrder}-dars
                      {timeText(lesson) ? ` · ${timeText(lesson)}` : ""} · {own ? "o'z darsi" : lesson.teacherName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      <label className="block">
        <span className={cn(T.label, "mb-1.5 block")}>Sabab (ixtiyoriy)</span>
        <input
          value={reason}
          maxLength={200}
          placeholder="Masalan: IELTS sertifikati — o'quvchini ona tili o'qituvchisi tayyorlaydi"
          onChange={(event) => setField("reason", event.target.value)}
          className={INPUT}
        />
      </label>

      {/* Oqibat — saqlashdan OLDIN aytiladi */}
      <div className={cn(SURFACE.tile, "flex items-start gap-2.5")}>
        <Info className="mt-0.5 size-3.5 shrink-0 text-indigo-500" strokeWidth={2.2} />
        <div className="space-y-1">
          <p className={cn(T.hint, "leading-relaxed")}>{GRANT_HINT.money}</p>
          <p className={cn(T.hint, "leading-relaxed")}>{GRANT_HINT.day}</p>
        </div>
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
          <KeyRound />
          {isLoading ? "Berilmoqda..." : "Ruxsat berish"}
        </Button>
      </div>
    </form>
  );
};

/**
 * SINFLAR — belgi tugmalari, ko'p bo'lsa qidiruv bilan.
 *
 * ⚠️ OQIM ICHIDA, portal emas — `TeacherPicker` sarlavhasidagi sabab bilan
 * (modal ichida portal qatlamini aylantirib bo'lmaydi).
 */
const ClassChips = ({ classes, isLoading, value, onChange }) => {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? classes.filter((c) => c.name.toLowerCase().includes(needle)) : classes;
  }, [classes, query]);

  if (isLoading) return <p className={cn(T.hint, "py-2")}>Yuklanmoqda...</p>;
  if (classes.length === 0) return <p className={cn(T.hint, "py-2")}>Faol sinf yo'q.</p>;

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-50/80">
      {classes.length > 12 && (
        <>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Search className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Sinf nomi"
              className={cn(
                T.td,
                "h-auto w-full border-0 bg-transparent p-0 placeholder:text-slate-400 focus:outline-none focus:ring-0",
              )}
            />
          </div>
          <span className="block h-px bg-slate-100" />
        </>
      )}

      {/* ⚠️ `hidden-scrollbar` YO'Q — aylantirgich ko'rinishi kerak */}
      <div className="flex max-h-[160px] flex-wrap gap-1.5 overflow-y-auto p-2">
        {visible.length === 0 && <p className={cn(T.hint, "w-full py-3 text-center")}>Sinf topilmadi</p>}
        {visible.map((klass) => (
          <button
            key={klass.id}
            type="button"
            onClick={() => onChange(klass.id)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium",
              "transition-colors duration-200 ease-out-quint",
              value === klass.id ? "bg-indigo-600 text-white" : "bg-white text-slate-700 hover:bg-indigo-50",
            )}
          >
            {value === klass.id && <Check className="size-3" strokeWidth={3} />}
            {klass.name}
          </button>
        ))}
      </div>
    </div>
  );
};

/** Tanlangan fanning haftalik darslari — ruxsat AYNAN shularni ochadi. */
const WeeklyLessons = ({ lessons, teacherId }) => (
  <ul className={cn(SURFACE.tile, "mt-2.5 space-y-1 py-2.5")}>
    {lessons.map((lesson) => {
      const own = lesson.teacherId === teacherId;
      return (
        <li
          key={`${lesson.day}-${lesson.lessonOrder}`}
          className={cn(T.td, "flex flex-wrap items-center gap-x-2 text-slate-700", own && "text-slate-400")}
        >
          <span className="font-medium">
            {lesson.dayLabel}, {lesson.lessonOrder}-dars
          </span>
          {timeText(lesson) && <span className="tabular-nums text-slate-500">{timeText(lesson)}</span>}
          <span className="text-slate-500">· {lesson.teacherName}</span>
          {own && <span className={cn(CHIP, "bg-white text-slate-500")}>o'z darsi — ruxsatsiz ham ochiq</span>}
        </li>
      );
    })}
  </ul>
);

/**
 * YOPISH — muddatidan (yoki boshlanishidan) oldin.
 *
 * ⚠️ Qo'yilgan baholar o'z kuchida qoladi — buni oyna oldindan aytadi.
 */
export const RevokeGradingGrantModal = () => (
  <ResponsiveModal name="revokeGradingGrant" title="Ruxsatni yopish" description={GRANT_HINT.revoke}>
    <RevokeForm />
  </ResponsiveModal>
);

const RevokeForm = ({ close, isLoading, setIsLoading, grant }) => {
  const { mutate: revoke } = useRevokeGradingGrant();
  const [reason, setReason] = useState("");

  const handleRevoke = () => {
    setIsLoading(true);
    revoke(
      { id: grant.id, reason: reason.trim() },
      {
        onSuccess: () => {
          close();
          toast.success(`${grant.teacherName}: ${grant.className} · ${grant.subjectName} — ruxsat yopildi`);
        },
        onError: (error) => toast.error(error.response?.data?.message || "Yopib bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className={cn(SURFACE.tile, "flex items-center gap-2.5")}>
        <KeyRound className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
        <div className="min-w-0">
          <p className={cn(T.tdName, "truncate")}>{grant?.teacherName}</p>
          <p className={cn(T.meta, "mt-0.5 truncate")}>
            {grant?.className} · {grant?.subjectName} · {grant?.scopeLabel} · {grant?.rangeLabel}
          </p>
        </div>
      </div>

      <label className="block">
        <span className={cn(T.label, "mb-1.5 block")}>Sabab (ixtiyoriy)</span>
        <input
          value={reason}
          maxLength={200}
          placeholder="Masalan: o'quvchi sertifikat imtihonini topshirdi"
          onChange={(event) => setReason(event.target.value)}
          className={INPUT}
        />
      </label>

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

const capitalize = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text);

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
