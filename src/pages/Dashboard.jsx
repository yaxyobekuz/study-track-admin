// Icons
import {
  Bot,
  Users,
  BookOpen,
  Briefcase,
  PlusCircle,
  PartyPopper,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

// Components
import Card from "@/components/Card";

// Router
import { Link } from "react-router-dom";

// React
import { useState, useEffect } from "react";

// Store
import { useAuth } from "../store/authStore";

// Utils
import { getDayOfWeekUZ } from "@/utils/date.utils";

// Helpers
import { getRoleLabel } from "@/helpers/role.helpers";

// API
import { schedulesAPI, usersAPI } from "@/api/client";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectStore from "@/hooks/useObjectStore.hook";

const Dashboard = () => {
  const { user } = useAuth();

  // Holiday Info
  const { getEntity } = useObjectStore("holidayCheck");
  const holidayInfo = getEntity("today") || { isHoliday: false, holiday: null };

  return (
    <div>
      {/* Holiday Banner */}
      {holidayInfo.isHoliday && (
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <PartyPopper
                className="size-8 text-orange-600"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800">
                Bugun "{holidayInfo.holiday?.name}" bayram kuni!
              </h3>
              {holidayInfo.holiday?.description && (
                <p className="text-orange-600 text-sm mt-1">
                  {holidayInfo.holiday.description}
                </p>
              )}
              <p className="text-orange-500 text-sm mt-2">
                Dam olish kunlarida darslar o'tkazilmaydi va baholar qo'yilmaydi
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
          Xush kelibsiz, {user?.firstName}!
        </h2>
        <p className="mt-2 text-gray-600">
          Rolingiz:{" "}
          <span className="font-medium">{getRoleLabel(user?.role)}</span>
        </p>
      </div>

      {/* User Statistics - Owner only */}
      {user?.role === "owner" && <UserStats />}

      {/* Quick Actions */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tezkor harakatlar
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {user?.role === "owner" && (
            <>
              {/* Users */}
              <Link
                to="/users"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Foydalanuvchilar</p>
                  <p className="text-sm text-gray-500">Boshqarish</p>
                </div>
              </Link>

              {/* Classes */}
              <Link
                to="/classes"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GraduationCap
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Sinflar</p>
                  <p className="text-sm text-gray-500">Boshqarish</p>
                </div>
              </Link>

              {/* Subjects */}
              <Link
                to="/schedules"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Dars jadvali</p>
                  <p className="text-sm text-gray-500">Sozlash</p>
                </div>
              </Link>
            </>
          )}

          {user?.role === "teacher" && (
            <>
              {/* My Schedule */}
              <Link
                to="/schedules"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Dars jadvali</p>
                  <p className="text-sm text-gray-500">Ko'rish</p>
                </div>
              </Link>

              {/* Grades */}
              <Link
                to="/grades"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ClipboardList
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Baholar jurnali</p>
                  <p className="text-sm text-gray-500">Ko'rish</p>
                </div>
              </Link>

              {/* Add Grades */}
              <Link
                to="/add-grade"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PlusCircle
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Baho qo'yish</p>
                  <p className="text-sm text-gray-500">Boshqarish</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </Card>

      <MySchedules />
      <AllSchedulesToday />
    </div>
  );
};

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI
      .getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "O'quvchilar",
      value: stats.students,
      icon: GraduationCap,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "O'qituvchilar",
      value: stats.teachers,
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Bot foydalanuvchilar",
      value: stats.telegramUsers,
      icon: Bot,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {statItems.map((item, idx) => (
        <Card key={idx} className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${item.color}`}>
            <item.icon className="size-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500">{item.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MySchedules = () => {
  const today = new Date();
  const { user } = useAuth();
  const dayName = getDayOfWeekUZ(today);

  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore("schedules-today");

  const schedules = getCollectionData() || [];
  const loading = isCollectionLoading();

  // Initialize collection (non-paginated)
  useEffect(() => {
    if (!hasCollection()) initialize(false);
  }, [initialize, hasCollection]);

  useEffect(() => {
    if (user?.role === "teacher" && !schedules.length) {
      fetchTodaySchedule();
    }
  }, [user, schedules.length]);

  const fetchTodaySchedule = () => {
    setCollectionLoadingState(true);

    schedulesAPI
      .getMyToday()
      .then((res) => setCollection(res.data.data, null))
      .catch(() => setCollectionErrorState(true));
  };

  // Barcha darslarni bitta ro'yxatga jamlab, order bo'yicha saralash

  console.log(schedules);

  const allLessons = schedules
    .flatMap((schedule) =>
      schedule.subjects.map((subject, index) => ({
        order: subject.order,
        displayOrder:
          (schedule.startingOrder || 1) + (subject.order || index + 1) - 1,
        subjectName: subject.subject.name,
        className: schedule.class.name,
        startTime: subject.startTime,
        endTime: subject.endTime,
      })),
    )
    .sort((a, b) => a.order - b.order);

  // Agar o'qituvchi emas yoki yakshanba bo'lsa ko'rsatmaymiz
  if (user?.role !== "teacher" || dayName === "yakshanba") {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-gray-500">Yuklanmoqda...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Title */}
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Bugungi dars jadvali
      </h3>

      {/* No data */}
      {allLessons.length === 0 && (
        <div className="text-center py-8">
          <BookOpen
            className="size-12 text-gray-300 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Bugun darslar yo'q</p>
        </div>
      )}

      {/* Lessons */}
      {!!allLessons.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {allLessons.map((lesson, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Order */}
              <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-semibold rounded">
                {lesson.displayOrder}
              </span>

              {/* Subject and Time */}
              <div className="grow">
                <p className="text-sm font-medium text-gray-900 sm:text-base">
                  {lesson.subjectName}
                </p>
                {lesson.startTime && lesson.endTime && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lesson.startTime} - {lesson.endTime}
                  </p>
                )}
              </div>

              {/* Class */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap
                  strokeWidth={1.5}
                  className="hidden size-4 sm:inline-block"
                />
                <span>{lesson.className}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

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

  // Initialize collection (non-paginated)
  useEffect(() => {
    if (!hasCollection()) initialize(false);
  }, [initialize, hasCollection]);

  useEffect(() => {
    if (user?.role === "owner" && !schedules.length) {
      fetchAllTodaySchedules();
    }
  }, [user, schedules.length]);

  const fetchAllTodaySchedules = () => {
    setCollectionLoadingState(true);

    schedulesAPI
      .getAllToday()
      .then((res) => setCollection(res.data.data, null))
      .catch(() => setCollectionErrorState(true));
  };

  // Agar owner emas yoki yakshanba bo'lsa ko'rsatmaymiz
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
      <div className="sticky top-16 bg-gray-50 py-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Bugungi barcha sinf dars jadvallari
        </h2>
      </div>

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
          {schedules.map(
            (schedule, idx) => (
              console.log(schedule),
              (
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
              )
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
