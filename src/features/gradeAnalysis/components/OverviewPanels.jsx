// Icons
import { Activity, BookMarked, Grid3x3, Library, Microscope } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  averageToWidth,
  deltaTone,
  findingMeta,
  fmtAvg,
  fmtDelta,
} from "../data/gradeAnalysis.data";
import { DELAY, LEVEL, MOTION, SURFACE, T, heatOf, levelKeyOfAverage, toneOf } from "../data/analysis.tokens";

// Components
import Panel from "./Panel";

/* ─────────────────────────── Yordamchilar ─────────────────────────── */

export const DeltaChip = ({ value, className }) => {
  if (value == null) return <span className={cn(T.meta, className)}>—</span>;
  const tone = toneOf(deltaTone(value));
  return (
    <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums ring-1", tone.soft, className)}>
      {fmtDelta(value)}
    </span>
  );
};

/** O'rtacha baho chizig'i — rang daraja shkalasidan, kenglik 2…5 oralig'ida. */
export const AverageBar = ({ value, delay = 0, marker }) => {
  const level = LEVEL[levelKeyOfAverage(value)];
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-100">
      <div
        className={cn("h-full rounded-full", MOTION.growX)}
        style={{ width: `${averageToWidth(value)}%`, background: level.hex, animationDelay: `${delay}ms` }}
      />
      {marker != null && (
        <span
          title={`Sinf o'rtachasi: ${fmtAvg(marker)}`}
          className="absolute -top-1 h-4 w-[2px] rounded-full bg-slate-900/70"
          style={{ left: `calc(${averageToWidth(marker)}% - 1px)` }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────── Fanlar ─────────────────────────── */

export const SubjectBoard = ({ overview, delay }) => {
  const rows = overview?.subjects ?? [];
  return (
    <Panel
      title="Fanlar bo'yicha o'zlashtirish"
      hint="O'rtacha baho, o'tgan davrga farq va past natijali o'quvchilar"
      icon={Library}
      accent="bg-indigo-50 text-indigo-600"
      delay={delay}
      isEmpty={!rows.length}
      emptyText="Bu davrda baholar yo'q"
    >
      <div className="space-y-3.5">
        {rows.map((row, index) => (
          <div
            key={row.subjectId}
            className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5", MOTION.enter)}
            style={{ animationDelay: `${DELAY.item(delay, index)}ms` }}
          >
            <div className="flex min-w-0 items-baseline gap-2">
              <span className={cn(T.tdName, "truncate")}>{row.name}</span>
              <span className={cn(T.meta, "shrink-0")}>{row.count} baho</span>
            </div>
            <div className="flex items-center gap-2">
              {row.weakStudents > 0 && (
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ring-1", toneOf("warning").soft)}>
                  {row.weakStudents} past
                </span>
              )}
              <DeltaChip value={row.delta} />
              <span className={cn(T.tdNum, "w-10 text-right")}>{fmtAvg(row.average)}</span>
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <div className="flex-1">
                <AverageBar value={row.average} delay={DELAY.item(delay, index) + 100} />
              </div>
              <span className={cn(T.meta, "w-24 shrink-0 text-right")}>sifat {row.qualityRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

/* ─────────────────────────── Issiqlik xaritasi ─────────────────────────── */

/**
 * SINF × FAN — "qaysi sinfda qaysi fan oqsayapti" bir qarashda.
 * ⚠️ Birinchi ustun `sticky`: fanlar ko'p bo'lsa jadval gorizontal
 * suriladi, sinf nomi esa ko'z oldida qoladi.
 */
export const HeatmapPanel = ({ overview, delay }) => {
  const subjects = overview?.heatmap?.subjects ?? [];
  const rows = overview?.heatmap?.rows ?? [];

  return (
    <Panel
      title="Sinf × fan xaritasi"
      hint="Har katak — sinfning shu fandagi o'rtacha bahosi. Qizil tomonga qarab e'tibor ko'proq kerak"
      icon={Grid3x3}
      accent="bg-sky-50 text-sky-600"
      delay={delay}
      flush
      isEmpty={!rows.length || !subjects.length}
      emptyText="Sinf kesimi uchun ma'lumot yo'q"
    >
      <div className="overflow-x-auto pb-5">
        <table className="w-full min-w-0 border-separate border-spacing-[3px] px-4">
          <thead className="bg-transparent">
            <tr>
              <th className={cn(T.th, "sticky left-0 z-10 bg-white px-2 text-left")}>Sinf</th>
              {subjects.map((subject) => (
                <th key={subject.subjectId} className={cn(T.th, "min-w-[76px] px-1 text-center normal-case tracking-normal")}>
                  <span className="line-clamp-2 text-[10.5px] font-semibold text-slate-500" title={subject.name}>
                    {subject.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {rows.map((row, rowIndex) => (
              <tr key={row.classId} className={cn(MOTION.enter, "bg-transparent last:bg-transparent")} style={{ animationDelay: `${DELAY.item(delay, rowIndex)}ms` }}>
                <td className={cn(T.tdName, "sticky left-0 z-10 whitespace-nowrap bg-white px-2")}>{row.name}</td>
                {row.cells.map((cell) => (
                  <td
                    key={cell.subjectId}
                    title={cell.count ? `${row.name} · ${fmtAvg(cell.average)} · ${cell.count} baho` : "Baho yo'q"}
                    className={cn(
                      "h-9 rounded-lg text-center text-[12px] font-semibold tabular-nums transition-transform duration-200 ease-out-quint motion-safe:hover:scale-[1.06]",
                      heatOf(cell.count ? cell.average : null),
                    )}
                  >
                    {cell.count ? fmtAvg(cell.average) : "·"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

/* ─────────────────────────── Mavzular ─────────────────────────── */

/**
 * ⚠️ Mavzu kesimi faqat MAVZUSI YOZILGAN baholardan: mavzu bugungi darsga
 * qo'yilgan bahoga yoziladi, eski baholarda yo'q. Qamrov foizi ochiq
 * aytiladi — "mavzular yaxshi" degan xulosa 3% baholardan chiqmasin.
 */
export const TopicsPanel = ({ overview, delay }) => {
  const topics = overview?.topics;
  const hasAny = (topics?.weak?.length ?? 0) + (topics?.strong?.length ?? 0) > 0;

  return (
    <Panel
      title="Mavzular"
      hint={`Qaysi mavzu oqsayapti va qaysi biri yaxshi o'zlashtirilgan · qamrov ${topics?.coverage ?? 0}% baho`}
      icon={BookMarked}
      accent="bg-violet-50 text-violet-600"
      delay={delay}
      isEmpty={!hasAny}
      emptyText={
        topics?.coverage
          ? "Mavzu bo'yicha xulosa uchun baholar hali yetarli emas"
          : "Baholarda dars mavzusi hali belgilanmagan. Mavzu endi har bir yangi bahoga avtomatik yoziladi — kesim shu baholar bilan to'planadi"
      }
    >
      <div className="space-y-5">
        {topics.weak.length > 0 && (
          <TopicList title="E'tibor talab qiladi" rows={topics.weak} tone="critical" delay={delay} />
        )}
        {topics.strong.length > 0 && (
          <TopicList title="Yaxshi o'zlashtirilgan" rows={topics.strong} tone="positive" delay={delay + 80} />
        )}
      </div>
    </Panel>
  );
};

const TopicList = ({ title, rows, tone, delay }) => (
  <div>
    <p className={cn(T.section, "mb-2")}>{title}</p>
    <ul className="space-y-1.5">
      {rows.map((row, index) => (
        <li
          key={row.topicId}
          className={cn(SURFACE.tile, "relative flex items-center gap-3 overflow-hidden py-2.5 pl-4 pr-3", MOTION.enter)}
          style={{ animationDelay: `${DELAY.item(delay, index)}ms` }}
        >
          <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", toneOf(tone).rail)} />
          <div className="min-w-0 flex-1">
            <p className={cn(T.tdName, "truncate")} title={row.name}>
              {row.name}
            </p>
            <p className={cn(T.meta, "truncate")}>
              {row.subject} · {row.students} o'quvchi{row.classes?.length ? ` · ${row.classes.join(", ")}` : ""}
            </p>
          </div>
          <span className={cn(T.tdNum, toneOf(tone).text)}>{fmtAvg(row.average)}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ─────────────────────────── Sabablar ─────────────────────────── */

export const CausesPanel = ({ overview, delay }) => {
  const causes = overview?.causes ?? [];
  const analyzed = overview?.students?.analyzed || 1;
  const max = Math.max(1, ...causes.map((row) => row.students));

  return (
    <Panel
      title="Asosiy sabablar"
      hint="Qancha o'quvchida qaysi sabab aniqlangan (bir o'quvchida bir nechta bo'lishi mumkin)"
      icon={Microscope}
      accent="bg-amber-50 text-amber-600"
      delay={delay}
      isEmpty={!causes.length}
      emptyText="Muammo belgisi aniqlanmadi"
    >
      <ul className="space-y-3">
        {causes.slice(0, 8).map((row, index) => {
          const meta = findingMeta(row.code);
          const Icon = meta.icon;
          return (
            <li key={row.code} className={MOTION.enter} style={{ animationDelay: `${DELAY.item(delay, index)}ms` }}>
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Icon className="size-3.5" />
                </span>
                <span className={cn(T.td, "min-w-0 flex-1 truncate font-medium text-slate-800")}>{row.label}</span>
                <span className={T.tdNum}>{row.students}</span>
                <span className={cn(T.meta, "w-10 text-right")}>{Math.round((row.students / analyzed) * 100)}%</span>
              </div>
              <div className="ml-[34px] mt-1.5 h-1.5 rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400", MOTION.growX)}
                  style={{ width: `${(row.students / max) * 100}%`, animationDelay: `${DELAY.item(delay, index) + 120}ms` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
};

/* ─────────────────────────── Davomat va diagnostika ─────────────────────────── */

const PATTERNS = [
  { key: "knowledge", label: "Bilim bo'shlig'i", color: "#6366F1" },
  { key: "rushing", label: "Shoshilish", color: "#F59E0B" },
  { key: "misread", label: "Diqqatsiz o'qish", color: "#06B6D4" },
];

export const SignalsPanel = ({ overview, delay }) => {
  const attendance = overview?.attendance;
  const diagnostics = overview?.diagnostics;
  const patterns = diagnostics?.errorPatterns;

  return (
    <Panel
      title="Davomat va diagnostika"
      hint="Baholarga ta'sir qiluvchi omillar"
      icon={Activity}
      accent="bg-emerald-50 text-emerald-600"
      delay={delay}
      isEmpty={!attendance && !diagnostics}
      emptyText="Bu davrda davomat va diagnostika ma'lumoti yo'q"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={cn(SURFACE.tile, "px-4 py-3.5")}>
          <p className={T.label}>Davomat</p>
          <p className={cn(T.value, T.size2xl, "mt-2")}>{attendance ? `${attendance.rate}%` : "—"}</p>
          <p className={cn(T.meta, "mt-1.5")}>
            {attendance ? `${attendance.absent} ta sababsiz qoldirilgan kun` : "Belgilanmagan"}
          </p>
        </div>
        <div className={cn(SURFACE.tile, "px-4 py-3.5")}>
          <p className={T.label}>Diagnostika</p>
          <p className={cn(T.value, T.size2xl, "mt-2")}>{diagnostics ? `${diagnostics.averageScore}%` : "—"}</p>
          <p className={cn(T.meta, "mt-1.5")}>
            {diagnostics ? `${diagnostics.attempts} ta test natijasi` : "Test topshirilmagan"}
          </p>
        </div>
      </div>

      {patterns && (
        <div className="mt-4">
          <p className={cn(T.section, "mb-2")}>Diagnostika xatolarining sababi</p>
          <div className="flex h-2.5 w-full gap-[3px] overflow-hidden rounded-full">
            {PATTERNS.filter((row) => patterns[row.key] > 0).map((row, index) => (
              <span
                key={row.key}
                className={cn("h-full rounded-full", MOTION.growX)}
                style={{ width: `${patterns[row.key]}%`, background: row.color, animationDelay: `${DELAY.item(delay, index)}ms` }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {PATTERNS.map((row) => (
              <span key={row.key} className={cn(T.meta, "inline-flex items-center gap-1.5")}>
                <span className="size-2 rounded-full" style={{ background: row.color }} />
                {row.label}
                <span className="font-semibold text-slate-800">{patterns[row.key] ?? 0}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};
