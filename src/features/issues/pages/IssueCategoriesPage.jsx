// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Plus, Edit, Trash2, Tags } from "lucide-react";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Queries
import { issueCategoriesQueries } from "../queries/issues.queries";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import IssueCategoryForm from "../components/IssueCategoryForm";
import DeleteIssueCategoryForm from "../components/DeleteIssueCategoryForm";

/**
 * "Kategoriyalar" tabi.
 *
 * ⚠️ FAQAT NOMI VA HOLATI — ataylab. Kategoriya botdagi klaviatura tugmasi
 * bo'lib xizmat qiladi va tugmada nomdan boshqa hech narsa ko'rinmaydi:
 * tavsif, rang yoki mas'ul qo'shilsa, panelda ko'rinadigan, botda esa
 * hech qachon ko'rinmaydigan ma'lumot paydo bo'lardi.
 *
 * ⚠️ NOAKTIVLAR HAM RO'YXATDA: ularni qayta yoqish kerak bo'ladi. Faqat
 * faollari ko'rsatilsa o'chirilgan kategoriyani tiklash imkonsiz bo'lardi.
 */
const IssueCategoriesPage = () => {
  const { openModal } = useModal();

  const { data: categories = [], isLoading } = useQuery(
    issueCategoriesQueries.list(),
  );

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Botda faqat <span className="font-medium text-gray-700">faol</span>{" "}
          kategoriyalar ko'rinadi.
        </p>

        <Button onClick={() => openModal("createIssueCategory")}>
          <Plus strokeWidth={1.5} />
          Qo'shish
        </Button>
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={Tags}
            title="Kategoriya yo'q"
            description="Kategoriya qo'shilmaguncha botdan muammo yuborib bo'lmaydi — foydalanuvchi avval yo'nalishni tanlashi kerak."
            action={
              <Button onClick={() => openModal("createIssueCategory")}>
                <Plus strokeWidth={1.5} />
                Birinchi kategoriyani qo'shish
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Nomi</th>
                <th className="px-3 py-2.5">Holati</th>
                <th className="px-3 py-2.5">Muammolar</th>
                <th className="px-3 py-2.5">Amallar</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-center text-xs text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-3 py-2.5 text-center font-medium">
                    {category.name}
                  </td>

                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {category.isActive ? "Aktiv" : "Noaktiv"}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-center text-xs text-gray-500">
                    {category.issuesCount ?? 0}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex justify-center gap-2">
                      <button
                        title="Tahrirlash"
                        onClick={() => openModal("editIssueCategory", category)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="size-4" />
                      </button>

                      <button
                        title="O'chirish"
                        onClick={() =>
                          openModal("deleteIssueCategory", category)
                        }
                        className="p-1 text-red-600 hover:text-red-800"
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

      {/* Qo'shish */}
      <ResponsiveModal name="createIssueCategory" title="Yangi kategoriya">
        <IssueCategoryForm />
      </ResponsiveModal>

      {/* Tahrirlash */}
      <ResponsiveModal
        name="editIssueCategory"
        title="Kategoriyani tahrirlash"
      >
        <IssueCategoryForm isEdit />
      </ResponsiveModal>

      {/* O'chirish */}
      <ResponsiveModal
        name="deleteIssueCategory"
        title="Kategoriyani o'chirish"
      >
        <DeleteIssueCategoryForm />
      </ResponsiveModal>
    </div>
  );
};

export default IssueCategoriesPage;
