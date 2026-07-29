// React
import { useMemo, useState } from "react";

// Icons
import { Search, ShieldCheck } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";

// Utils, helpers & data
import { cn } from "@/shared/utils/cn";
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { countGranted } from "@/features/permissions/data/permissions.data";

/**
 * Ruxsatlar sahifasining 1-paneli: xodimlarning minimalistik ro'yxati.
 * Har bir item — ism, rol va berilgan amallar soni. Tepada tezkor qidiruv.
 *
 * @param {object} props
 * @param {Array} props.staff - Xodimlar (ruxsatlari bilan)
 * @param {Array} props.roles - Rollar (label uchun)
 * @param {string} [props.selectedId] - Tanlangan xodim ID
 * @param {(id: string) => void} props.onSelect - Xodim tanlanganda
 * @param {string} [props.className]
 */
const StaffPermissionsList = ({
  staff = [],
  roles = [],
  selectedId,
  onSelect,
  className = "",
}) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staff;

    return staff.filter((user) =>
      `${user.fullName || user.firstName} ${user.username}`
        .toLowerCase()
        .includes(query),
    );
  }, [staff, search]);

  return (
    /* lg dan boshlab panel yopishib turadi va ekran balandligini to'liq egallaydi
       (DashboardLayout kontenti `md:py-2` — shuning uchun 8px yuqoridan, 1rem umumiy) */
    <Card
      className={cn(
        "flex flex-col gap-3 p-3 xs:p-3.5 lg:sticky lg:top-2 lg:h-[calc(100vh-1rem)]",
        className,
      )}
    >
      {/* Qidiruv */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          strokeWidth={1.5}
        />
        <Input
          type="search"
          value={search}
          className="pl-9"
          placeholder="Xodimni qidirish..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Ro'yxat */}
      <div className="max-h-[36vh] space-y-1 overflow-y-auto hidden-scrollbar lg:max-h-none lg:min-h-0 lg:flex-1">
        {filtered.map((user) => {
          const name = user.fullName || user.firstName;
          const count = countGranted(user.permissions);
          const isActive = user.id === selectedId;

          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user.id)}
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
                {name?.[0]}
              </span>

              {/* Ism + rol */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    isActive ? "text-blue-900" : "text-gray-900",
                  )}
                >
                  {name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {getRoleLabel(user.role, roles)}
                </p>
              </div>

              {/* Berilgan amallar soni */}
              <span
                title="Berilgan ruxsatlar soni"
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  count > 0
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400",
                )}
              >
                <ShieldCheck className="size-3.5" strokeWidth={1.5} />
                {count}
              </span>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">Xodim topilmadi</p>
        )}
      </div>
    </Card>
  );
};

export default StaffPermissionsList;
