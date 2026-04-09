// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Icons
import { AlertTriangle } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PenaltySettingsPage = () => {
  const queryClient = useQueryClient();
  const { getCollectionData } = useArrayStore();
  const roles = getCollectionData("roles") || [];

  // Owner va developer'dan tashqari rollar
  const fineRoles = roles.filter(
    (r) => r.value !== "owner" && r.value !== "developer",
  );

  const { data: settings, isLoading } = useQuery({
    queryKey: ["penalties", "settings"],
    queryFn: () => penaltiesAPI.getSettings().then((res) => res.data.data),
  });

  // fineAmounts: { student: N, teacher: N, ... }
  const [fineAmounts, setFineAmounts] = useState({});

  useEffect(() => {
    if (settings && fineRoles.length > 0) {
      const amounts = {};
      for (const role of fineRoles) {
        // fineAmounts backend'dan object sifatida keladi (Map JSON'da object)
        amounts[role.value] = settings.fineAmounts?.[role.value] ?? 0;
      }
      setFineAmounts(amounts);
    }
  }, [settings, roles.length]);

  const saveMutation = useMutation({
    mutationFn: () => penaltiesAPI.updateSettings({ fineAmounts }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "settings"] });
      toast.success("Sozlamalar saqlandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Saqlashda xatolik"),
  });

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount);
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
      <h1 className="page-title">Jarima sozlamalari</h1>

      <Card
        className="space-y-4"
        title="Jarima uchun to'lov miqdori (12 ball uchun)"
      >
        <InputGroup className="md:grid-cols-2">
          {fineRoles.map((role) => (
            <InputField
              min="0"
              required
              max="1000000"
              type="number"
              key={role.value}
              label={role.name}
              value={fineAmounts[role.value] ?? 0}
              description={`${formatAmount(fineAmounts?.[role.value] || 0)} so'm`}
              onChange={(e) =>
                setFineAmounts((prev) => ({
                  ...prev,
                  [role.value]: Math.min(100000000, Number(e.target.value)),
                }))
              }
            />
          ))}
        </InputGroup>
      </Card>

      {/* Submit button */}
      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || fineRoles.length === 0}
      >
        Saqlash{saveMutation.isPending && "..."}
      </Button>

      {/* Info Alert */}
      <Card className="flex gap-3.5 bg-yellow-50 text-yellow-700 text-sm">
        <AlertTriangle className="size-5 shrink-0" strokeWidth={1.5} />
        Jarima miqdori o'zgarishi avvalgi jarimalar miqdoriga ta'sir qilmaydi.
        Yangi jarimalar uchun yangi miqdor qo'llaniladi.
      </Card>
    </div>
  );
};

export default PenaltySettingsPage;
