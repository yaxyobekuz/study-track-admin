// React
import { useMemo, useState } from "react";

// Icons
import { Check, Loader2, Play, Search, Sparkles, BellRing, X } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputSearch from "@/shared/components/ui/input/InputSearch";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";
import { useCreateGradeAnalysis } from "../queries/gradeAnalysis.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { SCOPE_OPTIONS } from "../data/gradeAnalysis.data";
import { T } from "../data/analysis.tokens";

/**
 * TAHLILNI ISHGA TUSHIRISH.
 *
 * ⚠️ Davr oynasi serverda hisoblanadi ("oxirgi N kun", bugun ham kiradi) —
 * bu yerda faqat server qaytargan `rangeLabel` ko'rsatiladi, sana
 * frontendda qayta hisoblanmaydi.
 */
const LaunchModal = () => (
  <ResponsiveModal
    name="gradeAnalysisLaunch"
    title="Yangi tahlil"
    description="Davr va qamrovni tanlang — har bir o'quvchi uchun alohida hisobot tuziladi"
    className="max-w-2xl"
  >
    <Body />
  </ResponsiveModal>
);

const Body = ({ close, onCreated }) => {
  const { data: options, isLoading } = useQuery(gradeAnalysisQueries.options());
  const create = useCreateGradeAnalysis();

  const [period, setPeriod] = useState("week");
  const [scope, setScope] = useState("school");
  const [classIds, setClassIds] = useState(() => new Set());
  const [classFilter, setClassFilter] = useState("");
  const [student, setStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [useAi, setUseAi] = useState(true);
  const [notify, setNotify] = useState(true);

  const q = useDebounce(studentSearch.trim(), 300);
  const students = useQuery({ ...gradeAnalysisQueries.students({ q }), enabled: scope === "student" && q.length >= 2 });

  const aiAvailable = Boolean(options?.settings?.aiAvailable && options?.settings?.useAi);
  const classes = useMemo(() => options?.classes ?? [], [options?.classes]);
  const visibleClasses = useMemo(() => {
    const term = classFilter.trim().toLowerCase();
    return term ? classes.filter((row) => row.name.toLowerCase().includes(term)) : classes;
  }, [classes, classFilter]);

  const estimate =
    scope === "school"
      ? options?.totalStudents ?? 0
      : scope === "classes"
        ? classes.filter((row) => classIds.has(row.id)).reduce((sum, row) => sum + row.students, 0)
        : student
          ? 1
          : 0;

  const canSubmit =
    !create.isPending &&
    (scope === "school" || (scope === "classes" && classIds.size > 0) || (scope === "student" && student));

  const toggleClass = (id) =>
    setClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allVisibleSelected = visibleClasses.length > 0 && visibleClasses.every((row) => classIds.has(row.id));
  const toggleAllVisible = () =>
    setClassIds((prev) => {
      const next = new Set(prev);
      for (const row of visibleClasses) {
        if (allVisibleSelected) next.delete(row.id);
        else next.add(row.id);
      }
      return next;
    });

  const submit = () => {
    create.mutate(
      {
        period,
        scope,
        classIds: scope === "classes" ? [...classIds] : undefined,
        studentId: scope === "student" ? student?.id : undefined,
        useAi: aiAvailable && useAi,
        notify,
      },
      {
        onSuccess: (run) => {
          toast.success("Tahlil boshlandi — natija fonda tayyorlanadi");
          onCreated?.(run.id);
          close();
        },
        onError: (error) => toast.error(error.response?.data?.message || "Tahlilni boshlab bo'lmadi"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Davr ─────────────────────────────────────────────── */}
      <Field label="Davr">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {options?.periods.map((row) => (
            <button
              key={row.key}
              type="button"
              onClick={() => setPeriod(row.key)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-left ring-1 transition-all duration-200",
                period === row.key
                  ? "bg-slate-900 text-white ring-slate-900 shadow-[0_8px_20px_-10px_rgba(15,23,42,0.6)]"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300",
              )}
            >
              <p className="text-[13px] font-semibold">{row.label}</p>
              <p className={cn("mt-0.5 text-[10px]", period === row.key ? "text-white/60" : "text-slate-400")}>
                {row.title}
              </p>
            </button>
          ))}
        </div>
        <p className={cn(T.meta, "mt-2")}>
          Oyna: {options?.periods.find((row) => row.key === period)?.rangeLabel} — o'tgan xuddi shunday davr bilan
          solishtiriladi
        </p>
      </Field>

      {/* ── Qamrov ───────────────────────────────────────────── */}
      <Field label="Kimni tahlil qilamiz">
        <div className="grid gap-2 sm:grid-cols-3">
          {SCOPE_OPTIONS.map((row) => {
            const Icon = row.icon;
            const active = scope === row.key;
            return (
              <button
                key={row.key}
                type="button"
                onClick={() => setScope(row.key)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left ring-1 transition-all duration-200",
                  active ? "bg-indigo-50/70 ring-2 ring-indigo-500" : "bg-white ring-slate-200 hover:ring-slate-300",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-slate-900">{row.label}</span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {row.key === "school" ? `${options?.totalStudents ?? 0} o'quvchi` : row.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {scope === "classes" && (
          <div className="mt-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={classFilter}
                  onChange={(event) => setClassFilter(event.target.value)}
                  placeholder="Sinfni qidirish..."
                  className="h-9 w-full rounded-lg bg-white pl-8 pr-3 text-[13px] ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={toggleAllVisible}
                className="h-9 shrink-0 rounded-lg bg-white px-3 text-[12px] font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
              >
                {allVisibleSelected ? "Hammasini olib tashlash" : "Hammasini belgilash"}
              </button>
            </div>
            <div className="mt-2.5 grid max-h-52 grid-cols-3 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-5">
              {visibleClasses.map((row) => {
                const active = classIds.has(row.id);
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => toggleClass(row.id)}
                    className={cn(
                      "flex items-center justify-between gap-1 rounded-lg px-2.5 py-2 text-left ring-1 transition-colors duration-150",
                      active ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300",
                    )}
                  >
                    <span className="truncate text-[12.5px] font-semibold">{row.name}</span>
                    <span className={cn("text-[10.5px] tabular-nums", active ? "text-white/70" : "text-slate-400")}>
                      {active ? <Check className="size-3.5" /> : row.students}
                    </span>
                  </button>
                );
              })}
              {visibleClasses.length === 0 && <p className={cn(T.meta, "col-span-full py-3 text-center")}>Sinf topilmadi</p>}
            </div>
            <p className={cn(T.meta, "mt-2")}>{classIds.size} ta sinf tanlandi</p>
          </div>
        )}

        {scope === "student" && (
          <div className="mt-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-200/60">
            {student ? (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 ring-2 ring-indigo-500">
                <div className="min-w-0">
                  <p className={cn(T.tdName, "truncate")}>{student.name}</p>
                  <p className={T.meta}>
                    {student.className ?? "Sinfsiz"} · {student.username}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStudent(null)}
                  className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Boshqa o'quvchi"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <InputSearch
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Ism, familiya yoki login..."
                  className="h-9 bg-white"
                  autoFocus
                />
                <div className="mt-2 max-h-56 overflow-y-auto">
                  {q.length < 2 ? (
                    <p className={cn(T.meta, "py-3 text-center")}>Kamida 2 ta harf kiriting</p>
                  ) : students.isFetching && !students.data ? (
                    <p className={cn(T.meta, "py-3 text-center")}>Qidirilmoqda…</p>
                  ) : students.data?.length ? (
                    <ul className="space-y-1">
                      {students.data.map((row) => (
                        <li key={row.id}>
                          <button
                            type="button"
                            onClick={() => setStudent(row)}
                            className="flex w-full items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-left ring-1 ring-slate-200 transition-colors hover:ring-indigo-400"
                          >
                            <span className="min-w-0">
                              <span className={cn(T.tdName, "block truncate")}>{row.name}</span>
                              <span className={cn(T.meta, "block")}>{row.username}</span>
                            </span>
                            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                              {row.className ?? "—"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={cn(T.meta, "py-3 text-center")}>O'quvchi topilmadi</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Field>

      {/* ── Sozlamalar ───────────────────────────────────────── */}
      <div className="space-y-2">
        <ToggleRow
          icon={Sparkles}
          title="AI matni"
          hint={
            aiAvailable
              ? "Xulosa va tavsiyalarni AI yozadi; har bir raqam hisob-kitob bilan tekshiriladi"
              : "AI o'chirilgan — matn qoidalar asosida tuziladi"
          }
          checked={aiAvailable && useAi}
          disabled={!aiAvailable}
          onChange={setUseAi}
        />
        <ToggleRow
          icon={BellRing}
          title="Tayyor bo'lgach yuborish"
          hint="Hisobot o'quvchi va ota-onaning mobil ilovasida ochiladi va bildirishnoma boradi"
          checked={notify}
          onChange={setNotify}
        />
      </div>

      {/* ── Amal ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className={T.meta}>
          Taxminan <b className="text-slate-900">{estimate}</b> o'quvchi tahlil qilinadi
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => close()}>
            Bekor qilish
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {create.isPending ? <Loader2 className="animate-spin" /> : <Play />}
            Tahlilni boshlash
          </Button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className={cn(T.label, "mb-2")}>{label}</p>
    {children}
  </div>
);

const ToggleRow = ({ icon: Icon, title, hint, checked, disabled, onChange }) => (
  <label
    className={cn(
      "flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 ring-1 ring-slate-200",
      disabled ? "opacity-60" : "cursor-pointer hover:ring-slate-300",
    )}
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <Icon className="size-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-semibold text-slate-900">{title}</span>
      <span className="block text-[11.5px] leading-snug text-slate-500">{hint}</span>
    </span>
    <Switch checked={checked} disabled={disabled} onChange={onChange} />
  </label>
);

export default LaunchModal;
