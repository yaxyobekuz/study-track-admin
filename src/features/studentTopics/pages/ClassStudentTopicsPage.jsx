// Toast
import { toast } from "sonner";

// React
import { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LanguageBadge from "@/shared/components/ui/LanguageBadge";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import { useClassStudentTopics } from "@/features/studentTopics/queries/studentTopics.queries";
import { useRevokeStudentTopicPlan } from "@/features/studentTopics/queries/studentTopics.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { ArrowLeft, Pencil, RotateCcw, Users } from "lucide-react";

/**
 * GURUH ICHIDA — HAR O'QUVCHINING MAVZU O'RNI.
 *
 * "Dars mavzulari → Fan → Sinf" kartasiga bosilganda ochiladi.
 *
 * ⚠️ REJA YO'Q O'QUVCHI "SINFDAN" DEB BELGILANADI, bo'sh qoldirilmaydi:
 * u haqiqatan guruh bilan birga ketayotgan bola va uning raqami jadvaldagi
 * raqam bilan AYNI (`education.md` §13 — yagona hisob). Bo'sh joy
 * "ma'lumot yo'q" deb o'qilardi.
 *
 * ⚠️ TANLAB BELGILASH: bir nechta o'quvchini belgilab, bitta oynada
 * hammasiga bir xil o'rin va qadam beriladi (`PayrollDeduction` naqshi —
 * har o'quvchiga ALOHIDA qator, bitta `batchId`).
 */
const ClassStudentTopicsPage = () => {
  const { subjectId, classId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useModal();
  const { can } = usePermissions();

  const canAssign = can("topics.assign");
  /**
   * ⚠️ RUXSAT SAHIFA ICHIDA TEKSHIRILADI, `ROUTE_PERMISSIONS` DA EMAS.
   * Yo'lda dinamik bo'g'inlar bor (`/subjects/:subjectId/topics/:classId`)
   * va prefiks moslovchi uni faqat `/subjects` → `subjects.view` deb
   * ko'radi. Server esa `topics.view` talab qiladi: tekshiruv bo'lmasa
   * ekran ochilib, har so'rov 403 bo'lib turardi va foydalanuvchi buni
   * nosozlik deb o'qirdi.
   */
  const canView = can("topics.view");

  const { data, isLoading } = useClassStudentTopics(
    canView ? classId : null,
    canView ? subjectId : null,
  );
  const { mutate: revokePlan } = useRevokeStudentTopicPlan();

  const [selected, setSelected] = useState([]);

  // ⚠️ `useMemo` ichida — `?? []` har renderda yangi massiv yasaydi va
  // `selectedRows` memosi hech qachon ishlamasdi.
  const students = useMemo(() => data?.students ?? [], [data]);
  const totalTopics = data?.totalTopics ?? 0;

  const selectedRows = useMemo(
    () => students.filter((row) => selected.includes(row.student.id)),
    [students, selected],
  );

  const toggle = (studentId) =>
    setSelected((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );

  const toggleAll = () =>
    setSelected((prev) =>
      prev.length === students.length ? [] : students.map((row) => row.student.id),
    );

  const openPlanModal = (rows) => {
    if (rows.length === 0) return;
    openModal("studentTopicPlan", {
      classId,
      subjectId,
      language: data?.language,
      totalTopics,
      nextLesson: data?.nextLesson ?? null,
      students: rows.map((row) => ({
        id: row.student.id,
        fullName: `${row.student.lastName ?? ""} ${row.student.firstName ?? ""}`.trim(),
        currentTopicNumber: row.currentTopicNumber,
        step: row.step,
        startOrder: row.startOrder,
      })),
    });
  };

  const handleRevoke = (row) => {
    if (!row.plan?.id) return;
    const name = `${row.student.lastName ?? ""} ${row.student.firstName ?? ""}`.trim();
    const confirmed = window.confirm(
      `${name} uchun shaxsiy reja bekor qilinadi — u guruhning umumiy mavzu ` +
        `o'rniga qaytadi. Davom etasizmi?`,
    );
    if (!confirmed) return;

    revokePlan(row.plan.id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (error) =>
        toast.error(error.response?.data?.message || "Bekor qilib bo'lmadi"),
    });
  };

  if (!canView) {
    return (
      <EmptyState
        title="Ruxsat yo'q"
        description="O'quvchilarning mavzu o'rnini ko'rish uchun «Dars mavzulari» bo'limida ko'rish huquqi kerak"
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500">Yuklanmoqda...</p>
      </Card>
    );
  }

  return (
    <div>
      {/* Sarlavha */}
      <div className="mb-6 flex items-start gap-4">
        <button
          onClick={() =>
            navigate(
              searchParams.get("from") || `/subjects/${subjectId}/topics`,
            )
          }
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-gray-900">
            {data?.class?.name || "Guruh"}
            <LanguageBadge language={data?.language} asClass />
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            {data?.subject?.name} · guruh{" "}
            {data?.classCurrentTopic != null ? (
              <b>{data.classCurrentTopic}-mavzuda</b>
            ) : (
              <span className="text-amber-700">{data?.classReason || "—"}</span>
            )}
            {totalTopics > 0 && ` · rejada ${totalTopics} ta mavzu`}
          </p>
        </div>
      </div>

      {/* Jamlanma + amallar */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            {data?.totals?.students ?? 0} o'quvchi —{" "}
            <span className="font-medium text-blue-700">
              {data?.totals?.withPlan ?? 0} tasida shaxsiy reja
            </span>
            ,{" "}
            <span className="font-medium text-gray-700">
              {data?.totals?.inherited ?? 0} tasi guruh bilan
            </span>
          </p>

          {canAssign && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="px-4" onClick={toggleAll}>
                {selected.length === students.length && students.length > 0
                  ? "Belgini olish"
                  : "Hammasini belgilash"}
              </Button>
              <Button
                variant="default"
                className="px-4"
                disabled={selected.length === 0}
                onClick={() => openPlanModal(selectedRows)}
              >
                <Users className="mr-2 size-4" strokeWidth={1.5} />
                Belgilanganlarga ({selected.length})
              </Button>
            </div>
          )}
        </div>

        {data?.nextLesson && (
          <p className="mt-3 text-xs text-gray-500">
            Keyingi dars: {data.nextLesson.dateLabel},{" "}
            {data.nextLesson.lessonOrder}-dars — mavzu o'rni aynan shu darsga
            biriktiriladi
          </p>
        )}
      </Card>

      {/* O'quvchilar */}
      {students.length === 0 ? (
        <EmptyState
          title="Guruhda o'quvchi yo'q"
          description="Bu guruhga hali o'quvchi biriktirilmagan"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {students.map((row) => (
            <StudentRow
              key={row.student.id}
              row={row}
              totalTopics={totalTopics}
              canAssign={canAssign}
              isSelected={selected.includes(row.student.id)}
              onToggle={() => toggle(row.student.id)}
              onEdit={() => openPlanModal([row])}
              onRevoke={() => handleRevoke(row)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StudentRow = ({
  row,
  totalTopics,
  canAssign,
  isSelected,
  onToggle,
  onEdit,
  onRevoke,
}) => {
  const name = `${row.student.lastName ?? ""} ${row.student.firstName ?? ""}`.trim();

  // Blok: qadam 1 da bitta mavzu, aks holda oraliq ("61–63")
  const block =
    row.currentTopicNumber == null
      ? null
      : row.coveredThrough && row.coveredThrough !== row.currentTopicNumber
        ? `${row.currentTopicNumber}–${row.coveredThrough}`
        : String(row.currentTopicNumber);

  const percent =
    totalTopics > 0 && row.coveredThrough != null
      ? Math.min(100, Math.round((row.coveredThrough / totalTopics) * 100))
      : 0;

  return (
    <Card
      className={cn(
        "transition-colors",
        isSelected ? "border-blue-500 bg-blue-50/40" : "",
      )}
    >
      <div className="flex items-start gap-2">
        {canAssign && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="mt-1 size-4 shrink-0 rounded border-gray-300"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
            {row.inherited ? (
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                Guruh bilan
              </span>
            ) : (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
                Shaxsiy reja
              </span>
            )}
            {row.step > 1 && (
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
                1 dars = {row.step} mavzu
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-blue-600">
              {block ?? "—"}
            </span>
            {totalTopics > 0 && (
              <span className="text-xs text-gray-400">/ {totalTopics}</span>
            )}
          </div>

          <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
            {row.currentTopicName || row.reason || "Mavzu aniqlanmadi"}
          </p>

          {/* Test qamrovi — modulning asosiy savoli */}
          {row.coveredThrough != null && (
            <p className="mt-1 text-[11px] text-gray-500">
              Testga {row.startOrder}–{row.coveredThrough} oralig'idan savol
              tushadi
            </p>
          )}
        </div>

        {canAssign && (
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={onEdit}
              title="Mavzu o'rnini belgilash"
              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <Pencil className="size-4" strokeWidth={1.5} />
            </button>
            {!row.inherited && row.plan?.id && (
              <button
                type="button"
                onClick={onRevoke}
                title="Shaxsiy rejani bekor qilish (guruhga qaytarish)"
                className="rounded p-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-700"
              >
                <RotateCcw className="size-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      {totalTopics > 0 && (
        <div className="mt-3">
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                row.inherited ? "bg-gray-400" : "bg-blue-600",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default ClassStudentTopicsPage;
