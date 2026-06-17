// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { Trash2, Plus } from "lucide-react";

// API
import { scheduleSettingsAPI } from "@/features/schedule-settings/api/scheduleSettings.api";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

const createEmptyPeriod = (order) => ({
  order,
  startTime: "",
  endTime: "",
});

const ScheduleSettingsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["schedule-settings"],
    queryFn: () => scheduleSettingsAPI.getSettings(),
  });

  // Mahalliy tahrir holati (draft). null bo'lsa - serverdagi qiymat ko'rsatiladi.
  const [draft, setDraft] = useState(null);
  const periods = draft ?? data?.data?.data?.periods ?? [];

  useEffect(() => {
    if (isError) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    }
  }, [isError]);

  const saveMutation = useMutation({
    mutationFn: (payload) => scheduleSettingsAPI.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-settings"] });
      setDraft(null); // serverdan kelgan saralangan qiymatga qaytamiz
      toast.success("Sozlamalar saqlandi");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    },
  });

  const addPeriod = () => {
    const nextOrder =
      Math.max(0, ...periods.map((p) => Number(p.order) || 0)) + 1;
    setDraft([...periods, createEmptyPeriod(nextOrder)]);
  };

  const removePeriod = (index) => {
    setDraft(periods.filter((_, i) => i !== index));
  };

  const updatePeriod = (index, field, value) => {
    setDraft(
      periods.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

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

    saveMutation.mutate({ periods: normalized });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title mb-4">Dars jadvali sozlamalari</h1>

      <Card className="space-y-4">
        <p className="text-sm text-gray-500">
          Har bir dars tartibi uchun standart boshlanish va tugash vaqtlarini
          belgilang. Dars jadvalini tahrirlashda dars tartibi tanlanganda
          vaqtlar avtomatik to'ldiriladi (keyin qo'lda o'zgartirsa bo'ladi).
        </p>

        {periods.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">
            Hali sozlama qo'shilmagan
          </p>
        )}

        <div className="space-y-3">
          {periods.map((period, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl"
            >
              <div className="flex justify-between items-center px-4 py-2 rounded-t-lg bg-gray-100">
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
                  onChange={(e) =>
                    updatePeriod(index, "startTime", e.target.value)
                  }
                />

                <InputField
                  required
                  type="time"
                  label="Tugash vaqti"
                  value={period.endTime}
                  onChange={(e) =>
                    updatePeriod(index, "endTime", e.target.value)
                  }
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
            disabled={saveMutation.isPending}
            onClick={handleSave}
          >
            Saqlash{saveMutation.isPending && "..."}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ScheduleSettingsPage;
