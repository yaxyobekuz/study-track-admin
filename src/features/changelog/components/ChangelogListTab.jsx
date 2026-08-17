// React
import { useMemo } from "react";

// Router
import { useSearchParams } from "react-router-dom";

// Toast
import { toast } from "sonner";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useChangelogs } from "../queries/changelog.queries";
import { useSendChangelogNow } from "../queries/changelog.mutations";

// Icons
import { History, Plus, Send } from "lucide-react";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import ChangelogForm from "./ChangelogForm";
import ChangelogEntryCard from "./ChangelogEntryCard";
import DeleteChangelogForm from "./DeleteChangelogForm";
import ChangelogVersionHeader from "./ChangelogVersionHeader";

// Data
import { PANEL_FILTER_OPTIONS } from "../data/changelog.data";

/**
 * Yozuvlarni sana bo'yicha guruhlaydi. Server allaqachon `date desc, panel asc`
 * tartibida qaytaradi, shuning uchun bu yerda faqat ketma-ket to'planadi.
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

const ChangelogListTab = () => {
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mutate: sendNow, isPending: isSending } = useSendChangelogNow();

  const page = Number(searchParams.get("page")) || 1;
  const panel = searchParams.get("panel") || "all";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // DIQQAT: `tab` parametri bu yerda BOSHQARILMAYDI — u `useChangelogTab`
  // ixtiyorida. Ikkalasi ham funksional `prev => ...` shaklda ishlagani uchun
  // bir-biriga xalaqit qilmaydi.
  const setParam = (key, value) =>
    setSearchParams((prev) => {
      if (value == null || value === "") prev.delete(key);
      else prev.set(key, String(value));
      if (key !== "page") prev.delete("page");
      return prev;
    });

  const { data, isLoading } = useChangelogs({ page, panel, from, to });

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
      {/* Qo'shish */}
      <div className="mb-4 flex justify-end">
        <Can do="changelog.create">
          <Button onClick={() => openModal("createChangelog", null)}>
            <Plus strokeWidth={1.5} />
            Qo'shish
          </Button>
        </Can>
      </div>

      {/* Panellarning joriy versiyalari */}
      <ChangelogVersionHeader />

      {/* Filtrlar */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select
          value={panel}
          triggerClassName="min-w-44"
          options={PANEL_FILTER_OPTIONS}
          onChange={(v) => setParam("panel", v)}
        />

        <InputField
          name="from"
          type="date"
          label="Sanadan"
          value={from}
          onChange={(e) => setParam("from", e.target.value)}
        />

        <InputField
          name="to"
          type="date"
          label="Sanagacha"
          value={to}
          onChange={(e) => setParam("to", e.target.value)}
        />
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="py-8 text-center">Yuklanmoqda...</div>
      ) : entries.length === 0 ? (
        <Card className="py-8 text-center">
          <History
            className="mx-auto mb-3 size-12 text-gray-400"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Hozircha o'zgarishlar yozilmagan</p>
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
                    {group.entries.length} ta panel
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

      {/* Sahifalash */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(next) => setParam("page", next)}
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

export default ChangelogListTab;
