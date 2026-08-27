// Toast
import { toast } from "sonner";

// React
import { useMemo, useState } from "react";

// Icons
import { CalendarClock, Eraser, Wand2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import SearchableListPanel from "@/shared/components/ui/SearchableListPanel";
import AvailabilityMatrix from "../components/AvailabilityMatrix";
import AvailabilityTeacherGrid from "../components/AvailabilityTeacherGrid";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Queries
import { usePlannerAvailability } from "../queries/planner.queries";
import {
  useToggleSlot,
  useSetAvailability,
  useFillFromWorkSchedule,
} from "../queries/planner.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { AVAILABILITY_VIEWS } from "../data/planner.data";

/**
 * "Bandlik" tab — kim qachon band, ya'ni qaysi katakka dars qo'yib bo'lmaydi.
 *
 * Ikki ko'rinish bir xil ma'lumotni ko'rsatadi va IKKALASIDA ham tahrirlash
 * mumkin: matritsa butun manzarani beradi ("shu soatda kim bo'sh?"),
 * o'qituvchi ko'rinishi esa bitta odamni tez to'ldirish uchun qulay.
 */
const PlannerAvailabilityPage = () => {
  const { can } = usePermissions();
  const canEdit = can("planner.availability");

  const { data, isLoading } = usePlannerAvailability();
  const { mutate: toggleSlot } = useToggleSlot();
  const { mutate: setAvailability } = useSetAvailability();
  const { mutate: fillFromWork, isPending: isFilling } = useFillFromWorkSchedule();

  const [view, setView] = useState("matrix");
  const [subjectId, setSubjectId] = useState("all");
  const [teacherId, setTeacherId] = useState(null);

  const teachers = useMemo(() => data?.teachers ?? [], [data]);
  const days = useMemo(() => data?.days ?? [], [data]);
  const periods = useMemo(() => data?.periods ?? [], [data]);

  const subjectOptions = useMemo(() => {
    const seen = new Map();
    for (const teacher of teachers) {
      for (const subject of teacher.subjects) seen.set(subject.id, subject.name);
    }
    return [
      { label: "Barcha fanlar", value: "all" },
      ...[...seen.entries()]
        .map(([value, label]) => ({ label, value }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [teachers]);

  const visibleTeachers = useMemo(() => {
    if (subjectId === "all") return teachers;
    return teachers.filter((teacher) =>
      teacher.subjects.some((subject) => subject.id === subjectId),
    );
  }, [teachers, subjectId]);

  const selected =
    visibleTeachers.find((teacher) => teacher.id === teacherId) ??
    visibleTeachers[0] ??
    null;

  const handleToggle = (id, day, order) =>
    toggleSlot(
      { teacherId: id, day, order },
      {
        onError: (err) =>
          toast.error(err.response?.data?.message || "Saqlashda xatolik"),
      },
    );

  /** Bir necha katakni bir yo'la band/bo'sh qilish (kun yoki dars qatori). */
  const handleBulk = (slots, makeBusy) => {
    if (!selected) return;
    const current = new Set(selected.busy.map((s) => `${s.day}|${s.order}`));
    for (const slot of slots) {
      const key = `${slot.day}|${slot.order}`;
      if (makeBusy) current.add(key);
      else current.delete(key);
    }
    const noteByKey = new Map(
      selected.busy.map((s) => [`${s.day}|${s.order}`, s.note]),
    );
    setAvailability(
      {
        teacherId: selected.id,
        slots: [...current].map((key) => {
          const [day, order] = key.split("|");
          return { day, order: Number(order), note: noteByKey.get(key) ?? null };
        }),
      },
      {
        onError: (err) =>
          toast.error(err.response?.data?.message || "Saqlashda xatolik"),
      },
    );
  };

  const handleClear = () => {
    if (!selected) return;
    setAvailability(
      { teacherId: selected.id, slots: [] },
      {
        onSuccess: () => toast.success("Bandlik tozalandi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  const handleFill = () => {
    if (!selected) return;
    fillFromWork(selected.id, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  if (isLoading) return <LoaderCard title="Bandlik yuklanmoqda..." />;

  if (teachers.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Xodim topilmadi"
        description="Bandlik belgilash uchun avval xodimlar ro'yxatini to'ldiring."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <TabsButtons
          value={view}
          onChange={setView}
          items={AVAILABILITY_VIEWS}
        />

        <Select
          value={subjectId}
          onChange={setSubjectId}
          options={subjectOptions}
          triggerClassName="min-w-44"
        />

        <div className="ml-auto flex items-center gap-3 text-xs text-gray-600">
          <Legend className="bg-gray-200" label="Bo'sh" />
          <Legend className="bg-red-400" label="Band" />
        </div>
      </div>

      {view === "matrix" ? (
        <>
          <AvailabilityMatrix
            days={days}
            periods={periods}
            canEdit={canEdit}
            teachers={visibleTeachers}
            slotSummary={data?.slotSummary ?? []}
            onToggle={handleToggle}
          />
          <p className="text-sm text-gray-500">
            Pastdagi qator — o'sha katakda bo'sh o'qituvchilar soni. Katakni
            bosib band/bo'sh holatini o'zgartirasiz.
          </p>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
          <SearchableListPanel
            items={visibleTeachers}
            placeholder="O'qituvchini qidirish..."
            emptyText="O'qituvchi topilmadi"
            searchText={(teacher) => teacher.fullName}
            renderItem={(teacher) => (
              <button
                type="button"
                onClick={() => setTeacherId(teacher.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-left transition-colors",
                  selected?.id === teacher.id
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100",
                )}
              >
                <span className="block truncate font-medium">
                  {teacher.fullName}
                </span>
                <span
                  className={cn(
                    "block truncate text-xs",
                    selected?.id === teacher.id
                      ? "text-white/80"
                      : "text-gray-500",
                  )}
                >
                  {teacher.busy.length > 0
                    ? `${teacher.busy.length} ta band katak`
                    : "Band katak yo'q"}
                </span>
              </button>
            )}
          />

          <div className="space-y-3">
            {selected && (
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium text-gray-900">
                    {selected.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selected.subjects.map((s) => s.name).join(", ") ||
                      "Fan biriktirilmagan"}
                  </p>
                </div>

                {canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleFill}
                      disabled={isFilling}
                    >
                      <Wand2 className="size-4" strokeWidth={1.5} />
                      Ish jadvalidan to'ldirish
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleClear}>
                      <Eraser className="size-4" strokeWidth={1.5} />
                      Tozalash
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {selected && (
              <AvailabilityTeacherGrid
                days={days}
                periods={periods}
                busy={selected.busy}
                canEdit={canEdit}
                onToggle={(day, order) => handleToggle(selected.id, day, order)}
                onBulk={handleBulk}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Legend = ({ className, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`size-3 rounded ${className}`} />
    {label}
  </span>
);

export default PlannerAvailabilityPage;
