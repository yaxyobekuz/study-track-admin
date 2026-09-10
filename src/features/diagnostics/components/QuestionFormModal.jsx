// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Plus, Trash2, Check } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { useSubjectTopics } from "@/features/subjects/queries/topics.queries";

// Queries
import {
  useCreateQuestion,
  useUpdateQuestion,
} from "../queries/diagnostics.mutations";

// Data
import {
  LEVELS,
  LEVEL_LABELS,
  QUESTION_TYPES,
  typeNeedsOptions,
} from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

const EMPTY_OPTION = { text: "", isCorrect: false };

/** Mavjud savolni forma holatiga aylantiradi. */
const fromQuestion = (question) => ({
  text: question.text ?? "",
  subjectId: question.subjectId ?? "",
  topicId: question.topicId ?? "",
  type: question.type ?? "single",
  difficulty: question.difficulty ?? "medium",
  grade: question.grade ?? "",
  points: question.points ?? 1,
  estimatedTime: question.estimatedTime ?? 60,
  explanation: question.explanation ?? "",
  solution: question.solution ?? "",
  options: (question.options || []).length
    ? question.options.map((o) => ({
        text: o.text ?? "",
        isCorrect: Boolean(o.isCorrect),
      }))
    : [{ ...EMPTY_OPTION }, { ...EMPTY_OPTION }],
  acceptedAnswers: (question.acceptedAnswers || []).length
    ? question.acceptedAnswers
    : [""],
});

const blankState = () => ({
  text: "",
  subjectId: "",
  topicId: "",
  type: "single",
  difficulty: "medium",
  grade: "",
  points: 1,
  estimatedTime: 60,
  explanation: "",
  solution: "",
  options: [{ ...EMPTY_OPTION }, { ...EMPTY_OPTION }],
  acceptedAnswers: [""],
});

/**
 * SAVOL FORMASI — yaratish va tahrirlash uchun BITTA oyna.
 *
 * ⚠️ IKKITA ALOHIDA OYNA YOZILMADI: forma murakkab (dinamik variantlar,
 * turga qarab o'zgaradigan maydonlar) va ikki nusxa bo'lsa, ulardan
 * biriga qo'shilgan tekshiruv ikkinchisiga qo'shilmay qolardi. Rejim
 * `question` ma'lumoti bor-yo'qligi bilan aniqlanadi.
 */
