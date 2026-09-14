// Toaster
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// Icons
import { Crosshair, ExternalLink, MapPinOff } from "lucide-react";

// Hooks
import useGeolocation from "@/shared/hooks/useGeolocation";
import useObjectState from "@/shared/hooks/useObjectState";
import { useRoles } from "@/features/roles/queries/roles.queries";
import { attendanceQueries } from "../queries/attendance.queries";
import { useUpdateAttendanceSettings } from "../queries/attendance.mutations";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import Field, { FieldLabel } from "@/shared/components/ui/field/Field";

/**
 * ⚠️ Server bilan AYNI chegara (`attendance.service.js` →
 * `normalizeOfficeRadius`). Ikkalasi QO'LDA sinxron: bu yerda
 * yumshoqroq shart qo'yilsa, foydalanuvchi saqlash tugmasini bosgach
 * tushunarsiz server xatosini olardi.
 */
const MIN_OFFICE_RADIUS = 20;
const MAX_OFFICE_RADIUS = 10000;

const AttendanceSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: settings, isLoading: isFetching } = useQuery(
    attendanceQueries.settings(),
  );

  const { mutate: saveSettings } = useUpdateAttendanceSettings();

  // "Hozirgi joylashuvni olish" uchun — xodimlar ishlatadigan AYNI hook,
  // shuning uchun admin kiritgan nuqta ular o'lchaydigan nuqta bilan
  // bir xil manbadan chiqadi.
  const {
    request: requestLocation,
    loading: gpsLoading,
    error: gpsError,
  } = useGeolocation();

  const { data: allRoles = [] } = useRoles();
  const roles = allRoles.filter(
    (r) => r.value !== "owner" && r.value !== "student",
  );

  const { state, setField, setFields } = useObjectState({
    officeLat: "",
    officeLng: "",
    officeRadius: 100,
    lateArrivalPenaltyPoints: 1,
    lateArrivalGraceMinutes: 10,
    earlyDeparturePenaltyPoints: 1,
    earlyDepartureGraceMinutes: 10,
    absentPenaltyPoints: 2,
    penaltyPaused: false,
    pausedRoles: [],
    pausedUsers: [],
  });

  useEffect(() => {
    if (!settings) return;
    setFields({
      officeLat: settings.officeLocation?.lat || "",
      officeLng: settings.officeLocation?.lng || "",
      officeRadius: settings.officeRadius || 100,
      lateArrivalPenaltyPoints: settings.lateArrivalPenaltyPoints ?? 1,
      lateArrivalGraceMinutes: settings.lateArrivalGraceMinutes ?? 10,
      earlyDeparturePenaltyPoints: settings.earlyDeparturePenaltyPoints ?? 1,
      earlyDepartureGraceMinutes: settings.earlyDepartureGraceMinutes ?? 10,
      absentPenaltyPoints: settings.absentPenaltyPoints ?? 2,
      penaltyPaused: settings.penaltyPaused || false,
      pausedRoles: settings.pausedRoles || [],
      pausedUsers: settings.pausedUsers || [],
    });
  }, [settings]);

  const togglePausedRole = (roleValue) => {
    const current = state.pausedRoles || [];
    setField(
      "pausedRoles",
      current.includes(roleValue)
        ? current.filter((r) => r !== roleValue)
        : [...current, roleValue],
    );
  };

  /**
   * Hozirgi joylashuvni maydonlarga qo'yadi.
   *
   * ⚠️ Ilgari koordinata faqat QO'LDA terilardi: bitta raqam adashsa
   * ofis bir necha kilometr nariga ko'chib ketardi va buni hech kim
   * sezmasdi — xodimlar esa har kuni "ofisdan tashqarida" bo'lib
   * qolaverardi.
   */
  const handleUseCurrentLocation = async () => {
    const location = await requestLocation();

    if (!location) {
      toast.error(gpsError || "Joylashuv aniqlanmadi");
      return;
    }

    setFields({
      officeLat: location.lat.toFixed(6),
      officeLng: location.lng.toFixed(6),
    });
    toast.success(`Joylashuv olindi (±${Math.round(location.accuracy)} m)`);
  };

  /**
   * Ofis koordinatasini tekshiradi.
   *
   * Bo'sh qoldirish — XATO EMAS: bu "geotekshiruv kerak emas" degan
   * ataylab qilingan tanlov. Lekin YARIM to'ldirilgani xato: ilgari
   * bunday holatda tekshiruv jimgina o'chib qolardi.
   *
   * @returns {{ok: true, officeLocation: object|null}|{ok: false, message: string}}
   */
  const validateOfficeLocation = () => {
    const lat = String(state.officeLat ?? "").trim();
    const lng = String(state.officeLng ?? "").trim();

    if (!lat && !lng) return { ok: true, officeLocation: null };
    if (!lat || !lng) {
      return {
        ok: false,
        message: "Kenglik va uzunlik birga to'ldiriladi (yoki ikkalasi bo'sh)",
      };
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
      return { ok: false, message: "Kenglik −90 dan 90 gacha bo'lishi kerak" };
    }
    if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
      return { ok: false, message: "Uzunlik −180 dan 180 gacha bo'lishi kerak" };
    }

    return { ok: true, officeLocation: { lat: latNum, lng: lngNum } };
  };

  const handleSave = (e) => {
    e.preventDefault();

    const office = validateOfficeLocation();
    if (!office.ok) return toast.error(office.message);

    const radius = Number(state.officeRadius);
    if (
      !Number.isFinite(radius) ||
      radius < MIN_OFFICE_RADIUS ||
      radius > MAX_OFFICE_RADIUS
    ) {
      return toast.error(
        `Hudud radiusi ${MIN_OFFICE_RADIUS}–${MAX_OFFICE_RADIUS} metr oralig'ida bo'lishi kerak`,
      );
    }

    setIsLoading(true);

    const data = {
      officeLocation: office.officeLocation,
      officeRadius: radius,
      lateArrivalPenaltyPoints: Number(state.lateArrivalPenaltyPoints),
      lateArrivalGraceMinutes: Number(state.lateArrivalGraceMinutes),
      earlyDeparturePenaltyPoints: Number(state.earlyDeparturePenaltyPoints),
      earlyDepartureGraceMinutes: Number(state.earlyDepartureGraceMinutes),
      absentPenaltyPoints: Number(state.absentPenaltyPoints),
      penaltyPaused: state.penaltyPaused,
      pausedRoles: state.pausedRoles,
      pausedUsers: state.pausedUsers,
    };

    saveSettings(data, {
      onSuccess: () => toast.success("Sozlamalar saqlandi"),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  if (isFetching) {
    return <div className="py-8 text-center">Yuklanmoqda...</div>;
  }

  const hasOfficeLocation =
    String(state.officeLat ?? "").trim() !== "" &&
    String(state.officeLng ?? "").trim() !== "";

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Location */}
          <Card title="Ofis joylashuvi" className="space-y-4 md:col-span-2">
            {/* ⚠️ Ofis belgilanmagani JIM QOLMAYDI: bu holatda xodim
                qayerda turib qayd etsa ham tekshiruv bo'lmaydi va ilgari
                buni hech kim bilmasdi. */}
            {!hasOfficeLocation && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <MapPinOff className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                <p>
                  Ofis joylashuvi belgilanmagan — hozir qayd etish joyi
                  <b> tekshirilmaydi</b>. Quyidagi tugma bilan ofisda turib
                  koordinatani oling.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={gpsLoading}
                onClick={handleUseCurrentLocation}
              >
                <Crosshair strokeWidth={1.5} />
                {gpsLoading ? "Aniqlanmoqda..." : "Hozirgi joylashuvni olish"}
              </Button>

              {hasOfficeLocation && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  href={`https://www.google.com/maps?q=${state.officeLat},${state.officeLng}`}
                >
                  <ExternalLink className="size-4" strokeWidth={1.5} />
                  Xaritada tekshirish
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                type="number"
                step="any"
                placeholder="41.311081"
                value={state.officeLat}
                label="Kenglik (Latitude)"
                onChange={(e) => setField("officeLat", e.target.value)}
              />

              <InputField
                type="number"
                step="any"
                placeholder="69.240562"
                value={state.officeLng}
                label="Uzunlik (Longitude)"
                onChange={(e) => setField("officeLng", e.target.value)}
              />
            </div>

            <InputField
              type="number"
              placeholder="100"
              min={MIN_OFFICE_RADIUS}
              max={MAX_OFFICE_RADIUS}
              value={state.officeRadius}
              label="Hudud radiusi (metr)"
              onChange={(e) => setField("officeRadius", e.target.value)}
              description={`${MIN_OFFICE_RADIUS}–${MAX_OFFICE_RADIUS} metr. Telefon GPS'i shahar sharoitida odatda ±20–50 metr xato beradi — radius bino o'lchamiga yaqin bo'lgani ma'qul.`}
            />
          </Card>

          {/* Late Arrival */}
          <Card title="Kech kelish jarimasi" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                type="number"
                label="Jarima balli"
                value={state.lateArrivalPenaltyPoints}
                onChange={(e) =>
                  setField("lateArrivalPenaltyPoints", e.target.value)
                }
                min={0}
              />
              <InputField
                type="number"
                label="Vaqt chegarasi (daqiqa)"
                value={state.lateArrivalGraceMinutes}
                onChange={(e) =>
                  setField("lateArrivalGraceMinutes", e.target.value)
                }
                min={0}
              />
            </div>
          </Card>

          {/* Early Departure */}
          <Card title="Erta ketish jarimasi" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                type="number"
                label="Jarima balli"
                value={state.earlyDeparturePenaltyPoints}
                onChange={(e) =>
                  setField("earlyDeparturePenaltyPoints", e.target.value)
                }
                min={0}
              />
              <InputField
                type="number"
                label="Vaqt chegarasi (daqiqa)"
                value={state.earlyDepartureGraceMinutes}
                onChange={(e) =>
                  setField("earlyDepartureGraceMinutes", e.target.value)
                }
                min={0}
              />
            </div>
          </Card>

          {/* Attendance */}
          <Card title="Kelmaganlik jarimasi" className="space-y-4">
            <InputField
              type="number"
              label="Jarima balli (kun uchun)"
              value={state.absentPenaltyPoints}
              onChange={(e) => setField("absentPenaltyPoints", e.target.value)}
              min={0}
            />
          </Card>

          {/* Penalty Pause */}
          <Card title="Jarimani to'xtatish" className="space-y-4">
            <Field
              className="flex-row"
              htmlFor="penaltyPaused"
              label="Barcha davomat jarimalarini to'xtatib turish"
            >
              <Switch
                id="penaltyPaused"
                checked={state.penaltyPaused}
                onChange={(v) => setField("penaltyPaused", v)}
              />
            </Field>

            {/* By role */}
            {!state.penaltyPaused && (
              <>
                <hr />
                <div className="grid grid-cols-2 gap-4 max-w-96">
                  {roles.map((role) => {
                    const id = `penaltyPaused-${role.value}`;
                    const isPaused = state.pausedRoles?.includes(role.value);

                    return (
                      <>
                        <FieldLabel htmlFor={id}>{role.name}</FieldLabel>
                        <Switch
                          id={id}
                          checked={isPaused}
                          onCheckedChange={(v) => togglePausedRole(role.value)}
                        />
                      </>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Submit button */}
        <Button disabled={isLoading}>Saqlash{isLoading && "..."}</Button>
      </form>
    </div>
  );
};

export default AttendanceSettingsPage;
