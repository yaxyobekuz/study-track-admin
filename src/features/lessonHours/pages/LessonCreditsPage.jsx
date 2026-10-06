// React
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

// Router
import { useOutletContext } from "react-router-dom";

// Icons
import {
  BadgeCheck,
  Check,
  CheckCheck,
  ClipboardX,
  History,
  Lock,
  Search,
  Undo2,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Pagination from "@/shared/components/ui/Pagination";
import Panel from "../components/Panel";
import DayPicker from "../components/DayPicker";
import {
  CreateLessonCreditsModal,
  RevokeLessonCreditsModal,
} from "../components/LessonCreditModals";
import { RecalcPayrollModal } from "@/features/payroll/components/RecalcPayrollModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { todayInputValue } from "@/shared/utils/date.utils";

// Data & queries
import { CHIP, SURFACE, T, rowDelay } from "../data/ledger.tokens";
import {
  CREDIT_HINT,
  CREDIT_STATUS_FILTERS,
  CREDIT_STATUS_META,
  creditLessonKey,
  shiftDayValue,
} from "../data/lessonHours.data";
import { lessonCreditQueries } from "../queries/lessonHours.queries";

const VIEWS = [
  { key: "day", label: "Kun bo'yicha", icon: ClipboardX },
  { key: "history", label: "Tarix", icon: History },
];

/** Eng oxirgi o'tgan dars kuni (kecha, yakshanba bo'lsa — shanba). */
const lastPastDay = () => shiftDayValue(todayInputValue(), -1);

/**
 * O'TILMAGAN DARSLAR — rahbariyat ularni "o'tildi" qiladi.
 *
 * Dars o'tilmagan bo'lsa (kelmagan / baho qo'yilmagan) uning soati, demak
 * puli oylikka yozilmaydi. Platforma ishlamay qolgan, baho daftarda
 * qo'yilgan yoki davomat xato bo'lgan kunlar uchun boshliq shu yerdan
 * darsni o'tilgan deb belgilaydi:
 *
 *   · bittalab — dars qatoridagi "O'tildi qilish";
 *   · bir nechtalab — belgilab, "Tanlanganlarni o'tildi qilish";
 *   · o'qituvchining hamma darsi yoki kunning HAMMA darsi — bitta tugma.
 *
 * ⚠️ RO'YXAT SERVERDAN, PUL HAM SERVERDAN: kunning o'tilmagan darslari soat
 * hisobining o'zidan (`missedLessons`) keladi, summa ham — panel hech narsa
 * hisoblamaydi. Saqlashda server ro'yxatni QAYTA tekshiradi.
 *
 * ⚠️ TANLOV KUN BILAN BIRGA TOZALANADI — va bu hodisada (kun almashtirilgan
 * paytda), effekt bilan emas: eski kunning tanlovi yangi kun nomi ostida
 * yuborilib ketmasligi kerak.
 */
const LessonCreditsPage = () => {
  const { can } = usePermissions();
  const { openModal } = useModal();
  const { filterSlot } = useOutletContext() ?? {};

  const [view, setView] = useState("day");
  const [date, setDate] = useState(lastPastDay);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(() => new Set());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const canView = can("lessonCredits.view");
  const canManage = can("lessonCredits.manage");
  const maxDay = lastPastDay();

  const dayQuery = useQuery({
    ...lessonCreditQueries.day({ date }),
    enabled: canView && view === "day" && Boolean(date),
  });
  const historyQuery = useQuery({
    ...lessonCreditQueries.list({ page, limit: 20, ...(status ? { status } : {}) }),
    enabled: canView && view === "history",
  });

  const day = dayQuery.data;

  // Qidiruv — faqat ko'rinishni toraytiradi (ism yoki login), ro'yxat serverdan
  const teachers = useMemo(() => {
    const list = day?.teachers ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (t) =>
        t.teacherName.toLowerCase().includes(needle) ||
        t.username?.toLowerCase().includes(needle),
    );
  }, [day, query]);

  if (!canView) {
    return (
      <Card className="p-0 xs:p-0">
        <EmptyState
          icon={Lock}
          title="Ruxsat yo'q"
          description="O'tilmagan darslarni ko'rish uchun ruxsatingiz yo'q. Kerak bo'lsa administratordan so'rang."
        />
      </Card>
    );
  }

  const changeDay = (next) => {
    setDate(next);
    setPicked(new Set());
  };

  /** Tanlangan darslar — o'qituvchilar kesimida, modal shu shaklni kutadi. */
  const pickedGroups = (day?.teachers ?? [])
    .map((t) => ({
      ...t,
      lessons: t.lessons.filter((lesson) => picked.has(creditLessonKey(t.teacherId, lesson))),
    }))
    .filter((t) => t.lessons.length > 0);

  const openCreate = ({ mode, groups, teacherIds }) =>
    openModal("createLessonCredits", {
      date: day.date,
      dateLabel: day.dateLabel,
      mode,
      teacherIds,
      groups: groups.map((t) => ({
        teacherId: t.teacherId,
        teacherName: t.teacherName,
        lessons: t.lessons,
      })),
      sealed: groups.some((t) => t.sealedEntry),
      onDone: () => setPicked(new Set()),
    });

  const toggle = (keys) =>
    setPicked((prev) => {
      const next = new Set(prev);
      const allOn = keys.every((key) => next.has(key));
      for (const key of keys) {
        if (allOn) next.delete(key);
        else next.add(key);
      }
      return next;
    });

  return (
    <div className="space-y-4">
      {filterSlot &&
        createPortal(
          <>
            <Segmented
              value={view}
              options={VIEWS}
              onChange={(next) => {
                setView(next);
                setPage(1);
              }}
            />

            {view === "day" ? (
              <DayPicker value={date} max={maxDay} onChange={changeDay} hint={CREDIT_HINT.today} />
            ) : (
              <Segmented
                value={status}
                options={CREDIT_STATUS_FILTERS.map((o) => ({ ...o, count: o.key === "active" ? historyQuery.data?.totals?.active : null }))}
                onChange={(next) => {
                  setStatus(next);
                  setPage(1);
                }}
              />
            )}
          </>,
          filterSlot,
        )}

      {view === "day" ? (
        <>
          {/* ── Kun jamlanmasi ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <Metric label="O'tilmagan darslar" value={day?.totals.lessons} loading={dayQuery.isLoading} />
            <Metric label="O'qituvchilar" value={day?.totals.teachers} loading={dayQuery.isLoading} />
            <Metric
              label="Soat puli"
              value={day ? formatMoney(day.totals.missedAmount) : null}
              hint="belgilansa oylikka qaytadi"
              loading={dayQuery.isLoading}
            />
            <Metric label="O'tildi deb belgilangan" value={day?.totals.credited} loading={dayQuery.isLoading} />
          </div>

          {day?.isClosedMonth && day.totals.sealed > 0 && (
            <div className={cn(SURFACE.tile, "flex items-start gap-2.5 bg-amber-50/80")}>
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
              <p className={cn(T.hint, "leading-relaxed text-amber-900")}>
                {`${day.monthLabel}: ${day.totals.sealed} ta o'qituvchining oyligi allaqachon muhrlangan. `}
                {CREDIT_HINT.sealed}
              </p>
            </div>
          )}

          {/* ── O'tilmagan darslar ─────────────────────────────── */}
          <Panel
            title={day ? `O'tilmagan darslar · ${day.dateLabel}` : "O'tilmagan darslar"}
            hint={CREDIT_HINT.rule}
            icon={ClipboardX}
            tone="planned"
            isLoading={dayQuery.isLoading}
            isError={dayQuery.isError}
            isEmpty={!dayQuery.isLoading && (day?.teachers.length ?? 0) === 0}
            emptyText="Bu kunda o'tilmagan dars yo'q. Yakshanba, bayram va ta'til kunlarida dars bo'lmaydi."
            padding="flush"
          >
            {/* ⚠️ Tugmalar SARLAVHADA EMAS, tanada: telefon kengligida uzun
                tugma sarlavha va izohni bir so'zli ustunga siqib qo'yardi */}
            {canManage && day?.totals.lessons > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
                <ActionButton
                  icon={CheckCheck}
                  dark
                  onClick={() => openCreate({ mode: "day", groups: day.teachers })}
                >
                  {`Kunning hammasini o'tildi qilish · ${day.totals.lessons}`}
                </ActionButton>
                {picked.size > 0 && (
                  <>
                    <ActionButton
                      icon={Check}
                      onClick={() => openCreate({ mode: "lessons", groups: pickedGroups })}
                    >
                      {`Tanlanganlarni o'tildi qilish · ${picked.size}`}
                    </ActionButton>
                    <button
                      type="button"
                      onClick={() => setPicked(new Set())}
                      className="rounded-lg px-2 py-1.5 text-[11.5px] font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-100"
                    >
                      Tozalash
                    </button>
                  </>
                )}
              </div>
            )}

            {(day?.teachers.length ?? 0) > 6 && (
              <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
                <Search className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="O'qituvchi ismi yoki login"
                  className={cn(
                    T.td,
                    "h-auto w-full border-0 bg-transparent p-0 placeholder:text-slate-400 focus:outline-none focus:ring-0",
                  )}
                />
              </div>
            )}

            <ul className="space-y-2 px-2 pb-2">
              {teachers.map((teacher, index) => (
                <TeacherGroup
                  key={teacher.teacherId}
                  teacher={teacher}
                  picked={picked}
                  canManage={canManage}
                  delay={rowDelay(index)}
                  onToggle={toggle}
                  onCreate={openCreate}
                />
              ))}
              {teachers.length === 0 && (
                <li className={cn(T.hint, "px-3 py-6 text-center")}>Qidiruv bo'yicha o'qituvchi topilmadi</li>
              )}
            </ul>
          </Panel>

          {/* ── Shu kunga qo'yilgan belgilar ───────────────────── */}
          {day?.credited.length > 0 && (
            <Panel
              title={`O'tildi deb belgilangan · ${day.credited.length}`}
              hint={CREDIT_HINT.revoke}
              icon={BadgeCheck}
              tone="taught"
              padding="flush"
            >
              {canManage && day.credited.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
                  <ActionButton
                    icon={Undo2}
                    onClick={() => openModal("revokeLessonCredits", { credits: day.credited })}
                  >
                    Hammasini bekor qilish
                  </ActionButton>
                </div>
              )}
              <ul className="px-2 pb-2">
                {day.credited.map((credit, index) => (
                  <CreditRow key={credit.id} credit={credit} delay={rowDelay(index)} canManage={canManage} />
                ))}
              </ul>
            </Panel>
          )}
        </>
      ) : (
        <Panel
          title="Belgilar tarixi"
          hint="Kim, qachon, qaysi darsni va nega o'tildi deb belgilagan. Bekor qilinganlar ham ro'yxatda qoladi."
          icon={History}
          tone="taught"
          isLoading={historyQuery.isLoading}
          isError={historyQuery.isError}
          isEmpty={!historyQuery.isLoading && (historyQuery.data?.data?.length ?? 0) === 0}
          emptyText={status ? "Bu filtr bo'yicha belgi topilmadi" : "Hali hech qaysi dars o'tildi deb belgilanmagan"}
          padding="flush"
        >
          <ul className="px-2 pb-2">
            {(historyQuery.data?.data ?? []).map((credit, index) => (
              <CreditRow
                key={credit.id}
                credit={credit}
                delay={rowDelay(index)}
                canManage={canManage}
                showDate
              />
            ))}
          </ul>

          {historyQuery.data?.pagination?.totalPages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                currentPage={historyQuery.data.pagination.page}
                totalPages={historyQuery.data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </Panel>
      )}

      <CreateLessonCreditsModal />
      <RevokeLessonCreditsModal />
      {/* Yopilgan oy muhrlangan oyligi — xabardagi "Qayta hisoblash" shu oynani ochadi */}
      <RecalcPayrollModal />
    </div>
  );
};

