// Utils
import { cn } from "@/shared/utils/cn";

/**
 * 14px kutish belgisi. Ikonka o'rnini egallaydi — tugma kengligi sakramaydi.
 * `currentColor` bilan chiziladi: qaysi tugmada tursa, o'sha rangda.
 */
const Spinner = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-block size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-r-transparent",
      className,
    )}
  />
);

export default Spinner;
