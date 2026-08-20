// React
import { useMemo } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Hooks
import { useChangelogs } from "../queries/changelog.queries";
import { useSendChangelogNow } from "../queries/changelog.mutations";

// Icons
import { History, Send } from "lucide-react";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Pagination from "@/shared/components/ui/Pagination";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import ChangelogForm from "./ChangelogForm";
import ChangelogEntryCard from "./ChangelogEntryCard";
import DeleteChangelogForm from "./DeleteChangelogForm";

/**
 * Yozuvlarni sana bo'yicha guruhlaydi. Server allaqachon
 * `date desc, panel asc, seq desc` tartibida qaytaradi, shuning uchun bu yerda
 * faqat ketma-ket to'planadi.
 */
const groupByDate = (entries) => {
  const groups = [];

  for (const entry of entries) {
    const key = String(entry.date).slice(0, 10);
    const last = groups[groups.length - 1];

    if (last && last.date === key) last.entries.push(entry);
    else groups.push({ date: key, entries: [entry] });
  }

  return groups;
};

/**
 * Yozuvlar ro'yxati — "Bugungi o'zgarishlar" va "Barchasi" tablari uchun umumiy.
 *
 * Filtrlarni tab o'zi chizadi va tayyor `params` ni shu yerga uzatadi; bu
 * komponent faqat so'rov, guruhlash va chizishni biladi.
 *
 * @param {object} props
 * @param {object} props.params - serverga uzatiladigan filtrlar (page'siz)
 * @param {string} [props.emptyText] - ro'yxat bo'sh bo'lgandagi matn
 */
const ChangelogEntryList = ({ params, emptyText = "Yozuv topilmadi" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mutate: sendNow, isPending: isSending } = useSendChangelogNow();

  const page = Number(searchParams.get("page")) || 1;

  const setPage = (value) =>
    setSearchParams((prev) => {
      if (!value || value === 1) prev.delete("page");
      else prev.set("page", String(value));
      return prev;
    });

  const { data, isLoading } = useChangelogs({ ...params, page });

  const entries = data?.data ?? [];
  const pagination = data?.pagination;
  const groups = useMemo(() => groupByDate(data?.data ?? []), [data?.data]);

  const handleSend = (date) =>
    sendNow(
      { date },
      {
        onSuccess: (res) => toast.success(res.message || "Yuborildi"),
        onError: (error) =>
          toast.error(error.response?.data?.message || "Yuborishda xatolik"),
      },
    );

  return (
    <div>
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>
      ) : entries.length === 0 ? (
        <Card className="py-8 text-center">
          <History
            className="mx-auto mb-3 size-12 text-gray-400"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">{emptyText}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.date}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">
                  {formatUzDate(group.date)}
                </h2>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {group.entries.length} ta yozuv
                  </span>

                  <Can do="changelog.send">
                    <button
                      disabled={isSending}
                      onClick={() => handleSend(group.date)}
                      title="Shu kun hisobotini Telegram'ga yuborish"
                      className="flex items-center gap-1 p-1 text-xs text-gray-500 hover:text-blue-600 disabled:opacity-50"
                    >
                      <Send className="size-3.5" />
                      Yuborish
                    </button>
                  </Can>
                </div>
              </div>

              <div className="space-y-3">
                {group.entries.map((entry) => (
                  <ChangelogEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={setPage}
        />
      )}

      {/* Create Modal */}
      <ResponsiveModal name="createChangelog" title="Yangi o'zgarish">
        <ChangelogForm />
      </ResponsiveModal>

      {/* Edit Modal */}
      <ResponsiveModal name="editChangelog" title="O'zgarishni tahrirlash">
        <ChangelogForm isEdit />
      </ResponsiveModal>

      {/* Delete Modal */}
      <ResponsiveModal
        name="deleteChangelog"
        title="Yozuvni o'chirish"
        description="Haqiqatdan ham bu yozuvni o'chirmoqchimisiz?"
      >
        <DeleteChangelogForm />
      </ResponsiveModal>
    </div>
  );
};

export default ChangelogEntryList;
