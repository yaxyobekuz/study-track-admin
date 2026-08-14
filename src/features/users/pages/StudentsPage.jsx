// Router
import { useSearchParams } from "react-router-dom";

// Components
import Select from "@/shared/components/ui/select/Select";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import UsersListView from "../components/UsersListView";
import UserRowActions from "../components/UserRowActions";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";

// Data
import { ARCHIVE_TABS } from "../data/usersTabs.data";
import { STUDENT_TABLE_COLUMNS, getInitials } from "../data/users.data";

/**
 * O'quvchilar ro'yxati.
 *
 * Xodimlardan farqi: sinf filtri va arxiv tabi bor. O'quvchi o'chirilmaydi —
 * arxivlanadi, chunki uning davomati, baholari va moliyaviy tarixi saqlanib
 * qolishi kerak.
 */
const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: classes = [] } = useClasses();

  const classFilter = searchParams.get("class") || "all";
  const activeTab =
    searchParams.get("tab") === "archived" ? "archived" : "main";

  const classOptions = [
    { value: "all", label: "Barcha sinflar" },
    ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
  ];

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (!value || value === "all" || value === "main") prev.delete(key);
      else prev.set(key, value);
      prev.delete("page");
      return prev;
    });

  return (
    <div className="space-y-4">
      <TabsButtons
        items={ARCHIVE_TABS}
        value={activeTab}
        onChange={(value) => setParam("tab", value)}
      />

      <UsersListView
        variant="student"
        columns={STUDENT_TABLE_COLUMNS}
        emptyText={
          activeTab === "archived"
            ? "Arxivlangan o'quvchilar yo'q"
            : "O'quvchilar topilmadi"
        }
        filters={
          <Select
            value={classFilter}
            options={classOptions}
            placeholder="Sinf tanlang"
            triggerClassName="w-full sm:w-48 sm:shrink-0"
            onChange={(value) => setParam("class", value)}
          />
        }
        renderRow={(user, { isArchived }) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                  {getInitials(user)}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
            </td>

            <td className="px-4 py-3 text-gray-500">
              {user.classes?.length > 0
                ? user.classes.map((cls) => cls.name).join(", ")
                : "—"}
            </td>

            <td className="px-4 py-3 text-gray-500">{user.coinBalance ?? 0}</td>

            <td className="px-4 py-3 text-gray-500">
              {user.penaltyPoints ?? 0}
            </td>

            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <UserRowActions user={user} isArchived={isArchived} />
            </td>
          </>
        )}
      />
    </div>
  );
};

export default StudentsPage;
