// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Info, Search, TriangleAlert, Users } from "lucide-react";

// TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";
import useObjectState from "@/shared/hooks/useObjectState";

// Utils & helpers
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  currentMonthKey,
  formatMonthKey,
  inputValueToMonthKey,
  monthKeyToInputValue,
} from "@/shared/helpers/month.helpers";

// Queries
import { tutorGroupsKeys, tutorGroupsQueries } from "../queries/tutorGroups.queries";
import {
  useCreateTutorGroup,
  useUpdateTutorGroup,
} from "../queries/tutorGroups.mutations";

/**
 * TYUTOR GURUHI — biriktirish va tahrirlash bitta oynada.
 *
 * `openModal("tutorGroup", { tutor })`        — yangi guruh(lar)
 * `openModal("tutorGroup", { tutor, group })` — tahrirlash (sinf o'zgarmaydi)
 *
 * Biriktirishda BIR NECHTA sinf (yoki hammasi) tanlanadi: AYNI stavka va davr
 * bilan har sinfga ALOHIDA guruh yoziladi — keyin har biri o'zicha tahrirlanadi.
 * Tanlangan davrda band sinf (`isAvailable = false`) belgilanmaydi; davr
 * o'zgarib band bo'lib qolgan tanlov yuborilmaydi va oyna buni aytadi.
 * Server baribir hammasini qulf ichida qayta tekshiradi (hammasi yoki hech narsa).
 *
 * Jami summa serverdan (`preview`) — formula bitta joyda.
 */
const TutorGroupModal = () => (
  <ResponsiveModal
    name="tutorGroup"
    title="Tyutor guruhi"
    className="max-w-lg"
    description="Sinflar va ular uchun qo'shimcha oylik"
  >
    <Content />
  </ResponsiveModal>
);

/** Server summasi ("20000.00") → input qiymati ("20000"). */
const toInputAmount = (value) => (value == null ? "" : String(Number(value)));

/** Sinf kimda band ekanini qisqa matn qiladi. */
const holdersLabel = (holders) =>
  holders
    .map((h) => (h.isMine ? `Shu tyutorda (${h.periodLabel})` : `Band — ${h.tutorName} (${h.periodLabel})`))
    .join("; ");

