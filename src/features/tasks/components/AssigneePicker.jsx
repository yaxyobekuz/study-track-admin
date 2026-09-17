// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQueryClient } from "@tanstack/react-query";

// Icons
import { Check, ChevronDown, ChevronUp, Loader2, Users, X } from "lucide-react";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";

// Queries
import { tasksQueries, useTaskAssignees } from "../queries/tasks.queries";

// Data
import {
  MAX_ASSIGNEES,
  fullName,
  assigneeGroupTabs,
  SELECTED_PREVIEW_LIMIT,
} from "../data/tasks.data";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Components
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import UserAvatar from "./UserAvatar";

// Utils
import { cn } from "@/shared/utils/cn";

// Owner — topshiriq beruvchi, ijrochi emas (server ham rad etadi)
const withoutOwner = (users = []) => users.filter((u) => u.role !== "owner");

/**
 * Topshiriq ijrochilarini tanlash — bitta yoki BIR NECHTA odam.
 *
 * Har bir tanlangan odamga server ALOHIDA topshiriq yaratadi (o'z holati,
 * muddati, natijasi va jarimasi bilan). Ko'pchilikka berish qulay bo'lishi
 * uchun: guruh (xodim/o'quvchi) → lavozim yoki sinf filtri → "Hammasini
 * tanlash". Masalan, "9-A sinfining hammasi" yoki "barcha o'qituvchilar"
 * ikki bosishda tanlanadi.
 *
 * ⚠️ `value` — foydalanuvchi OBYEKTLARI, id emas: filtr almashganda
 * tanlanganlar joriy ro'yxatda bo'lmasa ham ismi bilan ko'rinib turishi kerak.
 *
 * @param {object} props
 * @param {Array<object>} props.value
 * @param {(users: Array<object>) => void} props.onChange
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.single] - faqat bitta ijrochi (tahrirlashda)
 */
