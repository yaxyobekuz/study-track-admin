// React
import { useMemo, useState } from "react";

// Router
import { useParams, Link } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import {
  ArrowLeft,
  Check,
  X,
  MinusCircle,
  Circle,
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronDown,
  Target,
  Timer,
  ListChecks,
  Lightbulb,
  Download,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import Can from "@/shared/components/guards/Can";
import CircularScore from "../components/charts/CircularScore";
import FindingCards from "../components/FindingCards";
import GapCards from "../components/GapCards";
import RoadmapTimeline from "../components/RoadmapTimeline";
import RadarChart from "../components/charts/RadarChart";
import BarChart from "../components/charts/BarChart";
import { Badge, ToneBadge, GradeBadge } from "../components/ToneBadge";

// Queries
import { attemptQueries } from "../queries/diagnostics.queries";

// API
import { diagnosticAttemptsAPI } from "../api/diagnostics.api";
import {
  useAnalyzeAttempt,
  useExplainAnswer,
} from "../queries/diagnostics.mutations";

// Data
import {
  scoreColor,
  TONES,
  toneOf,
  ERROR_REASONS,
  MODE_LABELS,
  LEVEL_LABELS,
  LEVEL_BADGE,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";
import { downloadBlob } from "@/shared/utils/download.utils";
import { formatDateTimeUz, formatDurationShortUz } from "@/shared/utils/date.utils";

/**
 * NATIJA TAFSILOTI.
 *
 * ⚠️ SAHIFA AI'NI KUTMAYDI. Ball, mavzular kesimi, xato sabablari va
 * yo'l xaritasi darhol chiziladi — ular QOIDALAR bilan hisoblangan.
 * AI matni tayyor bo'lgach qo'shiladi (`insights` polling bilan keladi va
 * tayyor bo'lgach to'xtaydi).
 */
const AttemptDetailPage = () => {
  const { attemptId } = useParams();

  const { data, isLoading } = useQuery(attemptQueries.result(attemptId));
  const { data: insights = [] } = useQuery(attemptQueries.insights(attemptId));
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeAttempt();
  const [exporting, setExporting] = useState(false);

  const attempt = data?.attempt;
  const breakdown = data?.breakdown ?? [];
  const subjects = data?.subjects ?? [];
  const errors = data?.errorPatterns;
  const questions = data?.questions ?? [];
  const findings = data?.findings ?? [];
  const gaps = data?.gaps ?? [];
  const curve = data?.predictionCurve ?? [];
  const showAnswers = data?.showAnswers;

  const feedback = insights.find((i) => i.kind === "feedback");
  const roadmapInsight = insights.find((i) => i.kind === "roadmap");
  const planInsight = insights.find((i) => i.kind === "plan");

  const roadmap = roadmapInsight?.output ?? data?.roadmap;
  const aiPending = insights.some((i) =>
    ["queued", "processing"].includes(i.status),
  );

  const errorRows = useMemo(() => {
    if (!errors?.wrongCount) return [];
    return ["knowledge", "rushing", "misread"]
      .map((key) => ({ key, value: errors[key] ?? 0 }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [errors]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await diagnosticAttemptsAPI.exportResult(attemptId);
      downloadBlob(response);
    } catch (error) {
      toast.error(error.response?.data?.message || "Hisobotni yuklab bo'lmadi");
    } finally {
      setExporting(false);
    }
  };

  const handleAnalyze = () => {
    analyze(
      { id: attemptId, kinds: ["feedback", "roadmap", "plan"] },
      {
        onSuccess: () => toast.success("Tahlil so'raldi — bir necha soniya kuting"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  if (isLoading) {
    return <Card className="py-16 text-center text-gray-400">Yuklanmoqda…</Card>;
  }

  if (!attempt) {
    return (
      <Card>
        <EmptyState title="Natija topilmadi" description="Urinish o'chirilgan bo'lishi mumkin." />
      </Card>
    );
  }

  const studentName =
    [attempt.studentSnapshot?.lastName, attempt.studentSnapshot?.firstName]
      .filter(Boolean)
      .join(" ") || "O'quvchi";

  return (
    <div className="space-y-4">
      {/* ── SARLAVHA ───────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/diagnostics/attempts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          Natijalarga qaytish
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* ⚠️ EKSPORT ALOHIDA RUXSAT ORTIDA EMAS: fayl shu sahifadagi
              AYNI ma'lumotdan yasaladi (server "javoblarni ko'rsatma"
              sozlamasini ham hurmat qiladi), ya'ni u hech qanday yangi
              ma'lumot ochmaydi. */}
          <Button variant="secondary" className="px-3.5" disabled={exporting} onClick={handleExport}>
            <Download
              className={cn("mr-2 size-4", exporting && "animate-pulse")}
              strokeWidth={1.5}
            />
            Hisobotni yuklab olish
          </Button>

          <Can do="diagnostics.ai">
          <Button
            variant="secondary"
            className="px-3.5"
            disabled={isAnalyzing || aiPending}
            onClick={handleAnalyze}
          >
            <RefreshCw
              className={cn("mr-2 size-4", (isAnalyzing || aiPending) && "animate-spin")}
              strokeWidth={1.5}
            />
            AI tahlilini yangilash
          </Button>
          </Can>
        </div>
      </div>

      {/* ── HERO ───────────────────────────── */}
      <Card>
        <div className="grid items-center gap-6 lg:grid-cols-[200px_1fr]">
          <div className="flex justify-center">
            <CircularScore
              value={attempt.score ?? 0}
              size={180}
              color={scoreColor(attempt.score)}
            >
              <span className="text-4xl font-semibold tabular-nums text-gray-900">
                {attempt.score != null ? Math.round(attempt.score) : "—"}
              </span>
              <span className="text-sm text-gray-400">foiz</span>
            </CircularScore>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{studentName}</h2>
              {attempt.studentSnapshot?.className && (
                <Badge className="bg-gray-100 text-gray-600 ring-gray-200">
                  {attempt.studentSnapshot.className}
                </Badge>
              )}
              <GradeBadge grade={attempt.grade} />
            </div>

            <p className="mt-0.5 text-sm text-gray-500">
              {attempt.testTitle || MODE_LABELS[attempt.mode]}
              {attempt.submittedAt
                ? ` · ${formatDateTimeUz(attempt.submittedAt)}`
                : ""}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric
                icon={Check}
                label="To'g'ri"
                /* ⚠️ MAXRAJ — BAHOLANADIGAN savollar soni. Insho avtomat
                   baholanmaydi va ballga kirmaydi; uni maxrajga qo'shish
                   "9/11" degan hech qachon to'g'ri kelmaydigan nisbatni
                   chiqarardi. */
                value={`${attempt.correctCount ?? 0}/${
                  attempt.gradedQuestions ?? attempt.totalQuestions ?? 0
                }`}
              />
              <Metric
                icon={Target}
                label="Aniqlik"
                value={attempt.accuracy != null ? `${attempt.accuracy}%` : "—"}
              />
              <Metric
                icon={Timer}
                label="Sarflangan vaqt"
                value={formatDurationShortUz(
                  Math.round((attempt.timeSpentSec ?? 0) / 60),
                  "—",
                )}
              />
              <Metric
                icon={ListChecks}
                label="Tashlab ketilgan"
                value={attempt.skippedCount ?? 0}
              />
            </div>

            {/* ⚠️ ISHONCH OYNASI: kam savolli test ham "72%" deb
                ko'rsatadi, lekin uning xatosi katta. Buni yashirish
                o'quvchini chalg'itardi. */}
            {attempt.confidence && attempt.confidence.margin > 0 && (
              <p className="mt-3 text-xs text-gray-400">
                Ishonch oralig'i: {attempt.confidence.low}% —{" "}
                {attempt.confidence.high}% ({attempt.totalQuestions} savol
                asosida)
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── 3 TA ASOSIY TOPILMA ────────────── */}
      {/* ⚠️ O'QUVCHI KO'RADIGAN AYNI XULOSA. Xodim ota-onaga
          tushuntirganda o'quvchining ekranidagi so'zlarni takrorlashi
          kerak — bu yerda boshqa matn chiqsa, suhbat ziddiyatga
          aylanardi. */}
      <FindingCards findings={findings} />

      {/* ── AI TAHLILI ─────────────────────── */}
      <Card>
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" strokeWidth={1.5} />
          <h2 className="font-semibold text-gray-900">Tahlil va tavsiyalar</h2>
          {feedback?.source === "rules" && (
            <Badge className="bg-gray-100 text-gray-500 ring-gray-200">
              Qoidalar asosida
            </Badge>
          )}
        </div>

        {!feedback ? (
          /* ⚠️ "So'ralmagan" va "tayyorlanmoqda" — BOSHQA HOLATLAR.
             Ilgari ikkalasi bir xil aylanuvchi belgi bilan ko'rsatilardi
             va tahlil so'ralmagan natijada u abadiy aylanib turardi. */
          <EmptyState
            icon={Sparkles}
            title="Tahlil hali so'ralmagan"
            description="AI natijani izohlaydi, kamchiliklarni ko'rsatadi va o'quv rejasini yozadi."
            action={
              <Can do="diagnostics.ai">
                <Button disabled={isAnalyzing} onClick={handleAnalyze}>
                  <Sparkles className="mr-2 size-4" strokeWidth={1.5} />
                  Tahlilni so'rash
                </Button>
              </Can>
            }
          />
        ) : feedback.status !== "done" ? (
          <div className="flex items-center gap-3 py-8 text-gray-400">
            <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
            <span className="text-sm">
              {feedback.status === "failed"
                ? "Tahlil tayyorlanmadi — qaytadan urinib ko'ring"
                : "Tahlil tayyorlanmoqda…"}
            </span>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <p className="text-sm leading-relaxed text-gray-700">
              {feedback.output.summary}
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {feedback.output.strengths?.length > 0 && (
                <InsightList
                  title="Kuchli tomonlar"
                  tone="mastered"
                  items={feedback.output.strengths}
                />
              )}
              {feedback.output.weaknesses?.length > 0 && (
                <InsightList
                  title="Kamchiliklar"
                  tone="gap"
                  items={feedback.output.weaknesses}
                />
              )}
            </div>

            {feedback.output.recommendations?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Nima qilish kerak
                </p>
                <div className="space-y-2">
                  {feedback.output.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <Lightbulb
                        className="mt-0.5 size-4 shrink-0 text-amber-500"
                        strokeWidth={1.5}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {rec.topic}
                        </p>
                        <p className="text-sm text-gray-500">{rec.reason}</p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        ~{rec.estimatedMinutes} daq.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── MAVZULAR ─────────────────────── */}
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-gray-900">Mavzular kesimi</h2>

          {breakdown.length === 0 ? (
            <EmptyState title="Mavzu kesimi yo'q" description="Savollarga mavzu biriktirilmagan." />
          ) : breakdown.length >= 3 ? (
            <div className="mt-3 grid items-center gap-4 md:grid-cols-[280px_1fr]">
              <RadarChart
                data={breakdown.map((t) => ({ label: t.topic, value: t.score }))}
              />
              <div className="space-y-2">
                {breakdown.map((topic) => (
                  <TopicRow key={topic.topicId ?? topic.topic} topic={topic} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {breakdown.map((topic) => (
                <TopicRow key={topic.topicId ?? topic.topic} topic={topic} />
              ))}
            </div>
          )}
        </Card>

        {/* ── XATO SABABLARI ───────────────── */}
        <Card>
          <h2 className="font-semibold text-gray-900">Xatolar sababi</h2>

          {errorRows.length === 0 ? (
            <EmptyState
              icon={Check}
              title="Xato yo'q"
              description="Bu urinishda xato javob qayd etilmagan."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {errorRows.map((row) => {
                const meta = ERROR_REASONS[row.key];
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-700">{meta.label}</span>
                      <span className="font-medium tabular-nums text-gray-900">
                        {row.value}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                        style={{ width: `${row.value}%`, backgroundColor: meta.color }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{meta.hint}</p>
                  </div>
                );
              })}
              <p className="pt-1 text-xs text-gray-400">
                Jami {errors.wrongCount} ta xato javob
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── FANLAR (aralash test) ──────────── */}
      {subjects.length > 1 && (
        <Card>
          <h2 className="font-semibold text-gray-900">Fanlar bo'yicha natija</h2>
          <div className="mt-5">
            <BarChart
              data={subjects.map((s) => ({
                label: s.subject,
                value: s.score,
                color: scoreColor(s.score),
              }))}
              suffix="%"
              max={100}
              height={180}
            />
          </div>
        </Card>
      )}

      {/* ── YOPISH KERAK BO'LGAN MAVZULAR ──── */}
      <GapCards gaps={gaps} />

      {/* ── SHAXSIY O'QUV YO'LI ────────────── */}
      <RoadmapTimeline roadmap={roadmap} curve={curve} />

      {/* ── KUNLIK REJA ────────────────────── */}
      {planInsight?.status === "done" && planInsight.output?.items?.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900">
            {planInsight.output.title}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ~{planInsight.output.totalMinutes} daqiqa
            </span>
          </h2>

          <div className="mt-3 space-y-2">
            {planInsight.output.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  {item.detail && (
                    <p className="text-sm text-gray-500">{item.detail}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {item.minutes} daq.
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── SAVOLLAR TAHLILI ───────────────── */}
      <Card className="!p-0">
        <div className="p-4 xs:p-5">
          <h2 className="font-semibold text-gray-900">Savollar tahlili</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Savolni ochib, "nega xato" degan izohni AI'dan so'rash mumkin
          </p>
        </div>

        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {questions.map((question, index) => (
            <QuestionRow
              key={question.id}
              index={index}
              question={question}
              attemptId={attemptId}
              showAnswers={data.showAnswers}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── YORDAMCHI KOMPONENTLAR ───────────────────

const Metric = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <div className="flex items-center gap-1.5 text-gray-400">
      <Icon className="size-3.5" strokeWidth={1.5} />
      <span className="text-xs">{label}</span>
    </div>
    <p className="mt-1 font-semibold tabular-nums text-gray-900">{value}</p>
  </div>
);

const InsightList = ({ title, tone, items }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <p className="mb-2 text-sm font-medium text-gray-700">{title}</p>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i}>
          <p
            className="text-sm font-medium"
            style={{ color: TONES[tone].color }}
          >
            {item.title}
          </p>
          <p className="text-sm text-gray-500">{item.body}</p>
        </div>
      ))}
    </div>
  </div>
);

const TopicRow = ({ topic }) => (
  <div className="flex items-center gap-3">
    <span className="w-32 shrink-0 truncate text-sm text-gray-700" title={topic.topic}>
      {topic.topic}
    </span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
        style={{
          width: `${topic.score}%`,
          backgroundColor: TONES[toneOf(topic.score)].color,
        }}
      />
    </div>
    <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-gray-900">
      {topic.score}%
    </span>
    <span className="w-16 shrink-0 text-right text-xs text-gray-400">
      {topic.correct}/{topic.questions}
    </span>
  </div>
);

/**
 * BITTA SAVOL QATORI — ochilganda AI tushuntirishi so'raladi.
 *
 * ⚠️ TUSHUNTIRISH FAQAT OCHILGANDA SO'RALADI (bir marta). 40 savolli
 * natijada hammasini oldindan so'rash 40 ta model chaqiruvi bo'lardi;
 * server javobni keshlaydi, shuning uchun qayta ochishda so'rov ketmaydi.
 */
const QuestionRow = ({ question, index, attemptId, showAnswers }) => {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const { mutate: explain, isPending } = useExplainAnswer();

  const answer = question.answer;
  // ⚠️ `showAnswers: false` bo'lsa server `isCorrect` ni umuman
  // yubormaydi — belgi "javob berildi / berilmadi" darajasida qoladi.
  const status = !showAnswers
    ? answer?.isSkipped
      ? "skipped"
      : "answered"
    : answer?.isSkipped
      ? "skipped"
      : answer?.isCorrect === true
        ? "correct"
        : answer?.isCorrect === false
          ? "wrong"
          : "ungraded";

  const StatusIcon =
    status === "correct"
      ? Check
      : status === "skipped"
        ? MinusCircle
        : status === "answered" || status === "ungraded"
          ? Circle
          : X;
  const statusColor =
    status === "correct"
      ? "text-emerald-600 bg-emerald-50"
      : status === "skipped"
        ? "text-gray-400 bg-gray-100"
        : status === "ungraded" || status === "answered"
          ? "text-blue-600 bg-blue-50"
          : "text-rose-600 bg-rose-50";

  const handleToggle = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && !explanation && showAnswers) {
      explain(
        { attemptId, questionId: question.id },
        {
          onSuccess: (result) => setExplanation(result),
          onError: () => setExplanation({ explanation: null }),
        },
      );
    }
  };

  const selected = new Set(answer?.selectedOptionIds || []);

  /** ⚠️ VARIANT ID SI EMAS, MATNI — id foydalanuvchiga hech nima aytmaydi. */
  const optionText = (ids) =>
    (question.options || [])
      .filter((o) => (ids instanceof Set ? ids.has(o.id) : ids.includes(o.id)))
      .map((o) => o.text)
      .filter(Boolean)
      .join(", ");

  const givenAnswer = answer?.textAnswer || optionText(selected);
  const correctAnswer = showAnswers
    ? optionText((question.options || []).filter((o) => o.isCorrect).map((o) => o.id))
    : null;

  return (
    <div>
      <button
        onClick={handleToggle}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 xs:px-5"
      >
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
            statusColor,
          )}
        >
          <StatusIcon className="size-3.5" strokeWidth={2.5} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm text-gray-900">
            {index + 1}. {question.text}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {question.topicName && <span>{question.topicName}</span>}
            <Badge className={LEVEL_BADGE[question.difficulty]}>
              {LEVEL_LABELS[question.difficulty]}
            </Badge>
            {showAnswers && answer?.errorReason && (
              <span style={{ color: ERROR_REASONS[answer.errorReason]?.color }}>
                {ERROR_REASONS[answer.errorReason]?.label}
              </span>
            )}
            {answer?.timeSpentSec != null && <span>{answer.timeSpentSec} son.</span>}
          </span>
        </span>

        <ChevronDown
          className={cn(
            "mt-0.5 size-4 shrink-0 text-gray-300 transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div className="space-y-3 bg-gray-50 px-4 pb-4 xs:px-5">
          {/* Variantlar */}
          {question.options?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {question.options.map((option) => {
                const isSelected = selected.has(option.id);
                const isCorrect = option.isCorrect;

                return (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      isCorrect && showAnswers
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : isSelected
                          ? "border-rose-300 bg-rose-50 text-rose-900"
                          : "border-gray-200 bg-white text-gray-600",
                    )}
                  >
                    {isSelected && (
                      <Badge className="bg-white/70 text-current ring-current/20">
                        Sizning javobingiz
                      </Badge>
                    )}
                    <span className="min-w-0 flex-1">{option.text}</span>
                    {showAnswers && isCorrect && (
                      <Check className="size-4 shrink-0" strokeWidth={2} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ⚠️ JAVOB MATN BILAN HAM YOZILADI: variantlar ro'yxatidagi
              rang va ramka rang ko'rmaydigan foydalanuvchi uchun hech
              narsa anglatmaydi. */}
          <p className="text-sm text-gray-700">
            <span className="text-gray-400">O'quvchining javobi: </span>
            <span
              className={cn(
                "font-semibold",
                !showAnswers
                  ? "text-gray-900"
                  : status === "correct"
                    ? "text-emerald-600"
                    : "text-rose-600",
              )}
            >
              {givenAnswer || "(bo'sh)"}
            </span>
          </p>

          {showAnswers && status !== "correct" && correctAnswer && (
            <p className="text-sm text-gray-700">
              <span className="text-gray-400">To'g'ri javob: </span>
              <span className="font-semibold text-emerald-600">{correctAnswer}</span>
            </p>
          )}

          {/* AI tushuntirishi */}
          {showAnswers && (
            <div className="rounded-xl bg-white p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" strokeWidth={1.5} />
                {/* ⚠️ SARLAVHA HOLATGA QARAB: to'g'ri javobda "nega xato"
                    deb so'rash ma'nosiz. */}
                {status === "correct" ? "Nega to'g'ri" : "Yechilish uslubi"}
              </div>
              {isPending ? (
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={1.5} />
                  Tayyorlanmoqda…
                </p>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {explanation?.explanation ||
                    question.explanation ||
                    "Izoh mavjud emas."}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttemptDetailPage;
