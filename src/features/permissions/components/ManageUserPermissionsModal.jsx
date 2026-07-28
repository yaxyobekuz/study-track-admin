// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronDown } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks & data
import { useUpdateUserPermissions } from "@/features/permissions/queries/permissions.mutations";
import {
  PERMISSION_KEYS,
  KEYS_BY_SECTION,
  SECTIONS_BY_GROUP,
  expandLegacyKeys,
  normalizePermissions,
} from "@/features/permissions/data/permissions.data";

const ManageUserPermissionsModal = () => (
  <ResponsiveModal
    name="manageUserPermissions"
    title="Ruxsatlarni boshqarish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const { mutate: updatePermissions } = useUpdateUserPermissions();

  // Eski bo'lim kalitlari amallarga yoyiladi, katalogda yo'qlari tashlanadi
  const [selected, setSelected] = useState(
    () =>
      new Set(
        expandLegacyKeys(user.permissions || []).filter((k) =>
          PERMISSION_KEYS.includes(k),
        ),
      ),
  );

  // Ochib-yopilgan bo'limlar
  const [expanded, setExpanded] = useState(() => new Set());

  const toggleExpanded = (section) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(section) ? next.delete(section) : next.add(section);
      return next;
    });
  };

  /**
   * Bitta amalni yoqadi/o'chiradi.
   * - Istalgan amal yoqilsa `<bo'lim>.view` avtomatik qo'shiladi
   * - `view` o'chirilsa o'sha bo'limning barcha amallari o'chadi
   */
  const toggleAction = (section, key) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        if (key === `${section}.view`) {
          KEYS_BY_SECTION[section].forEach((k) => next.delete(k));
        } else {
          next.delete(key);
        }
      } else {
        next.add(key);
        next.add(`${section}.view`);
      }

      return next;
    });
  };

  const toggleSection = (section, allOn) => {
    setSelected((prev) => {
      const next = new Set(prev);
      KEYS_BY_SECTION[section].forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const toggleGroup = (sections, allOn) => {
    setSelected((prev) => {
      const next = new Set(prev);
      sections.forEach((s) =>
        KEYS_BY_SECTION[s.key].forEach((k) => (allOn ? next.delete(k) : next.add(k))),
      );
      return next;
    });
  };

  const toggleAll = (allOn) =>
    setSelected(allOn ? new Set() : new Set(PERMISSION_KEYS));

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updatePermissions(
      { id: user.id, permissions: normalizePermissions([...selected]) },
      {
        onSuccess: () => {
          close();
          toast.success("Ruxsatlar yangilandi");
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  const allSelected = selected.size === PERMISSION_KEYS.length;

  // Nechta bo'limda hech bo'lmasa bitta amal tanlangan
  const sectionCount = useMemo(
    () =>
      Object.keys(KEYS_BY_SECTION).filter((s) =>
        KEYS_BY_SECTION[s].some((k) => selected.has(k)),
      ).length,
    [selected],
  );

  return (
    <form onSubmit={handleSave}>
      {/* Foydalanuvchi + hammasini tanlash */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-1 border-b">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">
            {user.fullName || user.firstName}
          </p>
          <p className="text-xs text-gray-500">
            {sectionCount} ta bo'lim · {selected.size} ta amal
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleAll(allSelected)}
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {allSelected ? "Hammasini olib tashlash" : "Hammasini tanlash"}
        </button>
      </div>

      {/* Guruh → bo'lim → amallar */}
      <div className="max-h-[52vh] space-y-4 overflow-y-auto py-3 hidden-scrollbar">
        {Object.entries(SECTIONS_BY_GROUP).map(([group, sections]) => {
          const groupAllOn = sections.every((s) =>
            KEYS_BY_SECTION[s.key].every((k) => selected.has(k)),
          );

          return (
            <div key={group}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {group}
                </p>
                <button
                  type="button"
                  onClick={() => toggleGroup(sections, groupAllOn)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {groupAllOn ? "Tozalash" : "Barchasi"}
                </button>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {sections.map((section) => {
                  const keys = KEYS_BY_SECTION[section.key];
                  const chosen = keys.filter((k) => selected.has(k)).length;
                  const sectionAllOn = chosen === keys.length;
                  const isOpen = expanded.has(section.key);

                  return (
                    <div key={section.key}>
                      {/* Bo'lim qatori */}
                      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(section.key)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <ChevronDown
                            className={`size-4 shrink-0 text-gray-400 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            strokeWidth={1.5}
                          />
                          <span className="truncate text-sm text-gray-700">
                            {section.label}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                              chosen > 0
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {chosen}/{keys.length}
                          </span>
                        </button>

                        <Switch
                          checked={sectionAllOn}
                          onChange={() => toggleSection(section.key, sectionAllOn)}
                        />
                      </div>

                      {/* Amallar */}
                      {isOpen && (
                        <div className="space-y-0.5 border-t border-gray-100 bg-gray-50/60 px-3.5 py-2">
                          {section.actions.map((action) => {
                            const key = `${section.key}.${action.key}`;

                            return (
                              <label
                                key={key}
                                className="flex cursor-pointer items-center justify-between gap-3 py-1.5 pl-6"
                              >
                                <span className="text-[13px] text-gray-600">
                                  {action.label}
                                </span>
                                <Switch
                                  checked={selected.has(key)}
                                  onChange={() => toggleAction(section.key, key)}
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-4 border-t pt-4 xs:m-0 xs:flex-row xs:justify-end xs:pt-4">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus className="w-full xs:w-32" disabled={isLoading}>
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default ManageUserPermissionsModal;
