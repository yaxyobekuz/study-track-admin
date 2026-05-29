// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useParams } from "react-router-dom";

// API
import { teacherAssignmentsAPI } from "../api/teacherAssignments.api";
import { testSeasonsAPI } from "../api/testSeasons.api";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Icons
import { Plus, Trash2, Edit, ArrowLeft, Users as UsersIcon } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

import AssignmentForm from "../components/AssignmentForm";
import DeleteAssignmentForm from "../components/DeleteAssignmentForm";

// Data
import {
  SEASON_STATUS_LABELS,
  SEASON_STATUS_COLORS,
} from "../data/seasonStatuses.data";

const SeasonAssignmentsPage = () => {
  const { id: seasonId } = useParams();
  const { openModal } = useModal();
  const collectionName = `seasonAssignments-${seasonId}`;

  // Biriktiruvlar ro'yxati (holidays pattern)
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();

  const assignments = getCollectionData(collectionName);
  const isLoading = isCollectionLoading(collectionName);

  // Mavsum ma'lumotlari (TanStack Query — admin CLAUDE.md tavsiya etadi)
  const { data: season, isLoading: seasonLoading } = useQuery({
    queryKey: ["test-season", seasonId],
    queryFn: () =>
      testSeasonsAPI.getOne(seasonId).then((res) => res.data.data),
  });

  useEffect(() => {
    if (!hasCollection(collectionName)) initialize(false, collectionName);
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  const fetchAssignments = async () => {
    try {
      setCollectionLoadingState(true, collectionName);
      const res = await teacherAssignmentsAPI.getAll({
        season: seasonId,
        limit: 200,
      });
      setCollection(res.data.data, null, collectionName);
    } catch (error) {
      toast.error("Biriktiruvlarni yuklashda xatolik");
      setCollection([], true, collectionName);
    }
  };

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/test-seasons">
            <Button variant="secondary" className="size-9 p-0">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="page-title">
              {seasonLoading
                ? "Yuklanmoqda..."
                : season?.name || "Mavsum"}{" "}
              — biriktiruvlar
            </h1>
            {season && (
              <p className="text-sm text-gray-600 mt-1">
                <span
                  className={`inline-flex px-2 py-0.5 mr-2 text-xs font-semibold rounded-full ${
                    SEASON_STATUS_COLORS[season.status] || "bg-gray-100"
                  }`}
                >
                  {SEASON_STATUS_LABELS[season.status]}
                </span>
                {formatDateUZ(season.startDate)} —{" "}
                {formatDateUZ(season.endDate)}
              </p>
            )}
          </div>
        </div>

        <Button onClick={() => openModal("createAssignment", { seasonId })}>
          <Plus strokeWidth={1.5} />
          Biriktiruv qo'shish
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8">Yuklanmoqda...</div>
      ) : assignments.length === 0 ? (
        <Card className="text-center py-8">
          <UsersIcon
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">
            Bu mavsum uchun biriktiruvlar yo'q. Qo'shing.
          </p>
        </Card>
      ) : (
        <div className="rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>#</th>
                <th>Sinf</th>
                <th>Fan</th>
                <th>O'qituvchi</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((a, index) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="text-center text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="text-center text-sm font-medium">
                    {a.class?.name || "—"}
                  </td>
                  <td className="text-center text-sm">{a.subject?.name || "—"}</td>
                  <td className="text-center text-sm">
                    {a.teacher
                      ? `${a.teacher.firstName} ${a.teacher.lastName || ""}`.trim()
                      : "—"}
                  </td>
                  <td className="text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        a.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {a.isActive ? "Aktiv" : "Noaktiv"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          openModal("editAssignment", { ...a, seasonId })
                        }
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => openModal("deleteAssignment", a)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <ResponsiveModal name="createAssignment" title="Yangi biriktiruv">
        <AssignmentForm onSuccess={fetchAssignments} />
      </ResponsiveModal>

      <ResponsiveModal name="editAssignment" title="Biriktiruvni tahrirlash">
        <AssignmentForm isEdit onSuccess={fetchAssignments} />
      </ResponsiveModal>

      <ResponsiveModal
        name="deleteAssignment"
        title="Biriktiruvni o'chirish"
        description="Haqiqatdan ham biriktiruvni o'chirmoqchimisiz?"
      >
        <DeleteAssignmentForm onSuccess={fetchAssignments} />
      </ResponsiveModal>
    </div>
  );
};

export default SeasonAssignmentsPage;
