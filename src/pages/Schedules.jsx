// Data
import { days } from "@/data/days.data";

// React
import { useState, useEffect } from "react";

// Store
import { useAuth } from "../store/authStore";

// API
import { schedulesAPI } from "../api/client";

// Components
import Card from "@/components/Card";
import Select from "@/components/form/select";

// Hooks
import useModal from "@/hooks/useModal.hook";
import useArrayStore from "@/hooks/useArrayStore.hook";

// Icons
import { Plus, Edit, Trash2, Calendar } from "lucide-react";

const Schedules = () => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const isOwner = user?.role === "owner";
  const [selectedClass, setSelectedClass] = useState("");
  const collectionName = "schedules-" + selectedClass;

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

  useEffect(() => {
    if (!hasCollection()) initialize(false, collectionName);
  }, [initialize, hasCollection]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]._id);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (selectedClass && !schedules?.length) fetchSchedules();
  }, [selectedClass, schedules?.length, classesLoading]);

  const fetchSchedules = () => {
    setCollectionLoadingState(true);

    schedulesAPI
      .getByClass(selectedClass)
      .then((res) => {
        setCollection(res.data.data);
      })
      .catch(() => {
        setCollectionErrorState(true);
      });
  };

  const getScheduleForDay = (day) => {
    return schedules.find((s) => s.day === day);
  };

  const handleOpenScheduleModal = (day, schedule = null) => {
    const dayData = days.find((d) => d.value === day);

    if (schedule) {
      return openModal("editSchedule", {
        ...schedule,
        day,
        dayLabel: dayData?.label,
        classId: selectedClass,
      });
    }

    openModal("createSchedule", {
      day,
      dayLabel: dayData?.label,
      classId: selectedClass,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <Select
        className="w-32 mb-6"
        value={selectedClass}
        onChange={(v) => setSelectedClass(v)}
        options={classes.map((cls) => ({ label: cls.name, value: cls._id }))}
      />

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => {
          const schedule = getScheduleForDay(day.value);

          return (
            <Card key={day.value}>
              <div className="flex justify-between items-start mb-4">
                {/* Title */}
                <div className="flex items-center gap-3.5">
                  <Calendar
                    strokeWidth={1.5}
                    className="size-5 text-indigo-600"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {day.label}
                  </h3>
                </div>

                {/* Owner Controls */}
                {isOwner && (
                  <div className="flex items-center gap-3.5">
                    {/* Edit / Create */}
                    <button
                      onClick={() =>
                        handleOpenScheduleModal(day.value, schedule)
                      }
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {schedule ? (
                        <Edit className="size-5" strokeWidth={1.5} />
                      ) : (
                        <Plus className="size-5" strokeWidth={1.5} />
                      )}
                    </button>

                    {/* Delete */}
                    {schedule && (
                      <button
                        onClick={() => openModal("deleteSchedule", schedule)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="size-5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Schedule Subjects */}
              {schedule && (
                <div className="space-y-3">
                  {schedule.subjects.map((subj, index) => {
                    const displayOrder = (schedule.startingOrder || 1) + (subj.order || index + 1) - 1;
                    return (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
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
                          <p className="text-xs text-gray-500">
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
