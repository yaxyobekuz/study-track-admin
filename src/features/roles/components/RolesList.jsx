// Icons
import { Lock, Users } from "lucide-react";

// Components
import SearchableListPanel from "@/shared/components/ui/SearchableListPanel";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * Rollar sahifasining 1-paneli: rollarning minimalistik ro'yxati.
 * Har bir item — rol nomi, kaliti va shu roldagi foydalanuvchilar soni.
 *
 * @param {object} props
 * @param {Array} props.roles - Rollar
 * @param {string} [props.selectedId] - Tanlangan rol ID
 * @param {(id: string) => void} props.onSelect - Rol tanlanganda
 * @param {string} [props.className]
 */
const RolesList = ({ roles = [], selectedId, onSelect, className = "" }) => (
  <SearchableListPanel
    items={roles}
    className={className}
    emptyText="Rol topilmadi"
    placeholder="Rolni qidirish..."
    searchText={(role) => `${role.name} ${role.value}`}
    renderItem={(role) => {
      const isActive = role.id === selectedId;

      return (
        <button
          type="button"
          onClick={() => onSelect(role.id)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
            isActive ? "bg-blue-50" : "hover:bg-gray-50",
          )}
        >
          {/* Bosh harf */}
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase",
              isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500",
            )}
          >
            {role.name?.[0]}
          </span>

          {/* Nom + kalit */}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "flex items-center gap-1.5 truncate text-sm font-medium",
                isActive ? "text-blue-900" : "text-gray-900",
              )}
            >
              <span className="truncate">{role.name}</span>
              {role.isSystem && (
                <span title="Tizim roli" className="shrink-0">
                  <Lock className="size-3.5 text-gray-400" strokeWidth={1.5} />
                </span>
              )}
            </p>
            <p className="truncate text-xs text-gray-500">{role.value}</p>
          </div>

          {/* Foydalanuvchilar soni */}
          <span
            title="Foydalanuvchilar soni"
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              role.usersCount > 0
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-400",
            )}
          >
            <Users className="size-3.5" strokeWidth={1.5} />
            {role.usersCount}
          </span>
        </button>
      );
    }}
  />
);

export default RolesList;
