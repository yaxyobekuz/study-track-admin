// Toaster
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";

// API
import { attendanceAPI } from "../api/attendance.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import Field, { FieldLabel } from "@/shared/components/ui/field/Field";

const AttendanceSettingsPage = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: settings, isLoading: isFetching } = useQuery({
    queryKey: ["attendance", "settings"],
    queryFn: () => attendanceAPI.getSettings().then((r) => r.data.data),
  });

  const { getCollectionData: getRoles } = useArrayStore("roles");
  const roles = getRoles().filter(
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

  const handleSave = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      officeLocation: {
        lat: parseFloat(state.officeLat) || null,
        lng: parseFloat(state.officeLng) || null,
      },
      officeRadius: Number(state.officeRadius),
      lateArrivalPenaltyPoints: Number(state.lateArrivalPenaltyPoints),
      lateArrivalGraceMinutes: Number(state.lateArrivalGraceMinutes),
      earlyDeparturePenaltyPoints: Number(state.earlyDeparturePenaltyPoints),
      earlyDepartureGraceMinutes: Number(state.earlyDepartureGraceMinutes),
      absentPenaltyPoints: Number(state.absentPenaltyPoints),
      penaltyPaused: state.penaltyPaused,
      pausedRoles: state.pausedRoles,
      pausedUsers: state.pausedUsers,
    };

    attendanceAPI
      .updateSettings(data)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["attendance", "settings"] });
        toast.success("Sozlamalar saqlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  if (isFetching) {
    return <div className="py-8 text-center">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">Davomat sozlamalari</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Location */}
          <Card title="Ofis joylashuvi" className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                type="number"
                placeholder="12.345678"
                value={state.officeLat}
                label="Kenglik (Latitude)"
                onChange={(e) => setField("officeLat", e.target.value)}
              />

              <InputField
                type="number"
                placeholder="12.345678"
                value={state.officeLng}
                label="Uzunlik (Longitude)"
                onChange={(e) => setField("officeLng", e.target.value)}
              />
            </div>

            <InputField
              type="number"
              placeholder="100"
              value={state.officeRadius}
              label="Hudud radiusi (metr)"
              onChange={(e) => setField("officeRadius", e.target.value)}
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
