// React
import { useEffect, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Check, ShieldCheck } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";

// Hooks
import { useUpdateUserPermissions } from "@/features/permissions/queries/permissions.mutations";

// Utils, helpers & data
import { cn } from "@/shared/utils/cn";
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { sectionIcon } from "@/features/permissions/data/permissionIcons.data";
import {
  PERMISSION_KEYS,
  KEYS_BY_SECTION,
  SECTIONS_BY_GROUP,
  expandLegacyKeys,
  normalizePermissions,
} from "@/features/permissions/data/permissions.data";

/**
 * Ruxsat kalitlaridan tahrirlanadigan holat yasaydi: eski bo'lim kalitlari
 * yoyiladi, katalogda yo'qlari tashlanadi, har bir bo'limga `.view` qo'shiladi.
 * Ya'ni holat aynan saqlanadigan ko'rinishda bo'ladi (katalog tartibida).
 */
const toDraft = (permissions = []) =>
  new Set(normalizePermissions(expandLegacyKeys(permissions)));

/**
 * Ruxsatlar sahifasining 2-paneli: tanlangan foydalanuvchining ruxsatlarini
 * guruh → bo'lim → amal ko'rinishida ko'rsatadi va shu yerda tahrirlaydi.
 * O'zgarishlar "Saqlash" bosilgunicha faqat mahalliy holatda turadi.
 *
 * @param {object} props
 * @param {object} props.user - Tanlangan xodim (ruxsatlari bilan)
 * @param {Array} props.roles - Rollar (label uchun)
 * @param {(dirty: boolean) => void} [props.onDirtyChange] - Saqlanmagan o'zgarish holati
 * @param {string} [props.className]
 */
const UserPermissionsPanel = ({
  user,
  roles = [],
  onDirtyChange,
  className = "",
}) => {
  const { mutate: updatePermissions, isPending } = useUpdateUserPermissions();

  const [selected, setSelected] = useState(() => toDraft(user.permissions));

  // Serverdagi va ekrandagi holat — solishtirish uchun (ikkalasi ham katalog tartibida)
  const savedKeys = useMemo(
    () => [...toDraft(user.permissions)].join(","),
    [user.permissions],
  );
  const draftKeys = useMemo(() => [...selected].join(","), [selected]);
  const isDirty = draftKeys !== savedKeys;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  /**
   * Holatni o'zgartiradi va darhol normallashtiradi — shunda ekranda
   * ko'rinayotgan narsa saqlanadigan narsaning aynan o'zi bo'ladi.
   */
  const applyDraft = (updater) =>
    setSelected((prev) => {
      const next = new Set(prev);
      updater(next);
      return new Set(normalizePermissions([...next]));
    });

  /**
   * Bitta amalni yoqadi/o'chiradi.
   * - Istalgan amal yoqilsa `<bo'lim>.view` avtomatik qo'shiladi
   * - `view` o'chirilsa o'sha bo'limning barcha amallari o'chadi
   */
  const toggleAction = (section, key) =>
    applyDraft((next) => {
      if (!next.has(key)) return next.add(key);

      if (key === `${section}.view`) {
        KEYS_BY_SECTION[section].forEach((k) => next.delete(k));
      } else {
        next.delete(key);
      }
    });

  const toggleSection = (section, allOn) =>
    applyDraft((next) =>
      KEYS_BY_SECTION[section].forEach((k) => (allOn ? next.delete(k) : next.add(k))),
    );

  const toggleGroup = (sections, allOn) =>
    applyDraft((next) =>
      sections.forEach((s) =>
        KEYS_BY_SECTION[s.key].forEach((k) => (allOn ? next.delete(k) : next.add(k))),
      ),
    );

  const toggleAll = (allOn) =>
    setSelected(allOn ? new Set() : new Set(PERMISSION_KEYS));

  const handleSave = () =>
    updatePermissions(
      { id: user.id, permissions: [...selected] },
      {
        onSuccess: () => toast.success("Ruxsatlar yangilandi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );

  // Nechta bo'limda hech bo'lmasa bitta amal tanlangan
  const sectionCount = useMemo(
    () =>
      Object.values(KEYS_BY_SECTION).filter((keys) =>
        keys.some((k) => selected.has(k)),
      ).length,
    [selected],
  );

  const name = user.fullName || user.firstName;
  const allSelected = selected.size === PERMISSION_KEYS.length;

  return (
    <Card className={cn("flex flex-col p-0 xs:p-0", className)}>
      {/* Foydalanuvchi + saqlash */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 xs:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold uppercase text-white">
            {name?.[0]}
          </span>

          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{name}</p>
            <p className="truncate text-sm text-gray-500">
              {user.username} · {getRoleLabel(user.role, roles)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <span className="text-xs font-medium text-amber-600">Saqlanmagan</span>
          )}

          <Button
            variant="secondary"
            disabled={!isDirty || isPending}
            onClick={() => setSelected(toDraft(user.permissions))}
          >
            Bekor qilish
          </Button>

          <Button disabled={!isDirty || isPending} onClick={handleSave}>
            Saqlash
            {isPending && "..."}
          </Button>
        </div>
      </div>

      {/* Umumiy hisob + hammasini tanlash */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 xs:px-5">
        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <ShieldCheck className="size-4 text-gray-400" strokeWidth={1.5} />
          {sectionCount} ta bo'lim · {selected.size} ta amal
        </p>

        <button
          type="button"
          onClick={() => toggleAll(allSelected)}
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {allSelected ? "Hammasini olib tashlash" : "Hammasini tanlash"}
        </button>
      </div>

      {/* Guruh → bo'lim → amallar (o'z scroll'isiz — sahifa bilan birga oqadi) */}
      <div className="space-y-5 p-4 xs:p-5">
        {Object.entries(SECTIONS_BY_GROUP).map(([group, sections]) => {
          const groupKeys = sections.flatMap((s) => KEYS_BY_SECTION[s.key]);
          const groupChosen = groupKeys.filter((k) => selected.has(k)).length;
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
                  const chosen = keys.filter((k) => selected.has(k)).length;
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
                          const isOn = selected.has(key);

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
    </Card>
  );
};

export default UserPermissionsPanel;
