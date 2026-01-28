// Toast
import { toast } from "sonner";

// React
import { useEffect } from "react";

// API
import { holidaysAPI } from "@/api/client";

// Hooks
import useModal from "@/hooks/useModal.hook";
import useArrayStore from "@/hooks/useArrayStore.hook";
import useObjectState from "@/hooks/useObjectState.hook";

// Components
import Card from "@/components/Card";
import Input from "@/components/form/input";
import Button from "@/components/form/button";
import Select from "@/components/form/select";
import ResponsiveModal from "@/components/ResponsiveModal";

// Utils
import { formatHolidayDate, months } from "@/utils/date.utils";

// Icons
import { Plus, Trash2, Edit, CalendarDays } from "lucide-react";

// Data
import { getHolidayTypeLabel, holidayTypes } from "@/data/holidayTypes.data";

const Holidays = () => {
  const {
    initialize,
    hasCollection,
    setCollection,
    getCollectionData,
    isCollectionLoading,
    setCollectionLoadingState,
  } = useArrayStore();

  const { openModal } = useModal();
  const holidays = getCollectionData("holidays");
  const isLoading = isCollectionLoading("holidays");

  useEffect(() => {
    if (!hasCollection("holidays")) {
      initialize(false, "holidays"); // pagination = false
    }

    if (!holidays?.length) fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setCollectionLoadingState(true, "holidays");
      const response = await holidaysAPI.getAll();
      setCollection(response.data.data, null, "holidays");
    } catch (error) {
      toast.error("Dam olish kunlarini yuklashda xatolik");
      setCollection([], true, "holidays");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Header */}
      <Button
        className="px-4 mb-6"
        onClick={() => openModal("createHoliday", null)}
      >
        <Plus className="size-4 mr-2" />
        Qo'shish
      </Button>

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
                      {getHolidayTypeLabel(holiday.type)}
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
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => openModal("deleteHoliday", holiday)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="size-4" />
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
        <HolidayForm onSuccess={fetchHolidays} />
      </ResponsiveModal>

      {/* Edit Modal */}
      <ResponsiveModal name="editHoliday" title="Dam olish kunini tahrirlash">
        <HolidayForm isEdit onSuccess={fetchHolidays} />
      </ResponsiveModal>

      {/* Delete Modal */}
      <ResponsiveModal name="deleteHoliday" title="Dam olish kunini o'chirish">
        <DeleteHolidayForm onSuccess={fetchHolidays} />
      </ResponsiveModal>
    </div>
  );
};

