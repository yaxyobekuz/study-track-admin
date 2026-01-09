// Icons
import {
  X,
  Eye,
  Home,
  Menu,
  Users,
  LogOut,
  Calendar,
  BookOpen,
  PlusCircle,
  CalendarDays,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

// Images
import { logoImg } from "@/assets/images";

// React
import { useEffect, useState } from "react";

// Store
import { useAuth } from "../store/authStore";

// Helpers
import { getRoleLabel } from "@/helpers/role.helpers";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectStore from "@/hooks/useObjectStore.hook";

// Utils
import { formatDateUZ, getDayOfWeekUZ } from "@/utils/date.utils";

// Router
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

// API
import { classesAPI, holidaysAPI, subjectsAPI, usersAPI } from "@/api/client";

// Components
import EditUserModal from "../components/modal/editUser.modal";
import EditClassModal from "../components/modal/editClass.modal";
import CreateUserModal from "../components/modal/createUser.modal";
import DeleteUserModal from "../components/modal/deleteUser.modal";
import CreateClassModal from "@/components/modal/createClass.modal";
import DeleteClassModal from "../components/modal/deleteClass.modal";
import EditSubjectModal from "../components/modal/editSubject.modal";
import EditScheduleModal from "../components/modal/editSchedule.modal";
import CreateSubjectModal from "../components/modal/createSubject.modal";
import DeleteSubjectModal from "../components/modal/deleteSubject.modal";
import CreateScheduleModal from "../components/modal/createSchedule.modal";
import DeleteScheduleModal from "../components/modal/deleteSchedule.modal";
import ResetUserPasswordModal from "../components/modal/resetUserPassword.modal";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based navigation
  const getNavigation = () => {
    const baseNav = [{ name: "Bosh sahifa", href: "/", icon: Home }];

    if (user?.role === "owner") {
      return [
        ...baseNav,
        { name: "Foydalanuvchilar", href: "/users", icon: Users },
        { name: "Sinflar", href: "/classes", icon: GraduationCap },
        { name: "Fanlar", href: "/subjects", icon: BookOpen },
        { name: "Dam olish kunlari", href: "/holidays", icon: CalendarDays },
        { name: "Dars jadvali", href: "/schedules", icon: Calendar },
        { name: "Sinf o'quvchilari", href: "/class-students", icon: Users },
        { name: "Baholar jurnali", href: "/grades", icon: Eye },
      ];
    }

    if (user?.role === "teacher") {
      return [
        ...baseNav,
        { name: "Dars jadvali", href: "/schedules", icon: Calendar },
        { name: "Baho qo'yish", href: "/add-grade", icon: PlusCircle },
        { name: "Baholar jurnali", href: "/grades", icon: Eye },
      ];
    }

    if (user?.role === "student") {
      return [
        ...baseNav,
        { name: "Baholarim", href: "/my-grades", icon: ClipboardList },
      ];
    }

    return baseNav;
  };

  const navigation = getNavigation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  actions(user);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out border-r lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  width={40}
                  alt="Logo"
                  height={40}
                  src={logoImg}
                  className="size-10"
                />

                <span className="lg:text-xl font-bold text-gray-900">
                  MBSI School
                </span>
              </div>

              {/* Close sidebar */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="size-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* User Info */}
            <div className="space-y-1 px-6 py-3 border-b border-gray-200">
              <b className="max-w-[195px] text-sm font-medium text-gray-900 truncate">
                {user?.fullName}
              </b>

              <p className="text-xs text-gray-500">
                {getRoleLabel(user?.role)}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="size-5 mr-3" strokeWidth={1.5} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-5 mr-3" strokeWidth={1.5} />
                Chiqish
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 inset-x-0 bg-white h-16 border-b border-gray-200">
            <div className="flex items-center justify-between gap-3.5 h-16 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center size-11 lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="size-6" strokeWidth={1.5} />
              </button>

              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    "MBSI School"}
                </h1>
              </div>

              <p className="">
                <span className="hidden text-sm text-gray-500 sm:inline">
                  {formatDateUZ(new Date())}
                </span>{" "}
                <span className="capitalize text-sm text-gray-500">
                  {getDayOfWeekUZ(new Date())}
                </span>
              </p>
            </div>
          </header>

          {/* Page content */}
          <main className="p-5 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* User Modals */}
      <EditUserModal />
      <DeleteUserModal />
      <CreateUserModal />
      <ResetUserPasswordModal />

      {/* Class Modals */}
      <EditClassModal />
      <CreateClassModal />
      <DeleteClassModal />

      {/* Subject Modals */}
      <EditSubjectModal />
      <CreateSubjectModal />
      <DeleteSubjectModal />

      {/* Schedule Modals */}
      <EditScheduleModal />
      <CreateScheduleModal />
      <DeleteScheduleModal />
    </>
  );
};

const actions = (user) => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore();

  const isOwner = user?.role === "owner";
  const classes = getCollectionData("classes");
  const subjects = getCollectionData("subjects");
  const teachers = getCollectionData("teachers");

  const { addEntity, hasEntity } = useObjectStore("holidayCheck");

  // Initialize collection (pagination = false)
  useEffect(() => {
    if (!hasCollection("classes")) initialize(false, "classes");
    if (!hasCollection("subjects")) initialize(false, "subjects");
    if (!hasCollection("teachers")) initialize(false, "teachers");
  }, [initialize, hasCollection]);

  const fetchClasses = () => {
    setCollectionLoadingState(true, "classes");

    classesAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "classes");
      })
      .catch(() => {
        setCollectionErrorState(true, "classes");
      });
  };

  const fetchSubjects = () => {
    setCollectionLoadingState(true, "subjects");

    subjectsAPI
      .getAll()
      .then((res) => {
        setCollection(res.data.data, null, "subjects");
      })
      .catch(() => {
        setCollectionErrorState(true, "subjects");
      });
  };

  const fetchTeachers = () => {
    setCollectionLoadingState(true, "teachers");

    usersAPI
      .getAll({ role: "teacher" })
      .then((res) => {
        setCollection(res.data.data, null, "teachers");
      })
      .catch(() => {
        setCollectionErrorState(true, "teachers");
      });
  };

  const checkTodayHoliday = () => {
    holidaysAPI
      .checkToday()
      .then((res) => addEntity("today", res.data.data))
      .catch(() => {
        addEntity("today", { isHoliday: false, holiday: null });
      });
  };

  useEffect(() => {
    !classes?.length && fetchClasses();
    !subjects?.length && fetchSubjects();
    !teachers?.length && isOwner && fetchTeachers();
    if (!hasEntity("today")) checkTodayHoliday();
  }, [classes?.length, subjects?.length, teachers?.length]);
};

export default DashboardLayout;
