// React
import { useState } from "react";

// Icons
import { ChevronRight, Layers } from "lucide-react";

// Hooks
import useBranch from "@/shared/hooks/useBranch";

// API
import { branchSplitOf } from "@/shared/api/aggregateMeta";

// Components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * QAYSI FILIALDA QANCHA — umumiy ko'rinishdagi sanoqchining kesimi.
 *
 * Umumiy ("barcha filiallar") rejimida ekranda BITTA jami raqam turadi
 * ("461 o'quvchi"). Bu komponent o'sha raqamning yonida uning filiallar
 * bo'yicha taqsimotini ko'rsatadi va qator bosilganda O'SHA FILIALGA
 * o'tkazib, kerakli bo'limni ochadi: rahbar raqamni ko'rib, darhol amalga
 * o'tishi kerak — qaysi filial ekanini qo'lda qidirib emas.
 *
 * ⚠️ MA'LUMOT SERVERDAN KELADI, panelda hisoblanmaydi
 * (`meta.aggregate.byBranch` → `aggregateMeta.js`). Panel yig'indini
 * o'zi bo'laklasa, u serverdagi birlashtirish qoidalaridan (foiz
 * o'rtachalanadi, sozlama qo'shilmaydi) ajralib ketardi.
 *
 * ⚠️ UMUMIY REJIMDAN TASHQARIDA HECH NARSA CHIZMAYDI. Bitta filial
 * rejimida kesimning ma'nosi yo'q va karta ostida bo'sh joy qolmasligi
 * kerak — `_branch` belgisi bilan AYNI qoida.
 *
 * ⚠️ `null` qiymat NOL EMAS: o'sha filial bu raqamni umuman qaytarmagan
 * (bo'lim yo'q yoki ruxsat yopiq) — "—" bo'lib ko'rinadi.
 *
 * ⚠️ `items` — TAYYOR KESIM. Ba'zi hisobotlar umumiy birlashtiruvchidan
 * ATAYLAB chetlab o'tadi (`anchor` rejimi: foiz og'irliksiz
 * o'rtachalanmasin, reyting qayta saralansin) va kesimni SERVISNING O'ZI
 * quradi — `meta.aggregate.byBranch` u yerda umuman bo'lmaydi. Shunday
 * hollarda qatorlar shu prop bilan beriladi va komponent o'zgarmaydi:
 * ko'rinish, filialga o'tish va "almashtirilyapti" holati bitta joyda
 * qoladi. Berilsa `data` / `path` o'qilmaydi.
 *
 * @param {object} props
 * @param {object} [props.data] - so'rov qaytargan ma'lumot obyekti
 * @param {string} [props.path] - kalit yo'li ("students", "kpi.income.value")
 * @param {Array<{branch: object, value: *}>} [props.items] - tayyor kesim
 * @param {string} [props.to] - filialga o'tgandan keyin ochiladigan sahifa.
 *   ⚠️ Berilmasa SHU SAHIFANING O'ZI qayta ochiladi (URL dagi sana va
 *   filtrlar bilan) — kunlik davomat kabi ekranlarda aynan shu kerak:
 *   aniq yo'l berilsa tanlangan sana yo'qolardi.
 * @param {(value: *) => string} [props.format] - qiymat ko'rinishi
 * @param {"rows"|"chip"} [props.variant] - ichma-ich ro'yxat yoki chip+oyna
 * @param {boolean} [props.compact] - chipda faqat ikonka va filial soni
 * @param {string} [props.className]
 */
const BranchSplit = ({
  data,
  path,
  items,
  to,
  format,
  variant = "rows",
  compact = false,
  className,
}) => {
  const { isAggregate, switchBranch, isSwitching } = useBranch();
  const [open, setOpen] = useState(false);

  // ⚠️ UMUMIY REJIM SHARTI `items` DA HAM QOLADI: tayyor kesim berilgan
  // bo'lsa ham, bitta filial ichida bu ro'yxatning ma'nosi yo'q.
  const split = isAggregate ? (items ?? branchSplitOf(data, path)) : null;
  if (!split || split.length < 2) return null;

  const show = (value) => {
    if (value == null) return "—";
    if (format) return format(value);
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("uz-UZ") : String(value);
  };

  const go = (branchId) => {
    if (isSwitching) return;
    setOpen(false);
    switchBranch(branchId, { to });
  };

  const rows = (
    <ul className="space-y-0.5">
      {split.map(({ branch, value }) => (
        <li key={branch.id}>
          <button
            type="button"
            disabled={isSwitching}
            onClick={(event) => {
              // ⚠️ Karta ham bosiladigan bo'lishi mumkin (moliya KPI
              // kartalari o'z sahifasiga o'tadi) — kesim qatori o'sha
              // o'tishni qo'zg'atmasligi kerak.
              event.stopPropagation();
              go(branch.id);
            }}
            title={`${branch.name} — shu filialga o'tish`}
            // ⚠️ RANG MEROS QILIB OLINADI (`text-current`, `bg-black/5`):
            // kesim oq kartada ham, rangli davomat kartasida ham (yashil,
            // sariq, qizil fon) turadi — qat'iy kulrang yozilsa, rangli
            // kartada u begona bo'lib ko'rinardi.
            className={cn(
              "group flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors",
              "hover:bg-black/5 disabled:cursor-wait disabled:opacity-60",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-xs opacity-60">
              {branch.shortName || branch.name}
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums opacity-90">
              {show(value)}
            </span>
            <ChevronRight className="size-3 shrink-0 opacity-30 transition-opacity group-hover:opacity-70" />
          </button>
        </li>
      ))}
    </ul>
  );

  if (variant === "chip") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            title="Filiallar kesimi"
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/80 px-1.5 py-0.5",
              "text-[10px] font-semibold text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700",
              className,
            )}
          >
            <Layers className="size-3 shrink-0" strokeWidth={2} />
            {/* Zich maketlarda (ta'lim dashboardi) chip faqat ikonka va son
                bo'ladi: "filial" so'zi o'sha kartada yonidagi matnni
                qisqartirib yuborardi. */}
            {compact ? split.length : `${split.length} filial`}
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-52 p-2">
          <p className="mb-1 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Filiallar kesimi
          </p>
          {rows}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("mt-2 border-t border-black/5 pt-2", className)}>{rows}</div>
  );
};

export default BranchSplit;
