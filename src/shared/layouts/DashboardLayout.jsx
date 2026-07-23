// Router
import { Outlet } from "react-router-dom";

// Components
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/components/shadcn/sidebar";
import AppHeader from "@/shared/components/layout/AppHeader";
import AppSidebar from "@/shared/components/layout/AppSidebar";
import MainBackgroundPatterns from "../components/bg/MainBackgroundPatterns";

// Modals
import EditClassModal from "@/features/classes/components/EditClassModal";
import DeleteUserModal from "@/features/users/components/DeleteUserModal";
import ArchiveUserModal from "@/features/users/components/ArchiveUserModal";
import RestoreUserModal from "@/features/users/components/RestoreUserModal";
import ExportUsersModal from "@/features/users/components/ExportUsersModal";
import CreateClassModal from "@/features/classes/components/CreateClassModal";
import DeleteClassModal from "@/features/classes/components/DeleteClassModal";
import AddStudentsToClassModal from "@/features/classes/components/AddStudentsToClassModal";
import MoveClassStudentsModal from "@/features/classes/components/MoveClassStudentsModal";
import RemoveClassStudentsModal from "@/features/classes/components/RemoveClassStudentsModal";
import EditSubjectModal from "@/features/subjects/components/EditSubjectModal";
import SendMessageModal from "@/features/messages/components/SendMessageModal";
import UploadTopicsModal from "@/features/subjects/components/UploadTopicsModal";
import CreateSubjectModal from "@/features/subjects/components/CreateSubjectModal";
import DeleteSubjectModal from "@/features/subjects/components/DeleteSubjectModal";
import DeleteProductModal from "@/features/market/components/DeleteProductModal";
import MessageDetailsModal from "@/features/messages/components/MessageDetailsModal";
import CancelMessageModal from "@/features/messages/components/CancelMessageModal";
import ViewUserPasswordModal from "@/features/users/components/ViewUserPasswordModal";
import ResetUserPasswordModal from "@/features/users/components/ResetUserPasswordModal";
import UpdateOrderStatusModal from "@/features/market/components/UpdateOrderStatusModal";
import AddDeliveryImageModal from "@/features/market/components/AddDeliveryImageModal";
import StudentStatisticsModal from "@/features/statistics/components/StudentStatisticsModal";
import CreateRoleModal from "@/features/roles/components/CreateRoleModal";
import EditRoleModal from "@/features/roles/components/EditRoleModal";
import DeleteRoleModal from "@/features/roles/components/DeleteRoleModal";
import ReviewExcuseModal from "@/features/attendance/components/ReviewExcuseModal";
import BugReport from "../components/layout/BugReport";

const DashboardLayout = () => {
  return (
    <>
      {/* Main */}
      <SidebarProvider className="relative z-10">
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 md:py-2">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Bug Report */}
      <BugReport />

      {/* Background Patterns */}
      <MainBackgroundPatterns />

      {/* User Modals */}
      <DeleteUserModal />
      <ArchiveUserModal />
      <RestoreUserModal />
      <ResetUserPasswordModal />
      <ViewUserPasswordModal />
      <ExportUsersModal />

      {/* Class Modals */}
      <EditClassModal />
      <CreateClassModal />
      <DeleteClassModal />
      <AddStudentsToClassModal />
      <MoveClassStudentsModal />
      <RemoveClassStudentsModal />

      {/* Subject Modals */}
      <EditSubjectModal />
      <CreateSubjectModal />
      <DeleteSubjectModal />

      {/* Message Modals */}
      <SendMessageModal />
      <MessageDetailsModal />
      <CancelMessageModal />

      {/* Topic Modals */}
      <UploadTopicsModal />

      {/* Market */}
      <DeleteProductModal />
      <UpdateOrderStatusModal />
      <AddDeliveryImageModal />

      {/* Roles */}
      <CreateRoleModal />
      <EditRoleModal />
      <DeleteRoleModal />

      {/* Attendance */}
      <ReviewExcuseModal />

      {/* Stats */}
      <StudentStatisticsModal />
    </>
  );
};

export default DashboardLayout;
