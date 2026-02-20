import { useRef, useCallback } from "react";

/** Formats digits as +998 (XX) XXX-XX-XX */
const formatPhone = (digits) => {
  const d = digits.slice(0, 12);
  let result = "+";
  if (d.length > 0) result += d.slice(0, 3);
  if (d.length > 3) result += ` (${d.slice(3, 5)}`;
  if (d.length > 5) result += `) ${d.slice(5, 8)}`;
  if (d.length > 8) result += `-${d.slice(8, 10)}`;
  if (d.length > 10) result += `-${d.slice(10, 12)}`;
  return result;
};

const PhoneInput = ({ value, onChange, name = "phone", className = "", ...props }) => {
  const inputRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
      const formatted = raw.length > 0 ? formatPhone(raw) : "";
      onChange({ target: { name, value: formatted } });
    },
    [name, onChange],
  );

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const raw = (e.target.value || "").replace(/\D/g, "");
      if (raw.length > 0) {
        const newRaw = raw.slice(0, -1);
        const formatted = newRaw.length > 0 ? formatPhone(newRaw) : "";
        onChange({ target: { name, value: formatted } });
      }
    }
  }, [name, onChange]);

  return (
    <input
      ref={inputRef}
      type="tel"
      name={name}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="+998 (__) ___-__-__"
      className={className || "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"}
      {...props}
    />
  );
};

export default PhoneInput;
