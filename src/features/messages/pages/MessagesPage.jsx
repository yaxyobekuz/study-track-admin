// Router
import { useSearchParams } from "react-router-dom";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Queries
import { messagesQueries } from "@/features/messages/queries/messages.queries";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useTeachers } from "@/features/users/queries/users.queries";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useCallback } from "react";

// Icons
import { Plus, Eye, Ban } from "lucide-react";

// Recipient type options
const recipientTypeOptions = [
  { value: "all_type", label: "Barchasi" },
  { value: "all", label: "Maktab" },
  { value: "class", label: "Sinf" },
  { value: "student", label: "O'quvchi" },
];

const Messages = () => {
  const { openModal } = useModal();

  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const recipientTypeFilter = searchParams.get("recipientType") || "";
  const sentByFilter = searchParams.get("sentBy") || "";
  const classIdFilter = searchParams.get("classId") || "";

  // Reference data (deduped/cached app-wide)
  const { data: roles = [] } = useRoles();
  const { data: teachers = [] } = useTeachers();
  const { data: classes = [] } = useClasses();

  // Handle recipient type filter change
  const handleRecipientTypeChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all_type") {
        params.set("recipientType", value);
      } else {
        params.delete("recipientType");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Handle sent by filter change
  const handleSentByChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set("sentBy", value);
      } else {
        params.delete("sentBy");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Handle class filter change
  const handleClassChange = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set("classId", value);
      } else {
        params.delete("classId");
      }
      params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Messages list (server-paginated). TanStack keeps the previous page's rows
  // on screen while the next page loads (placeholderData: keepPreviousData).
  const { data, isLoading, isError } = useQuery(
    messagesQueries.list({
      page: currentPage,
      limit: 20,
      ...(recipientTypeFilter && { recipientType: recipientTypeFilter }),
      ...(sentByFilter && { sentBy: sentByFilter }),
      ...(classIdFilter && { classId: classIdFilter }),
    }),
  );

  const messages = data?.data ?? [];
  const pagination = data?.pagination;

  // Navigate to page
  const goToPage = useCallback(
    (page) => {
      if (page < 1) return;
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Get recipient type label
  const getRecipientTypeLabel = (type) => {
    const labels = {
      all: "Barchaga",
      class: "Sinfga",
      student: "O'quvchiga",
    };
    return labels[type] || type;
  };

  // Get status badge color
  const getStatusColor = (stats) => {
    if (stats.totalPending > 0) {
      return "bg-yellow-100 text-yellow-800";
    } else if (stats.totalFailed > 0) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-green-100 text-green-800";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between gap-4 mb-4">
        {/* Title */}
        <h1 className="page-title">Xabalar</h1>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recipient Type Filter */}
          <Select
            placeholder="Qabul qiluvchi"
            options={recipientTypeOptions}
            onChange={handleRecipientTypeChange}
            value={recipientTypeFilter || "all_type"}
          />

          {/* Sent By Filter */}
          <Select
            placeholder="Yuboruvchi"
            onChange={handleSentByChange}
            value={sentByFilter || "all"}
            options={[
              { value: "all", label: "Barcha yuboruvchilar" },
              ...teachers.map((t) => ({
                value: t.id,
                label: t.fullName,
              })),
            ]}
          />

          {/* Class Filter */}
          <Select
            placeholder="Sinf"
            onChange={handleClassChange}
            value={classIdFilter || "all"}
            options={[
              { value: "all", label: "Barcha sinflar" },
              ...classes.map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />

          {/* Create New Btn */}
          <Button onClick={() => openModal("sendMessage")}>
            <Plus strokeWidth={1.5} />
            Yangi xabar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="rounded-lg overflow-x-auto">
          <table>
            {/* Thead */}
            <thead>
              <tr>
                <th>Xabar</th>
                <th>Yuboruvchi</th>
                <th>Kimga</th>
                <th>Status</th>
                <th>Sana</th>
                <th>Harakatlar</th>
              </tr>
            </thead>

            {/* Tbody */}
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Xabarlar topilmadi
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    {/* Message Text */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.messageText}
                      </div>
                    </td>

                    {/* Sent By */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {message.sentBy?.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getRoleLabel(message.sentBy?.role, roles)}
                      </div>
                    </td>

                    {/* Recipient Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getRecipientTypeLabel(message.recipientType)}
                      </div>
                      {message.classId && (
                        <div className="text-xs text-gray-500">
                          {message.classId.name}
                        </div>
                      )}
                      {message.studentId && (
                        <div className="text-xs text-gray-500">
                          {message.studentId.fullName}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`${getStatusColor(
                          message.stats,
                        )} px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full`}
                      >
                        {message.stats.totalSent}/{message.totalRecipients}
                      </span>
                      {message.stats.totalFailed > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {message.stats.totalFailed} xato
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString(
                          "uz-UZ",
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString(
                          "uz-UZ",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3.5">
                        <button
                          onClick={() => openModal("messageDetails", message)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Batafsil"
                        >
                          <Eye className="size-5" strokeWidth={1.5} />
                        </button>

                        {message.stats.totalPending > 0 && (
                          <button
                            onClick={() => openModal("cancelMessage", message)}
                            className="text-red-600 hover:text-red-900"
                            title="Yuborishni to'xtatish"
                          >
                            <Ban className="size-5" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination Controls */}
        {!isLoading && !isError && messages.length > 0 && (
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={pagination?.hasNextPage}
            hasPrevPage={pagination?.hasPrevPage}
            className="pt-6 max-md:hidden"
            totalPages={pagination?.totalPages || 1}
          />
        )}
      </div>

      {/* Mobile Pagination Controls */}
      {!isLoading && !isError && messages.length > 0 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={pagination?.hasNextPage}
            hasPrevPage={pagination?.hasPrevPage}
            className="pt-6 min-w-max md:hidden"
            totalPages={pagination?.totalPages || 1}
          />
        </div>
      )}
    </div>
  );
};

export default Messages;
