// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Ban, CalendarClock, Play, Repeat, Trash2 } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import EmptyState from "@/shared/components/ui/EmptyState";
import LoaderCard from "@/shared/components/ui/LoaderCard";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Queries
import { selfTasksQueries } from "@/features/tasks/queries/selfTasks.queries";
import { useDeleteSelfRule, useResumeSelfRule } from "@/features/tasks/queries/selfTasks.mutations";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

/**
 * O'ZIMNING DOIMIY ISHLARIM — "har dushanba hisobot yozish".
 *
 * ⚠️ QOIDANING O'ZI TOPSHIRIQ EMAS: undan server topshiriqlarni
 * VAQTIDAN OLDIN (`leadDays`) yozadi va shu yaratilishning o'zi eslatma
 * bo'ladi. Shuning uchun bu ro'yxat ishlar ro'yxatidan ALOHIDA turadi:
 * bitta joyda ko'rsatilsa, "qoida" va "topshiriq" bir-biriga aralashib,
 * foydalanuvchi qoidani yakunlamoqchi bo'lardi.
 *
 * ⚠️ TO'XTATISH va O'CHIRISH BOSHQA-BOSHQA: to'xtatilgan qoida sabab
 * bilan qoladi va qayta yoqiladi, o'chirilgani esa yo'q bo'ladi —
 * ALLAQACHON YOZILGAN topshiriqlar har ikki holatda ham joyida qoladi
 * (server `onDelete: SetNull`).
 */
const SelfRulesList = () => {
  const { openModal } = useModal();
  const [status, setStatus] = useState("active");
  const { data, isLoading } = useQuery(selfTasksQueries.myRules({ status }));

  const { mutate: resumeRule } = useResumeSelfRule();
  const { mutate: deleteRule } = useDeleteSelfRule();

  const rules = data?.data || [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-900">Doimiy ishlarim</h2>
          <p className="text-xs text-gray-500">
            Takrorlanadigan ishlar — topshiriqlar ulardan avtomatik yoziladi
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-gray-100 p-0.5">
          {[
            { value: "active", label: "Faol" },
            { value: "stopped", label: "To'xtatilgan" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatus(item.value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                status === item.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoaderCard className="ring-1 ring-gray-100" />
      ) : rules.length === 0 ? (
        <Card className="ring-1 ring-gray-100">
          <EmptyState
            icon={Repeat}
            title={status === "active" ? "Doimiy ishingiz yo'q" : "To'xtatilgan doimiy ish yo'q"}
            description={
              status === "active"
                ? '"O\'zimga belgilash" oynasida turni "Asosiy" qilib tanlasangiz, takrorlanadigan ish yaratiladi.'
                : "To'xtatilgan qoidalar shu yerda ko'rinadi."
            }
          />
        </Card>
      ) : (
        <ul className="space-y-2.5">
          {rules.map((rule) => (
            <li key={rule.id} className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-gray-900">{rule.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Repeat className="size-3.5" />
                    {rule.ruleLabel}
                  </p>
                </div>
                {!rule.isActive && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    To'xtatilgan
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                {rule.nextOccurrence && rule.isActive && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    Keyingisi: {formatDateUz(rule.nextOccurrence, { utc: true })}
                  </span>
                )}
                <span>{rule.generatedCount} ta topshiriq yozilgan</span>
                {rule.stopReason && <span>To'xtatish sababi: {rule.stopReason}</span>}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {rule.isActive ? (
                  <button
                    type="button"
                    onClick={() => openModal("stopSelfTask", { task: rule, mode: "rule" })}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <Ban className="size-3.5" />
                    To'xtatish
                  </button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg px-2.5 text-xs"
                    onClick={() =>
                      resumeRule(rule.id, {
                        onSuccess: () => toast.success("Doimiy ish qayta yoqildi"),
                        onError: (err) =>
                          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
                      })
                    }
                  >
                    <Play className="size-3.5" />
                    Qayta yoqish
                  </Button>
                )}

                <ConfirmPopover
                  danger
                  title="Doimiy ishni o'chirish"
                  description="Qoida o'chiriladi. Undan yozilgan topshiriqlar joyida qoladi."
                  confirmLabel="O'chirish"
                  onConfirm={() =>
                    deleteRule(rule.id, {
                      onSuccess: () => toast.success("Doimiy ish o'chirildi"),
                      onError: (err) =>
                        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
                    })
                  }
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                    O'chirish
                  </button>
                </ConfirmPopover>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelfRulesList;
