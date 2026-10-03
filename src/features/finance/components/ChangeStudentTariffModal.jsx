// Toast
import { toast } from "sonner";

// Icons
import { TriangleAlert } from "lucide-react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import usePermissions from "@/shared/hooks/usePermissions";
import { useChangeAssignmentTariff } from "../queries/finance.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Helpers
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
  prevMonthKey,
} from "@/shared/helpers/month.helpers";

// Queries
import { financeQueries } from "../queries/finance.queries";

/**
 * O'quvchining tarifini almashtirish.
 *
 * Server buni bitta tranzaksiyada bajaradi: eskisi `fromMonth - 1` da
 * yopiladi, yangisi `fromMonth` dan ochiladi. Ikki alohida so'rov qilinsa,
 * oraliqda o'quvchi tarifsiz qolib ketardi.
 *
 * Boshlanish oyi JORIY oy ham bo'la oladi — chegara o'tgan oyda.
 *
 * O'TGAN oy ham tanlanadi, lekin u muhrlangan tarixni qayta yozadi: shu
 * sababli `force` bilan yuboriladi, alohida `tariffs.adjust` ruxsatini talab
 * qiladi va server logga yozadi (`EditTariffVersionModal` dagi naqsh).
 * Qamralgan oylarning hisob-fakturalari server tomonida avtomat qayta
 * hisoblanadi — natija `warnings` da qaytadi.
 *
 * ⚠️ Modalga JORIY oyni qamragan biriktirma uzatiladi
 * (`StudentFinanceSection` → `currentAssignment`), lekin o'tgan oy
 * tanlanganda o'sha oyni BOSHQA biriktirma qamragan bo'lishi mumkin —
 * almashtirish aynan shunga qo'llanishi kerak (server `fromMonth` biriktirma
 * boshlanish oyidan oldin bo'lsa rad etadi). Shu sababli o'quvchining tarif
 * TARIXI o'qiladi va nishon biriktirma tanlangan oydan kelib chiqib topiladi.
 */
