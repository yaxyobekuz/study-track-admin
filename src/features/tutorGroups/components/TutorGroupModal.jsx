// Toast
import { toast } from "sonner";

// Icons
import { Info, TriangleAlert, Users } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import useObjectState from "@/shared/hooks/useObjectState";

// Utils & helpers
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Queries
import { tutorGroupsQueries } from "../queries/tutorGroups.queries";
import {
  useCreateTutorGroup,
  useUpdateTutorGroup,
} from "../queries/tutorGroups.mutations";

/**
 * TYUTOR GURUHI — biriktirish va tahrirlash bitta oynada.
 *
 * `openModal("tutorGroup", { tutor })`        — yangi guruh
 * `openModal("tutorGroup", { tutor, group })` — tahrirlash (sinf o'zgarmaydi)
 *
 * Stavka SHU biriktirishga tegishli: bir tyutor bir sinf uchun bir summa,
 * boshqasi uchun boshqa summa oladi. Jami summa serverdan (`preview`) —
 * formula bitta joyda.
 */
const TutorGroupModal = () => (
  <ResponsiveModal
    name="tutorGroup"
    title="Tyutor guruhi"
    description="Sinf va shu sinf uchun qo'shimcha oylik"
  >
    <Content />
  </ResponsiveModal>
);

/** Server summasi ("20000.00") → input qiymati ("20000"). */
const toInputAmount = (value) => (value == null ? "" : String(Number(value)));

