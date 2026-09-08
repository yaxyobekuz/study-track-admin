// Icons
import { Layers } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Components
import Panel from "./Panel";

// Data & tokens
import { MODE, MOTION, SURFACE, T } from "../data/ledger.tokens";
import { formatHourNumber } from "../data/lessonHours.data";

/**
 * MAOSH REJIMLARINING TAQSIMOTI — bitta gorizontal lenta.
 *
 * ⚠️ DOIRAVIY DIAGRAMMA EMAS. Segmentlar odatda uchta va ulardan biri
 * juda katta bo'ladi; doirada bunday nisbatni o'qish uchun ko'z burchak
 * o'lchashi kerak, lentada esa uzunlik to'g'ridan-to'g'ri taqqoslanadi.
 *
 * ⚠️ NOL SEGMENT CHIZILMAYDI, lekin ro'yxatdan TUSHMAYDI: "bu maktabda
 * soatbay o'qituvchi yo'q" — bu ham javob, bo'shliq emas.
 *
 * ⚠️ Lenta `scaleX` bilan ochiladi (`grow-x`), kengligi emas: kenglik
 * animatsiyasi har kadrda layout hisoblatardi.
 */
const ModeSplit = ({ data, isLoading, isError, delay = 0 }) => {
  const modes = data?.modes ?? [];
  const totalStaff = modes.reduce((sum, m) => sum + m.staffCount, 0);

  return (
    <Panel
      title="Maosh rejimlari"
      hint="Kim qanday shartnoma bo'yicha ishlaydi"
      icon={Layers}
      tone="sealed"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && totalStaff === 0}
      emptyText="Bu oyda oylik qoidasi belgilangan xodim yo'q"
    >
      {/* ── Lenta ────────────────────────────────────────────── */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {modes
          .filter((mode) => mode.staffCount > 0)
          .map((mode, index) => (
            <span
              key={mode.type}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", MOTION.bar)}
              style={{
                width: `${(mode.staffCount / Math.max(1, totalStaff)) * 100}%`,
                background: MODE[mode.type]?.hex ?? "#94A3B8",
                animationDelay: `${delay + 180 + index * 90}ms`,
              }}
              title={`${mode.label}: ${mode.staffCount}`}
            />
          ))}
      </div>

      {/* ── Qatorlar ─────────────────────────────────────────── */}
      <ul className="mt-4 space-y-2">
        {modes.map((mode, index) => (
          <li
            key={mode.type}
            className={cn(
              SURFACE.tile,
              SURFACE.tileHover,
              "flex items-center gap-3 py-2.5",
              mode.staffCount === 0 && "opacity-55",
            )}
            style={{ animationDelay: `${delay + 220 + index * 60}ms` }}
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ background: MODE[mode.type]?.hex ?? "#94A3B8" }}
            />

            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{mode.label}</p>
              <p className={cn(T.meta, "mt-0.5 truncate")}>
                {MODE[mode.type]?.hint}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className={cn(T.tdNum)}>{mode.staffCount} xodim</p>
              <p className={cn(T.meta, "mt-0.5")}>
                {mode.type === "fixed"
                  ? formatMoney(mode.amount)
                  : `${formatHourNumber(mode.hours)} · ${formatMoney(mode.amount)}`}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* ── Bir soatning o'rtacha tannarxi ───────────────────── */}
      {data?.totals?.averageHourCost && (
        <div className="mt-4 flex items-center gap-3">
          <span className={T.label}>1 soat o'rtacha</span>
          <span className={SURFACE.rule} />
          <span className={cn(T.value, T.sizeMd)}>
            {formatMoney(data.totals.averageHourCost)}
          </span>
        </div>
      )}
    </Panel>
  );
};

export default ModeSplit;
