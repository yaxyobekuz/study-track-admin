// UI
import { Toaster } from "sonner";

// Pages
import Login from "./pages/Login";
import Users from "./pages/Users";
import Topics from "./pages/Topics";
import Grades from "./pages/Grades";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import AddGrade from "./pages/AddGrade";
import Holidays from "./pages/Holidays";
import Messages from "./pages/Messages";
import Schedules from "./pages/Schedules";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import ClassDetail from "./pages/ClassDetail";
import MissingGrades from "./pages/MissingGrades";
import SubjectTopics from "./pages/SubjectTopics";
import TeacherMessages from "./pages/TeacherMessages";

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
            <ProtectedRoute allowedRoles={["owner", "teacher"]}>
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
            path="classes/:classId"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <ClassDetail />
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
            path="topics"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Topics />
              </ProtectedRoute>
            }
          />
          <Route
            path="subjects/:subjectId/topics"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <SubjectTopics />
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
            path="statistics"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades/missing"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <MissingGrades />
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
          <Route
            path="messages"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-messages"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherMessages />
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
