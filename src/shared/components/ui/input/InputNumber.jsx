// Utils
import { cn } from "@/shared/utils/cn";

// React mask
import { IMaskInput } from "react-imask";

// Components
import { inputBaseClasses } from "./Input";

/**
 * Raqamli input — kiritilayotgan sonni ming ajratgichli (bo'sh joy) qilib
 * KO'RSATADI ("5 000 000"), lekin form'ga XOM son satrini ("5000000") beradi.
 *
 * `InputTel` bilan bir xil naqsh: IMask, `{ target: { name, value } }` shaklidagi
 * event orqali mavjud `onChange={(e)=>setField(x, e.target.value)}` ishlaydi.
 *
 * @param {{ scale?: number, value?: string|number, onChange?: function, name?: string }} props
 *   scale — kasr xonalar soni (pul uchun 2, butun son uchun 0)
 */
const InputNumber = ({ className = "", onChange, name, value, scale = 2, ...props }) => {
  const handleAccept = (unmasked) => {
    onChange?.({ target: { name, value: unmasked } });
  };

  return (
    <IMaskInput
      {...props}
      type="text"
      inputMode={scale > 0 ? "decimal" : "numeric"}
      name={name}
      value={value == null ? "" : String(value)}
      mask={Number}
      unmask
      thousandsSeparator=" "
      radix="."
      mapToRadix={[","]}
      scale={scale}
      min={0}
      onAccept={handleAccept}
      className={cn(inputBaseClasses, className)}
    />
  );
};

export default InputNumber;
