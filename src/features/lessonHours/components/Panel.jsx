// Icons
import { TriangleAlert } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { MOTION, RAIL, STAGE, SURFACE, T } from "../data/ledger.tokens";

/**
 * KARTA QOBIG'I — dars soatlari bo'limining yagona konteyneri.
 *
 * ⚠️ NUSXA, IMPORT EMAS. `features/security/components/Panel.jsx` bilan
 * bir xil shakl, lekin alohida fayl: qo'shni bo'limdan import qilinsa,
 * xavfsizlik kartasini o'zgartirish jimgina bu ekranni ham o'zgartirardi.
 * Bu qoida butun repoda amal qiladi (Atlas, Puls, Sentinel — hammasi
 * o'z nusxasini olib yuradi).
 *
 * ⚠️ CHEGARA YO'Q, SIGNAL RELSI BOR. Karta oq sirt + ikki qavatli soya
 * bilan ajraladi; chap qirradagi 3px chiziq esa kartaning BOSQICHINI
 * kodlaydi va u yuqoridan pastga CHIZILADI (`rail-draw`) — registrda
 * yozuv aynan shunday paydo bo'ladi.
 *
 * ⚠️ SARLAVHA OSTIDA CHIZIQ YO'Q, 14px HAVO BOR. Har kartada `border-b`
 * bo'lsa, ekran bo'ylab gorizontal chiziqlar to'plami hosil bo'lardi.
 *
 * ⚠️ HOLATLAR KARTANING ICHIDA: bitta blok sekin kelsa, butun ekran
 * bo'shab qolmasligi kerak.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.hint] - nima o'lchanadi
 * @param {React.ComponentType} [props.icon] - lucide komponenti
 * @param {string} [props.tone="planned"] - `RAIL.tone` kaliti
 * @param {React.ReactNode} [props.action] - sarlavhaning o'ng tomoni
 * @param {number} [props.delay=0] - kirish animatsiyasi kechikishi (ms)
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isError]
 * @param {boolean} [props.isEmpty]
 * @param {string} [props.emptyText]
 * @param {"default"|"flush"} [props.padding] - `flush`: kontent chetgacha
 */
const Panel = ({
  title,
  hint,
  icon: Icon,
  tone = "planned",
  action,
  delay = 0,
  isLoading = false,
  isError = false,
  isEmpty = false,
  emptyText = "Bu oy uchun ma'lumot yo'q",
  padding = "default",
  className,
  children,
}) => (
  <section
    className={cn(SURFACE.card, "flex min-h-0 flex-col", MOTION.enter, className)}
    style={{ animationDelay: `${delay}ms` }}
  >
    <span
      aria-hidden="true"
      className={cn(RAIL.base, RAIL.draw, RAIL.tone[tone] ?? RAIL.tone.neutral)}
      style={{ animationDelay: `${delay + 120}ms` }}
    />

    {/* ── Sarlavha ───────────────────────────────────────────────── */}
    <header className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-[9px]",
              STAGE[tone]?.icon ?? "bg-slate-100 text-slate-500",
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
        children
      )}
    </div>
  </section>
);

/**
 * YUKLANISH — skelet, spinner emas.
 *
 * Spinner "kutish" ni bildiradi, skelet esa "shu yerda nima keladi" ni:
 * blok o'z shaklini yo'qotmaydi va kontent kelganda sakrash bo'lmaydi.
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
    <p className="text-[12px] font-medium text-slate-500">
      Ma'lumotni yuklab bo'lmadi
    </p>
  </div>
);

const PanelEmpty = ({ text }) => (
  <div className="flex flex-1 items-center justify-center py-6">
    <p className="max-w-[260px] text-center text-[11.5px] leading-relaxed text-slate-400">
      {text}
    </p>
  </div>
);

export default Panel;
