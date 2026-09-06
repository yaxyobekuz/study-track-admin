// React
import { useMemo } from "react";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowRight, CalendarCheck, CircleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Tokens
import { DELAY, MOTION, SURFACE, T } from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/**
 * MONITORING INTIZOMI — issiqlik xaritasi va bugungi qoldiq.
 *
 * ⚠️ ISSIQLIK XARITASI, chiziqli diagramma EMAS. Intizom KUNLIK
 * hodisa va undagi naqsh haftaning kunlariga bog'liq ("dushanbalarda
 * hamma yuboradi, shanbada hech kim"). Chiziqli diagrammada bu naqsh
 * shovqinga aylanadi; ustunlar hafta kunlari bo'yicha tik joylashganda
 * esa u BIR QARASHDA ko'rinadi.
 *
 * ⚠️ RANG BESH POG'ONADA, uzluksiz gradient emas. Uzluksiz shkalada
 * "64%" va "71%" ni ko'z ajrata olmaydi; besh pog'ona esa aniq
 * savolga javob beradi: "to'liq / ko'pchilik / yarmi / ozchilik /
 * hech kim".
 *
 * ⚠️ Sana `formatDateUz` bilan chiziladi va `utc: true` BILAN:
 * `InventoryCheck.date` UTC yarim tunida yotadi (`.claude/rules/dates.md`
 * §4) — bayroqsiz kun bir kunga siljib ketardi.
 */

/** Intizom pog'onalari — pastdan yuqoriga. */
const STEPS = [
  { min: 100, className: "bg-indigo-600", label: "Barchasi" },
  { min: 75, className: "bg-indigo-500/80", label: "Ko'pchiligi" },
  { min: 40, className: "bg-indigo-400/60", label: "Yarmi" },
  { min: 1, className: "bg-indigo-300/50", label: "Ozchiligi" },
  { min: 0, className: "bg-slate-100", label: "Hech kim" },
];

const stepOf = (rate) => STEPS.find((step) => rate >= step.min) ?? STEPS[STEPS.length - 1];

/** Hafta kunlarining qisqartmasi — dushanbadan boshlab. */
const WEEKDAYS = ["Du", "Se", "Cho", "Pay", "Ju", "Sha", "Yak"];

