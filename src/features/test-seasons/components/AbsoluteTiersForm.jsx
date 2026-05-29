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
 * Absolyut darajalar formasi (admin).
 * Mavsum'da bo'lgan absolyut darajalarni tahrirlash.
 */
const AbsoluteTiersForm = ({ season, onSaved }) => {
  const queryClient = useQueryClient();
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    setTiers(
      (season.absoluteTiers || []).map((t) => ({
        name: t.name,
        minScore: t.minScore,
        coinReward: t.coinReward,
      })),
    );
  }, [season._id, season.absoluteTiers]);

  const addTier = () => {
    setTiers([...tiers, { name: "", minScore: 0, coinReward: 0 }]);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index, patch) => {
    setTiers(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const mutation = useMutation({
    mutationFn: () => testSeasonsAPI.setAbsoluteTiers(season._id, tiers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-season", season._id] });
      toast.success("Absolyut darajalar saqlandi");
      onSaved?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Saqlanmadi"),
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">Absolyut darajalar</h3>
        <p className="text-sm text-gray-600">
          O'quvchining mavsumdagi ball yig'indisi belgilangan chegaradan oshsa,
          coin oladi. Yuqori darajadan boshlab tekshiriladi.
        </p>
      </div>

      <div className="space-y-2">
        {tiers.length === 0 && (
          <p className="text-sm text-gray-400 italic py-3">
            Hozircha daraja yo'q. "+ Daraja qo'shish" tugmasini bosing.
          </p>
        )}
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-3 p-3 bg-gray-50 rounded-lg md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <InputField
              label="Nomi"
              value={tier.name}
              onChange={(e) => updateTier(idx, { name: e.target.value })}
              placeholder="Masalan: Oltin"
            />
            <InputField
              type="number"
              label="Min ball"
              min={0}
              value={tier.minScore}
              onChange={(e) =>
                updateTier(idx, { minScore: Number(e.target.value) })
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
          Daraja qo'shish
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

export default AbsoluteTiersForm;
