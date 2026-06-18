// Toast
import { toast } from "sonner";

// Icons
import { Plus, Edit, Trash2, Info } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emojis.map((emoji) => (
            <Card key={emoji._id} title={emoji.label}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                      ID: {emoji.emojiId}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                      {emoji.key}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        emoji.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {emoji.isActive ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Tartib: {emoji.sortOrder}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="flex gap-3.5 bg-yellow-50 text-yellow-700 text-sm">
        <Info className="size-5 shrink-0" strokeWidth={1.5} />
        Emoji ID o'quvchi ilovasidagi animatsiya fayliga mos kelishi kerak. Yangi
        ID qo'shsangiz, ilovada ham shu ID uchun animatsiya mavjud bo'lishi shart,
        aks holda o'quvchiga ko'rinmaydi.
      </Card>

      {/* Modals */}
      <CreateEmojiModal />
      <EditEmojiModal />
    </div>
  );
};

export default PremiumEmojisPage;
