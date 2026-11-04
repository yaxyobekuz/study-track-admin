// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Ban, Search, TriangleAlert, Unlock } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import Pagination from "@/shared/components/ui/Pagination";

// Hooks
import useDebounce from "@/shared/hooks/useDebounce";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import {
  BLOCK_NOTE_MAX,
  BLOCK_REASON_MAX,
  BLOCK_REASON_PRESETS,
  CANDIDATE_SCOPE_OPTIONS,
  MAX_BLOCK_STUDENTS,
  UNBLOCK_REASON_PRESETS,
} from "../data/coin-blocks.data";
import { coinBlocksQueries } from "../queries/coin-blocks.queries";
import { useBlockCoins, useUnblockCoins } from "../queries/coin-blocks.mutations";
import { classesQueries } from "@/features/classes/queries/classes.queries";

// ─────────────────────────────────────────────
// CHEKLASH — bir nechta o'quvchi birdaniga
// ─────────────────────────────────────────────

export const BlockCoinsModal = () => (
  <ResponsiveModal
    name="blockCoins"
    title="Tanga berishni taqiqlash"
    className="max-w-4xl"
  >
    <BlockCoinsForm />
  </ResponsiveModal>
);

/**
 * CHEKLASH FORMASI.
 *
 * ⚠️ RO'YXAT SERVERDAN va sukut bo'yicha QARZDORLAR: qarz panelda
 * hisoblanmaydi, u qarzdorlar registri bilan AYNI manbadan keladi
 * (`coinBlock.service.js`). "Barcha o'quvchilar" — ONGLI tanlov
 * (qarzi yo'q bolani ham cheklash mumkin, lekin sababi boshqa bo'ladi).
 *
 * ⚠️ TANLOV SAHIFADAN SAHIFAGA SAQLANADI (`picked` — Set): admin 2-sahifada
 * yana belgilaganda 1-sahifadagi tanlovi yo'qolmasligi kerak. "Hammasini
 * belgilash" esa faqat KO'RINIB TURGAN sahifaga tegishli — bu ataylab:
 * ko'rinmayotgan yuzlab o'quvchini bitta bosishda cheklash xato bo'lardi.
 */
