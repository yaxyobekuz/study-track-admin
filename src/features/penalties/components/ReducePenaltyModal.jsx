// Toast
import { toast } from "sonner";

// API
import { usersAPI } from "@/shared/api/users.api";
import { penaltiesAPI } from "@/shared/api/penalties.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Combobox from "@/shared/components/form/combobox";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ReducePenaltyModal = () => (
  <ResponsiveModal
    name="reducePenalty"
    title="Jarima ballini kamaytirish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", "all"],
    queryFn: () =>
      usersAPI.getAll({ limit: 500 }).then((res) => res.data.data || []),
  });

  const users = (usersData || [])
    .filter((u) => u.role !== "owner" && u.penaltyPoints > 0)
    .map((u) => ({
      label: `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""} (${u.username}) — ${u.penaltyPoints} ball`,
      value: u._id,
      penaltyPoints: u.penaltyPoints,
    }));

  const { userId, points, reason, setField } = useObjectState({
    userId: "",
    points: "",
    reason: "",
  });

  const selectedUser = users.find((u) => u.value === userId) || null;

  const reduceMutation = useMutation({
    mutationFn: (data) => penaltiesAPI.reduce(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "list"] });
      close();
      toast.success("Kamaytirish so'rovi yuborildi.");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    reduceMutation.mutate({ userId, points: Number(points), reason });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Combobox
        required
        value={userId}
        options={users}
        label="Foydalanuvchi"
        isLoading={usersLoading}
        placeholder="Foydalanuvchini tanlang..."
        onChange={(value) => setField("userId", value)}
        searchPlaceholder="Ism, username bo'yicha qidirish..."
      />

      {selectedUser && (
        <p className="text-sm text-gray-500">
          Joriy jarima bali:{" "}
          <span className="font-semibold text-red-600">
            {selectedUser.penaltyPoints}
          </span>
        </p>
      )}

      <InputField
        min={1}
        required
        type="number"
        value={points}
        label="Kamaytirilayotgan ball"
        max={selectedUser?.penaltyPoints || 999}
        onChange={(e) => setField("points", e.target.value)}
      />

      <InputField
        required
        label="Sabab"
        value={reason}
        type="textarea"
        onChange={(e) => setField("reason", e.target.value)}
      />

      <Button
        disabled={reduceMutation.isPending || !userId || !points || !reason}
      >
        Kamaytirish{reduceMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default ReducePenaltyModal;
