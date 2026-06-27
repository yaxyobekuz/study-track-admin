// Toast
import { toast } from "sonner";

// Icons
import { Plus, Edit, Trash2, Info } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmojiPreview from "../components/EmojiPreview";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Modals
import CreateEmojiModal from "../components/CreateEmojiModal";
import EditEmojiModal from "../components/EditEmojiModal";

// API
import { premiumAPI } from "@/features/premium/api/premium.api";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PremiumEmojisPage = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const { data: emojis = [], isLoading } = useQuery({
    queryKey: ["premium", "emojis"],
    queryFn: () => premiumAPI.getEmojis().then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => premiumAPI.deleteEmoji(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium", "emojis"] });
      toast.success("Emoji o'chirildi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleDelete = (id) => {
    if (!confirm("Emojini o'chirishni tasdiqlaysizmi?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Premium emojilar</h1>
        <Button onClick={() => openModal("createEmoji")}>
          <Plus />
          Yangi emoji
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : emojis.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-gray-500">Hali emojilar yo'q</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {emojis.map((emoji) => (
            <Card key={emoji._id} className="flex flex-col items-center gap-2">
              <EmojiPreview url={emoji.animationUrl} className="size-16" />

              <p className="text-sm font-medium text-gray-800 text-center truncate w-full">
                {emoji.name || "-"}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal("editEmoji", emoji)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(emoji._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateEmojiModal />
      <EditEmojiModal />
    </div>
  );
};

export default PremiumEmojisPage;