// Holiday Form Component
const HolidayForm = ({
  close,
  isLoading,
  onSuccess,
  setIsLoading,
  isEdit = false,
  ...holiday
}) => {
  const {
    name,
    type,
    date,
    endDate,
    isActive,
    setField,
    setFields,
    startDate,
    description,
    recurringDay,
    recurringType,
    recurringMonth,
    recurringEndDay,
    recurringStartDay,
    recurringEndMonth,
    recurringStartMonth,
  } = useObjectState({
    name: "",
    date: "",
    endDate: "",
    startDate: "",
    type: "single",
    isActive: true,
    description: "",
    recurringDay: 1,
    recurringMonth: 0,
    recurringEndDay: 1,
    recurringStartDay: 1,
    recurringEndMonth: 0,
    recurringStartMonth: 0,
    recurringType: "single",
  });

  useEffect(() => {
    if (isEdit && holiday._id) {
      const hasRecurringRange =
        holiday.recurringStartDate?.month !== undefined &&
        holiday.recurringEndDate?.month !== undefined;

      setFields({
        name: holiday.name || "",
        type: holiday.type || "single",
        isActive: holiday.isActive ?? true,
        description: holiday.description || "",
        recurringDay: holiday.recurringDate?.day ?? 1,
        recurringMonth: holiday.recurringDate?.month ?? 0,
        recurringEndDay: holiday.recurringEndDate?.day ?? 1,
        date: holiday.date ? holiday.date.split("T")[0] : "",
        recurringType: hasRecurringRange ? "range" : "single",
        recurringEndMonth: holiday.recurringEndDate?.month ?? 0,
        recurringStartDay: holiday.recurringStartDate?.day ?? 1,
        recurringStartMonth: holiday.recurringStartDate?.month ?? 0,
        endDate: holiday.endDate ? holiday.endDate.split("T")[0] : "",
        startDate: holiday.startDate ? holiday.startDate.split("T")[0] : "",
      });
    }
  }, [isEdit, holiday]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { name, description, type, isActive };

      if (type === "single") {
        payload.date = date;
      } else if (type === "range") {
        payload.startDate = startDate;
        payload.endDate = endDate;
      } else if (type === "recurring") {
        if (recurringType === "single") {
          payload.recurringDate = {
            month: parseInt(recurringMonth),
            day: parseInt(recurringDay),
          };
        } else {
          payload.recurringStartDate = {
            month: parseInt(recurringStartMonth),
            day: parseInt(recurringStartDay),
          };
          payload.recurringEndDate = {
            month: parseInt(recurringEndMonth),
            day: parseInt(recurringEndDay),
          };
        }
      }

      let response;
      if (isEdit) {
        response = await holidaysAPI.update(holiday._id, payload);
        toast.success("Dam olish kuni yangilandi");
      } else {
        response = await holidaysAPI.create(payload);
        toast.success("Dam olish kuni yaratildi");
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
        value={name}
        onChange={(v) => setField("name", v)}
        placeholder="Masalan: Yangi yil bayrami"
      />

      <Input
        label="Tavsif"
        value={description}
        placeholder="Qo'shimcha ma'lumot"
        onChange={(v) => setField("description", v)}
      />

      <Select
        required
        label="Turi"
        value={type}
        options={holidayTypes}
        onChange={(v) => setField("type", v)}
      />

      {/* Bir kunlik */}
      {type === "single" && (
        <Input
          required
          type="date"
          label="Sana"
          value={date}
          onChange={(v) => setField("date", v)}
        />
      )}

      {/* Vaqt oralig'i */}
      {type === "range" && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            required
            type="date"
            label="Boshlanish"
            value={startDate}
            onChange={(v) => setField("startDate", v)}
          />
          <Input
            required
            type="date"
            label="Tugash"
            value={endDate}
            onChange={(v) => setField("endDate", v)}
          />
        </div>
      )}

      {/* Har yili takrorlanuvchi */}
      {type === "recurring" && (
        <div className="space-y-4">
          <Select
            label="Takrorlanish turi"
            value={recurringType}
            onChange={(v) => setField("recurringType", v)}
            options={[
              { label: "Bir kun", value: "single" },
              { label: "Vaqt oralig'i", value: "range" },
            ]}
          />

          {recurringType === "single" && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Oy"
                value={recurringMonth}
                onChange={(v) => setField("recurringMonth", parseInt(v))}
                options={months}
              />
              <Input
                type="number"
                label="Kun"
                min={1}
                max={31}
                value={recurringDay}
                onChange={(v) => setField("recurringDay", parseInt(v))}
              />
            </div>
          )}

          {recurringType === "range" && (
            <>
              <p className="text-sm text-gray-600 font-medium">
                Boshlanish sanasi:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Oy"
                  value={recurringStartMonth}
                  onChange={(v) => setField("recurringStartMonth", parseInt(v))}
                  options={months}
                />
                <Input
                  type="number"
                  label="Kun"
                  min={1}
                  max={31}
                  value={recurringStartDay}
                  onChange={(v) => setField("recurringStartDay", parseInt(v))}
                />
              </div>

              <p className="text-sm text-gray-600 font-medium">
                Tugash sanasi:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Oy"
                  value={recurringEndMonth}
                  onChange={(v) => setField("recurringEndMonth", parseInt(v))}
                  options={months}
                />
                <Input
                  type="number"
                  label="Kun"
                  min={1}
                  max={31}
                  value={recurringEndDay}
                  onChange={(v) => setField("recurringEndDay", parseInt(v))}
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
          checked={isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
          className="size-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
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
      onSuccess();
      await holidaysAPI.delete(holiday._id);
      toast.success("Dam olish kuni o'chirildi");
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
