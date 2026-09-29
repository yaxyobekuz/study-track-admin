// Components
import InputField from "@/shared/components/ui/input/InputField";

// Data
import { CLASS_CHANGE_REASON_MAX } from "../data/classChanges.data";

/**
 * SINFDAN CHIQARISH / KO'CHIRISH SABABI — majburiy maydon.
 *
 * Uch joyda bir xil: o'quvchi profilidagi "Sinflar" oynasi, sinf
 * sahifasidagi "Ko'chirish" va "Sinfdan chiqarish" oynalari. Sabab
 * "Sinf o'zgarishlari" registrida ko'rinadi va keyin o'zgartirilmaydi —
 * foydalanuvchi buni yozishdan OLDIN bilishi kerak.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 */
const ClassChangeReasonField = ({
  value,
  onChange,
  placeholder = "Masalan: ota-onasining iltimosi bilan",
}) => (
  <InputField
    required
    type="textarea"
    name="classChangeReason"
    label="Sabab"
    placeholder={placeholder}
    value={value}
    maxLength={CLASS_CHANGE_REASON_MAX}
    inputClassName="min-h-24"
    description={`Sabab "Sinf o'zgarishlari" tarixida saqlanadi va keyin o'zgartirilmaydi · ${value.length}/${CLASS_CHANGE_REASON_MAX}`}
    onChange={(e) => onChange(e.target.value)}
  />
);

export default ClassChangeReasonField;
