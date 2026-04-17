// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { useSearchParams, Link } from "react-router-dom";

// Icons
import { Plus, Minus } from "lucide-react";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Data
import {
  penaltyStatusOptions,
  penaltyStatusLabels,
  penaltyStatusColors,
} from "../data/penalties.data";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";

// Modals
import CreatePenaltyModal from "../components/CreatePenaltyModal";
import ReducePenaltyModal from "../components/ReducePenaltyModal";

const PenaltiesPage = () => {
  const { openModal } = useModal();
  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const statusFilter = searchParams.get("status") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const { data, isLoading } = useQuery({
    queryKey: [
      "penalties",
      "list",
      currentPage,
      statusFilter,
      startDate,
      endDate,
    ],
    queryFn: () => {
      const params = { page: currentPage, limit: 20 };
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      return penaltiesAPI.getAll(params).then((res) => res.data);
    },
  });

  const penalties = data?.data || [];
  const pagination = data?.pagination;

  const handleStatusChange = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleDateChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  const formatUserName = (user) => {
    if (!user) return "—";
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Title */}
        <h1 className="page-title">Jarimalar</h1>

        {/* Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={() => openModal("reducePenalty")}>
            <Minus />
            Kamaytirish
          </Button>

          <Button variant="danger" onClick={() => openModal("createPenalty")}>
            <Plus />
            Jarima yozish
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <SelectField
          label="Holat"
          className="w-auto"
          value={statusFilter}
          onChange={handleStatusChange}
          options={penaltyStatusOptions}
        />

        <div className="flex gap-4">
          <InputField
            type="date"
            label="Dan"
            value={startDate}
            className="w-auto"
            onChange={(e) => handleDateChange("startDate", e.target.value)}
          />

          <InputField
            type="date"
            label="Gacha"
            value={endDate}
            className="w-auto"
            onChange={(e) => handleDateChange("endDate", e.target.value)}
          />

          {(startDate || endDate) && (
            <Button
              variant="outline"
              className="mt-auto"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("startDate");
                params.delete("endDate");
                params.set("page", "1");
                setSearchParams(params);
              }}
            >
              Tozalash
            </Button>
          )}
        </div>
      </div>

      {/* Penalties Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : penalties.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-gray-500">Jarimalar topilmadi</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="text-sm">
            {/* Thead */}
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2.5 px-3">Foydalanuvchi</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Sabab</th>
                <th className="py-2.5 px-3">Ball</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Sana</th>
                <th className="py-2.5 px-3">Harakatlar</th>
              </tr>
            </thead>

            {/* Tbody */}
            <tbody>
              {penalties.map((penalty) => (
                <tr key={penalty._id}>
                  <td className="py-2.5 px-3">
                    {formatUserName(penalty.user)}
                  </td>

                  <td className="py-2.5 px-3 text-xs text-gray-600">
                    {getRoleLabel(penalty.user?.role, roles)}
                  </td>

                  <td className="py-2.5 px-3">
                    <p className="text-xs text-gray-800 max-w-48 truncate">
                      {penalty.title || penalty.description || "—"}
                    </p>

                    {penalty.isCustom && (
                      <span className="text-[10px] text-blue-500">
                        Kategoriyasiz
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    {penalty.type === "reduction" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                        -{penalty.points}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                        +{penalty.points}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        penaltyStatusColors[penalty.status]
                      }`}
                    >
                      {penaltyStatusLabels[penalty.status]}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-xs text-gray-500">
                    {formatDateUZ(penalty.createdAt)}
                  </td>

                  <td className="py-2.5 px-3">
                    <Link
                      to={`/penalties/${penalty._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ba'tafsil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <CreatePenaltyModal />
      <ReducePenaltyModal />
    </div>
  );
};

export default PenaltiesPage;
