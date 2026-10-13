// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { CheckCircle2, Circle } from "lucide-react";

// Components
import FileDropzone from "@/features/tasks/components/FileDropzone";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { useSubmitMyTask } from "../queries/myTasks.queries";

// Utils
import { cn } from "@/shared/utils/cn";

const DEFAULT_RULES = {
  minFiles: 1,
  maxFiles: 5,
  requireNote: false,
  minNoteLength: 0,
  fileTypes: ["image", "video", "document"],
};

/**
 * ISHNI TOPSHIRISH — katakcha bosilganda ochiladi.
 *
 * ⚠️ KATAKCHA O'ZI HOLATNI O'ZGARTIRMAYDI: ishni yakunlash uchun ISBOT
 * (rasm, video yoki fayl) majburiy — "bosdim-u, hech narsa yubormadim"
 * degan holat bo'lmasligi kerak. Qoidalar serverdan keladi va server
 * ularni qayta tekshiradi; bu yerdagi nazorat ro'yxati faqat oldindan
 * ogohlantiradi.
 */
const MyTaskSubmitModal = () => (
  <ResponsiveModal
    name="submitMyTask"
    title="Ishni yakunlash"
    description="Bajarilgan ish isbotini yuklang"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, task, rules: incoming }) => {
  const { mutate: submitTask } = useSubmitMyTask();
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([]);

  if (!task) return null;

  const rules = { ...DEFAULT_RULES, ...(incoming || {}) };
  const noteLength = note.trim().length;

  const checks = [
    {
      key: "files",
      ok: files.length >= rules.minFiles,
      text:
        rules.minFiles === 1
          ? "Kamida 1 ta fayl yuklang (rasm, video yoki hujjat)"
          : `Kamida ${rules.minFiles} ta fayl yuklang`,
    },
    ...(rules.requireNote || rules.minNoteLength > 0
      ? [
          {
            key: "note",
            ok: rules.requireNote
              ? noteLength >= Math.max(1, rules.minNoteLength)
              : noteLength === 0 || noteLength >= rules.minNoteLength,
            text:
              rules.minNoteLength > 0
                ? `Izoh kamida ${rules.minNoteLength} ta belgi (${noteLength}/${rules.minNoteLength})`
                : "Nima qilganingizni qisqacha yozing",
          },
        ]
      : []),
  ];
  const ready = checks.every((c) => c.ok);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ready) return;

    const formData = new FormData();
    if (note.trim()) formData.append("note", note.trim());
    files.forEach((file) => formData.append("files", file));

    setIsLoading(true);
    submitTask(
      { id: task.id, formData },
      {
        onSuccess: () => {
          close();
          toast.success("Ish tekshiruvga yuborildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-800">
        {task.title}
      </p>

      <FileDropzone
        required
        value={files}
        onChange={setFiles}
        max={rules.maxFiles}
        disabled={isLoading}
        label="Bajarilgan ish fayllari"
        hint="Rasm, video yoki hujjat — bajarilganini ko'rsatadigan isbot"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Izoh{" "}
          {rules.requireNote ? (
            <span className="text-primary">*</span>
          ) : (
            <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span>
          )}
        </label>
        <textarea
          rows={3}
          value={note}
          maxLength={2000}
          disabled={isLoading}
          placeholder="Nima qildingiz? Qisqacha yozing..."
          onChange={(e) => setNote(e.target.value)}
          className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <ul className="space-y-1.5 rounded-xl bg-gray-50 p-3">
        {checks.map((check) => (
          <li key={check.key} className="flex items-start gap-2 text-xs">
            {check.ok ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <Circle className="size-4 shrink-0 text-gray-300" />
            )}
            <span className={cn(check.ok ? "text-emerald-700" : "text-gray-600")}>
              {check.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={isLoading} onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button disabled={!ready || isLoading}>
          {isLoading ? "Yuborilmoqda..." : "Tekshiruvga yuborish"}
        </Button>
      </div>
    </form>
  );
};

export default MyTaskSubmitModal;
