// React
import { useCallback, useEffect, useRef, useState } from "react";

// Router
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// Icons
import { Download, Plus } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import Pagination from "@/shared/components/ui/Pagination";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Data & queries
import { ARCHIVE_TABS } from "../data/usersTabs.data";
import { usersQueries } from "../queries/users.queries";

const PAGE_SIZE = 32;

/**
 * Xodimlar va O'quvchilar sahifalarining umumiy qobig'i.
 *
 * Ikkalasi mustaqil sahifa (sidebarda ham alohida), lekin ish mantiqi bir xil:
 * sarlavha, "Asosiy / Arxivlangan" tabi, qidiruv, sahifalash. Ustunlar va
 * qator ko'rinishi esa sahifadan `columns`/`renderRow` orqali keladi — bir xil
 * ma'lumot manbasidan o'qishsa ham, butunlay boshqacha ustunlarni ko'rsatadi.
 *
 * Filtrlar URL orqali bog'lanadi: sahifa `Select`'i paramni yozadi, bu
 * komponent o'qiydi. Shu tufayli har qanday ro'yxat holatini link qilsa
 * bo'ladi.
 *
 * @param {object} props
 * @param {"staff"|"student"} props.variant
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string[]} props.columns - jadval sarlavhalari
 * @param {(user: object, ctx: {isArchived: boolean}) => React.ReactNode} props.renderRow
 * @param {React.ReactNode} [props.filters] - qo'shimcha filtr elementlari
 * @param {string} [props.emptyText]
 * @param {string} [props.emptyArchivedText]
 */
const UsersListView = ({
  variant,
  title,
  description,
  columns,
  renderRow,
  filters = null,
  emptyText = "Foydalanuvchilar topilmadi",
  emptyArchivedText = "Arxivlangan foydalanuvchilar yo'q",
}) => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const isStudentList = variant === "student";

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";
  const classFilter = searchParams.get("class") || "";
  const activeTab =
    searchParams.get("tab") === "archived" ? "archived" : "main";
  const isArchived = activeTab === "archived";

  // Qidiruv inputi darhol yangilanadi, URL esa 300ms dan keyin
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);
  const debounceRef = useRef(null);

  // URL tashqaridan o'zgarsa (brauzerning "orqaga" tugmasi) input ham
  // yangilanadi. Effekt emas, render paytida moslash — React'ning shu holat
  // uchun tavsiya qilgan usuli.
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchParams((prev) => {
          if (value.trim()) prev.set("search", value.trim());
          else prev.delete("search");
          prev.delete("page");
          return prev;
        });
      }, 300);
    },
    [setSearchParams],
  );

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleTabChange = (value) =>
    setSearchParams((prev) => {
      if (value === "archived") prev.set("tab", "archived");
      else prev.delete("tab");
      prev.delete("page");
      return prev;
    });

  const { data, isLoading } = useQuery(
    usersQueries.list({
      page,
      limit: PAGE_SIZE,
      // "staff" — rol emas, guruh: server uni o'quvchilardan boshqa hamma deb
      // o'qiydi. Aniq rol tanlansa (masalan "teacher") — o'sha rol ketadi.
      role: isStudentList ? "student" : roleFilter || "staff",
      ...(search && { search }),
      // Sinf filtri faqat o'quvchilarga tegishli
      ...(isStudentList && classFilter && { class: classFilter }),
      ...(isArchived && { archived: true }),
    }),
  );

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  const goToPage = (next) =>
    setSearchParams((prev) => {
      prev.set("page", String(next));
      return prev;
    });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>

      {/* Asosiy / Arxivlangan */}
      <TabsButtons
        items={ARCHIVE_TABS}
        value={activeTab}
        onChange={handleTabChange}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          autoFocus
          type="search"
          value={searchInput}
          className="sm:flex-1"
          placeholder="Ism, familiya yoki username bo'yicha qidirish..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        {filters}

        <div className="flex items-center gap-3 sm:shrink-0">
          <Can do="users.export">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => openModal("exportUsers")}
            >
              <Download />
              <span className="sm:hidden">Yuklab olish</span>
            </Button>
          </Can>

          <Can do="users.create">
            <Button asChild className="flex-1 sm:flex-none">
              <Link
                to={`/users/new?role=${isStudentList ? "student" : "staff"}`}
              >
                <Plus />
                {isStudentList ? "Yangi o'quvchi" : "Yangi xodim"}
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* Jadval */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : users.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">
            {isArchived ? emptyArchivedText : emptyText}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                {columns.map((column, index) => (
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
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="border-t border-gray-100 cursor-pointer hover:bg-gray-50"
                >
                  {renderRow(user, { isArchived })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="overflow-x-auto pb-1.5">
          <Pagination
            maxPageButtons={5}
            showPageNumbers
            onPageChange={goToPage}
            className="min-w-max"
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        </div>
      )}
    </div>
  );
};

export default UsersListView;
