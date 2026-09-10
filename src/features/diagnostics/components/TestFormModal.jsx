// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";

// Queries
import { classesQueries } from "@/features/classes/queries/classes.queries";
import { useCreateTest, useUpdateTest } from "../queries/diagnostics.mutations";

// Data
import {
  TEST_MODES,
  LEVELS,
  LEVEL_LABELS,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

const toInputDate = (value) => (value ? String(value).slice(0, 10) : "");

/** Mavjud testni forma holatiga aylantiradi. */
const fromTest = (test) => ({
  title: test.title ?? "",
  description: test.description ?? "",
  subjectId: test.subjectId ?? "",
  mode: test.mode ?? "timed",
  level: test.level ?? "",
  grade: test.grade ?? "",
  questionCount: test.questionCount ?? 20,
  durationMin: test.durationMin ?? 30,
  attemptsAllowed: test.attemptsAllowed ?? 1,
  shuffleQuestions: test.shuffleQuestions ?? true,
  shuffleOptions: test.shuffleOptions ?? true,
  showAnswers: test.showAnswers ?? true,
  availableFrom: toInputDate(test.availableFrom),
  availableTo: toInputDate(test.availableTo),
  classIds: (test.classes || []).map((c) => c.id),
});

const blank = () => ({
  title: "",
  description: "",
  subjectId: "",
  mode: "timed",
  level: "",
  grade: "",
  questionCount: 20,
  durationMin: 30,
  attemptsAllowed: 1,
  shuffleQuestions: true,
  shuffleOptions: true,
  showAnswers: true,
  availableFrom: "",
  availableTo: "",
  classIds: [],
});

/**
 * TEST SHABLONI FORMASI.
 *
 * ⚠️ URINISHI BOR TESTNING QOIDASI QULFLANADI (savollar soni, davomiylik,
 * rejim, qiyinlik, fan) — server ham buni rad etadi. Sabab: birinchi
 * o'quvchi 20 savolga javob bergan, ikkinchisi 30 tasini olardi va
 * ikkalasining natijasi bitta jadvalda taqqoslanardi.
 */
const TestFormModal = () => (
  <ResponsiveModal
    name="diagnosticTest"
    title="Diagnostika testi"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, test }) => {
  const isEdit = Boolean(test?.id);
  const locked = isEdit && (test?.attemptCount ?? 0) > 0;

  const { data: subjects = [] } = useSubjects();
  const { data: classes = [] } = useQuery(classesQueries.list());

  const [form, setForm] = useState(() => (test?.id ? fromTest(test) : blank()));
  const { mutate: createTest } = useCreateTest();
  const { mutate: updateTest } = useUpdateTest();

  // ⚠️ Effekt emas, RENDER PAYTIDA moslash (`QuestionFormModal` dagi
  // izohga qarang) — oyna ochilganda forma bo'sh holda bir marta
  // chizilib, keyin to'lib "sakramaydi".
  const [loadedId, setLoadedId] = useState(test?.id ?? null);
  if (loadedId !== (test?.id ?? null)) {
    setLoadedId(test?.id ?? null);
    setForm(test?.id ? fromTest(test) : blank());
  }

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleClass = (classId) =>
    setForm((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.title.trim().length < 2) {
      toast.error("Test nomini kiriting");
      return;
    }
    if (form.availableFrom && form.availableTo && form.availableFrom >= form.availableTo) {
      toast.error("Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      subjectId: form.subjectId || null,
      mode: form.mode,
      level: form.level || null,
      grade: form.grade === "" ? null : Number(form.grade),
      questionCount: Number(form.questionCount),
      durationMin: Number(form.durationMin),
      attemptsAllowed: Number(form.attemptsAllowed),
      shuffleQuestions: form.shuffleQuestions,
      shuffleOptions: form.shuffleOptions,
      showAnswers: form.showAnswers,
      // ⚠️ Bo'sh sana `null` bo'lib ketadi — bo'sh satr serverda
      // "noto'g'ri sana" xatosini berardi.
      availableFrom: form.availableFrom || null,
      availableTo: form.availableTo || null,
      classIds: form.classIds,
    };

    setIsLoading(true);
    const onDone = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Test yangilandi" : "Test yaratildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updateTest({ id: test.id, data: payload }, onDone);
    else createTest(payload, onDone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {locked && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Testda {test.attemptCount} ta urinish bor — savollar soni, davomiylik,
          rejim, qiyinlik va fanni o'zgartirib bo'lmaydi. Nomi, sinflar va
          ochiq oynasini o'zgartirish mumkin.
        </p>
      )}

      <InputField
        required
        name="title"
        label="Test nomi"
        value={form.title}
        onChange={(e) => setField("title", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        <SelectField
          name="subjectId"
          label="Fan"
          placeholder="Barcha fanlar"
          value={form.subjectId}
          disabled={locked}
          options={[
            { value: "", label: "Barcha fanlar (aralash)" },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
          onChange={(value) => setField("subjectId", value)}
        />

        <SelectField
          name="grade"
          label="Sinf darajasi"
          value={String(form.grade)}
          disabled={locked}
          options={[
            { value: "", label: "Belgilanmagan" },
            ...Array.from({ length: 11 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1}-sinf`,
            })),
          ]}
          onChange={(value) => setField("grade", value)}
        />
      </div>

      {/* ── REJIM ──────────────────────────── */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">Rejim</p>
        <div className="grid grid-cols-2 gap-2 xs:grid-cols-4">
          {TEST_MODES.map((mode) => {
            const Icon = mode.icon;
            const active = form.mode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                disabled={locked}
                onClick={() => setField("mode", mode.value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors disabled:opacity-50",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <Icon
                  className={cn("size-5", active ? "text-primary" : "text-gray-400")}
                  strokeWidth={1.5}
                />
                <p className="mt-1.5 text-sm font-medium text-gray-900">
                  {mode.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{mode.description}</p>
              </button>
            );
          })}
        </div>
        {form.mode === "adaptive" && (
          <p className="mt-1.5 text-xs text-gray-400">
            Adaptiv rejimda savollar bittalab beriladi va qiyinlik javobga
            qarab moslashadi — savollar soni oldindan belgilanmaydi.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-3">
        <InputField
          type="number"
          name="questionCount"
          label="Savollar soni"
          min={1}
          max={100}
          value={form.questionCount}
          disabled={locked || form.mode === "adaptive"}
          onChange={(e) => setField("questionCount", e.target.value)}
        />

        <InputField
          type="number"
          name="durationMin"
          label="Davomiylik (daq.)"
          min={1}
          max={300}
          value={form.durationMin}
          disabled={locked || form.mode === "practice" || form.mode === "adaptive"}
          description={
            form.mode === "practice" || form.mode === "adaptive"
              ? "Bu rejimda vaqt cheklanmaydi"
              : ""
          }
          onChange={(e) => setField("durationMin", e.target.value)}
        />

        <InputField
          type="number"
          name="attemptsAllowed"
          label="Urinishlar"
          min={1}
          max={20}
          value={form.attemptsAllowed}
          onChange={(e) => setField("attemptsAllowed", e.target.value)}
        />
      </div>

      <SelectField
        name="level"
        label="Qiyinlik"
        value={form.level}
        disabled={locked}
        options={[
          { value: "", label: "Aralash (bankdagi barcha darajalar)" },
          ...LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] })),
        ]}
        onChange={(value) => setField("level", value)}
      />

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        <InputField
          type="date"
          name="availableFrom"
          label="Ochilish sanasi"
          value={form.availableFrom}
          onChange={(e) => setField("availableFrom", e.target.value)}
        />
        <InputField
          type="date"
          name="availableTo"
          label="Yopilish sanasi"
          value={form.availableTo}
          onChange={(e) => setField("availableTo", e.target.value)}
        />
      </div>

      {/* ── SINFLAR ────────────────────────── */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">
          Sinflar
          <span className="ml-1 font-normal text-gray-400">
            (tanlanmasa — butun maktabga ochiq)
          </span>
        </p>
        <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
          {classes.map((klass) => {
            const active = form.classIds.includes(klass.id);
            return (
              <button
                key={klass.id}
                type="button"
                onClick={() => toggleClass(klass.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                  active
                    ? "bg-primary text-white ring-primary"
                    : "bg-white text-gray-600 ring-gray-200 hover:ring-gray-300",
                )}
              >
                {klass.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BAYROQLAR ──────────────────────── */}
      <div className="space-y-2.5 rounded-xl bg-gray-50 p-3">
        <ToggleRow
          label="Savollarni aralashtirish"
          checked={form.shuffleQuestions}
          disabled={form.mode === "adaptive"}
          onChange={(v) => setField("shuffleQuestions", v)}
        />
        <ToggleRow
          label="Variantlarni aralashtirish"
          checked={form.shuffleOptions}
          onChange={(v) => setField("shuffleOptions", v)}
        />
        <ToggleRow
          label="Natijada to'g'ri javoblarni ko'rsatish"
          hint="Diagnostikaning maqsadi baho qo'yish emas, kamchilikni ko'rsatish"
          checked={form.showAnswers}
          onChange={(v) => setField("showAnswers", v)}
        />
      </div>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full xs:w-32"
          onClick={close}
        >
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          {isEdit ? "Saqlash" : "Yaratish"}
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

const ToggleRow = ({ label, hint, checked, disabled, onChange }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-sm text-gray-800">{label}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
    <Switch checked={checked} disabled={disabled} onChange={onChange} />
  </div>
);

export default TestFormModal;
