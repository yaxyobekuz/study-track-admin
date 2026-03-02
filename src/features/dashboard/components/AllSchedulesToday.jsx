// React
import { useEffect } from "react";

// Store
import useAuth from "@/shared/hooks/useAuth";

// Components
import Card from "@/shared/components/ui/Card";

// Icons
import { BookOpen, GraduationCap } from "lucide-react";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// API
import { schedulesAPI } from "@/shared/api/schedules.api";

// Utils
import { getDayOfWeekUZ } from "@/shared/utils/date.utils";

const AllSchedulesToday = () => {
  const today = new Date();
  const { user } = useAuth();
  const dayName = getDayOfWeekUZ(today);
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  const toMinutes = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore("schedules-all-today");

  const schedules = getCollectionData() || [];
  const loading = isCollectionLoading();

  function fetchAllTodaySchedules() {
    setCollectionLoadingState(true);

    schedulesAPI
      .getAllToday()
      .then((res) => setCollection(res.data.data, null))
      .catch(() => setCollectionErrorState(true));
  }

  useEffect(() => {
    if (!hasCollection()) initialize(false);
  }, [initialize, hasCollection]);

  useEffect(() => {
    if (user?.role === "owner" && !schedules.length) {
      fetchAllTodaySchedules();
    }
  }, [user, schedules.length]);

  if (user?.role !== "owner" || dayName === "yakshanba") {
    return null;
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-gray-500">Yuklanmoqda...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative mt-4">
      {/* Title */}
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Bugungi barcha sinf dars jadvallari
      </h2>

      {/* No data */}
      {schedules.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <BookOpen
              className="size-12 text-gray-300 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-500">Bugun darslar yo'q</p>
          </div>
        </Card>
      )}

      {/* Schedule Grid */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule, idx) => (
            <Card key={idx}>
              <div className="flex items-center gap-3.5 mb-4">
                <GraduationCap
                  strokeWidth={1.5}
                  className="size-5 text-indigo-600"
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  {schedule.class?.name}
                </h3>
              </div>

              {/* Schedule Subjects */}
              <div className="space-y-3">
                {schedule.subjects?.map((subj, index) => {
                  const displayOrder =
                    (schedule.startingOrder || 1) +
                    (subj.order || index + 1) -
                    1;
                  const startMinutes = toMinutes(subj.startTime);
                  const endMinutes = toMinutes(subj.endTime);
                  const isActive =
                    startMinutes !== null &&
                    endMinutes !== null &&
                    currentMinutes >= startMinutes &&
                    currentMinutes <= endMinutes;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        isActive ? "bg-indigo-50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        {/* Title */}
                        <b className="text-sm font-medium text-gray-900">
                          {displayOrder}. {subj.subject?.name}
                        </b>

                        {/* Teacher */}
                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                              Aktiv
                            </span>
                          )}
                          <p className="text-xs text-gray-600">
                            {subj.teacher?.firstName}{" "}
                            {subj.teacher?.lastName?.slice(0, 1) + "."}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      {subj.startTime && subj.endTime && (
                        <p className="text-xs text-gray-500">
                          {subj.startTime} - {subj.endTime}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllSchedulesToday;
