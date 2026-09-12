// Data
import { days } from "@/shared/data/days.data";
import { SCHEDULE_SYNC_ACCESS } from "@/features/permissions/data/permissions.data";

// React
import { useEffect } from "react";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Store
import useAuth from "@/shared/hooks/useAuth";
import usePermissions from "@/shared/hooks/usePermissions";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";

// Queries
import { useClassSchedule } from "@/features/schedules/queries/schedules.queries";
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
  FileSpreadsheet,
  TriangleAlert,
} from "lucide-react";

const Schedules = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const { classId } = useParams();
  const isOwner = user?.role === "owner";
  const canOpenSync = can(SCHEDULE_SYNC_ACCESS);

  const { data: classes = [] } = useClasses();

  const { data: schedules = [], isLoading } = useClassSchedule(classId);

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

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const schedule = getScheduleForDay(day.value);

          return (
            <Card key={day.value}>
              <div className="flex justify-between items-start mb-4">
                {/* Title */}
                <div className="flex items-center gap-3.5">
                  <Calendar
                    strokeWidth={1.5}
                    className="size-5 text-blue-500"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {day.label}
                  </h3>
                </div>
              </div>

              {/* Schedule Subjects */}
              {schedule && (
                <div className="space-y-3">
                  {schedule.subjects.map((subj, index) => {
                    const displayOrder = subj.order || index + 1;
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
    </div>
  );
};

export default Schedules;
