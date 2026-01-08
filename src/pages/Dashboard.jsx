// React
import { useState, useEffect } from "react";

// Icons
import {
  Users,
  BookOpen,
  PartyPopper,
  PlusCircle,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

// Components
import Card from "@/components/Card";

// Router
import { Link } from "react-router-dom";

// Store
import { useAuth } from "../store/authStore";

// Helpers
import { getRoleLabel } from "@/helpers/role.helpers";

// API
import { holidaysAPI } from "@/api/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [holidayInfo, setHolidayInfo] = useState({
    isHoliday: false,
    holiday: null,
  });
  const [checkingHoliday, setCheckingHoliday] = useState(true);

  // Sahifa yuklanganda dam olish kunini tekshirish
  useEffect(() => {
    checkTodayHoliday();
  }, []);

  const checkTodayHoliday = async () => {
    try {
      const response = await holidaysAPI.checkToday();
      setHolidayInfo(response.data.data);
    } catch (error) {
      console.error("Holiday check error:", error);
    } finally {
      setCheckingHoliday(false);
    }
  };

  return (
    <div>
      {/* Holiday Banner */}
      {!checkingHoliday && holidayInfo.isHoliday && (
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
                🎉 Bugun bayram kuni!
              </h3>
              <p className="text-orange-700 font-medium mt-1">
                {holidayInfo.holiday?.name}
              </p>
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
      <Card>
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
    </div>
  );
};

export default Dashboard;
