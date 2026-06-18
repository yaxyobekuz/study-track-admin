// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectAllUsers from "@/shared/components/ui/select/SelectAllUsers";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const GrantPremiumModal = () => (
  <ResponsiveModal name="grantPremium" title="Premium berish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const { studentId, durationDays, setField, resetState } = useObjectState({
    studentId: "",
    durationDays: 30,
  });

  const grantMutation = useMutation({
    mutationFn: () =>
      premiumAPI.grant({
        studentId,
        durationDays: Number(durationDays),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium"] });
      toast.success("Premium berildi");
      resetState();
      close();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("O'quvchini tanlang");
      return;
    }
    grantMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <SelectAllUsers
        label="O'quvchi"
        value={studentId}
        onChange={(v) => setField("studentId", v)}
        formatUsers={(user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName || ""} (${user.username})`,
        })}
      />

      <InputField
        required
        min={1}
        type="number"
        label="Muddat (kun)"
        description="Tanga yechilmaydi, premium qo'lda beriladi"
        value={durationDays}
        onChange={(e) => setField("durationDays", e.target.value)}
      />

      <Button disabled={grantMutation.isPending}>
        Berish{grantMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default GrantPremiumModal;
