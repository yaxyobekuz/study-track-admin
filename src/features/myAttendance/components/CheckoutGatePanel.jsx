// Toaster
import { toast } from "sonner";

// React
import { useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import {
  CHECKOUT_CLOSED_LABELS,
  CHECKOUT_GRADE_REQUIREMENT,
  CHECKOUT_LESSON_STATE_COLORS,
  CHECKOUT_REASON_MIN,
} from "@/features/attendance/data/attendance.data";
import {
  taskStatusColors,
  taskStatusLabels,
} from "@/features/tasks/data/tasks.data";

// Queries
import { myAttendanceQueries } from "../queries/myAttendance.queries";
import {
  useCancelCheckoutRequest,
  useCreateCheckoutRequest,
} from "../queries/myAttendance.mutations";

/**
 * KUNNI YAKUNLASH — "Men ketdim" oldidagi ishlar ro'yxati (admin panel).
 *
 * ⚠️ NIMA UCHUN BU PANELDA HAM BOR: darvoza `teacher` roli (asosiy YOKI
 * qo'shimcha) bor har qanday xodimga tegishli (`education.md` §12), ya'ni
 * dars ham o'tadigan rahbar/ma'mur ham unga tushadi. Ilgari bu oyna faqat
 * o'qituvchi panelida bo'lgani uchun admin paneldan ketishga urinish
 * server 409 si (`checkout_blocked`) bilan tugardi va odam na sababni
 * ko'rar, na rahbariyatdan ruxsat so'rar edi — "Men ketdim ishlamayapti"
 * holatining aynan o'zi.
 *
 * ⚠️ QAROR SERVERDA: bu oyna faqat ko'rsatadi. "Ha, ketdim" baribir
 * `check-out` ga boradi va server ishlar tugamaganini ko'rsa 409 qaytaradi —
 * u holda ro'yxat javobdagi `details.readiness` bilan yangilanadi
 * (`CheckInOutCard`).
 *
 * ⚠️ BAHO BU PANELDA QO'YILMAYDI (admin panelda jurnal faqat o'qish uchun),
 * shuning uchun darslar ro'yxati — HOLAT, havola emas. Baho o'qituvchi
 * panelida qo'yiladi va buni matn ochiq aytadi: havolasiz ro'yxat
 * "nima qilishim kerak" degan savolni javobsiz qoldirardi.
 *
 * @param {object} props
 * @param {boolean} props.loading - `check-out` so'rovi ketyaptimi
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
const CheckoutGatePanel = ({ loading, onConfirm, onCancel }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("");

  const {
    data: readiness,
    isLoading,
    isError,
    refetch,
  } = useQuery(myAttendanceQueries.checkoutReadiness());

  const { mutate: createRequest, isPending: creating } = useCreateCheckoutRequest();
  const { mutate: cancelRequest, isPending: cancelling } = useCancelCheckoutRequest();

  if (isLoading) {
    return (
      <PanelShell>
        <p className="text-sm text-gray-500">
          Bugungi ishlaringiz tekshirilmoqda...
        </p>
      </PanelShell>
    );
  }

  // Ro'yxat yuklanmasa ham ketishga urinish mumkin — qarorni server qiladi
  if (isError || !readiness) {
    return (
      <PanelShell>
        <p className="text-sm text-red-700">
          Bugungi ishlar ro&apos;yxatini yuklab bo&apos;lmadi.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => refetch()}>
            Qayta urinish
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={loading}
            onClick={onConfirm}
          >
            Ha, ketdim{loading && "..."}
          </Button>
        </div>
      </PanelShell>
    );
  }

  // Darvoza bu xodimga qo'llanmaydi — oddiy tasdiq
  if (!readiness.applies) {
    return (
      <PanelShell>
        <p className="text-sm font-medium text-red-800">
          Haqiqatan ham ketmoqchimisiz?
        </p>
        <p className="text-xs text-gray-500">
          Qayd etilgandan keyin uni o&apos;zgartirib bo&apos;lmaydi — davomat
          daftari faqat qo&apos;shimcha yozuv qabul qiladi.
        </p>
        <ConfirmButtons loading={loading} onConfirm={onConfirm} onCancel={onCancel} />
      </PanelShell>
    );
  }

  const request = readiness.request;
  const approved = request?.status === "approved";
  const pending = request?.status === "pending";
  const canRequest = !readiness.ready && !approved && !pending;

  const handleRequest = () => {
    const text = reason.trim();
    if (text.length < CHECKOUT_REASON_MIN) {
      toast.warning(`Sababni yozing (kamida ${CHECKOUT_REASON_MIN} ta belgi)`);
      return;
    }
    createRequest(
      { reason: text },
      {
        onSuccess: () => {
          setReason("");
          toast.success("So'rov rahbariyatga yuborildi");
        },
        onError: (error) =>
          toast.error(error?.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const handleCancelRequest = () => {
    cancelRequest(request.id, {
      onSuccess: () => toast.success("So'rov bekor qilindi"),
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <PanelShell>
      {/* Sarlavha */}
      <div>
        <p className="font-semibold text-gray-900">Kunni yakunlash</p>
        <p className="text-xs text-gray-500">
          {readiness.dateLabel} · ketishdan oldin bugungi ishlaringiz
        </p>
      </div>

      {readiness.grades.required && (
        <GradesSection grades={readiness.grades} closed={readiness.closed} />
      )}

      {readiness.tasks.required && <TasksSection tasks={readiness.tasks} />}

      {/* Umumiy holat */}
      {readiness.ready ? (
        <Notice tone="green" icon={CheckCircle2}>
          Bugungi ishlaringiz tugagan.
        </Notice>
      ) : (
        <Notice tone="red" icon={AlertTriangle}>
          <p className="font-medium">Ishlar tugamagan:</p>
          <ul className="list-disc pl-5">
            {readiness.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </Notice>
      )}

      {/* Rahbariyat ruxsati */}
      {approved && (
        <Notice tone="green" icon={ShieldCheck}>
          <p className="font-medium">
            Rahbariyat ruxsat berdi
            {request.reviewerName && ` — ${request.reviewerName}`}
            {request.reviewedAtLabel && `, ${request.reviewedAtLabel}`}
          </p>
          {request.reviewNote && <p>Izoh: {request.reviewNote}</p>}
        </Notice>
      )}

      {pending && (
        <Notice tone="yellow" icon={Clock}>
          <p className="font-medium">
            So&apos;rovingiz rahbariyatga yuborilgan ({request.createdAtLabel}) —
            javob kutilmoqda
          </p>
          <p>Sabab: {request.reason}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={cancelling}
            onClick={handleCancelRequest}
          >
            So&apos;rovni bekor qilish
          </Button>
        </Notice>
      )}

      {request?.status === "rejected" && (
        <Notice tone="red" icon={XCircle}>
          <p className="font-medium">
            So&apos;rovingiz rad etildi
            {request.reviewerName && ` — ${request.reviewerName}`}
          </p>
          {request.reviewNote && <p>Sabab: {request.reviewNote}</p>}
        </Notice>
      )}

      {/* Rahbariyatdan ruxsat so'rash */}
      {canRequest && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">
            Ishlarni tugatmay ketishingiz kerakmi?
          </p>
          <p className="text-xs text-gray-500">
            Sababini yozing — rahbariyat ko&apos;rib chiqadi. Ruxsat berilsa,
            shu yerning o&apos;zida &quot;Ha, ketdim&quot; ochiladi.
            {/* ⚠️ O'z so'rovini o'zi ko'rib chiqa olmaydi (server qoidasi),
                shuning uchun rahbarning o'zi ham boshqa rahbarni kutadi. */}
          </p>
          <Input
            type="textarea"
            className="min-h-24"
            value={reason}
            maxLength={1000}
            placeholder="Masalan: farzandim kasal bo'lib qoldi, shifokorga olib borishim kerak"
            onChange={(event) => setReason(event.target.value)}
          />
          <Button
            variant="secondary"
            className="w-full"
            disabled={creating}
            onClick={handleRequest}
          >
            <Send strokeWidth={1.5} />
            Rahbariyatdan ruxsat so&apos;rash{creating && "..."}
          </Button>
        </div>
      )}

      {/* Tasdiq va ketish */}
      {readiness.canCheckOut ? (
        <div className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-primary"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            {approved
              ? "Rahbariyat ruxsati bilan ketayotganimni tasdiqlayman"
              : "Bugungi ishlarimni to'liq yakunladim — tasdiqlayman"}
          </label>
          <p className="text-xs text-gray-500">
            Ketganingiz qayd etilgach, bugungi darslarga baho qo&apos;yib
            bo&apos;lmaydi.
          </p>
          <ConfirmButtons
            loading={loading}
            disabled={!confirmed}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        </div>
      ) : (
        <Button variant="secondary" className="w-full" onClick={onCancel}>
          Yopish
        </Button>
      )}
    </PanelShell>
  );
};

