// React
import { useMemo, useState } from "react";

// Router
import { useNavigate } from "react-router-dom";

// Icons
import { ChevronDown, ChevronRight, Crown, LayoutGrid, TrendingDown, Trophy } from "lucide-react";

// Components
import Select from "@/shared/components/ui/select/Select";
import Panel from "./Panel";
import { Initials } from "./InsightPanels";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { deltaTone, fmtAvg, fmtDelta } from "../data/gradeAnalysis.data";
import { DELAY, LEVEL, MOTION, SURFACE, T, levelKeyOfAverage, placeBadgeOf, toneOf } from "../data/analysis.tokens";

/** Maktab ro'yxatida birinchi ko'rinadigan qatorlar soni — eng yuqori 3 / eng past 3 (qolgani — "Hammasi"). */
const SCHOOL_VISIBLE = 3;
/** Sinf kartalari — birinchi ko'rinadigan soni. */
const CLASSES_VISIBLE = 6;

const KIND = {
  best: { label: "Eng yuqori natijalar", short: "Eng yuqori", icon: Crown, accent: "bg-amber-50 text-amber-600", empty: "Reytingga kirgan o'quvchi yo'q" },
  worst: { label: "Eng past natijalar", short: "Eng past", icon: TrendingDown, accent: "bg-rose-50 text-rose-600", empty: "Eng past natijalar ro'yxati bo'sh" },
};

/**
 * ENG YUQORI VA ENG PAST NATIJALAR — "O'quvchilar natijalari" tabi.
 *
 * ⚠️ HISOB SERVERDA (`buildStudentResults` → `buildRankings`,
 * `helpers/gradeAnalysis.js`): sahifa hech narsani qayta saralamaydi va
 * o'rin bermaydi. Qoidalar qisqacha:
 *   · sinfda — eng yuqori 3 va eng past 3 (kichik sinfda yarmidan
 *     bo'linadi, ro'yxatlar kesishmaydi);
 *   · maktabda — har sinfning uchtaligi yig'ilib, qayta o'rin oladi;
 *   · o'rtacha teng bo'lsa baholar soni ko'pi oldinda, ikkalasi ham teng
 *     bo'lsa o'rin ulashiladi;
 *   · baholari juda kam o'quvchi reytingga kirmaydi (kartada aytiladi).
 *
 * Qatorni bosish — o'quvchi profili (`/users/:id`).
 */

/* ─────────────────────────── Maktab bo'yicha ─────────────────────────── */

export const SchoolRankings = ({ rankings, delay }) => {
  const size = rankings?.size ?? 3;

  return (
    <Panel
      title="Maktab bo'yicha"
      hint={
        `Har sinfning eng yuqori ${size} va eng past ${size} natijasi bitta ro'yxatda, maktab bo'yicha o'rni bilan` +
        (rankings?.school?.classes ? ` · ${rankings.school.classes} ta sinf` : "")
      }
      icon={Trophy}
      accent="bg-amber-50 text-amber-600"
      delay={delay}
      className="h-auto"
      isEmpty={!rankings?.school?.best?.length && !rankings?.school?.worst?.length}
      emptyText="Reyting uchun baholar yetarli emas"
    >
      {rankings && (
        <div className="grid gap-5 lg:grid-cols-2">
          <SchoolColumn kind="best" rows={rankings.school.best} delay={delay} />
          <SchoolColumn kind="worst" rows={rankings.school.worst} delay={delay + 45} />
        </div>
      )}
    </Panel>
  );
};

const SchoolColumn = ({ kind, rows, delay }) => {
  const [expanded, setExpanded] = useState(false);
  const openStudent = useOpenStudent();
  const meta = KIND[kind];
  const Icon = meta.icon;
  const visible = expanded ? rows : rows.slice(0, SCHOOL_VISIBLE);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("flex size-6 items-center justify-center rounded-lg", meta.accent)}>
          <Icon className="size-3.5" />
        </span>
        <p className={T.bodyStrong}>{meta.label}</p>
        {kind === "worst" && <span className={cn(T.meta, "ml-auto")}>1 — eng past</span>}
      </div>

      {rows.length === 0 ? (
        <p className={cn(T.meta, "flex min-h-24 items-center justify-center text-center")}>{meta.empty}</p>
      ) : (
        <ul className="-mx-2 divide-y divide-slate-100">
          {visible.map((row, index) => (
            <li
              key={`${row.classId}-${row.studentId}`}
              className={MOTION.enter}
              style={{ animationDelay: `${DELAY.item(delay, Math.min(index, 12))}ms` }}
            >
              <RankRow
                kind={kind}
                row={row}
                subtitle={`${row.className ?? "—"} · sinfda ${row.classPlace}-o'rin (${row.classSize} tadan) · ${row.gradeCount} baho`}
                onOpen={() => openStudent(row.studentId)}
              />
            </li>
          ))}
        </ul>
      )}

      {rows.length > SCHOOL_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Qisqartirish" : `Hammasini ko'rsatish (${rows.length})`}
        </button>
      )}
    </div>
  );
};

/* ─────────────────────────── Sinflar kesimida ─────────────────────────── */

