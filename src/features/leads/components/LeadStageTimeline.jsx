// Icons
import { Check, Circle, LogOut } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

/**
 * QABUL ZINAPOYASI — bitta lidning yo'li.
 *
 * ⚠️ Yetilmagan pog'ona "yetgan, lekin vaqti noma'lum" dan AJRATILADI:
 * server `reached: false` va `reachedAt: null` ni alohida qaytaradi.
 * Eski ma'lumotdan tiklangan vaqt esa "taxminiy" deb belgilanadi
 * (`approximate`) — soni aniq, vaqti taxminiy.
 */
const LeadStageTimeline = ({ lead, timeline = [] }) => {
  const { openModal } = useModal();
  const isExited = Boolean(lead?.isExited);
  const reachedCount = timeline.filter((row) => row.reached).length;
  const total = timeline.length;

  return (
    <Card
      title={`Qabul bosqichlari — ${reachedCount}/${total}`}
      className="space-y-3"
    >
      {isExited && (
        <p className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
          Bu lid <span className="font-medium">{lead.statusLabel}</span> deb
          belgilangan
          {lead.lostReason ? `: ${lead.lostReason}` : ""}. Yetib borgan
          bosqichlari quyida saqlanib qolgan — tahlilda aynan qaysi qadamda
          yo'qotilgani ko'rinadi.
        </p>
      )}

      <ol className="space-y-0">
        {timeline.map((row, index) => {
          const isFinal = row.stage === total;
          const isLast = index === timeline.length - 1;

          return (
            <li key={row.stage} className="flex gap-3">
              {/* Chiziq va belgi */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                    !row.reached && "border-gray-200 text-gray-300",
                    row.reached && isExited && "border-gray-300 bg-gray-300 text-white",
                    row.reached &&
                      !isExited &&
                      (isFinal
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-primary bg-primary text-white"),
                  )}
                >
                  {row.reached ? <Check className="size-3.5" /> : <Circle className="size-2" />}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "my-0.5 w-0.5 flex-1",
                      row.reached && !isExited ? "bg-primary/30" : "bg-gray-200",
                    )}
                  />
                )}
              </div>

              <div className={cn("min-w-0 flex-1", !isLast && "pb-3")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    row.reached ? "text-gray-900" : "text-gray-400",
                  )}
                >
                  {row.stage}. {row.label}
                </p>
                <p className="text-xs text-gray-400">
                  {row.reached
                    ? [
                        row.reachedAt ? formatDateTimeUz(row.reachedAt) : null,
                        row.approximate ? "taxminiy vaqt" : null,
                        row.note || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : row.hint || "hali yetmagan"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <Can do="leads.status">
        <Button
          className="w-full"
          variant={isExited ? "outline" : "default"}
          onClick={() => openModal("leadStage", { lead })}
        >
          {isExited ? <LogOut /> : <Check />}
          {isExited ? "Zinapoyaga qaytarish / qayta belgilash" : "Bosqichni belgilash"}
        </Button>
      </Can>
    </Card>
  );
};

export default LeadStageTimeline;
