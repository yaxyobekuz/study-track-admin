// React
import { forwardRef } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";
import Spinner from "./Spinner";

// Tokens
import { BUTTON } from "../data/assistant.tokens";

/**
 * Yordamchi ekranining matnli tugmasi.
 *
 * ⚠️ UMUMIY `Button` USTIGA, yangi tugma emas: tovush, `asChild` va
 * klaviatura xatti-harakati bir xil qoladi. Faqat o'lcham, ohang va fokus
 * halqasi shu ekran tiliga moslanadi (`BUTTON` tokenlari).
 *
 * ⚠️ `loading` — ikonka o'rnida spinner, matn joyida qoladi: tugma kengligi
 * o'zgarmaydi va yonidagi tugmalar sakramaydi.
 *
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"|"danger"} [props.tone="secondary"]
 * @param {"default"|"compact"} [props.size="default"]
 * @param {React.ComponentType} [props.icon] - lucide komponenti
 * @param {boolean} [props.loading]
 */
const AssistantButton = forwardRef(
  ({ tone = "secondary", size = "default", icon: Icon, loading = false, className, children, disabled, ...props }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      playClickSound={false}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(BUTTON.base, BUTTON.size[size], BUTTON.tone[tone], className)}
      {...props}
    >
      {loading ? <Spinner /> : Icon ? <Icon strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
    </Button>
  ),
);

AssistantButton.displayName = "AssistantButton";

export default AssistantButton;
