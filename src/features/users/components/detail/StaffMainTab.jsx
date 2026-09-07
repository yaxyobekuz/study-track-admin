// Components
import InfoCard, { InfoRows } from "./InfoCard";
import UserAccountCard from "./UserAccountCard";
import UserBasicInfoCard from "./UserBasicInfoCard";
import UserBranchesCard from "./UserBranchesCard";
import UserPhoneCard from "./UserPhoneCard";
import UserRolesCard from "./UserRolesCard";
import EditUserBasicModal from "../EditUserBasicModal";
import EditUserPhoneModal from "../EditUserPhoneModal";
import EditWorkScheduleModal from "../EditWorkScheduleModal";
import EditStaffSubjectsModal from "../EditStaffSubjectsModal";
import EditUserRolesModal from "../EditUserRolesModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useCanManageUser from "../../hooks/useCanManageUser";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Helpers & utils
import { getRoleLabel } from "@/shared/helpers/role.helpers";
import { formatDateUZ } from "@/shared/utils/date.utils";

// Data
import { getGenderLabel } from "../../data/users.data";
import {
  WEEK_DAY_NAMES,
  WORK_DAYS_OPTIONS,
  WORK_TIME_SOURCE,
} from "@/features/attendance/data/attendance.data";

/**
 * Dars jadvalidan hisoblangan ish vaqti.
 *
 * ⚠️ Kunlar KUN-KUNGA ko'rsatiladi, umumiy "08:30–14:20" bilan EMAS: dars
 * jadvalida har kun boshqacha va bitta diapazon "seshanba soat 8 da kelishi
 * kerak" degan noto'g'ri xulosaga olib kelardi.
 */
const LessonScheduleView = ({ schedule }) => {
  const byDay = schedule?.byDay ?? {};
  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);

  if (schedule?.scheduleMissing || days.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          Ish vaqti dars jadvalidan olinadi.
        </p>
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Dars jadvalida bu o'qituvchining darsi yo'q — ish vaqti aniqlanmaydi
          va davomat talab qilinmaydi. Jadvalga dars qo'yilishi bilan ish vaqti
          o'zi paydo bo'ladi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Ish vaqti dars jadvalidan olinadi — birinchi darsdan oxirgi darsgacha.
      </p>

      <ul className="space-y-1.5">
        {days.map((day) => (
          <li key={day} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{WEEK_DAY_NAMES[day]}</span>
            <span className="text-gray-900">
              {byDay[day].startTime && byDay[day].endTime
                ? `${byDay[day].startTime}–${byDay[day].endTime}`
                : "vaqti belgilanmagan"}
              <span className="ml-2 text-xs text-gray-400">
                {byDay[day].lessonCount} dars
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
  // Egalik darvozasi — o'qituvchi xodimni umuman tahrirlay olmaydi
  const canManage = useCanManageUser(user);
  const { data: roles = [] } = useRoles();

  // Ish vaqti dars jadvalidan olinadimi — bu boshqa ikki rejimni ISTISNO
  // qiladi, shuning uchun eng oldin tekshiriladi.
  const fromLessons = user.workTimeSource === WORK_TIME_SOURCE.SCHEDULE;
  const hasCustomSchedule =
    !fromLessons && Boolean(user.workStartTime && user.workEndTime);

  // Dars jadvalidan hisoblangan oyna serverdan tayyor keladi
  // (`effectiveSchedule`): panel uni qayta hisoblamaydi, aks holda davomat
  // bilan ekran boshqa-boshqa vaqt ko'rsatib qolardi.
  const lessonSchedule = fromLessons ? user.effectiveSchedule : null;
  const subjects = user.subjects ?? [];
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
          canEdit={canManage}
          onEdit={() => openModal("editWorkSchedule", user)}
        >
          {fromLessons ? (
            <LessonScheduleView schedule={lessonSchedule} />
          ) : hasCustomSchedule ? (
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

      {/* Xodim qaysi fanlardan dars beradi. Bu ro'yxat dars jadvalini
          rejalashtirishning kirimi: fan biriktirilgan zahoti xodim
          "Dars jadvalini rejalashtirish" jadvalida satr sifatida chiqadi. */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <InfoCard
          title="Fanlar"
          canEdit={canManage}
          onEdit={() => openModal("editStaffSubjects", user)}
        >
          {subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <span
                  key={subject.id}
                  className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700"
                >
                  {subject.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Fan biriktirilmagan — dars jadvalini rejalashtirishda
              qatnashmaydi.
            </p>
          )}
        </InfoCard>

        {/* Xodimning raqamlari — ko'rish hammaga, tahrirlash `users.phone`. */}
        <UserPhoneCard user={user} canEdit={canManage} />
      </div>

      {/* KO'P ROLLILIK — "Ruxsatlar" tabidan ALOHIDA va bu ataylab:
          ruxsat "shu bo'limga kira olasanmi" degan mayda qaror, rol esa
          "bu odam yana kim" degan katta qaror va uni faqat owner
          qabul qiladi. Ikkalasi bitta ekranda tursa, ular bir xil
          og'irlikda ko'rinardi. */}
      <UserRolesCard user={user} />

      {/* Xodim qayerda ishlashi — faqat O'QISH uchun qisqa ro'yxat.
          Biriktirish va ruxsatlar "Ruxsatlar" tabida: ular bir-biridan
          ajralmaydi va ikki joyda takrorlanmasligi kerak. */}
      <UserBranchesCard user={user} />

      {/* Modallar shu tab ichida — ro'yxat sahifalariga tegishli emas */}
      <EditUserBasicModal />
      <EditWorkScheduleModal />
      <EditStaffSubjectsModal />
      <EditUserRolesModal />
      <EditUserPhoneModal />
    </div>
  );
};

export default StaffMainTab;
