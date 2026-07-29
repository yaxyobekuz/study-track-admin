// React
import { useMemo } from "react";

// Icons
import { Check, ShieldCheck } from "lucide-react";

// Components
import Switch from "@/shared/components/ui/switch/Switch";

// Utils & data
import { cn } from "@/shared/utils/cn";
import { sectionIcon } from "@/features/permissions/data/permissionIcons.data";
import {
  PERMISSION_KEYS,
  KEYS_BY_SECTION,
  SECTIONS_BY_GROUP,
  normalizePermissions,
} from "@/features/permissions/data/permissions.data";

/**
 * Ruxsatlar matritsasi: guruh → bo'lim → amal. Foydalanuvchining o'z ruxsatlari
 * ham, rolning boshlang'ich ruxsatlari ham shu bilan tahrirlanadi.
 *
 * Panel ichiga to'g'ridan-to'g'ri joylanadi — yuqoridagi hisob qatori kartaning
 * chetigacha cho'ziladi, shuning uchun tashqi padding bermang.
 *
 * @param {object} props
 * @param {Set<string>} props.value - Tanlangan ruxsat kalitlari
 * @param {(next: Set<string>) => void} props.onChange - Yangi to'plam
 * @param {string} [props.className]
 */
const PermissionsMatrix = ({ value, onChange, className = "" }) => {
  /**
   * O'zgartirilgan to'plamni normallashtirib qaytaradi — shunda ekranda
   * ko'rinayotgan narsa saqlanadigan narsaning aynan o'zi bo'ladi.
   */
  const apply = (updater) => {
    const next = new Set(value);
    updater(next);
    onChange(new Set(normalizePermissions([...next])));
  };

  /**
   * Bitta amalni yoqadi/o'chiradi.
   * - Istalgan amal yoqilsa `<bo'lim>.view` avtomatik qo'shiladi
   * - `view` o'chirilsa o'sha bo'limning barcha amallari o'chadi
   */
  const toggleAction = (section, key) =>
    apply((next) => {
      if (!next.has(key)) return next.add(key);

      if (key === `${section}.view`) {
        KEYS_BY_SECTION[section].forEach((k) => next.delete(k));
      } else {
        next.delete(key);
      }
    });

  const toggleSection = (section, allOn) =>
    apply((next) =>
      KEYS_BY_SECTION[section].forEach((k) => (allOn ? next.delete(k) : next.add(k))),
    );

  const toggleGroup = (sections, allOn) =>
    apply((next) =>
      sections.forEach((s) =>
        KEYS_BY_SECTION[s.key].forEach((k) => (allOn ? next.delete(k) : next.add(k))),
      ),
    );

  const toggleAll = (allOn) => onChange(allOn ? new Set() : new Set(PERMISSION_KEYS));

  // Nechta bo'limda hech bo'lmasa bitta amal tanlangan
  const sectionCount = useMemo(
    () =>
      Object.values(KEYS_BY_SECTION).filter((keys) => keys.some((k) => value.has(k)))
        .length,
    [value],
  );

  const allSelected = value.size === PERMISSION_KEYS.length;

  return (
    <div className={className}>
      {/* Umumiy hisob + hammasini tanlash */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 xs:px-5">
        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <ShieldCheck className="size-4 text-gray-400" strokeWidth={1.5} />
          {sectionCount} ta bo'lim · {value.size} ta amal
        </p>

        <button
          type="button"
          onClick={() => toggleAll(allSelected)}
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {allSelected ? "Hammasini olib tashlash" : "Hammasini tanlash"}
        </button>
      </div>

      {/* Guruh → bo'lim → amallar */}
      <div className="space-y-5 p-4 xs:p-5">
        {Object.entries(SECTIONS_BY_GROUP).map(([group, sections]) => {
          const groupKeys = sections.flatMap((s) => KEYS_BY_SECTION[s.key]);
          const groupChosen = groupKeys.filter((k) => value.has(k)).length;
          const groupAllOn = groupChosen === groupKeys.length;

          return (
            <div key={group}>
              {/* Guruh sarlavhasi */}
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900">{group}</h3>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    {groupChosen}/{groupKeys.length} ta amal
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleGroup(sections, groupAllOn)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {groupAllOn ? "Tozalash" : "Barchasi"}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {sections.map((section) => {
                  const Icon = sectionIcon(section.key);
                  const keys = KEYS_BY_SECTION[section.key];
                  const chosen = keys.filter((k) => value.has(k)).length;
                  const sectionAllOn = chosen === keys.length;

                  return (
                    <div
                      key={section.key}
                      className="flex flex-wrap items-center gap-x-3 gap-y-2.5 px-3.5 py-3 sm:grid sm:grid-cols-[minmax(0,210px)_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                    >
                      {/* Bo'lim */}
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
                        <Icon
                          strokeWidth={1.5}
                          className={cn(
                            "size-4 shrink-0",
                            chosen > 0 ? "text-blue-600" : "text-gray-300",
                          )}
                        />
                        <span
                          className={cn(
                            "truncate text-sm",
                            chosen > 0 ? "text-gray-900" : "text-gray-400",
                          )}
                        >
                          {section.label}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                            chosen > 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-400",
                          )}
                        >
                          {chosen}/{keys.length}
                        </span>
                      </div>

                      {/* Bo'limni to'liq yoqish / o'chirish */}
                      <div className="shrink-0 sm:col-start-3 sm:row-start-1 sm:flex sm:items-center sm:self-stretch sm:border-l sm:border-gray-100 sm:pl-4">
                        <Switch
                          checked={sectionAllOn}
                          onChange={() => toggleSection(section.key, sectionAllOn)}
                        />
                      </div>

                      {/* Amallar */}
                      <div className="grid w-full grid-cols-4 items-center gap-x-4 gap-y-2 sm:col-start-2 sm:row-start-1">
                        {section.actions.map((action) => {
                          const key = `${section.key}.${action.key}`;
                          const isOn = value.has(key);

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => toggleAction(section.key, key)}
                              className={cn(
                                "flex min-w-0 items-center gap-1.5 text-left text-[13px] transition-colors",
                                isOn
                                  ? "text-gray-700"
                                  : "text-gray-400 hover:text-gray-600",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                                  isOn
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-gray-300",
                                )}
                              >
                                {isOn && <Check className="size-3" strokeWidth={3} />}
                              </span>
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionsMatrix;
