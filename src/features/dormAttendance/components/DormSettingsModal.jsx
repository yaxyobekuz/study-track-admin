// React
import { useState } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Toast
import { toast } from "sonner";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Queries
import { dormAttendanceQueries } from "../queries/dormAttendance.queries";
import { useUpdateDormSettings } from "../queries/dormAttendance.mutations";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * YOTOQXONA DAVOMATI SOZLAMASI — davomat qaysi vaqtdan boshlanadi.
 *
 * ⚠️ Vaqt SOZLAMADA, kodda emas: 16:00 — maktabning hozirgi tartibi,
 * qoida emas. Kodga qotirilsa, tartib o'zgarganda relizni kutish kerak
 * bo'lardi.
 *
 * ⚠️ Vaqtdan OLDIN belgilashni server rad etadi (`resolveMarkGate`),
 * ma'muriyat (`dormAttendance.update`) esa darvozadan ozod — shuning uchun
 * oyna "kimga ta'sir qiladi" degan savolga ham javob beradi.
 */
const DormSettingsModal = () => (
  <ResponsiveModal
    name="dormAttendanceSettings"
    title="Yotoqxona davomati sozlamalari"
    description="Davomat belgilash qaysi vaqtdan boshlanadi"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { data: settings, isLoading: loading } = useQuery(
    dormAttendanceQueries.settings(),
  );
  const { mutateAsync: save } = useUpdateDormSettings();

  const [value, setValue] = useState(null);
  const startTime = value ?? settings?.startTime ?? "16:00";
  const valid = TIME_RE.test(startTime);

  const handleSave = async () => {
    if (!valid || isLoading) return;
    setIsLoading(true);

    try {
      await save({ startTime });
      toast.success(`Davomat soat ${startTime} dan boshlanadi`);
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sozlamani saqlab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="dormStartTime" className="text-sm font-medium text-gray-700">
          Boshlanish vaqti (Toshkent)
        </label>
        <input
          id="dormStartTime"
          type="time"
          value={startTime}
          disabled={loading}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-2 outline-primary"
        />
        {!valid && (
          <p className="text-xs text-red-600">Vaqtni HH:mm ko&apos;rinishida kiriting</p>
        )}
      </div>

      <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-500">
        Tarbiyachi shu vaqtdan oldin davomat belgilay olmaydi. Ma&apos;muriyat
        (&quot;O&apos;tgan kunni to&apos;g&apos;rilash&quot; ruxsati bor xodim)
        istalgan vaqtda belgilaydi.
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => close()} disabled={isLoading}>
          Bekor qilish
        </Button>
        <Button onClick={handleSave} disabled={!valid || isLoading || loading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </div>
  );
};

export default DormSettingsModal;
