// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Pencil } from "lucide-react";

// Components
import AttendanceStatusPill from "./AttendanceStatusPill";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";
import { useUpdateAttendanceTimes } from "../queries/attendance.mutations";

// Helpers & utils
import { getWorkedMinutes } from "@/shared/helpers/attendance.helpers";
import {
  formatDateUZ,
  formatDurationShortUZ,
  formatTimeUZ,
} from "@/shared/utils/date.utils";

/** UTC instant → Toshkent "HH:mm" (input qiymati; ekranga emas). */
const toTimeInput = (iso) => {
  if (!iso) return "";
  const tash = new Date(new Date(iso).getTime() + 5 * 3600000);
  return `${String(tash.getUTCHours()).padStart(2, "0")}:${String(
    tash.getUTCMinutes(),
  ).padStart(2, "0")}`;
};

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
  const isStaff = variant === "staff";
  const { can } = usePermissions();
  const canEdit = isStaff && Boolean(user?.id) && can("attendance.mark");

  const [editing, setEditing] = useState(false);
  const [checkInVal, setCheckInVal] = useState(() => toTimeInput(record?.checkIn));
  const [checkOutVal, setCheckOutVal] = useState(() => toTimeInput(record?.checkOut));
  const [saving, setSaving] = useState(false);
  const { mutate: updateTimes } = useUpdateAttendanceTimes();

  if (!record) return null;

  const workedMinutes = getWorkedMinutes(record);

  const saveTimes = () => {
    setSaving(true);
    updateTimes(
      {
        userId: user.id,
        data: {
          date: record.date,
          checkIn: checkInVal || null,
          checkOut: checkOutVal || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Davomat yangilandi");
          close();
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setSaving(false),
      },
    );
  };

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

      {/* Vaqtlarni tahrirlash — xodim uchun. Ketishni o'chirsa xodim yana
          "maktabda" hisoblanadi va bugungi darsga baho qo'yish ochiladi. */}
      {editing ? (
        <div className="space-y-3 rounded-xl border border-gray-100 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">Kelish</p>
              <Input
                type="time"
                value={checkInVal}
                onChange={(e) => setCheckInVal(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">Ketish</p>
              <Input
                type="time"
                value={checkOutVal}
                onChange={(e) => setCheckOutVal(e.target.value)}
              />
            </div>
          </div>

          {checkOutVal && (
            <button
              type="button"
              onClick={() => setCheckOutVal("")}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Ketish vaqtini o'chirish (baho qo'yish ochiladi)
            </button>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setEditing(false)}
              variant="secondary"
              className="flex-1"
            >
              Bekor
            </Button>
            <Button
              type="button"
              onClick={saveTimes}
              loading={saving}
              disabled={saving}
              className="flex-1"
            >
              Saqlash
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          {canEdit && (
            <Button
              type="button"
              onClick={() => setEditing(true)}
              variant="outline"
              className="flex-1"
            >
              <Pencil className="size-4" />
              Vaqtlarni tahrirlash
            </Button>
          )}
          <Button
            type="button"
            onClick={close}
            variant="secondary"
            className={canEdit ? "flex-1" : "w-full xs:ml-auto xs:w-32"}
          >
            Yopish
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceDayModal;
