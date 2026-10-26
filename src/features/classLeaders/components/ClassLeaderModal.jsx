// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Search, TriangleAlert, Users } from "lucide-react";

// TanStack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries
import { classLeadersKeys, classLeadersQueries } from "../queries/classLeaders.queries";
import {
  useAssignClassLeader,
  useUpdateClassLeader,
} from "../queries/classLeaders.mutations";

/**
 * SINF RAHBARLIGI — biriktirish va izohni tahrirlash bitta oynada.
 *
 * `openModal("classLeader", { leader })`         — yangi sinf(lar)
 * `openModal("classLeader", { leader, item })`   — izohni tahrirlash
 *
 * ⚠️ TYUTOR OYNASIDAN FARQI: summa ham, davr ham YO'Q. Sinf rahbarligi pul
 * hisoblamaydi, faqat davomat huquqini beradi — "qaysi oydan" degan savolning
 * ma'nosi ham yo'q, chunki muhrlanadigan fakt yo'q.
 *
 * ⚠️ BIR SINFGA BITTA RAHBAR: band sinf belgilanmaydi va kim band qilgani
 * yonida turadi. Server baribir qayta tekshiradi — hammasi yoki hech narsa.
 */
const ClassLeaderModal = () => (
  <ResponsiveModal
    name="classLeader"
    title="Sinf rahbarligi"
    className="max-w-lg"
    description="Xodim davomat belgilaydigan sinflar"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, leader, item }) => {
  const isEdit = Boolean(item?.id);

  const queryClient = useQueryClient();
  const { mutate: assign } = useAssignClassLeader();
  const { mutate: update } = useUpdateClassLeader();

  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set());

  const { state, setField } = useObjectState({ note: item?.note ?? "" });

  // Sinflar — faqat yangi biriktirishda (tahrirda sinf qotgan)
  const { data: options, isLoading: isOptionsLoading } = useQuery({
    ...classLeadersQueries.classOptions({ leaderId: leader?.id }),
    enabled: !isEdit,
  });

  // Nofaol sinfga rahbar biriktirilmaydi — ro'yxatga ham chiqmaydi
  const classes = useMemo(
    () => (options?.items ?? []).filter((c) => c.isActive),
    [options],
  );
  const classMap = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const selectedIds = classes
    .filter((c) => picked.has(c.id) && c.isAvailable)
    .map((c) => c.id);
  // Tanlangan, lekin oraliqda boshqa odamga biriktirilib qolganlar
  const blockedPicked = classes.filter((c) => picked.has(c.id) && !c.isAvailable);
  const availableCount = classes.filter((c) => c.isAvailable).length;

  const needle = search.trim().toLowerCase();
  const visible = needle
    ? classes.filter((c) => c.name.toLowerCase().includes(needle))
    : classes;
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

  const pickedStudents = selectedIds.reduce(
    (sum, id) => sum + (classMap.get(id)?.studentCount ?? 0),
    0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && selectedIds.length === 0) {
      return toast.error("Kamida bitta sinfni tanlang");
    }

    const callbacks = {
      onSuccess: (result) => {
        close();
        toast.success(result?.message || (isEdit ? "Saqlandi" : "Sinf biriktirildi"));
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        // Oyna ochiq turganda sinfni boshqa odam biriktirgan bo'lishi mumkin —
        // ro'yxat yangilansin, band sinflar belgidan chiqib ko'rinsin
        if (err.response?.status === 409) {
          queryClient.invalidateQueries({
            queryKey: [...classLeadersKeys.all, "classOptions"],
          });
        }
      },
      onSettled: () => setIsLoading(false),
    };

    setIsLoading(true);

    if (isEdit) {
      update({ id: item.id, data: { note: state.note } }, callbacks);
    } else {
      assign({ leaderId: leader.id, classIds: selectedIds, note: state.note }, callbacks);
    }
  };

  return (
    <InputGroup onSubmit={handleSubmit} as="form">
      {/* Xodim */}
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="text-gray-500">Sinf rahbari</p>
        <p className="font-medium text-gray-900">{leader?.fullName}</p>
      </div>

      {isEdit ? (
        <>
          <div className="rounded-xl border border-gray-100 p-3 text-sm">
            <p className="text-gray-500">Sinf</p>
            <p className="font-medium text-gray-900">{item.className}</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3 text-sm text-primary">
            <Users className="size-4 shrink-0" strokeWidth={1.75} />
            <span>
              {item.className} sinfida hozir <b>{item.studentCount} ta o'quvchi</b> bor
            </span>
          </div>
        </>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">Sinflar</p>
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
                <li className="px-3 py-6 text-center text-sm text-gray-500">
                  Yuklanmoqda...
                </li>
              )}
              {!isOptionsLoading && visible.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">
                  {classes.length === 0 ? "Faol sinf yo'q" : "Sinf topilmadi"}
                </li>
              )}
              {visible.map((c) => {
                const checked = picked.has(c.id);
                // Band sinfni belgilab bo'lmaydi, lekin oldin belgilangani olinadi
                const selectable = c.isAvailable || checked;

                return (
                  <li key={c.id}>
                    <label
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2",
                        selectable
                          ? "cursor-pointer hover:bg-gray-50"
                          : "cursor-not-allowed",
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
                        {c.holder && (
                          <span className="block truncate text-xs text-amber-700">
                            {c.holder.isMine
                              ? "Shu xodimda"
                              : `Band — ${c.holder.leaderName}`}
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

          {blockedPicked.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <TriangleAlert className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="min-w-0 flex-1">
                Tanlangan {blockedPicked.length} ta sinf oraliqda band bo'lib qoldi:{" "}
                {blockedPicked.map((c) => c.name).join(", ")} — ular yuborilmaydi.
              </span>
              <button
                type="button"
                onClick={dropBlocked}
                className="shrink-0 font-medium underline"
              >
                Belgidan olish
              </button>
            </div>
          )}

          {selectedIds.length > 0 && (
            <p className="text-xs text-gray-500">
              {selectedIds.length} ta sinf · jami {pickedStudents} ta o'quvchi.
              Xodim bu sinflarning kunlik davomatini o'zi belgilaydi.
            </p>
          )}
        </div>
      )}

      <InputField
        type="textarea"
        name="note"
        label="Izoh"
        value={state.note}
        placeholder="Ixtiyoriy"
        onChange={(e) => setField("note", e.target.value)}
      />

      <div className="mt-4 flex w-full flex-col-reverse gap-3 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={close}
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>
        <Button
          className="w-full xs:w-auto xs:min-w-32"
          disabled={isLoading || (!isEdit && selectedIds.length === 0)}
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

export default ClassLeaderModal;
