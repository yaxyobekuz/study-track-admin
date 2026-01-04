// Icons
import {
  X,
  Eye,
  Home,
  Menu,
  User,
  Users,
  LogOut,
  Calendar,
  BookOpen,
  PlusCircle,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

// Images
import { logoImg } from "@/assets/images";

// React
import { useEffect, useState } from "react";

// Store
import { useAuth } from "../store/authStore";

// Utils
import { formatDateUZ } from "@/utils/date.utils";

// Helpers
import { getRoleLabel } from "@/helpers/role.helpers";

// Hooks
import useArrayStore from "@/hooks/useArrayStore.hook";

// API
import { classesAPI, subjectsAPI } from "@/api/client";

// Router
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

// Components
import EditUserModal from "../components/modal/editUser.modal";
import EditClassModal from "../components/modal/editClass.modal";
import CreateUserModal from "../components/modal/createUser.modal";
import DeleteUserModal from "../components/modal/deleteUser.modal";
import CreateClassModal from "@/components/modal/createClass.modal";
import DeleteClassModal from "../components/modal/deleteClass.modal";
import EditSubjectModal from "../components/modal/editSubject.modal";
import CreateSubjectModal from "../components/modal/createSubject.modal";
import DeleteSubjectModal from "../components/modal/deleteSubject.modal";
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
        { name: "Dars jadvali", href: "/schedules", icon: Calendar },
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

  actions();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
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
                <span className="text-xl font-bold text-gray-900">
                  Study Tracker
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="size-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User
                      className="size-6 text-indigo-600"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                <div className="ml-3">
                  <p className="max-w-[155px] text-sm font-medium text-gray-900 truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleLabel(user?.role)}
                  </p>
                </div>
              </div>
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
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="size-6" strokeWidth={1.5} />
              </button>

              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find((item) => isActive(item.href))?.name ||
                    "Study Tracker"}
                </h1>
              </div>

              <div className="hidden lg:flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {formatDateUZ(new Date())}
                </span>
              </div>
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
    </>
  );
};

const actions = () => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    setCollectionErrorState,
    setCollectionLoadingState,
  } = useArrayStore();
  const classes = getCollectionData("classes");
  const subjects = getCollectionData("subjects");

  // Initialize collection (pagination = false)
  useEffect(() => {
    if (!hasCollection("classes")) initialize(false, "classes");
    if (!hasCollection("subjects")) initialize(false, "subjects");
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

  useEffect(() => {
    !classes?.length && fetchClasses();
    !subjects?.length && fetchSubjects();
  }, [classes?.length, subjects?.length]);
};

export default DashboardLayout;
