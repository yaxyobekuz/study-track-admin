// Icons
import {
  ClipboardList,
  UserPlus,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { scoreColor } from "../data/diagnostics.data";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * "BUGUN" QATORI — kunlik kuzatuv.
 *
 * ⚠️ SANA FILTRIDAN MUSTAQIL VA BU ATAYLAB. Yuqoridagi oraliq
 * "avgust" bo'lsa ham, bu to'rt karta BUGUNGI kunni ko'rsatadi: ular
 * hisobot emas, kuzatuv paneli. Sarlavhada shu ochiq yozilgan, aks
 * holda raqamlar oraliqqa mos kelmagandek tuyulardi.
 *
 * ⚠️ "Ishlangan" va "tugatilgan" HAR XIL: birinchisi topshirilgan
 * urinishlar, ikkinchisi AI tahlili ham tayyor bo'lganlari. Shu sababli
 * ikkinchisi har doim birinchisidan kichik yoki teng.
 */
const TodayCards = ({ today }) => {
  const attempts = today?.attempts;
  const growth = attempts?.growth;
  const hasGrowth = growth != null && Number.isFinite(growth);
  const GrowthIcon = growth > 0 ? TrendingUp : TrendingDown;

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-semibold text-gray-900">Bugun</h2>
        <p className="text-sm text-gray-500">
          Sana filtridan mustaqil — joriy kun ko'rsatkichlari
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          icon={ClipboardList}
          tint="#2563EB"
          label="Ishlangan testlar"
          value={attempts?.value ?? 0}
        >
          {hasGrowth && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                growth < 0 ? "text-rose-600" : "text-emerald-600",
              )}
            >
              <GrowthIcon className="size-3.5" strokeWidth={2} />
              {growth > 0 ? "+" : ""}
              {growth}%
            </span>
          )}
          {!hasGrowth && (
            <span className="text-xs text-gray-300">kecha bilan taqqoslab bo'lmadi</span>
          )}
        </Tile>

        <Tile
          icon={UserPlus}
          tint="#7C3AED"
          label="Yangi o'quvchilar"
          value={today?.newStudents ?? 0}
        />

        <Tile
          icon={CheckCircle2}
          tint="#10B981"
          label="Tugatilgan testlar"
          value={today?.evaluated ?? 0}
        >
          <span className="text-xs text-gray-400">AI tahlili bilan</span>
        </Tile>

        <Tile
          icon={TrendingDown}
          tint="#EF4444"
          label="Eng past natija"
          value={
            today?.lowest?.score != null ? (
              <span style={{ color: scoreColor(today.lowest.score) }}>
                {Math.round(today.lowest.score)}%
              </span>
            ) : (
              "—"
            )
          }
        >
          {today?.lowest && (
            <span className="block truncate text-xs text-gray-400">
              {[today.lowest.className, today.lowest.subject]
                .filter(Boolean)
                .join(", ") || "—"}
            </span>
          )}
        </Tile>
      </div>
    </Card>
  );
};

/** ⚠️ Ikonka TANADA nomlanadi — JSX'da katta harfli identifikator kerak. */
const Tile = ({ icon, tint, label, value, children }) => {
  const Icon = icon;

  return (
    <div className="rounded-xl border border-gray-100 p-3.5">
      <span
        className="flex size-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${tint}1F`, color: tint }}
      >
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <p className="mt-2.5 truncate text-2xl font-semibold tabular-nums text-gray-900">
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
};

export default TodayCards;