const PanelShell = ({ children }) => (
  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
    {children}
  </div>
);

const ConfirmButtons = ({ loading, disabled, onConfirm, onCancel }) => (
  <div className="flex gap-2">
    <Button
      variant="danger"
      className="flex-1"
      disabled={loading || disabled}
      onClick={onConfirm}
    >
      Ha, ketdim{loading && "..."}
    </Button>
    <Button variant="secondary" className="flex-1" onClick={onCancel}>
      Bekor qilish
    </Button>
  </div>
);

const NOTICE_TONES = {
  green: "bg-green-50 text-green-800",
  red: "bg-red-50 text-red-800",
  yellow: "bg-yellow-50 text-yellow-800",
};

const Notice = ({ tone, icon: Icon, children }) => (
  <div className={cn("flex gap-2 rounded-lg px-3 py-2 text-sm", NOTICE_TONES[tone])}>
    <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
    <div className="min-w-0 space-y-1">{children}</div>
  </div>
);

/** Bugungi darslar — holati bilan (baho o'qituvchi panelida qo'yiladi). */
const GradesSection = ({ grades, closed }) => (
  <section className="space-y-2">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium text-gray-900">Baholar</p>
      {grades.total > 0 && (
        <span className="text-xs text-gray-500">
          {grades.done}/{grades.total} dars
        </span>
      )}
    </div>

    {closed ? (
      <p className="text-sm text-gray-500">{CHECKOUT_CLOSED_LABELS[closed]}</p>
    ) : grades.total === 0 ? (
      <p className="text-sm text-gray-500">Bugun darsingiz yo&apos;q</p>
    ) : (
      <>
        <p className="text-xs text-gray-500">
          {grades.exempt
            ? "Siz baho talabidan ozodsiz — darslar ketishni to'smaydi."
            : CHECKOUT_GRADE_REQUIREMENT}
        </p>

        <ul className="space-y-2">
          {grades.lessons.map((lesson) => (
            <li
              key={`${lesson.classId}-${lesson.subjectId}-${lesson.lessonOrder}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-gray-900">
                  {lesson.lessonOrder}-dars · {lesson.className} ·{" "}
                  {lesson.subjectName}
                </p>
                <p className="text-xs text-gray-500">
                  {lesson.startTime && lesson.endTime
                    ? `${lesson.startTime}–${lesson.endTime} · `
                    : ""}
                  {lesson.gradedStudents}/{lesson.totalStudents} o&apos;quvchiga baho
                  {lesson.substituted && " · o'rinbosarlik"}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  CHECKOUT_LESSON_STATE_COLORS[lesson.state],
                )}
              >
                {lesson.stateLabel}
              </span>
            </li>
          ))}
        </ul>

        {!grades.exempt && grades.done < grades.total && (
          <p className="text-xs text-gray-500">
            Baho o&apos;qituvchi panelida qo&apos;yiladi — admin paneldagi
            jurnal faqat ko&apos;rish uchun.
          </p>
        )}
      </>
    )}
  </section>
);

const TasksSection = ({ tasks }) => (
  <section className="space-y-2">
    <p className="text-sm font-medium text-gray-900">Topshiriqlar</p>

    {tasks.items.length === 0 ? (
      <p className="text-sm text-gray-500">
        Muddati kelgan topshirilmagan topshiriq yo&apos;q
      </p>
    ) : (
      <ul className="space-y-2">
        {tasks.items.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium text-gray-900">
                {task.title}
              </p>
              <p
                className={cn(
                  "text-xs",
                  task.overdue ? "text-red-600" : "text-gray-500",
                )}
              >
                Muddat: {task.dueLabel}
                {task.overdue && " · muddati o'tgan"}
              </p>
              {task.locked && (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Lock className="size-3" strokeWidth={1.5} />
                  Kech topshirib bo&apos;lmaydi — muddatni rahbar uzaytiradi
                  (ketishni to&apos;smaydi)
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  taskStatusColors[task.status],
                )}
              >
                {taskStatusLabels[task.status] ?? task.status}
              </span>
              {!task.locked && (
                <Link
                  to={`/tasks/${task.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ochish
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default CheckoutGatePanel;