const AssigneePicker = ({ value = [], onChange, disabled = false, single = false }) => {
  const queryClient = useQueryClient();
  const { data: roles = [] } = useRoles();
  const { data: classes = [] } = useClasses();

  const [group, setGroup] = useState(assigneeGroupTabs[0].value);
  const [role, setRole] = useState("");
  const [classId, setClassId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showAllSelected, setShowAllSelected] = useState(false);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const search = useDebounce(searchInput.trim());

  const filter = {
    group,
    search,
    ...(group === "staff" && role && { role }),
    ...(group === "student" && classId && { classId }),
  };

  const { data, isLoading, isFetching } = useTaskAssignees(filter);

  const users = withoutOwner(data?.data);
  const total = data?.pagination?.total ?? users.length;
  const hasMore = Boolean(data?.pagination?.hasNextPage);

  const selectedIds = new Set(value.map((u) => u.id));
  const allVisibleSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  const roleOptions = [
    { value: "", label: "Barcha lavozimlar" },
    ...roles
      .filter((r) => r.value !== "owner" && r.value !== "student")
      .map((r) => ({ value: r.value, label: r.label })),
  ];
  const classOptions = [
    { value: "", label: "Barcha sinflar" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const toggle = (user) => {
    if (single) return onChange(selectedIds.has(user.id) ? [] : [user]);
    onChange(
      selectedIds.has(user.id)
        ? value.filter((u) => u.id !== user.id)
        : [...value, user],
    );
  };

  const remove = (id) => onChange(value.filter((u) => u.id !== id));

  const addUnique = (list) => {
    const merged = [...value];
    for (const user of list) if (!selectedIds.has(user.id)) merged.push(user);
    if (merged.length > MAX_ASSIGNEES) {
      toast.error(`Bir martada ko'pi bilan ${MAX_ASSIGNEES} ta ijrochi tanlash mumkin`);
      return merged.slice(0, MAX_ASSIGNEES);
    }
    return merged;
  };

  /**
   * Joriy filtrdagi HAMMANI tanlaydi — faqat ko'rinib turgan birinchi 50 tasini
   * emas. Ro'yxat sahifalangan bo'lsa, qolganlari serverdan bir so'rovda olinadi.
   */
  const selectAllMatching = async () => {
    if (!hasMore) return onChange(addUnique(users));

    setIsSelectingAll(true);
    try {
      const all = await queryClient.fetchQuery(
        tasksQueries.assignees({ ...filter, limit: Math.min(total, MAX_ASSIGNEES) }),
      );
      onChange(addUnique(withoutOwner(all?.data)));
    } catch {
      toast.error("Ro'yxatni yuklab bo'lmadi, qayta urinib ko'ring");
    } finally {
      setIsSelectingAll(false);
    }
  };

  const unselectVisible = () => {
    const visible = new Set(users.map((u) => u.id));
    onChange(value.filter((u) => !visible.has(u.id)));
  };

  const preview = showAllSelected ? value : value.slice(0, SELECTED_PREVIEW_LIMIT);

  return (
    <div className="space-y-2.5 text-left">
      <div className="flex items-center justify-between gap-2">
        <label className="ml-1 text-sm font-medium text-gray-700">
          {single ? "Ijrochi" : "Ijrochilar"} <span className="text-primary">*</span>
        </label>
        {!single && value.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            <Users className="size-3.5" />
            {value.length} kishi tanlandi
          </span>
        )}
      </div>

      {/* Tanlanganlar */}
      {value.length > 0 && (
        <div className="rounded-xl bg-blue-50/50 p-2.5 ring-1 ring-blue-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {preview.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 rounded-full bg-white py-0.5 pl-0.5 pr-2 text-sm text-gray-800 ring-1 ring-blue-100"
              >
                <UserAvatar name={fullName(user)} size="xs" />
                {fullName(user)}
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${fullName(user)} ni olib tashlash`}
                  onClick={() => remove(user.id)}
                  className="ml-0.5 text-gray-400 hover:text-rose-600"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}

            {value.length > SELECTED_PREVIEW_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAllSelected((v) => !v)}
                className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                {showAllSelected ? (
                  <>
                    Qisqartirish <ChevronUp className="size-3.5" />
                  </>
                ) : (
                  <>
                    Yana {value.length - SELECTED_PREVIEW_LIMIT} kishi <ChevronDown className="size-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {!single && (
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-blue-100 pt-2">
              <p className="text-xs text-blue-800">
                {value.length > 1
                  ? `Har biriga alohida topshiriq yaratiladi — jami ${value.length} ta`
                  : "Bitta topshiriq yaratiladi"}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange([])}
                className="shrink-0 text-xs font-medium text-gray-500 hover:text-rose-600"
              >
                Hammasini olib tashlash
              </button>
            </div>
          )}
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

      {/* Qidiruv + filtr */}
      <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Input
            type="search"
            value={searchInput}
            disabled={disabled}
            placeholder="Ism, familiya yoki username..."
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>

        {group === "staff" ? (
          <Select value={role} options={roleOptions} onChange={setRole} disabled={disabled} />
        ) : (
          <Select value={classId} options={classOptions} onChange={setClassId} disabled={disabled} />
        )}
      </div>

      {/* Ro'yxat */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {!single && users.length > 0 && (
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <span className="text-xs text-gray-500">{total} kishi topildi</span>
            {allVisibleSelected && !hasMore ? (
              <button
                type="button"
                disabled={disabled}
                onClick={unselectVisible}
                className="text-xs font-medium text-gray-600 hover:text-rose-600"
              >
                Tanlovni bekor qilish
              </button>
            ) : (
              <button
                type="button"
                disabled={disabled || isSelectingAll}
                onClick={selectAllMatching}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isSelectingAll && <Loader2 className="size-3.5 animate-spin" />}
                Hammasini tanlash ({Math.min(total, MAX_ASSIGNEES)})
              </button>
            )}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-gray-500">Yuklanmoqda...</p>
          ) : users.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">
              {search || role || classId ? "Bu filtr bo'yicha hech kim topilmadi" : "Foydalanuvchilar yo'q"}
            </p>
          ) : (
            users.map((user) => {
              const isSelected = selectedIds.has(user.id);
              const name = fullName(user);
              const className = user.classes?.[0]?.class?.name;

              return (
                <button
                  key={user.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(user)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                    isSelected && "bg-blue-50 hover:bg-blue-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center border",
                      single ? "rounded-full" : "rounded",
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300",
                    )}
                  >
                    {isSelected && <Check className="size-3 text-white" />}
                  </span>
                  <UserAvatar name={name} size="xs" />
                  <span className="flex-1 truncate">{name}</span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {group === "student" && className ? className : getRoleLabel(user.role, roles)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {hasMore && (
        <p className="ml-1 text-xs text-gray-500">
          Ro'yxatda birinchi {users.length} tasi ko'rinyapti — qolganini qidiruv orqali toping
          {!single && " yoki \"Hammasini tanlash\" ni bosing"}
        </p>
      )}
    </div>
  );
};

export default AssigneePicker;
