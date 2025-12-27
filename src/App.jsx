import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./store/authStore";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Schedules from "./pages/Schedules";
import Grades from "./pages/Grades";
import MyGrades from "./pages/MyGrades";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

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
            path="schedules"
            element={
              <ProtectedRoute allowedRoles={["owner", "teacher"]}>
                <Schedules />
              </ProtectedRoute>
            }
          />
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

      <Toaster position="top-right" richColors />
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
