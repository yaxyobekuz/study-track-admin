// Data
import { days } from "@/shared/data/days.data";
import { SCHEDULE_SYNC_ACCESS } from "@/features/permissions/data/permissions.data";

// React
import { useEffect, useMemo, useState } from "react";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Store
import useAuth from "@/shared/hooks/useAuth";
import useModal from "@/shared/hooks/useModal";
import usePermissions from "@/shared/hooks/usePermissions";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";

// Queries
import {
  useClassSchedule,
  useWeekTopics,
} from "@/features/schedules/queries/schedules.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";
import {
  scheduleSyncQueries,
  useScheduleSourceMode,
} from "@/features/schedule-sync/queries/scheduleSync.queries";

// Icons
import {
  Edit,
  Calendar,
  Download,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Pin,
  TriangleAlert,
} from "lucide-react";

// Modals
import BindTopicModal from "@/features/schedules/components/BindTopicModal";

/**
 * ISO kunni siljitadi ("2026-10-12" + 7 → "2026-10-19").
 *
 * ⚠️ Bu FORMATLOVCHI emas — mashina qiymati (`dates.md` §3 istisnosi):
 * natija faqat so'rov parametri sifatida serverga ketadi. Ekranda
 * ko'rinadigan matnni server beradi (`week.label`, `dateLabel`).
 */
const shiftIso = (iso, days) =>
  new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * 86400000)
    .toISOString()
    .slice(0, 10);

