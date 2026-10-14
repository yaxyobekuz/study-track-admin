// Toast
import { toast } from "sonner";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  AlignLeft,
  ArrowLeft,
  Ban,
  CalendarPlus,
  FileCheck2,
  FileX2,
  Paperclip,
  PencilLine,
  RotateCcw,
  SearchX,
  Trash2,
  Repeat,
} from "lucide-react";

// Queries
import { selfTasksQueries } from "@/features/tasks/queries/selfTasks.queries";
import { useDeleteSelfTask } from "@/features/tasks/queries/selfTasks.mutations";

// Data
import { ACTIVE_TASK_STATUSES } from "@/features/tasks/data/tasks.data";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Components
import Button from "@/shared/components/ui/button/Button";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import EmptyState from "@/shared/components/ui/EmptyState";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import TaskHero from "@/features/tasks/components/detail/TaskHero";
import AttachmentGrid from "@/features/tasks/components/AttachmentGrid";
import TaskLinksList from "@/features/tasks/components/TaskLinksList";
import TaskTimeline from "@/features/tasks/components/detail/TaskTimeline";
import AssigneeCard from "@/features/tasks/components/detail/AssigneeCard";
import DeadlineHistoryCard from "@/features/tasks/components/detail/DeadlineHistoryCard";

// Modals
import EditSelfTaskModal from "../components/EditSelfTaskModal";
import SelfTaskStopModal from "../components/SelfTaskStopModal";
import SelfTaskCompleteModal from "../components/SelfTaskCompleteModal";
import SelfTaskDeadlineModal from "../components/SelfTaskDeadlineModal";

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
 * O'ZIGA BELGILAGAN ISH — BATAFSIL.
 *
 * Bitta komponent, ikki rejim:
 *
 *   EGASI (`/my-tasks/self/:taskId`) — hamma amal: yakunlash, tahrirlash,
 *   muddatni surish, to'xtatish, qayta ochish, o'chirish.
 *
 *   BOSHQARUVCHI (`/tasks/self/:taskId`, `readOnly`) — faqat KO'RISH.
 *   ⚠️ Birovning shaxsiy rejasini rahbar yopmaydi va tahrirlamaydi:
 *   bu oqimning butun mohiyati odamning o'zini o'zi rejalashtirishi.
 *   Server ham rad etadi, bu yerdagi `readOnly` esa shu qoidaning
 *   ko'rinishi.
 *
 * ⚠️ TASDIQLASH BO'LIMI YO'Q (markazdagi detaldan farqi): shaxsiy ishda
 * "Tekshiruvda" holati strukturaviy yo'q, ya'ni sariq chaqiriq hech
 * qachon chiqmaydi.
 */
