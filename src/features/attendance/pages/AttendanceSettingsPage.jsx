import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

import { attendanceAPI } from "../api/attendance.api";
import OfficeLocationPicker from "../components/OfficeLocationPicker";

const AttendanceSettingsPage = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: settings, isLoading: isFetching } = useQuery({
    queryKey: ["attendance", "settings"],
    queryFn: () => attendanceAPI.getSettings().then((r) => r.data.data),
  });

  const { getCollectionData: getRoles } = useArrayStore("roles");
  const roles = getRoles().filter((r) => r.value !== "owner" && r.value !== "student");

  const {
    state,
    setField,
    setFields,
  } = useObjectState({
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
        : [...current, roleValue]
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
    <div>
      <h1 className="page-title mb-6">Davomat sozlamalari</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Ofis joylashuvi */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Ofis joylashuvi</h2>
          <OfficeLocationPicker
            lat={state.officeLat}
            lng={state.officeLng}
            radius={state.officeRadius}
            onLatChange={(v) => setField("officeLat", v)}
            onLngChange={(v) => setField("officeLng", v)}
            onRadiusChange={(v) => setField("officeRadius", v)}
          />
        </Card>

        {/* Kech kelish */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Kech kelish jarimasi</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Jarima balli"
              value={state.lateArrivalPenaltyPoints}
              onChange={(v) => setField("lateArrivalPenaltyPoints", v)}
              min={0}
            />
            <Input
              type="number"
              label="Vaqt chegarasi (daqiqa)"
              value={state.lateArrivalGraceMinutes}
              onChange={(v) => setField("lateArrivalGraceMinutes", v)}
              min={0}
            />
          </div>
        </Card>

        {/* Erta ketish */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Erta ketish jarimasi</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Jarima balli"
              value={state.earlyDeparturePenaltyPoints}
              onChange={(v) => setField("earlyDeparturePenaltyPoints", v)}
              min={0}
            />
            <Input
              type="number"
              label="Vaqt chegarasi (daqiqa)"
              value={state.earlyDepartureGraceMinutes}
              onChange={(v) => setField("earlyDepartureGraceMinutes", v)}
              min={0}
            />
          </div>
        </Card>

        {/* Davomatsizlik */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Davomatsizlik jarimasi</h2>
          <Input
            type="number"
            label="Jarima balli (kun uchun)"
            value={state.absentPenaltyPoints}
            onChange={(v) => setField("absentPenaltyPoints", v)}
            min={0}
          />
        </Card>

        {/* Jarima pauza */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Jarima pauza</h2>

          {/* Global pauza */}
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={state.penaltyPaused}
              onChange={(e) => setField("penaltyPaused", e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700">
              Barcha davomat jarimalarini to'xtatib turish
            </span>
          </label>

          {/* Rollar bo'yicha pauza */}
          <p className="text-sm text-gray-600 mb-2">Rollar bo'yicha pauza:</p>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => {
              const isPaused = state.pausedRoles?.includes(role.value);
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => togglePausedRole(role.value)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    isPaused
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {role.name}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={isLoading} className="px-6">
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettingsPage;
