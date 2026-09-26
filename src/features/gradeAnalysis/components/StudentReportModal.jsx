// React
import { useState } from "react";

// Icons
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  FlaskConical,
  Info,
  Sparkles,
  UserRound,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Recharts
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import { AverageBar, DeltaChip } from "./OverviewPanels";
import { Initials } from "./InsightPanels";
import { RiskPill } from "./ReportsTable";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Data
import { AUDIENCE_TABS, findingMeta, fmtAvg } from "../data/gradeAnalysis.data";
import { LEVEL, MOTION, PRIORITY, SURFACE, T, toneOf } from "../data/analysis.tokens";

const GRADE_COLOR = {
  5: "bg-emerald-500",
  4: "bg-sky-500",
  3: "bg-amber-400",
  2: "bg-orange-500",
  1: "bg-rose-500",
};

const SUBJECT_STATUS = {
  strong: { label: "A'lo", tone: "positive" },
  good: { label: "Yaxshi", tone: "info" },
  watch: { label: "Kuzatuvda", tone: "warning" },
  weak: { label: "Past", tone: "warning" },
  critical: { label: "Xavfli", tone: "critical" },
  insufficient: { label: "Baho kam", tone: "neutral" },
};

/**
 * O'QUVCHI HISOBOTI — admin uchun to'liq ko'rinish.
 *
 * ⚠️ UCH AUDITORIYA bir xil faktlardan: ota-ona va o'quvchi matni — mobil
 * ilovada aynan shu ko'rinadi (admin "ota-ona nimani o'qiydi" ni oldindan
 * ko'radi), xodim matni esa faqat shu yerda.
 */
const StudentReportModal = () => (
  <ResponsiveModal
    name="gradeAnalysisReport"
    title="O'quvchi hisoboti"
    className="max-w-5xl"
  >
    <Body />
  </ResponsiveModal>
);

