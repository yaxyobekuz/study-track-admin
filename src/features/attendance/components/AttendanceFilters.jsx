// Data
import { MONTH_OPTIONS } from "../data/attendance.data";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Select from "@/shared/components/ui/select/Select";

const AttendanceFilters = ({
  role,
  month,
  year,
  onRoleChange,
  onMonthChange,
  onYearChange,
}) => {
  const { getCollectionData: getRoles } = useArrayStore("roles");
  const roles = getRoles().filter(
    (r) => r.value !== "owner" && r.value !== "student",
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => ({
    label: String(currentYear - i),
    value: currentYear - i,
  }));

  return (
    <div className="flex flex-wrap items-end gap-4">
      <Select
        value={role || undefined}
        triggerClassName="min-w-40"
        placeholder="Barcha rollar"
        onChange={(v) => onRoleChange(v === "all" ? "" : v)}
        options={[
          { label: "Barcha rollar", value: "all" },
          ...roles.map((r) => ({ label: r.name, value: r.value })),
        ]}
      />

      <Select
        value={String(month)}
        triggerClassName="min-w-40"
        onChange={(v) => onMonthChange(Number(v))}
        options={MONTH_OPTIONS.map((m) => ({
          label: m.label,
          value: String(m.value),
        }))}
      />

      <Select
        value={String(year)}
        triggerClassName="min-w-40"
        onChange={(v) => onYearChange(Number(v))}
        options={yearOptions.map((y) => ({
          label: y.label,
          value: String(y.value),
        }))}
      />
    </div>
  );
};

export default AttendanceFilters;
