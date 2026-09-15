// Toaster
import { toast } from "sonner";

// React
import { useEffect, useRef, useState } from "react";

// Icons
import { LogIn, LogOut, MapPinOff } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDurationShortUz, formatTimeUz } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import GeolocationStatus from "./GeolocationStatus";
import Button from "@/shared/components/ui/button/Button";
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import AttendanceStatusPill from "@/features/attendance/components/AttendanceStatusPill";

// Data
import {
  LOCATION_STATUS_LABELS,
  worstLocationStatus,
} from "@/features/attendance/data/attendance.data";

// Hooks
import useGeolocation from "@/shared/hooks/useGeolocation";

// Queries
import { myAttendanceQueries } from "../queries/myAttendance.queries";
import { useCheckIn, useCheckOut } from "../queries/myAttendance.mutations";

/** Ketganlikni qayd etishdan oldingi eng qisqa ish vaqti (daqiqa). */
const MIN_MINUTES_BEFORE_CHECKOUT = 5;

/**
 * O'ZINI DAVOMATDAN O'TKAZISH.
 *
 * ⚠️ Bu karta RUXSAT ORTIDA TURMAYDI. `attendance.view` — boshqalarning
 * davomatini ko'rish huquqi; o'zining kelgan-ketganini qayd etish esa
 * har qanday xodimning ishi va uni ruxsat bilan bog'lash "rahbarga
 * davomat ko'rinmaydi" degan holatning aynan sababi edi.
 *
 * @param {object} props
 * @param {boolean} [props.showTitle] - kartaning o'z sarlavhasi kerakmi
 */
const CheckInOutCard = ({ showTitle = true }) => {
  const { data: today, isLoading } = useQuery(myAttendanceQueries.today());
  const { data: schedule } = useQuery(myAttendanceQueries.schedule());

  // ⚠️ `auto` — joylashuv oldindan aniqlanadi, lekin FAQAT ruxsat
  // allaqachon berilgan bo'lsa. Ruxsat hali so'ralmagan qurilmada oyna
  // odam tugmani bosganda chiqadi (`useGeolocation` sarlavhasidagi sabab:
  // javobsiz qolgan oynalar Chrome'da saytni jimgina bloklaydi).
  const {
    accuracy,
    error: gpsError,
    loading: gpsLoading,
    permission: gpsPermission,
    request: requestLocation,
  } = useGeolocation({ auto: true });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  // ⚠️ JOYLASHUV KUTILAYOTGAN PAYT HAM tugma yopiq. So'rov hali serverga
  // ketmagan (mutatsiya `isPending` emas) — ikkinchi bosish ikkinchi
  // qaydni yuborib, "allaqachon qayd etilgan" xatosini chiqarardi.
  // Ref — bitta kadr ichidagi ikki bosish holatni ko'rmasdan o'tib ketmasin.
  const [locating, setLocating] = useState(false);
  const locatingRef = useRef(false);
  const isBusy = locating || checkInMutation.isPending || checkOutMutation.isPending;

  // "Men ketdim" tugmasi vaqt bilan ochiladi — sekundni jonli sanaymiz.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedIn = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);

  const secondsSinceCheckIn = hasCheckedIn
    ? (now - new Date(today.checkIn).getTime()) / 1000
    : 0;
  const remainingSeconds = Math.max(
    0,
    Math.ceil(MIN_MINUTES_BEFORE_CHECKOUT * 60 - secondsSinceCheckIn),
  );
  const canCheckOut = remainingSeconds === 0;

  /** Qayd etish — joylashuv olinmasa ham davom etadi (server ixtiyoriy). */
  const submit = async (mutation, successMessage) => {
    if (locatingRef.current || mutation.isPending) return;

    locatingRef.current = true;
    setLocating(true);
    let location = null;
    try {
      location = await requestLocation();
    } finally {
      locatingRef.current = false;
      setLocating(false);
    }

    mutation.mutate(location || {}, {
      onSuccess: () =>
        toast.success(
          location ? successMessage : `${successMessage} — joylashuvsiz`,
        ),
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Xatolik yuz berdi"),
    });
  };

  return (
    <Card className="space-y-4" title={showTitle ? "Bugungi davomatim" : ""}>
      {/* Ish vaqti — nimaga nisbatan "kech" ekani shu yerdan o'qiladi */}
      <ScheduleNote schedule={schedule} />

      {/* Holat */}
      <div className="flex flex-wrap items-center gap-2">
        {isLoading ? (
          <span className="text-sm text-gray-400">Yuklanmoqda...</span>
        ) : today ? (
          <AttendanceStatusPill
            status={today.status}
            lateMinutes={today.lateMinutes}
          />
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
            Bugun hali qayd etilmagan
          </span>
        )}

        {/* ⚠️ Sabab OCHIQ aytiladi: "ofisdan tashqarida" va "joylashuv
            berilmagan" ikki xil holat — xodim qaysi biri ekanini bilsagina
            uni tuzata oladi. */}
        {today?.locationWarning && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
            <MapPinOff className="size-3.5" strokeWidth={2} />
            {LOCATION_STATUS_LABELS[worstLocationStatus(today)] ||
              "Ofisdan tashqarida qayd etilgan"}
          </span>
        )}
      </div>

      {/* Vaqtlar */}
      <div className="grid grid-cols-2 gap-3">
        <TimeBox label="Keldim" value={today?.checkIn} />
        <TimeBox label="Ketdim" value={today?.checkOut} />
      </div>

      <GeolocationStatus
        accuracy={accuracy}
        error={gpsError}
        loading={gpsLoading}
        permission={gpsPermission}
        onRequest={requestLocation}
      />

      {/* Amal */}
      {!hasCheckedIn && (
        <Button
          disabled={isBusy}
          className="w-full"
          onClick={() => submit(checkInMutation, "Kelganligingiz qayd etildi")}
        >
          <LogIn strokeWidth={1.5} />
          Men keldim{(locating || checkInMutation.isPending) && "..."}
        </Button>
      )}

      {hasCheckedIn && !hasCheckedOut && (
        <ConfirmPopover
          danger
          title="Ketganlikni qayd etamizmi?"
          confirmLabel="Ha, ketdim"
          description="Qayd etilgandan keyin uni o'zgartirib bo'lmaydi — davomat daftari faqat qo'shimcha yozuv qabul qiladi."
          onConfirm={() => submit(checkOutMutation, "Ketganligingiz qayd etildi")}
        >
          <Button variant="danger" className="w-full" disabled={isBusy || !canCheckOut}>
            <LogOut strokeWidth={1.5} />
            {canCheckOut
              ? `Men ketdim${locating || checkOutMutation.isPending ? "..." : ""}`
              : `Men ketdim (${formatCountdown(remainingSeconds)})`}
          </Button>
        </ConfirmPopover>
      )}

      {hasCheckedIn && hasCheckedOut && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
          Bugungi davomatingiz to'liq qayd etildi
        </p>
      )}

      {/* Ogohlantirishlar */}
      {today?.isLate && today?.lateMinutes > 0 && (
        <p className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          {formatDurationShortUz(today.lateMinutes)} kech keldingiz
        </p>
      )}

      {today?.isEarlyOut && today?.earlyOutMinutes > 0 && (
        <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700">
          {formatDurationShortUz(today.earlyOutMinutes)} erta ketdingiz
        </p>
      )}
    </Card>
  );
};

