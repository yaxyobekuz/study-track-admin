// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { usePanelVersions } from "../queries/changelog.queries";
import {
  useCreateChangelog,
  useUpdateChangelog,
} from "../queries/changelog.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

// Data
import { BUMP_OPTIONS, PANEL_OPTIONS } from "../data/changelog.data";

// "2026-08-17T00:00:00.000Z" → "2026-08-17" (input[type=date] uchun)
const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

// Bugungi sana — yangi yozuv uchun boshlang'ich qiymat
const today = () => new Date().toISOString().slice(0, 10);

// Textarea matni → bulletlar ro'yxati
const toItems = (text) =>
  text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);

const ChangelogForm = ({
  close,
  isLoading,
  setIsLoading,
  isEdit = false,
  ...entry
}) => {
  const { mutate: createChangelog } = useCreateChangelog();
  const { mutate: updateChangelog } = useUpdateChangelog();
  const { data: versions = [] } = usePanelVersions();

  const { panel, date, bump, version, title, itemsText, notes, setField, setFields } =
    useObjectState({
      panel: "admin",
      date: today(),
      bump: "patch",
      version: "",
      title: "",
      itemsText: "",
      notes: "",
    });

  useEffect(() => {
    if (isEdit && entry.id) {
      setFields({
        panel: entry.panel || "admin",
        date: toDateInput(entry.date),
        bump: entry.bump || "patch",
        version: entry.version || "",
        title: entry.title || "",
        itemsText: (entry.items || []).join("\n"),
        notes: entry.notes || "",
      });
    }
  }, [isEdit, entry?.id]);

  // "Keyingi versiya" maslahati — qiymat serverdan keladi, bu yerda
  // semver hisob-kitobi takrorlanmaydi.
  const nextVersion = versions.find((item) => item.panel === panel)?.nextVersion?.[bump];

  const handleSubmit = (e) => {
    e.preventDefault();

    const items = toItems(itemsText);

    if (!title.trim() && items.length === 0) {
      toast.error("Sarlavha yoki o'zgarishlar ro'yxati kiritilishi kerak");
      return;
    }

    setIsLoading(true);

    const payload = { panel, date, title, items, notes, version: version.trim() };

    // `bump` faqat yaratishda ma'noga ega — tahrirlash versiyani qayta hisoblamaydi
    if (!isEdit) payload.bump = bump;

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Yozuv yangilandi" : "Yozuv qo'shildi");
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) {
      updateChangelog({ id: entry.id, data: payload }, handlers);
    } else {
      createChangelog(payload, handlers);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputGroup>
        <SelectField
          required
          value={panel}
          label="Panel"
          options={PANEL_OPTIONS}
          triggerClassName="w-full"
          onChange={(v) => setField("panel", v)}
        />

        <InputField
          required
          name="date"
          type="date"
          label="Sana"
          value={date}
          description="Istalgan kunni tanlash mumkin"
          onChange={(e) => setField("date", e.target.value)}
        />
      </InputGroup>

      {!isEdit && (
        <SelectField
          required
          value={bump}
          label="O'zgarish darajasi"
          options={BUMP_OPTIONS}
          triggerClassName="w-full"
          onChange={(v) => setField("bump", v)}
        />
      )}

      <InputField
        name="version"
        label="Versiya"
        value={version}
        placeholder={nextVersion || "0.0.0"}
        description={
          isEdit
            ? "Faqat ataylab o'zgartirmoqchi bo'lsangiz to'ldiring"
            : `Bo'sh qoldirilsa avtomatik hisoblanadi${
                nextVersion ? ` — keyingisi: ${nextVersion}` : ""
              }`
        }
        onChange={(e) => setField("version", e.target.value)}
      />

      <InputField
        name="title"
        label="Sarlavha"
        value={title}
        placeholder="Qisqacha nima qilindi"
        onChange={(e) => setField("title", e.target.value)}
      />

      {/* O'zgarishlar */}
      <div>
        <label
          htmlFor="itemsText"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          O'zgarishlar
        </label>
        <textarea
          rows={7}
          id="itemsText"
          value={itemsText}
          placeholder={"O'quvchi kartochkasida to'lov tarixi ko'rinadigan bo'ldi\nHisobotni Excel'ga yuklash qo'shildi"}
          onChange={(e) => setField("itemsText", e.target.value)}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1.5 text-sm text-gray-500">
          Har qatorda bitta o'zgarish. Sodda tilda yozing — tizim egasi ham o'qiydi.
        </p>
      </div>

      {/* Izoh */}
      <div>
        <label
          htmlFor="notes"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Izoh (ixtiyoriy)
        </label>
        <textarea
          rows={3}
          id="notes"
          value={notes}
          placeholder="Nega kerak edi?"
          onChange={(e) => setField("notes", e.target.value)}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Amallar */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default ChangelogForm;
