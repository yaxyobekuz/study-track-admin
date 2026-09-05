// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Icons
import { Archive, ArchiveRestore, Layers, Pencil, Plus, Trash2 } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import CreateTariffModal from "../components/CreateTariffModal";
import EditTariffModal from "../components/EditTariffModal";
import TariffDirectionsModal from "../components/TariffDirectionsModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatMonthRange } from "@/shared/helpers/month.helpers";

// Data & queries
import {
  TARIFF_STATUS_OPTIONS,
  TARIFF_TABLE_COLUMNS,
  getTariffStatus,
  statusToParams,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";
import { useArchiveTariff, useDeleteTariff } from "../queries/finance.mutations";

const TariffsPage = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const status = searchParams.get("status") || "all";

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (value == null || value === "") prev.delete(key);
      else prev.set(key, String(value));
      if (key !== "page") prev.delete("page");
      return prev;
    });

  // Oy berilmasa server joriy oyni oladi — ro'yxatda aynan shu oydagi narx
  // ko'rsatiladi.
  const { data, isLoading } = useQuery(
    financeQueries.tariffList({ page, limit: 24, ...statusToParams(status) }),
  );

  const tariffs = data?.data ?? [];
  const pagination = data?.pagination;

  const { mutate: archiveTariff } = useArchiveTariff();
  const { mutate: deleteTariff } = useDeleteTariff();

  const handleArchive = (tariff) => {
    const next = !tariff.isArchived;
    const question = next
      ? "Tarifni arxivlashni tasdiqlaysizmi? Yangi biriktirishlarda ko'rinmaydi."
      : "Tarifni arxivdan qaytarasizmi?";
    if (!confirm(question)) return;

    archiveTariff(
      { id: tariff.id, isArchived: next },
      {
        onSuccess: () =>
          toast.success(next ? "Tarif arxivlandi" : "Tarif qaytarildi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const handleDelete = (tariff) => {
    if (!confirm("Tarifni butunlay o'chirishni tasdiqlaysizmi?")) return;

    deleteTariff(tariff.id, {
      onSuccess: () => toast.success("Tarif o'chirildi"),
      // Biriktirilgan o'quvchi bo'lsa server 400 qaytaradi — sababi
      // foydalanuvchiga aynan shu xabar bilan yetkaziladi.
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Select
          value={status}
          triggerClassName="min-w-36"
          options={TARIFF_STATUS_OPTIONS}
          onChange={(v) => setParam("status", v)}
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Yo'nalishlar katalogi — tariflar bilan bitta joyda: yo'nalish
              tarifdan tashqarida ma'nosiz, alohida sahifa ochish esa uni
              topib bo'lmaydigan qilib qo'yardi */}
          <Can do="tariffs.create">
            <Button variant="outline" onClick={() => openModal("tariffDirections")}>
              <Layers className="size-4" />
              Yo'nalishlar
            </Button>
          </Can>

          <Can do="tariffs.create">
            <Button onClick={() => openModal("createTariff")}>
              <Plus />
              Yangi tarif
            </Button>
          </Can>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : tariffs.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">Tariflar topilmadi</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {TARIFF_TABLE_COLUMNS.map((column, index) => (
                  <th
                    key={column || index}
                    className="px-4 py-3 text-left text-white font-medium whitespace-nowrap"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tariffs.map((tariff) => {
                const badge = getTariffStatus(tariff);
                const version = tariff.currentVersion;

                return (
                  <tr
                    key={tariff.id}
                    onClick={() => navigate(`/finance/main/tariffs/${tariff.id}`)}
                    className="border-t border-gray-100 cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{tariff.name}</p>
                      {tariff.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {tariff.description}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {tariff.direction ? (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {tariff.direction.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">Belgilanmagan</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {version ? (
                        <span className="font-medium">
                          {formatMoney(version.monthlyAmount)}
                        </span>
                      ) : (
                        // Narx bo'lmasligi xato emas, lekin ko'zga tashlanishi kerak
                        <span className="text-red-600">Narx belgilanmagan</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {version
                        ? formatMonthRange(version.startMonth, version.endMonth)
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {tariff.assignedStudentCount}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Can do="tariffs.update">
                          <button
                            title="Tahrirlash"
                            onClick={() => openModal("editTariff", { tariff })}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        </Can>

                        <Can do="tariffs.update">
                          <button
                            title={tariff.isArchived ? "Qaytarish" : "Arxivlash"}
                            onClick={() => handleArchive(tariff)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            {tariff.isArchived ? (
                              <ArchiveRestore className="size-3.5" />
                            ) : (
                              <Archive className="size-3.5" />
                            )}
                          </button>
                        </Can>

                        <Can do="tariffs.delete">
                          <button
                            title="O'chirish"
                            onClick={() => handleDelete(tariff)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(next) => setParam("page", next)}
        />
      )}

      {/* Modals */}
      <CreateTariffModal />
      <EditTariffModal />
      <TariffDirectionsModal />
    </div>
  );
};

export default TariffsPage;
