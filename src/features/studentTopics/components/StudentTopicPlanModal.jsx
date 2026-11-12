// Toast
import { toast } from "sonner";

// React
import { useEffect, useMemo } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import LanguageBadge from "@/shared/components/ui/LanguageBadge";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useSetStudentTopicPlans } from "@/features/studentTopics/queries/studentTopics.mutations";

// Icons
import { Info, TriangleAlert } from "lucide-react";

/**
 * O'QUVCHIGA MAVZU O'RNI VA QADAM BELGILASH.
 *
 * ⚠️ IKKI MAYDON, IKKI BOSHQA SAVOL:
 *   · "Hozir qaysi mavzuda" (`topicOrder`) — sanoqning boshlanish nuqtasi;
 *   · "Bitta darsda nechta mavzu" (`step`) — TEZLIK, chegara emas: 3
 *     qo'yilsa bitta dars bo'lib o'tganda u uchun 3 mavzu o'tilgan
 *     hisoblanadi.
 *
 * ⚠️ "Rejaning boshlanishi" (`startOrder`) — test qamrovining PASTKI
 * chegarasi: o'rtada qo'shilgan bolaga u kelmagan paytdagi mavzulardan
 * savol berilmasin. Sukut 1.
 *
 * ⚠️ ANKORNING KUNI VA DARSINI SERVER TANLAYDI — guruhning keyingi darsi.
 * Oyna bu savolni bermaydi: odam faqat "bu bola qaysi mavzuda va qanday
 * tezlikda" deydi, shu tufayli bu ekrandagi raqam jadvaldagi raqam bilan
 * hech qachon farq qilmaydi.
 */
