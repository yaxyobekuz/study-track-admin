// Toast
import { toast } from "sonner";

// API
import { messagesAPI } from "@/shared/api/messages.api";
import { classesAPI } from "@/shared/api/classes.api";

// Router
import { useSearchParams } from "react-router-dom";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/form/button";
import Select from "@/shared/components/form/select";
import Pagination from "@/shared/components/ui/Pagination";

// React
import { useEffect, useCallback, useState } from "react";

// Icons
import { Plus, Eye } from "lucide-react";

// Recipient type options
const recipientTypeOptions = [
  { value: "all_type", label: "Barchasi" },
  { value: "all", label: "Maktab" },
  { value: "class", label: "Sinf" },
  { value: "student", label: "O'quvchi" },
];

const TeacherMessages = () => {
  const { openModal } = useModal();

  // Search params
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const recipientTypeFilter = searchParams.get("recipientType") || "";
  const classIdFilter = searchParams.get("classId") || "";

  // State for classes
  const [classes, setClasses] = useState([]);

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

  const {
    setPage,
    initialize,
    getMetadata,
    getPageData,
    hasCollection,
    setPageErrorState,
    setPageLoadingState,
  } = useArrayStore("teacherMessages");

  // Initialize collection on mount
  useEffect(() => {
    if (!hasCollection()) initialize(true); // pagination = true
  }, [hasCollection, initialize]);

  const metadata = getMetadata();
  const pageData = getPageData(currentPage);

  const messages = pageData?.data || [];
  const hasError = pageData?.error || null;
  const isLoading = pageData?.isLoading || false;
  const hasNextPage = pageData?.hasNextPage ?? false;
  const hasPrevPage = pageData?.hasPrevPage ?? false;

  // Load messages for current page
  const fetchMessages = useCallback(
    (page, recipientType, classId) => {
      setPageLoadingState(page, true);
      const params = { page, limit: 20 };
      if (recipientType) params.recipientType = recipientType;
      if (classId) params.classId = classId;

      messagesAPI
        .getAll(params)
        .then((res) => {
          const { data, pagination } = res.data;
          setPage(page, data, null, pagination);
        })
        .catch(({ message }) => {
          toast.error(message || "Nimadir xato ketdi");
          setPageErrorState(page, message || "Nimadir xato ketdi");
        });
    },
    [setPageLoadingState, setPage, setPageErrorState],
  );

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

  // Load messages when page or filters change
  useEffect(() => {
    fetchMessages(currentPage, recipientTypeFilter, classIdFilter);
  }, [currentPage, recipientTypeFilter, classIdFilter, messages?.length]);

  // Load classes for filter
  useEffect(() => {
    classesAPI
      .getAll()
      .then((res) => {
        setClasses(res.data.data || []);
      })
      .catch(() => {
        toast.error("Sinflarni yuklashda xato");
      });
  }, []);

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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Create New Btn */}
        <Button onClick={() => openModal("sendMessage")} className="px-3.5">
          <Plus className="size-5 mr-2" strokeWidth={1.5} />
          Yangi xabar
        </Button>

        {/* Recipient Type Filter */}
        <Select
          size="lg"
          options={recipientTypeOptions}
          placeholder="Qabul qiluvchi"
          onChange={handleRecipientTypeChange}
          value={recipientTypeFilter || "all_type"}
          className="w-full sm:w-44"
        />

        {/* Class Filter */}
        <Select
          size="lg"
          options={[
            { value: "all", label: "Barcha sinflar" },
            ...classes.map((c) => ({
              value: c._id,
              label: c.name,
            })),
          ]}
          placeholder="Sinf"
          onChange={handleClassChange}
          value={classIdFilter || "all"}
          className="w-full sm:w-44"
        />
      </div>

      {/* Table */}
      <Card responsive>
        <div className="rounded-lg overflow-x-auto">
          <table className="divide-y divide-gray-200">
            {/* Thead */}
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Xabar</th>
                <th className="px-6 py-3 text-left">Kimga</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Sana</th>
                <th className="px-6 py-3 text-right">Harakatlar</th>
              </tr>
            </thead>

            {/* Tbody */}
            <tbody className="divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Xabarlar topilmadi
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message._id} className="hover:bg-gray-50">
                    {/* Message Text */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.messageText}
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
                      <button
                        onClick={() => openModal("messageDetails", message)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Batafsil"
                      >
                        <Eye className="size-5" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination Controls */}
        {!isLoading && !hasError && messages.length > 0 && (
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            className="pt-6 max-md:hidden"
            totalPages={metadata?.totalPages || 1}
          />
        )}
      </Card>

      {/* Mobile Pagination Controls */}
      {!isLoading && !hasError && messages.length > 0 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers={true}
            onPageChange={goToPage}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            className="pt-6 min-w-max md:hidden"
            totalPages={metadata?.totalPages || 1}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherMessages;
