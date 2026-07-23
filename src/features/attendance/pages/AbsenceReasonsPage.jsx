// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Plus, Edit, Trash2 } from "lucide-react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { absenceReasonAPI } from "../api/absenceReason.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import CreateAbsenceReasonModal from "../components/CreateAbsenceReasonModal";
import EditAbsenceReasonModal from "../components/EditAbsenceReasonModal";

// Data & hooks
import { getReasonScope } from "../data/absenceReason.data";
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

const AbsenceReasonsPage = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const { getCollectionData } = useArrayStore();
  const roles = getCollectionData("roles") || [];
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["absenceReasons", "list", page],
    queryFn: () => absenceReasonAPI.getAll({ page, limit: 24 }).then((r) => r.data),
  });

  const reasons = data?.data || [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id) => absenceReasonAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absenceReasons"] });
      toast.success("Sabab o'chirildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleDelete = (id) => {
    if (!confirm("Sababni o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-end gap-3">
        <Button onClick={() => openModal("createAbsenceReason")}>
          <Plus />
          Yangi sabab
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : reasons.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">Sabablar topilmadi</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => {
            const scope = getReasonScope(reason, roles);
            return (
              <Card key={reason.id} className="relative" title={reason.title}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {reason.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {reason.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${scope.className}`}
                      >
                        {scope.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openModal("editAbsenceReason", reason)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(reason.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
      <CreateAbsenceReasonModal />
      <EditAbsenceReasonModal />
    </div>
  );
};

export default AbsenceReasonsPage;
