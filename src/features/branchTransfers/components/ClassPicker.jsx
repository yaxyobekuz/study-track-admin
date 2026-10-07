// React
import { useMemo, useState } from "react";

// Icons
import { School, Search } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { useClasses } from "@/features/classes/queries/classes.queries";

// Components
import Card from "@/shared/components/ui/Card";
import Input from "@/shared/components/ui/input/Input";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import { CheckBox } from "./PeoplePicker";

/**
 * Sinf tanlash. Sinf o'quvchilari bilan birga ko'chadi; sinflar soni
 * o'nlab — ro'yxat sahifalanmaydi, qidiruv xotirada.
 *
 * @param {object} props
 * @param {Map<string, string>} props.selected - id → nomi
 * @param {(rows: Array<{id: string, label: string}>, checked: boolean) => void} props.onChange
 */
const ClassPicker = ({ selected, onChange }) => {
  const [search, setSearch] = useState("");
  const { data: classes = [], isLoading } = useClasses();

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((c) => ({ id: c.id, label: c.name, students: c.studentCount ?? 0 }));
  }, [classes, search]);

  return (
    <Card className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          value={search}
          className="pl-9"
          placeholder="Sinf nomi"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoaderCard title="Yuklanmoqda..." />
      ) : rows.length === 0 ? (
        <EmptyState icon={School} title="Sinf topilmadi" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const isSelected = selected.has(row.id);
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onChange([row], !isSelected)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  isSelected ? "border-primary/40 bg-primary/5" : "border-gray-200 hover:border-gray-300",
                )}
              >
                <CheckBox state={isSelected ? "all" : "none"} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">{row.label}</span>
                  <span className="block text-xs text-gray-500">{row.students} ta o'quvchi</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ClassPicker;
