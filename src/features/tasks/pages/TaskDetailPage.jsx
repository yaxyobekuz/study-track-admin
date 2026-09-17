// Toast
import { toast } from "sonner";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  Ban,
  Eye,
  Trash2,
  FileX2,
  ArrowLeft,
  RotateCcw,
  PencilLine,
  Paperclip,
  AlignLeft,
  FileCheck2,
  CalendarPlus,
  SearchX,
} from "lucide-react";

// Queries
import { tasksQueries } from "../queries/tasks.queries";
import { useDeleteTask } from "../queries/tasks.mutations";

// Data
import { ACTIVE_TASK_STATUSES } from "../data/tasks.data";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Hooks
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Components
import Button from "@/shared/components/ui/button/Button";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import TaskHero from "../components/detail/TaskHero";
import AttachmentGrid from "../components/AttachmentGrid";
import TaskTimeline from "../components/detail/TaskTimeline";
import AssigneeCard from "../components/detail/AssigneeCard";
import DeadlineHistoryCard from "../components/detail/DeadlineHistoryCard";

// Modals
import EditTaskModal from "../components/EditTaskModal";
import StopTaskModal from "../components/StopTaskModal";
import ReviewTaskModal from "../components/ReviewTaskModal";
import ReopenTaskModal from "../components/ReopenTaskModal";
import ExtendDeadlineModal from "../components/ExtendDeadlineModal";

const Section = ({ icon: Icon, title, extra, children }) => (
  <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100 xs:p-5">
    <div className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
        <Icon className="size-4 text-gray-400" />
        {title}
      </h3>
      {extra}
    </div>
    <div className="mt-3">{children}</div>
  </div>
);

/**
 * Topshiriq detali (boshqaruv).
 *
 * Tuzilma: tepada harakatlar paneli (holatga qarab faqat MA'NOLI tugmalar),
 * so'ng "hero" (holat, qadamlar, muddat, jarima). Chapda — nima so'ralgan,
 * ijrochi nima topshirgan va tarix; o'ngda — ijrochi, muddat tarixi.
 * Tekshiruvdagi ish uchun sariq chaqiriq alohida turadi: bu sahifaga
 * kelishning eng ko'p sababi aynan shu.
 */
