// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

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

const EditEmojiModal = () => (
  <ResponsiveModal name="editEmoji" title="Emojini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, _id, ...data }) => {
  const queryClient = useQueryClient();

  const { emojiId, key, label, sortOrder, isActive, setField, setFields } =
    useObjectState({
      emojiId: "",
      key: "",
      label: "",
      sortOrder: 0,
      isActive: true,
    });

  useEffect(() => {
    if (data.label !== undefined) {
      setFields({
        emojiId: data.emojiId ?? "",
        key: data.key || "",
        label: data.label || "",
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      });
    }
  }, [_id]);

  const updateMutation = useMutation({
    mutationFn: () =>
      premiumAPI.updateEmoji(_id, {
        emojiId: Number(emojiId),
        key,
        label,
        sortOrder: Number(sortOrder),
        isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium", "emojis"] });
      toast.success("Emoji yangilandi");
      close();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        min={1}
        type="number"
        label="Emoji ID"
        value={emojiId}
        onChange={(e) => setField("emojiId", e.target.value)}
      />

      <InputField
        required
        label="Kalit (key)"
        value={key}
        onChange={(e) => setField("key", e.target.value)}
      />

      <InputField
        required
        label="Nom (label)"
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

      <Button disabled={updateMutation.isPending}>
        Saqlash{updateMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default EditEmojiModal;
