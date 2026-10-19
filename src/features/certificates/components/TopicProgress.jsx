// Icons
import { BookOpen } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * MAVZU PROGRESSI — "sinf mavzuning nechanchisiga yetdi".
 *
 * Progress yo'nalishga bog'langan FANNING mavzularidan chiqadi: 200
 * mavzudan 100-siga yetgan sinf — 50% o'tilgan, 50% qoldi. Uchta raqam
 * bir-biriga MOS keladi (`yetdi + qoldi = jami`), chunki server joriy
 * mavzuni "yetilgan" deb sanaydi.
 *
 * ⚠️ Progress SINFGA tegishli, o'quvchiga emas — platformada o'quvchining
 * shaxsiy mavzu o'rni yo'q. Shu sababli sinf nomi ham ko'rsatiladi: raqam
 * qayerdan kelgani ko'rinib turishi kerak.
 *
 * ⚠️ Progress bo'lmasa — SABABI yoziladi, "—" emas: har sabab boshqa
 * harakat talab qiladi (yo'nalishni fanga bog'lash, mavzu yuklash,
 * jadvalga dars qo'yish).
 *
 * @param {object} props
 * @param {object|null} props.progress - server javobidagi `plan.progress`
 * @param {boolean} [props.compact] - jadval katagi uchun qisqa ko'rinish
 */
const TopicProgress = ({ progress, compact = false }) => {
  if (!progress) return <span className="text-gray-400">—</span>;

  if (!progress.available) {
    return (
      <span className={cn("text-gray-500", compact ? "text-xs" : "text-sm")}>
        {progress.reason || "Progress hisoblanmadi"}
      </span>
    );
  }

  const { percent, reachedTopics, totalTopics, remainingTopics } = progress;

  return (
    <div className={cn("min-w-28", compact ? "space-y-1" : "space-y-1.5")}>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn("font-semibold text-gray-900", compact ? "text-xs" : "text-sm")}
        >
          {percent}%
        </span>
        <span className="text-xs text-gray-500">
          {reachedTopics} / {totalTopics}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>

      {!compact && (
        <p className="flex items-center gap-1.5 text-xs text-gray-500">
          <BookOpen className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">
            {progress.currentTopicName
              ? `${reachedTopics}-mavzu: ${progress.currentTopicName}`
              : `Yana ${remainingTopics} mavzu`}
            {progress.className ? ` · ${progress.className}` : ""}
          </span>
        </p>
      )}
    </div>
  );
};

export default TopicProgress;
