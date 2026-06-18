// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Icons
import { Plus, Trash2, Crown, Info } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import Field, { FieldLabel } from "@/shared/components/ui/field/Field";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Static data
import { DEFAULT_NEW_COLOR } from "../data/premium.data";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PremiumSettingsPage = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["premium", "settings"],
    queryFn: () => premiumAPI.getSettings().then((res) => res.data.data),
  });

  const [isEnabled, setIsEnabled] = useState(true);
  const [coinCost, setCoinCost] = useState(100);
  const [durationDays, setDurationDays] = useState(30);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    if (!settings) return;
    setIsEnabled(settings.isEnabled ?? true);
    setCoinCost(settings.coinCost ?? 100);
    setDurationDays(settings.durationDays ?? 30);
    setColors(settings.allowedNameColors ?? []);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      premiumAPI.updateSettings({
        isEnabled,
        coinCost: Number(coinCost),
        durationDays: Number(durationDays),
        allowedNameColors: colors.map((c) => ({
          key: c.key,
          label: c.label,
          hex: c.hex,
          isActive: c.isActive !== false,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium", "settings"] });
      toast.success("Sozlamalar saqlandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Saqlashda xatolik"),
  });

  const updateColor = (index, field, value) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const removeColor = (index) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const addColor = () => {
    setColors((prev) => [...prev, { ...DEFAULT_NEW_COLOR }]);
  };

  const handleSave = () => {
    // Validatsiya
    for (const c of colors) {
      if (!c.key?.trim() || !c.label?.trim() || !c.hex?.trim()) {
        toast.error("Har bir rang uchun kalit, nom va hex majburiy");
        return;
      }
    }
    const keys = colors.map((c) => c.key.trim());
    if (new Set(keys).size !== keys.length) {
      toast.error("Rang kalitlari takrorlanmasligi kerak");
      return;
    }
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">MBSI Premium sozlamalari</h1>

      {/* Asosiy sozlamalar */}
      <Card className="space-y-4" title="Asosiy sozlamalar" icon={<Crown className="size-5 text-yellow-500" />}>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Premium yoqilgan</FieldLabel>
            <Switch checked={isEnabled} onChange={setIsEnabled} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            O'chirilsa, o'quvchilar premium sotib ola olmaydi (mavjud obunalar
            ta'sir qilmaydi)
          </p>
        </Field>

        <InputGroup className="md:grid-cols-2">
          <InputField
            min="0"
            required
            type="number"
            label="Narxi (tanga)"
            description="Bir martalik premium narxi"
            value={coinCost}
            onChange={(e) => setCoinCost(Math.max(0, Number(e.target.value)))}
          />

          <InputField
            min="1"
            required
            type="number"
            label="Muddati (kun)"
            description="Bir martalik obuna necha kunga beriladi"
            value={durationDays}
            onChange={(e) => setDurationDays(Math.max(1, Number(e.target.value)))}
          />
        </InputGroup>
      </Card>

      {/* Ism ranglari */}
      <Card className="space-y-4" title="Ruxsat etilgan ism ranglari">
        <p className="text-xs text-gray-500">
          Premium o'quvchilar ismlari uchun tanlay oladigan ranglar. Faol
          bo'lmagan ranglar o'quvchilarga ko'rinmaydi.
        </p>

        <div className="space-y-3">
          {colors.map((color, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 p-3"
            >
              <div
                className="size-9 shrink-0 rounded-lg border border-gray-200"
                style={{ backgroundColor: color.hex }}
              />

              <InputField
                label="Kalit"
                placeholder="blue"
                className="w-28"
                value={color.key}
                onChange={(e) => updateColor(index, "key", e.target.value)}
              />

              <InputField
                label="Nom"
                placeholder="Ko'k"
                className="w-32"
                value={color.label}
                onChange={(e) => updateColor(index, "label", e.target.value)}
              />

              <InputField
                label="Hex"
                placeholder="#3b82f6"
                className="w-32"
                value={color.hex}
                onChange={(e) => updateColor(index, "hex", e.target.value)}
              />

              <div className="flex items-center gap-2 mb-2">
                <Switch
                  checked={color.isActive !== false}
                  onChange={(v) => updateColor(index, "isActive", v)}
                />
                <span className="text-xs text-gray-500">Faol</span>
              </div>

              <button
                onClick={() => removeColor(index)}
                className="mb-1.5 p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="O'chirish"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addColor}>
          <Plus />
          Rang qo'shish
        </Button>
      </Card>

      <Button onClick={handleSave} disabled={saveMutation.isPending}>
        Saqlash{saveMutation.isPending && "..."}
      </Button>

      <Card className="flex gap-3.5 bg-blue-50 text-blue-700 text-sm">
        <Info className="size-5 shrink-0" strokeWidth={1.5} />
        Narx yoki muddat o'zgarishi faqat yangi obunalarga ta'sir qiladi. Yangi
        rang qo'shsangiz, o'quvchi ilovasida ham unga mos rang qo'llab-quvvatlanishi
        kerak.
      </Card>
    </div>
  );
};

export default PremiumSettingsPage;
