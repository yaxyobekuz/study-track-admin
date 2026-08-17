// Hooks
import { useChangelogNotifications } from "../queries/changelog.queries";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import {
  NOTIFICATION_KIND_META,
  NOTIFICATION_STATUS_META,
} from "../data/changelog.data";

/**
 * Yuborish jurnali — oxirgi 10 ta urinish.
 *
 * Busiz xatolar jimgina yo'qoladi: bot guruhdan chiqarilgan yoki bloklangan
 * bo'lsa, xabar ketmaganini bilmay qolasiz.
 */
const ChangelogNotificationLog = () => {
  const { data, isLoading } = useChangelogNotifications({ page: 1, limit: 10 });

  const rows = data?.data ?? [];

  return (
    <Card className="p-4">
      <h2 className="mb-1 font-medium text-gray-900">Yuborish jurnali</h2>
      <p className="mb-4 text-xs text-gray-500">
        Oxirgi 10 ta urinish. Xato bo'lsa sababi shu yerda ko'rinadi.
      </p>

      {isLoading ? (
        <p className="py-4 text-center text-sm text-gray-500">Yuklanmoqda...</p>
      ) : rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">
          Hozircha xabar yuborilmagan
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const status =
              NOTIFICATION_STATUS_META[row.status] || {
                label: row.status,
                className: "bg-gray-100 text-gray-700",
              };
            const kind = NOTIFICATION_KIND_META[row.kind]?.label || row.kind;

            return (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {row.label || row.chatId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {kind}
                    {row.coverageDate
                      ? ` · ${formatUzDate(row.coverageDate)}`
                      : row.coverageFrom
                        ? ` · ${formatUzDate(row.coverageFrom)} — ${formatUzDate(row.coverageTo)}`
                        : ""}
                    {row.entryCount ? ` · ${row.entryCount} ta yozuv` : ""}
                  </p>
                  {row.errorMessage ? (
                    <p className="mt-0.5 text-xs text-red-600">{row.errorMessage}</p>
                  ) : null}
                </div>

                <span
                  className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ChangelogNotificationLog;
