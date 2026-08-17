// React
import { useEffect, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ChevronLeft, ChevronRight } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import Can from "@/shared/components/guards/Can";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import Switch from "@/shared/components/ui/switch/Switch";
import InputField from "@/shared/components/ui/input/InputField";
import MarkVacationModal from "../components/MarkVacationModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useDeleteVacationMonth,
  useUpdateFinanceSettings,
} from "../queries/finance.mutations";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
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
    maxDiscountPercent,
    depositAutoApply,
    setFields,
    setField,
  } = useObjectState({
    academicStartMonth: "9",
    academicMonthCount: "9",
    invoiceDayOfMonth: 1,
    autoGenerateEnabled: true,
    catchUpMonths: 1,
    firstInvoiceMonth: "",
    maxDiscountPercent: 100,
    depositAutoApply: true,
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
      maxDiscountPercent: settings.maxDiscountPercent,
      depositAutoApply: settings.depositAutoApply,
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
        maxDiscountPercent: Number(maxDiscountPercent),
        depositAutoApply,
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

      {/* Chegirma va depozit qoidalari */}
      <Card title="Chegirma va depozit">
        <p className="mt-1 text-sm text-gray-500">
          Chegirmalar bir o'quvchida yig'ilib ketmasligi va oldindan
          to'langan pul o'z-o'zidan ishlashi uchun.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            min="0"
            max="100"
            type="number"
            name="maxDiscountPercent"
            label="Eng ko'p chegirma (%)"
            value={maxDiscountPercent}
            description="Bir o'quvchidagi foizlar yig'indisi shundan oshmaydi"
            onChange={(e) => setField("maxDiscountPercent", e.target.value)}
          />

          <div className="flex items-center justify-between gap-3 sm:pt-6">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Depozit avtomatik yechilsin
              </p>
              <p className="text-xs text-gray-500">
                Yangi hisob-faktura chiqqanda oldindan to'langan pul o'zi
                ishlatiladi
              </p>
            </div>
            <Switch
              checked={depositAutoApply}
              onChange={(v) => setField("depositAutoApply", v)}
            />
          </div>
        </div>
      </Card>

      {/* Ta'til oylari */}
      <VacationMonths />

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

      <MarkVacationModal />
    </form>
  );
};

/**
 * Ta'til oylari — o'quv yilining oylari grid ko'rinishida.
 *
 * Har bir oy bosilishi mumkin: ta'til bo'lsa olib tashlanadi, bo'lmasa
 * belgilanadi. "Yanvarda o'qimaymiz" qarori shu yerda, bitta bosishda
 * qabul qilinadi — o'sha oyda hech kimga to'lov yozilmaydi.
 *
 * Sozlamalar formasidan TASHQARIDA saqlanadi: bu darhol kuchga kiradigan
 * alohida amal, "Saqlash" tugmasini kutmaydi.
 */
const VacationMonths = () => {
  const { openModal } = useModal();
  const [year, setYear] = useState(null);

  const { data } = useQuery(
    financeQueries.vacationMonths(year != null ? { academicYear: year } : {}),
  );

  const { mutate: deleteVacation } = useDeleteVacationMonth();

  // Server joriy o'quv yilini o'zi tanlaydi — birinchi javobdan olamiz
  const academicYear = year ?? data?.academicYear ?? null;

  const handleToggle = (entry) => {
    if (entry.id) {
      deleteVacation(entry.id, {
        onSuccess: (result) => {
          toast.success(result.message);
          result?.warnings?.forEach((w) => toast.warning(w));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      });
      return;
    }

    openModal("markVacation", { month: entry.month, monthInput: entry.monthLabel });
  };

  return (
    <Card title="Ta'til oylari">
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          Belgilangan oyda hech bir o'quvchiga to'lov yozilmaydi. Bitta
          o'quvchini to'xtatish uchun "Muzlatish" ishlatiladi.
        </p>

        {academicYear != null && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setYear(academicYear - 1)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-24 text-center text-sm font-medium text-gray-900">
              {data?.academicYearLabel ?? "—"}
            </span>

            <button
              type="button"
              onClick={() => setYear(academicYear + 1)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
        {(data?.months ?? []).map((entry) => (
          <Can key={entry.month} do="finance.settings" fallback={<VacationCell entry={entry} />}>
            <button
              type="button"
              onClick={() => handleToggle(entry)}
              className="text-left outline-none"
            >
              <VacationCell entry={entry} interactive />
            </button>
          </Can>
        ))}
      </div>

      {data && (
        <p className="mt-3 text-xs text-gray-500">
          To'lanadigan oylar: {data.billableMonthCount} / {data.academicMonthCount}
        </p>
      )}
    </Card>
  );
};

const VacationCell = ({ entry, interactive = false }) => (
  <div
    className={cn(
      "rounded-xl border px-3 py-2.5 transition-colors",
      entry.isVacation
        ? "border-amber-200 bg-amber-50"
        : "border-gray-100 bg-white",
      interactive && "hover:border-gray-300",
    )}
  >
    <p
      className={cn(
        "text-sm font-medium",
        entry.isVacation ? "text-amber-800" : "text-gray-900",
      )}
    >
      {entry.monthLabel}
    </p>
    <p className="mt-0.5 truncate text-xs text-gray-500">
      {entry.isVacation
        ? entry.title || "Ta'til"
        : `${entry.billableIndex}-to'lov oyi`}
    </p>
  </div>
);

export default FinanceSettingsPage;
