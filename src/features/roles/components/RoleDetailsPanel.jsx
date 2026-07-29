// React
import { useEffect, useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Lock, Trash2, Users } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import WeeklyScheduleEditor from "@/features/users/components/WeeklyScheduleEditor";
import PermissionsMatrix from "@/features/permissions/components/PermissionsMatrix";
import { TabsButtons } from "@/shared/components/ui/tabs/Tabs";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateRole } from "@/features/roles/queries/roles.mutations";

// Utils & data
import { cn } from "@/shared/utils/cn";
import { WORK_DAYS_OPTIONS } from "@/features/attendance/data/attendance.data";
import { toPermissionSet } from "@/features/permissions/data/permissions.data";

/** Rolning tahrirlanadigan maydonlari — "Asosiy" tabidagi forma holati. */
const toDraft = (role) => ({
  name: role.name || "",
  value: role.value || "",
  workStartTime: role.workStartTime || "",
  workEndTime: role.workEndTime || "",
  workDays: role.workDays || [1, 2, 3, 4, 5],
  weeklySchedule: role.weeklySchedule || {},
});

/**
 * Rollar sahifasining 2-paneli: tanlangan rolni shu yerda tahrirlash.
 * Ikki tab — "Asosiy" (nom, kalit, ish jadvali) va "Ruxsatlar" (shu rol bilan
 * yaratiladigan foydalanuvchining boshlang'ich ruxsatlari). Ikkala tabning
 * o'zgarishi bitta "Saqlash" bilan yuboriladi.
 *
 * @param {object} props
 * @param {object} props.role - Tanlangan rol
 * @param {(dirty: boolean) => void} [props.onDirtyChange] - Saqlanmagan o'zgarish holati
 * @param {string} [props.className]
 */
const RoleDetailsPanel = ({ role, onDirtyChange, className = "" }) => {
  const { openModal } = useModal();
  const { mutate: updateRole, isPending } = useUpdateRole();

  const { state, setField, setFields } = useObjectState(toDraft(role));
  const [permissions, setPermissions] = useState(() =>
    toPermissionSet(role.permissions),
  );

  const savedDraft = useMemo(() => JSON.stringify(toDraft(role)), [role]);
  const savedPermissions = useMemo(
    () => [...toPermissionSet(role.permissions)].join(","),
    [role.permissions],
  );

  const isDirty =
    JSON.stringify(state) !== savedDraft ||
    [...permissions].join(",") !== savedPermissions;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const isSystem = !!role.isSystem;
  const hasUsers = role.usersCount > 0;

  const toggleWorkDay = (day) => {
    const current = state.workDays || [];
    setField(
      "workDays",
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort(),
    );
  };

  const handleReset = () => {
    setFields(toDraft(role));
    setPermissions(toPermissionSet(role.permissions));
  };

  const handleSave = (e) => {
    e.preventDefault();

    updateRole(
      { id: role.id, data: { ...state, permissions: [...permissions] } },
      {
        onSuccess: () => toast.success("Rol yangilandi"),
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  // "Asosiy" tabi — rol ma'lumotlari va ish jadvali
  const generalTab = (
    <div className="space-y-5 px-4 pb-4 xs:px-5 xs:pb-5">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          Rol ma'lumotlari
        </h3>

        <div className="grid gap-4 rounded-xl border border-gray-100 p-3.5 sm:grid-cols-2">
          <InputField
            required
            name="name"
            label="Rol nomi"
            value={state.name}
            disabled={isSystem}
            description={
              isSystem ? "Tizim roli, nomini o'zgartirib bo'lmaydi" : undefined
            }
            onChange={(e) => setField("name", e.target.value)}
          />

          <InputField
            required
            name="value"
            label="Rol kaliti"
            value={state.value}
            disabled={isSystem || hasUsers}
            description={
              isSystem
                ? "Tizim roli, kalitni o'zgartirib bo'lmaydi"
                : hasUsers
                  ? "Foydalanuvchilar mavjud, kalitni o'zgartirib bo'lmaydi"
                  : "Faqat kichik lotin harflari, raqamlar va pastki chiziq"
            }
            onChange={(e) => setField("value", e.target.value?.toLowerCase().trim())}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          Ish jadvali (davomat)
        </h3>

        <div className="space-y-4 rounded-xl border border-gray-100 p-3.5">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              type="time"
              name="workStartTime"
              label="Boshlanish vaqti"
              value={state.workStartTime}
              onChange={(e) => setField("workStartTime", e.target.value)}
            />

            <InputField
              type="time"
              name="workEndTime"
              label="Tugash vaqti"
              value={state.workEndTime}
              onChange={(e) => setField("workEndTime", e.target.value)}
            />
          </div>

          {/* Ish kunlari */}
          <div>
            <p className="mb-2 text-xs text-gray-500">Ish kunlari</p>

            <div className="flex flex-wrap gap-1.5">
              {WORK_DAYS_OPTIONS.map(({ label, value: day }) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkDay(day)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    state.workDays?.includes(day)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Kunlik maxsus vaqtlar */}
          <div>
            <p className="mb-2 text-xs text-gray-500">
              Har kun uchun alohida vaqt (ixtiyoriy)
            </p>

            <WeeklyScheduleEditor
              workDays={state.workDays || []}
              weeklySchedule={state.weeklySchedule}
              defaultStart={state.workStartTime}
              defaultEnd={state.workEndTime}
              onChange={(ws) => setField("weeklySchedule", ws)}
            />
          </div>
        </div>
      </section>
    </div>
  );

  const tabItems = [
    { value: "general", label: "Asosiy", content: generalTab },
    {
      value: "permissions",
      label: "Ruxsatlar",
      content: <PermissionsMatrix value={permissions} onChange={setPermissions} />,
    },
  ];

  return (
    <Card className={cn("p-0 xs:p-0", className)}>
      <form onSubmit={handleSave}>
        {/* Rol + saqlash */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 xs:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold uppercase text-white">
              {role.name?.[0]}
            </span>

            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{role.name}</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-gray-500">
                <span className="truncate">{role.value}</span>

                {isSystem && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                    <Lock className="size-3.5" strokeWidth={1.5} />
                    Tizim roli
                  </span>
                )}

                <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                  <Users className="size-3.5" strokeWidth={1.5} />
                  {role.usersCount} ta foydalanuvchi
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isDirty && (
              <span className="text-xs font-medium text-amber-600">Saqlanmagan</span>
            )}

            {!isSystem && (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => openModal("deleteRole", role)}
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
                O'chirish
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              disabled={!isDirty || isPending}
              onClick={handleReset}
            >
              Bekor qilish
            </Button>

            <Button disabled={!isDirty || isPending}>
              Saqlash
              {isPending && "..."}
            </Button>
          </div>
        </div>

        <TabsButtons
          items={tabItems}
          contentClassName="mt-4"
          defaultValue="general"
          listClassName="mx-4 mt-4 xs:mx-5 xs:mt-5"
        />
      </form>
    </Card>
  );
};

export default RoleDetailsPanel;