const StudentTopicPlanModal = () => (
  <ResponsiveModal
    name="studentTopicPlan"
    title="Mavzu o'rnini belgilash"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  classId,
  subjectId,
  language,
  totalTopics = 0,
  nextLesson = null,
  /** Tanlangan o'quvchilar: `[{ id, fullName, currentTopicNumber, step, startOrder }]` */
  students = [],
}) => {
  const { mutate: setPlans } = useSetStudentTopicPlans();

  // Bitta o'quvchi tanlangan bo'lsa — uning joriy qiymatlari bilan
  // to'ldiriladi (tuzatish odatiy hol). Bir nechtasi bo'lsa — bo'sh:
  // "hammasiga bir xil" degan qaror ongli bo'lishi kerak.
  const single = students.length === 1 ? students[0] : null;

  const { state, setField, setFields } = useObjectState({
    topicOrder: single?.currentTopicNumber ? String(single.currentTopicNumber) : "",
    step: String(single?.step ?? 1),
    startOrder: String(single?.startOrder ?? 1),
    note: "",
  });

  useEffect(() => {
    setFields({
      topicOrder: single?.currentTopicNumber ? String(single.currentTopicNumber) : "",
      step: String(single?.step ?? 1),
      startOrder: String(single?.startOrder ?? 1),
      note: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [single?.id, students.length]);

  const topicOrder = Number.parseInt(state.topicOrder, 10);
  const step = Number.parseInt(state.step, 10);
  const startOrder = Number.parseInt(state.startOrder, 10);

  /**
   * ORALIQNING OLDINDAN KO'RINISHI — "nima yoziladi" matni.
   *
   * ⚠️ Hisob SERVER qoidasi bilan AYNI: qamrov `[startOrder …
   * topicOrder + step − 1]`, lekin fanning oxirgi mavzusidan oshmaydi.
   * Panel summa hisoblamaydi, faqat o'sha qoidani ko'rsatadi.
   */
  const preview = useMemo(() => {
    if (!Number.isInteger(topicOrder) || topicOrder < 1) return null;
    const safeStep = Number.isInteger(step) && step >= 1 ? step : 1;
    const safeStart = Number.isInteger(startOrder) && startOrder >= 1 ? startOrder : 1;
    const blockTo = totalTopics
      ? Math.min(topicOrder + safeStep - 1, totalTopics)
      : topicOrder + safeStep - 1;
    return { from: safeStart, blockFrom: topicOrder, blockTo, step: safeStep };
  }, [topicOrder, step, startOrder, totalTopics]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!Number.isInteger(topicOrder) || topicOrder < 1) {
      toast.error("Mavzu raqami kamida 1 bo'lishi kerak");
      return;
    }
    if (totalTopics && topicOrder > totalTopics) {
      toast.error(`Mavzu raqami ${totalTopics} dan oshmasligi kerak`);
      return;
    }
    if (!Number.isInteger(step) || step < 1) {
      toast.error("Bitta darsda o'tiladigan mavzu soni kamida 1 bo'lishi kerak");
      return;
    }
    if (!Number.isInteger(startOrder) || startOrder < 1) {
      toast.error("Rejaning boshlanishi kamida 1 bo'lishi kerak");
      return;
    }
    if (startOrder > topicOrder) {
      toast.error("Rejaning boshlanishi joriy mavzudan katta bo'lmasligi kerak");
      return;
    }

    setIsLoading(true);
    setPlans(
      {
        classId,
        subjectId,
        studentIds: students.map((student) => student.id),
        topicOrder,
        step,
        startOrder,
        note: state.note || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          close();
        },
        onError: (error) =>
          toast.error(error.response?.data?.message || "Belgilab bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Kimga */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-900">
          {single ? single.fullName : `${students.length} ta o'quvchi`}
          <LanguageBadge language={language} />
        </p>
        {!single && (
          <p className="mt-1 text-xs text-gray-600">
            {students
              .slice(0, 6)
              .map((student) => student.fullName)
              .join(", ")}
            {students.length > 6 && ` … va yana ${students.length - 6} ta`}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Hozir qaysi mavzuda"
          hint={totalTopics ? `1 … ${totalTopics}` : null}
          value={state.topicOrder}
          onChange={(value) => setField("topicOrder", value)}
          min={1}
          max={totalTopics || undefined}
          required
          autoFocus
        />

        <Field
          label="Bitta darsda nechta mavzu"
          hint="Sukut 1"
          value={state.step}
          onChange={(value) => setField("step", value)}
          min={1}
          max={20}
          required
        />
      </div>

      <Field
        label="Reja qaysi mavzudan boshlangan"
        hint="Testga shu mavzudan savol tushadi. Sukut 1"
        value={state.startOrder}
        onChange={(value) => setField("startOrder", value)}
        min={1}
        max={totalTopics || undefined}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Izoh
        </label>
        <input
          type="text"
          value={state.note}
          onChange={(event) => setField("note", event.target.value)}
          maxLength={300}
          placeholder="Masalan: oktabrda qo'shildi"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* NIMA YOZILADI */}
      {preview && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-600" strokeWidth={1.5} />
          <div className="text-xs text-blue-900">
            <p>
              Keyingi darsda{" "}
              <b>
                {preview.blockFrom === preview.blockTo
                  ? `${preview.blockFrom}-mavzu`
                  : `${preview.blockFrom}–${preview.blockTo}-mavzular`}
              </b>{" "}
              o'tilgan hisoblanadi
              {preview.step > 1 && ` (bitta darsda ${preview.step} mavzu)`}.
            </p>
            <p className="mt-1">
              Testga <b>{preview.from}–{preview.blockTo}</b> oralig'idan savol
              tushadi.
            </p>
            {nextLesson && (
              <p className="mt-1 text-blue-700">
                Ankor: {nextLesson.dateLabel}, {nextLesson.lessonOrder}-dars
              </p>
            )}
          </div>
        </div>
      )}

      {!totalTopics && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0 text-amber-600"
            strokeWidth={1.5}
          />
          <p className="text-xs text-amber-900">
            Bu fanning shu tildagi mavzular rejasi yuklanmagan — avval rejani
            yuklang.
          </p>
        </div>
      )}

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>
        <Button variant="default" className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

/** Raqamli maydon — bitta shaklda (uchta joyda takrorlanmasin). */
const Field = ({ label, hint, value, onChange, min, max, required, autoFocus }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <input
      type="number"
      inputMode="numeric"
      value={value}
      min={min}
      max={max}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
    />
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export default StudentTopicPlanModal;
