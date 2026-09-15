// Components
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/shadcn/tooltip";

/**
 * Ixcham maslahat — ikonka tugmalari uchun.
 *
 * ⚠️ UMUMIY `ui/tooltip` DAN KICHIKROQ va to'q. U katta, oq, qalin chegarali
 * ko'rinishda — matnli hujjat uchun mos, lekin suhbat asboblar panelida
 * har ikonka ustida "kartochka" ochilib ketardi.
 *
 * ⚠️ O'CHIRILGAN TUGMA `span` ICHIGA OLINADI: `disabled` tugma sichqoncha
 * hodisalarini chiqarmaydi va maslahat (masalan "nega yuborib bo'lmaydi")
 * aynan kerak paytda ko'rinmay qolardi.
 */
const HintTooltip = ({ content, side = "top", disabled = false, children }) => {
  if (!content) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {disabled ? <span className="inline-flex shrink-0">{children}</span> : children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={6}
        className="max-w-[240px] rounded-md border-0 bg-slate-900 px-2 py-1 text-[11.5px] font-medium leading-snug text-white shadow-[0_4px_12px_-4px_rgba(15,23,42,0.35)]"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default HintTooltip;
