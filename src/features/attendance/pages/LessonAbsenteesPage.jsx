// React
import { useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { CalendarOff, CircleCheck, Clock, Phone, RefreshCw, Repeat2, TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import AttendanceSummaryCards from "../components/AttendanceSummaryCards";

// Utils
import { cn } from "@/shared/utils/cn";
import { todayInputValue } from "@/shared/utils/date.utils";

// Data & queries
import { LESSON_ABSENCE_STATE_META, LESSON_ABSENCE_SUMMARY_CARDS } from "../data/attendance.data";
import { attendanceQueries } from "../queries/attendance.queries";

/**
 * DARSGA KELMAGANLAR — "dars vaqti bo'ldi, o'qituvchi esa maktabda yo'q".
 *
 * Bugun uchun JONLI (daqiqada bir yangilanadi): faqat BOSHLANGAN darslar
 * olinadi, hozir davom etayotgan dars alohida belgilanadi. O'tgan kun
 * tanlansa — o'sha kunning hamma darsi.
 *
 * ⚠️ HISOB SERVERDA (`lessonAbsence.service.js`): amaldagi o'qituvchi
 * (o'rinbosarlik hisobga olingan), dars vaqti va davomat bitta joyda
 * birlashtiriladi. Bu yerda faqat ko'rsatiladi.
 *
 * ⚠️ VAQTSIZ DARSLAR JIM TUSHIB QOLMAYDI: "Dars vaqtlari" sozlanmagan
 * bo'lsa ular ro'yxatga kirmaydi — sahifa buni soni bilan aytadi.
 */
const LessonAbsenteesPage = () => {
  const [date, setDate] = useState(todayInputValue);
  const isToday = date === todayInputValue();

  const { data, isLoading, isFetching, isError, dataUpdatedAt, refetch } = useQuery(
    attendanceQueries.lessonAbsentees(isToday ? undefined : date, isToday),
  );

  const teachers = data?.teachers ?? [];
  const untimed = data?.summary?.untimedLessons ?? 0;

  return (
    <div className="space-y-4">
      {/* ── Boshqaruv: sana va yangilanish ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          {isToday ? (
            <>
              <span className="size-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
              Jonli · {data?.nowLabel ? `${data.nowLabel} holatiga` : "yuklanmoqda"}
            </>
          ) : (
            data?.dateLabel
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Yangilash"
            className="flex h-10 items-center gap-1.5 rounded-md border border-input bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} strokeWidth={1.8} />
            <span className="max-xs:hidden">Yangilash</span>
          </button>

          <input
            type="date"
            value={date}
            max={todayInputValue()}
            onChange={(event) => setDate(event.target.value || todayInputValue())}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm outline-2 outline-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : isError ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={TriangleAlert} title="Ro'yxatni yuklab bo'lmadi" description="Sahifani yangilab ko'ring." />
        </Card>
      ) : data?.closed ? (
        <Card className="p-0 xs:p-0">
          <EmptyState icon={CalendarOff} title={data.message} description="Bu kunda darslar bo'lmaydi." />
        </Card>
      ) : (
        <>
          {/* Dars vaqti noma'lum darslar — ro'yxatdan tashqarida qoldi */}
          {untimed > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
              <p>
                {untimed} ta darsning boshlanish vaqti noma'lum — ular tekshirilmadi.{" "}
                <Link to="/schedule-settings" className="font-medium underline">
                  Dars vaqtlarini sozlang
                </Link>
                .
              </p>
            </div>
          )}

          <AttendanceSummaryCards
            cards={LESSON_ABSENCE_SUMMARY_CARDS}
            summary={data?.summary}
            className="sm:grid-cols-4"
          />

          {teachers.length === 0 ? (
            <Card className="p-0 xs:p-0">
              <EmptyState
                icon={CircleCheck}
                title={isToday ? "Boshlangan darslarning hammasida o'qituvchi maktabda" : "Bu kunda darsga kelmagan o'qituvchi yo'q"}
                description={isToday ? "Ro'yxat har daqiqada yangilanadi — yangi dars boshlanishi bilan tekshiriladi." : ""}
              />
            </Card>
          ) : (
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {teachers.map((teacher) => (
                <TeacherCard key={teacher.teacherId} teacher={teacher} />
              ))}
            </ul>
          )}

          {dataUpdatedAt > 0 && isToday && (
            <p className="text-xs text-gray-400">Ro'yxat har daqiqada o'zi yangilanadi.</p>
          )}
        </>
      )}
    </div>
  );
};

/** Bitta o'qituvchi — holati, kelish/ketish vaqti va o'tmay qolayotgan darslari. */
const TeacherCard = ({ teacher }) => {
  const meta = LESSON_ABSENCE_STATE_META[teacher.state] ?? LESSON_ABSENCE_STATE_META.absent;

  return (
    <li>
      <Card className={cn("space-y-3", teacher.ongoingCount > 0 && "ring-1 ring-red-200")}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{teacher.teacherName}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
              {teacher.arrivedAtLabel && <span>Keldi: {teacher.arrivedAtLabel}</span>}
              {teacher.leftAtLabel && <span>Ketdi: {teacher.leftAtLabel}</span>}
              {teacher.phone && (
                <a href={`tel:${teacher.phone}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                  <Phone className="size-3" strokeWidth={2} />
                  {teacher.phone}
                </a>
              )}
            </p>
          </div>

          <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-medium", meta.className)}>
            {teacher.stateLabel}
          </span>
        </div>

        <ul className="space-y-1.5">
          {teacher.lessons.map((lesson) => (
            <li
              key={`${lesson.classId}-${lesson.lessonOrder}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2",
                lesson.ongoing ? "bg-red-50" : "bg-gray-50",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold tabular-nums text-gray-700">
                {lesson.lessonOrder}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {lesson.className} · {lesson.subjectName}
                </p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="size-3" strokeWidth={2} />
                  {lesson.startTime ? `${lesson.startTime}–${lesson.endTime ?? "?"}` : "vaqti noma'lum"}
                  {lesson.substituted && (
                    <span className="ml-1 inline-flex items-center gap-0.5">
                      <Repeat2 className="size-3" strokeWidth={2} />
                      o'rinbosar
                    </span>
                  )}
                </p>
              </div>

              {lesson.ongoing ? (
                <span className="shrink-0 rounded-md bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                  Hozir darsda
                </span>
              ) : (
                lesson.state !== teacher.state && (
                  <span className="shrink-0 text-xs text-gray-500">{lesson.stateLabel}</span>
                )
              )}
            </li>
          ))}
        </ul>
      </Card>
    </li>
  );
};

export default LessonAbsenteesPage;