const Schedules = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { classId } = useParams();
  const isOwner = user?.role === "owner";
  const canOpenSync = can(SCHEDULE_SYNC_ACCESS);

  const { data: classes = [] } = useClasses();

  const { data: schedules = [], isLoading } = useClassSchedule(classId);

  // ── MAVZULAR ──
  //
  // ⚠️ ALOHIDA SO'ROV va bu ataylab: mavzu jadvalning USTIGA qo'yiladi.
  // Jadvalning o'zi eski so'rovdan chiziladi, shuning uchun mavzular
  // so'rovi yiqilsa ham (server xatosi, ruxsat) jadval baribir ko'rinadi.
  //
  // `week` — `undefined` bo'lsa server joriy haftani beradi; tugma bosilgach
  // aniq sana yoziladi.
  const [week, setWeek] = useState(undefined);
  const { data: topicsWeek } = useWeekTopics(classId, week);
  const canAssignTopic = can("topics.assign");

  // Sinf almashsa hafta joriyga qaytadi: boshqa sinfni ochgan odam
  // o'tgan oygi haftada turib qolmasin.
  useEffect(() => setWeek(undefined), [classId]);

  // "dushanba" → o'sha kunning mavzulari va sanasi
  const topicsByDay = useMemo(() => {
    const map = new Map();
    for (const day of topicsWeek?.days ?? []) map.set(day.day, day);
    return map;
  }, [topicsWeek]);

  const weekStart = topicsWeek?.week?.start ?? null;

  // ── Jadval manbai ──
  //
  // "Tahrirlash" faqat manba ANIQ "platform" bo'lganda ko'rinadi: sheet
  // rejimida platformadagi tahrir yopiq (server ham rad etadi), manba
  // noma'lum bo'lsa esa tahrir sahifasi baribir formani ochmaydi.
  const { data: modeData } = useScheduleSourceMode();
  const isSheetMode = modeData?.mode === "sheet";
  const isPlatformMode = modeData?.mode === "platform";

  // Holat faqat bo'limga ruxsati borlarga so'raladi (endpoint `scheduleSync.*`).
  const { data: syncStatus } = useQuery({
    ...scheduleSyncQueries.status(),
    enabled: canOpenSync,
  });

  // Qo'llash faqat sheet rejimida mavjud — platforma rejimida o'qilgan
  // holat "Manbani almashtirish" orqali ko'rib chiqiladi, bu yerda
  // doimiy eslatma bo'lib turmasligi kerak.
  const hasPendingChange =
    isSheetMode &&
    Boolean(syncStatus?.can?.review) &&
    syncStatus?.latestRevision?.status === "pending";

  // Redirect to the first class when no class is selected in the URL
  useEffect(() => {
    if (!classId && classes.length > 0) {
      navigate(`/schedules/${classes[0].id}`, { replace: true });
    }
  }, [classId, classes, navigate]);

  const getScheduleForDay = (day) => {
    return schedules.find((s) => s.day === day);
  };

  // Excel yuklab olish
  const handleExport = async () => {
    try {
      if (!classId) return;

      const response = await schedulesAPI.exportByClass(classId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const className =
        classes.find((cls) => cls.id === classId)?.name || "sinf";
      link.setAttribute(
        "download",
        `dars_jadvali_${className}_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export xatosi:", error);
    }
  };

  if (isLoading || !classId) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Card className="w-40 h-10 rounded-lg" />
          <Card className="size-10 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Title */}
        <h1 className="page-title">Dars jadvali</h1>

        {/* Filter & Action buttons */}
        <div className="flex flex-wrap items-center gap-2 xs:gap-4">
          <SelectSearch
            value={classId}
            placeholder="Sinfni tanlang"
            triggerClassName="w-44"
            onChange={(v) => v && navigate(`/schedules/${v}`)}
            options={classes.map((cls) => ({
              label: cls.name,
              value: cls.id,
            }))}
          />

          {canOpenSync && (
            <Button
              variant="outline"
              onClick={() => navigate("/schedules/sheets")}
            >
              <FileSpreadsheet strokeWidth={1.5} />
              Google Sheets
            </Button>
          )}

          {isOwner && isPlatformMode && (
            <Button
              variant="outline"
              onClick={() => navigate(`/schedules/${classId}/edit`)}
            >
              <Edit strokeWidth={1.5} />
              Tahrirlash
            </Button>
          )}

          <Button onClick={handleExport}>
            <Download strokeWidth={1.5} />
            Jadvalni yuklash
          </Button>
        </div>
      </div>

      {/* Manba: Google Sheets */}
      {isSheetMode && (
        <Card className="mb-4 flex items-start gap-2.5 border border-emerald-200 bg-emerald-50/60">
          <FileSpreadsheet
            className="mt-0.5 size-4 shrink-0 text-emerald-600"
            strokeWidth={1.5}
          />
          <p className="text-sm text-gray-700">
            Jadval Google Sheets orqali boshqarilmoqda — tahrirlash sheet'da
            qilinadi
          </p>
        </Card>
      )}

      {/* Sheet'da ko'rib chiqilmagan o'zgarish */}
      {hasPendingChange && (
        <Card className="mb-4 flex flex-col gap-3 border border-amber-200 bg-amber-50/70 xs:flex-row xs:items-center xs:justify-between">
          <div className="flex items-start gap-2.5">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-amber-600"
              strokeWidth={1.5}
            />
            <p className="text-sm text-gray-700">
              Google Sheets'da yangi o'zgarish bor — ko'rib chiqing
            </p>
          </div>

          <Link
            to="/schedules/sheets?tab=changes"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Ko'rib chiqish
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </Card>
      )}

      {/* Hafta — mavzular aynan shu haftaga hisoblanadi */}
      {topicsWeek && (
        <Card className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {topicsWeek.week.label}
              </p>
              <p className="text-xs text-gray-500">
                {topicsWeek.week.isCurrent
                  ? "Joriy hafta — mavzular shu haftaga hisoblangan"
                  : "Boshqa hafta tanlangan"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!weekStart}
              onClick={() => setWeek(shiftIso(weekStart, -7))}
            >
              <ChevronLeft strokeWidth={1.5} />
              <span className="hidden sm:inline">Oldingi</span>
            </Button>

            {!topicsWeek.week.isCurrent && (
              <Button variant="outline" onClick={() => setWeek(undefined)}>
                Joriy hafta
              </Button>
            )}

            <Button
              variant="outline"
              disabled={!weekStart}
              onClick={() => setWeek(shiftIso(weekStart, 7))}
            >
              <span className="hidden sm:inline">Keyingi</span>
              <ChevronRight strokeWidth={1.5} />
            </Button>
          </div>
        </Card>
      )}

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const schedule = getScheduleForDay(day.value);
          const topicDay = topicsByDay.get(day.value);
          // Mavzu DARS TARTIBI bo'yicha topiladi: bir kunda bir fandan ikki
          // dars bo'lsa, ularning mavzusi ham boshqa-boshqa bo'ladi.
          const topicByOrder = new Map(
            (topicDay?.lessons ?? []).map((lesson) => [lesson.order, lesson]),
          );

          return (
            <Card key={day.value}>
              <div className="flex justify-between items-start mb-4">
                {/* Title */}
                <div className="flex items-center gap-3.5">
                  <Calendar
                    strokeWidth={1.5}
                    className="size-5 text-blue-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {day.label}
                    </h3>
                    {topicDay && (
                      <p className="text-xs text-gray-500">
                        {topicDay.dateLabel}
                        {topicDay.isToday && " · bugun"}
                      </p>
                    )}
                  </div>
                </div>

                {topicDay && !topicDay.isTeachingDay && (
                  <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {topicDay.offReason}
                  </span>
                )}
              </div>

              {/* Schedule Subjects */}
              {schedule && (
                <div className="space-y-3">
                  {schedule.subjects.map((subj, index) => {
                    const displayOrder = subj.order || index + 1;
                    const topicInfo = topicByOrder.get(displayOrder);
                    const canBind =
                      canAssignTopic &&
                      Boolean(topicDay?.date) &&
                      Boolean(topicDay?.isTeachingDay) &&
                      Boolean(subj.subject?.id);

                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          {/* Title */}
                          <b className="text-sm font-medium text-gray-900">
                            {displayOrder}. {subj.subject?.name}
                          </b>

                          {/* Teacher */}
                          <p className="text-xs text-gray-600">
                            {subj.teacher?.firstName}{" "}
                            {subj.teacher?.lastName?.slice(0, 1) + "."}
                          </p>
                        </div>

                        {/* Time */}
                        {subj.startTime && subj.endTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            {subj.startTime} - {subj.endTime}
                          </p>
                        )}

                        {/* MAVZU — biriktirilgan bo'lsa qadoq belgisi bilan */}
                        {topicDay && (
                          <button
                            type="button"
                            disabled={!canBind}
                            title={
                              canBind
                                ? "Mavzu biriktirish"
                                : "Mavzu biriktirish uchun ruxsat yo'q"
                            }
                            onClick={() =>
                              openModal("bindLessonTopic", {
                                classId,
                                className:
                                  classes.find((cls) => cls.id === classId)?.name ?? "",
                                subjectId: subj.subject?.id,
                                subjectName: subj.subject?.name,
                                date: topicDay.date,
                                dateLabel: topicDay.dateLabel,
                                dayLabel: topicDay.dayLabel,
                                lessonOrder: displayOrder,
                                currentTopicOrder: topicInfo?.topic?.order ?? null,
                                binding: topicInfo?.bindingId
                                  ? {
                                      id: topicInfo.bindingId,
                                      source: topicInfo.anchorSource,
                                      note: topicInfo.bindingNote,
                                    }
                                  : null,
                              })
                            }
                            className={`mt-2 flex w-full items-start gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors duration-200 ${
                              canBind ? "hover:bg-white" : "cursor-default"
                            } ${topicInfo?.topic ? "bg-blue-50/60" : "bg-white/70"}`}
                          >
                            {topicInfo?.isAnchor ? (
                              <Pin
                                className="mt-0.5 size-3.5 shrink-0 text-blue-600"
                                strokeWidth={1.5}
                              />
                            ) : (
                              <BookOpen
                                className="mt-0.5 size-3.5 shrink-0 text-gray-400"
                                strokeWidth={1.5}
                              />
                            )}

                            <span className="min-w-0 flex-1">
                              {topicInfo?.topic ? (
                                <>
                                  <span className="block text-xs font-medium text-gray-900">
                                    {topicInfo.topic.order}-mavzu
                                  </span>
                                  <span className="block truncate text-xs text-gray-600">
                                    {topicInfo.topic.name}
                                  </span>
                                </>
                              ) : (
                                <span className="block text-xs text-gray-400">
                                  {topicInfo?.topicReason || "Mavzu aniqlanmadi"}
                                </span>
                              )}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Schedule */}
              {!schedule && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Jadval yo'q
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <BindTopicModal />
    </div>
  );
};

export default Schedules;