const Body = ({ reportId }) => {
  const { data: report, isLoading, isError } = useQuery(gradeAnalysisQueries.report(reportId));
  const history = useQuery(gradeAnalysisQueries.studentHistory(report?.studentId));
  const [audience, setAudience] = useState("parent");

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }
  if (isError || !report) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-2 text-slate-400">
        <AlertCircle className="size-6" />
        <p className={T.meta}>Hisobotni yuklab bo'lmadi</p>
      </div>
    );
  }

  const facts = report.facts ?? {};
  const level = LEVEL[report.level] ?? LEVEL.insufficient;

  return (
    <div className="space-y-5">
      {/* ── Sarlavha ─────────────────────────────────────────────── */}
      <div className={cn(SURFACE.hero, "px-5 py-5")}>
        <span aria-hidden className={SURFACE.heroLight} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <Initials name={report.name} levelKey={report.level} className="size-12 text-[15px] ring-4 ring-white/10" />
            <div className="min-w-0">
              <p className="truncate text-[19px] font-semibold tracking-[-0.02em] text-white">{report.name}</p>
              <p className={cn(T.metaDark, "mt-1")}>
                {report.className ?? "Sinfsiz"} · {report.periodTitle} · {report.rangeLabel}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-5">
            <HeroStat label="O'rtacha" value={fmtAvg(report.average)} accent={level.hex} />
            <HeroStat label="O'tgan davr" value={fmtAvg(report.previousAverage)} />
            <HeroStat label="Baholar" value={report.gradeCount} />
            <div>
              <p className={T.labelDark}>Xavf</p>
              <div className="mt-2">
                <RiskPill value={report.riskScore} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/10">
            <span className="size-1.5 rounded-full" style={{ background: level.hex }} />
            {report.levelLabel}
          </span>
          {report.delta != null && <DeltaChip value={report.delta} />}
          {report.source === "ai" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-violet-100 ring-1 ring-white/10">
              <Sparkles className="size-3" /> AI matn
            </span>
          )}
          <span className={cn(T.metaDark, "ml-auto")}>
            {report.isPublished
              ? `Yuborilgan · ota-ona ${report.parentSeen ? "ko'rdi" : "ko'rmagan"} · o'quvchi ${report.studentSeen ? "ko'rdi" : "ko'rmagan"}`
              : "Hali yuborilmagan"}
          </span>
        </div>
      </div>

      {/* ── Auditoriya matni ─────────────────────────────────────── */}
      <div>
        <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-1">
          {AUDIENCE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setAudience(tab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-200",
                audience === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {audience === "staff" ? (
          <StaffView view={report.staffView} />
        ) : (
          <AudienceView view={audience === "parent" ? report.parentView : report.studentView} />
        )}
      </div>

      {/* ── Fanlar ───────────────────────────────────────────────── */}
      {facts.subjects?.length > 0 && (
        <Section title="Fanlar" hint="Chiziqdagi qora belgi — sinf o'rtachasi">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-transparent">
                <tr className="border-b border-slate-100">
                  <th className={cn(T.th, "py-2 pr-3 text-left")}>Fan</th>
                  <th className={cn(T.th, "px-3 py-2 text-left")}>O'rtacha</th>
                  <th className={cn(T.th, "px-3 py-2 text-left")}>Sinfga nisbatan</th>
                  <th className={cn(T.th, "px-3 py-2 text-left")}>Davr ichida</th>
                  <th className={cn(T.th, "px-3 py-2 text-left")}>Oxirgi baholar</th>
                  <th className={cn(T.th, "py-2 pl-3 text-right")}>Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facts.subjects.map((subject) => {
                  const status = SUBJECT_STATUS[subject.status] ?? SUBJECT_STATUS.insufficient;
                  return (
                    <tr key={subject.id} className="bg-white last:bg-white">
                      <td className="py-2.5 pr-3">
                        <p className={T.tdName}>{subject.name}</p>
                        <p className={T.meta}>{subject.count} baho · sifat {subject.qualityRate ?? "—"}%</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex w-40 items-center gap-2.5">
                          <span className={cn(T.tdNum, "w-9")}>{fmtAvg(subject.average)}</span>
                          <div className="flex-1">
                            <AverageBar value={subject.average} marker={subject.classAverage} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {subject.vsClass != null ? (
                          <span className="inline-flex items-center gap-2">
                            <DeltaChip value={subject.vsClass} />
                            <span className={T.meta}>sinf {fmtAvg(subject.classAverage)}</span>
                          </span>
                        ) : (
                          <span className={T.meta}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {subject.change != null ? (
                          <span className="inline-flex items-center gap-2">
                            <span className={T.td}>
                              {fmtAvg(subject.firstHalf)} → {fmtAvg(subject.secondHalf)}
                            </span>
                            <DeltaChip value={subject.change} />
                          </span>
                        ) : (
                          <span className={T.meta}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          {subject.lastGrades?.map((grade, index) => (
                            <span
                              key={index}
                              className={cn(
                                "flex size-5 items-center justify-center rounded-[5px] text-[10.5px] font-bold text-white",
                                GRADE_COLOR[grade] ?? "bg-slate-300",
                              )}
                            >
                              {grade}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ring-1", toneOf(status.tone).soft)}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Mavzular ─────────────────────────────────────────── */}
        <Section title="Mavzular" hint={`Mavzusi belgilangan baholar: ${facts.topics?.coverage ?? 0}%`}>
          {facts.topics?.weak?.length || facts.topics?.strong?.length ? (
            <div className="space-y-2">
              {facts.topics.weak.map((topic) => (
                <TopicRow key={topic.id} topic={topic} tone="critical" />
              ))}
              {facts.topics.strong.map((topic) => (
                <TopicRow key={topic.id} topic={topic} tone="positive" />
              ))}
            </div>
          ) : (
            <p className={T.meta}>Mavzu bo'yicha xulosa uchun baholar yetarli emas.</p>
          )}
        </Section>

        {/* ── Davomat va diagnostika ───────────────────────────── */}
        <Section title="Davomat va diagnostika">
          <div className="grid grid-cols-2 gap-2.5">
            <MiniStat
              icon={CalendarCheck}
              label="Davomat"
              value={facts.attendance ? `${facts.attendance.rate}%` : "—"}
              hint={facts.attendance ? `${facts.attendance.absent} kun kelmagan` : "Belgilanmagan"}
            />
            <MiniStat
              icon={FlaskConical}
              label="Diagnostika"
              value={facts.diagnostics ? `${facts.diagnostics.averageScore}%` : "—"}
              hint={facts.diagnostics ? `${facts.diagnostics.attempts} ta test` : "Topshirilmagan"}
            />
          </div>
          {facts.attendance?.afterAbsenceAverage != null && (
            <p className={cn(T.meta, "mt-3")}>
              Qoldirilgan kunlardan keyingi baholar: <b className="text-slate-800">{fmtAvg(facts.attendance.afterAbsenceAverage)}</b>,
              boshqa kunlarda: <b className="text-slate-800">{fmtAvg(facts.attendance.regularAverage)}</b>
            </p>
          )}
          {facts.diagnostics?.weakTopics?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className={T.section}>Diagnostikada zaif mavzular</p>
              {facts.diagnostics.weakTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <span className={cn(T.td, "truncate")}>
                    {topic.subject ? `${topic.subject} — ` : ""}
                    {topic.topic}
                  </span>
                  <span className={cn(T.tdNum, toneOf("critical").text)}>{topic.score}%</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ── Dinamika ─────────────────────────────────────────────── */}
      {history.data?.length > 1 && (
        <Section title="Dinamika" hint="Shu o'quvchining oldingi tahlillaridagi o'rtacha baho">
          <HistoryChart rows={history.data} />
        </Section>
      )}

      {facts.dataGaps?.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/60">
          <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div>
            <p className={cn(T.label, "normal-case tracking-normal")}>Tahlilga kirmagan kesimlar</p>
            <p className={cn(T.meta, "mt-0.5")}>{facts.dataGaps.map((gap) => gap.message).join(" · ")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────── Bo'laklar ─────────────────────────── */

const HeroStat = ({ label, value, accent }) => (
  <div>
    <p className={T.labelDark}>{label}</p>
    <p className={cn(T.valueHero, "mt-1.5 text-[22px] leading-none")} style={accent ? { color: accent } : undefined}>
      {value}
    </p>
  </div>
);

const Section = ({ title, hint, children }) => (
  <section className={cn(SURFACE.card, "px-5 py-4")}>
    <div className="mb-3">
      <h3 className={T.title}>{title}</h3>
      {hint && <p className={cn(T.hint, "mt-0.5")}>{hint}</p>}
    </div>
    {children}
  </section>
);

const MiniStat = ({ icon: Icon, label, value, hint }) => (
  <div className={cn(SURFACE.tile, "px-3.5 py-3")}>
    <p className={cn(T.label, "flex items-center gap-1.5")}>
      <Icon className="size-3.5 text-slate-400" /> {label}
    </p>
    <p className={cn(T.value, T.sizeXl, "mt-2")}>{value}</p>
    <p className={cn(T.meta, "mt-1")}>{hint}</p>
  </div>
);

const TopicRow = ({ topic, tone }) => (
  <div className={cn(SURFACE.tile, "relative flex items-center gap-3 overflow-hidden py-2 pl-4 pr-3")}>
    <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", toneOf(tone).rail)} />
    <div className="min-w-0 flex-1">
      <p className={cn(T.tdName, "truncate")}>{topic.name}</p>
      <p className={T.meta}>
        {topic.subject} · {topic.count} baho
        {topic.classAverage != null ? ` · sinf ${fmtAvg(topic.classAverage)}` : ""}
      </p>
    </div>
    <span className={cn(T.tdNum, toneOf(tone).text)}>{fmtAvg(topic.average)}</span>
  </div>
);

/** Ota-ona / o'quvchi ko'rinishi — mobil ilovada AYNAN shu matn. */
const AudienceView = ({ view }) => {
  if (!view) return null;
  return (
    <div className="space-y-4">
      <div className={cn(SURFACE.card, "px-5 py-4")}>
        <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-slate-900">{view.headline}</p>
        <p className={cn(T.body, "mt-2")}>{view.summary}</p>
      </div>

      {view.focus?.length > 0 && (
        <div className="grid gap-2.5 md:grid-cols-2">
          {view.focus.map((item) => (
            <div key={item.subjectId} className={cn("rounded-2xl bg-white px-4 py-3.5 ring-1", toneOf(item.tone).ring)}>
              <div className="flex items-center justify-between gap-3">
                <p className={T.bodyStrong}>{item.subject}</p>
                <span className={cn(T.tdNum, toneOf(item.tone).text)}>{fmtAvg(item.average)}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {item.causes.map((cause, index) => (
                  <li key={index} className={cn(T.meta, "flex gap-1.5 text-slate-600")}>
                    <span className={cn("mt-1.5 size-1 shrink-0 rounded-full", toneOf(item.tone).rail)} />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {view.recommendations?.length > 0 && (
        <div>
          <p className={cn(T.section, "mb-2")}>Tavsiyalar</p>
          <ol className="space-y-2">
            {view.recommendations.map((item, index) => {
              const priority = PRIORITY[item.priority] ?? PRIORITY.medium;
              const Icon = findingMeta(item.code).icon;
              return (
                <li
                  key={index}
                  className={cn(SURFACE.card, "relative overflow-hidden py-3.5 pl-5 pr-4", MOTION.enter)}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", priority.rail)} />
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={T.bodyStrong}>{item.title}</p>
                        <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1", priority.chip)}>
                          {priority.label}
                        </span>
                      </div>
                      <p className={cn(T.body, "mt-1 text-slate-600")}>{item.detail}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {view.strengths?.length > 0 && (
        <div>
          <p className={cn(T.section, "mb-2")}>Kuchli tomonlar</p>
          <div className="grid gap-2 md:grid-cols-2">
            {view.strengths.map((item, index) => (
              <div key={index} className={cn("flex items-start gap-2.5 rounded-xl bg-emerald-50/60 px-3.5 py-3 ring-1 ring-emerald-200/60")}>
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <p className={T.bodyStrong}>{item.title}</p>
                  <p className={cn(T.meta, "mt-0.5 text-slate-600")}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StaffView = ({ view }) => (
  <div className="space-y-3">
    <div className={cn(SURFACE.card, "flex items-start gap-3 px-5 py-4")}>
      <UserRound className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <p className={T.body}>{view?.summary}</p>
    </div>
    {view?.actions?.length ? (
      <ol className="space-y-2">
        {view.actions.map((item, index) => {
          const priority = PRIORITY[item.priority] ?? PRIORITY.medium;
          return (
            <li key={index} className={cn(SURFACE.tile, "relative overflow-hidden py-3 pl-5 pr-4")}>
              <span aria-hidden className={cn("absolute inset-y-0 left-0 w-[3px]", priority.rail)} />
              <p className={T.bodyStrong}>{item.title}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1", priority.chip)}>
                  {priority.label}
                </span>
                <span className={T.meta}>{item.owner}</span>
              </div>
            </li>
          );
        })}
      </ol>
    ) : (
      <p className={cn(T.meta, "flex items-center gap-1.5")}>
        <Info className="size-3.5" /> Xodim uchun alohida ish talab qilinmaydi.
      </p>
    )}
  </div>
);

const HistoryChart = ({ rows }) => {
  const data = [...rows]
    .filter((row) => row.average != null)
    .reverse()
    .map((row) => ({ label: formatDateUz(row.toDate), average: row.average, period: row.periodLabel }));

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gaHistory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis domain={[2, 5]} tick={{ fontSize: 10.5, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [fmtAvg(value), "O'rtacha"]}
            labelFormatter={(label, payload) => `${label} · ${payload?.[0]?.payload?.period ?? ""}`}
            contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
          />
          <Area type="monotone" dataKey="average" stroke="#6366F1" strokeWidth={2.2} fill="url(#gaHistory)" dot={{ r: 3, fill: "#6366F1" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentReportModal;
