// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { LEAD_STAGES_FALLBACK } from "../data/leads.data";

/**
 * ZINAPOYA KO'RSATKICHI — 6 nuqta, ro'yxatdagi bitta katakka sig'adi.
 *
 * ⚠️ YASHIL FAQAT OXIRIDA: oraliq pog'onalar ko'k, oxirgisi (to'lov
 * qilgan — qabul qilingan) yashil. Rang shu qarorni bildiradi, aks holda
 * "hali to'lamagan" bola ham yashil ko'rinib, ro'yxatga ishonib bo'lmasdi.
 *
 * ⚠️ CHIQIB KETGAN lid kulrang va ustidan chizilgan: yetib borgan
 * pog'onalari KO'RINADI (ular o'tgan fakt), lekin u endi zinapoyada emas.
 */
const LeadStageBar = ({ stage = 0, isExited = false, total = LEAD_STAGES_FALLBACK.length }) => {
  const final = total;

  return (
    <div className="flex items-center gap-1" title={`${stage} / ${final} bosqich`}>
      {Array.from({ length: final }, (_, index) => {
        const step = index + 1;
        const reached = step <= stage;
        const isFinal = step === final;

        return (
          <span
            key={step}
            className={cn(
              "h-1.5 w-4 rounded-full transition-colors",
              !reached && "bg-gray-200",
              reached && !isExited && (isFinal ? "bg-green-500" : "bg-primary"),
              reached && isExited && "bg-gray-400",
            )}
          />
        );
      })}
      <span
        className={cn(
          "ml-1 text-xs font-semibold",
          isExited ? "text-gray-400 line-through" : stage === final ? "text-green-600" : "text-gray-500",
        )}
      >
        {stage}/{final}
      </span>
    </div>
  );
};

export default LeadStageBar;
