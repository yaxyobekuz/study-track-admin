// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks & data
import { useUpdateUserPermissions } from "@/features/permissions/queries/permissions.mutations";
import {
  PERMISSION_KEYS,
  PERMISSION_CATALOG_BY_GROUP,
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

  // Faqat katalogdagi kalitlarni saqlaymiz (eskirgan kalitlarni tashlab yuboramiz)
  const [selected, setSelected] = useState(
    () => new Set((user.permissions || []).filter((k) => PERMISSION_KEYS.includes(k))),
  );

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleGroup = (keys, allOn) => {
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const toggleAll = (allOn) =>
    setSelected(allOn ? new Set() : new Set(PERMISSION_KEYS));

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);

    updatePermissions(
      { id: user.id, permissions: [...selected] },
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

  return (
    <form onSubmit={handleSave}>
      {/* Foydalanuvchi + hammasini tanlash */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-1 border-b">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">
            {user.fullName || user.firstName}
          </p>
          <p className="text-xs text-gray-500">{selected.size} ta ruxsat tanlangan</p>
        </div>

        <button
          type="button"
          onClick={() => toggleAll(allSelected)}
          className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          {allSelected ? "Hammasini olib tashlash" : "Hammasini tanlash"}
        </button>
      </div>

      {/* Guruhlangan ruxsatlar */}
      <div className="max-h-[52vh] space-y-4 overflow-y-auto py-3 hidden-scrollbar">
        {Object.entries(PERMISSION_CATALOG_BY_GROUP).map(([group, items]) => {
          const keys = items.map((i) => i.key);
          const groupAllOn = keys.every((k) => selected.has(k));

          return (
            <div key={group}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {group}
                </p>
                <button
                  type="button"
                  onClick={() => toggleGroup(keys, groupAllOn)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  {groupAllOn ? "Tozalash" : "Barchasi"}
                </button>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {items.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5"
                  >
                    <span className="text-sm text-gray-700">{label}</span>
                    <Switch
                      checked={selected.has(key)}
                      onChange={() => toggle(key)}
                    />
                  </label>
                ))}
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
