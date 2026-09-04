// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import Switch from "@/shared/components/ui/switch/Switch";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { inventoryQueries } from "../queries/inventory.queries";
import { useUpdateInventorySettings } from "../queries/inventory.mutations";

/**
 * INVENTAR SOZLAMALARI.
 *
 * ⚠️ Eslatma vaqti CRON IFODASIDA EMAS, bazada: job har 15 daqiqada
 * uyg'onadi va vaqtni bazadan o'qiydi. Aks holda vaqtni o'zgartirish
 * uchun serverni qayta ishga tushirish kerak bo'lardi.
 */
const SettingsPage = () => {
  const { data: settings, isLoading } = useQuery(inventoryQueries.settings());

  if (isLoading) {
    return <Card className="py-10 text-center text-gray-500">Yuklanmoqda...</Card>;
  }
  if (!settings) return null;

  /**
   * ⚠️ `key` — sozlamalar serverdan kelgach forma bir marta quriladi.
   * `useEffect` ichida sinxronlash kaskadli render hosil qilardi
   * (`CheckDetailPage` dagi bilan bir xil mulohaza).
   */
  return <SettingsForm key={settings.updatedAt ?? "initial"} settings={settings} />;
};

const SettingsForm = ({ settings }) => {
  const { data: accounts = [] } = useQuery(inventoryQueries.paymentAccounts());
  const { mutate: updateSettings, isPending } = useUpdateInventorySettings();

  const {
    dailyCheckEnabled,
    reminderEnabled,
    reminderTime,
    requirePhoto,
    defaultAccountId,
    setField,
  } = useObjectState({
    dailyCheckEnabled: settings.dailyCheckEnabled,
    reminderEnabled: settings.reminderEnabled,
    reminderTime: settings.reminderTime,
    requirePhoto: settings.requirePhoto,
    defaultAccountId: settings.defaultAccountId ?? "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    updateSettings(
      {
        dailyCheckEnabled,
        reminderEnabled,
        reminderTime,
        requirePhoto,
        defaultAccountId: defaultAccountId || null,
      },
      {
        onSuccess: () => toast.success("Sozlamalar saqlandi"),
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <h2 className="font-semibold text-gray-900">Kunlik monitoring</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Mas'ul shaxs har kuni o'z xonasidagi jihozlar holatini kiritib yuboradi.
        </p>

        <div className="mt-4 space-y-4">
          <SettingRow
            label="Kunlik hisobot yoqilgan"
            hint="O'chirilsa eslatma ketmaydi va 'hisobot bermagan xonalar' kesimi hisoblanmaydi."
          >
            <Switch
              checked={dailyCheckEnabled}
              onChange={(v) => setField("dailyCheckEnabled", v)}
            />
          </SettingRow>

          <SettingRow
            label="Telegram eslatmasi"
            hint="Belgilangan vaqtdan keyin hisobot bermagan xonalarning mas'ullariga xabar ketadi."
          >
            <Switch
              checked={reminderEnabled}
              disabled={!dailyCheckEnabled}
              onChange={(v) => setField("reminderEnabled", v)}
            />
          </SettingRow>

          <InputField
            type="time"
            name="reminderTime"
            label="Eslatma vaqti"
            value={reminderTime}
            disabled={!reminderEnabled}
            description="Toshkent vaqti bilan. Vaqt bazadan o'qiladi — serverni qayta ishga tushirish shart emas."
            onChange={(e) => setField("reminderTime", e.target.value)}
            className="max-w-xs"
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900">Zarar va undiruv</h2>

        <div className="mt-4 space-y-4">
          <SettingRow
            label="Zararga rasm majburiy"
            hint="Yoqilsa, rasmsiz zarar qayd etilmaydi. Oshxonada kuniga bir necha piyola sinishi mumkin — bunday holatda o'chirib qo'yish maqsadga muvofiq."
          >
            <Switch
              checked={requirePhoto}
              onChange={(v) => setField("requirePhoto", v)}
            />
          </SettingRow>

          <div className="max-w-xs space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Standart to'lov turi</p>
            <Select
              value={defaultAccountId}
              placeholder="Tanlanmagan"
              onChange={(v) => setField("defaultAccountId", v)}
              options={[
                { label: "Tanlanmagan", value: "" },
                ...accounts.map((a) => ({ label: a.name, value: a.id })),
              ]}
            />
            <p className="text-xs text-gray-500">
              Undiruv oynasida oldindan tanlab qo'yiladi — kassirning ishini qisqartiradi.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          Saqlash
        </Button>
      </div>
    </form>
  );
};

const SettingRow = ({ label, hint, children }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
    <div className="shrink-0 pt-0.5">{children}</div>
  </div>
);

export default SettingsPage;
