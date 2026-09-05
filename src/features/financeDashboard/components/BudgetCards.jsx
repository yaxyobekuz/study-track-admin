// Icons
import { AlertTriangle, CheckCircle2, SlidersHorizontal } from "lucide-react";

// Components
import DashboardCard from "./DashboardCard";
import MiniTable, { MiniTd, MiniTr } from "./MiniTable";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";

// Data
import { compactMoney } from "../data/financeDashboard.data";

/**
 * Limit holatining rangi.
 *
 * Kalitlar server bilan bir xil (`expenseBudget.service.js` → `statusOf`):
 * chegara biznes qarori va u BITTA joyda — serverda — turadi.
 */
const STATUS_TONE = {
  ok: { bar: "bg-green-500", text: "text-green-600", chip: "bg-green-50 text-green-700" },
  warning: { bar: "bg-amber-500", text: "text-amber-600", chip: "bg-amber-50 text-amber-700" },
  over: { bar: "bg-red-500", text: "text-red-600", chip: "bg-red-50 text-red-600" },
  none: { bar: "bg-gray-300", text: "text-gray-400", chip: "bg-gray-50 text-gray-400" },
};

const STATUS_LABEL = {
  ok: "Limitda",
  warning: "Chegarada",
  over: "Oshdi",
  none: "Limit yo'q",
};

/**
 * XARAJAT LIMITLARI — kategoriya bo'yicha "qancha ruxsat berilgan / qancha
 * ishlatilgan / qancha qoldi".
 *
 * ⚠️ Limit HECH NARSANI TO'SMAYDI (server bir xil izohga ega): undan oshgan
 * xarajat baribir yoziladi va shunchaki qizil bo'lib turadi. Karta —
 * ogohlantirish, to'siq emas.
 *
 * Limiti qo'yilmagan kategoriya ham ro'yxatda qoladi ("Limit yo'q"): aks
 * holda rahbar qaysi kategoriyani rejalashtirmaganini ko'ra olmasdi.
 */
