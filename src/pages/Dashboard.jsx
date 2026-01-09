// Icons
import {
  Users,
  BookOpen,
  PlusCircle,
  PartyPopper,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

// Components
import Card from "@/components/Card";

// Router
import { Link } from "react-router-dom";

// API
import { schedulesAPI } from "@/api/client";

// React
import { useState, useEffect } from "react";

// Store
import { useAuth } from "../store/authStore";

// Utils
import { getDayOfWeekUZ } from "@/utils/date.utils";

// Helpers
import { getRoleLabel } from "@/helpers/role.helpers";

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

          {user?.role === "student" && (
            // My Grades
            <Link
              to="/my-grades"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ClipboardList
                className="size-6 text-indigo-600 mr-3"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-medium text-gray-900">Baholarim</p>
                <p className="text-sm text-gray-500">Ko'rish</p>
              </div>
            </Link>
          )}
        </div>
      </Card>

      <MySchedules />
      <AllSchedulesToday />
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
  const allLessons = schedules
    .flatMap((schedule) =>
      schedule.subjects.map((subject) => ({
        order: subject.order,
        subjectName: subject.subject.name,
        className: schedule.class.name,
      }))
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
                {lesson.order}
              </span>

              {/* Subject */}
              <p className="text-sm grow font-medium text-gray-900 sm:text-base">
                {lesson.subjectName}
              </p>

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
    <div className="mt-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                {schedule.subjects?.map((subj, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Title */}
                    <b className="text-sm font-medium text-gray-900">
                      {subj.order}. {subj.subject?.name}
                    </b>

                    {/* Teacher */}
                    <p className="text-xs text-gray-600">
                      {subj.teacher?.firstName}{" "}
                      {subj.teacher?.lastName?.slice(0, 1) + "."}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
