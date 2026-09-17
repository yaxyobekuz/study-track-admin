// Components
import Counter from "@/shared/components/ui/Counter";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { STAT_CARDS, TONES } from "../../data/tasks.data";

/**
 * "Asosiy" tab tepasidagi jonli hisoblagichlar. Har bir karta — FILTR
 * tugmasi: bosilganda ro'yxat shu kesimga tushadi, qayta bosilsa filtr
 * olib tashlanadi. Faol karta halqa bilan ajratiladi.
 *
 * @param {object} props
 * @param {object} [props.stats] - `GET /tasks/stats`
 * @param {(card: object) => boolean} props.isActive
 * @param {(card: object) => void} props.onSelect
 */
const TaskStatsStrip = ({ stats, isActive, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    {STAT_CARDS.map((card) => {
      const tone = TONES[card.tone];
      const Icon = card.icon;
      const active = isActive(card);
      const value = stats?.[card.key];

      return (
        <button
          key={card.key}
          type="button"
          onClick={() => onSelect(card)}
          aria-pressed={active}
          className={cn(
            "group rounded-2xl bg-gradient-to-b to-white p-3.5 text-left ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md xs:p-4",
            tone.card,
            active && "shadow-md ring-2 ring-primary",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-xl",
                tone.chip,
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
            </span>
            {active && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-white">
                Filtr
              </span>
            )}
          </div>

          <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
            {value == null ? "—" : <Counter value={value} />}
          </p>
          <p className={cn("mt-0.5 text-xs font-medium leading-tight", tone.text)}>
            {card.label}
            {card.key === "dueSoon" && stats?.dueSoonHours && (
              <span className="font-normal text-gray-400">
                {" "}
                · {stats.dueSoonHours} soat ichida
              </span>
            )}
          </p>
        </button>
      );
    })}
  </div>
);

export default TaskStatsStrip;
