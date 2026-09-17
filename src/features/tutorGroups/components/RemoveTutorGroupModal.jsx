// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { REMOVE_EFFECTIVE_OPTIONS } from "../data/tutorGroups.data";
import { useRemoveTutorGroup } from "../queries/tutorGroups.mutations";

/**
 * Guruhni tyutordan OLIB TASHLASH — qaysi oydan kuchga kirishini admin
 * tanlaydi. Boshlangan biriktirish o'chirilmaydi (oylik tarixi), yopiladi;
 * hali kuchga kirmagani esa o'chiriladi — buni server hal qiladi.
 *
 * `openModal("removeTutorGroup", { group })`
 */
const RemoveTutorGroupModal = () => (
  <ResponsiveModal name="removeTutorGroup" title="Guruhni olib tashlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, group }) => {
  const { mutate: removeGroup } = useRemoveTutorGroup();
  const [effective, setEffective] = useState("next");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    removeGroup(
      { id: group.id, effective },
      {
        onSuccess: (result) => {
          close();
          toast.success(result?.message || "Guruh olib tashlandi");
          (result?.warnings ?? []).forEach((warning) => toast.warning(warning));
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        <b className="text-gray-900">{group?.className}</b> guruhi uchun qo'shimcha
        oylik qachondan to'xtasin?
      </p>

      <div className="space-y-2">
        {REMOVE_EFFECTIVE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
              effective === option.value
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300",
            )}
          >
            <input
              type="radio"
              name="removeEffective"
              className="mt-0.5 size-4"
              checked={effective === option.value}
              onChange={() => setEffective(option.value)}
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium text-gray-800">{option.title}</span>
              <span className="block text-xs text-gray-500">{option.description}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex w-full flex-col-reverse gap-3.5 xs:m-0 xs:flex-row xs:justify-end">
        <Button type="button" onClick={close} variant="secondary" className="w-full xs:w-32">
          Bekor qilish
        </Button>
        <Button variant="danger" className="w-full xs:w-40" disabled={isLoading}>
          Olib tashlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default RemoveTutorGroupModal;
