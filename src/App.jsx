// UI
import { Toaster } from "sonner";

// Pages
import Login from "./pages/Login";
import Users from "./pages/Users";
import Grades from "./pages/Grades";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import AddGrade from "./pages/AddGrade";
import MyGrades from "./pages/MyGrades";
import Holidays from "./pages/Holidays";
import Schedules from "./pages/Schedules";
import Dashboard from "./pages/Dashboard";
import ClassStudents from "./pages/ClassStudents";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Store
import { AuthProvider, useAuth } from "./store/authStore";

// Router
import { Routes, Route, Navigate } from "react-router-dom";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Owner routes */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="classes"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="subjects"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Subjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="holidays"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Holidays />
              </ProtectedRoute>
            }
          />
          <Route
            path="class-students"
            element={
              <ProtectedRoute allowedRoles={["owner", "teacher"]}>
                <ClassStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="schedules"
            element={
              <ProtectedRoute allowedRoles={["owner", "teacher"]}>
                <Schedules />
              </ProtectedRoute>
            }
          />

          {/* Teacher routes */}
          <Route
            path="add-grade"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AddGrade />
              </ProtectedRoute>
            }
          />

          {/* Owner and Teacher routes */}
          <Route
            path="grades"
            element={
              <ProtectedRoute allowedRoles={["owner", "teacher"]}>
                <Grades />
              </ProtectedRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="my-grades"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <MyGrades />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        richColors
        position="top-right"
        offset={{ top: 72 }}
        mobileOffset={{ top: 72 }}
      />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
