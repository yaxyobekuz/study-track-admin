// Toast
import { toast } from "sonner";

// API
import { holidaysAPI } from "@/api/client";

// React
import { useState, useEffect } from "react";

// Hooks
import useModal from "@/hooks/useModal.hook";
import useArrayStore from "@/hooks/useArrayStore.hook";

// Components
import Card from "@/components/Card";
import Input from "@/components/form/input";
import Button from "@/components/form/button";
import Select from "@/components/form/select";
import ResponsiveModal from "@/components/ResponsiveModal";

// Icons
import { Plus, Trash2, Edit, CalendarDays } from "lucide-react";

// Oylar
const MONTHS = [
  { label: "Yanvar", value: 0 },
  { label: "Fevral", value: 1 },
  { label: "Mart", value: 2 },
  { label: "Aprel", value: 3 },
  { label: "May", value: 4 },
  { label: "Iyun", value: 5 },
  { label: "Iyul", value: 6 },
  { label: "Avgust", value: 7 },
  { label: "Sentabr", value: 8 },
  { label: "Oktabr", value: 9 },
  { label: "Noyabr", value: 10 },
  { label: "Dekabr", value: 11 },
];

// Dam olish turi
const HOLIDAY_TYPES = [
  { label: "Bir kunlik", value: "single" },
  { label: "Vaqt oralig'i", value: "range" },
  { label: "Har yili takrorlanuvchi", value: "recurring" },
];

// Tur labelini olish
const getTypeLabel = (type) => {
  return HOLIDAY_TYPES.find((t) => t.value === type)?.label || type;
};

// Sanani formatlash
const formatHolidayDate = (holiday) => {
  if (holiday.type === "single" && holiday.date) {
    return new Date(holiday.date).toLocaleDateString("uz-UZ");
  }
  if (holiday.type === "range" && holiday.startDate && holiday.endDate) {
    return `${new Date(holiday.startDate).toLocaleDateString(
      "uz-UZ"
    )} - ${new Date(holiday.endDate).toLocaleDateString("uz-UZ")}`;
  }
  if (holiday.type === "recurring") {
    if (holiday.recurringDate?.month !== undefined) {
      return `Har yili ${holiday.recurringDate.day}-${
        MONTHS[holiday.recurringDate.month].label
      }`;
    }
    if (
      holiday.recurringStartDate?.month !== undefined &&
      holiday.recurringEndDate?.month !== undefined
    ) {
      return `Har yili ${holiday.recurringStartDate.day}-${
        MONTHS[holiday.recurringStartDate.month].label
      } — ${holiday.recurringEndDate.day}-${
        MONTHS[holiday.recurringEndDate.month].label
      }`;
    }
  }
  return "-";
};

