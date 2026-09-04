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
import TimetableBoard from "../components/TimetableBoard";
import UnplacedList from "../components/UnplacedList";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// API
import { plannerAPI } from "../api/planner.api";

// Queries
import { usePlannerRun, usePlannerRuns } from "../queries/planner.queries";
import { useUpdateLesson } from "../queries/planner.mutations";

// Helpers
import { indexLessons, slotState, toBusySet } from "../helpers/planner.helpers";

/** "Barcha sinf" filtri — sinf id'lari bilan chalkashmaydigan qiymat. */
const ALL = "all";

/**
 * "Dars jadvali" tab — shakllantirilgan variantning natijasi.
 *
 * ⚠️ Bu AMALDAGI dars jadvali EMAS: bu yerda qilingan ko'chirish
 * `/schedules` ga tegmaydi.
 *
 * KO'RINISH BITTA, FILTR BITTA. Ilgari uchta ko'rinish bor edi ("Sinf
 * bo'yicha / O'qituvchi bo'yicha / Umumiy") va ularning har biri boshqacha
 * chizilardi — foydalanuvchi avval "qaysi ko'rinishda qarayman" degan
 * savolni hal qilishi kerak edi. Endi savol bitta va tabiiy: QAYSI SINF?
 * "Barcha" — hamma sinf yonma-yon, sinf tanlansa — o'sha sinfning haftasi.
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
  const classes = useMemo(() => run?.classes ?? [], [run]);

  const byClass = useMemo(() => indexLessons(lessons, (l) => l.class.id), [lessons]);
  const byTeacher = useMemo(
    () => indexLessons(lessons, (l) => l.teacher.id),
    [lessons],
  );
  const busySet = useMemo(() => toBusySet(run?.busy ?? []), [run]);

  // Filtr URL'da: sahifa yangilanganda yoki havola ulashilganda o'sha sinf
  // ochilib turadi. Variant tanlovi ham shu yerda — ikkalasi bir-birini
  // o'chirib yubormasligi uchun mavjud parametrlar nusxalanadi.
  const rawFilter = params.get("class") || ALL;
  const classFilter =
    rawFilter !== ALL && !classes.some((cls) => cls.id === rawFilter)
      ? ALL
      : rawFilter;

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
    setSelectedId(null);
  };

  const visibleClasses =
    classFilter === ALL
      ? classes
      : classes.filter((cls) => cls.id === classFilter);

  const selected = lessons.find((l) => l.id === selectedId) ?? null;

  const lessonAt = (classId, day, order) =>
    byClass.get(`${classId}|${day}|${order}`) ?? null;

  // ⚠️ Belgilar FAQAT tanlangan darsning O'Z sinfi ustunida yonadi.
  // Aks holda "Barcha" ko'rinishida boshqa sinfning bo'sh katagi ham yashil
  // bo'lib, u yerga ko'chirish mumkindek tuyulardi.
  const stateAt = (classId, day, order) => {
    if (!selected || classId !== selected.class.id) return null;
    return slotState({ selected, day, order, byClass, byTeacher, busySet });
  };

  const handleSlotClick = (classId, day, order, lesson) => {
    if (!selected) {
      if (lesson && canEdit) setSelectedId(lesson.id);
      return;
    }

    // O'zini bosish — tanlovni bekor qiladi.
    if (lesson && lesson.id === selected.id) {
      setSelectedId(null);
      return;
    }

    // Dars faqat O'Z sinfi ichida ko'chadi. Boshqa sinfning darsi bosilsa —
    // uni tanlaymiz (bu tabiiy harakat: "endi buni ko'chiraman").
    if (classId !== selected.class.id) {
      if (lesson) setSelectedId(lesson.id);
      else toast.error("Dars faqat o'z sinfi ichida ko'chiriladi");
      return;
    }

    const state = slotState({
      selected,
      day,
      order,
      byClass,
      byTeacher,
      busySet,
    });

    if (state === "current") {
      setSelectedId(null);
      return;
    }

    if (state === "blocked") {
      toast.error("Bu katakka ko'chirib bo'lmaydi");
      return;
    }

    updateLesson(
      { runId, lessonId: selected.id, data: { day, order } },
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

  return (
    <div className="space-y-3">
      {/* Sinf filtri + variant. Ikkalasi yonma-yon: "qaysi sinf" va
          "qaysi variant" — sahifadagi yagona ikki savol. */}
      <div className="flex flex-wrap items-center gap-2">
        <TabsButtons
          value={classFilter}
          onChange={(value) => setParam("class", value)}
          className="max-w-full"
          listClassName="max-w-full hidden-scrollbar"
          items={[
            { value: ALL, label: "Barcha" },
            ...classes.map((cls) => ({ value: cls.id, label: cls.name })),
          ]}
        />

        <Select
          value={runId}
          triggerClassName="min-w-40 rounded-full"
          onChange={(value) => setParam("run", value)}
          options={runs.map((item) => ({
            label: `${item.name} · ${item.stats?.fillRate ?? 0}%`,
            value: item.id,
          }))}
        />

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
            Yashil katakka bosing — ko`chadi, sariqqa bosing — almashadi.
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

      <TimetableBoard
        classes={visibleClasses}
        days={days}
        periods={periods}
        canEdit={canEdit}
        lessonAt={lessonAt}
        stateAt={stateAt}
        selectedId={selectedId}
        onSlotClick={handleSlotClick}
        onTogglePin={handleTogglePin}
      />

      {/* Statistika + joylashmaganlar */}
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <Stat label="Joylashtirildi" value={`${run?.stats?.placed ?? 0} dars`} />
          <Stat label="To`ldirilgan" value={`${run?.stats?.fillRate ?? 0}%`} />
          <Stat label="Sinf oynasi" value={run?.stats?.classGaps ?? 0} />
          <Stat label="O`qituvchi oynasi" value={run?.stats?.teacherGaps ?? 0} />
        </div>

        <UnplacedList
          items={run?.unplaced ?? []}
          classes={classes}
          subjects={[
            ...new Map(lessons.map((l) => [l.subject.id, l.subject])).values(),
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
