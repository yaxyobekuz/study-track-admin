// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Icons
import { Trash2, Plus } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

// Queries
import { usePeriods } from "../queries/scheduleSettings.queries";
import { useUpdateScheduleSettings } from "../queries/scheduleSettings.mutations";

const createEmptyPeriod = (order) => ({ order, startTime: "", endTime: "" });

/**
 * DARS SOATLARI TAHRIRLAGICHI — jadval gridining yagona manbai.
 *
 * Ikki joyda chiziladi: "Dars jadvali sozlamalari" sahifasida va
 * "Dars jadvalini rejalashtirish → Sozlamalar" tabida. Ikkalasi ham AYNAN
 * shu ro'yxatni tahrirlaydi — nusxa yo'q, chunki preview grid amaldagi
 * jadval bilan bir xil koordinatada bo'lishi shart.
 */
const PeriodsEditor = ({ className = "" }) => {
  const { data: serverPeriods = [], isLoading } = usePeriods();
  const { mutate: save, isPending } = useUpdateScheduleSettings();

  // Mahalliy tahrir holati. null bo'lsa — serverdagi qiymat ko'rsatiladi.
  const [draft, setDraft] = useState(null);
  const periods = draft ?? serverPeriods;

  const addPeriod = () => {
    const nextOrder =
      Math.max(0, ...periods.map((p) => Number(p.order) || 0)) + 1;
    setDraft([...periods, createEmptyPeriod(nextOrder)]);
  };

  const removePeriod = (index) => setDraft(periods.filter((_, i) => i !== index));

  const updatePeriod = (index, field, value) =>
    setDraft(periods.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  const handleSave = () => {
    const normalized = periods.map((p) => ({
      order: Number(p.order),
      startTime: p.startTime,
      endTime: p.endTime,
    }));

    const orders = normalized.map((p) => p.order);
    if (new Set(orders).size !== orders.length) {
      return toast.error("Dars tartib raqamlari takrorlanmasligi kerak");
    }

    for (const p of normalized) {
      if (!Number.isInteger(p.order) || p.order < 1 || p.order > 100) {
        return toast.error("Dars tartibi 1 dan 100 gacha bo'lishi kerak");
      }
      if (!p.startTime || !p.endTime) {
        return toast.error("Har bir dars uchun vaqtlarni to'ldiring");
      }
      if (p.startTime >= p.endTime) {
        return toast.error(
          `${p.order}-dars: boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak`,
        );
      }
    }

    save(
      { periods: normalized },
      {
        onSuccess: () => {
          setDraft(null); // serverdan kelgan saralangan qiymatga qaytamiz
          toast.success("Dars soatlari saqlandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Saqlashda xatolik"),
      },
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="flex justify-center py-10">
          <div className="size-8 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`space-y-4 ${className}`}>
      <div>
        <h2 className="font-medium text-gray-900">Dars soatlari</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Har bir dars tartibi uchun boshlanish va tugash vaqti. Bu ro'yxat
          butun tizim uchun umumiy: dars jadvali ham, rejalashtirish ham shu
          kataklardan foydalanadi.
        </p>
      </div>

      {periods.length === 0 && (
        <p className="py-2 text-center text-sm text-gray-500">
          Hali dars soati qo'shilmagan
        </p>
      )}

      <div className="space-y-3">
        {periods.map((period, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between rounded-t-lg bg-gray-100 px-4 py-2">
              <h4 className="font-medium text-gray-900">{index + 1}-dars</h4>
              <button
                type="button"
                onClick={() => removePeriod(index)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            <InputGroup className="grid-cols-1 p-1.5 md:grid-cols-3">
              <InputField
                min={1}
                max={100}
                required
                type="number"
                label="Dars tartibi"
                placeholder="1, 2, 3, ..."
                value={period.order}
                onChange={(e) => updatePeriod(index, "order", e.target.value)}
              />

              <InputField
                required
                type="time"
                label="Boshlanish vaqti"
                value={period.startTime}
                onChange={(e) => updatePeriod(index, "startTime", e.target.value)}
              />

              <InputField
                required
                type="time"
                label="Tugash vaqti"
                value={period.endTime}
                onChange={(e) => updatePeriod(index, "endTime", e.target.value)}
              />
            </InputGroup>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addPeriod}
        className="w-full border-2 border-dashed text-gray-600 hover:border-blue-500 hover:text-blue-500"
      >
        <Plus className="size-4" strokeWidth={1.5} />
        Dars soati qo'shish
      </Button>

      <div className="flex justify-end border-t border-gray-200 pt-3.5">
        <Button
          className="w-full xs:w-32"
          disabled={isPending || draft === null}
          onClick={handleSave}
        >
          Saqlash{isPending && "..."}
        </Button>
      </div>
    </Card>
  );
};

export default PeriodsEditor;