const Holidays = () => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
  } = useArrayStore();

  const { openModal } = useModal();

  const holidays = getCollectionData("holidays");
  const isLoading = isCollectionLoading("holidays");

  useEffect(() => {
    if (!hasCollection("holidays")) {
      initialize(false, "holidays"); // pagination = false
    }

    if (!holidays?.length) {
      fetchHolidays();
    }
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await holidaysAPI.getAll();
      setCollection(response.data.data, null, "holidays");
    } catch (error) {
      toast.error("Dam olish kunlarini yuklashda xatolik");
      setCollection([], true, "holidays");
    }
  };

  // Modal success actions
  const handleCreate = () => {
    fetchHolidays();
    toast.success("Dam olish kuni qo'shildi");
  };

  const handleUpdate = () => {
    fetchHolidays();
    toast.success("Dam olish kuni yangilandi");
  };

  const handleDelete = () => {
    fetchHolidays();
    toast.success("Dam olish kuni o'chirildi");
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dam olish kunlari</h1>
        <Button
          className="px-4"
          onClick={() => openModal("createHoliday", null)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Qo'shish
        </Button>
      </div>

      {/* List */}
      {holidays.length === 0 ? (
        <Card className="text-center py-8">
          <CalendarDays
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-gray-500">Dam olish kunlari mavjud emas</p>
        </Card>
      ) : (
        <Card responsive>
          <div className="rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Thead */}
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Nomi</th>
                  <th className="px-6 py-3 text-left">Turi</th>
                  <th className="px-6 py-3 text-left">Sana</th>
                  <th className="px-6 py-3 text-left">Holat</th>
                  <th className="px-6 py-3 text-right">Amallar</th>
                </tr>
              </thead>

              {/* Tbody */}
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map((holiday, index) => (
                  <tr key={holiday._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {holiday.name}
                      </div>
                      {holiday.description && (
                        <div className="text-sm text-gray-500">
                          {holiday.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {getTypeLabel(holiday.type)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatHolidayDate(holiday)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          holiday.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {holiday.isActive ? "Aktiv" : "Noaktiv"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal("editHoliday", holiday)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal("deleteHoliday", holiday)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <ResponsiveModal name="createHoliday" title="Yangi dam olish kuni">
        <HolidayForm onSuccess={handleCreate} />
      </ResponsiveModal>

      {/* Edit Modal */}
      <ResponsiveModal name="editHoliday" title="Dam olish kunini tahrirlash">
        <HolidayForm isEdit onSuccess={handleUpdate} />
      </ResponsiveModal>

      {/* Delete Modal */}
      <ResponsiveModal name="deleteHoliday" title="Dam olish kunini o'chirish">
        <DeleteHolidayForm onSuccess={handleDelete} />
      </ResponsiveModal>
    </div>
  );
};

// Holiday Form Component
const HolidayForm = ({
  isEdit = false,
  onSuccess,
  close,
  isLoading,
  setIsLoading,
  ...holiday
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "single",
    date: "",
    startDate: "",
    endDate: "",
    recurringType: "single", // 'single' yoki 'range'
    recurringMonth: 0,
    recurringDay: 1,
    recurringStartMonth: 0,
    recurringStartDay: 1,
    recurringEndMonth: 0,
    recurringEndDay: 1,
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && holiday._id) {
      const hasRecurringRange =
        holiday.recurringStartDate?.month !== undefined &&
        holiday.recurringEndDate?.month !== undefined;

      setFormData({
        name: holiday.name || "",
        description: holiday.description || "",
        type: holiday.type || "single",
        date: holiday.date ? holiday.date.split("T")[0] : "",
        startDate: holiday.startDate ? holiday.startDate.split("T")[0] : "",
        endDate: holiday.endDate ? holiday.endDate.split("T")[0] : "",
        recurringType: hasRecurringRange ? "range" : "single",
        recurringMonth: holiday.recurringDate?.month ?? 0,
        recurringDay: holiday.recurringDate?.day ?? 1,
        recurringStartMonth: holiday.recurringStartDate?.month ?? 0,
        recurringStartDay: holiday.recurringStartDate?.day ?? 1,
        recurringEndMonth: holiday.recurringEndDate?.month ?? 0,
        recurringEndDay: holiday.recurringEndDate?.day ?? 1,
        isActive: holiday.isActive ?? true,
      });
    }
  }, [isEdit, holiday._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        isActive: formData.isActive,
      };

      if (formData.type === "single") {
        payload.date = formData.date;
      } else if (formData.type === "range") {
        payload.startDate = formData.startDate;
        payload.endDate = formData.endDate;
      } else if (formData.type === "recurring") {
        if (formData.recurringType === "single") {
          payload.recurringDate = {
            month: parseInt(formData.recurringMonth),
            day: parseInt(formData.recurringDay),
          };
        } else {
          payload.recurringStartDate = {
            month: parseInt(formData.recurringStartMonth),
            day: parseInt(formData.recurringStartDay),
          };
          payload.recurringEndDate = {
            month: parseInt(formData.recurringEndMonth),
            day: parseInt(formData.recurringEndDay),
          };
        }
      }

      let response;
      if (isEdit) {
        response = await holidaysAPI.update(holiday._id, payload);
      } else {
        response = await holidaysAPI.create(payload);
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
      <Input
        required
        label="Nomi"
        value={formData.name}
        onChange={(v) => setFormData({ ...formData, name: v })}
        placeholder="Masalan: Yangi yil bayrami"
      />

      <Input
        label="Tavsif"
        value={formData.description}
        onChange={(v) => setFormData({ ...formData, description: v })}
        placeholder="Qo'shimcha ma'lumot"
      />

      <Select
        required
        label="Turi"
        value={formData.type}
        onChange={(v) => setFormData({ ...formData, type: v })}
        options={HOLIDAY_TYPES}
      />

      {/* Bir kunlik */}
      {formData.type === "single" && (
        <Input
          required
          type="date"
          label="Sana"
          value={formData.date}
          onChange={(v) => setFormData({ ...formData, date: v })}
        />
      )}

      {/* Vaqt oralig'i */}
      {formData.type === "range" && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            required
            type="date"
            label="Boshlanish"
            value={formData.startDate}
            onChange={(v) => setFormData({ ...formData, startDate: v })}
          />
          <Input
            required
            type="date"
            label="Tugash"
            value={formData.endDate}
            onChange={(v) => setFormData({ ...formData, endDate: v })}
          />
        </div>
      )}

      {/* Har yili takrorlanuvchi */}
      {formData.type === "recurring" && (
        <div className="space-y-4">
          <Select
            label="Takrorlanish turi"
            value={formData.recurringType}
            onChange={(v) => setFormData({ ...formData, recurringType: v })}
            options={[
              { label: "Bir kun", value: "single" },
              { label: "Vaqt oralig'i", value: "range" },
            ]}
          />

          {formData.recurringType === "single" && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Oy"
                value={formData.recurringMonth}
                onChange={(v) =>
                  setFormData({ ...formData, recurringMonth: parseInt(v) })
                }
                options={MONTHS}
              />
              <Input
                type="number"
                label="Kun"
                min={1}
                max={31}
                value={formData.recurringDay}
                onChange={(v) =>
                  setFormData({ ...formData, recurringDay: parseInt(v) })
                }
              />
            </div>
          )}

          {formData.recurringType === "range" && (
            <>
              <p className="text-sm text-gray-600 font-medium">
                Boshlanish sanasi:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Oy"
                  value={formData.recurringStartMonth}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      recurringStartMonth: parseInt(v),
                    })
                  }
                  options={MONTHS}
                />
                <Input
                  type="number"
                  label="Kun"
                  min={1}
                  max={31}
                  value={formData.recurringStartDay}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      recurringStartDay: parseInt(v),
                    })
                  }
                />
              </div>

              <p className="text-sm text-gray-600 font-medium">
                Tugash sanasi:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Oy"
                  value={formData.recurringEndMonth}
                  onChange={(v) =>
                    setFormData({ ...formData, recurringEndMonth: parseInt(v) })
                  }
                  options={MONTHS}
                />
                <Input
                  type="number"
                  label="Kun"
                  min={1}
                  max={31}
                  value={formData.recurringEndDay}
                  onChange={(v) =>
                    setFormData({ ...formData, recurringEndDay: parseInt(v) })
                  }
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Holat */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Aktiv
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="neutral"
          className="px-4"
          onClick={close}
          disabled={isLoading}
        >
          Bekor qilish
        </Button>
        <Button type="submit" className="px-4" disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

// Delete Holiday Form Component
const DeleteHolidayForm = ({
  onSuccess,
  close,
  isLoading,
  setIsLoading,
  ...holiday
}) => {
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await holidaysAPI.delete(holiday._id);
      onSuccess(holiday._id);
      close();
    } catch (error) {
      toast.error("O'chirishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-gray-600 mb-4">
        "<span className="font-medium">{holiday.name}</span>" dam olish kunini
        o'chirishni xohlaysizmi?
      </p>
      <div className="flex justify-end gap-3">
        <Button
          variant="neutral"
          className="px-4"
          onClick={close}
          disabled={isLoading}
        >
          Bekor qilish
        </Button>
        <Button
          variant="danger"
          className="px-4"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? "O'chirilmoqda..." : "O'chirish"}
        </Button>
      </div>
    </div>
  );
};

export default Holidays;