const BlockCoinsForm = ({ close, isLoading, setIsLoading, preselected }) => {
  const { mutate: blockCoins } = useBlockCoins();

  const [scope, setScope] = useState("debtors");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState(() => new Set(preselected ?? []));

  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data: classes = [] } = useQuery(classesQueries.list());
  const { data, isFetching } = useQuery(
    coinBlocksQueries.candidates({
      page,
      limit: 20,
      debtorsOnly: scope === "debtors" ? "true" : "false",
      ...(classId ? { classId } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
  );

  // `?? []` har renderda yangi massiv — `selectable` memosi buzilmasin
  const rows = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.pagination;

  // Allaqachon cheklangan o'quvchi belgilanmaydi — ikkinchi cheklov ma'nosiz
  const selectable = useMemo(() => rows.filter((r) => !r.isBlocked), [rows]);
  const allSelected =
    selectable.length > 0 && selectable.every((r) => picked.has(r.studentId));

  const toggle = (studentId) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });

  const toggleVisible = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const row of selectable) {
        if (allSelected) next.delete(row.studentId);
        else next.add(row.studentId);
      }
      return next;
    });

  const studentIds = [...picked];
  const error =
    studentIds.length === 0
      ? "O'quvchi tanlang"
      : studentIds.length > MAX_BLOCK_STUDENTS
        ? `Bir amalda ${MAX_BLOCK_STUDENTS} tagacha o'quvchi tanlanadi`
        : !reason.trim()
          ? "Sababini yozing"
          : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (error || isLoading) return;

    setIsLoading(true);
    blockCoins(
      { studentIds, reason: reason.trim(), note: note.trim() },
      {
        onSuccess: (result) => {
          close();
          toast.success(
            `${result.blockedCount} ta o'quvchiga tanga berish taqiqlandi — endi hech qaysi ekrandan tanga tushmaydi`,
          );
          if (result.skippedCount > 0) {
            toast.info(`${result.skippedCount} tasi allaqachon cheklangan edi`);
          }
          if (result.failedCount > 0) {
            toast.warning(`${result.failedCount} tasida xato: ${result.failed[0]?.reason ?? ""}`);
          }
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
        {/* ── Kimga ──────────────────────────────────────── */}
        <section className="min-w-0 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">Kimga</p>
            <p className="text-xs text-gray-500">{studentIds.length} ta tanlandi</p>
          </div>

          <Segmented options={CANDIDATE_SCOPE_OPTIONS} value={scope} onChange={(next) => {
            setScope(next);
            setPage(1);
          }} />

          <div className="flex flex-col gap-2 xs:flex-row">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3">
              <Search className="size-4 shrink-0 text-gray-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Ism yoki login"
                className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </label>

            {/* ⚠️ `inline` — MODAL ICHIDA MAJBURIY: portalli ro'yxat
                dialog qulfidan tashqarida qolib, g'ildirak bilan
                aylanmaydi (`SelectSearch` izohi). */}
            <SelectSearch
              inline
              idValues
              value={classId}
              triggerClassName="xs:w-40"
              onChange={(next) => {
                setClassId(next);
                setPage(1);
              }}
              options={[
                { label: "Barcha sinflar", value: "" },
                ...classes.map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
          </div>

          <div className="rounded-xl border border-gray-200">
            {selectable.length > 0 && (
              <label className="flex cursor-pointer items-center gap-2.5 border-b border-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleVisible}
                  className="size-4 accent-primary"
                />
                Shu sahifadagilarni belgilash
              </label>
            )}

            <ul className="max-h-80 overflow-y-auto">
              {isFetching && rows.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">Yuklanmoqda...</li>
              )}
              {!isFetching && rows.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-gray-500">
                  {scope === "debtors"
                    ? "Qarzdor o'quvchi topilmadi"
                    : "O'quvchi topilmadi"}
                </li>
              )}

              {rows.map((row) => {
                const checked = picked.has(row.studentId);

                return (
                  <li key={row.studentId}>
                    <label
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2",
                        row.isBlocked
                          ? "cursor-default opacity-50"
                          : "cursor-pointer hover:bg-gray-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={row.isBlocked}
                        onChange={() => toggle(row.studentId)}
                        className="size-4 shrink-0 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {row.fullName}
                          {row.isBlocked && (
                            <span className="ml-1.5 text-xs font-normal text-red-600">
                              allaqachon cheklangan
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-gray-400">
                          {[row.className, row.username].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            row.debtMonthCount > 0 ? "text-red-600" : "text-gray-400",
                          )}
                        >
                          {row.debtMonthCount > 0 ? row.debtLabel : "qarzi yo'q"}
                        </span>
                        {row.debtMonthCount > 0 && (
                          <span className="block text-xs text-gray-400">
                            {row.debtMonthCount} oy · {row.oldestMonthLabel} dan
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {pagination?.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              hasNextPage={page < pagination.totalPages}
              hasPrevPage={page > 1}
              onPageChange={setPage}
            />
          )}
        </section>

        {/* ── Sabab va oqibat ────────────────────────────── */}
        <section className="min-w-0 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Sabab</p>

          <InputField
            name="reason"
            required
            value={reason}
            maxLength={BLOCK_REASON_MAX}
            placeholder="Oylik to'lov qarzdorligi"
            onChange={(event) => setReason(event.target.value)}
          />

          <div className="flex flex-wrap gap-1.5">
            {BLOCK_REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReason(preset)}
                className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
              >
                {preset}
              </button>
            ))}
          </div>

          <InputField
            name="note"
            label="Izoh (ixtiyoriy)"
            value={note}
            maxLength={BLOCK_NOTE_MAX}
            placeholder="Ota-ona bilan gaplashildi, 15-kunga kelishildi"
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="space-y-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
            <p className="flex items-start gap-2 font-medium">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              Cheklov qo'yilgandan keyin:
            </p>
            <ul className="ml-5 list-disc space-y-1">
              <li>kunlik baho uchun tanga yozilmaydi — o'qituvchi baho qo'ysa ham;</li>
              <li>haftalik reyting bonusi va test mavsumi mukofoti tushmaydi;</li>
              <li>qo'lda ham tanga berib bo'lmaydi (hech bir ekrandan);</li>
              <li>
                cheklov davridagi tangalar KEYIN ham berilmaydi — ochilganda faqat
                oldinga ishlaydi;
              </li>
              <li>
                o'quvchi o'z panelida sababini ko'radi — bu yashirin cheklov emas.
              </li>
            </ul>
          </div>

          {error && <p className="text-xs text-gray-500">{error}</p>}

          <Button type="submit" variant="danger" className="w-full" loading={isLoading} disabled={Boolean(error)}>
            <Ban />
            {studentIds.length > 1
              ? `${studentIds.length} ta o'quvchiga taqiqlash`
              : "Taqiqlash"}
          </Button>
        </section>
      </div>
    </InputGroup>
  );
};

// ─────────────────────────────────────────────
// OCHISH — bitta yoki bir nechta o'quvchi
// ─────────────────────────────────────────────

export const UnblockCoinsModal = () => (
  <ResponsiveModal name="unblockCoins" title="Tanga berishni ochish" className="max-w-lg">
    <UnblockCoinsForm />
  </ResponsiveModal>
);

/**
 * OCHISH FORMASI — sabab MAJBURIY: registrda "nega ochildi" degan savolga
 * javob qoladi (qator o'chirilmaydi, bekor qilinadi).
 */
const UnblockCoinsForm = ({ close, isLoading, setIsLoading, blocks = [] }) => {
  const { mutate: unblockCoins } = useUnblockCoins();
  const [reason, setReason] = useState("");

  const blockIds = blocks.map((b) => b.id);
  const isBulk = blockIds.length > 1;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!reason.trim() || isLoading || blockIds.length === 0) return;

    setIsLoading(true);
    unblockCoins(
      { blockIds, reason: reason.trim() },
      {
        onSuccess: (result) => {
          close();
          toast.success(
            `${result.unblockedCount} ta o'quvchiga tanga berish ochildi — bundan keyingi tangalar odatdagidek yoziladi`,
          );
          if (result.failedCount > 0) {
            toast.info(`${result.failedCount} tasida cheklov allaqachon olib tashlangan edi`);
          }
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        {isBulk ? (
          <p>
            <span className="font-medium">{blockIds.length} ta o'quvchi</span>ga tanga
            berish ochiladi.
          </p>
        ) : (
          <p>
            <span className="font-medium">{blocks[0]?.fullName}</span> — cheklov sababi:{" "}
            {blocks[0]?.reason}
          </p>
        )}
        <p className="mt-1.5 text-xs text-gray-500">
          Cheklov davridagi tangalar qaytarilmaydi: ochish faqat bundan keyingi
          tangalarga ta'sir qiladi.
        </p>
      </div>

      <InputField
        name="reason"
        label="Ochish sababi"
        required
        value={reason}
        maxLength={BLOCK_REASON_MAX}
        placeholder="Qarzdorlik to'landi"
        onChange={(event) => setReason(event.target.value)}
      />

      <div className="flex flex-wrap gap-1.5">
        {UNBLOCK_REASON_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setReason(preset)}
            className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
          >
            {preset}
          </button>
        ))}
      </div>

      <Button type="submit" className="w-full" loading={isLoading} disabled={!reason.trim()}>
        <Unlock />
        {isBulk ? `${blockIds.length} ta cheklovni olib tashlash` : "Cheklovni olib tashlash"}
      </Button>
    </InputGroup>
  );
};

/** Segmentli tanlov — variantlar kam va joriy tanlov doim ko'rinib turadi. */
const Segmented = ({ options, value, onChange }) => (
  <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          "flex-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
          value === option.value
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);
