// React
import { useEffect } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateFinanceSettings } from "../queries/finance.mutations";

// Utils & helpers
import { formatDateUZ } from "@/shared/utils/date.utils";
import {
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {
  ACADEMIC_MONTH_COUNT_OPTIONS,
  MONTH_OF_YEAR_OPTIONS,
} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";

const FinanceSettingsPage = () => {
  const { data: settings, isLoading } = useQuery(financeQueries.settings());
  const { mutate: updateSettings } = useUpdateFinanceSettings();

  const {
    academicStartMonth,
    academicMonthCount,
    invoiceDayOfMonth,
    autoGenerateEnabled,
    catchUpMonths,
    firstInvoiceMonth,
    setFields,
    setField,
  } = useObjectState({
    academicStartMonth: "9",
    academicMonthCount: "9",
    invoiceDayOfMonth: 1,
    autoGenerateEnabled: true,
    catchUpMonths: 1,
    firstInvoiceMonth: "",
  });

  // Server javobi kelgach formani to'ldiramiz
  useEffect(() => {
    if (!settings) return;
    setFields({
      academicStartMonth: String(settings.academicStartMonth),
      academicMonthCount: String(settings.academicMonthCount),
      invoiceDayOfMonth: settings.invoiceDayOfMonth,
      autoGenerateEnabled: settings.autoGenerateEnabled,
      catchUpMonths: settings.catchUpMonths,
      firstInvoiceMonth: monthKeyToInputValue(settings.firstInvoiceMonth),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();

    updateSettings(
      {
        academicStartMonth: Number(academicStartMonth),
        academicMonthCount: Number(academicMonthCount),
        invoiceDayOfMonth: Number(invoiceDayOfMonth),
        autoGenerateEnabled,
        catchUpMonths: Number(catchUpMonths),
        firstInvoiceMonth: inputValueToMonthKey(firstInvoiceMonth),
      },
      {
        onSuccess: (result) => {
          toast.success("Sozlamalar saqlandi");
          // Akademik davr o'zgargan bo'lsa server ogohlantiradi
          result?.warnings?.forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      },
    );
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      {/* O'quv yili */}
      <Card title="O'quv yili">
        <p className="mt-1 text-sm text-gray-500">
          Butun maktab uchun bitta davr. Majburiyat faqat shu oylarda
          shakllanadi — yozgi tanaffusda hisoblanmaydi.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Boshlanish oyi</p>
            <Select
              value={academicStartMonth}
              options={MONTH_OF_YEAR_OPTIONS}
              onChange={(v) => setField("academicStartMonth", v)}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Davomiyligi</p>
            <Select
              value={academicMonthCount}
              options={ACADEMIC_MONTH_COUNT_OPTIONS}
              onChange={(v) => setField("academicMonthCount", v)}
            />
          </div>
        </div>

        {settings?.current && (
          <p className="mt-3 text-xs text-gray-500">
            Joriy oy ({settings.current.monthLabel}):{" "}
            {settings.current.isAcademicMonth
              ? `${settings.current.academicYearLabel} o'quv yilining ${settings.current.academicIndex}-oyi`
              : "akademik oy emas"}
          </p>
        )}
      </Card>

      {/* Avtomatik shakllantirish */}
      <Card title="Avtomatik shakllantirish">
        <p className="mt-1 text-sm text-gray-500">
          Belgilangan kundan boshlab har kuni tekshiriladi. Server o'sha kuni
          o'chiq bo'lsa, keyingi kuni baribir shakllantiriladi.
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Yoqilgan</p>
            <p className="text-xs text-gray-500">
              O'chirilsa, majburiyat faqat qo'lda shakllantiriladi
            </p>
          </div>
          <Switch
            checked={autoGenerateEnabled}
            onChange={(v) => setField("autoGenerateEnabled", v)}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputField
            min="1"
            max="28"
            type="number"
            name="invoiceDayOfMonth"
            label="Oyning nechanchi kuni"
            value={invoiceDayOfMonth}
            description="1–28 (fevralda ham ishlashi uchun)"
            onChange={(e) => setField("invoiceDayOfMonth", e.target.value)}
          />

          <InputField
            min="0"
            max="12"
            type="number"
            name="catchUpMonths"
            label="Orqaga qaytish"
            value={catchUpMonths}
            description="Necha oy orqaga qayta urinilsin"
            onChange={(e) => setField("catchUpMonths", e.target.value)}
          />

          <InputField
            type="month"
            name="firstInvoiceMonth"
            label="Birinchi hisob-faktura oyi"
            value={firstInvoiceMonth}
            description="Bundan oldin hech qachon yaralmaydi"
            onChange={(e) => setField("firstInvoiceMonth", e.target.value)}
          />
        </div>

        {settings?.lastRunAt && (
          <p className="mt-3 text-xs text-gray-500">
            Oxirgi ishga tushish: {formatDateUZ(settings.lastRunAt)}
            {settings.lastGeneratedMonth
              ? ` · ${formatMonthKey(settings.lastGeneratedMonth)}`
              : ""}
          </p>
        )}
      </Card>

      <div className="flex justify-end">
        <Can
          do="finance.settings"
          fallback={
            <p className="text-sm text-gray-500">
              Sozlamalarni o'zgartirish uchun ruxsatingiz yo'q
            </p>
          }
        >
          <Button className="w-full xs:w-40">Saqlash</Button>
        </Can>
      </div>
    </form>
  );
};

export default FinanceSettingsPage;
