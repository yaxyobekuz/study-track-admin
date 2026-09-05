// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Pencil, Plus, Trash2, X } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { formatDateUz } from "@/shared/utils/date.utils";
import { formatMonthKey } from "@/shared/helpers/month.helpers";

// Queries
import { usersQueries } from "@/features/users/queries/users.queries";
import { subjectsQueries } from "@/features/subjects/queries/subjects.queries";
import {
  academicQueries,
  useCreateAchievement,
  useDeleteAchievement,
  useUpdateAchievement,
} from "../queries/academicDashboard.queries";

/** Bo'sh forma — "yangi yutuq" holati. */
const emptyForm = () => ({
  id: null,
  studentId: "",
  title: "",
  level: "school",
  place: "participant",
  date: new Date().toISOString().split("T")[0],
  subjectId: "",
  note: "",
});

/**
 * OLIMPIADA YUTUQLARI — ro'yxat va kiritish oynasi.
 *
 * ⚠️ ALOHIDA SAHIFA EMAS, dashboard oynasi: yutuq kiritish oyiga bir necha
 * marta bo'ladigan ish va uning yagona iste'molchisi shu dashboard. Alohida
 * sahifa qilinsa, sidebar yana bitta kam ishlatiladigan bo'lim bilan
 * to'lardi.
 *
 * ⚠️ Ro'yxat TANLANGAN OY bo'yicha filtrlanadi — dashboarddagi raqam bilan
 * bir xil maxraj. Boshqa oydagi yutuqni ko'rish uchun dashboarddan oy
 * almashtiriladi: ikkinchi oy tanlagichi ekranda ikkita "qaysi oy" savolini
 * paydo qilardi.
 */
export const AchievementsModal = () => (
  <ResponsiveModal
    name="academicAchievements"
    title="Olimpiada va musobaqa yutuqlari"
    className="max-w-3xl"
  >
    <AchievementsPanel />
  </ResponsiveModal>
);

