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
 * Sinf top-N darajalari (bitta sinf uchun).
 */
const ClassTiersForm = ({ season, classId, className }) => {
  const queryClient = useQueryClient();
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const existing = (season.classTiers || []).filter(
      (ct) => ct.class?.toString() === classId?.toString(),
    );
    setTiers(
      existing
        .map((t) => ({
          position: t.position,
          coinReward: t.coinReward,
        }))
        .sort((a, b) => a.position - b.position),
    );
  }, [season._id, season.classTiers, classId]);

  const addTier = () => {
    const nextPos =
      tiers.length === 0
        ? 1
        : Math.max(...tiers.map((t) => t.position)) + 1;
    setTiers([...tiers, { position: nextPos, coinReward: 0 }]);
  };

  const removeTier = (index) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index, patch) => {
    setTiers(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const mutation = useMutation({
    mutationFn: () => testSeasonsAPI.setClassTiers(season._id, classId, tiers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-season", season._id] });
      toast.success(`${className} darajalari saqlandi`);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Saqlanmadi"),
  });

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{className}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTier}
          className="gap-1.5"
        >
          <Plus size={14} />
          O'rin
        </Button>
      </div>

      {tiers.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Daraja belgilanmagan</p>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
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
              <button
                type="button"
                onClick={() => removeTier(idx)}
                className="size-9 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="gap-1.5"
        >
          <Save size={14} />
          {mutation.isPending ? "..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default ClassTiersForm;
