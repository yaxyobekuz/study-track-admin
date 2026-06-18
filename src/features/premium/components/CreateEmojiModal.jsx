// Toast
import { toast } from "sonner";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const CreateEmojiModal = () => (
  <ResponsiveModal name="createEmoji" title="Yangi emoji">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const { emojiId, key, label, sortOrder, isActive, setField, resetState } =
    useObjectState({
      emojiId: "",
      key: "",
      label: "",
      sortOrder: 0,
      isActive: true,
    });

  const createMutation = useMutation({
    mutationFn: () =>
      premiumAPI.createEmoji({
        emojiId: Number(emojiId),
        key,
        label,
        sortOrder: Number(sortOrder),
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium", "emojis"] });
      toast.success("Emoji qo'shildi");
      resetState();
      close();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        min={1}
        type="number"
        label="Emoji ID"
        description="Ilovadagi animatsiya bilan bir xil bo'lishi kerak"
        value={emojiId}
        onChange={(e) => setField("emojiId", e.target.value)}
      />

      <InputField
        required
        label="Kalit (key)"
        placeholder="magic"
        value={key}
        onChange={(e) => setField("key", e.target.value)}
      />

      <InputField
        required
        label="Nom (label)"
        placeholder="Sehrli"
        value={label}
        onChange={(e) => setField("label", e.target.value)}
      />

      <InputField
        min={0}
        type="number"
        label="Tartib raqami"
        value={sortOrder}
        onChange={(e) => setField("sortOrder", e.target.value)}
      />

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          className="rounded"
          checked={isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
        />
        <span>Faol (o'quvchilarga ko'rinadi)</span>
      </label>

      <Button disabled={createMutation.isPending}>
        Qo'shish{createMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default CreateEmojiModal;
