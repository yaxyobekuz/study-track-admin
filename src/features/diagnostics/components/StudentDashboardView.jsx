// Icons
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  LayoutDashboard,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";

// Data
import { scoreColor } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * O'QUVCHI PANELINING NUSXASI — XODIM KO'ZI BILAN.
 *
 * ⚠️ MA'LUMOT O'QUVCHINIKI BILAN AYNI SERVISDAN kelib chiqadi
 * (`/diagnostics/analytics/students/:id/dashboard`). Bu ekranning butun
 * mohiyati shu: ota-ona bilan suhbatda xodim o'quvchining ekranidagi
 * AYNAN o'sha raqamlarni va o'sha so'zlarni ko'rishi kerak. Ikkinchi
 * hisoblagich yozilsa, suhbat "menda boshqacha turibdi" degan
 * ziddiyatga aylanardi.
 *
 * ⚠️ AMALLAR YO'Q. O'quvchi panelida "Mashq qilish" tugmalari bor;
 * bu yerda ular ATAYLAB chizilmagan — xodim o'quvchi nomidan test
 * boshlay olmaydi.
 */
const StudentDashboardView = ({ dashboard }) => {
  if (!dashboard) {
    return (
      <Card>
        <EmptyState
          icon={LayoutDashboard}
          title="Panel ma'lumoti yo'q"
          description="O'quvchi hali diagnostika topshirmagan."
        />
      </Card>
    );
  }

  const { recommendation, subjects = [], strongTopics = [], weakTopics = [] } =
    dashboard;

  return (
    <div className="space-y-4">
      {/* ── AI TAVSIYASI ──────────────────── */}
      {recommendation?.text && (
        <div className="rounded-2xl bg-gray-900 p-4 xs:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
              <Sparkles className="size-[18px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400">
                AI tavsiyasi
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/90">
                {recommendation.text}
              </p>
              <p className="mt-2 text-xs text-white/40">
                O'quvchi bu matnni o'z panelida shu ko'rinishda ko'radi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FANLAR ────────────────────────── */}
      {subjects.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900">Fanlar bo'yicha natijalar</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Har bir fandan o'zlashtirish darajasi
          </p>

          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {subjects.map((subject) => (
              <SubjectCard key={subject.subjectId || subject.subject} subject={subject} />
            ))}
          </div>
        </div>
      )}

      {/* ── KUCHLI / ZAIF ─────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopicColumn
          title="Kuchli tomonlar"
          subtitle="Eng yaxshi natijali mavzular"
          topics={strongTopics}
          color="#10B981"
          emptyText="Hali kuchli mavzu aniqlanmadi"
        />
        <TopicColumn
          title="Zaif tomonlar"
          subtitle="Yaxshilash kerak bo'lgan mavzular"
          topics={weakTopics}
          color="#EF4444"
          emptyText="Zaif mavzu topilmadi — barakalla! 🎉"
        />
      </div>
    </div>
  );
};

const SubjectCard = ({ subject }) => {
  const color =
    subject.averageScore != null ? scoreColor(subject.averageScore) : "#94A3B8";
  const growth = subject.growth;
  const GrowthIcon =
    growth == null
      ? null
      : growth > 0
        ? ArrowUpRight
        : growth < 0
          ? ArrowDownRight
          : Minus;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{subject.subject}</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {subject.tests} test · {subject.questions} savol
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold tabular-nums" style={{ color }}>
            {subject.averageScore != null
              ? `${Math.round(subject.averageScore)}%`
              : "—"}
          </p>
          {GrowthIcon && (
            <p
              className={cn(
                "flex items-center justify-end gap-0.5 text-xs font-medium",
                growth > 0 && "text-emerald-600",
                growth < 0 && "text-rose-600",
                growth === 0 && "text-gray-400",
              )}
            >
              <GrowthIcon className="size-3.5" strokeWidth={2} />
              {growth > 0 ? "+" : ""}
              {growth} punkt
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
          style={{
            width: `${Math.min(100, Math.max(0, subject.averageScore ?? 0))}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {(subject.strongTopics.length > 0 || subject.weakTopics.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {subject.strongTopics.slice(0, 2).map((t) => (
            <span
              key={t.topicId || t.topic}
              className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
            >
              {t.topic} {Math.round(t.score)}%
            </span>
          ))}
          {subject.weakTopics.slice(0, 2).map((t) => (
            <span
              key={t.topicId || t.topic}
              className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
            >
              {t.topic} {Math.round(t.score)}%
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};

const TopicColumn = ({ title, subtitle, topics, color, emptyText }) => (
  <Card>
    <h2 className="font-semibold text-gray-900">{title}</h2>
    <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>

    {topics.length === 0 ? (
      <p className="py-6 text-center text-sm text-gray-500">{emptyText}</p>
    ) : (
      <div className="mt-3 space-y-2.5">
        {topics.map((topic) => (
          <div
            key={`${topic.subject}-${topic.topicId || topic.topic}`}
            className="flex items-center gap-2.5"
          >
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {topic.topic}
              </p>
              <p className="truncate text-[11px] text-gray-400">{topic.subject}</p>
            </div>
            <span
              className="shrink-0 text-sm font-bold tabular-nums"
              style={{ color }}
            >
              {Math.round(topic.score)}%
            </span>
          </div>
        ))}
      </div>
    )}
  </Card>
);

export default StudentDashboardView;