const QuestionFormModal = () => (
  <ResponsiveModal
    name="diagnosticQuestion"
    title="Diagnostika savoli"
    className="max-w-2xl"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, question }) => {
  const isEdit = Boolean(question?.id);

  const { data: subjects = [] } = useSubjects();
  const [form, setForm] = useState(() =>
    question?.id ? fromQuestion(question) : blankState(),
  );

  const { data: topics = [] } = useSubjectTopics(form.subjectId);

  const { mutate: createQuestion } = useCreateQuestion();
  const { mutate: updateQuestion } = useUpdateQuestion();

  /**
   * ⚠️ FORMA `useEffect` BILAN TO'LDIRILMAYDI, RENDER PAYTIDA MOSLANADI
   * (React'ning "prop o'zgarganda holatni moslash" naqshi).
   *
   * Effekt bilan yozilsa, oyna ochilganda avval BO'SH forma bir marta
   * chizilib, keyin qayta render bo'lardi — foydalanuvchi maydonlarning
   * "sakrab" to'lganini ko'rardi. Bu yerda esa birinchi renderning O'ZIDA
   * to'g'ri qiymat bo'ladi.
   */
  const [loadedId, setLoadedId] = useState(question?.id ?? null);
  if (loadedId !== (question?.id ?? null)) {
    setLoadedId(question?.id ?? null);
    setForm(question?.id ? fromQuestion(question) : blankState());
  }

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const needsOptions = typeNeedsOptions(form.type);
  const isShort = form.type === "short";

  const setOption = (index, patch) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, ...patch } : opt,
      ),
    }));

  /**
   * ⚠️ `single` / `truefalse` / `gap` DA BITTA TO'G'RI JAVOB. Belgilash
   * qolganlarini avtomatik bo'shatadi — aks holda foydalanuvchi ikkitasini
   * belgilab, saqlashda server xatosini olardi va nima noto'g'riligini
   * darrov tushunmasdi.
   */
  const markCorrect = (index) => {
    if (form.type === "multiple") {
      setOption(index, { isCorrect: !form.options[index].isCorrect });
      return;
    }
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({ ...opt, isCorrect: i === index })),
    }));
  };

  const addOption = () =>
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { ...EMPTY_OPTION }],
    }));

  const removeOption = (index) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));

  const validate = () => {
    if (!form.text.trim()) return "Savol matnini kiriting";
    if (!form.subjectId) return "Fanni tanlang";

    if (needsOptions) {
      const filled = form.options.filter((o) => o.text.trim());
      if (filled.length < 2) return "Kamida 2 ta variant kiriting";
      if (!filled.some((o) => o.isCorrect)) {
        return "To'g'ri variantni belgilang";
      }
    }

    if (isShort && !form.acceptedAnswers.some((a) => a.trim())) {
      return "Kamida bitta to'g'ri javob variantini kiriting";
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    // ⚠️ `FormData`: server rasm yuklashni ham shu yo'l bilan qabul
    // qiladi (`multipart`). Massivlar JSON satr sifatida ketadi — server
    // ularni `_parseJson` bilan ochadi.
    const formData = new FormData();
    formData.append("text", form.text.trim());
    formData.append("subjectId", form.subjectId);
    formData.append("topicId", form.topicId || "");
    formData.append("type", form.type);
    formData.append("difficulty", form.difficulty);
    formData.append("grade", form.grade === "" ? "" : String(form.grade));
    formData.append("points", String(form.points));
    formData.append("estimatedTime", String(form.estimatedTime));
    formData.append("explanation", form.explanation || "");
    formData.append("solution", form.solution || "");
    formData.append(
      "options",
      JSON.stringify(
        needsOptions
          ? form.options
              .filter((o) => o.text.trim())
              .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
          : [],
      ),
    );
    formData.append(
      "acceptedAnswers",
      JSON.stringify(
        isShort ? form.acceptedAnswers.map((a) => a.trim()).filter(Boolean) : [],
      ),
    );

    setIsLoading(true);
    const onDone = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Savol yangilandi" : "Savol qo'shildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updateQuestion({ id: question.id, formData }, onDone);
    else createQuestion(formData, onDone);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        type="textarea"
        name="text"
        label="Savol matni"
        value={form.text}
        inputClassName="min-h-24"
        onChange={(e) => setField("text", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        <SelectField
          required
          name="subjectId"
          label="Fan"
          placeholder="Tanlang"
          value={form.subjectId}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          onChange={(value) => setForm((p) => ({ ...p, subjectId: value, topicId: "" }))}
        />

        <SelectField
          name="topicId"
          label="Mavzu (ixtiyoriy)"
          placeholder={form.subjectId ? "Tanlang" : "Avval fanni tanlang"}
          value={form.topicId}
          disabled={!form.subjectId}
          options={[
            { value: "", label: "Mavzusiz" },
            ...topics.map((t) => ({ value: t.id, label: t.name })),
          ]}
          onChange={(value) => setField("topicId", value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-2">
        <SelectField
          name="type"
          label="Savol turi"
          value={form.type}
          options={QUESTION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          onChange={(value) => setField("type", value)}
        />

        <SelectField
          name="difficulty"
          label="Qiyinlik"
          value={form.difficulty}
          options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))}
          onChange={(value) => setField("difficulty", value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 xs:grid-cols-3">
        <SelectField
          name="grade"
          label="Sinf"
          value={String(form.grade)}
          options={[
            { value: "", label: "Belgilanmagan" },
            ...Array.from({ length: 11 }, (_, i) => ({
              value: String(i + 1),
              label: `${i + 1}-sinf`,
            })),
          ]}
          onChange={(value) => setField("grade", value)}
        />

        <InputField
          type="number"
          name="points"
          label="Ball"
          min={0.5}
          step={0.5}
          value={form.points}
          onChange={(e) => setField("points", e.target.value)}
        />

        <InputField
          type="number"
          name="estimatedTime"
          label="Kutilgan vaqt (son.)"
          min={5}
          max={3600}
          value={form.estimatedTime}
          description="Xato sababini aniqlashda ishlatiladi"
          onChange={(e) => setField("estimatedTime", e.target.value)}
        />
      </div>

      {/* ── VARIANTLAR ─────────────────────── */}
      {needsOptions && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Variantlar
            <span className="ml-1 font-normal text-gray-400">
              {form.type === "multiple"
                ? "(bir nechta to'g'ri javob bo'lishi mumkin)"
                : "(bitta to'g'ri javob)"}
            </span>
          </p>

          {form.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markCorrect(index)}
                title="To'g'ri javob deb belgilash"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  option.isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-200 bg-white text-gray-300 hover:border-emerald-300",
                )}
              >
                <Check className="size-4" strokeWidth={2.5} />
              </button>

              <input
                value={option.text}
                placeholder={`${String.fromCharCode(65 + index)} variant`}
                onChange={(e) => setOption(index, { text: e.target.value })}
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              />

              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="shrink-0 text-gray-300 hover:text-rose-600"
                  title="Variantni o'chirish"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}

          {form.options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="size-4" strokeWidth={1.5} />
              Variant qo'shish
            </button>
          )}
        </div>
      )}

      {/* ── QISQA JAVOB ────────────────────── */}
      {isShort && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Qabul qilinadigan javoblar
            <span className="ml-1 font-normal text-gray-400">
              (katta-kichik harf va ortiqcha bo'shliq hisobga olinmaydi)
            </span>
          </p>

          {form.acceptedAnswers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={answer}
                placeholder="To'g'ri javob"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    acceptedAnswers: prev.acceptedAnswers.map((a, i) =>
                      i === index ? e.target.value : a,
                    ),
                  }))
                }
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-primary"
              />
              {form.acceptedAnswers.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      acceptedAnswers: prev.acceptedAnswers.filter(
                        (_, i) => i !== index,
                      ),
                    }))
                  }
                  className="shrink-0 text-gray-300 hover:text-rose-600"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                acceptedAnswers: [...prev.acceptedAnswers, ""],
              }))
            }
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="size-4" strokeWidth={1.5} />
            Yana bir variant
          </button>
        </div>
      )}

      <InputField
        type="textarea"
        name="explanation"
        label="Izoh (ixtiyoriy)"
        value={form.explanation}
        inputClassName="min-h-20"
        description="Natijada o'quvchiga ko'rsatiladi — nega bu javob to'g'ri"
        onChange={(e) => setField("explanation", e.target.value)}
      />

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
          {isEdit ? "Saqlash" : "Qo'shish"}
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default QuestionFormModal;