export const ClassRankings = ({ rankings, delay }) => {
  const classes = useMemo(() => rankings?.classes ?? [], [rankings]);
  const [classId, setClassId] = useState("");
  const [expanded, setExpanded] = useState(false);

  const options = useMemo(
    () => [{ value: "", label: "Barcha sinflar" }, ...classes.map((row) => ({ value: row.classId, label: row.name }))],
    [classes],
  );

  // Tanlangan sinf ro'yxatda yo'q bo'lsa (davr o'zgardi) — hammasi ko'rinadi
  const picked = classId && classes.some((row) => row.classId === classId) ? classId : "";
  const filtered = picked ? classes.filter((row) => row.classId === picked) : classes;
  const visible = picked || expanded ? filtered : filtered.slice(0, CLASSES_VISIBLE);
  const size = rankings?.size ?? 3;

  return (
    <Panel
      title="Sinflar kesimida"
      hint={`Har sinfda eng yuqori ${size} va eng past ${size} natija. Bosing — o'quvchi profili`}
      icon={LayoutGrid}
      accent="bg-sky-50 text-sky-600"
      delay={delay}
      className="h-auto"
      isEmpty={classes.length === 0}
      emptyText="Sinf kesimida reyting uchun baholar yetarli emas"
    >
      {classes.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className={T.meta}>{classes.length} ta sinf</p>
          <div className="w-full sm:w-auto">
            <Select triggerClassName="h-9 w-full sm:min-w-44" value={picked} options={options} onChange={setClassId} />
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {visible.map((row, index) => (
          <ClassCard key={row.classId} row={row} delay={DELAY.item(delay, Math.min(index, 8))} />
        ))}
      </div>

      {!picked && filtered.length > CLASSES_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex items-center gap-1 self-start rounded-lg px-2 py-1 text-[11.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Qisqartirish" : `Barcha sinflar (${filtered.length})`}
        </button>
      )}
    </Panel>
  );
};

const ClassCard = ({ row, delay }) => {
  const levelKey = levelKeyOfAverage(row.average);
  const outside = (row.total ?? row.students) - row.ranked;

  return (
    <div className={cn(SURFACE.tile, "px-4 py-3.5", MOTION.enter)} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn(T.title, "truncate")}>{row.name}</p>
          <p className={cn(T.meta, "mt-0.5")}>
            {row.total != null ? `${row.total} tadan ${row.ranked} o'quvchi reytingda` : `${row.ranked} o'quvchi reytingda`}
            {outside > 0 && ` · ${outside} nafarida baho kam (kamida ${row.minGrades} ta kerak)`}
          </p>
        </div>
        {row.average != null && (
          <div className="shrink-0 text-right">
            <p className={T.label}>Sinf</p>
            <p className={cn(T.tdNum, "mt-0.5", LEVEL[levelKey]?.text)}>{fmtAvg(row.average)}</p>
          </div>
        )}
      </div>

      <MiniList kind="best" rows={row.best} />
      {row.worst.length > 0 && <MiniList kind="worst" rows={row.worst} />}
    </div>
  );
};

const MiniList = ({ kind, rows }) => {
  const openStudent = useOpenStudent();
  const Icon = KIND[kind].icon;
  return (
    <div className="mt-3">
      <p className={cn(T.section, "mb-1 flex items-center gap-1.5", toneOf(kind === "best" ? "positive" : "critical").text)}>
        <Icon className="size-3" /> {KIND[kind].short}
      </p>
      <ul className="-mx-2">
        {rows.map((item) => (
          <li key={item.studentId}>
            <RankRow
              compact
              kind={kind}
              row={item}
              hot
              subtitle={`${item.gradeCount} baho`}
              onOpen={() => openStudent(item.studentId)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ─────────────────────────── Qator ─────────────────────────── */

const useOpenStudent = () => {
  const navigate = useNavigate();
  return (studentId) => navigate(`/users/${studentId}`);
};

const DELTA_TEXT = { positive: "text-emerald-600", critical: "text-rose-600", neutral: "text-slate-400" };

/** O'tgan davrga nisbatan o'zgarish — o'tgan davrda baho yetarli bo'lmasa chizilmaydi. */
const Delta = ({ value }) => {
  if (value == null) return null;
  const tone = deltaTone(value);
  return (
    <span
      title="O'tgan davrga nisbatan"
      className={cn("block text-[10.5px] font-semibold tabular-nums leading-none", DELTA_TEXT[tone])}
    >
      {tone === "neutral" ? fmtDelta(value) : `${tone === "positive" ? "↑" : "↓"}${fmtAvg(Math.abs(value))}`}
    </span>
  );
};

const RankRow = ({ kind, row, hot, subtitle, onOpen, compact = false }) => {
  const Tag = onOpen ? "button" : "div";
  const place = row.place;
  return (
    <Tag
      {...(onOpen ? { type: "button", onClick: onOpen } : {})}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-2 text-left transition-colors duration-200",
        compact ? "py-1.5" : "py-2",
        onOpen && "hover:bg-slate-50",
      )}
    >
      <span
        title={kind === "best" ? `${place}-o'rin` : `${place}-o'rin (eng pastdan)`}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums ring-1",
          compact ? "size-6 text-[10.5px]" : "size-7 text-[11.5px]",
          placeBadgeOf(kind, place, hot),
        )}
      >
        {place}
      </span>
      {!compact && <Initials name={row.name} levelKey={row.level} />}
      <div className="min-w-0 flex-1">
        <p className={cn(T.tdName, "truncate")}>{row.name}</p>
        <p className={cn(T.meta, compact ? "truncate" : "break-words")}>{subtitle}</p>
      </div>
      <span className="w-12 shrink-0 space-y-1 text-right">
        <span className={cn(T.tdNum, "block", LEVEL[levelKeyOfAverage(row.average)]?.text)}>{fmtAvg(row.average)}</span>
        <Delta value={row.delta} />
      </span>
      {onOpen && (
        <ChevronRight className="size-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />
      )}
    </Tag>
  );
};