const Content = ({ close, isLoading, setIsLoading, tutor, group }) => {
  const isEdit = Boolean(group?.id);
  const current = currentMonthKey();
  // O'tgan oydan boshlangan — boshlanish oyi qotgan, summa o'zgarsa davr bo'linadi
  const started = isEdit && group.startMonth < current;

  const queryClient = useQueryClient();
  const { mutate: createGroup } = useCreateTutorGroup();
  const { mutate: updateGroup } = useUpdateTutorGroup();

  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set());

  const { state, setField } = useObjectState({
    perStudentAmount: toInputAmount(group?.perStudentAmount),
    groupAmount: toInputAmount(group?.groupAmount),
    startMonth: monthKeyToInputValue(group?.startMonth ?? current),
    endMonth: monthKeyToInputValue(group?.endMonth ?? null),
    note: group?.note ?? "",
  });

  const startMonthKey = inputValueToMonthKey(state.startMonth) ?? current;
  const endMonthKey = inputValueToMonthKey(state.endMonth);

  // Sinflar — faqat yangi biriktirishda (tahrirda sinf qotgan). Bandlik
  // tanlangan DAVR bo'yicha: tugash oyi ham yuboriladi
  const {
    data: options,
    isLoading: isOptionsLoading,
    isPlaceholderData: isOptionsStale,
  } = useQuery({
    ...tutorGroupsQueries.classOptions({
      tutorId: tutor?.id,
      month: startMonthKey,
      ...(endMonthKey ? { endMonth: endMonthKey } : {}),
    }),
    enabled: !isEdit,
  });

  // Faol bo'lmagan sinf biriktirilmaydi — ro'yxatga ham chiqmaydi
  const classes = useMemo(() => (options?.items ?? []).filter((c) => c.isActive), [options]);
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Yuboriladigan tanlov: faqat shu davrda bo'sh sinflar, ro'yxat tartibida
  const selectedIds = classes.filter((c) => picked.has(c.id) && c.isAvailable).map((c) => c.id);
  // Tanlangan, lekin davr o'zgargach band bo'lib qolganlar
  const blockedPicked = classes.filter((c) => picked.has(c.id) && !c.isAvailable);
  const availableCount = classes.filter((c) => c.isAvailable).length;

  const needle = search.trim().toLowerCase();
  const visible = needle ? classes.filter((c) => c.name.toLowerCase().includes(needle)) : classes;
  const visibleAvailable = visible.filter((c) => c.isAvailable);
  const allVisiblePicked =
    visibleAvailable.length > 0 && visibleAvailable.every((c) => picked.has(c.id));

  const togglePick = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (classMap.get(id)?.isAvailable) next.add(id);
      return next;
    });

  // ⚠️ FAQAT ko'rinib turgan bo'sh sinflar: qidiruv yozilgan bo'lsa, odam
  // aynan shu natijani belgilamoqchi
  const toggleVisible = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const c of visibleAvailable) {
        if (allVisiblePicked) next.delete(c.id);
        else next.add(c.id);
      }
      return next;
    });

  const dropBlocked = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const c of blockedPicked) next.delete(c.id);
      return next;
    });

  // Jonli hisob — har harfda so'rov ketmasin. SATR kechiktiriladi: obyekt
  // har renderda yangi bo'lib, `useDebounce` effekti to'xtamay qayta ishlardi
  const previewClassIds = isEdit ? [group.classId] : selectedIds;
  const previewKey = useDebounce(
    JSON.stringify({
      classIds: previewClassIds,
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

  const hasSelection = previewClassIds.length > 0;
  const isMulti = !isEdit && selectedIds.length > 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && selectedIds.length === 0) return toast.error("Kamida bitta sinfni tanlang");

    const payload = {
      perStudentAmount: state.perStudentAmount || "0",
      groupAmount: state.groupAmount || "0",
      endMonth: endMonthKey,
      note: state.note,
    };

    const callbacks = {
      onSuccess: (result) => {
        close();
        toast.success(result?.message || (isEdit ? "Saqlandi" : "Guruh biriktirildi"));
        (result?.warnings ?? []).forEach((warning) => toast.warning(warning));
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        // Oyna ochiq turganda sinfni boshqa odam biriktirgan bo'lishi mumkin —
        // ro'yxat yangilansin, band sinflar belgidan chiqib ko'rinsin
        if (err.response?.status === 409) {
          queryClient.invalidateQueries({ queryKey: [...tutorGroupsKeys.all, "classOptions"] });
        }
      },
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
          classIds: selectedIds,
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

      {/* Sinf(lar) */}
      {isEdit ? (
        <>
          <div className="rounded-xl border border-gray-100 p-3 text-sm">
            <p className="text-gray-500">Guruh (sinf)</p>
            <p className="font-medium text-gray-900">{group.className}</p>
          </div>

          {/* Guruhdagi o'quvchilar soni — summa shunga bog'liq */}
          <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm text-primary">
            <Users className="size-4 shrink-0" strokeWidth={1.75} />
            <span>
              {group.className} guruhida hozir <b>{group.studentCount} ta o'quvchi</b> bor
            </span>
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Guruhlar (sinflar)</p>
            {options && (
              <span className="text-xs tabular-nums text-gray-500">
                Tanlandi: {selectedIds.length} / {availableCount}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search className="size-4 shrink-0 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sinf nomi"
                className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            {visibleAvailable.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={allVisiblePicked}
                  onChange={toggleVisible}
                  className="size-4 accent-primary"
                />
                {needle ? "Topilganlarning hammasini belgilash" : "Hammasini belgilash"}
                <span className="ml-auto text-xs font-normal text-gray-400">
                  {visibleAvailable.length} ta bo'sh
                </span>
              </label>
            )}

            <ul className="max-h-64 overflow-y-auto">
              {isOptionsLoading && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">Yuklanmoqda...</li>
              )}
              {!isOptionsLoading && visible.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">
                  {classes.length === 0 ? "Faol sinf yo'q" : "Sinf topilmadi"}
                </li>
              )}
              {visible.map((c) => {
                const checked = picked.has(c.id);
                // Band sinfni belgilab bo'lmaydi, lekin oldin belgilangani olib tashlanadi
                const selectable = c.isAvailable || checked;

                return (
                  <li key={c.id}>
                    <label
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2",
                        selectable ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed",
                        checked && c.isAvailable && "bg-primary/5",
                        checked && !c.isAvailable && "bg-amber-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!selectable}
                        onChange={() => togglePick(c.id)}
                        className="size-4 shrink-0 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-sm font-medium",
                            c.isAvailable ? "text-gray-900" : "text-gray-400",
                          )}
                        >
                          {c.name}
                        </span>
                        {c.holders.length > 0 && (
                          <span className="block truncate text-xs text-amber-700">
                            {holdersLabel(c.holders)}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-gray-500">
                        {c.studentCount} o'quvchi
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {options && availableCount < classes.length && (
            <p className="text-xs text-gray-400">
              {options.periodLabel} davrida band sinflarni tanlab bo'lmaydi — bir oyda bir
              sinfga bitta tyutor.
            </p>
          )}
        </div>
      )}

      {blockedPicked.length > 0 && (
        <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
          <TriangleAlert className="size-4 shrink-0" strokeWidth={1.75} />
          <div className="space-y-1">
            <p>
              Tanlangan {blockedPicked.length} ta sinf bu davrda band va biriktirilmaydi:{" "}
              {blockedPicked.map((c) => c.name).join(", ")}.
            </p>
            <button type="button" onClick={dropBlocked} className="font-medium underline">
              Tanlovdan olib tashlash
            </button>
          </div>
        </div>
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
          label={isEdit ? "Butun guruh uchun" : "Har bir guruh uchun"}
          value={state.groupAmount}
          description="So'm, oyiga (o'quvchilar sonidan qat'i nazar)"
          onChange={(e) => setField("groupAmount", e.target.value)}
        />
      </div>

      {/* Jonli hisob — serverdan */}
      {hasSelection && preview && !isPreviewError && (
        <div className="space-y-1 rounded-xl border border-gray-100 p-3 text-sm">
          {preview.classCount > 1 && (
            <ul className="mb-1.5 max-h-32 space-y-0.5 overflow-y-auto border-b border-gray-100 pb-1.5 text-xs text-gray-500">
              {preview.items.map((item) => (
                <li key={item.classId} className="flex justify-between gap-3">
                  <span className="truncate">
                    {item.className} · {item.studentCount} o'quvchi
                  </span>
                  <span className="shrink-0 tabular-nums">{formatMoney(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between gap-3 text-gray-600">
            <span>
              {preview.studentCount} o'quvchi × {formatMoney(preview.perStudentAmount)}
            </span>
            <span>{formatMoney(preview.studentsAmount)}</span>
          </div>
          <div className="flex justify-between gap-3 text-gray-600">
            <span>
              {preview.classCount > 1
                ? `${preview.classCount} guruh × ${formatMoney(preview.groupAmount)}`
                : "Guruh uchun"}
            </span>
            <span>{formatMoney(preview.groupsAmount)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
            <span>{preview.classCount > 1 ? "Jami qo'shimcha oylik" : "Qo'shimcha oylik"}</span>
            <span>{formatMoney(preview.amount)} / oy</span>
          </div>
          <p className="text-xs text-gray-400">
            O'quvchilar soni har oy oylik hisoblanayotgan paytdagi holatdan olinadi.
          </p>
          {isMulti && (
            <p className="text-xs text-gray-400">
              Har sinf alohida guruh bo'lib yoziladi — keyin har birini alohida tahrirlash
              yoki olib tashlash mumkin.
            </p>
          )}
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
        <Button
          className="w-full xs:w-auto xs:min-w-32"
          disabled={isLoading || (!isEdit && (selectedIds.length === 0 || isOptionsStale))}
        >
          {isEdit
            ? "Saqlash"
            : selectedIds.length > 1
              ? `${selectedIds.length} ta sinfni biriktirish`
              : "Biriktirish"}
          {isLoading && "..."}
        </Button>
      </div>
    </InputGroup>
  );
};

export default TutorGroupModal;
