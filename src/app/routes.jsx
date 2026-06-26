// Layouts
import DashboardLayout from "@/shared/layouts/DashboardLayout";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";

// Pages - Auth
import LoginPage from "@/features/auth/pages/LoginPage";

// Pages - Dashboard
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

// Pages - Profile
import ProfilePage from "@/features/profile/pages/ProfilePage";

// Pages - Users
import UsersPage from "@/features/users/pages/UsersPage";
import CreateUserPage from "@/features/users/pages/CreateUserPage";
import EditUserPage from "@/features/users/pages/EditUserPage";

// Pages - Roles
import RolesPage from "@/features/roles/pages/RolesPage";

// Pages - Classes
import ClassesPage from "@/features/classes/pages/ClassesPage";
import ClassDetailPage from "@/features/classes/pages/ClassDetailPage";

// Pages - Subjects
import SubjectsPage from "@/features/subjects/pages/SubjectsPage";
import TopicsPage from "@/features/subjects/pages/TopicsPage";
import SubjectTopicsPage from "@/features/subjects/pages/SubjectTopicsPage";

// Pages - Grades
import GradesPage from "@/features/grades/pages/GradesPage";
import MissingGradesPage from "@/features/grades/pages/MissingGradesPage";

// Pages - Schedules
import SchedulesPage from "@/features/schedules/pages/SchedulesPage";
import EditSchedulePage from "@/features/schedules/pages/EditSchedulePage";

// Pages - Messages
import MessagesPage from "@/features/messages/pages/MessagesPage";

// Pages - Statistics
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";

// Pages - Holidays
import HolidaysPage from "@/features/holidays/pages/HolidaysPage";

// Pages - Coin Settings
import CoinSettingsPage from "@/features/coin-settings/pages/CoinSettingsPage";

// Pages - Test Settings
import TestSettingsPage from "@/features/test-settings/pages/TestSettingsPage";

// Pages - Schedule Settings
import ScheduleSettingsPage from "@/features/schedule-settings/pages/ScheduleSettingsPage";

// Pages - Coin Distribution
import CoinDistributionPage from "@/features/coin-distribution/pages/CoinDistributionPage";

// Pages - Market
import MarketOrdersPage from "@/features/market/pages/MarketOrdersPage";
import MarketProductsPage from "@/features/market/pages/MarketProductsPage";
import MarketProductEditPage from "@/features/market/pages/MarketProductEditPage";
import MarketProductCreatePage from "@/features/market/pages/MarketProductCreatePage";

// Pages - Social Networks
import SocialNetworksPage from "@/features/social-networks/pages/SocialNetworksPage";

// Pages - Monitors
import MonitorsPage from "@/features/monitors/pages/MonitorsPage";

// Pages - Tasks
import TasksPage from "@/features/tasks/pages/TasksPage";
import TaskDetailPage from "@/features/tasks/pages/TaskDetailPage";

// Pages - Penalties
import PenaltiesPage from "@/features/penalties/pages/PenaltiesPage";
import PenaltyDetailPage from "@/features/penalties/pages/PenaltyDetailPage";
import PenaltyCategoriesPage from "@/features/penalties/pages/PenaltyCategoriesPage";
import PenaltySettingsPage from "@/features/penalties/pages/PenaltySettingsPage";
import ReductionPackagesPage from "@/features/penalties/pages/ReductionPackagesPage";

// Pages - Premium
import PremiumSubscriptionsPage from "@/features/premium/pages/PremiumSubscriptionsPage";
import PremiumSettingsPage from "@/features/premium/pages/PremiumSettingsPage";
import PremiumEmojisPage from "@/features/premium/pages/PremiumEmojisPage";

// Davomat (Attendance) - layouts & route-level pages
import AttendanceLayout from "@/features/attendance/layouts/AttendanceLayout";
import DailyAttendanceLayout from "@/features/attendance/layouts/DailyAttendanceLayout";
import MonthlyAttendanceLayout from "@/features/attendance/layouts/MonthlyAttendanceLayout";
import StudentDailyPage from "@/features/attendance/pages/StudentDailyPage";
import StaffDailyPage from "@/features/attendance/pages/StaffDailyPage";
import StudentMonthlyPage from "@/features/attendance/pages/StudentMonthlyPage";
import StaffMonthlyPage from "@/features/attendance/pages/StaffMonthlyPage";
import ExcuseRequestsPage from "@/features/attendance/pages/ExcuseRequestsPage";
import AttendanceSettingsPage from "@/features/attendance/pages/AttendanceSettingsPage";

// Pages - Leads
import LeadDetailPage from "@/features/leads/pages/LeadDetailPage";
import LeadsListPage from "@/features/leads/pages/LeadsListPage";
import LeadAnalyticsPage from "@/features/leads/pages/LeadAnalyticsPage";

// Pages - Test Seasons
import TestSeasonsPage from "@/features/test-seasons/pages/TestSeasonsPage";
import SeasonAssignmentsPage from "@/features/test-seasons/pages/SeasonAssignmentsPage";
import CreateAssignmentsPage from "@/features/test-seasons/pages/CreateAssignmentsPage";
import SeasonRewardsPage from "@/features/test-seasons/pages/SeasonRewardsPage";
import StudentResultsPage from "@/features/test-seasons/pages/StudentResultsPage";
import ResultAnswersPage from "@/features/test-seasons/pages/ResultAnswersPage";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

