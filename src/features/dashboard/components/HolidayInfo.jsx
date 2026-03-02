// Icons
import { PartyPopper } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Hooks
import useObjectStore from "@/shared/hooks/useObjectStore";

const HolidayInfo = () => {
  // Holiday Info
  const { getEntity } = useObjectStore("holidayCheck");
  const holidayInfo = getEntity("today") || { isHoliday: false, holiday: null };

  if (!holidayInfo.isHoliday) return;

  return (
    <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 rounded-full">
          <PartyPopper className="size-8 text-orange-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-800">
            Bugun "{holidayInfo.holiday?.name}" bayram kuni!
          </h3>
          {holidayInfo.holiday?.description && (
            <p className="text-orange-600 text-sm mt-1">
              {holidayInfo.holiday.description}
            </p>
          )}
          <p className="text-orange-500 text-sm mt-2">
            Dam olish kunlarida darslar o'tkazilmaydi va baholar qo'yilmaydi
          </p>
        </div>
      </div>
    </Card>
  );
};

export default HolidayInfo;