const Content = ({ close, isLoading, setIsLoading, tutor, group }) => {
  const isEdit = Boolean(group?.id);
  const current = currentMonthKey();
  // O'tgan oydan boshlangan — boshlanish oyi qotgan, summa o'zgarsa davr bo'linadi
  const started = isEdit && group.startMonth < current;

  const { mutate: createGroup } = useCreateTutorGroup();
  const { mutate: updateGroup } = useUpdateTutorGroup();

  const { state, setField } = useObjectState({
    classId: group?.classId ?? "",
    perStudentAmount: toInputAmount(group?.perStudentAmount),
    groupAmount: toInputAmount(group?.groupAmount),
    startMonth: monthKeyToInputValue(group?.startMonth ?? current),
    endMonth: monthKeyToInputValue(group?.endMonth ?? null),
    note: group?.note ?? "",
  });

  const startMonthKey = inputValueToMonthKey(state.startMonth) ?? current;

  // Sinflar — faqat yangi biriktirishda (tahrirda sinf qotgan)
  const { data: options, isLoading: isOptionsLoading } = useQuery({
    ...tutorGroupsQueries.classOptions({ tutorId: tutor?.id, month: startMonthKey }),
    enabled: !isEdit,
  });

  const classes = options?.items ?? [];
  const selectedClass = classes.find((c) => c.id === state.classId) ?? null;
  const otherHolders = (selectedClass?.holders ?? []).filter((h) => !h.isMine);
  const myHolders = (selectedClass?.holders ?? []).filter((h) => h.isMine);

  const classOptions = classes
    .filter((c) => c.isActive)
    .map((c) => {
      const busy = c.holders.some((h) => !h.isMine);
      const mine = c.holders.some((h) => h.isMine);
      return {
        value: c.id,
        label: `${c.name} — ${c.studentCount} o'quvchi${
          mine ? " · shu tyutorda" : busy ? " · boshqa tyutorda" : ""
        }`,
      };
    });

  // Jonli hisob — har harfda so'rov ketmasin. SATR kechiktiriladi: obyekt
  // har renderda yangi bo'lib, `useDebounce` effekti to'xtamay qayta ishlardi
  const previewKey = useDebounce(
    JSON.stringify({
      classId: state.classId,
      perStudentAmount: state.perStudentAmount || "0",
      groupAmount: state.groupAmount || "0",
    }),
    350,
  );
  const { data: preview, isError: isPreviewError } = useQuery(
    tutorGroupsQueries.preview(JSON.parse(previewKey)),
  );

  const amountsChanged =
    isEdit &&
    (Number(state.perStudentAmount || 0) !== Number(group.perStudentAmount) ||
      Number(state.groupAmount || 0) !== Number(group.groupAmount));

  const studentCount = selectedClass?.studentCount ?? group?.studentCount ?? null;
  const className = selectedClass?.name ?? group?.className ?? "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!state.classId) return toast.error("Sinfni tanlang");

    const payload = {
      perStudentAmount: state.perStudentAmount || "0",
      groupAmount: state.groupAmount || "0",
      endMonth: inputValueToMonthKey(state.endMonth),
      note: state.note,
    };

    const callbacks = {
      onSuccess: (result) => {
        close();
        toast.success(result?.message || (isEdit ? "Saqlandi" : "Guruh biriktirildi"));
        (result?.warnings ?? []).forEach((warning) => toast.warning(warning));
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    setIsLoading(true);

    if (isEdit) {
      updateGroup(
        {
          id: group.id,
          data: { ...payload, ...(started ? {} : { startMonth: startMonthKey }) },
        },
        callbacks,
      );
    } else {
      createGroup(
        {
          ...payload,
          tutorId: tutor.id,
          classId: state.classId,
          startMonth: startMonthKey,
        },
        callbacks,
      );
    }
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {/* Tyutor */}
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">Tyutor</p>
        <p className="font-medium text-gray-900">{tutor?.fullName}</p>
      </div>

      {/* Sinf */}
      {isEdit ? (
        <div className="rounded-xl border border-gray-100 p-3 text-sm">
          <p className="text-gray-500">Guruh (sinf)</p>
          <p className="font-medium text-gray-900">{group.className}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Guruh (sinf)</p>
          <Select
            searchable
            triggerClassName="w-full"
            value={state.classId}
            placeholder="Sinfni tanlang"
            isLoading={isOptionsLoading}
            onChange={(v) => setField("classId", v)}
            options={classOptions}
          />
        </div>
      )}

      {/* Guruhdagi o'quvchilar soni — summa shunga bog'liq */}
      {state.classId && studentCount != null && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm text-primary">
          <Users className="size-4 shrink-0" strokeWidth={1.75} />
          <span>
            {className} guruhida hozir <b>{studentCount} ta o'quvchi</b> bor
          </span>
        </div>
      )}

      {otherHolders.length > 0 && (
        <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
          <TriangleAlert className="size-4 shrink-0" strokeWidth={1.75} />
          <div className="space-y-0.5">
            {otherHolders.map((h) => (
              <p key={`${h.tutorId}-${h.periodLabel}`}>
                Bu sinf {h.tutorName} ga biriktirilgan ({h.periodLabel}).
              </p>
            ))}
            <p>Bir oyda bir sinfga bitta tyutor — davrlar kesishmasligi kerak.</p>
          </div>
        </div>
      )}

      {myHolders.length > 0 && (
        <p className="text-xs text-amber-700">
          Bu sinf shu tyutorga allaqachon biriktirilgan ({myHolders[0].periodLabel}).
        </p>
      )}

      {/* Summalar */}
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField
          type="amount"
          name="perStudentAmount"
          label="Bitta o'quvchi uchun"
          value={state.perStudentAmount}
          description="So'm, oyiga"
          onChange={(e) => setField("perStudentAmount", e.target.value)}
        />
        <InputField
          type="amount"
          name="groupAmount"
          label="Butun guruh uchun"
          value={state.groupAmount}
          description="So'm, oyiga (o'quvchilar sonidan qat'i nazar)"
          onChange={(e) => setField("groupAmount", e.target.value)}
        />
      </div>

      {/* Jonli hisob — serverdan */}
      {state.classId && preview && !isPreviewError && (
        <div className="space-y-1 rounded-xl border border-gray-100 p-3 text-sm">
          <div className="flex justify-between gap-3 text-gray-600">
            <span>
              {preview.studentCount} o'quvchi × {formatMoney(preview.perStudentAmount)}
            </span>
            <span>{formatMoney(preview.studentsAmount)}</span>
          </div>
          <div className="flex justify-between gap-3 text-gray-600">
            <span>Guruh uchun</span>
            <span>{formatMoney(preview.groupAmount)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
            <span>Qo'shimcha oylik</span>
            <span>{formatMoney(preview.amount)} / oy</span>
          </div>
          <p className="text-xs text-gray-400">
            O'quvchilar soni har oy oylik hisoblanayotgan paytdagi holatdan olinadi.
          </p>
        </div>
      )}

      {started && amountsChanged && (
        <div className="flex gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
          <Info className="size-4 shrink-0" strokeWidth={1.75} />
          <span>
            Yangi summa {formatMonthKey(current)} dan amal qiladi — o'tgan oylar
            eski summada qoladi.
          </span>
        </div>
      )}

      {/* Davr */}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          required
          type="month"
          name="startMonth"
          label="Qaysi oydan"
          value={state.startMonth}
          disabled={started}
          min={monthKeyToInputValue(current)}
          description={started ? "Boshlangan — o'zgarmaydi" : undefined}
          onChange={(e) => setField("startMonth", e.target.value)}
        />
        <InputField
          type="month"
          name="endMonth"
          label="Qaysi oygacha"
          value={state.endMonth}
          min={monthKeyToInputValue(Math.max(startMonthKey, current))}
          description="Bo'sh — muddatsiz"
          onChange={(e) => setField("endMonth", e.target.value)}
        />
      </div>

      <InputField
        type="textarea"
        name="note"
        label="Izoh"
        value={state.note}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      <div className="mt-4 flex w-full flex-col-reverse gap-3 xs:m-0 xs:flex-row xs:justify-end">
        <Button type="button" variant="secondary" onClick={close} className="w-full xs:w-32">
          Bekor qilish
        </Button>
        <Button className="w-full xs:w-32" disabled={isLoading}>
          {isEdit ? "Saqlash" : "Biriktirish"}
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default TutorGroupModal;
