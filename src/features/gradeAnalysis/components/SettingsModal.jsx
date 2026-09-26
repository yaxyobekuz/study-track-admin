// Icons
import { BellRing, CalendarClock, Loader2, Sparkles } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Switch from "@/shared/components/ui/switch/Switch";

// Queries
import { gradeAnalysisQueries } from "../queries/gradeAnalysis.queries";
import { useUpdateGradeAnalysisSettings } from "../queries/gradeAnalysis.mutations";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { T } from "../data/analysis.tokens";

/**
 * HAFTALIK AVTOMAT TAHLIL — har dushanba 07:30 da o'tgan hafta bo'yicha
 * butun maktab (server cron'i). Har bir o'zgarish darhol saqlanadi.
 */
const SettingsModal = () => (
  <ResponsiveModal
    name="gradeAnalysisSettings"
    title="Tahlil sozlamalari"
    description="Haftalik avtomat tahlil va AI matni"
    className="max-w-lg"
  >
    <Body />
  </ResponsiveModal>
);

const Body = ({ canEdit = false }) => {
  const { data, isLoading } = useQuery(gradeAnalysisQueries.settings());
  const update = useUpdateGradeAnalysisSettings();

  const save = (key) => (value) =>
    update.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success("Saqlandi"),
        onError: (error) => toast.error(error.response?.data?.message || "Saqlab bo'lmadi"),
      },
    );

  if (isLoading || !data) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const disabled = !canEdit || update.isPending;

  return (
    <div className="space-y-2">
      <Row
        icon={CalendarClock}
        title="Haftalik avtomat tahlil"
        hint="Har dushanba 07:30 da o'tgan hafta (dushanba–yakshanba) bo'yicha butun maktab tahlil qilinadi"
        checked={data.weeklyEnabled}
        disabled={disabled}
        onChange={save("weeklyEnabled")}
      />
      <Row
        icon={BellRing}
        title="Haftalik natijani avtomatik yuborish"
        hint="O'quvchi va ota-onaga mobil ilovada ochiladi va bildirishnoma boradi"
        checked={data.weeklyNotify}
        disabled={disabled || !data.weeklyEnabled}
        onChange={save("weeklyNotify")}
      />
      <Row
        icon={Sparkles}
        title="AI matni"
        hint={
          data.aiAvailable
            ? "Xulosa va tavsiyalarni AI yozadi, raqamlar esa har doim hisob-kitobdan"
            : "Serverda AI kaliti sozlanmagan — matn qoidalar asosida tuziladi"
        }
        checked={data.useAi && data.aiAvailable}
        disabled={disabled || !data.aiAvailable}
        onChange={save("useAi")}
      />
      {!canEdit && <p className={cn(T.meta, "pt-2")}>Sozlamani o'zgartirish uchun ruxsat yo'q.</p>}
    </div>
  );
};

const Row = ({ icon: Icon, title, hint, checked, disabled, onChange }) => (
  <label
    className={cn(
      "flex items-center gap-3 rounded-xl bg-white px-3.5 py-3 ring-1 ring-slate-200",
      disabled ? "opacity-60" : "cursor-pointer hover:ring-slate-300",
    )}
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <Icon className="size-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-semibold text-slate-900">{title}</span>
      <span className="block text-[11.5px] leading-snug text-slate-500">{hint}</span>
    </span>
    <Switch checked={checked} disabled={disabled} onChange={onChange} />
  </label>
);

export default SettingsModal;
