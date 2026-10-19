// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { BookOpen, CalendarClock, CircleCheckBig, Minus } from "lucide-react";

// Components
import Badge from "@/shared/components/ui/badge/Badge";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { certificatesQueries } from "../queries/certificates.queries";

/**
 * O'QUVCHINING SERTIFIKAT MANZARASI — "NEGA BU FOIZ".
 *
 * Ro'yxatdagi foiz o'z-o'zidan savol tug'diradi, shuning uchun bu yerda
 * har bir sertifikat FANI ochiladi: muddati, foizi va mavzular ro'yxati
 * O'TILGAN / QOLGAN bo'lib ajratilgan holda.
 *
 * ⚠️ Mavzular SINFNIKI, o'quvchining o'ziniki emas — platformada
 * o'quvchining shaxsiy mavzu o'rni yo'q. Shu sababli sinf nomi ham
 * ko'rsatiladi: raqam qayerdan kelgani ko'rinib turishi kerak.
 *
 * ⚠️ Mavzular ro'yxati yo'q bo'lsa — SABABI yoziladi (yo'nalish fanga
 * bog'lanmagan yoki fanga mavzu yuklanmagan), bo'sh joy emas.
 *
 * `openModal("certificateStudent", { studentId, studentName })`
 */
const StudentProgressModal = () => (
  <ResponsiveModal
    name="certificateStudent"
    title="O'quvchining sertifikatlari"
    description="Qaysi fan bo'yicha qaysi mavzular o'tilgan"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ studentId = null, studentName = "" }) => {
  const { data, isLoading } = useQuery(
    certificatesQueries.studentProgress(studentId),
  );

  if (isLoading) return <LoaderCard title="Yuklanmoqda..." />;

  const subjects = data?.subjects ?? [];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm">
        <p className="font-medium text-gray-900">
          {data?.student?.fullName || studentName}
        </p>
        {data?.student?.classes?.length > 0 && (
          <p className="mt-0.5 text-gray-500">
            {data.student.classes.map((cls) => cls.name).join(", ")}
          </p>
        )}
      </div>

      {subjects.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Bu o'quvchida faol sertifikat rejasi yo'q
        </p>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {subjects.map((subject) => (
            <SubjectBlock key={subject.planId} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
};

/** Bitta sertifikat fani — sarlavha, foiz va mavzular. */
const SubjectBlock = ({ subject }) => {
  const progress = subject.progress;
  const available = Boolean(progress?.available);
  // Mavzular ro'yxati uzun bo'lishi mumkin — sukut bo'yicha yopiq
  const [open, setOpen] = useState(false);

  const done = subject.topics?.filter((topic) => topic.done) ?? [];
  const left = subject.topics?.filter((topic) => !topic.done) ?? [];

  const overdue = subject.daysLeft !== null && subject.daysLeft < 0;

  return (
    <div className="rounded-xl border border-gray-200 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium text-gray-900">
            {subject.track.name}
            {subject.status === "passed" && (
              <Badge variant="secondary" className="text-[10px]">
                topshirdi
              </Badge>
            )}
          </p>
          {subject.track.subject && (
            <p className="text-xs text-gray-500">{subject.track.subject.name}</p>
          )}
        </div>

        <p
          className={cn(
            "flex items-center gap-1 text-xs",
            overdue ? "text-red-600" : "text-gray-500",
          )}
        >
          <CalendarClock className="size-3.5 shrink-0" strokeWidth={1.75} />
          {subject.dueDate ? subject.dueDateLabel : "Muddati aniq emas"}
          {subject.daysLeftLabel && ` · ${subject.daysLeftLabel}`}
        </p>
      </div>

      {available ? (
        <>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {progress.percent}%
            </span>
            <span className="text-xs text-gray-500">
              {progress.reachedTopics} / {progress.totalTopics} mavzu
              {progress.className && ` · ${progress.className}`}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${Math.min(Math.max(progress.percent, 0), 100)}%` }}
            />
          </div>

          {subject.topics ? (
            <>
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="mt-2.5 flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <BookOpen className="size-3.5" strokeWidth={1.75} />
                {open
                  ? "Mavzularni yashirish"
                  : `Mavzular: ${done.length} o'tilgan, ${left.length} qolgan`}
              </button>

              {open && (
                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TopicList
                    title={`O'tilgan (${done.length})`}
                    topics={done}
                    tone="done"
                  />
                  <TopicList
                    title={`Qolgan (${left.length})`}
                    topics={left}
                    tone="left"
                  />
                </div>
              )}
            </>
          ) : (
            <p className="mt-2.5 text-xs text-gray-500">
              Mavzular ro'yxati yuklanmagan
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-xs text-gray-500">
          {progress?.reason || "Mavzu progressi hisoblanmadi"}
        </p>
      )}
    </div>
  );
};

const TopicList = ({ title, topics, tone }) => (
  <div>
    <p
      className={cn(
        "mb-1.5 text-xs font-medium",
        tone === "done" ? "text-emerald-700" : "text-gray-500",
      )}
    >
      {title}
    </p>

    {topics.length === 0 ? (
      <p className="text-xs text-gray-400">—</p>
    ) : (
      <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
        {topics.map((topic) => (
          <li
            key={topic.order}
            className="flex items-start gap-1.5 text-xs text-gray-700"
          >
            {tone === "done" ? (
              <CircleCheckBig
                className="mt-0.5 size-3 shrink-0 text-emerald-600"
                strokeWidth={2}
              />
            ) : (
              <Minus className="mt-0.5 size-3 shrink-0 text-gray-300" strokeWidth={2} />
            )}
            <span className={cn(tone === "left" && "text-gray-500")}>
              {topic.order}. {topic.name}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default StudentProgressModal;
