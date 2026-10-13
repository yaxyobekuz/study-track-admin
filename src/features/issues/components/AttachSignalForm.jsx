// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Queries
import { useActiveIssueCategories } from "../queries/issues.queries";
import { useAttachGroupSignal } from "../queries/group-signals.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";

/**
 * TEZKOR BIRIKTIRISH — signalni muammolar ro'yxatiga qo'shish.
 *
 * ⚠️ FAQAT KATEGORIYA SO'RALADI va bu ataylab. Matn, iqtibos, guruh nomi
 * va xabar havolasi signalda allaqachon bor — ularni qayta yozdirish
 * odamni ikki marta ishlatardi. Kategoriya esa AI'dan kelmaydi: u
 * maktabning o'z ro'yxati va qaysi biri to'g'ri kelishini ODAM biladi.
 *
 * ⚠️ MUALLIF — BIRIKTIRGAN ODAM. Guruhda yozgan kishi ko'pincha ota-ona,
 * ya'ni tizimda foydalanuvchi emas; muammoning "muallif" maydoni esa
 * majburiy. Haqiqiy manba yo'qolmaydi — ismi va havolasi muammo matniga
 * tushadi (serverda `_buildIssueBody`).
 */
// ⚠️ PROPSLAR MODAL TIZIMIDAN: `ResponsiveModal` `openModal(name, data)`
// dagi ma'lumotni PROP sifatida yoyadi va `close` ni o'zi qo'shadi
// (`DeleteIssueForm` bilan ayni shakl). Shuning uchun signal maydonlari
// to'g'ridan-to'g'ri prop bo'lib keladi.
const AttachSignalForm = ({ close, ...signal }) => {
  const { data: categories = [], isLoading } = useActiveIssueCategories();
  const [categoryId, setCategoryId] = useState("");

  const attachMutation = useAttachGroupSignal();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryId) return;

    attachMutation.mutate(
      { id: signal.id, categoryId },
      {
        onSuccess: () => {
          toast.success("Signal muammolarga biriktirildi");
          close();
        },
        onError: (error) =>
          toast.error(
            error.response?.data?.message || "Biriktirib bo'lmadi",
          ),
      },
    );
  };

  const options = categories.map((c) => ({ label: c.name, value: c.id }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nima biriktirilayotgani — odam ko'r-ko'rona tasdiqlamasligi uchun */}
      <div className="space-y-1 rounded-lg bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-900">{signal.summary}</p>
        {signal.quote && (
          <p className="text-sm text-gray-600 italic">"{signal.quote}"</p>
        )}
        <p className="text-xs text-gray-500">
          {signal.group?.title}
          {signal.senderName ? ` · ${signal.senderName}` : ""}
        </p>
      </div>

      <SelectField
        label="Kategoriya"
        value={categoryId}
        options={options}
        isLoading={isLoading}
        placeholder="Kategoriyani tanlang"
        onChange={setCategoryId}
      />

      {/* Faol kategoriya yo'q bo'lsa — nima qilish kerakligi aytiladi */}
      {!isLoading && options.length === 0 && (
        <p className="text-sm text-amber-600">
          Faol kategoriya yo'q — avval "Kategoriyalar" tabida qo'shing.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
        <Button type="button" variant="secondary" onClick={close}>
          Bekor qilish
        </Button>
        <Button
          type="submit"
          disabled={!categoryId || attachMutation.isPending}
        >
          Biriktirish{attachMutation.isPending && "..."}
        </Button>
      </div>
    </form>
  );
};

export default AttachSignalForm;