const MonitoringCard = ({ data, isLoading, isError, delay = 0, className }) => {
  const monitoring = data?.monitoring;

  /**
   * Kunlarni HAFTA USTUNLARIGA joylashtiramiz.
   *
   * ⚠️ Hafta DUSHANBADAN boshlanadi (`weekday` da 0 = yakshanba, shuning
   * uchun siljitiladi): o'zbek kalendarida hafta dushanba bilan
   * boshlanadi va yakshanba oxirgi ustun bo'lishi kerak.
   */
  const weeks = useMemo(() => {
    const days = monitoring?.days ?? [];
    if (days.length === 0) return [];

    const result = [];
    let current = new Array(7).fill(null);

    for (const day of days) {
      const column = (day.weekday + 6) % 7; // 0 = dushanba
      // Yangi hafta boshlandi — oldingisini yopamiz
      if (current[column] !== null) {
        result.push(current);
        current = new Array(7).fill(null);
      }
      current[column] = day;
    }
    result.push(current);

    return result;
  }, [monitoring]);

  const pending = monitoring?.pending ?? [];

  return (
    <Panel
      title="Monitoring intizomi"
      hint={`Oxirgi ${monitoring?.days?.length ?? 91} kun · kunlik hisobotlar`}
      icon={CalendarCheck}
      accent="monitor"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={weeks.length === 0}
      emptyText="Kunlik monitoring hali yoqilmagan"
      className={className}
      action={
        <Link to="/inventory/checks" className={T.link}>
          Hisobotlar
          <ArrowRight className={T.linkArrow} />
        </Link>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* ── Bugungi holat ─────────────────────────────────────── */}
        <TodayBar monitoring={monitoring} delay={delay} />

        {/* ── Issiqlik xaritasi ───────────────────────────────────
            ⚠️ Kataklar QAT'IY o'lchamda (14px), `flex-1` EMAS. Cho'ziluvchi
            katak keng kartada 60×14px lik tasmaga aylanib, xarita
            "kalendar" bo'lib o'qilmay qolardi — GitHub'dan tanish
            bo'lgan naqshning butun kuchi kataklarning KVADRAT
            bo'lishida. Ortib qolgan joyni yonidagi ro'yxat egallaydi. */}
        <div className="mt-4 flex flex-wrap items-start gap-x-5 gap-y-4">
          <div className="flex gap-1.5">
            {/* Hafta kunlari — chapdagi ustun */}
            <div className="flex shrink-0 flex-col gap-[3px] pr-0.5">
              {WEEKDAYS.map((day, index) => (
                <span
                  key={day}
                  className={cn(
                    "flex h-[14px] items-center text-[8.5px] font-medium leading-none text-slate-300",
                    // Faqat toq kunlar — hammasini yozsak, 14px lik
                    // qatorlarda yozuvlar bir-biriga tegib ketardi
                    index % 2 === 1 ? "opacity-100" : "opacity-0",
                  )}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Haftalar — ustunlar */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => (
                    <HeatCell
                      key={day?.date ?? `${weekIndex}-${dayIndex}`}
                      day={day}
                      delay={delay + DELAY.content + (weekIndex * 7 + dayIndex) * 6}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Shkala — xaritaning yonida, ostida emas: keng kartada
              ostidagi shkala xaritadan uzilib qolardi */}
          <div className="flex items-center gap-1.5 self-end">
            <span className="text-[9.5px] font-medium text-slate-400">Kam</span>
            {[...STEPS].reverse().map((step) => (
              <span
                key={step.min}
                className={cn("size-2.5 rounded-[3px]", step.className)}
                title={step.label}
                aria-hidden
              />
            ))}
            <span className="text-[9.5px] font-medium text-slate-400">Ko'p</span>
          </div>
        </div>

        {/* ── Bugun hisobot bermaganlar ─────────────────────────── */}
        {pending.length > 0 && (
          <div className="mt-4">
            <p className={cn(T.label, "flex items-center gap-1.5")}>
              <CircleAlert className="size-3 text-amber-500" strokeWidth={2.4} />
              Bugun hisobot bermadi
            </p>

            <ul className="mt-2 space-y-1">
              {pending.slice(0, 4).map((location, index) => (
                <li
                  key={location.locationId}
                  className={cn(
                    SURFACE.tile,
                    "flex items-center gap-2 px-2.5 py-1.5",
                    MOTION.enterX,
                  )}
                  style={{ animationDelay: `${delay + DELAY.content + 260 + index * 50}ms` }}
                >
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-slate-700">
                    {location.name}
                  </span>

                  {location.isDraft && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-px text-[9px] font-semibold text-amber-700">
                      Boshlangan
                    </span>
                  )}

                  <span className="shrink-0 truncate text-[10px] text-slate-400">
                    {location.responsibleName ?? "Mas'ul yo'q"}
                  </span>
                </li>
              ))}
            </ul>

            {pending.length > 4 && (
              <p className="mt-1.5 text-[10.5px] font-medium text-slate-400">
                va yana {pending.length - 4} ta xona
              </p>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
};

/** Bugungi holat — nisbat va chiziq. */
const TodayBar = ({ monitoring, delay }) => {
  const submitted = monitoring?.submittedToday ?? 0;
  const total = monitoring?.totalLocations ?? 0;
  const rate = monitoring?.todayRate ?? 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={T.label}>Bugun</span>
        <span className="text-[11px] font-medium text-slate-400">
          {formatDateUz(monitoring?.date, { utc: true })}
        </span>
      </div>

      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={cn(T.value, T.sizeXl)}>{submitted}</span>
        <span className="text-[12px] font-medium text-slate-400">/ {total} xona</span>
        <span
          className={cn(
            "ml-auto text-[12px] font-semibold tabular-nums",
            rate >= 100 ? "text-emerald-600" : rate >= 60 ? "text-slate-600" : "text-amber-600",
          )}
        >
          {rate}%
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full",
            rate >= 100 ? "bg-emerald-500" : "bg-indigo-500",
            MOTION.growX,
          )}
          style={{
            width: `${Math.min(100, rate)}%`,
            animationDelay: `${delay + DELAY.content}ms`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * ISSIQLIK KATAKCHASI.
 *
 * ⚠️ Bo'sh katak (`day == null`) — oyning boshidagi/oxiridagi to'ldirish.
 * U DOIM chiziladi, aks holda hafta ustunlari har xil balandlikda
 * bo'lib, xarita "singan" ko'rinardi.
 */
const HeatCell = ({ day, delay }) => {
  if (!day) return <span className="size-[14px] rounded-[3px] bg-transparent" aria-hidden />;

  const step = stepOf(day.rate);

  return (
    <span
      className={cn(
        "group relative size-[14px] cursor-default rounded-[3px] transition-transform duration-200 ease-out-quint",
        step.className,
        "motion-safe:hover:scale-[1.18]",
        MOTION.pop,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Tooltip — sana, nisbat va o'sha kungi zarar */}
      <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 w-max -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        <span className="block text-[10px] font-semibold text-white">
          {formatDateUz(day.date, { utc: true })}
        </span>
        <span className="mt-0.5 block text-[10px] text-white/60 tabular-nums">
          {day.submitted} / {day.total} xona · {day.rate}%
        </span>
        {(day.brokenCount > 0 || day.missingCount > 0) && (
          <span className="mt-0.5 block text-[10px] text-rose-300 tabular-nums">
            {day.brokenCount} sindi · {day.missingCount} yo'qoldi
          </span>
        )}
      </span>
    </span>
  );
};

export default MonitoringCard;
