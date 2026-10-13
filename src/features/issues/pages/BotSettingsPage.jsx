// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Icons
import { RefreshCw, Users, BadgeCheck } from "lucide-react";

// Queries
import { telegramGroupsQueries } from "../queries/telegram-groups.queries";
import {
  useRefreshTelegramGroups,
  useSetTelegramGroupOfficial,
} from "../queries/telegram-groups.mutations";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import EmptyState from "@/shared/components/ui/EmptyState";
import Button from "@/shared/components/ui/button/Button";

// Data
import {
  GROUP_STATUS_META,
  GROUP_STATUS_FALLBACK,
  GROUP_TYPE_LABELS,
} from "../data/issues.data";

/**
 * "Bot sozlamalari" tabi — bot ko'rgan guruhlar va "rasmiy guruh" belgisi.
 *
 * ⚠️ RO'YXAT TO'LIQ BO'LMASLIGI MUMKIN: Telegram Bot API'da "men qaysi
 * guruhlarda adminman" degan savolga javob beradigan metod yo'q, shuning
 * uchun reyestr botga kelgan hodisadan to'planadi
 * (`bot/src/services/group.service.js`) va o'tmishga qaramaydi — eski guruh
 * botni qayta admin qilmaguncha yoki unda xabar yozilmaguncha ko'rinmaydi.
 *
 * ⚠️ "RASMIY" HOZIRCHA FAQAT BELGI: tizim bu guruhga hech narsa yubormaydi.
 *
 * ⚠️ CHIQIB KETGAN GURUH HAM RO'YXATDA (server o'chirmaydi): "bot bu
 * guruhdan chiqarilgan" — ko'rinishi kerak bo'lgan fakt.
 */
const BotSettingsPage = () => {
  const { data: groups = [], isLoading } = useQuery(
    telegramGroupsQueries.list(),
  );

  const refreshMutation = useRefreshTelegramGroups();
  const officialMutation = useSetTelegramGroupOfficial();

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: ({ checked, updated, failed }) => {
        if (!checked) {
          toast.info("Tekshirish uchun guruh yo'q");
          return;
        }
        // Sanoqlar ko'rsatiladi: "tekshirildi" degan jim xabar
        // muvaffaqiyatsizlarni yashirardi.
        toast.success(
          `${checked} guruh tekshirildi — ${updated} ta yangilandi` +
            (failed ? `, ${failed} tasiga ulanilmadi` : ""),
        );
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Tekshirib bo'lmadi"),
    });
  };

  const handleToggleOfficial = (group) => {
    officialMutation.mutate(
      { chatId: group.chatId, isOfficial: !group.isOfficial },
      {
        onSuccess: () =>
          toast.success(
            group.isOfficial
              ? "Guruh rasmiy ro'yxatdan chiqarildi"
              : "Guruh rasmiy deb belgilandi",
          ),
        onError: (error) =>
          toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Jami{" "}
          <span className="font-medium text-gray-700">{groups.length}</span>{" "}
          guruh
        </p>

        <Button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending || !groups.length}
        >
          <RefreshCw
            strokeWidth={1.5}
            className={refreshMutation.isPending ? "animate-spin" : undefined}
          />
          Tekshirish
        </Button>
      </div>

      {/* Ro'yxat */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Guruh yo'q"
            description="Botni guruhga qo'shib admin qiling — guruh shu ro'yxatda o'zi paydo bo'ladi."
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Nomi</th>
                <th className="px-3 py-2.5">Turi</th>
                <th className="px-3 py-2.5">Bot holati</th>
                <th className="px-3 py-2.5">Chat ID</th>
                <th className="px-3 py-2.5">Rasmiy</th>
                <th className="px-3 py-2.5">Amallar</th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group, index) => {
                const status =
                  GROUP_STATUS_META[group.status] ?? {
                    ...GROUP_STATUS_FALLBACK,
                    // Kutilmagan qiymatda holat satrining O'ZI ko'rsatiladi.
                    label: group.status,
                  };

                return (
                  <tr key={group.chatId} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-center text-xs text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <div className="font-medium">{group.title}</div>
                      {group.username && (
                        <div className="text-xs text-gray-500">
                          @{group.username}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-center text-xs text-gray-500">
                      {GROUP_TYPE_LABELS[group.type] ?? group.type}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-500">
                      {group.chatId}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      {group.isOfficial ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
                            <BadgeCheck className="size-3.5" />
                            Rasmiy
                          </span>
                          {/* Kim va qachon belgilagani — "rasmiy" degan
                              qaror javobgarlik bilan keladi. Belgilagan
                              odam BOSHQA filialda bo'lsa `null` qaytadi
                              (server izohi) — shunda faqat sana turadi. */}
                          <div className="text-xs text-gray-500">
                            {group.officialBy
                              ? `${group.officialBy.firstName} ${group.officialBy.lastName}`
                              : ""}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDateTimeUz(group.officialAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex justify-center">
                        {/* ⚠️ TUGMA FAQAT ADMIN BO'LGAN GURUHDA (yoki
                            belgini OLIB TASHLASH uchun): bot admin
                            bo'lmagan guruhni rasmiy deb belgilash
                            keyinchalik ishlamaydigan sozlama bo'lardi.
                            Server ham shuni tekshiradi — bu yerdagisi
                            qulaylik, himoya emas. */}
                        {group.isAdmin || group.isOfficial ? (
                          <button
                            onClick={() => handleToggleOfficial(group)}
                            disabled={officialMutation.isPending}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                              group.isOfficial
                                ? "text-gray-600 hover:bg-gray-100"
                                : "text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            {group.isOfficial
                              ? "Belgini olib tashlash"
                              : "Rasmiy deb belgilash"}
                          </button>
                        ) : (
                          <span
                            title="Botni guruhda admin qilmaguncha belgilab bo'lmaydi"
                            className="text-xs text-gray-400"
                          >
                            Bot admin emas
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BotSettingsPage;
