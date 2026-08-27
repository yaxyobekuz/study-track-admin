// Toast
import { toast } from "sonner";

// React
import { useMemo, useState } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { Search, TriangleAlert, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Table from "@/shared/components/ui/Table";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import Switch from "@/shared/components/ui/switch/Switch";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import LoadRow from "../components/LoadRow";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { usePlannerLoads } from "../queries/planner.queries";
import { useSavePlannerLoad } from "../queries/planner.mutations";

// Data
import { LOADS_TABLE_COLUMNS } from "../data/plannerColumns.data";

/**
 * "Asosiy" tab — kim, qaysi fandan, necha soat va qaysi sinflarga.
 *
 * Satrlar bu yerdan QO'SHILMAYDI: ular xodimga fan biriktirilganda
 * (foydalanuvchi sahifasidagi "Fanlar" kartasi) o'zi paydo bo'ladi. Shu
 * sababli "yangi satr" tugmasi ham, ikkita ro'yxatni sinxron tutish
 * muammosi ham yo'q.
 */
const PlannerLoadsPage = () => {
  const { can } = usePermissions();
  const canEdit = can("planner.loads");

  const { data, isLoading } = usePlannerLoads();
  const { mutate: saveLoad } = useSavePlannerLoad();

  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("all");
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);

  // `?? []` har renderda yangi massiv beradi — useMemo qaramliklari
  // doim o'zgarib turmasligi uchun ular ham memolanadi.
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const classes = useMemo(() => data?.classes ?? [], [data]);

  const classOptions = useMemo(
    () => classes.map((cls) => ({ label: cls.name, value: cls.id })),
    [classes],
  );

  const subjectOptions = useMemo(() => {
    const seen = new Map();
    for (const row of rows) seen.set(row.subject.id, row.subject.name);
    return [
      { label: "Barcha fanlar", value: "all" },
      ...[...seen.entries()]
        .map(([value, label]) => ({ label, value }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [rows]);

  const teacherTotals = useMemo(
    () => new Map((data?.teacherTotals ?? []).map((t) => [t.teacherId, t])),
    [data],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (subjectId !== "all" && row.subject.id !== subjectId) return false;
      if (onlyIncomplete && row.warnings.length === 0) return false;
      if (!query) return true;
      return (
        row.teacher.fullName.toLowerCase().includes(query) ||
        row.subject.name.toLowerCase().includes(query)
      );
    });
  }, [rows, search, subjectId, onlyIncomplete]);

  const totals = useMemo(() => {
    const demand = rows.reduce((sum, row) => sum + row.total, 0);
    const capacity = (data?.classTotals ?? []).reduce(
      (sum, cls) => sum + cls.capacity,
      0,
    );
    const warnings = rows.filter((row) => row.warnings.length > 0).length;
    return { demand, capacity, warnings };
  }, [rows, data]);

  const handleSave = (payload) =>
    saveLoad(payload, {
      onError: (err) =>
        toast.error(err.response?.data?.message || "Saqlashda xatolik"),
    });

  if (isLoading) return <LoaderCard title="Yuklama yuklanmoqda..." />;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="search"
            value={search}
            className="pl-9"
            placeholder="O'qituvchi yoki fan..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={subjectId}
          onChange={setSubjectId}
          options={subjectOptions}
          triggerClassName="min-w-44"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Switch checked={onlyIncomplete} onChange={setOnlyIncomplete} />
          Faqat to'ldirilmagan
        </label>
      </div>

      {/* Umumiy raqamlar */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Chip label="Jami talab" value={`${totals.demand} soat`} />
        <Chip label="Sinflardagi sig'im" value={`${totals.capacity} katak`} />
        <Chip
          label="Ogohlantirish"
          value={totals.warnings}
          tone={totals.warnings > 0 ? "amber" : "gray"}
        />
      </div>

      {/* Jadval */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Satr yo'q"
          description={
            rows.length === 0
              ? "Hali birorta xodimga fan biriktirilmagan. Xodim sahifasidagi \"Fanlar\" kartasidan boshlang."
              : "Filtrga mos satr topilmadi."
          }
        />
      ) : (
        <Table columns={LOADS_TABLE_COLUMNS}>
          {filtered.map((row, index) => (
            <LoadRow
              key={`${row.teacher.id}|${row.subject.id}`}
              row={row}
              canEdit={canEdit}
              classOptions={classOptions}
              teacherTotal={teacherTotals.get(row.teacher.id)}
              isFirstOfTeacher={
                index === 0 || filtered[index - 1].teacher.id !== row.teacher.id
              }
              onSave={handleSave}
            />
          ))}
        </Table>
      )}

      {/* Sinflar kesimi — qaysi sinf jadvalga sig'maydi degan savolga javob */}
      {(data?.classTotals ?? []).length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-medium text-gray-900">Sinflar bo'yicha talab</h2>
          <div className="flex flex-wrap gap-2">
            {data.classTotals.map((cls) => {
              const over = cls.demand > cls.capacity;
              return (
                <span
                  key={cls.id}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm ${
                    over
                      ? "bg-red-50 text-red-700"
                      : cls.demand === 0
                        ? "bg-gray-100 text-gray-500"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {cls.name}
                  <span className="font-medium">
                    {cls.demand}/{cls.capacity}
                  </span>
                </span>
              );
            })}
          </div>
          <p className="text-sm text-gray-500">
            Chapdagi raqam — haftalik dars soati, o'ngdagisi — jadvaldagi
            kataklar soni. Qizil bo'lsa jadvalga sig'maydi.
          </p>
        </Card>
      )}

      {/* Fansiz xodimlar */}
      {(data?.teachersWithoutSubjects ?? []).length > 0 && (
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <TriangleAlert
              size={18}
              strokeWidth={1.5}
              className="text-amber-500"
            />
            <h2 className="font-medium text-gray-900">
              Fan biriktirilmagan xodimlar (
              {data.teachersWithoutSubjects.length})
            </h2>
          </div>
          <p className="text-sm text-gray-500">
            Ular rejalashtirishda qatnashmaydi. Dars beradiganiga xodim
            sahifasidagi "Fanlar" kartasidan fan biriktiring.
          </p>
          <div className="flex flex-wrap gap-2">
            {data.teachersWithoutSubjects.map((teacher) => (
              <Link
                key={teacher.id}
                to={`/users/${teacher.id}`}
                className="rounded-lg bg-gray-100 px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-200"
              >
                {teacher.fullName}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const Chip = ({ label, value, tone = "gray" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${
      tone === "amber" ? "bg-amber-50 text-amber-800" : "bg-white text-gray-700"
    }`}
  >
    <span className="text-gray-500">{label}:</span>
    <span className="font-medium">{value}</span>
  </span>
);

export default PlannerLoadsPage;
