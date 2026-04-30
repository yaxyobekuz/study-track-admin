// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Icons
import { AlertTriangle } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import Field, { FieldLabel } from "@/shared/components/ui/field/Field";
import ExemptTeachersModal from "@/features/penalties/components/ExemptTeachersModal";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useModal from "@/shared/hooks/useModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Static data
import { GRADE_PENALTY_DEFAULTS } from "./PenaltySettingsPage.data";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PenaltySettingsPage = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal("exemptTeachersModal");
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
  const [premiumDiscountPercent, setPremiumDiscountPercent] = useState(0);

  useEffect(() => {
    if (settings && fineRoles.length > 0) {
      const amounts = {};
      for (const role of fineRoles) {
        // fineAmounts backend'dan object sifatida keladi (Map JSON'da object)
        amounts[role.value] = settings.fineAmounts?.[role.value] ?? 0;
      }
      setFineAmounts(amounts);
      setPremiumDiscountPercent(settings.premiumReductionDiscountPercent ?? 0);
    }
  }, [settings, roles.length]);

  const saveMutation = useMutation({
    mutationFn: () =>
      penaltiesAPI.updateSettings({
        fineAmounts,
        premiumReductionDiscountPercent: Number(premiumDiscountPercent),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "settings"] });
      toast.success("Sozlamalar saqlandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Saqlashda xatolik"),
  });

  // ─── Baho qo'ymaslik jarima sozlamalari ───────────────────────────
  const { data: gradeSettings } = useQuery({
    queryKey: ["penalties", "grade-settings"],
    queryFn: () =>
      penaltiesAPI.getGradePenaltySettings().then((res) => res.data.data),
  });

  const [gradeForm, setGradeForm] = useState({
    isEnabled: GRADE_PENALTY_DEFAULTS.isEnabled,
    penaltyPoints: GRADE_PENALTY_DEFAULTS.penaltyPoints,
    missingThresholdPercent: GRADE_PENALTY_DEFAULTS.missingThresholdPercent,
  });

  useEffect(() => {
    if (!gradeSettings) return;
    setGradeForm({
      isEnabled: gradeSettings.isEnabled ?? GRADE_PENALTY_DEFAULTS.isEnabled,
      penaltyPoints: gradeSettings.penaltyPoints ?? GRADE_PENALTY_DEFAULTS.penaltyPoints,
      missingThresholdPercent:
        gradeSettings.missingThresholdPercent ??
        GRADE_PENALTY_DEFAULTS.missingThresholdPercent,
    });
  }, [gradeSettings]);

  const gradeSettingsMutation = useMutation({
    mutationFn: () => penaltiesAPI.updateGradePenaltySettings(gradeForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "grade-settings"] });
      toast.success("Baho jarima sozlamalari saqlandi");
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

      {/* Premium chegirma */}
      <Card
        className="space-y-4"
        title="Premium o'quvchilar uchun chegirma"
      >
        <InputGroup>
          <InputField
            min="0"
            max="100"
            type="number"
            label="Premium chegirma (%)"
            description="Premium o'quvchilar kamaytirish paketlarini shu foiz chegirma bilan sotib oladilar"
            value={premiumDiscountPercent}
            onChange={(e) =>
              setPremiumDiscountPercent(
                Math.min(100, Math.max(0, Number(e.target.value))),
              )
            }
          />
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

      {/* ─── Baho qo'ymaslik jarima sozlamalari ─────────────────────── */}
      <h2 className="page-title mt-4">Baho qo'ymaslik jarimalari</h2>

      <Card className="space-y-4" title="Avtomatik jarima sozlamalari">
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Avtomatik jarima</FieldLabel>
            <Switch
              checked={gradeForm.isEnabled}
              onChange={(checked) =>
                setGradeForm((prev) => ({ ...prev, isEnabled: checked }))
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Har kuni soat 23:55 da ishga tushadi va foiz chegarasidan oshgan
            ustozlarga jarima beradi
          </p>
        </Field>

        <InputGroup className="md:grid-cols-2">
          <InputField
            min="1"
            required
            type="number"
            label="Jarima bali"
            description="Har bir qo'yilmagan dars uchun"
            value={gradeForm.penaltyPoints}
            onChange={(e) =>
              setGradeForm((prev) => ({
                ...prev,
                penaltyPoints: Math.max(1, Number(e.target.value)),
              }))
            }
          />

          <InputField
            min="0"
            max="100"
            required
            type="number"
            label="Baho qo'yilmagan o'quvchilar foizi (%)"
            description="Shu foizdan oshsa jarima beriladi"
            value={gradeForm.missingThresholdPercent}
            onChange={(e) =>
              setGradeForm((prev) => ({
                ...prev,
                missingThresholdPercent: Math.min(
                  100,
                  Math.max(0, Number(e.target.value)),
                ),
              }))
            }
          />
        </InputGroup>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={() => gradeSettingsMutation.mutate()}
          disabled={gradeSettingsMutation.isPending}
        >
          Saqlash{gradeSettingsMutation.isPending && "..."}
        </Button>

        <Button
          variant="outline"
          onClick={() => openModal("exemptTeachersModal")}
        >
          Istisno ustozlar
          {gradeSettings?.exemptTeachers?.length > 0 && (
            <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
              {gradeSettings.exemptTeachers.length}
            </span>
          )}
        </Button>
      </div>

      <ExemptTeachersModal />
    </div>
  );
};

export default PenaltySettingsPage;
