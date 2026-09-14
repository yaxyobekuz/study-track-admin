// Components
import AttendanceStatusPill from "./AttendanceStatusPill";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers & utils
import { getWorkedMinutes } from "@/shared/helpers/attendance.helpers";
import {
  formatDateUZ,
  formatDurationShortUZ,
  formatTimeUZ,
} from "@/shared/utils/date.utils";

// Data
import {
  WORK_TIME_SOURCE,
  LOCATION_STATUS_LABELS,
  LOCATION_STATUS_HINTS,
  formatDistance,
} from "../data/attendance.data";

/**
 * Bitta qaydning joylashuvi: holat + ofisgacha masofa.
 *
 * Masofa ataylab ko'rsatiladi — "12 m narida" va "5 km narida" ni
 * ajratmasdan turib, chekka holatni chin buzilishdan farqlab bo'lmaydi.
 */
const LocationValue = ({ status, distance }) => {
  if (!status) return <span className="text-gray-400">—</span>;

  const isClean = status === "inside";
  const label = LOCATION_STATUS_LABELS[status] || status;
  const hint = LOCATION_STATUS_HINTS[status];

  return (
    <span className={isClean ? "text-gray-900" : "text-amber-700"} title={hint}>
      {label}
      {distance !== null && distance !== undefined && (
        <span className="text-gray-500"> · {formatDistance(distance)}</span>
      )}
    </span>
  );
};

/**
 * Shu KUN uchun kutilgan ish vaqti.
 *
 * ⚠️ Dars jadvalidan ishlaydigan xodimda oyna HAR KUN BOSHQACHA, shuning
 * uchun yozuvning o'z sanasidagi kun olinadi — umumiy diapazon emas.
 *
 * ⚠️ `Attendance.date` UTC yarim tunida yotadi, shuning uchun kun raqami
 * `getUTCDay()` bilan o'qiladi: `getDay()` Toshkentdan boshqa mintaqada
 * ochilganda kunni bir kunga surib yuborardi.
 */
const getExpectedWindow = (user, date) => {
  const schedule = user?.effectiveSchedule;

  if (schedule?.source === WORK_TIME_SOURCE.SCHEDULE) {
    const day = new Date(date).getUTCDay();
    const window = schedule.byDay?.[day];

    if (!window?.startTime || !window?.endTime) return "Dars yo'q";
    return `${window.startTime} — ${window.endTime}`;
  }

  const start = schedule?.workStartTime ?? user?.workStartTime;
  const end = schedule?.workEndTime ?? user?.workEndTime;

  return start && end ? `${start} — ${end}` : "Rol bo'yicha";
};

/**
 * Bir kunlik davomatning to'liq tafsiloti.
 *
 * Jadvalda hamma narsani ko'rsatib bo'lmaydi (joylashuv ogohlantirishi,
 * jarima, avtomatik belgilanganmi) — ular shu yerda ochiladi. Jadval esa
 * kundalik o'qish uchun ixcham qoladi.
 */
const AttendanceDayModal = () => (
  <ResponsiveModal name="attendanceDay" title="Kunlik davomat">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, record, variant = "staff", user }) => {
  if (!record) return null;

  const isStaff = variant === "staff";
  const workedMinutes = getWorkedMinutes(record);

  const rows = [
    {
      label: "Sana",
      value: formatDateUZ(record.date),
    },
    {
      label: "Holat",
      value: (
        <AttendanceStatusPill
          status={record.status}
          lateMinutes={record.lateMinutes}
        />
      ),
    },
  ];

  if (isStaff) {
    rows.push(
      {
        label: "Ish grafigi",
        value: getExpectedWindow(user, record.date),
      },
      { label: "Kelish", value: formatTimeUZ(record.checkIn) },
      { label: "Ketish", value: formatTimeUZ(record.checkOut) },
      {
        label: "Ishlangan vaqt",
        value: formatDurationShortUZ(workedMinutes),
      },
    );

    if (record.earlyOutMinutes > 0) {
      rows.push({
        label: "Erta ketgan",
        value: `${record.earlyOutMinutes} daqiqa`,
      });
    }
  } else {
    rows.push(
      { label: "Sinf", value: record.class?.name ?? "—" },
      { label: "Belgilangan vaqt", value: formatTimeUZ(record.markedAt) },
    );
  }

  // ⚠️ Sabab KATEGORIYASI faqat XODIM tomonida qoldi — u tasdiqlangan
  // "Uzrli so'rov" dan tushadi. Qo'lda belgilashda (o'quvchi ham, xodim ham)
  // kategoriya so'ralmaydi, faqat ixtiyoriy izoh yoziladi.
  if (isStaff && record.absenceReason?.title) {
    rows.push({ label: "Sabab", value: record.absenceReason.title });
  }

  rows.push({ label: "Izoh", value: record.excuseReason || "—" });

  rows.push({
    label: "Qayd etilgan",
    value: record.autoMarked ? "Avtomatik" : "Qo'lda",
  });

  // ⚠️ KELISH va KETISH ALOHIDA ko'rsatiladi. Ilgari ikkalasi bitta
  // bayroqqa siqilgani uchun "kelganda ofisda edi, ketganda tashqarida"
  // degan holat umuman ko'rinmasdi — ekranda faqat "Ogohlantirish bor"
  // turardi va uni tekshirishning iloji yo'q edi.
  if (isStaff && record.checkIn) {
    rows.push({
      label: "Kelish joylashuvi",
      value: (
        <LocationValue
          status={record.checkInLocationStatus}
          distance={record.checkInDistance}
        />
      ),
    });
  }

  if (isStaff && record.checkOut) {
    rows.push({
      label: "Ketish joylashuvi",
      value: (
        <LocationValue
          status={record.checkOutLocationStatus}
          distance={record.checkOutDistance}
        />
      ),
    });
  }

  if (record.penaltyRef) {
    rows.push({
      label: "Jarima",
      value: `${record.penaltyRef.title || "Jarima"} · ${record.penaltyRef.points} ball`,
    });
  }

  return (
    <div className="space-y-4">
      <dl className="divide-y divide-gray-100">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <dt className="text-sm text-gray-500">{row.label}</dt>
            <dd className="text-right text-sm font-medium text-gray-900">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <Button
        type="button"
        onClick={close}
        variant="secondary"
        className="w-full xs:ml-auto xs:w-32"
      >
        Yopish
      </Button>
    </div>
  );
};

export default AttendanceDayModal;
