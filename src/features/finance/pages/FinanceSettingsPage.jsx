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
import ConfirmPopover from "@/shared/components/ui/ConfirmPopover";
import MarkVacationModal from "../components/MarkVacationModal";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useObjectState from "@/shared/hooks/useObjectState";
import {
  useApplyDefaultTariff,
  useDeleteVacationMonth,
  useUpdateFinanceSettings,
} from "../queries/finance.mutations";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import { formatDateUZ } from "@/shared/utils/date.utils";
import {
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Data & queries
import {

} from "../data/finance.data";
import { financeQueries } from "../queries/finance.queries";

const FinanceSettingsPage = () => {
  const { data: settings, isLoading } = useQuery(financeQueries.settings());
  const { mutate: updateSettings } = useUpdateFinanceSettings();

  const {
    invoiceDayOfMonth,
    autoGenerateEnabled,
    catchUpMonths,
    firstInvoiceMonth,
    depositAutoApply,
    defaultTariffId,
    setFields,
    setField,
  } = useObjectState({
    invoiceDayOfMonth: 1,
    autoGenerateEnabled: true,
    catchUpMonths: 1,
    firstInvoiceMonth: "",
    depositAutoApply: true,
    defaultTariffId: "",
  });

  // Server javobi kelgach formani to'ldiramiz
  useEffect(() => {
    if (!settings) return;
    setFields({
      invoiceDayOfMonth: settings.invoiceDayOfMonth,
      autoGenerateEnabled: settings.autoGenerateEnabled,
      catchUpMonths: settings.catchUpMonths,
      firstInvoiceMonth: monthKeyToInputValue(settings.firstInvoiceMonth),
      depositAutoApply: settings.depositAutoApply,
      defaultTariffId: settings.defaultTariffId ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();

    updateSettings(
      {
        invoiceDayOfMonth: Number(invoiceDayOfMonth),
        autoGenerateEnabled,
        catchUpMonths: Number(catchUpMonths),
        firstInvoiceMonth: inputValueToMonthKey(firstInvoiceMonth),
        depositAutoApply,
        // Bo'sh satr ATAYLAB yuboriladi: server uni "standart tarif yo'q"
        // deb tushunadi va avtomat biriktirishni o'chiradi
        defaultTariffId,
      },
      {
        onSuccess: (result) => {
          toast.success("Sozlamalar saqlandi");
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
            type="amount"
            name="invoiceDayOfMonth"
            label="Oyning nechanchi kuni"
            value={invoiceDayOfMonth}
            description="1–28 (fevralda ham ishlashi uchun)"
            onChange={(e) => setField("invoiceDayOfMonth", e.target.value)}
          />

          <InputField
            min="0"
            max="12"
            type="amount"
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

      {/* Standart tarif */}
      <DefaultTariffCard
        value={defaultTariffId}
        onChange={(v) => setField("defaultTariffId", v)}
        current={settings?.defaultTariff}
      />

      {/* Chegirma va depozit qoidalari */}
      <Card title="Depozit">
        <div className="mt-3 flex items-center justify-between gap-3">
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
 * STANDART TARIF — yangi o'quvchiga avtomat biriktiriladigan tarif.
 *
 * Ilgari yangi o'quvchi TARIFSIZ yaratilar, ya'ni unga hisob-faktura
 * yozilmasdi va u qarzdorlar registrida umuman ko'rinmasdi. Tarifni har
 * safar qo'lda biriktirish esa jimgina unutilaverardi — aynan shu bo'shliq
 * shu karta bilan yopiladi.
 *
 * ⚠️ IKKI AMAL BIR KARTADA, LEKIN ULAR BOSHQA-BOSHQA:
 *   tanlov  → forma bilan saqlanadi, faqat KELAJAKDAGI o'quvchilarga
 *             ta'sir qiladi;
 *   tugma   → darhol bajariladi va MAVJUD o'quvchilarni ko'chiradi.
 * Ikkalasini bitta tugmaga birlashtirish "sozlamani saqladim, nega
 * hammaning tarifi o'zgarib ketdi" degan holatga olib kelardi.
 */
const DefaultTariffCard = ({ value, onChange, current }) => {
  const { data: tariffs = [] } = useQuery(financeQueries.assignableTariffs());
  const { mutate: applyDefault, isPending } = useApplyDefaultTariff();
  const { mutate: saveSettings, isPending: isSaving } = useUpdateFinanceSettings();

  // ⚠️ SAQLANGAN TARIF RO'YXATGA MAJBURAN QO'SHILADI.
  //
  // Variantlar `assignableTariffs` dan keladi va u FAQAT faol tariflarni
  // qaytaradi. Saqlangan tarif nofaol qilib qo'yilgan bo'lsa (yoki ro'yxat
  // hali yuklanmagan bo'lsa), tanlagich mos variantni topolmay BO'SH
  // ko'rinardi — ekranda "Tanlanmagan" turar, ostida esa saqlangan tarif
  // nomi yozilib turardi. Foydalanuvchi buni "saqlanmadi" deb o'qiydi va
  // qayta-qayta saqlashga urinadi.
  const known = new Map(tariffs.map((t) => [t.id, t.name]));

  if (current?.id && !known.has(current.id)) {
    known.set(current.id, current.missing ? "Topilmadi" : current.name);
  }

  const options = [
    { label: "Tanlanmagan", value: "" },
    ...[...known].map(([id, name]) => ({ label: name, value: id })),
  ];

  const showApplyResult = (result) => {
    toast.success(
      `${result.applied} ta o'quvchiga qo'llandi` +
        (result.alreadyDefault > 0
          ? `, ${result.alreadyDefault} tasida allaqachon shu tarif edi`
          : ""),
    );
    result?.warnings?.forEach((w) => toast.warning(w));
    result?.failed?.forEach((f) => toast.error(`${f.studentName}: ${f.reason}`));
  };

  const showError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  /**
   * ⚠️ AVVAL SAQLAYDI, KEYIN QO'LLAYDI — bitta bosishda.
   *
   * Server qo'llashda SOZLAMADAGI tarifni o'qiydi, ekrandagi tanlovni emas.
   * Ilgari bu yerda "avval Saqlash tugmasini bosing" degan qulf turardi va u
   * BOSHI BERK KO'CHA yasardi: forma bilan server qiymati biror sababga
   * ko'ra mos kelmasa (sahifa qayta yuklanmadi, so'rov kechikdi), tugma
   * qulflanib qolar, xabar esa allaqachon bosilgan tugmani ko'rsatardi.
   *
   * Endi qulf umuman yo'q: tanlov qanday bo'lsa, o'sha saqlanadi va o'sha
   * qo'llanadi — ikkisi ajralib ketishi STRUKTURAVIY imkonsiz.
   */
  const handleApply = () => {
    saveSettings(
      { defaultTariffId: value || "" },
      {
        onSuccess: () =>
          applyDefault({}, { onSuccess: showApplyResult, onError: showError }),
        onError: showError,
      },
    );
  };

  return (
    <Card title="Standart tarif">
      <p className="mt-1 text-sm text-gray-500">
        Yangi qo'shilgan o'quvchiga shu tarif avtomatik biriktiriladi.
        Tanlanmagan bo'lsa, tarif har safar qo'lda biriktiriladi.
      </p>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Tarif
        </label>
        <Select
          name="defaultTariffId"
          options={options}
          value={value ?? ""}
          onChange={onChange}
          placeholder="Tarifni tanlang"
        />

        {/* Narx KATALOGDAN o'qiladi, sozlamada saqlanmaydi — tarif narxi
            oshsa bu satr o'zi yangilanadi.
            ⚠️ `formatMoney` MAJBURIY: xom `formatAmount` natijasi ekranda
            "2000000.00 so'm" bo'lib chiqardi. */}
        {current && !current.missing && (
          <p className="mt-2 text-xs text-gray-500">
            Saqlangan: {current.name} · {current.monthLabel}:{" "}
            {current.amount ? formatMoney(current.amount) : "narx belgilanmagan"}
          </p>
        )}

        {current?.missing && (
          <p className="mt-2 text-xs text-red-600">
            Tanlangan tarif topilmadi — u o'chirilgan bo'lishi mumkin. Yangisini
            tanlang.
          </p>
        )}
      </div>

      {/* Mavjud o'quvchilarga qo'llash — DARHOL bajariladigan alohida amal */}
      <div className="mt-5 rounded-xl bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-700">
          Barcha o'quvchilarga qo'llash
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Yuqorida tanlangan tarif avval saqlanadi, so'ng hamma o'quvchining
          amaldagi tarifi joriy oydan boshlab shu tarifga almashtiriladi.
          O'tgan oylarga tegilmaydi va shakllangan hisob-fakturalar summasi
          o'zgarmaydi.
        </p>

        <Can do="tariffs.assign">
          <div className="mt-3">
            <ConfirmPopover
              title="Barcha o'quvchilarga qo'llansinmi?"
              description="Tanlangan tarif saqlanadi va hamma o'quvchining tarifi joriy oydan shunga o'tadi. Boshqa tarifdagilar ham (bog'cha, o'quv markazi) shu tarifga ko'chadi."
              confirmLabel="Qo'llash"
              danger
              onConfirm={handleApply}
            >
              <Button
                type="button"
                variant="outline"
                disabled={!value || isPending || isSaving}
                className="w-full xs:w-auto"
              >
                {isPending || isSaving
                  ? "Qo'llanmoqda..."
                  : "Barcha o'quvchilarga qo'llash"}
              </Button>
            </ConfirmPopover>

            {/* Nega tugma o'chiq ekani AYTILADI — jim turgan tugma
                "sahifa buzuq" bo'lib ko'rinardi */}
            {!value && (
              <p className="mt-2 text-xs text-gray-500">
                Avval yuqoridan tarifni tanlang
              </p>
            )}
          </div>
        </Can>
      </div>
    </Card>
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
    financeQueries.vacationMonths(year != null ? { year } : {}),
  );

  const { mutate: deleteVacation } = useDeleteVacationMonth();

  // Server joriy kalendar yilini o'zi tanlaydi — birinchi javobdan olamiz
  const shownYear = year ?? data?.year ?? null;

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
          Belgilanmagan har bir oy to'lanadi. Belgilangan oyda esa hech bir
          o'quvchiga to'lov yozilmaydi — bitta o'quvchini to'xtatish uchun
          "Muzlatish" ishlatiladi.
        </p>

        {shownYear != null && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setYear(shownYear - 1)}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-24 text-center text-sm font-medium text-gray-900">
              {data?.year ?? "—"}
            </span>

            <button
              type="button"
              onClick={() => setYear(shownYear + 1)}
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
          {data.year}-yilda to'lanadigan oylar: {data.billableMonthCount} / 12
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
        : entry.isCurrent
          ? "Joriy oy"
          : "To'lanadi"}
    </p>
  </div>
);

export default FinanceSettingsPage;
