// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useParams } from "react-router-dom";

// Icons
import { ArrowLeft, Check, X, Clock } from "lucide-react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Data
import {
  RESULT_STATUS_LABELS,
  RESULT_STATUS_COLORS,
} from "../data/resultStatuses.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { formatScore } from "@/shared/utils/formatScore";

/**
 * Admin: bitta natija - savollar, o'quvchi javoblari va to'g'ri javoblar.
 */
const ResultAnswersPage = () => {
  const { resultId } = useParams();

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-result-detail", resultId],
    queryFn: () =>
      testSeasonsAPI.getResultDetail(resultId).then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Yuklanmoqda...</p>
      </Card>
    );
  }
  if (!result) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-10">Natija topilmadi</p>
      </Card>
    );
  }

  const session = result.session || {};
  const test = result.test || {};
  const student = result.student || {};
  const questions = session.questions || [];
  const answers = session.answers || [];
  const perQuestionMap = new Map(
    (result.perQuestion || []).map((pq) => [pq.question.toString(), pq]),
  );
  const answerMap = new Map(answers.map((a) => [a.question.toString(), a]));
  const extraSum =
    result.extraPoints?.reduce((s, e) => s + (e.amount || 0), 0) || 0;

  const backHref = `/test-seasons/${result.season?._id || ""}/students/${
    student._id || ""
  }/results`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Link to={backHref}>
          <Button variant="outline" size="sm" className="size-9 p-0">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            {test.title || "Test natijasi"}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {student.firstName} {student.lastName}
            {result.class?.name ? ` · ${result.class.name}` : ""}
            {session.submittedAt
              ? ` · ${formatDateUZ(session.submittedAt)}`
              : ""}
          </p>
        </div>
      </div>

      {/* Ball xulosa */}
      <Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatBox
            label="Yakuniy ball"
            value={`${formatScore(result.finalScore)} / ${
              result.maxScore != null ? formatScore(result.maxScore) : "-"
            }`}
            highlight
          />
          <StatBox
            label="Avtomatik"
            value={formatScore(result.autoGradedScore)}
          />
          <StatBox label="Qo'lda" value={formatScore(result.manualGradedScore)} />
          <StatBox label="Qo'shimcha" value={formatScore(extraSum)} />
        </div>
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-xs font-medium",
              RESULT_STATUS_COLORS[result.status] || "bg-gray-100",
            )}
          >
            {RESULT_STATUS_LABELS[result.status] || result.status}
          </span>
          {result.status !== "pending" && result.gradingMin != null && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-md text-xs font-medium",
                result.passed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700",
              )}
            >
              {result.passed ? "O'tdi" : "O'tmadi"} (o'tish bali:{" "}
              {formatScore(result.gradingMin)})
            </span>
          )}
        </div>
        {result.status === "pending" && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700">
            <Clock size={16} />
            Ochiq savollar hali baholanmagan.
          </div>
        )}
      </Card>

      {/* Savollar va javoblar */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Savollar va javoblar
        </h2>
        {questions.map((q, idx) => (
          <QAReviewCard
            key={idx}
            index={idx + 1}
            question={q}
            answer={answerMap.get(q.question.toString())}
            perQuestion={perQuestionMap.get(q.question.toString())}
          />
        ))}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight = false }) => (
  <div
    className={cn(
      "p-3 rounded-xl text-center",
      highlight ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-900",
    )}
  >
    <p className="text-xs text-gray-600">{label}</p>
    <p className="font-bold mt-1">{value}</p>
  </div>
);

/**
 * Bitta savol + o'quvchi javobi + to'g'ri javob (admin uchun).
 */
const QAReviewCard = ({ index, question, answer, perQuestion }) => {
  const isStandard = question.type === "standard";
  const awarded = perQuestion?.awardedPoints ?? 0;
  const maxPoints = perQuestion?.maxPoints ?? question.points;
  const isPending = perQuestion?.status === "pending";
  const correctId = question.correctOptionId?.toString();

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-gray-500">{index}.</span>
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {isStandard ? "Variantli" : "Ochiq"}
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium",
            isPending ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700",
          )}
        >
          {isPending
            ? "Baholanmoqda"
            : `${formatScore(awarded)} / ${formatScore(maxPoints)} ball`}
        </span>
      </div>

      <div className="flex items-start gap-3">
        {question.image?.url && (
          <img
            src={question.image.url}
            alt="Savol rasmi"
            className="size-24 rounded-lg object-cover border shrink-0"
          />
        )}
        <p className="text-gray-900 break-words">
          {question.text || <span className="text-gray-400">(rasmli savol)</span>}
        </p>
      </div>

      {/* Variantli - tanlangan va to'g'ri variant ko'rsatiladi */}
      {isStandard && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const optId = opt.optionId?.toString();
            const isSelected = answer?.selectedOptionId?.toString() === optId;
            const isCorrect = correctId && optId === correctId;
            return (
              <div
                key={opt.optionId}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg border",
                  isCorrect
                    ? "border-green-400 bg-green-50"
                    : isSelected
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 bg-white",
                )}
              >
                <div
                  className={cn(
                    "size-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                    isCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : isSelected
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-300 text-gray-500",
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </div>
                <div className="flex-1 flex items-start gap-2">
                  {opt.image?.url && (
                    <img
                      src={opt.image.url}
                      alt="Variant rasmi"
                      className="size-16 rounded object-cover border shrink-0"
                    />
                  )}
                  {opt.text && (
                    <p className="text-sm text-gray-900 break-words">
                      {opt.text}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  {isSelected && (
                    <span className="text-xs text-gray-500">tanladi</span>
                  )}
                  {isCorrect ? (
                    <Check size={18} className="text-green-600" />
                  ) : isSelected ? (
                    <X size={18} className="text-red-600" />
                  ) : null}
                </div>
              </div>
            );
          })}
          {!answer?.selectedOptionId && (
            <p className="text-xs text-gray-500">Variant tanlanmagan</p>
          )}
        </div>
      )}

      {/* Ochiq - javob matni va o'qituvchi izohi */}
      {!isStandard && (
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">O'quvchi javobi:</p>
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {answer?.textAnswer || (
                <span className="text-gray-400">(javob yo'q)</span>
              )}
            </p>
          </div>
          {perQuestion?.feedback && (
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-xs text-blue-700 mb-1">O'qituvchi izohi:</p>
              <p className="text-gray-900 whitespace-pre-wrap break-words">
                {perQuestion.feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ResultAnswersPage;
