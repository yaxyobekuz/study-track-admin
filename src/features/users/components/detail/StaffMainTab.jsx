// Components
import InfoCard, { InfoRows } from "./InfoCard";
import UserAccountCard from "./UserAccountCard";
import UserBasicInfoCard from "./UserBasicInfoCard";
import EditUserBasicModal from "../EditUserBasicModal";
import EditWorkScheduleModal from "../EditWorkScheduleModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & utils
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { getGenderLabel } from "../../data/users.data";
import {
  WEEK_DAY_NAMES,
  WORK_DAYS_OPTIONS,
} from "@/features/attendance/data/attendance.data";

/**
 * Xodimning "Asosiy" tabi — o'qish uchun kartalar, tahrirlash esa har bir
 * kartaning qalami orqali.
 *
 * Ish jadvali alohida kartada: u davomat va jarimalarga bevosita ta'sir
 * qiladi, shuning uchun boshqa maydonlar bilan bir formada aralashib
 * ketmasligi kerak.
 */
const StaffMainTab = ({ user }) => {
  const { openModal } = useModal();
  const { data: roles = [] } = useRoles();

  const hasCustomSchedule = Boolean(user.workStartTime && user.workEndTime);
  const workDays = user.workDays ?? [];

  // { "1": { startTime, endTime } } — asosiy vaqtdan farq qiladigan kunlar
  const weeklySchedule = user.weeklySchedule ?? {};
  const customDays = Object.entries(weeklySchedule).filter(
    ([, value]) => value?.startTime || value?.endTime,
  );

  const basicRows = [
    { label: "Jins", value: getGenderLabel(user.gender) },
    {
      label: "Holat",
      value: user.isArchived ? "Arxivlangan" : user.isActive ? "Faol" : "Nofaol",
    },
    { label: "Jarima ballari", value: user.penaltyPoints ?? 0 },
    { label: "Tangalar", value: user.coinBalance ?? 0 },
    { label: "Ro'yxatdan o'tgan", value: formatDateUZ(user.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <UserBasicInfoCard
        user={user}
        rows={basicRows}
        roleLabel={getRoleLabel(user.role, roles)}
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <InfoCard
          title="Ish jadvali"
          onEdit={() => openModal("editWorkSchedule", user)}
        >
          {hasCustomSchedule ? (
            <div className="space-y-4">
              <InfoRows
                rows={[
                  {
                    label: "Ish vaqti",
                    value: `${user.workStartTime}–${user.workEndTime}`,
                  },
                  {
                    label: "Ish kunlari",
                    value: (
                      <div className="flex flex-wrap gap-1.5">
                        {WORK_DAYS_OPTIONS.map(({ label, value }) => {
                          const isWorkDay = workDays.includes(value);
                          return (
                            <span
                              key={value}
                              title={WEEK_DAY_NAMES[value]}
                              className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                                isWorkDay
                                  ? "bg-primary/10 text-primary"
                                  : "bg-gray-50 text-gray-300"
                              }`}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    ),
                  },
                ]}
              />

              {customDays.length > 0 && (
                <div className="border-t border-gray-100 pt-3.5">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Alohida vaqtlar
                  </p>
                  <ul className="space-y-1.5">
                    {customDays.map(([day, value]) => (
                      <li
                        key={day}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-500">
                          {WEEK_DAY_NAMES[day]}
                        </span>
                        <span className="text-gray-900">
                          {value.startTime || user.workStartTime}–
                          {value.endTime || user.workEndTime}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Maxsus jadval belgilanmagan — xodim roli uchun o'rnatilgan
              standart vaqt amal qiladi.
            </p>
          )}
        </InfoCard>

        <UserAccountCard user={user} />
      </div>

      {/* Modallar shu tab ichida — ro'yxat sahifalariga tegishli emas */}
      <EditUserBasicModal />
      <EditWorkScheduleModal />
    </div>
  );
};

export default StaffMainTab;
