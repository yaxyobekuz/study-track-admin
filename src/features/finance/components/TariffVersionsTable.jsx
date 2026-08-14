// Toast
import { toast } from "sonner";

// Icons
import { Pencil, Trash2 } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthRange,
} from "@/shared/helpers/month.helpers";

// Data & mutations
import { VERSION_TABLE_COLUMNS } from "../data/finance.data";
import { useDeleteTariffVersion } from "../queries/finance.mutations";

/**
 * Tarifning narx tarixi.
 *
 * Versiya holati davrdan kelib chiqadi: `endMonth = null` — joriy (ochiq)
 * narx, boshlanishi kelajakda bo'lsa — rejalashtirilgan, aks holda o'tgan.
 * O'tgan va joriy versiyani o'chirib bo'lmaydi (server ham rad etadi) —
 * shuning uchun tugma faqat kelajakdagi qatorda ko'rinadi.
 */
const TariffVersionsTable = ({ tariffId, versions = [] }) => {
  const now = currentMonthKey();
  const { openModal } = useModal();
  const { mutate: deleteVersion } = useDeleteTariffVersion();

  const handleDelete = (versionId) => {
    if (!confirm("Narx versiyasini o'chirishni tasdiqlaysizmi?")) return;

    deleteVersion(
      { id: tariffId, versionId },
      {
        onSuccess: () => toast.success("Versiya o'chirildi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  if (versions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Narx versiyalari hali qo'shilmagan
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {VERSION_TABLE_COLUMNS.map((column, index) => (
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
          {versions.map((version) => {
            const isFuture = version.startMonth > now;
            const isCurrent =
              !isFuture &&
              (version.endMonth == null || version.endMonth >= now);

            return (
              <tr key={version.id} className="border-t border-gray-100">
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatMonthRange(version.startMonth, version.endMonth)}
                </td>

                <td className="px-4 py-3 whitespace-nowrap font-medium">
                  {formatMoney(version.monthlyAmount)}
                </td>

                <td className="px-4 py-3 text-gray-500">
                  {version.note || "—"}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {isCurrent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700">
                      Joriy
                    </span>
                  )}
                  {isFuture && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                      Rejalashtirilgan
                    </span>
                  )}
                  {!isCurrent && !isFuture && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                      O'tgan
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Can do="tariffs.versions">
                      <button
                        title="Tahrirlash"
                        onClick={() =>
                          openModal("editTariffVersion", { tariffId, version })
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </Can>

                    {/* O'tgan/amaldagi narxni o'chirib bo'lmaydi — u tarix */}
                    {isFuture && (
                      <Can do="tariffs.versions">
                        <button
                          title="O'chirish"
                          onClick={() => handleDelete(version.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </Can>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TariffVersionsTable;
