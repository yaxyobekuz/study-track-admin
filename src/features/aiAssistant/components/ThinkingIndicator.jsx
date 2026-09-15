// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { MOTION } from "../data/assistant.tokens";

/**
 * Birinchi matn kelguncha — "nima bo'lyapti" yozuvi.
 *
 * ⚠️ SAKRAYDIGAN UCH NUQTA EMAS: bitta nafas oluvchi nuqta va aniq bosqich
 * nomi ("Tahlil qilinmoqda", "Moliya ko'rsatkichlari o'qilmoqda"). Nuqtalar
 * faqat "kuting" deydi, yozuv esa nimani kutayotganini aytadi.
 */
const ThinkingIndicator = ({ label }) => (
  <div role="status" className="flex items-center gap-2.5 py-1">
    <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full bg-slate-400", MOTION.breathe)} />
    <span className="text-[13px] font-medium text-slate-500">{label}</span>
  </div>
);

export default ThinkingIndicator;
