// Data
import { days } from "@/shared/data/days.data";

// React
import { useEffect } from "react";

// Router
import { useNavigate, useParams } from "react-router-dom";

// Store
import useAuth from "@/shared/hooks/useAuth";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Icons
import { Edit, Calendar, Download } from "lucide-react";

const Schedules = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { classId } = useParams();
  const isOwner = user?.role === "owner";
  const collectionName = "schedules-" + classId;

  const {
    isLoading,
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore(collectionName);
  const classes = getCollectionData("classes");
  const schedules = getCollectionData(collectionName);
  const classesLoading = isCollectionLoading("classes");

  const fetchSchedules = () => {
    setCollectionLoadingState(true);

    schedulesAPI
      .getByClass(classId)
      .then((res) => {
        setCollection(res.data.data);
      })
      .catch(() => {
        setCollectionErrorState(true);
      });
  };

  // Redirect to the first class when no class is selected in the URL
  useEffect(() => {
    if (!classId && classes.length > 0) {
      navigate(`/schedules/${classes[0]._id}`, { replace: true });
    }
  }, [classId, classes, navigate]);

  useEffect(() => {
    if (classId && !hasCollection()) initialize(false, collectionName);
  }, [classId, initialize, hasCollection, collectionName]);

  useEffect(() => {
    if (classId && hasCollection() && !schedules?.length) fetchSchedules();
  }, [classId, schedules?.length, classesLoading]);

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
        classes.find((cls) => cls._id === classId)?.name || "sinf";
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
      <div className="flex items-center justify-between mb-4">
        {/* Title */}
        <h1 className="page-title">Dars jadvali</h1>

        {/* Filter & Action buttons */}
        <div className="flex items-center gap-4">
          <SelectSearch
            value={classId}
            placeholder="Sinfni tanlang"
            triggerClassName="w-44"
            onChange={(v) => v && navigate(`/schedules/${v}`)}
            options={classes.map((cls) => ({
              label: cls.name,
              value: cls._id,
            }))}
          />

          {isOwner && (
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