const Routes = () => {
  return (
    <RoutesWrapper>
      {/* Guest only routes */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Users */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/new" element={<CreateUserPage />} />
          <Route path="/users/:userId/edit" element={<EditUserPage />} />

          {/* Roles */}
          <Route path="/roles" element={<RolesPage />} />

          {/* Classes */}
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:classId" element={<ClassDetailPage />} />

          {/* Subjects & Topics */}
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route
            path="/subjects/:subjectId/topics"
            element={<SubjectTopicsPage />}
          />

          {/* Grades */}
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/grades/missing" element={<MissingGradesPage />} />

          {/* Schedules */}
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/schedules/:classId" element={<SchedulesPage />} />
          <Route
            path="/schedules/:classId/edit"
            element={<EditSchedulePage />}
          />

          {/* Messages */}
          <Route path="/messages" element={<MessagesPage />} />

          {/* Statistics */}
          <Route path="/statistics" element={<StatisticsPage />} />

          {/* Holidays */}
          <Route path="/holidays" element={<HolidaysPage />} />

          {/* Coin Settings */}
          <Route path="/coin-settings" element={<CoinSettingsPage />} />

          {/* Coin Distribution */}
          <Route path="/coin-distribution" element={<CoinDistributionPage />} />

          {/* Market */}
          <Route path="/market/products" element={<MarketProductsPage />} />
          <Route
            path="/market/products/new"
            element={<MarketProductCreatePage />}
          />
          <Route
            path="/market/products/:productId/edit"
            element={<MarketProductEditPage />}
          />
          <Route path="/market/orders" element={<MarketOrdersPage />} />

          {/* Social Networks */}
          <Route path="/social-networks" element={<SocialNetworksPage />} />

          {/* Monitors */}
          <Route path="/monitors" element={<MonitorsPage />} />

          {/* Tasks */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

          {/* Penalties */}
          <Route path="/penalties" element={<PenaltiesPage />} />
          <Route
            path="/penalties/categories"
            element={<PenaltyCategoriesPage />}
          />
          <Route path="/penalties/settings" element={<PenaltySettingsPage />} />
          <Route
            path="/penalties/reduction-packages"
            element={<ReductionPackagesPage />}
          />
          <Route path="/penalties/:penaltyId" element={<PenaltyDetailPage />} />

          {/* Premium */}
          <Route path="/premium" element={<PremiumSubscriptionsPage />} />
          <Route path="/premium/emojis" element={<PremiumEmojisPage />} />
          <Route path="/premium/settings" element={<PremiumSettingsPage />} />

          {/* Davomat - yagona layout + route-darajali sahifalar */}
          <Route path="/attendance" element={<AttendanceLayout />}>
            <Route
              index
              element={<Navigate to="/attendance/daily" replace />}
            />

            {/* Kunlik davomat (O'quvchilar / Xodimlar) */}
            <Route path="daily" element={<DailyAttendanceLayout />}>
              <Route
                index
                element={<Navigate to="/attendance/daily/students" replace />}
              />
              <Route path="students" element={<StudentDailyPage />} />
              <Route path="staff" element={<StaffDailyPage />} />
            </Route>

            {/* Oylik davomat (O'quvchilar / Xodimlar) */}
            <Route path="monthly" element={<MonthlyAttendanceLayout />}>
              <Route
                index
                element={<Navigate to="/attendance/monthly/students" replace />}
              />
              <Route path="students" element={<StudentMonthlyPage />} />
              <Route path="staff" element={<StaffMonthlyPage />} />
            </Route>

            {/* Uzrli so'rovlar */}
            <Route path="excuses" element={<ExcuseRequestsPage />} />

            {/* Sozlamalar */}
            <Route path="settings" element={<AttendanceSettingsPage />} />
          </Route>

          {/* Eski yo'llardan yangi yo'llarga yo'naltirish (backward-compat) */}
          <Route
            path="/attendance/today"
            element={<Navigate to="/attendance/daily/staff" replace />}
          />
          <Route
            path="/student-attendance"
            element={<Navigate to="/attendance/monthly/students" replace />}
          />
          <Route
            path="/student-attendance/today"
            element={<Navigate to="/attendance/daily/students" replace />}
          />

          {/* Leads */}
          <Route path="/leads" element={<LeadsListPage />} />
          <Route path="/leads/analytics" element={<LeadAnalyticsPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailPage />} />

          {/* Test Settings */}
          <Route path="/test-settings" element={<TestSettingsPage />} />

          {/* Schedule Settings */}
          <Route
            path="/schedule-settings"
            element={<ScheduleSettingsPage />}
          />

          {/* Test Seasons */}
          <Route path="/test-seasons" element={<TestSeasonsPage />} />
          <Route
            path="/test-seasons/:id/assignments"
            element={<SeasonAssignmentsPage />}
          />
          <Route
            path="/test-seasons/:id/assignments/create"
            element={<CreateAssignmentsPage />}
          />
          <Route
            path="/test-seasons/:id/rewards"
            element={<SeasonRewardsPage />}
          />
          <Route
            path="/test-seasons/results/:resultId"
            element={<ResultAnswersPage />}
          />
          <Route
            path="/test-seasons/:seasonId/students/:studentId/results"
            element={<StudentResultsPage />}
          />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