const SelfTaskDetailPage = ({ readOnly = false }) => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { data: roles = [] } = useRoles();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteSelfTask();

  const {
    data: task,
    isLoading,
    isError,
  } = useQuery(readOnly ? selfTasksQueries.anyDetail(taskId) : selfTasksQueries.detail(taskId));

  const listPath = readOnly ? "/tasks/self" : "/my-tasks?tab=self";

  if (isLoading) return <LoaderCard className="ring-1 ring-gray-100" />;

  if (isError || !task) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-gray-100">
        <EmptyState
          icon={SearchX}
          title="Ish topilmadi"
          description="U o'chirilgan bo'lishi yoki sizda ko'rish huquqi bo'lmasligi mumkin."
          action={
            <Button variant="outline" onClick={() => navigate(listPath)}>
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
  const completionFiles = task.completionAttachments || [];
  const rules = task.submissionRules || {};

  const handleDelete = () =>
    deleteTask(task.id, {
      onSuccess: () => {
        toast.success("Ish o'chirildi");
        navigate(listPath);
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  return (
    <div className="space-y-4">
      {/* Yuqori panel */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate(listPath)}
            aria-label="Orqaga"
            className="flex size-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
          </button>
          <Link to={listPath} className="text-gray-500 hover:text-gray-900">
            {readOnly ? "O'ziga belgilagan ishlar" : "O'zim belgilagan"}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="max-w-48 truncate font-medium text-gray-900 sm:max-w-80">
            {task.title}
          </span>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2">
            {isActive && (
              <Button onClick={() => openModal("completeSelfTask", { task, rules })}>
                <FileCheck2 />
                Bajardim
              </Button>
            )}
            {task.status !== "completed" && (
              <Button variant="outline" onClick={() => openModal("editSelfTask", { task })}>
                <PencilLine />
                Tahrirlash
              </Button>
            )}
            {isActive && (
              <Button
                variant="outline"
                onClick={() => openModal("selfTaskDeadline", { task, mode: "extend" })}
              >
                <CalendarPlus />
                Muddatni o'zgartirish
              </Button>
            )}
            {isTerminal && (
              <Button
                variant="outline"
                onClick={() => openModal("selfTaskDeadline", { task, mode: "reopen" })}
              >
                <RotateCcw />
                Qayta ochish
              </Button>
            )}
            {isActive && (
              <Button
                variant="outline"
                className="text-rose-600 hover:text-rose-700"
                onClick={() => openModal("stopSelfTask", { task })}
              >
                <Ban />
                To'xtatish
              </Button>
            )}
            <ConfirmPopover
              danger
              title="Ish o'chirilsinmi?"
              description="Ish, uning fayllari va tarixi butunlay o'chadi. Buni qaytarib bo'lmaydi."
              confirmLabel="O'chirish"
              tooltip="O'chirish"
              onConfirm={handleDelete}
            >
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                className="text-gray-400 hover:text-rose-600"
              >
                <Trash2 />
              </Button>
            </ConfirmPopover>
          </div>
        )}
      </div>

      <TaskHero self task={task} dueSoonHours={rules.dueSoonHours} />

      {/* Doimiy ishdan yozilgani — "buni men qo'lda yozmadim" degan savolga javob */}
      {task.scheduleId && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-900 ring-1 ring-violet-100">
          <Repeat className="mt-0.5 size-4 shrink-0" />
          <p>
            Bu ish o'zingiz belgilagan <b>doimiy ish qoidasidan</b> avtomatik yozilgan. Qoidani
            o'zgartirish keyingi takrorlanishlarga ta'sir qiladi, bu ishga esa tegmaydi.
          </p>
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
                  Fayllar ({task.attachments.length})
                </p>
                <AttachmentGrid items={task.attachments} />
              </div>
            )}

            {task.links?.length > 0 && (
              <TaskLinksList links={task.links} className="mt-4 border-t border-gray-100 pt-4" />
            )}
          </Section>

          <Section
            icon={FileCheck2}
            title="Bajarilgan ish"
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
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                <FileX2 className="size-8 text-gray-300" strokeWidth={1.5} />
                <p className="text-sm font-medium text-gray-700">Hali yakunlanmagan</p>
                <p className="text-xs text-gray-500">
                  Yakunlashda kamida {rules.minFiles ?? 1} ta fayl yuklanadi
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
                • Kamida <b>{rules.minFiles ?? 1}</b>, ko'pi bilan <b>{rules.maxFiles ?? 5}</b> ta
                fayl
              </li>
              <li>• Izoh {rules.requireNote ? "majburiy" : "ixtiyoriy"}</li>
              <li>
                • Muddatdan keyin topshirish{" "}
                {rules.allowLateSubmission === false ? "mumkin emas" : "mumkin"}
              </li>
              {/* ⚠️ Shaxsiy oqimning asosiy farqi — shu ikki qator */}
              <li className="text-emerald-700">• Jarima yozilmaydi</li>
              <li className="text-emerald-700">• Tasdiqlash kutilmaydi</li>
            </ul>
            <p className="mt-3 border-t border-gray-100 pt-2.5 text-xs text-gray-400">
              Oxirgi o'zgarish: {formatDateTimeUz(task.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {!readOnly && (
        <>
          <SelfTaskCompleteModal />
          <EditSelfTaskModal />
          <SelfTaskDeadlineModal />
          <SelfTaskStopModal />
        </>
      )}
    </div>
  );
};

export default SelfTaskDetailPage;