/* ─────────────────────── Bo'laklar ─────────────────────── */

/** Bitta o'qituvchi — o'tilmagan darslari, tanlov va tugmalar bilan. */
const TeacherGroup = ({ teacher, picked, canManage, delay, onToggle, onCreate }) => {
  const keys = teacher.lessons.map((lesson) => creditLessonKey(teacher.teacherId, lesson));
  const pickedCount = keys.filter((key) => picked.has(key)).length;
  const allPicked = pickedCount === keys.length;

  return (
    <li className={cn(SURFACE.tile, "space-y-2 py-3 motion-safe:animate-post")} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-wrap items-center gap-2.5">
        {canManage && (
          <Checkbox
            checked={allPicked}
            partial={pickedCount > 0 && !allPicked}
            onClick={() => onToggle(keys)}
            label={`${teacher.teacherName} — hamma darslari`}
          />
        )}

        <div className="min-w-0 flex-1">
          <p className={cn(T.tdName, "truncate")}>{teacher.teacherName}</p>
          <p className={cn(T.meta, "mt-0.5 truncate")}>
            {[
              `${teacher.lessons.length} ta dars`,
              teacher.perHourRate && `soati ${formatMoney(teacher.perHourRate)}`,
              teacher.username && `@${teacher.username}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {teacher.missedAmount && (
          <span className={cn(CHIP, "shrink-0 bg-white text-slate-700")} title="Belgilansa qaytadigan dars soati puli">
            {formatMoney(teacher.missedAmount)}
          </span>
        )}
        {teacher.sealedEntry && (
          <span
            className={cn(CHIP, "shrink-0 bg-amber-50 text-amber-800")}
            title={`${teacher.sealedEntry.statusLabel} · ${formatMoney(teacher.sealedEntry.amount)}`}
          >
            Oylik muhrlangan
          </span>
        )}
        {canManage && (
          <button
            type="button"
            onClick={() =>
              onCreate({ mode: "day", groups: [teacher], teacherIds: [teacher.teacherId] })
            }
            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium text-indigo-600 transition-colors duration-200 hover:bg-indigo-50"
          >
            <CheckCheck className="size-3" strokeWidth={2.2} />
            <span className="hidden sm:inline">Hammasini o'tildi qilish</span>
            <span className="sm:hidden">Hammasi</span>
          </button>
        )}
      </div>

      <ul className="space-y-1">
        {teacher.lessons.map((lesson) => {
          const key = creditLessonKey(teacher.teacherId, lesson);
          return (
            <li key={key} className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors duration-200 hover:bg-white">
              {canManage && (
                <Checkbox
                  checked={picked.has(key)}
                  onClick={() => onToggle([key])}
                  label={`${lesson.className}, ${lesson.lessonOrder}-dars`}
                />
              )}

              <div className="min-w-0 flex-1">
                <p className={cn(T.td, "text-slate-800 sm:truncate")}>
                  {`${lesson.className}, ${lesson.lessonOrder}-dars · ${lesson.subjectName}`}
                </p>
                {(lesson.autoMarked || lesson.substituted) && (
                  <p className={cn(T.meta, "truncate")}>
                    {[lesson.substituted && "o'rinbosarlik", lesson.autoMarked && "davomat avtomatik belgilangan"]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <span className={cn(CHIP, "shrink-0 bg-rose-50 text-rose-700")}>{lesson.reasonLabel}</span>

              {canManage && (
                <button
                  type="button"
                  title="O'tildi qilish"
                  aria-label={`${lesson.className}, ${lesson.lessonOrder}-dars — o'tildi qilish`}
                  onClick={() => onCreate({ mode: "lessons", groups: [{ ...teacher, lessons: [lesson] }] })}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium text-emerald-700 transition-colors duration-200 hover:bg-emerald-50"
                >
                  <Check className="size-3" strokeWidth={2.4} />
                  <span className="hidden sm:inline">O'tildi qilish</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
};

/** Bitta belgi — kim, qaysi dars, nega; amaldagisi bekor qilinadi. */
const CreditRow = ({ credit, delay, canManage, showDate = false }) => {
  const { openModal } = useModal();
  const meta = CREDIT_STATUS_META[credit.status] ?? CREDIT_STATUS_META.revoked;

  return (
    <li
      className={cn("flex items-start gap-3 rounded-xl px-3 py-3 motion-safe:animate-post", T.row)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="min-w-0 flex-1">
        <p className={cn(T.tdName, "truncate")}>
          {credit.teacherName}
          <span className="font-normal text-slate-500">
            {` · ${showDate ? `${credit.dateLabel} · ` : ""}${credit.className}, ${credit.lessonOrder}-dars · ${credit.subjectName}`}
          </span>
        </p>
        <p className={cn(T.meta, "mt-0.5 truncate")}>
          {`${credit.missReasonLabel} → o'tildi · ${credit.reason}`}
        </p>
        <p className={cn(T.meta, "mt-0.5 truncate text-slate-400")}>
          {credit.status === "revoked"
            ? `Bekor qildi: ${credit.revokedByName} · ${credit.revokedAtLabel}${credit.revokeReason ? ` · ${credit.revokeReason}` : ""}`
            : `Belgiladi: ${credit.createdByName} · ${credit.createdAtLabel}`}
        </p>
      </div>

      {credit.penaltyCancelled && credit.status === "active" && (
        <span className={cn(CHIP, "hidden shrink-0 bg-slate-100 text-slate-600 sm:inline-flex")}>
          jarima bekor qilingan
        </span>
      )}
      <span className={cn(CHIP, "shrink-0", meta.chip)}>{meta.label}</span>

      {canManage && credit.status === "active" && (
        <button
          type="button"
          title="Bekor qilish"
          onClick={() => openModal("revokeLessonCredits", { credits: [credit] })}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <Undo2 className="size-3.5" strokeWidth={2} />
        </button>
      )}
    </li>
  );
};

/** Belgilash katakchasi — `partial`: guruhning bir qismi tanlangan. */
const Checkbox = ({ checked, partial = false, onClick, label }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={partial ? "mixed" : checked}
    aria-label={label}
    onClick={onClick}
    className={cn(
      "flex size-4 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
      checked || partial ? "bg-indigo-600 text-white" : "bg-white ring-1 ring-inset ring-slate-300 hover:ring-slate-400",
    )}
  >
    {checked && <Check className="size-2.5" strokeWidth={3} />}
    {partial && !checked && <span className="h-0.5 w-2 rounded-full bg-white" />}
  </button>
);

const Metric = ({ label, value, hint, loading }) => (
  <div className={cn(SURFACE.card, "px-4 py-3.5")}>
    <p className={T.label}>{label}</p>
    <p className={cn(T.value, T.sizeLg, "mt-2")}>
      {loading ? <span className="inline-block h-4 w-12 rounded bg-slate-100 motion-safe:animate-breathe" /> : value ?? "—"}
    </p>
    {hint && <p className={cn(T.meta, "mt-1.5")}>{hint}</p>}
  </div>
);

const ActionButton = ({ icon: Icon, dark = false, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium",
      "transition-transform duration-300 ease-out-quint motion-safe:hover:-translate-y-0.5",
      dark
        ? "bg-slate-900 text-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_12px_28px_-16px_rgba(15,23,42,0.4)]"
        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    )}
  >
    <Icon className="size-3.5" strokeWidth={2.4} />
    {children}
  </button>
);

/** Segmentli tanlagich — boshqaruv qatoridagi filtrlar bilan AYNI shakl. */
const Segmented = ({ value, options, onChange }) => (
  <div
    className={cn(
      "flex items-center gap-0.5 overflow-x-auto rounded-xl bg-white p-1 hidden-scrollbar",
      "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_20px_-14px_rgba(15,23,42,0.16)]",
    )}
  >
    {options.map((option) => {
      const Icon = option.icon;
      const active = value === option.key;
      return (
        <button
          key={option.key || "all"}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors duration-200 ease-out-quint",
            active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100",
          )}
        >
          {Icon && <Icon className="size-3.5" strokeWidth={2.2} />}
          {option.label}
          {option.count > 0 && (
            <span className={cn("tabular-nums", active ? "text-white/70" : "text-slate-400")}>{option.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default LessonCreditsPage;
