// React
import { useState } from "react";

// Icons
import { Link2, Plus, X } from "lucide-react";

// Components
import InputField from "@/shared/components/ui/input/InputField";

// Data
import { LINKS_MAX } from "../../data/tasks.data";

/** Server bilan AYNI qoida (`taskWindow.helpers.js`): faqat http(s). */
const isValidUrl = (value) => {
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

/**
 * HAVOLALAR — fayl yuklash bilan bir qatorda tashqi manbaga ishora
 * (hujjat, video dars, shakl).
 *
 * ⚠️ Faqat http(s): `javascript:` sxemasi panelda bosiladigan havola bo'lib
 * chiqardi, ya'ni saqlangan XSS yo'li. Bu yerdagi tekshiruv — faqat
 * oldindan ogohlantirish, haqiqiy to'siq SERVERDA.
 *
 * @param {{ value: Array<{url: string, label: string}>, onChange: Function, disabled?: boolean }} props
 */
const TaskLinksField = ({ value = [], onChange, disabled = false }) => {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  const trimmed = url.trim();
  const full = value.length >= LINKS_MAX;
  const duplicate = value.some((l) => l.url === trimmed);
  const canAdd = !full && trimmed.length > 0 && isValidUrl(trimmed) && !duplicate;

  const add = () => {
    if (!canAdd) return;
    onChange([...value, { url: trimmed, label: label.trim() }]);
    setUrl("");
    setLabel("");
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Havolalar <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span>
        </p>
        <span className="text-xs text-gray-400">
          {value.length}/{LINKS_MAX}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {value.map((link, index) => (
            <li
              key={link.url}
              className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2 text-sm"
            >
              <Link2 className="size-4 shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate">
                {link.label && (
                  <span className="font-medium text-gray-800">{link.label} · </span>
                )}
                <span className="text-gray-500">{link.url}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label="Havolani olib tashlash"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <InputField
            value={url}
            disabled={disabled}
            className="flex-1"
            placeholder="https://..."
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <InputField
            value={label}
            maxLength={120}
            disabled={disabled}
            className="sm:w-40"
            placeholder="Nomi (ixtiyoriy)"
            onChange={(e) => setLabel(e.target.value)}
          />
          <button
            type="button"
            onClick={add}
            disabled={!canAdd || disabled}
            className="flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-40"
          >
            <Plus className="size-4" />
            Qo'shish
          </button>
        </div>
      )}

      {trimmed.length > 0 && !isValidUrl(trimmed) && (
        <p className="mt-1 text-xs text-rose-600">
          Havola http:// yoki https:// bilan boshlanishi kerak
        </p>
      )}
      {duplicate && <p className="mt-1 text-xs text-amber-600">Bu havola allaqachon qo'shilgan</p>}
    </div>
  );
};

export default TaskLinksField;
