// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { CHIP } from "../data/assistant.tokens";

/**
 * Holat/xavf belgisi. Matn doim yoziladi — rang yolg'iz ma'no tashimaydi.
 * @param {{ tone?: keyof CHIP.tone, className?: string, children: React.ReactNode }} props
 */
const Chip = ({ tone = "slate", className, children }) => (
  <span className={cn(CHIP.base, CHIP.tone[tone] ?? CHIP.tone.slate, className)}>{children}</span>
);

export default Chip;
