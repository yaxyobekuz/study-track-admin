// Router
import { Link } from "react-router-dom";

// Icons
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  History,
  PackageSearch,
  RefreshCw,
  Users,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Tokens
import { DELAY, MOTION, SURFACE, T } from "../data/atlas.tokens";

// Components
import Panel from "./Panel";

/* ═══════════════════════ JIHOZLAR REYTINGI ═══════════════════════ */

/**
 * JIHOZLAR — "nima ko'p sinadi va bu qancha turadi".
 *
 * ⚠️ ULUSH USTUNI (`failureRate`) MUTLAQ SONDAN MUHIMROQ va u
 * birinchi o'qiladigan raqam emas, lekin ROSTINI aytadi: 500 ta
 * piyoladan 10 tasi sinsa bu 2%, 3 ta proyektordan bittasi sinsa 33%.
 * Mutlaq son bilan saralansa, ro'yxat boshida doim eng ko'p sonli
 * arzon buyum turardi va "qaysi jihoz muammoli" degan savol javobsiz
 * qolardi.
 *
 * ⚠️ Saralash baribir PUL bo'yicha (server): "qaysi jihoz bizga eng
 * qimmatga tushdi" — byudjet savoli, ulush esa sifat savoli. Ikkalasi
 * bir qatorda turadi.
 */