const ChangeStudentTariffModal = () => (
  <ResponsiveModal name="changeStudentTariff" title="Tarifni almashtirish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, assignment }) => {
  const { can } = usePermissions();
  const { mutate: changeTariff } = useChangeAssignmentTariff();
  const { data: tariffs = [] } = useQuery(financeQueries.assignableTariffs());
  const { data: history } = useQuery(
    financeQueries.studentTariffHistory(assignment?.studentId),
  );

  const { tariffId, fromMonth, customAmount, note, setField } = useObjectState({
    // Joriy tarif oldindan tanlangan: ko'p hollarda tarif qoladi, faqat
    // individual narx o'zgaradi.
    tariffId: assignment?.tariffId ?? "",
    // Odatda tarif joriy oydan almashtiriladi — narx bugun kelishiladi.
    // O'tgan oy ham mumkin, lekin u ruxsat + ogohlantirish bilan.
    fromMonth: monthKeyToInputValue(currentMonthKey()),
    // Individual (maxsus) narx — bo'sh bo'lsa tanlangan tarifning katalog narxi
    customAmount: assignment?.customAmount ?? "",
    note: "",
  });

  const fromMonthKey = inputValueToMonthKey(fromMonth);

  // Tanlangan oyni qamragan biriktirma — ALMASHTIRISH AYNAN SHUNGA qo'llanadi.
  // Tarix hali yuklanmagan bo'lsa modalga uzatilgani ishlatiladi.
  const items = history?.items ?? [];
  const target =
    items.find(
      (item) =>
        fromMonthKey != null &&
        item.startMonth <= fromMonthKey &&
        (item.endMonth == null || item.endMonth >= fromMonthKey),
    ) ?? (items.length === 0 ? assignment : null);

  // Oy tanlagichning pastki chegarasi — eng ERTA biriktirma. Undan oldin
  // o'quvchida tarif umuman yo'q, ya'ni almashtirish emas, yangi biriktirish
  // kerak. (Ilgari bu yerda joriy oy biriktirmasining boshlanishi turardi va
  // u oktabrda boshlangan bo'lsa avgustni tanlashning imkoni yo'q edi.)
  const earliestMonth = items.length
    ? Math.min(...items.map((i) => i.startMonth))
    : assignment?.startMonth;

  const sameTariff = tariffId === target?.tariffId;

  // O'tgan oydan almashtirish — muhrlangan hisob-fakturalar qayta yoziladi,
  // shuning uchun alohida ruxsat. Ruxsat yo'q bo'lsa forma bloklanadi (server
  // ham 403 qaytaradi, lekin foydalanuvchi buni oldin bilishi kerak).
  const isRetroactive = fromMonthKey != null && fromMonthKey < currentMonthKey();
  const noAssignment = fromMonthKey != null && items.length > 0 && !target;
  const blocked = (isRetroactive && !can("tariffs.adjust")) || noAssignment;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!target) {
      return toast.error(
        `${formatMonthKey(fromMonthKey)} oyida o'quvchiga tarif biriktirilmagan — ` +
          "almashtirish emas, yangi tarif biriktirish kerak",
      );
    }
    if (!tariffId) return toast.error("Tarifni tanlang");
    if (isRetroactive && !can("tariffs.adjust")) {
      return toast.error("O'tgan oydan almashtirish uchun ruxsatingiz yo'q");
    }
    if (
      sameTariff &&
      Number(customAmount || -1) === Number(target.customAmount ?? -1)
    ) {
      return toast.error("Yangi tarif tanlang yoki individual narxni o'zgartiring");
    }

    setIsLoading(true);

    changeTariff(
      {
        id: target.id,
        force: isRetroactive,
        data: {
          tariffId,
          fromMonth: fromMonthKey,
          customAmount: String(customAmount).trim(),
          note,
        },
      },
      {
        onSuccess: (result) => {
          close();
          toast.success(sameTariff ? "Narx o'zgartirildi" : "Tarif almashtirildi");
          result?.warnings?.forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {assignment && (
        <div className="rounded-xl bg-gray-50 p-3 text-sm">
          <p className="text-gray-500">
            {assignment.student
              ? `${assignment.student.firstName} ${assignment.student.lastName ?? ""}`.trim()
              : "O'quvchi"}
          </p>
          <p className="font-medium text-gray-900">
            {/* Tanlangan oydagi tarif — o'tgan oyda u joriy tarifdan
                boshqa bo'lishi mumkin. */}
            {fromMonthKey ? `${formatMonthKey(fromMonthKey)}:` : "Joriy tarif:"}{" "}
            {target?.tariff?.name ?? assignment.tariff?.name ?? "—"}
          </p>
        </div>
      )}

      {(isRetroactive || noAssignment) && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <p>
            {noAssignment
              ? `${formatMonthKey(fromMonthKey)} oyida o'quvchiga tarif biriktirilmagan — almashtirish emas, yangi tarif biriktirish kerak.`
              : !can("tariffs.adjust")
                ? "O'tgan oydan tarif almashtirish uchun sizda ruxsat yo'q («Amaldagi yozuvni to'g'rilash»)."
                : `${formatMonthKey(fromMonthKey)} — o'tgan oy. Shu oydan boshlab hisob-fakturalar yangi tarif bo'yicha qayta hisoblanadi; to'lov tushgan oylarda farq qarzga yoki depozitga tushadi. Amal jurnalga yoziladi.`}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">Tarif</p>
        <SelectSearch
          inline
          value={tariffId}
          disabled={blocked}
          placeholder="Tarifni tanlang"
          onChange={(v) => setField("tariffId", v)}
          options={tariffs.map((t) => ({
            label: t.id === assignment?.tariffId ? `${t.name} (joriy)` : t.name,
            value: t.id,
          }))}
        />
      </div>

      {/* `min` — o'quvchining eng ERTA biriktirmasi: undan oldin tarif
          umuman yo'q, ya'ni almashtiradigan narsa ham yo'q. Joriy oy
          biriktirmasining boshlanishini qo'yish xato edi — u oktabrda
          boshlangan o'quvchida avgustni tanlash imkonsiz bo'lib qolardi.

          Tanlagich HECH QACHON o'chirilmaydi: `blocked` aynan tanlangan oyga
          bog'liq, shuning uchun uni ham o'chirish foydalanuvchini tuzoqqa
          solardi — oyni qaytarib o'zgartira olmay qolardi. */}
      <InputField
        required
        type="month"
        name="fromMonth"
        label="Qaysi oydan"
        value={fromMonth}
        min={monthKeyToInputValue(earliestMonth)}
        onChange={(e) => setField("fromMonth", e.target.value)}
      />

      {/* Individual narx — bu o'quvchi uchun katalog narxidan farqli doimiy
          summa. Bo'sh qolsa tanlangan tarifning katalog narxi ishlaydi.
          Tarif o'zgarmasa ham faqat narxni o'zgartirish mumkin. */}
      <InputField
        type="number"
        name="customAmount"
        label="Individual narx (so'm)"
        value={customAmount}
        disabled={blocked}
        placeholder="Bo'sh qolsa — katalog narxi"
        onChange={(e) => setField("customAmount", e.target.value)}
      />

      <InputField
        name="note"
        value={note}
        label="Izoh"
        disabled={blocked}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      {fromMonthKey && target && (
        <p className="text-xs text-gray-500">
          {sameTariff
            ? `Tarif o'zgarmaydi — yangi narx ${formatMonthKey(fromMonthKey)} oyidan amal qiladi, undan oldingi oylar eski narxda qoladi.`
            : fromMonthKey === target.startMonth
            ? // Eskisiga birorta oy qolmaydi — u yopilmaydi, almashtiriladi.
              `"${target.tariff?.name ?? "Joriy tarif"}" ${formatMonthKey(fromMonthKey)} oyidan boshlab butunlay yangisiga almashtiriladi.`
            : `"${target.tariff?.name ?? "Joriy tarif"}" ${formatMonthKey(prevMonthKey(fromMonthKey))} oyida yopiladi, yangisi ${formatMonthKey(fromMonthKey)} oyidan boshlanadi.`}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          autoFocus
          className="w-full xs:w-32"
          disabled={isLoading || blocked}
        >
          Almashtirish
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default ChangeStudentTariffModal;
