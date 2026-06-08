// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Router
import { Link } from "react-router-dom";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Icons
import {
  Plus,
  Trash2,
  Edit,
  Megaphone,
  MoreVertical,
  CalendarRange,
  Users as UsersIcon,
  Coins,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/shadcn/dropdown-menu";

import SeasonForm from "../components/SeasonForm";
import DeleteSeasonForm from "../components/DeleteSeasonForm";
import AnnounceSeasonModal from "../components/AnnounceSeasonModal";

// Data
import {
  SEASON_STATUS_LABELS,
  SEASON_STATUS_COLORS,
} from "../data/seasonStatuses.data";

const TestSeasonsPage = () => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();

  const { openModal } = useModal();
  const seasons = getCollectionData("testSeasons");
  const isLoading = isCollectionLoading("testSeasons");

  useEffect(() => {
    if (!hasCollection("testSeasons")) {
      initialize(false, "testSeasons");
    }
    if (!seasons?.length) fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setCollectionLoadingState(true, "testSeasons");
      const response = await testSeasonsAPI.getAll({ limit: 100 });
      setCollection(response.data.data, null, "testSeasons");
    } catch (error) {
      toast.error("Mavsumlarni yuklashda xatolik");
      setCollection([], true, "testSeasons");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title">Test mavsumlari</h1>

        <Button onClick={() => openModal("createSeason", null)}>
          <Plus strokeWidth={1.5} />
          Qo'shish
        </Button>
      </div>

      {/* List */}
      {seasons.length === 0 ? (
        <Card className="text-center py-8">
          <CalendarRange
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Test mavsumlari mavjud emas</p>
        </Card>
      ) : (
        <div className="rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>#</th>
                <th>Nomi</th>
                <th>Sanalar</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>

            <tbody>
              {seasons.map((season, index) => (
                <tr key={season._id} className="hover:bg-gray-50">
                  <td className="text-center text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="text-center text-sm font-medium">
                    {season.name}
                    {season.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {season.description}
                      </div>
                    )}
                  </td>

                  <td className="text-center text-sm text-gray-500">
                    {formatDateUZ(season.startDate)} -{" "}
                    {formatDateUZ(season.endDate)}
                  </td>

                  <td className="text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        SEASON_STATUS_COLORS[season.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {SEASON_STATUS_LABELS[season.status]}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            title="Amallar"
                            className="inline-flex items-center justify-center size-8 rounded-lg text-gray-600 hover:bg-gray-100"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/test-seasons/${season._id}/assignments`}
                            >
                              <UsersIcon />
                              Biriktiruvlar
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link to={`/test-seasons/${season._id}/rewards`}>
                              <Coins />
                              Mukofotlar
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => openModal("announceSeason", season)}
                          >
                            <Megaphone />
                            E'lon qilish
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => openModal("editSeason", season)}
                          >
                            <Edit />
                            Tahrirlash
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => openModal("deleteSeason", season)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 />
                            O'chirish
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <ResponsiveModal name="createSeason" title="Yangi test mavsumi">
        <SeasonForm onSuccess={fetchSeasons} />
      </ResponsiveModal>

      {/* Edit Modal */}
      <ResponsiveModal name="editSeason" title="Test mavsumini tahrirlash">
        <SeasonForm isEdit onSuccess={fetchSeasons} />
      </ResponsiveModal>

      {/* Delete Modal */}
      <ResponsiveModal
        name="deleteSeason"
        title="Test mavsumini o'chirish"
        description="Haqiqatdan ham mavsumni o'chirmoqchimisiz?"
      >
        <DeleteSeasonForm onSuccess={fetchSeasons} />
      </ResponsiveModal>

      {/* Announce Modal */}
      <AnnounceSeasonModal />
    </div>
  );
};

export default TestSeasonsPage;
