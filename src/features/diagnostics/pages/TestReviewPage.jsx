// Toast
import { toast } from "sonner";

// React
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LanguageBadge from "@/shared/components/ui/LanguageBadge";
import ReviewQuestionCard from "../components/ReviewQuestionCard";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import { testQueries } from "../queries/diagnostics.queries";
import {
  useRegenerateTestQuestions,
  useApproveTest,
  useRejectTest,
} from "../queries/diagnostics.mutations";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Icons
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  CircleX,
  Loader2,
  RefreshCw,
  TriangleAlert,
  Undo2,
  Users,
} from "lucide-react";

/**
 * TESTNI KO'RIB CHIQISH VA TASDIQLASH.
 *
 * ⚠️ TASDIQSIZ TEST CHIQMAYDI (biznes qarori, 2026-11-12): "filial egasi
 * ko'rib chiqadi, tasdiqlasa keyin chiqariladi". Darvoza serverda
 * (`updateTestStatus` → `approvedAt`), tasdiqlash tugmasi esa ALOHIDA
 * ruxsat ortida (`diagnostics.publish`): test TUZISH huquqi uni
 * CHIQARISH huquqiga aylanmasligi kerak.
 *
 * ⚠️ SAVOLNI ALMASHTIRISH UCH REJIMDA, LEKIN BITTA YO'LDAN: bitta
 * (qatordagi tugma), bir nechta (belgilangani) yoki hammasi. Server
 * o'rinbosarni AYNI qiyinlik va AYNI mavzu oralig'idan oladi — taqsimot
 * buzilmaydi.
 *
 * ⚠️ TASDIQDAN KEYIN ALMASHTIRISH YOPILADI: "tasdiqlangan narsa" bilan
 * "chiqadigan narsa" bir xil bo'lishi kerak. Qayta ko'rish uchun avval
 * tasdiq bekor qilinadi.
 */
const TestReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermissions();

  const canPublish = can("diagnostics.publish");
  const canEdit = can("diagnostics.create");

  const { data, isLoading, isFetching } = useQuery(testQueries.review(id));

  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateTestQuestions();
  const { mutate: approve, isPending: isApproving } = useApproveTest();
  const { mutate: reject, isPending: isRejecting } = useRejectTest();

  /** Tanlangan savollar: `"<studentId>|<questionId>"` kalitlari. */
  const [selected, setSelected] = useState([]);
  /** Yopilgan/ochilgan o'quvchilar. */
  const [openStudents, setOpenStudents] = useState([]);

  const test = data?.test;
  const approval = data?.approval;
  const editable = canEdit && approval?.editable && (test?.attemptCount ?? 0) === 0;

  const students = useMemo(() => data?.students ?? [], [data]);
  const shared = useMemo(() => data?.shared ?? [], [data]);

  const keyOf = (studentId, questionId) => `${studentId ?? ""}|${questionId}`;

  const toggle = (studentId, questionId) => {
    const key = keyOf(studentId, questionId);
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const runRegenerate = (items, { all = false } = {}) => {
    if (!all && items.length === 0) {
      toast.error("Almashtiriladigan savol belgilanmagan");
      return;
    }

    regenerate(
      { id, items, all },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Savollar almashtirildi");
          // ⚠️ Belgilar TOZALANADI: almashtirilgan savol endi ro'yxatda
          // yo'q va eski belgi "topilmadi" xatosini keltirardi.
          setSelected([]);
          (res?.data?.skipped ?? []).slice(0, 5).forEach((item) =>
            toast.warning(item.reason, { duration: 8000 }),
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Almashtirib bo'lmadi", {
            duration: 10000,
          }),
      },
    );
  };

  const handleApprove = () => {
    const note = window.prompt(
      "Tasdiqlash izohi (ixtiyoriy) — nega tasdiqlangani registrda qoladi:",
      "",
    );
    // `null` — bekor qilindi; bo'sh satr — izohsiz tasdiq
    if (note === null) return;

    approve(
      { id, note: note.trim() || undefined },
      {
        onSuccess: (res) => toast.success(res?.message || "Test tasdiqlandi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Tasdiqlab bo'lmadi", {
            duration: 10000,
          }),
      },
    );
  };

  const handleReject = () => {
    const note = window.prompt(
      "Nega rad etilayotganini yozing (majburiy) — test tuzgan odam shuni ko'radi:",
      "",
    );
    if (note === null) return;
    if (note.trim().length < 3) {
      toast.error("Rad etish sababi yozilishi shart");
      return;
    }

    reject(
      { id, note: note.trim() },
      {
        onSuccess: (res) => toast.success(res?.message || "Tasdiq bekor qilindi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Bekor qilib bo'lmadi"),
      },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500">Yuklanmoqda...</p>
      </Card>
    );
  }

  if (!test) {
    return <EmptyState title="Test topilmadi" />;
  }

  const totals = data.totals ?? {};
  const busy = isRegenerating || isApproving || isRejecting || isFetching;

  return (
    <div className="space-y-4">
      {/* ── SARLAVHA ── */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate("/diagnostics/tests")}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-gray-900">
            {test.title}
            <LanguageBadge language={data.language} asClass />
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            {data.perStudent ? (
              <>
                Har o'quvchiga o'z savollari · {totals.ready} o'quvchiga tushdi
                {totals.failed > 0 && (
                  <span className="text-red-700"> · {totals.failed} tasiga yo'q</span>
                )}
                {" · "}
                {totals.uniqueQuestions} noyob savol
              </>
            ) : (
              <>Butun guruhga bitta to'plam · {totals.uniqueQuestions} savol</>
            )}
          </p>
        </div>
      </div>

      {/* ── TASDIQLASH HOLATI ── */}
      <Card
        className={cn(
          "border-2",
          approval?.approved ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              {approval?.approved ? (
                <>
                  <BadgeCheck className="size-5 text-emerald-600" strokeWidth={1.5} />
                  Tasdiqlangan
                </>
              ) : (
                <>
                  <TriangleAlert className="size-5 text-amber-600" strokeWidth={1.5} />
                  Tasdiq kutilmoqda
                </>
              )}
            </p>

            <p className="mt-1 max-w-2xl text-sm text-gray-600">
              {approval?.approved ? (
                <>
                  Test chiqarishga tayyor
                  {approval.approvedAt &&
                    ` · ${formatDateTimeUz(approval.approvedAt)}`}
                  . Savollarni o'zgartirish uchun avval tasdiqni bekor qiling.
                </>
              ) : (
                <>
                  Savollarni ko'rib chiqing: xato yozilganini almashtirib,
                  keyin tasdiqlang. Tasdiqlanmagan test <b>chiqarilmaydi</b>.
                </>
              )}
            </p>

            {approval?.reviewNote && (
              <p className="mt-2 rounded-lg bg-white/70 p-2 text-xs text-gray-700">
                Izoh: {approval.reviewNote}
              </p>
            )}

            {totals.pendingApproval > 0 && !approval?.approved && (
              <p className="mt-2 text-xs text-amber-800">
                {totals.pendingApproval} ta savol hali tasdiqlanmagan — tasdiqlash
                ularni ham tasdiqlaydi.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canPublish &&
              (approval?.approved ? (
                <Button
                  variant="secondary"
                  className="px-4"
                  disabled={busy || (test.attemptCount ?? 0) > 0}
                  onClick={handleReject}
                >
                  <Undo2 className="mr-2 size-4" strokeWidth={1.5} />
                  Tasdiqni bekor qilish
                </Button>
              ) : (
                <Button className="px-5" disabled={busy} onClick={handleApprove}>
                  {isApproving ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <BadgeCheck className="mr-2 size-4" strokeWidth={1.5} />
                  )}
                  Tasdiqlash
                </Button>
              ))}

            {!canPublish && (
              <p className="max-w-xs text-xs text-gray-500">
                Tasdiqlash huquqi yo'q — testni filial egasi ko'rib chiqadi
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── OMMAVIY ALMASHTIRISH ── */}
      {editable && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-xs text-gray-500">
              Savolni almashtirish: o'rniga <b>ayni qiyinlik</b> va{" "}
              <b>ayni mavzu oralig'idan</b> boshqa savol keladi. AI qatorlarida
              model yangi savol yozadi va u bankka tushadi.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="px-4"
                disabled={busy || selected.length === 0}
                onClick={() =>
                  runRegenerate(
                    selected.map((key) => {
                      const [studentId, questionId] = key.split("|");
                      return { studentId: studentId || undefined, questionId };
                    }),
                  )
                }
              >
                {isRegenerating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" strokeWidth={1.5} />
                )}
                Belgilanganlarni ({selected.length})
              </Button>

              <Button
                variant="outline"
                className="px-4"
                disabled={busy}
                onClick={() => {
                  const confirmed = window.confirm(
                    "Testdagi HAMMA savol almashtiriladi. Davom etasizmi?",
                  );
                  if (confirmed) runRegenerate([], { all: true });
                }}
              >
                <RefreshCw className="mr-2 size-4" strokeWidth={1.5} />
                Hammasini almashtirish
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!editable && canEdit && (
        <Card>
          <p className="text-xs text-gray-500">
            {(test.attemptCount ?? 0) > 0
              ? `Testda ${test.attemptCount} ta urinish bor — savollar o'zgartirilmaydi.`
              : "Test tasdiqlangan — savolni almashtirish uchun avval tasdiqni bekor qiling."}
          </p>
        </Card>
      )}

      {/* ── SAVOLLAR ── */}
      {data.perStudent ? (
        <div className="space-y-3">
          {students.map((row) => (
            <StudentBlock
              key={row.studentId}
              row={row}
              isOpen={openStudents.includes(row.studentId)}
              onToggleOpen={() =>
                setOpenStudents((prev) =>
                  prev.includes(row.studentId)
                    ? prev.filter((item) => item !== row.studentId)
                    : [...prev, row.studentId],
                )
              }
              selected={selected}
              keyOf={keyOf}
              onToggleQuestion={toggle}
              onRegenerateOne={(questionId) =>
                runRegenerate([{ studentId: row.studentId, questionId }])
              }
              editable={editable}
              busy={busy}
            />
          ))}
        </div>
      ) : (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
            <Users className="size-4 text-gray-500" strokeWidth={1.5} />
            Butun guruhga bitta to'plam ({shared.length})
          </h3>

          <div className="space-y-2">
            {shared.map((question, index) => (
              <ReviewQuestionCard
                key={question.id}
                question={question}
                index={index}
                isSelected={selected.includes(keyOf(null, question.id))}
                onToggle={() => toggle(null, question.id)}
                onRegenerate={() => runRegenerate([{ questionId: question.id }])}
                editable={editable}
                disabled={busy}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * BITTA O'QUVCHINING BLOKI.
 *
 * ⚠️ SUKUT BO'YICHA YOPIQ: 25 bolaning har biriga 20 savol — 500 qator
 * bir ekranda chizilsa, sahifa ham sekinlashardi, ham o'qilmas bo'lardi.
 *
 * ⚠️ TEST TUSHMAGAN O'QUVCHI HAM RO'YXATDA, sababi bilan: "25 tadan 24
 * tasiga tushdi" degan holat jim qolmasligi kerak.
 */
const StudentBlock = ({
  row,
  isOpen,
  onToggleOpen,
  selected,
  keyOf,
  onToggleQuestion,
  onRegenerateOne,
  editable,
  busy,
}) => {
  const failed = row.status !== "ready";

  return (
    <Card className={cn("!p-0", failed ? "border-red-200 bg-red-50/40" : "")}>
      <button
        type="button"
        onClick={failed ? undefined : onToggleOpen}
        className={cn(
          "flex w-full items-start gap-3 p-4 text-left",
          failed ? "cursor-default" : "hover:bg-gray-50",
        )}
      >
        {failed ? (
          <CircleX className="mt-0.5 size-5 shrink-0 text-red-600" strokeWidth={1.5} />
        ) : (
          <ChevronDown
            className={cn(
              "mt-0.5 size-5 shrink-0 text-gray-400 transition-transform",
              isOpen ? "" : "-rotate-90",
            )}
            strokeWidth={1.5}
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">{row.fullName}</p>

          {failed ? (
            <p className="mt-0.5 text-xs text-red-800">{row.reason}</p>
          ) : (
            <p className="mt-0.5 text-xs text-gray-600">
              {row.questionCount} savol
              {row.scopeLabel && ` · ${row.scopeLabel}`}
            </p>
          )}
        </div>
      </button>

      {isOpen && !failed && (
        <div className="space-y-2 border-t border-gray-100 p-4">
          {row.questions.map((question, index) => (
            <ReviewQuestionCard
              key={question.id}
              question={question}
              index={index}
              isSelected={selected.includes(keyOf(row.studentId, question.id))}
              onToggle={() => onToggleQuestion(row.studentId, question.id)}
              onRegenerate={() => onRegenerateOne(question.id)}
              editable={editable}
              disabled={busy}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default TestReviewPage;
