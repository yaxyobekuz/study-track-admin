// Toast
import { toast } from "sonner";

// React
import { useEffect, useState } from "react";

// Tanstack Query
import { useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import EmojiPreview from "./EmojiPreview";
import JsonDropzone from "./JsonDropzone";

const EditEmojiModal = () => (
  <ResponsiveModal name="editEmoji" title="Emojini tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, _id, ...data }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (data.name !== undefined) setName(data.name || "");
    setFile(null);
  }, [_id]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("file", file);
      return premiumAPI.updateEmoji(_id, formData);
    },
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
    if (!name.trim()) return toast.error("Emoji nomini kiriting");
    updateMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {/* Joriy animatsiya */}
      {data.animationUrl && (
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <EmojiPreview url={data.animationUrl} className="size-12" />
          <span className="text-xs text-gray-500">Joriy animatsiya</span>
        </div>
      )}

      <InputField
        required
        label="Nomi"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <JsonDropzone
        value={file}
        onChange={setFile}
        label="Yangi lottie fayl (.json)"
        description="Faqat almashtirmoqchi bo'lsangiz tanlang"
      />

      <Button disabled={updateMutation.isPending}>
        Saqlash{updateMutation.isPending && "..."}
      </Button>
    </form>
  );
};

export default EditEmojiModal;
