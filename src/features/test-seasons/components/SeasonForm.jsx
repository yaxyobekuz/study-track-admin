// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useCreateSeason,
  useEditSeason,
} from "../queries/test-seasons.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";

const SeasonForm = ({
  close,
  isLoading,
  setIsLoading,
  isEdit = false,
  ...season
}) => {
  const { mutate: createSeason } = useCreateSeason();
  const { mutate: editSeason } = useEditSeason();

  const {
    name,
    description,
    startDate,
    endDate,
    isActive,
    setField,
    setFields,
  } = useObjectState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && season.id) {
      setFields({
        name: season.name || "",
        description: season.description || "",
        startDate: season.startDate ? season.startDate.split("T")[0] : "",
        endDate: season.endDate ? season.endDate.split("T")[0] : "",
        isActive: season.isActive ?? true,
      });
    }
  }, [isEdit, season?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak");
      return;
    }

    setIsLoading(true);

    const payload = { name, description, startDate, endDate, isActive };

    const handlers = {
      onSuccess: (res) => {
        // Ustma-ust mavsumlar ogohlantirishi
        if (res.overlapping?.length > 0) {
          toast.warning(
            `Diqqat: ${res.overlapping.length} ta boshqa mavsum bilan sana ustma-ust keladi`,
          );
        }
        toast.success(isEdit ? "Mavsum yangilandi" : "Mavsum yaratildi");
        close();
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) {
      editSeason({ id: season.id, data: payload }, handlers);
    } else {
      createSeason(payload, handlers);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        label="Nomi"
        value={name}
        placeholder="Masalan: 2026 1-chorak"
        onChange={(e) => setField("name", e.target.value)}
      />

      <InputField
        label="Tavsif"
        value={description}
        placeholder="Qo'shimcha ma'lumot"
        onChange={(e) => setField("description", e.target.value)}
      />

      <InputGroup className="grid-cols-2">
        <InputField
          required
          type="date"
          label="Boshlanish sanasi"
          value={startDate}
          onChange={(e) => setField("startDate", e.target.value)}
        />

        <InputField
          required
          type="date"
          label="Tugash sanasi"
          value={endDate}
          onChange={(e) => setField("endDate", e.target.value)}
        />
      </InputGroup>

      <p className="text-xs text-gray-500">
        Holat boshlanish va tugash sanalari asosida avtomatik belgilanadi
        (Kutilmoqda → Faol → Yakunlangan). O'quvchilar testni faqat shu sanalar
        oralig'ida topshira oladi.
      </p>

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
          className="size-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Aktiv
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default SeasonForm;