const AchievementsPanel = ({ close, month }) => {
  const { can } = usePermissions();
  const [form, setForm] = useState(null);

  const canCreate = can("achievements.create");
  const canUpdate = can("achievements.update");
  const canDelete = can("achievements.delete");

  const { data: list, isLoading } = useQuery({
    ...academicQueries.achievements({ month, limit: 100 }),
    enabled: month != null,
  });
  const { data: options } = useQuery(academicQueries.achievementOptions());
  const { data: subjects = [] } = useQuery(subjectsQueries.list());
  const { data: allUsers = [] } = useQuery(usersQueries.allShort());

  const { mutate: createAchievement, isPending: isCreating } = useCreateAchievement();
  const { mutate: updateAchievement, isPending: isUpdating } = useUpdateAchievement();
  const { mutate: deleteAchievement } = useDeleteAchievement();

  const isSaving = isCreating || isUpdating;

  const studentOptions = useMemo(
    () =>
      allUsers
        .filter((user) => user.role === "student")
        .map((user) => ({
          value: user.id,
          label: [user.firstName, user.lastName].filter(Boolean).join(" "),
        })),
    [allUsers],
  );

  const subjectOptions = useMemo(
    () => [
      { value: "", label: "Fan tanlanmagan" },
      ...subjects.map((subject) => ({ value: subject.id, label: subject.name })),
    ],
    [subjects],
  );

  const rows = list?.data ?? [];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.studentId) return toast.error("O'quvchini tanlang");
    if (!form.title.trim()) return toast.error("Yutuq nomini kiriting");
    if (!form.date) return toast.error("Sanani kiriting");

    const payload = {
      studentId: form.studentId,
      title: form.title.trim(),
      level: form.level,
      place: form.place,
      date: form.date,
      subjectId: form.subjectId || null,
      note: form.note.trim(),
    };

    const onSuccess = () => {
      setForm(null);
      toast.success(form.id ? "Yutuq yangilandi" : "Yutuq qo'shildi");
    };
    const onError = (err) =>
      toast.error(err.response?.data?.message || "Yutuqni saqlab bo'lmadi");

    if (form.id) updateAchievement({ id: form.id, ...payload }, { onSuccess, onError });
    else createAchievement(payload, { onSuccess, onError });
  };

  const handleDelete = (row) => {
    // ⚠️ Tasdiqsiz o'chirilmaydi: yutuq qatori o'tgan oy hisobotining
    // manbai va uni qaytarib bo'lmaydi
    if (!window.confirm(`"${row.title}" yutug'i o'chirilsinmi?`)) return;

    deleteAchievement(row.id, {
      onSuccess: () => toast.success("Yutuq o'chirildi"),
      onError: (err) => toast.error(err.response?.data?.message || "O'chirib bo'lmadi"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{formatMonthKey(month)}</span> davridagi
          yutuqlar
        </p>

        {canCreate && !form && (
          <Button size="sm" onClick={() => setForm(emptyForm())}>
            <Plus className="size-4" />
            Yangi yutuq
          </Button>
        )}
      </div>

      {/* ── Kiritish formasi ─────────────────────────────────────────── */}
      {form && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-100 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="O'quvchi">
              <SelectSearch
                value={form.studentId}
                options={studentOptions}
                triggerClassName="w-full"
                placeholder="O'quvchini tanlang"
                searchPlaceholder="O'quvchini qidirish..."
                onChange={(value) => setForm((prev) => ({ ...prev, studentId: value }))}
              />
            </Field>

            <Field label="Yutuq nomi">
              <Input
                value={form.title}
                placeholder="O'zbekiston Matematika Olimpiadasi"
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Field>

            <Field label="Daraja">
              <Select
                value={form.level}
                options={options?.levels ?? []}
                triggerClassName="w-full"
                onChange={(value) => setForm((prev) => ({ ...prev, level: value }))}
              />
            </Field>

            <Field label="O'rin">
              <Select
                value={form.place}
                options={options?.places ?? []}
                triggerClassName="w-full"
                onChange={(value) => setForm((prev) => ({ ...prev, place: value }))}
              />
            </Field>

            <Field label="Sana">
              {/* ⚠️ `<input type="date">` qiymati ISO ("2026-09-03") — bu
                  format EMAS, mashina o'qiydigan qiymat. Ekranga esa
                  `formatDateUz` bilan chiqadi. */}
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </Field>

            <Field label="Fan (ixtiyoriy)">
              <Select
                value={form.subjectId}
                options={subjectOptions}
                triggerClassName="w-full"
                onChange={(value) => setForm((prev) => ({ ...prev, subjectId: value }))}
              />
            </Field>
          </div>

          <Field label="Izoh (ixtiyoriy)">
            <Input
              value={form.note}
              placeholder="Qo'shimcha ma'lumot"
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </Field>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? "Saqlanmoqda…" : form.id ? "Saqlash" : "Qo'shish"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSaving}
              onClick={() => setForm(null)}
            >
              Bekor qilish
            </Button>
          </div>
        </form>
      )}

      {/* ── Ro'yxat ──────────────────────────────────────────────────── */}
      <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex h-24 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Bu oyda yutuq qayd etilmagan
          </p>
        )}

        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{row.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {[row.student?.firstName, row.student?.lastName].filter(Boolean).join(" ")}
                {row.student?.className ? ` · ${row.student.className}` : ""} ·{" "}
                {formatDateUz(row.date)}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                {row.levelLabel} · {row.placeLabel}
                {row.subject ? ` · ${row.subject.name}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {canUpdate && (
                <IconButton
                  title="Tahrirlash"
                  icon={Pencil}
                  onClick={() =>
                    setForm({
                      id: row.id,
                      studentId: row.student?.id ?? "",
                      title: row.title,
                      level: row.level,
                      place: row.place,
                      // ⚠️ ISO ga qaytarish — `<input type="date">` faqat
                      // shu shaklni tushunadi
                      date: String(row.date).split("T")[0],
                      subjectId: row.subject?.id ?? "",
                      note: row.note ?? "",
                    })
                  }
                />
              )}
              {canDelete && (
                <IconButton
                  title="O'chirish"
                  icon={Trash2}
                  tone="danger"
                  onClick={() => handleDelete(row)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={() => close()}>
        <X className="size-4" />
        Yopish
      </Button>
    </div>
  );
};

/** Yorliq + maydon — formadagi qatorlar bir tekis tursin. */
const Field = ({ label, children }) => (
  <label className="block space-y-1">
    <span className="text-[11px] font-medium text-gray-500">{label}</span>
    {children}
  </label>
);

const IconButton = ({ icon: Icon, title, onClick, tone }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={
      tone === "danger"
        ? "rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        : "rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
    }
  >
    <Icon className="size-4" />
  </button>
);

export default AchievementsModal;