/** `mm:ss` — tugma ochilishigacha qolgan vaqt. */
const formatCountdown = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Kelgan/ketgan vaqt katakchasi. */
const TimeBox = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-4 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p
      className={cn(
        "mt-1 text-2xl font-semibold",
        value ? "text-gray-900" : "text-gray-300",
      )}
    >
      {formatTimeUz(value, "--:--")}
    </p>
  </div>
);

/**
 * Bugungi ish vaqti.
 *
 * ⚠️ Dars jadvalidan ishlaydigan xodimda vaqt yo'qligi "sozlanmagan" EMAS,
 * "bugun dars yo'q" degani. Ikkalasi bir xil matn bilan chiqsa, o'qituvchi
 * ish vaqtim yo'qolibdi deb o'ylardi (`education.md` §8).
 */
const ScheduleNote = ({ schedule }) => {
  if (!schedule) return null;

  const { workStartTime, workEndTime, isWorkDayToday, source, scheduleMissing } =
    schedule;

  let text;
  if (workStartTime && workEndTime) {
    text = `Bugungi ish vaqtingiz: ${workStartTime} — ${workEndTime}`;
  } else if (source === "schedule") {
    text = scheduleMissing
      ? "Dars jadvalida darsingiz yo'q — ish vaqti aniqlanmagan"
      : "Bugun darsingiz yo'q";
  } else {
    text = "Ish vaqtingiz belgilanmagan — kechikish hisoblanmaydi";
  }

  return (
    <div className="rounded-xl bg-blue-50 px-4 py-3">
      <p className="text-sm text-blue-900">{text}</p>

      {workStartTime && workEndTime && (
        <p className="mt-0.5 text-xs text-blue-700">
          {isWorkDayToday ? "Bugun ish kuni" : "Bugun dam olish kuni"}
          {source === "schedule" && " · dars jadvalingiz bo'yicha"}
        </p>
      )}
    </div>
  );
};

export default CheckInOutCard;
