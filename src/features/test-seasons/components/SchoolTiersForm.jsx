// React
import { useState, useEffect } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Icons
import { Plus, Trash2, Save } from "lucide-react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";

/**
 * Maktab bo'yicha o'rin mukofotlari (top-N).
 * Har o'rin: { position, coinReward, note? }.
 */
const SchoolTiersForm = ({ season }) => {
  const queryClient = useQueryClient();
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    setTiers(
      (season.schoolTiers || [])
        .map((t) => ({
          position: t.position,
          coinReward: t.coinReward,
          note: t.note || "",
        }))
        .sort((a, b) => a.position - b.position),
    );
  }, [season._id, season.schoolTiers]);

  const addTier = () => {
    const nextPos =
      tiers.length === 0 ? 1 : Math.max(...tiers.map((t) => t.position)) + 1;
    setTiers([...tiers, { position: nextPos, coinReward: 0, note: "" }]);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index, patch) => {
    setTiers(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const mutation = useMutation({
    mutationFn: () => testSeasonsAPI.setSchoolTiers(season._id, tiers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-season", season._id] });
      toast.success("Maktab darajalari saqlandi");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Saqlanmadi"),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Maktab bo'yicha o'rinlar</h3>
        <p className="text-sm text-gray-600">
          Maktab bo'yicha o'rtacha ball reytingida yuqori o'rinlarga coin
          tarqatish. Har o'ringa ixtiyoriy izoh yozish mumkin.
        </p>
      </div>

      <div className="space-y-2">
        {tiers.length === 0 && (
          <p className="text-sm text-gray-400 italic py-3">
            Hozircha o'rin yo'q. "+ O'rin qo'shish" tugmasini bosing.
          </p>
        )}
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-3 p-3 bg-gray-50 rounded-lg md:grid-cols-[1fr_1fr_2fr_auto]"
          >
            <InputField
              type="number"
              label="O'rin"
              min={1}
              value={tier.position}
              onChange={(e) =>
                updateTier(idx, { position: Number(e.target.value) })
              }
            />
            <InputField
              type="number"
              label="Coin"
              min={0}
              value={tier.coinReward}
              onChange={(e) =>
                updateTier(idx, { coinReward: Number(e.target.value) })
              }
            />
            <InputField
              label="Izoh (ixtiyoriy)"
              value={tier.note}
              placeholder="Masalan: Tabriklaymiz, g'olib!"
              onChange={(e) => updateTier(idx, { note: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeTier(idx)}
              className="size-10 mt-auto flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={addTier}
          className="gap-2"
        >
          <Plus size={16} />
          O'rin qo'shish
        </Button>
        <Button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="gap-2"
        >
          <Save size={16} />
          {mutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default SchoolTiersForm;
