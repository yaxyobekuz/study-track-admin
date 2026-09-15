// React
import { forwardRef } from "react";

// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Button from "@/shared/components/ui/button/Button";
import HintTooltip from "./HintTooltip";
import Spinner from "./Spinner";

// Tokens
import { BUTTON } from "../data/assistant.tokens";

/**
 * Faqat ikonkali tugma — `aria-label` VA maslahat majburiy.
 *
 * ⚠️ `label` bitta prop ikki joyga ketadi (ekran o'qigich va maslahat):
 * alohida yozilganda ular vaqt o'tib bir-biridan farq qilib qolardi.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {React.ComponentType} props.icon
 * @param {"primary"|"secondary"|"ghost"|"danger"} [props.tone="ghost"]
 * @param {"default"|"compact"} [props.size="default"]
 * @param {string} [props.tooltip] - `label` dan farqli maslahat (masalan o'chirilganlik sababi)
 * @param {boolean} [props.loading] - ikonka o'rnida spinner. ⚠️ Tugmani O'CHIRMAYDI:
 *   uzoq tayyorlanadigan ish (ovozda o'qish) aynan shu tugma bilan bekor qilinadi.
 */
const IconButton = forwardRef(
  (
    {
      label,
      icon: Icon,
      tone = "ghost",
      size = "default",
      tooltip,
      tooltipSide = "top",
      loading = false,
      disabled,
      className,
      ...props
    },
    ref,
  ) => (
    <HintTooltip content={tooltip ?? label} side={tooltipSide} disabled={disabled}>
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        playClickSound={false}
        aria-label={label}
        disabled={disabled}
        aria-busy={loading || undefined}
        className={cn(BUTTON.base, BUTTON.icon[size], BUTTON.tone[tone], className)}
        {...props}
      >
        {loading ? <Spinner /> : <Icon strokeWidth={1.75} aria-hidden="true" />}
      </Button>
    </HintTooltip>
  ),
);

IconButton.displayName = "IconButton";

export default IconButton;
