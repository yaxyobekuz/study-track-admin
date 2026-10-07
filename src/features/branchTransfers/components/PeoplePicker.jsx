// React
import { useMemo, useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Check, Minus, Search, UsersRound } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks & queries
import useDebounce from "@/shared/hooks/useDebounce";
import { usersQueries } from "@/features/users/queries/users.queries";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import Pagination from "@/shared/components/ui/Pagination";

// Data
import { PICKER_PAGE_SIZE } from "../data/branchTransfers.data";

/** Kvadrat belgi — tanlangan / qisman / bo'sh. */
export const CheckBox = ({ state }) => (
  <span
    className={cn(
      "flex size-5 shrink-0 items-center justify-center rounded-md border",
      state === "none" ? "border-gray-300 bg-white" : "border-primary bg-primary text-white",
    )}
  >
    {state === "all" && <Check className="size-3.5" strokeWidth={3} />}
    {state === "some" && <Minus className="size-3.5" strokeWidth={3} />}
  </span>
);

/**
 * O'quvchi yoki xodim tanlash ro'yxati.
 *
 * Tanlov sahifalar va qidiruv orasida SAQLANADI (`selected` — ota
 * komponentda): avval 5-A dan, keyin 5-B dan tanlab, bir martada
 * ko'chirish mumkin. Server baribir har birini qayta tekshiradi.
 *
 * @param {object} props
 * @param {"student"|"staff"} props.kind
 * @param {Map<string, string>} props.selected - id → ism
 * @param {(rows: Array<{id: string, label: string}>, checked: boolean) => void} props.onChange
 */
const PeoplePicker = ({ kind, selected, onChange }) => {
  const isStudent = kind === "student";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("all");
  const debounced = useDebounce(search.trim(), 400);

  const { data: classes = [] } = useClasses();
  const { data: roles = [] } = useRoles();
  const { data, isLoading, isError, refetch } = useQuery(
    usersQueries.list({
      page,
      limit: PICKER_PAGE_SIZE,
      role: isStudent ? "student" : "staff",
      ...(debounced && { search: debounced }),
      ...(isStudent && classId !== "all" && { class: classId }),
    }),
  );

  const rows = useMemo(
    () =>
      (data?.data ?? [])
        .filter((u) => u.role !== "owner")
        .map((u) => ({
          id: u.id,
          label: u.fullName || `${u.firstName} ${u.lastName ?? ""}`.trim(),
          username: u.username,
          meta: isStudent
            ? (u.classes ?? []).map((c) => c.name).join(", ") || "Sinfsiz"
            : getRoleLabel(u.role, roles),
        })),
    [data, isStudent, roles],
  );

  const pageState = (() => {
    const count = rows.filter((r) => selected.has(r.id)).length;
    if (count === 0) return "none";
    return count === rows.length ? "all" : "some";
  })();

  const classOptions = [
    { value: "all", label: "Barcha sinflar" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const resetPage = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  return (
    <Card className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            value={search}
            className="pl-9"
            placeholder={isStudent ? "O'quvchi ismi yoki logini" : "Xodim ismi yoki logini"}
            onChange={(e) => resetPage(setSearch)(e.target.value)}
          />
        </div>
        {isStudent && (
          <Select
            value={classId}
            options={classOptions}
            onChange={resetPage(setClassId)}
            triggerClassName="sm:w-48"
          />
        )}
      </div>

      {isLoading ? (
        <LoaderCard title="Yuklanmoqda..." />
      ) : isError ? (
        <EmptyState
          icon={UsersRound}
          title="Ro'yxatni yuklab bo'lmadi"
          action={
            <button type="button" onClick={() => refetch()} className="text-sm text-primary">
              Qayta urinish
            </button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={UsersRound} title="Hech kim topilmadi" />
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border">
          <button
            type="button"
            onClick={() => onChange(rows, pageState !== "all")}
            className="flex w-full items-center gap-3 bg-gray-50 px-3.5 py-2.5 text-left text-sm font-medium text-gray-700"
          >
            <CheckBox state={pageState} />
            Shu sahifadagilarning hammasi ({rows.length})
          </button>
          {rows.map((row) => {
            const isSelected = selected.has(row.id);
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onChange([row], !isSelected)}
                className={cn(
                  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50",
                  isSelected && "bg-primary/5",
                )}
              >
                <CheckBox state={isSelected ? "all" : "none"} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">{row.label}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {row.username} · {row.meta}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {data?.pagination && (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={data.pagination.totalPages}
          hasNextPage={data.pagination.hasNextPage}
          hasPrevPage={data.pagination.hasPrevPage}
          showPageNumbers={false}
        />
      )}
    </Card>
  );
};

export default PeoplePicker;