export const ItemsRanking = ({ data, isLoading, isError, delay = 0, className }) => {
  const rows = data?.items ?? [];

  return (
    <Panel
      title="Jihozlar bo'yicha"
      hint="Nima ko'p sinadi va bu maktabga qancha turadi"
      icon={PackageSearch}
      accent="damage"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Bu davrda birorta jihoz bo'yicha zarar yo'q"
      className={className}
      action={
        <Link to="/inventory/damages" className={T.link}>
          Zararlar
          <ArrowRight className={T.linkArrow} />
        </Link>
      }
    >
      <ul className="min-h-0 flex-1 space-y-0.5">
        {rows.map((row, index) => (
          <li
            key={row.itemId}
            className={cn(
              "flex items-center gap-3 rounded-xl px-2 py-2",
              T.row,
              MOTION.enterX,
            )}
            style={{ animationDelay: `${delay + DELAY.content + index * 50}ms` }}
          >
            <div className="min-w-0 flex-1">
              <p className={cn(T.tdName, "truncate")}>{row.name}</p>
              <p className="mt-0.5 truncate text-[10.5px] font-medium text-slate-400">
                {row.categoryName ?? "Toifasiz"} · xatlovda {row.stockQuantity} {row.unit}
              </p>
            </div>

            {/* Sindi / yo'qoldi — ikki xil hodisa, ikki xil rang */}
            <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
              <Tally value={row.brokenQuantity} label="sindi" tone="warn" />
              <Tally value={row.missingQuantity} label="yo'qoldi" tone="damage" />
            </div>

            <div className="shrink-0 text-right">
              <p className={T.tdNum}>{formatMoney(row.amount, { withLabel: false })}</p>
              {row.failureRate != null && (
                <p
                  className={cn(
                    "mt-0.5 text-[10px] font-semibold tabular-nums",
                    row.failureRate >= 15
                      ? "text-rose-600"
                      : row.failureRate >= 5
                        ? "text-amber-600"
                        : "text-slate-400",
                  )}
                >
                  {row.failureRate}% nobud
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

/** Ikki raqamli mayda sanoq — "3 sindi". */
const Tally = ({ value, label, tone }) => {
  if (!value) return null;

  return (
    <span className="flex items-baseline gap-1">
      <span
        className={cn(
          "text-[12px] font-semibold tabular-nums",
          tone === "damage" ? "text-rose-600" : "text-amber-600",
        )}
      >
        {value}
      </span>
      <span className="text-[9.5px] font-medium text-slate-400">{label}</span>
    </span>
  );
};

/* ═══════════════════════ QARZDORLAR ═══════════════════════ */

/**
 * QARZDORLAR — kim qancha qarzdor.
 *
 * ⚠️ DAVRGA BOG'LIQ EMAS va sarlavhada shu aytiladi: "hozirgi qoldiq".
 * O'qish to'lovi qarzdorlari bilan ham chalkashmasligi kerak — bu
 * MODDIY ZARAR qarzi (`inventoryReport.service.js` dagi izoh).
 *
 * ⚠️ Har qatorda TO'LANGAN ULUSH chizig'i bor: "3 mln qarz" degan
 * raqam yolg'iz turganda, uning yarmi to'langanmi yoki hech narsa
 * to'lanmaganmi bilinmaydi — undiruv bilan ishlash uchun esa aynan shu
 * farq kerak.
 */
export const DebtorsPanel = ({ data, isLoading, isError, delay = 0, className }) => {
  const debtors = data?.debtors;
  const rows = debtors?.items ?? [];

  return (
    <Panel
      title="Zarar qarzdorlari"
      hint="Hozirgi qoldiq — davrga bog'liq emas"
      icon={Users}
      accent="warn"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Undirilmagan qarz yo'q"
      className={className}
      action={
        <Link to="/inventory/debtors" className={T.link}>
          Barchasi
          <ArrowRight className={T.linkArrow} />
        </Link>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Jami — ro'yxatdan oldin: "qancha" savolining javobi
            birinchi o'qilishi kerak */}
        <div className={cn(SURFACE.tile, "flex items-baseline gap-2 px-3 py-2.5")}>
          <div className="min-w-0 flex-1">
            <p className={T.label}>Umumiy qoldiq</p>
            <p className={cn(T.value, T.sizeLg, "mt-1")}>
              {formatMoney(debtors?.total, { withLabel: false })}
              <span className="ml-1 text-[10px] font-medium text-slate-400">so'm</span>
            </p>
          </div>

          {debtors?.overdueCount > 0 && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {debtors.overdueCount} ta muddati o'tgan
            </span>
          )}
        </div>

        <ul className="mt-2.5 flex-1 space-y-1.5">
          {rows.map((row, index) => (
            <li
              key={row.personId}
              className={cn("rounded-xl px-2 py-1.5", T.row, MOTION.enterX)}
              style={{ animationDelay: `${delay + DELAY.content + index * 55}ms` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn(T.tdName, "truncate")}>{row.name}</span>
                <span className={cn(T.tdNum, "shrink-0")}>
                  {formatMoney(row.remainingAmount, { withLabel: false })}
                </span>
              </div>

              {/* To'langan ulush — rels emas, TO'LDIRISH: qancha qismi
                  yopilgani chiziqning uzunligida ko'rinadi */}
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full bg-emerald-500", MOTION.growX)}
                  style={{
                    width: `${Math.min(100, row.paidRate ?? 0)}%`,
                    animationDelay: `${delay + DELAY.content + index * 55 + 80}ms`,
                  }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] font-medium text-slate-400">
                  {row.className ?? row.role ?? "—"} · {row.chargeCount} ta qarz
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-medium tabular-nums",
                    row.isOverdue ? "text-amber-600" : "text-slate-400",
                  )}
                >
                  {row.paidRate > 0 ? `${row.paidRate}% to'langan` : "To'lov yo'q"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
};

/* ═══════════════════════ SO'NGGI HARAKATLAR ═══════════════════════ */

/**
 * MIQDOR DAFTARINING SO'NGGI QATORLARI.
 *
 * ⚠️ Bu YAGONA blok VAQT bo'yicha tartiblangan va u ataylab: qolgan
 * hamma blok yig'ma (oy, xona, toifa), bu esa "hozir nima bo'lyapti"
 * degan savolga javob beradi. Rahbar ekranni ochganda birinchi
 * qaraydigan joy ko'pincha shu bo'ladi.
 *
 * ⚠️ ISHORA rangdan MUHIMROQ: kirim (+) va chiqim (−) ni strelka
 * ko'rsatadi, rang esa uni takrorlaydi. Faqat rang bo'lsa, uni ajrata
 * olmaydigan ko'z jihoz kelganini yoki ketganini bilmasdi.
 */
export const ActivityFeed = ({ data, isLoading, isError, delay = 0, className }) => {
  const rows = data?.recent ?? [];

  return (
    <Panel
      title="So'nggi harakatlar"
      hint="Miqdor daftarining oxirgi yozuvlari"
      icon={History}
      accent="neutral"
      delay={delay}
      isLoading={isLoading}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyText="Daftar hali bo'sh"
      className={className}
      action={
        <Link to="/inventory/stock" className={T.link}>
          Xatlov
          <ArrowRight className={T.linkArrow} />
        </Link>
      }
    >
      <ul className="min-h-0 flex-1 space-y-0.5">
        {rows.map((row, index) => (
          <MovementRow
            key={row.id}
            row={row}
            delay={delay + DELAY.content + index * 45}
          />
        ))}
      </ul>
    </Panel>
  );
};

/** Harakat turi → ikonka va ohang. */
const MOVEMENT_TONE = {
  purchase: { tone: "in", icon: ArrowUpRight },
  initial: { tone: "in", icon: ArrowUpRight },
  transfer_in: { tone: "in", icon: ArrowUpRight },
  repair: { tone: "good", icon: RefreshCw },
  damage: { tone: "out", icon: ArrowDownRight },
  write_off: { tone: "out", icon: ArrowDownRight },
  transfer_out: { tone: "out", icon: ArrowDownRight },
  damage_revert: { tone: "good", icon: RefreshCw },
  adjustment: { tone: "flat", icon: RefreshCw },
};

const TONE_CLASS = {
  in: "bg-teal-50 text-teal-600",
  out: "bg-rose-50 text-rose-600",
  good: "bg-emerald-50 text-emerald-600",
  flat: "bg-slate-100 text-slate-500",
};

const MovementRow = ({ row, delay }) => {
  const config = MOVEMENT_TONE[row.type] ?? MOVEMENT_TONE.adjustment;
  const Icon = config.icon;

  // Ko'rsatiladigan miqdor: jami o'zgarmagan bo'lsa (sindi/ta'mirlandi),
  // yaroqsizlar o'zgarishi ma'noli raqam bo'ladi
  const delta = row.quantityDelta !== 0 ? row.quantityDelta : row.brokenDelta;

  return (
    <li
      className={cn("flex items-center gap-2.5 rounded-xl px-2 py-1.5", T.row, MOTION.enterX)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASS[config.tone],
        )}
      >
        <Icon className="size-3" strokeWidth={2.4} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-slate-900">
          {row.itemName}
          <span className="ml-1.5 font-normal text-slate-400">{row.typeLabel}</span>
        </p>
        <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
          {row.locationName}
          {row.reasonLabel && ` · ${row.reasonLabel}`}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-[12px] font-semibold tabular-nums",
            delta > 0 ? "text-teal-600" : delta < 0 ? "text-rose-600" : "text-slate-500",
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta} {row.unit}
        </p>
        <p className="mt-0.5 text-[9.5px] font-medium text-slate-400">
          {formatDateTimeUz(row.occurredAt)}
        </p>
      </div>
    </li>
  );
};
