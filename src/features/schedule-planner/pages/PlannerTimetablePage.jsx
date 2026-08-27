// Toast
import { toast } from "sonner";

// React
import { useEffect, useMemo, useState } from "react";

// Router
import { useNavigate, useSearchParams } from "react-router-dom";

// Icons
import { CalendarRange, Download, Printer } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";
import TimetableGrid from "../components/TimetableGrid";
import TimetableDayMatrix from "../components/TimetableDayMatrix";
import UnplacedList from "../components/UnplacedList";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// API
import { plannerAPI } from "../api/planner.api";

// Queries
import { usePlannerRun, usePlannerRuns } from "../queries/planner.queries";
import { useUpdateLesson } from "../queries/planner.mutations";

// Helpers
import { indexLessons, slotState, toBusySet, busyKey } from "../helpers/planner.helpers";

// Data
import { DAY_LABEL, TIMETABLE_VIEWS } from "../data/planner.data";

/**
 * "Dars jadvali" tab — shakllantirilgan variantning natijasi.
 *
 * Bu jadval AMALDAGI dars jadvali EMAS: bu yerda qilingan ko'chirish
 * `/schedules` ga tegmaydi.
 */
const PlannerTimetablePage = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canEdit = can("planner.generate");

  const [params, setParams] = useSearchParams();
  const { data: runs = [], isLoading: runsLoading } = usePlannerRuns();

  const runId = params.get("run") || runs[0]?.id || null;
  const { data: run, isLoading } = usePlannerRun(runId);
  const { mutate: updateLesson } = useUpdateLesson();

  const [view, setView] = useState("class");
  const [classId, setClassId] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [day, setDay] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Esc — tanlovni bekor qiladi.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const lessons = useMemo(() => run?.lessons ?? [], [run]);
  const days = useMemo(() => run?.days ?? [], [run]);
  const periods = useMemo(() => run?.periods ?? [], [run]);

  const byClass = useMemo(() => indexLessons(lessons, (l) => l.class.id), [lessons]);
  const byTeacher = useMemo(
    () => indexLessons(lessons, (l) => l.teacher.id),
    [lessons],
  );
  const busySet = useMemo(() => toBusySet(run?.busy ?? []), [run]);

  const activeClass = classId ?? run?.classes?.[0]?.id ?? null;
  const activeTeacher = teacherId ?? run?.teachers?.[0]?.id ?? null;
  const activeDay = day ?? days[0] ?? null;

  const selected = lessons.find((l) => l.id === selectedId) ?? null;

  const handleCellClick = (cellDay, order, lesson) => {
    // Tanlangan dars yo'q — bosilgan darsni tanlaymiz.
    if (!selected) {
      if (lesson && canEdit) setSelectedId(lesson.id);
      return;
    }

    // O'zini bosish — tanlovni bekor qiladi.
    if (lesson && lesson.id === selected.id) {
      setSelectedId(null);
      return;
    }

    const state = slotState({
      selected,
      day: cellDay,
      order,
      byClass,
      byTeacher,
      busySet,
    });

    if (state === "blocked") {
      // Boshqa sinfning darsini bosgan bo'lsa — o'shani tanlaymiz.
      if (lesson && lesson.class.id !== selected.class.id) {
        setSelectedId(lesson.id);
        return;
      }
      toast.error("Bu katakka ko'chirib bo'lmaydi");
      return;
    }

    updateLesson(
      { runId, lessonId: selected.id, data: { day: cellDay, order } },
      {
        onSuccess: (res) => {
          setSelectedId(null);
          (res?.data?.warnings ?? []).forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Ko'chirib bo'lmadi"),
      },
    );
  };

  const handleTogglePin = (lesson) =>
    updateLesson(
      { runId, lessonId: lesson.id, data: { isPinned: !lesson.isPinned } },
      {
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

  const handleExport = async () => {
    try {
      const response = await plannerAPI.exportRun(runId);
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `dars_jadvali_rejasi_${run.name}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Eksport qilishda xatolik");
    }
  };

  if (runsLoading || (runId && isLoading)) {
    return <LoaderCard title="Jadval yuklanmoqda..." />;
  }

  if (!runId) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="Hali jadval shakllantirilmagan"
        description="Avval o'qituvchilarning soatlari va bandligini belgilang, so'ng jadvalni shakllantiring."
        action={
          <Button onClick={() => navigate("/schedule-planner/generate")}>
            Shakllantirishga o'tish
          </Button>
        }
      />
    );
  }

  // Ko'rinishga qarab gridga beriladigan darslar.
  const cellFor = (cellDay, order) => {
    if (view === "teacher") {
      return byTeacher.get(`${activeTeacher}|${cellDay}|${order}`) ?? null;
    }
    return byClass.get(`${activeClass}|${cellDay}|${order}`) ?? null;
  };

  const stateFor = (cellDay, order) => {
    // O'qituvchi ko'rinishida band kataklar shtrixlanadi — jadvalda bo'sh
    // ko'ringan katak aslida bo'sh emasligi darrov ko'rinsin.
    if (view === "teacher" && busySet.has(busyKey(activeTeacher, cellDay, order))) {
      return "busy";
    }
    if (!selected) return null;
    return slotState({
      selected,
      day: cellDay,
      order,
      byClass,
      byTeacher,
      busySet,
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={runId}
          triggerClassName="min-w-44"
          onChange={(value) => {
            setParams({ run: value });
            setSelectedId(null);
          }}
          options={runs.map((item) => ({
            label: `${item.name} · ${item.stats?.fillRate ?? 0}%`,
            value: item.id,
          }))}
        />

        <TabsButtons value={view} onChange={setView} items={TIMETABLE_VIEWS} />

        {view === "class" && (
          <Select
            value={activeClass}
            onChange={setClassId}
            triggerClassName="min-w-36"
            options={(run?.classes ?? []).map((cls) => ({
              label: cls.name,
              value: cls.id,
            }))}
          />
        )}

        {view === "teacher" && (
          <Select
            value={activeTeacher}
            onChange={setTeacherId}
            triggerClassName="min-w-48"
            options={(run?.teachers ?? []).map((teacher) => ({
              label: teacher.fullName,
              value: teacher.id,
            }))}
          />
        )}

        {view === "all" && (
          <Select
            value={activeDay}
            onChange={setDay}
            triggerClassName="min-w-36"
            options={days.map((value) => ({
              label: DAY_LABEL[value] ?? value,
              value,
            }))}
          />
        )}

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" strokeWidth={1.5} />
            Chop etish
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="size-4" strokeWidth={1.5} />
            Eksport
          </Button>
        </div>
      </div>

      {/* Tanlangan dars haqida yo'riqnoma */}
      {selected && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium text-gray-900">
            {selected.subject.name} · {selected.class.name}
          </span>
          <span className="text-gray-600">
            Yashil katakka bosing — ko'chadi, sariqqa bosing — almashadi.
          </span>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="ml-auto text-gray-500 underline hover:text-gray-700"
          >
            Bekor qilish (Esc)
          </button>
        </div>
      )}

      {/* Jadval */}
      {view === "all" ? (
        <TimetableDayMatrix
          classes={run?.classes ?? []}
          periods={periods}
          lessonAt={(id, order) =>
            byClass.get(`${id}|${activeDay}|${order}`) ?? null
          }
        />
      ) : (
        <TimetableGrid
          days={days}
          periods={periods}
          canEdit={canEdit}
          cellFor={cellFor}
          stateFor={stateFor}
          selectedId={selectedId}
          onCellClick={handleCellClick}
          onTogglePin={handleTogglePin}
          secondaryOf={(lesson) =>
            view === "teacher" ? lesson.class.name : lesson.teacher.fullName
          }
        />
      )}

      {/* Statistika + joylashmaganlar */}
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <Stat label="Joylashtirildi" value={`${run?.stats?.placed ?? 0} dars`} />
          <Stat label="To'ldirilgan" value={`${run?.stats?.fillRate ?? 0}%`} />
          <Stat label="Sinf oynasi" value={run?.stats?.classGaps ?? 0} />
          <Stat label="O'qituvchi oynasi" value={run?.stats?.teacherGaps ?? 0} />
        </div>

        <UnplacedList
          items={run?.unplaced ?? []}
          classes={run?.classes ?? []}
          subjects={[
            ...new Map(
              lessons.map((l) => [l.subject.id, l.subject]),
            ).values(),
          ]}
          teachers={run?.teachers ?? []}
        />
      </Card>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1">
    <span className="text-gray-500">{label}:</span>
    <span className="font-medium text-gray-900">{value}</span>
  </span>
);

export default PlannerTimetablePage;
