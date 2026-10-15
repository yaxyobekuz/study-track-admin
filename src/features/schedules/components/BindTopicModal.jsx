// Notifications
import { toast } from "sonner";

// React
import { useEffect, useMemo, useState } from "react";

// Icons
import { Link2, Link2Off, TriangleAlert } from "lucide-react";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";

// Queries
import { useSubjectTopics } from "@/features/subjects/queries/topics.queries";
import {
  useBindLessonTopic,
  useUnbindLessonTopic,
} from "@/features/schedules/queries/schedules.mutations";

const NOTE_MAX = 300;

/**
 * DARSGA MAVZU BIRIKTIRISH.
 *
 * ⚠️ Bu bitta darsning mavzusini emas, SANOQNING BOSHLANISH NUQTASINI
 * belgilaydi: shu darsdan keyingi barcha darslar o'sha mavzudan davom etadi
 * (51, 52 …). Oynada buni ochiq yozib qo'yamiz — aks holda foydalanuvchi
 * har bir darsga alohida mavzu biriktirishi kerak deb o'ylardi.
 *
 * Ochilishi (`openModal("bindLessonTopic", {...})`):
 *   · `classId`, `className`
 *   · `subjectId`, `subjectName`
 *   · `date` ("YYYY-MM-DD"), `dateLabel`, `dayLabel`
 *   · `lessonOrder`
 *   · `currentTopicOrder` — hozir shu darsda ko'rinayotgan mavzu
 *   · `binding` — shu darsda FAOL ankor bo'lsa (bekor qilish uchun)
 */
const BindTopicModal = () => (
  <ResponsiveModal
    name="bindLessonTopic"
    title="Darsga mavzu biriktirish"
    description="Biriktirilgan mavzudan keyingi darslar avtomatik davom etadi"
    className="max-w-lg"
  >
    <BindForm />
  </ResponsiveModal>
);

const BindForm = ({
  close,
  isLoading,
  setIsLoading,
  classId,
  className,
  subjectId,
  subjectName,
  date,
  dateLabel,
  dayLabel,
  lessonOrder,
  currentTopicOrder = null,
  binding = null,
}) => {
  const { data: topics = [], isLoading: topicsLoading } = useSubjectTopics(subjectId);
  const { mutate: bind } = useBindLessonTopic();
  const { mutate: unbind } = useUnbindLessonTopic();

  const [topicOrder, setTopicOrder] = useState("");
  const [note, setNote] = useState("");

  // Oyna ochilganda joriy mavzu tanlangan bo'lib turadi: odam odatda
  // yonidagi raqamga ko'chiradi, noldan qidirmaydi.
  useEffect(() => {
    setTopicOrder(currentTopicOrder != null ? String(currentTopicOrder) : "");
    setNote(binding?.note ?? "");
  }, [currentTopicOrder, binding?.note, date, lessonOrder]);

  const options = useMemo(
    () =>
      topics.map((topic) => ({
        value: String(topic.order),
        label: `${topic.order}-mavzu · ${topic.name}`,
      })),
    [topics],
  );

  const selected = topics.find((topic) => String(topic.order) === topicOrder) || null;

  const problem = !subjectId
    ? "Bu darsga fan biriktirilmagan"
    : topics.length === 0
      ? "Bu fanga mavzular yuklanmagan"
      : !topicOrder
        ? "Mavzuni tanlang"
        : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (problem || isLoading) return;
    setIsLoading(true);

    bind(
      {
        classId,
        subjectId,
        date,
        lessonOrder,
        topicOrder: Number(topicOrder),
        note: note.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(result.message);
        },
        onError: (error) =>
          toast.error(error.response?.data?.message || "Mavzuni biriktirib bo'lmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const handleUnbind = () => {
    if (!binding?.id || isLoading) return;
    setIsLoading(true);

    unbind(binding.id, {
      onSuccess: () => {
        close();
        toast.success("Biriktirish bekor qilindi — mavzu oldingi tartibda sanaladi");
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Bekor qilib bo'lmadi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Qaysi dars */}
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-sm font-medium text-gray-900">
          {className} · {lessonOrder}-dars · {subjectName || "Fan yo'q"}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {dayLabel}, {dateLabel}
        </p>
      </div>

      {/* Mavzu */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">Mavzu</span>
        <SelectSearch
          value={topicOrder}
          options={options}
          isLoading={topicsLoading}
          onChange={(value) => setTopicOrder(value)}
          placeholder="Mavzuni tanlang"
          searchPlaceholder="Mavzu raqami yoki nomi..."
          emptyText="Mavzu topilmadi"
          triggerClassName="w-full"
        />
      </label>

      {/* Izoh — ixtiyoriy */}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700">
          Izoh <span className="font-normal text-gray-400">(ixtiyoriy)</span>
        </span>
        <input
          value={note}
          maxLength={NOTE_MAX}
          placeholder="Masalan: bayram tufayli mavzu suriladi"
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </label>

      {/* Oqibat — saqlashdan OLDIN aytiladi */}
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/70 p-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-gray-700">
          {selected ? (
            <>
              Shu darsdan boshlab <b>{selected.order}-mavzu</b> hisoblanadi; keyingi darslar{" "}
              <b>{selected.order + 1}</b>, <b>{selected.order + 2}</b> … bo'lib davom etadi.
              Bayram, yakshanba va ta'til oyi sanalmaydi.
            </>
          ) : (
            "Tanlangan mavzudan keyingi darslar avtomatik davom etadi."
          )}
          <br />
          Bu kundan <b>oldingi</b> darslarga tegilmaydi.
        </p>
      </div>

      <div className="sticky bottom-0 flex gap-2.5 bg-white pt-1">
        {binding?.id && binding.source === "manual" ? (
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleUnbind}
            className="flex-1"
          >
            <Link2Off strokeWidth={1.5} />
            Bekor qilish
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={close} className="flex-1">
            Yopish
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading || Boolean(problem)}
          title={problem ?? undefined}
          className="flex-1"
        >
          <Link2 strokeWidth={1.5} />
          Biriktirish
        </Button>
      </div>
    </form>
  );
};

export default BindTopicModal;
