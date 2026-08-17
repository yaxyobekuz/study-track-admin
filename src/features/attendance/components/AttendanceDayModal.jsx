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
        value:
          user?.workStartTime && user?.workEndTime
            ? `${user.workStartTime} — ${user.workEndTime}`
            : "Rol bo'yicha",
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

  // Katalogdan tanlangan sabab va erkin izoh — ikki xil narsa
  rows.push({
    label: "Sabab",
    value: record.absenceReason?.title ?? "Ko'rsatilmagan",
  });

  if (record.excuseReason) {
    rows.push({ label: "Izoh", value: record.excuseReason });
  }

  rows.push({
    label: "Qayd etilgan",
    value: record.autoMarked ? "Avtomatik" : "Qo'lda",
  });

  if (isStaff && (record.outOfOffice || record.locationWarning)) {
    rows.push({
      label: "Joylashuv",
      value: (
        <span className="text-amber-700">
          {record.outOfOffice ? "Ofisdan tashqarida" : "Ogohlantirish bor"}
        </span>
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
