// React
import { useEffect, useState } from "react";

// Icons
import { Users, GraduationCap, BookOpen, ClipboardList } from "lucide-react";

// Store
import { useAuth } from "../store/authStore";

// Components
import Card from "@/components/Card";

// API
import { usersAPI, classesAPI, subjectsAPI, gradesAPI } from "../api/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    classes: 0,
    subjects: 0,
    grades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (user?.role === "owner") {
        const [usersRes, classesRes, subjectsRes, gradesRes] =
          await Promise.all([
            usersAPI.getAll(),
            classesAPI.getAll(),
            subjectsAPI.getAll(),
            gradesAPI.getAll(),
          ]);

        setStats({
          users: usersRes.data.count || 0,
          classes: classesRes.data.count || 0,
          subjects: subjectsRes.data.count || 0,
          grades: gradesRes.data.count || 0,
        });
      }
    } catch (error) {
      console.error("Statistikani yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      owner: "Ega",
      teacher: "O'qituvchi",
      student: "O'quvchi",
    };
    return labels[role] || role;
  };

  const statsCards = [
    {
      name: "Foydalanuvchilar",
      value: stats.users,
      icon: Users,
      color: "bg-blue-500",
      show: user?.role === "owner",
    },
    {
      name: "Sinflar",
      value: stats.classes,
      icon: GraduationCap,
      color: "bg-green-500",
      show: user?.role === "owner",
    },
    {
      name: "Fanlar",
      value: stats.subjects,
      icon: BookOpen,
      color: "bg-purple-500",
      show: user?.role === "owner",
    },
    {
      name: "Baholar",
      value: stats.grades,
      icon: ClipboardList,
      color: "bg-orange-500",
      show: user?.role === "owner",
    },
  ].filter((card) => card.show);

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Xush kelibsiz, {user?.firstName}!
        </h2>
        <p className="mt-2 text-gray-600">
          Rolingiz:{" "}
          <span className="font-medium">{getRoleLabel(user?.role)}</span>
        </p>
      </div>

      {/* Stats Cards - Faqat Owner uchun */}
      {user?.role === "owner" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow p-6 animate-pulse"
                >
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </>
          ) : (
            statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.name}>
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}
                    >
                      <Icon className="size-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tezkor harakatlar
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {user?.role === "owner" && (
            <>
              <a
                href="/users"
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
              </a>
              <a
                href="/classes"
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
              </a>
              <a
                href="/schedules"
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
              </a>
            </>
          )}

          {user?.role === "teacher" && (
            <>
              <a
                href="/my-schedule"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Dars jadvalim</p>
                  <p className="text-sm text-gray-500">Ko'rish</p>
                </div>
              </a>
              <a
                href="/grades"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ClipboardList
                  className="size-6 text-indigo-600 mr-3"
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-medium text-gray-900">Baholar</p>
                  <p className="text-sm text-gray-500">Boshqarish</p>
                </div>
              </a>
            </>
          )}

          {user?.role === "student" && (
            <a
              href="/my-grades"
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
            </a>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
