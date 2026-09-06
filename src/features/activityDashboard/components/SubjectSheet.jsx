// TanStack Query
import { useQuery } from "@tanstack/react-query";

// React
import { useMemo } from "react";

// Icons
import { Activity, CalendarDays, History, TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Hooks
import useMediaQuery from "@/shared/hooks/useMediaQuery";

// Ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/shared/components/shadcn/drawer";

// Queries
import { activityQueries } from "../queries/activity.queries";

// Tokens
import {
  DELAY,
  MOTION,
  ROW,
  SURFACE,
  T,
  contentDelay,
  heatColor,
} from "../data/pulse.tokens";

/**
 * BITTA ODAMNING FAOLLIK TARIXI.
 *
 * ⚠️ MAVJUD MODAL PRIMITIVLARI ISHLATILDI, `ResponsiveModal` EMAS —
 * xavfsizlik bo'limidagi `UserSecuritySheet` bilan bir xil sabab:
 * `ResponsiveModal` ochiqlik holatini `useModal(name)` reyestridan
 * o'zi oladi va NOMGA bog'lanadi, bu blok esa boshqariladigan
 * bo'lishi kerak — u to'rtta har xil ro'yxatdan ochiladi va qaysi
 * subyekt tanlangani sahifada turadi.
 *
 * ⚠️ IKKI XIL SUBYEKT, BITTA EKRAN. Xodim (`userId`) va botga
 * bog'langan hisob (`telegramId`) bir xil ko'rinishda chiziladi,
 * chunki savol ikkalasida ham BIR XIL: "bu odam qachon va nima
 * qildi". Ikkita alohida ekran yozilsa, ular asta-sekin bir-biridan
 * uzoqlashardi.
 *
 * ⚠️ SO'ROV FAQAT OCHILGANDA KETADI (`enabled`): ro'yxatdagi har
 * qatorga oldindan so'rov yuborish yuzlab keraksiz chaqiruv bo'lardi.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {(next: boolean) => void} props.onOpenChange
 * @param {{ userId?: string, telegramId?: string, title?: string, subtitle?: string }|null} props.subject
 * @param {number} props.days - sahifadagi davr bilan bir xil
 */
const SubjectSheet = ({ open, onOpenChange, subject, days }) => {
  const isDesktop = useMediaQuery("(min-width: 480px)");

  const params = useMemo(
    () =>
      subject
        ? {
            ...(subject.userId ? { userId: subject.userId } : {}),
            ...(subject.telegramId ? { telegramId: subject.telegramId } : {}),
            days,
          }
        : null,
    [subject, days],
  );

  const query = useQuery({
    ...activityQueries.subject(params ?? {}),
    enabled: open && Boolean(params?.userId || params?.telegramId),
  });

  const title = subject?.title || "Faollik tarixi";
  const subtitle =
    subject?.subtitle ||
    (subject?.telegramId ? "Botga bog'langan hisob" : "Xodim paneli");

  const body = (
    <Body data={query.data} isLoading={query.isLoading} isError={query.isError} />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className={T.hint}>{subtitle}</DialogDescription>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4 pb-6">
        <DrawerTitle className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          {title}
        </DrawerTitle>
        <DrawerDescription className={T.hint}>{subtitle}</DrawerDescription>
        {body}
      </DrawerContent>
    </Drawer>
  );
};

/* ═══════════════════════ TANA ═══════════════════════ */

const Body = ({ data, isLoading, isError }) => {
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-10 text-center">
        <TriangleAlert className="size-5 text-slate-300" strokeWidth={1.8} />
        <p className="text-[12px] font-medium text-slate-500">
          Ma'lumotni yuklab bo'lmadi
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-2.5 py-6">
        {[92, 74, 58].map((width, index) => (
          <div
            key={width}
            className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
            style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
          />
        ))}
      </div>
    );
  }

  const calendar = data.calendar ?? [];
  const events = data.events ?? [];
  const max = calendar.reduce((best, row) => Math.max(best, row.value ?? 0), 0);

  return (
    <div className="mt-3 space-y-4">
      {/* ── Ikki ko'rsatkich ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        <Stat
          label="Faol kunlar"
          value={data.activeDays ?? 0}
          suffix={`/ ${data.period?.days ?? 0}`}
          icon={CalendarDays}
        />
        <Stat
          label="Harakatlar"
          value={data.totalEvents ?? 0}
          icon={Activity}
        />
      </div>

      {/* ── Kunlik lenta ───────────────────────────────────────────────
          ⚠️ Sahifadagi issiqlik xaritasi bilan BIR XIL shkala
          (`heatColor`): bir odam ekranida ikki xil rang tizimi
          bo'lsa, "to'q rang nimani bildiradi" degan savol
          takrorlanardi. */}
      <section>
        <p className={T.label}>Kunlar bo'yicha</p>

        <div className="mt-2 flex flex-wrap gap-[3px]">
          {calendar.map((row, index) => (
            <span
              key={row.day}
              title={`${row.label} — ${row.value} ta harakat`}
              className={cn("size-[13px] rounded-[4px]", MOTION.tick)}
              style={{
                backgroundColor: heatColor(row.value, max),
                animationDelay: `${index * 8}ms`,
              }}
            />
          ))}
        </div>

        {calendar.length > 0 && (
          <div className="mt-1.5 flex items-center justify-between">
            <span className={T.meta}>{data.period?.fromLabel ?? "—"}</span>
            <span className={T.meta}>{data.period?.toLabel ?? "—"}</span>
          </div>
        )}
      </section>

      {/* ── So'nggi harakatlar ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-1.5">
          <History className="size-3.5 text-slate-400" strokeWidth={2} />
          <p className={T.label}>So'nggi harakatlar</p>
        </div>

        {events.length === 0 ? (
          <p className="mt-3 text-center text-[11.5px] leading-relaxed text-slate-400">
            Bu davrda harakat qayd etilmagan
          </p>
        ) : (
          /* ⚠️ MODALDA `-mx-5` EMAS, `-mx-1`: modal kontenti kartadan
             ko'ra tor padding bilan chiziladi. `ROW.list` dagi manfiy
             chekinish konteynerning haqiqiy paddingiga mos kelishi
             shart, aks holda hairline kontent chetidan chiqib ketardi. */
          <ul
            className={cn(
              "-mx-1 mt-2 max-h-[280px] divide-y divide-slate-100 overflow-y-auto hidden-scrollbar",
            )}
          >
            {events.map((event, index) => (
              <li
                key={event.id}
                className={MOTION.enterUp}
                style={{
                  animationDelay: `${contentDelay(DELAY.content, Math.min(index, 10))}ms`,
                }}
              >
              <div className={cn(ROW.base, ROW.hover, "gap-2.5 px-1 py-2")}>
                {/* Kanal relsi — DOIMIY, hover'da ochiladigan
                    `ROW.rail` emas: u qaysi kanaldan ekanini
                    bildiradi va bu ma'no sichqonchaga bog'liq emas */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 w-[2px]",
                    event.channel === "bot" ? "bg-violet-500" : "bg-sky-500",
                  )}
                />

                <span className="min-w-0 flex-1">
                  <span className={cn(T.tdName, "block truncate")}>
                    {event.actionLabel}
                  </span>
                  <span className={cn(T.meta, "block truncate")}>
                    {event.channelLabel}
                  </span>
                </span>

                <span className={cn(T.meta, "ml-auto shrink-0")}>
                  {event.occurredLabel || "—"}
                </span>
              </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const Stat = ({ label, value, suffix, icon: Icon }) => (
  <div className={cn(SURFACE.tile, "px-3 py-2.5")}>
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-slate-400" strokeWidth={2} />
      <span className={T.label}>{label}</span>
    </div>

    <p className="mt-1.5 flex items-baseline gap-1">
      <span className={cn(T.value, T.sizeXl)}>{value}</span>
      {suffix && <span className={T.meta}>{suffix}</span>}
    </p>
  </div>
);

export default SubjectSheet;
