// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import JsonDropzone from "./JsonDropzone";

const CreateEmojiModal = () => (
  <ResponsiveModal name="createEmoji" title="Yangi emoji">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  const createMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("file", file);
      return premiumAPI.createEmoji(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium", "emojis"] });
      toast.success("Emoji qo'shildi");
      close();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Emoji nomini kiriting");
    if (!file) return toast.error("Lottie (.json) faylni tanlang");
    createMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <InputField
        required
        label="Nomi"
        placeholder="Sehrli"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <JsonDropzone required value={file} onChange={setFile} />

      <Button disabled={createMutation.isPending}>
        Qo'shish{createMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default CreateEmojiModal;