export const ExpenseBudgetCard = ({ data, isLoading, isError, action, className }) => {
  const budget = data?.expenseBudget;
  const items = budget?.items ?? [];
  const totals = budget?.totals;

  const hasAnyLimit = (totals?.withLimit ?? 0) > 0;
  const totalTone = STATUS_TONE[totals?.status ?? "none"];

  return (
    <DashboardCard
      title="Xarajat limitlari"
      hint={
        hasAnyLimit
          ? "Kategoriya bo'yicha oylik shift · limit to'smaydi, faqat ogohlantiradi"
          : "Limit belgilanmagan — kategoriyalarga oylik shift qo'ying"
      }
      action={action}
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Xarajat kategoriyasi yo'q"
      className={className}
      footer={
        totals && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 text-xs">
              {totals.overCount > 0 ? (
                <>
                  <AlertTriangle className="size-4 shrink-0 text-red-500" />
                  <span className="font-medium text-red-600">
                    {totals.overCount} ta kategoriya limitdan oshdi
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                  <span className="font-medium text-green-600">
                    Barcha kategoriya limit ichida
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-400">
                Limit{" "}
                <span className="font-semibold text-gray-700">
                  {formatMoney(totals.limit, { withLabel: false })}
                </span>
              </span>
              <span className="text-gray-400">
                Sarflandi{" "}
                <span className="font-semibold text-gray-900">
                  {formatMoney(totals.spent, { withLabel: false })}
                </span>
              </span>
              {totals.rate != null && (
                <span className={cn("font-bold", totalTone.text)}>{totals.rate}%</span>
              )}
            </div>
          </div>
        )
      }
    >
      <div className="space-y-3">
        {items.map((row) => {
          const tone = STATUS_TONE[row.status] ?? STATUS_TONE.none;
          // Chiziq 100% dan oshmaydi — oshgani rang va foiz bilan aytiladi.
          // Aks holda ustun kartadan chiqib ketardi.
          const width = row.rate == null ? 0 : Math.min(row.rate, 100);

          return (
            <div key={row.categoryId}>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-xs font-medium text-gray-700">
                  {row.name}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-gray-500">
                  {formatMoney(row.spent, { withLabel: false })}
                  {row.limit != null && (
                    <span className="text-gray-300">
                      {" / "}
                      {formatMoney(row.limit, { withLabel: false })}
                    </span>
                  )}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn("h-full rounded-full transition-[width]", tone.bar)}
                    style={{ width: `${width}%` }}
                  />
                </div>

                <span
                  className={cn(
                    "w-14 shrink-0 text-right text-[11px] font-semibold tabular-nums",
                    tone.text,
                  )}
                >
                  {row.rate == null ? "—" : `${row.rate}%`}
                </span>
              </div>

              {/* Qoldiq faqat limiti bor qatorda: "yana qancha sarflash
                  mumkin" degan javob rahbarga har kuni kerak */}
              {row.remaining != null && (
                <p
                  className={cn(
                    "mt-0.5 text-[10px]",
                    Number(row.remaining) < 0 ? "text-red-500" : "text-gray-400",
                  )}
                >
                  {Number(row.remaining) < 0
                    ? `${formatMoney(String(Math.abs(Number(row.remaining))), { withLabel: false })} oshdi`
                    : `${formatMoney(row.remaining, { withLabel: false })} qoldi`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

/**
 * NARX INTIZOMI — yo'nalish bo'yicha o'rtacha chek va tarif narxi.
 *
 * "Maktab tarifi 3 500 000, lekin o'rtacha chek 3 470 368" — farq chegirma
 * va kirish proratsiyasining jami ta'siri. U kattalashsa, narx siyosati
 * amalda buzilyapti degani.
 *
 * ⚠️ "Tavsiya etilgan chek" alohida sozlama EMAS — u hisob-fakturaga
 * muhrlangan to'liq tarif narxi. Qo'lda kiritiladigan bo'lsa, tarif narxi
 * o'zgarganda kimdir uni yangilashni unutardi.
 */
export const PricingCard = ({ data, isLoading, isError, className }) => {
  const pricing = data?.pricing;
  const items = pricing?.items ?? [];
  const totals = pricing?.totals;

  return (
    <DashboardCard
      title="Narx intizomi"
      hint="O'rtacha chek va tarif narxi — farq chegirma bilan proratsiyadan · summalar so'mda"
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu oyda hisob-faktura yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
      footer={
        totals && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-4">
            <Stat
              label="Yig'ilishi kerak"
              value={formatMoney(totals.required, { withLabel: false })}
              hint={`${totals.studentCount} ta o'quvchi`}
            />
            <Stat
              label="To'liq tarif bo'yicha"
              value={formatMoney(totals.recommended, { withLabel: false })}
              hint="Chegirmasiz"
            />
            <Stat
              label="Farq"
              value={formatMoney(totals.diff, { withLabel: false })}
              hint="Chegirma + proratsiya"
              valueClassName={Number(totals.diff) < 0 ? "text-red-600" : "text-gray-900"}
            />
            <Stat
              label="Yig'ildi"
              value={formatMoney(totals.collected, { withLabel: false })}
              hint={totals.collectionRate != null ? `${totals.collectionRate}%` : "—"}
              valueClassName="text-green-700"
            />
          </div>
        )
      }
    >
      <MiniTable
        columns={[
          { label: "Yo'nalish" },
          { label: "O'quvchi", align: "right" },
          { label: "O'rtacha chek", align: "right" },
          { label: "Tarif narxi", align: "right" },
          { label: "Farq", align: "right" },
        ]}
      >
        {items.map((row) => {
          const gap = Number(row.gap);

          return (
            <MiniTr key={row.key}>
              <MiniTd className="font-medium text-gray-700">{row.label}</MiniTd>
              <MiniTd align="right" className="text-gray-400">
                {row.studentCount}
              </MiniTd>
              <MiniTd align="right" className="font-semibold text-gray-900">
                {formatMoney(row.averageCheck, { withLabel: false })}
              </MiniTd>
              <MiniTd align="right" className="text-gray-500">
                {formatMoney(row.recommendedCheck, { withLabel: false })}
              </MiniTd>
              <MiniTd align="right">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                    gap < 0
                      ? "bg-red-50 text-red-600"
                      : gap > 0
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-400",
                  )}
                >
                  {gap > 0 ? "+" : ""}
                  {compactMoney(gap)}
                  {row.gapRate != null && row.gapRate !== 0 && (
                    <span className="opacity-60">
                      ({row.gapRate > 0 ? "+" : ""}
                      {row.gapRate}%)
                    </span>
                  )}
                </span>
              </MiniTd>
            </MiniTr>
          );
        })}
      </MiniTable>
    </DashboardCard>
  );
};

/** Karta ostidagi kichik raqam. */
const Stat = ({ label, value, hint, valueClassName = "text-gray-900" }) => (
  <div className="min-w-0">
    <p className="truncate text-[11px] text-gray-400">{label}</p>
    <p className={cn("truncate text-xs font-semibold tabular-nums", valueClassName)}>
      {value}
    </p>
    {hint && <p className="truncate text-[10px] text-gray-300">{hint}</p>}
  </div>
);

/** Limit tahrirlash tugmasi — kartalar sarlavhasida turadi. */
export const BudgetEditButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
  >
    <SlidersHorizontal className="size-3.5" />
    Limitlarni sozlash
  </button>
);

export { STATUS_LABEL, STATUS_TONE };

/** Yig'ish rejasi holatining rangi — server `statusOf` bilan bir xil kalitlar. */
const PLAN_TONE = {
  reached: { bar: "bg-green-500", text: "text-green-600" },
  close: { bar: "bg-amber-500", text: "text-amber-600" },
  behind: { bar: "bg-red-500", text: "text-red-600" },
  none: { bar: "bg-gray-300", text: "text-gray-400" },
};

/**
 * BO'LIMLAR BO'YICHA YIG'ISH REJASI — mas'ul xodim × kirim turi.
 *
 * "Jasur, Undiruv bo'yicha 24 960 000 yig'ishi kerak edi; 19 570 000
 * yig'ildi, 5 390 000 qoldi."
 *
 * ⚠️ XARAJAT LIMITINING TESKARISI: u yerda rejadan oshish yomon, bu yerda
 * yaxshi. Shuning uchun rang mantig'i ham teskari va `planTone` qayta
 * ishlatilmaydi.
 *
 * Rejasiz kelgan pul ham ro'yxatda qoladi ("Reja yo'q"): u jim yo'qolsa,
 * qatorlar yig'indisi "Tashqi kirimlar" summasidan kam chiqib qolardi.
 */
export const IncomePlanCard = ({ data, isLoading, isError, action, className }) => {
  const plan = data?.incomePlan;
  const items = plan?.items ?? [];
  const totals = plan?.totals;

  return (
    <DashboardCard
      title="Bo'limlar bo'yicha yig'im"
      hint={
        totals?.planCount
          ? "Mas'ul xodim va kirim turi kesimida reja · summalar so'mda"
          : "Reja belgilanmagan — mas'ullarga oylik yig'im rejasini qo'ying"
      }
      action={action}
      isLoading={isLoading}
      isError={isError}
      isEmpty={items.length === 0}
      emptyText="Bu oyda tashqi kirim ham, reja ham yo'q"
      bodyClassName="overflow-x-auto"
      className={className}
      footer={
        totals && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs">
            <span className="text-gray-400">
              {totals.behindCount > 0 ? (
                <span className="font-medium text-red-600">
                  {totals.behindCount} ta yo'nalish rejadan orqada
                </span>
              ) : (
                <span className="font-medium text-green-600">
                  Rejadan orqada qolgan yo'nalish yo'q
                </span>
              )}
              {totals.unplannedCount > 0 && (
                <span className="ml-2 text-gray-400">
                  · {totals.unplannedCount} ta rejasiz
                </span>
              )}
            </span>

            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Reja{" "}
                <span className="font-semibold text-gray-700">
                  {formatMoney(totals.target, { withLabel: false })}
                </span>
              </span>
              <span className="text-gray-400">
                Yig'ildi{" "}
                <span className="font-semibold text-gray-900">
                  {formatMoney(totals.collected, { withLabel: false })}
                </span>
              </span>
              {totals.rate != null && (
                <span
                  className={cn("font-bold", (PLAN_TONE[totals.status] ?? PLAN_TONE.none).text)}
                >
                  {totals.rate}%
                </span>
              )}
            </div>
          </div>
        )
      }
    >
      <MiniTable
        columns={[
          { label: "Mas'ul shaxs" },
          { label: "Kirim turi" },
          { label: "O'quvchi", align: "right" },
          { label: "Reja", align: "right" },
          { label: "Yig'ildi", align: "right" },
          { label: "Qoldiq", align: "right" },
          { label: "Bajarilishi", align: "right" },
        ]}
      >
        {items.map((row) => {
          const tone = PLAN_TONE[row.status] ?? PLAN_TONE.none;

          return (
            <MiniTr key={row.key}>
              <MiniTd className="font-medium text-gray-700">
                {row.responsibleName}
                {row.isStaffArchived && row.responsibleId && (
                  <span className="ml-1.5 text-[10px] text-gray-400">(arxivlangan)</span>
                )}
              </MiniTd>

              <MiniTd className="text-gray-500">{row.categoryName}</MiniTd>

              <MiniTd align="right" className="text-gray-400">
                {row.studentCount || "—"}
              </MiniTd>

              <MiniTd align="right" className="text-gray-400">
                {row.target == null ? (
                  <span className="text-gray-300">Reja yo'q</span>
                ) : (
                  formatMoney(row.target, { withLabel: false })
                )}
              </MiniTd>

              <MiniTd align="right" className="font-semibold text-gray-900">
                {formatMoney(row.collected, { withLabel: false })}
              </MiniTd>

              <MiniTd align="right">
                {row.remaining == null ? (
                  <span className="text-gray-300">—</span>
                ) : (
                  <span
                    className={
                      Number(row.remaining) > 0 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {Number(row.remaining) <= 0 ? "+" : ""}
                    {formatMoney(
                      String(Math.abs(Number(row.remaining))),
                      { withLabel: false },
                    )}
                  </span>
                )}
              </MiniTd>

              <MiniTd align="right">
                {row.rate == null ? (
                  <span className="text-gray-300">—</span>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-2 w-16 overflow-hidden rounded-full bg-gray-100 sm:block">
                      <div
                        className={cn("h-full rounded-full", tone.bar)}
                        style={{ width: `${Math.min(Math.max(row.rate, 0), 100)}%` }}
                      />
                    </div>
                    <span className={cn("font-semibold tabular-nums", tone.text)}>
                      {row.rate}%
                    </span>
                  </div>
                )}
              </MiniTd>
            </MiniTr>
          );
        })}
      </MiniTable>
    </DashboardCard>
  );
};

/** Yig'ish rejasini tahrirlash tugmasi. */
export const IncomePlanEditButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
  >
    <SlidersHorizontal className="size-3.5" />
    Rejani sozlash
  </button>
);
