// React
import { useState } from "react";

// Icons
import { Check, Loader2, X } from "lucide-react";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Queries
import { useTaskAssignees } from "../queries/tasks.queries";

// Data
import { assigneeGroupTabs } from "../data/tasks.data";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Components
import Input from "@/shared/components/ui/input/Input";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Utils
import { cn } from "@/shared/utils/cn";

const fullName = (user) =>
  `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`;

/**
 * Topshiriq ijrochilarini tanlash: Xodimlar / O'quvchilar guruhi + qidiruv.
 *
 * ⚠️ `value` — foydalanuvchi OBYEKTLARI, id emas: guruh yoki qidiruv
 * almashganda tanlanganlar joriy ro'yxatda bo'lmasa ham ismi bilan
 * ko'rinib turishi kerak.
 *
 * @param {{ value: Array<object>, onChange: (users: Array<object>) => void, disabled?: boolean }} props
 */
const AssigneePicker = ({ value = [], onChange, disabled = false }) => {
  const { data: roles = [] } = useRoles();

  const [group, setGroup] = useState(assigneeGroupTabs[0].value);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput.trim());

  const { data, isLoading, isFetching } = useTaskAssignees({ group, search });

  // "staff" guruhida owner ham keladi — u topshiriq beruvchi, ijrochi emas
  const users = (data?.data ?? []).filter((u) => u.role !== "owner");
  const hasMore = Boolean(data?.pagination?.hasNextPage);

  const selectedIds = new Set(value.map((u) => u.id));

  const toggle = (user) => {
    onChange(
      selectedIds.has(user.id)
        ? value.filter((u) => u.id !== user.id)
        : [...value, user],
    );
  };

  const remove = (id) => onChange(value.filter((u) => u.id !== id));

  return (
    <div className="space-y-2 text-left">
      <label className="ml-1 text-sm font-medium text-gray-700">
        Ijrochilar <span className="text-blue-500">*</span>
      </label>

      {/* Tanlanganlar */}
      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {value.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-sm text-blue-800"
            >
              {fullName(user)}
              <button
                type="button"
                disabled={disabled}
                aria-label={`${fullName(user)} ni olib tashlash`}
                onClick={() => remove(user.id)}
                className="hover:text-blue-600"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange([])}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Tozalash ({value.length})
          </button>
        </div>
      )}

      {/* Guruh */}
      <TabsButtons
        items={assigneeGroupTabs}
        value={group}
        onChange={setGroup}
        listClassName="w-full"
        triggerClassName="flex-1"
      />

      {/* Qidiruv */}
      <div className="relative">
        <Input
          type="search"
          value={searchInput}
          disabled={disabled}
          placeholder="Ism, familiya yoki username bo'yicha qidirish..."
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {/* Ro'yxat */}
      <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200">
        {isLoading ? (
          <p className="px-3 py-2 text-sm text-gray-500">Yuklanmoqda...</p>
        ) : users.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-500">
            {search ? "Hech kim topilmadi" : "Foydalanuvchilar yo'q"}
          </p>
        ) : (
          users.map((user) => {
            const isSelected = selectedIds.has(user.id);

            return (
              <button
                key={user.id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(user)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100",
                  isSelected && "bg-blue-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300",
                  )}
                >
                  {isSelected && <Check className="size-3 text-white" />}
                </span>
                <span className="flex-1 truncate">{fullName(user)}</span>
                <span className="shrink-0 text-xs text-gray-500">
                  {getRoleLabel(user.role, roles)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {hasMore && (
        <p className="ml-1 text-xs text-gray-500">
          Faqat birinchi {users.length} tasi ko'rsatilgan — kerakli odamni
          qidiruv orqali toping
        </p>
      )}
    </div>
  );
};

export default AssigneePicker;
