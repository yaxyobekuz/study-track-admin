// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";

/**
 * QAYTMAS AMAL UCHUN — TUGMA YONIDA TASDIQ.
 *
 * `window.confirm` brauzerning o'z oynasini ochadi: u sahifadan tashqarida,
 * uslublanmaydi va ekranning o'rtasida paydo bo'ladi — ya'ni bosilgan
 * tugmadan uzoqda. Bu panel esa AYNAN tugmaning ostida ochiladi, shuning
 * uchun "men nimani tasdiqlayapman?" degan savol tug'ilmaydi.
 *
 * ⚠️ Tasdiq tugmasi bosilganda avval popover YOPILADI, keyin amal
 * chaqiriladi: aks holda ro'yxat qayta chizilganda ochiq popover o'z
 * langarini yo'qotib, ekranning burchagida osilib qolardi.
 *
 * ⚠️ Maslahat (`tooltip`) TASHQARIDAN o'ralmaydi — u shu yerda, ayni
 * `PopoverTrigger` ning USTIGA qo'yiladi. Ikki primitiv bitta tugmani
 * ulashganda proplar faqat shu tartibda to'liq yetib boradi:
 * Tooltip.Trigger → Popover.Trigger → tugma.
 */
const ConfirmPopover = ({
  children,
  title,
  tooltip = "",
  description = "",
  confirmLabel = "Ha",
  danger = false,
  onConfirm,
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm?.();
  };

  const trigger = <PopoverTrigger asChild>{children}</PopoverTrigger>;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger}

      <PopoverContent align="end" className="w-72 rounded-2xl p-3.5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>

        {description && (
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        )}

        <div className="mt-3.5 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            playClickSound={false}
            onClick={() => setOpen(false)}
            className="h-8 gap-1.5 rounded-lg px-3 text-gray-600"
          >
            Bekor qilish
          </Button>

          <Button
            size="sm"
            variant={danger ? "danger" : "default"}
            onClick={handleConfirm}
            className="h-8 gap-1.5 rounded-lg px-3"
          >
            {confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConfirmPopover;
