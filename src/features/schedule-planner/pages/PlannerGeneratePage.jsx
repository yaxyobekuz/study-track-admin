// Toast
import { toast } from "sonner";

// React
import { useMemo, useState } from "react";

// Router
import { Link, useNavigate } from "react-router-dom";

// Icons
import { Dices, Sparkles, Trash2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Table, { Td, Tr } from "@/shared/components/ui/Table";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import InputField from "@/shared/components/ui/input/InputField";
import PreflightPanel from "../components/PreflightPanel";
import UnplacedList from "../components/UnplacedList";

// Queries
import {
  usePlannerRuns,
  usePlannerLoads,
  usePlannerSettings,
  usePlannerPreflight,
} from "../queries/planner.queries";
import {
  useDeleteRun,
  useGeneratePlan,
  useUpdatePlannerSettings,
} from "../queries/planner.mutations";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Data
import { RUNS_TABLE_COLUMNS } from "../data/plannerColumns.data";

/**
 * "Shakllantirish" tab — tayyorgarlik, tugma va variantlar ro'yxati.
 *
 * Tayyorgarlik ATAYLAB tugmadan yuqorida: nima uchun jadval chiqmasligini
 * shakllantirgandan KEYIN emas, oldin ko'rsatish kerak.
 */
const PlannerGeneratePage = () => {
  const navigate = useNavigate();

  const { data: preflight, isLoading: preflightLoading } = usePlannerPreflight();
  const { data: runs = [], isLoading: runsLoading } = usePlannerRuns();
  const { data: loads } = usePlannerLoads();
  const { data: settingsData } = usePlannerSettings();

  const { mutate: generate, isPending: isGenerating } = useGeneratePlan();
  const { mutate: deleteRun } = useDeleteRun();
  const { mutate: updateSettings } = useUpdatePlannerSettings();

  const [name, setName] = useState("");
  const [keepPinned, setKeepPinned] = useState(true);
  const [result, setResult] = useState(null);

  const seed = settingsData?.settings?.seed ?? 1;
  const latestRun = runs[0];
  const blocked = (preflight?.blocking ?? []).length > 0;

  // Joylashmaganlar ro'yxatini odam o'qiydigan nomlarga aylantirish uchun.
  const refs = useMemo(() => {
    const subjects = new Map();
    const teachers = new Map();
    for (const row of loads?.rows ?? []) {
      subjects.set(row.subject.id, row.subject.name);
      teachers.set(row.teacher.id, row.teacher.fullName);
    }
    return {
      classes: loads?.classes ?? [],
      subjects: [...subjects].map(([id, name]) => ({ id, name })),
      teachers: [...teachers].map(([id, fullName]) => ({ id, fullName })),
    };
  }, [loads]);

  const run = (extra = {}) =>
    generate(
      {
        name: name.trim() || undefined,
        basedOnRunId: keepPinned && latestRun ? latestRun.id : undefined,
        ...extra,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setName("");
          toast.success(
            `Jadval shakllantirildi: ${data.stats.placed}/${data.stats.demand} dars`,
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Shakllantirishda xatolik"),
      },
    );

  /** Boshqa variant — seed o'zgarsa joylashtirish ham boshqacha chiqadi. */
  const runAnother = () =>
    updateSettings(
      { seed: (seed % 999999) + 1 },
      {
        onSuccess: () => run(),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

  const handleDelete = (id) =>
    deleteRun(id, {
      onSuccess: () => toast.success("Variant o'chirildi"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });

  if (preflightLoading) return <LoaderCard title="Tekshirilmoqda..." />;

  return (
    <div className="space-y-4">
      {/* 1. Tayyorgarlik */}
      <PreflightPanel preflight={preflight} />

      {/* 2. Shakllantirish */}
      <Card className="space-y-4">
        <div>
          <h2 className="font-medium text-gray-900">Jadval shakllantirish</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Har shakllantirish YANGI variant yaratadi — eskisi joyida qoladi va
            ikkalasini solishtirib ko'rish mumkin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Variant nomi"
            value={name}
            placeholder={`${runs.length + 1}-variant`}
            description="Bo'sh qoldirilsa tartib raqami bilan nomlanadi"
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col justify-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Switch
                checked={keepPinned}
                onChange={setKeepPinned}
                disabled={!latestRun}
              />
              Qadalgan darslar joyida qolsin
            </label>
            <p className="text-xs text-gray-500">
              {latestRun
                ? `Oxirgi variant ("${latestRun.name}") dagi qadalgan darslar yangi jadvalga ko'chiriladi.`
                : "Hali variant yo'q — qadalgan dars ham yo'q."}
            </p>
          </div>
        </div>

        {blocked && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            Yuqoridagi to'siqlar bartaraf etilmaguncha jadval shakllantirilmaydi.
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-3.5">
          <Button
            variant="outline"
            onClick={runAnother}
            disabled={blocked || isGenerating}
          >
            <Dices className="size-4" strokeWidth={1.5} />
            Boshqa variant
          </Button>

          <Button onClick={() => run()} disabled={blocked || isGenerating}>
            <Sparkles className="size-4" strokeWidth={1.5} />
            Shakllantirish{isGenerating && "..."}
          </Button>
        </div>
      </Card>

      {/* 3. Oxirgi natija */}
      {result && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium text-gray-900">Natija</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {result.stats.placed} / {result.stats.demand} dars joylashtirildi
                · sinf oynasi {result.stats.classGaps} · o'qituvchi oynasi{" "}
                {result.stats.teacherGaps}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                navigate(`/schedule-planner/timetable?run=${result.runId}`)
              }
            >
              Jadvalni ko'rish
            </Button>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${
                result.stats.fillRate === 100 ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${result.stats.fillRate}%` }}
            />
          </div>

          <UnplacedList
            items={result.unplaced ?? []}
            classes={refs.classes}
            subjects={refs.subjects}
            teachers={refs.teachers}
          />
        </Card>
      )}

      {/* 4. Variantlar */}
      <div className="space-y-3">
        <h2 className="font-medium text-gray-900">Variantlar</h2>

        {runsLoading ? (
          <LoaderCard title="Variantlar yuklanmoqda..." />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Hali variant yo'q"
            description="Yuqoridagi tugma bilan birinchi jadvalni shakllantiring."
          />
        ) : (
          <Table columns={RUNS_TABLE_COLUMNS}>
            {runs.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium">
                  <Link
                    to={`/schedule-planner/timetable?run=${item.id}`}
                    className="hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </Td>
                <Td className="text-gray-500">
                  {formatDateTimeUz(item.createdAt)}
                </Td>
                <Td align="center">
                  <span
                    className={`inline-flex rounded-lg px-2 py-0.5 text-sm font-medium ${
                      item.stats?.fillRate === 100
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {item.stats?.fillRate ?? 0}%
                  </span>
                </Td>
                <Td align="center">{item.unplacedCount}</Td>
                <Td align="center" className="text-gray-500">
                  {(item.stats?.classGaps ?? 0) + (item.stats?.teacherGaps ?? 0)}
                </Td>
                <Td align="right">
                  <button
                    type="button"
                    title="O'chirish"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

export default PlannerGeneratePage;