const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { can } = usePermissions();
  const { data: roles = [] } = useRoles();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const { data: task, isLoading, isError } = useQuery(tasksQueries.detail(taskId));

  if (isLoading) return <LoaderCard className="ring-1 ring-gray-100" />;

  if (isError || !task) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-gray-100">
        <EmptyState
          icon={SearchX}
          title="Topshiriq topilmadi"
          description="U o'chirilgan bo'lishi yoki sizda ko'rish huquqi bo'lmasligi mumkin."
          action={
            <Button variant="outline" onClick={() => navigate("/tasks")}>
              <ArrowLeft />
              Ro'yxatga qaytish
            </Button>
          }
        />
      </div>
    );
  }

  const isActive = ACTIVE_TASK_STATUSES.includes(task.status);
  const isTerminal = ["completed", "stopped"].includes(task.status);
  const isReview = task.status === "pending_review";
  const rules = task.reviewRules || {};
  const completionFiles = task.completionAttachments || [];
  const dueOverdue = new Date(task.dueDate) < new Date();

  const reviewData = (initialAction) => ({
    taskId: task.id,
    dueDate: task.dueDate,
    initialAction,
    requireApproveReason: rules.requireApproveReason,
    filesCount: completionFiles.length,
    autoPenaltyPoints:
      rules.autoPenaltyEnabled && !task.autopenalized && dueOverdue ? task.penaltyPoints : 0,
  });

  const handleDelete = () =>
    deleteTask(task.id, {
      onSuccess: () => {
        toast.success("Topshiriq o'chirildi");
        navigate("/tasks", { replace: true });
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <div className="space-y-4">
      {/* Harakatlar paneli */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/tasks"))}
            className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-gray-900"
            aria-label="Orqaga"
          >
            <ArrowLeft className="size-4" />
          </button>
          <Link to="/tasks" className="text-gray-500 hover:text-gray-900">
            Topshiriqlar
          </Link>
          <span className="text-gray-300">/</span>
          <span className="max-w-48 truncate font-medium text-gray-900 sm:max-w-80">{task.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {can("tasks.update") && task.status !== "completed" && (
            <Button variant="outline" onClick={() => openModal("editTask", { task })}>
              <PencilLine />
              Tahrirlash
            </Button>
          )}
          {can("tasks.extend") && isActive && (
            <Button
              variant="outline"
              onClick={() =>
                openModal("extendDeadline", {
                  taskId: task.id,
                  currentDueDate: task.dueDate,
                  defaultPenaltyPoints: task.penaltyPoints,
                  maxPenaltyPoints: task.maxPenaltyPoints,
                })
              }
            >
              <CalendarPlus />
              Muddatni uzaytirish
            </Button>
          )}
          {can("tasks.update") && isTerminal && (
            <Button variant="outline" onClick={() => openModal("reopenTask", { taskId: task.id })}>
              <RotateCcw />
              Qayta ochish
            </Button>
          )}
          {can("tasks.stop") && isActive && (
            <Button
              variant="outline"
              className="text-rose-600 hover:text-rose-700"
              onClick={() =>
                openModal("stopTask", {
                  taskId: task.id,
                  defaultPenaltyPoints: task.penaltyPoints,
                  maxPenaltyPoints: task.maxPenaltyPoints,
                  penaltyApplied: task.autopenalized,
                })
              }
            >
              <Ban />
              To'xtatish
            </Button>
          )}
          {can("tasks.delete") && !task.penaltyRef && (
            <ConfirmPopover
              danger
              title="Topshiriq o'chirilsinmi?"
              description="Topshiriq, uning fayllari va tarixi butunlay o'chadi. Buni qaytarib bo'lmaydi."
              confirmLabel="O'chirish"
              tooltip="O'chirish"
              onConfirm={handleDelete}
            >
              <Button variant="ghost" size="icon" disabled={isDeleting} className="text-gray-400 hover:text-rose-600">
                <Trash2 />
              </Button>
            </ConfirmPopover>
          )}
        </div>
      </div>

      <TaskHero task={task} dueSoonHours={rules.dueSoonHours} />

      {/* Tekshiruv chaqirig'i */}
      {isReview && can("tasks.review") && (
        <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between xs:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Eye className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-gray-900">Ijrochi ishni topshirdi</p>
              <p className="text-sm text-gray-600">
                Natijani pastda ko'rib, qabul qiling yoki qayta ishlashga qaytaring.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openModal("reviewTask", reviewData("reject"))}>
              <RotateCcw />
              Qaytarish
            </Button>
            <Button onClick={() => openModal("reviewTask", reviewData("approve"))}>
              <FileCheck2 />
              Qabul qilish
            </Button>
          </div>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-3">
        {/* Chap */}
        <div className="space-y-4 lg:col-span-2">
          <Section icon={AlignLeft} title="Nima qilish kerak">
            {task.description ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Tavsif yozilmagan</p>
            )}

            {task.attachments?.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Paperclip className="size-3.5" />
                  Topshiriq fayllari ({task.attachments.length})
                </p>
                <AttachmentGrid items={task.attachments} />
              </div>
            )}
          </Section>

          <Section
            icon={FileCheck2}
            title="Ijrochi natijasi"
            extra={
              completionFiles.length > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {completionFiles.length} ta fayl
                </span>
              )
            }
          >
            {task.completionNote || completionFiles.length > 0 ? (
              <div className="space-y-3">
                {task.completionNote && (
                  <blockquote className="whitespace-pre-wrap break-words rounded-xl border-l-4 border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm text-gray-700">
                    {task.completionNote}
                  </blockquote>
                )}
                <AttachmentGrid items={completionFiles} />
                {isActive && !isReview && (
                  <p className="text-xs text-gray-400">
                    Bu oldingi (qaytarilgan) topshirish — ijrochi yangisini yuborganda almashadi.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                <FileX2 className="size-8 text-gray-300" strokeWidth={1.5} />
                <p className="text-sm font-medium text-gray-700">Hali hech narsa topshirilmagan</p>
                <p className="text-xs text-gray-500">
                  Ijrochi ishni yakunlaganda kamida {task.submissionRules?.minFiles ?? 1} ta fayl yuklaydi
                </p>
              </div>
            )}
          </Section>

          <TaskTimeline entries={task.statusHistory} />
        </div>

        {/* O'ng */}
        <div className="space-y-4">
          <AssigneeCard task={task} roles={roles} />
          <DeadlineHistoryCard entries={task.deadlineHistory} />

          <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-gray-100 xs:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Yakunlash qoidalari
            </p>
            <ul className="mt-2.5 space-y-1.5 text-gray-600">
              <li>
                • Kamida <b>{task.submissionRules?.minFiles ?? 1}</b>, ko'pi bilan{" "}
                <b>{task.submissionRules?.maxFiles ?? 5}</b> ta fayl
              </li>
              <li>• Izoh {task.submissionRules?.requireNote ? "majburiy" : "ixtiyoriy"}</li>
              <li>
                • Muddatdan keyin topshirish{" "}
                {task.submissionRules?.allowLateSubmission === false ? "mumkin emas" : "mumkin"}
              </li>
            </ul>
            <p className="mt-3 border-t border-gray-100 pt-2.5 text-xs text-gray-400">
              Oxirgi o'zgarish: {formatDateTimeUz(task.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <EditTaskModal />
      <ReviewTaskModal />
      <ReopenTaskModal />
      <ExtendDeadlineModal />
      <StopTaskModal />
    </div>
  );
};

export default TaskDetailPage;
