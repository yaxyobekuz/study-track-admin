// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import { SEASON_STATUS_OPTIONS } from "../data/seasonStatuses.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";

const SeasonForm = ({
  close,
  isLoading,
  onSuccess,
  setIsLoading,
  isEdit = false,
  ...season
}) => {
  const {
    name,
    description,
    startDate,
    endDate,
    status,
    isActive,
    setField,
    setFields,
  } = useObjectState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && season._id) {
      setFields({
        name: season.name || "",
        description: season.description || "",
        startDate: season.startDate ? season.startDate.split("T")[0] : "",
        endDate: season.endDate ? season.endDate.split("T")[0] : "",
        status: season.status || "draft",
        isActive: season.isActive ?? true,
      });
    }
  }, [isEdit, season?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        description,
        startDate,
        endDate,
        status,
        isActive,
      };

      let response;
      if (isEdit) {
        response = await testSeasonsAPI.update(season._id, payload);
        toast.success("Mavsum yangilandi");
      } else {
        response = await testSeasonsAPI.create(payload);
        toast.success("Mavsum yaratildi");
      }

      // Ustma-ust mavsumlar ogohlantirishi
      if (response.data.overlapping?.length > 0) {
        toast.warning(
          `Diqqat: ${response.data.overlapping.length} ta boshqa mavsum bilan sana ustma-ust keladi`,
        );
      }

      onSuccess(response.data.data);
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
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

      <SelectField
        required
        label="Holat"
        value={status}
        options={SEASON_STATUS_OPTIONS}
        triggerClassName="w-full"
        onChange={(v) => setField("status", v)}
        description="O'quvchilar testni faqat 'Faol' holatdagi mavsumda topshira oladi"
      />

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
