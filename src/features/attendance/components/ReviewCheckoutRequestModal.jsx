// Toaster
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { useReviewCheckoutRequest } from "../queries/attendance.mutations";

const ReviewCheckoutRequestModal = () => (
  <ResponsiveModal
    name="reviewCheckoutRequest"
    title="Ketish so'rovini ko'rib chiqish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

/**
 * ⚠️ Ruxsat faqat KETISHNI ochadi: baho qo'yilmagan dars baribir o'tilmagan
 * (oylik va kechki baho jarimasi o'zgarmaydi). Erta ketish jarimasi esa
 * yozilmaydi — bu ruxsat berilgan ketish. Oyna buni oldindan aytadi.
 */
const Content = ({ close, isLoading, setIsLoading, request }) => {
  const [note, setNote] = useState("");
  const { mutate: review } = useReviewCheckoutRequest();

  if (!request) return null;

  const lessons = request.pendingItems?.lessons ?? [];
  const tasks = request.pendingItems?.tasks ?? [];

  const submit = (status) => {
    if (status === "rejected" && note.trim().length < 3) {
      toast.warning("Rad etish sababini yozing");
      return;
    }

    setIsLoading(true);
    review(
      { id: request.id, data: { status, note: note.trim() || undefined } },
      {
        onSuccess: () => {
          close();
          toast.success(
            status === "approved" ? "Ketishga ruxsat berildi" : "So'rov rad etildi",
          );
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-500">O'qituvchi:</span>{" "}
          <span className="font-medium">{request.userName}</span>
        </p>
        <p>
          <span className="text-gray-500">Sana:</span>{" "}
          <span className="font-medium">{request.dateLabel}</span>
          <span className="text-gray-500"> · yuborildi {request.createdAtLabel}</span>
        </p>
        <p>
          <span className="text-gray-500">Sabab:</span>{" "}
          <span className="whitespace-pre-line">{request.reason}</span>
        </p>
      </div>

      {/* So'rov paytida tugamagan ishlar (muhr) */}
      <div className="space-y-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
        <p className="font-medium text-gray-900">Tugamagan ishlar</p>

        {lessons.length > 0 && (
          <ul className="space-y-1">
            {lessons.map((l) => (
              <li
                key={`${l.className}-${l.lessonOrder}-${l.subjectName}`}
                className="text-gray-700"
              >
                {l.lessonOrder}-dars · {l.className} · {l.subjectName} —{" "}
                {l.state === "notStarted"
                  ? "hali boshlanmagan"
                  : `${l.gradedStudents}/${l.totalStudents} o'quvchiga baho`}
              </li>
            ))}
          </ul>
        )}

        {tasks.length > 0 && (
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li key={t.id} className="text-gray-700">
                Topshiriq: {t.title}{" "}
                <span className="text-gray-500">(muddat: {t.dueLabel})</span>
                {t.locked && (
                  <span className="text-gray-500"> — kech topshirib bo'lmaydi</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {!lessons.length && !tasks.length && (
          <p className="text-gray-500">Ma'lumot yo'q</p>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Ruxsat faqat ketishni ochadi: baho qo'yilmagan dars o'tilmagan
        hisoblanadi (oylik va kechki baho jarimasi o'zgarmaydi). Erta ketish
        jarimasi yozilmaydi.
      </p>

      <InputField
        type="textarea"
        value={note}
        maxLength={1000}
        label="Izoh (rad etishda majburiy)"
        placeholder="Masalan: darslarni ertaga o'rinbosar bilan to'ldiring"
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="danger"
          disabled={isLoading}
          onClick={() => submit("rejected")}
        >
          Rad etish
        </Button>
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => submit("approved")}
        >
          Ruxsat berish
        </Button>
      </div>
    </div>
  );
};

export default ReviewCheckoutRequestModal;
