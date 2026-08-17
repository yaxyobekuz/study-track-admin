// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Sabab so'raladigan tasdiqlash oynasi.
 *
 * Moliyadagi qaytarib bo'lmaydigan amallar (hisob-fakturani bekor qilish,
 * to'lovni bekor qilish, o'tkazmani qaytarish) serverda MAJBURIY sabab
 * talab qiladi va u auditga yoziladi. Ilgari bu `prompt()` bilan
 * so'ralardi — u brauzerlarda bloklanadi, oqibatini ko'rsata olmaydi va
 * bo'sh matnni ham qaytarishi mumkin.
 *
 * `openModal("financeReason", { title, description, confirmLabel, warning,
 *   consequences, onConfirm })`
 *
 * `onConfirm(reason, { close, setIsLoading })` — chaqiruvchi mutatsiyani
 * o'zi bajaradi, shunda toast matni har bir amal uchun aniq bo'ladi.
 */
const ReasonModal = () => (
  <ResponsiveModal name="financeReason" title="Tasdiqlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  description = "",
  warning = "",
  consequences = [],
  label = "Sabab",
  placeholder = "Nima uchun?",
  confirmLabel = "Tasdiqlash",
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("Sabab kiritilishi shart");
      return;
    }

    onConfirm?.(trimmed, { close, setIsLoading });
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {description && <p className="text-sm text-gray-600">{description}</p>}

      {/* Amalning natijasi — foydalanuvchi bosishdan OLDIN ko'rishi kerak */}
      {consequences.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          {consequences.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {warning && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{warning}</p>
      )}

      <InputField
        required
        autoFocus
        name="reason"
        label={label}
        value={reason}
        placeholder={placeholder}
        onChange={(e) => setReason(e.target.value)}
      />

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Yopish
        </Button>

        <Button className="w-full xs:w-40" disabled={isLoading}>
          {confirmLabel}
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default ReasonModal;
