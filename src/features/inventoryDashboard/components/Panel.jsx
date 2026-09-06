// Icons
import { TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { MOTION, SURFACE, T } from "../data/atlas.tokens";

/**
 * KARTA QOBIG'I — dashboardning yagona konteyneri.
 *
 * ⚠️ CHEGARA YO'Q (`atlas.tokens.js` sarlavhasidagi izoh): karta oq
 * sirt + yumshoq soya bilan ajraladi. `ring-1` qo'shilsa, o'n ikkita
 * blok o'n ikkita kontur chizib, ekran "jadval ustidagi jadval" bo'lardi.
 *
 * ⚠️ SARLAVHA OSTIDA AJRATUVCHI CHIZIQ HAM YO'Q. Ta'lim dashboardida u
 * bor (`border-b border-slate-100`), chunki u yerda karta zich va
 * sarlavha kontentga yopishib turadi. Bu yerda ajratuvchi — BO'SHLIQ
 * (14px): chiziqsiz sarlavha "kontentning bir qismi" bo'lib o'qiladi va
 * ekranda gorizontal chiziqlar to'plami hosil bo'lmaydi.
 *
 * ⚠️ HOLATLAR KARTANING ICHIDA. Yuklanish va xato sahifa darajasida
 * emas, har blokda alohida chiziladi: bitta blok sekin kelsa, butun
 * ekran bo'shab qolmasligi kerak.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.hint] - sarlavha ostidagi izoh
 * @param {React.ComponentType} [props.icon] - lucide komponenti
 * @param {string} [props.accent] - ikonka ohangi (HUE kaliti)
 * @param {React.ReactNode} [props.action] - sarlavhaning o'ng tomoni
 * @param {number} [props.delay] - kirish animatsiyasi kechikishi (ms)
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {boolean} [props.isEmpty]
 * @param {string} [props.emptyText]
 * @param {"default"|"flush"} [props.padding] - `flush`: kontent chetgacha
 */
const ACCENT_ICON = {
  base: "bg-teal-50 text-teal-600",
  damage: "bg-rose-50 text-rose-600",
  recovery: "bg-emerald-50 text-emerald-600",
  monitor: "bg-indigo-50 text-indigo-600",
  warn: "bg-amber-50 text-amber-600",
  neutral: "bg-slate-100 text-slate-500",
};

const Panel = ({
  title,
  hint,
  icon: Icon,
  accent = "neutral",
  action,
  delay = 0,
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyText = "Bu davr uchun ma'lumot yo'q",
  padding = "default",
  className,
  children,
}) => (
  <section
    className={cn(SURFACE.card, "flex min-h-0 flex-col", MOTION.enter, className)}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* ── Sarlavha ───────────────────────────────────────────────── */}
    <header
      className={cn(
        "flex shrink-0 items-start justify-between gap-3",
        padding === "flush" ? "px-5 pt-5" : "px-5 pt-5",
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-[9px]",
              ACCENT_ICON[accent] ?? ACCENT_ICON.neutral,
            )}
          >
            <Icon className="size-3.5" strokeWidth={2.2} />
          </span>
        )}

        <div className="min-w-0">
          <h2 className={cn(T.title, "truncate")}>{title}</h2>
          {hint && <p className={cn(T.hint, "mt-0.5")}>{hint}</p>}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>

    {/* ── Tana ───────────────────────────────────────────────────── */}
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        padding === "flush" ? "mt-3.5" : "mt-3.5 px-5 pb-5",
      )}
    >
      {isLoading ? (
        <PanelSkeleton />
      ) : isError ? (
        <PanelError />
      ) : isEmpty ? (
        <PanelEmpty text={emptyText} />
      ) : (
        /* ⚠️ Kontent kechikishini Panel BERMAYDI: har blok o'z `delay`
           propini sahifadan oladi va `contentDelay` bilan o'zi
           hisoblaydi. `cloneElement` bilan uzatilsa, `delay` oddiy DOM
           elementiga tushib, React ogohlantirishi chiqardi. */
        children
      )}
    </div>
  </section>
);

/**
 * YUKLANISH — jimirlaydigan plitkalar.
 *
 * ⚠️ Aylanadigan spinner EMAS. Spinner "kutish" ni bildiradi, skelet esa
 * "shu yerda nima keladi" ni ko'rsatadi: blok o'z shaklini yo'qotmaydi
 * va kontent kelganda sakrash bo'lmaydi.
 */
const PanelSkeleton = () => (
  <div className="flex flex-1 flex-col justify-center gap-2.5 py-2">
    {[92, 74, 58].map((width, index) => (
      <div
        key={width}
        className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
        style={{ width: `${width}%`, animationDelay: `${index * 160}ms` }}
      />
    ))}
  </div>
);

const PanelError = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
    <TriangleAlert className="size-5 text-slate-300" strokeWidth={1.8} />
    <p className="text-[12px] font-medium text-slate-500">Ma'lumotni yuklab bo'lmadi</p>
  </div>
);

const PanelEmpty = ({ text }) => (
  <div className="flex flex-1 items-center justify-center py-6">
    <p className="max-w-[220px] text-center text-[11.5px] leading-relaxed text-slate-400">
      {text}
    </p>
  </div>
);

export default Panel;
