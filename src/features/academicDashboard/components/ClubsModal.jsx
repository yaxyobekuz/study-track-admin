// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import { ArrowLeft, Ban, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";

// Components
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Utils
import { cn } from "@/shared/utils/cn";
import { formatDateUz } from "@/shared/utils/date.utils";

// Queries
import { usersQueries } from "@/features/users/queries/users.queries";
import { subjectsQueries } from "@/features/subjects/queries/subjects.queries";
import {
  academicQueries,
  useAddClubMembers,
  useCloseClubMember,
  useCreateClub,
  useDeleteClub,
  useRemoveClubMember,
  useUpdateClub,
} from "../queries/academicDashboard.queries";

const emptyForm = () => ({
  id: null,
  name: "",
  description: "",
  teacherId: "",
  subjectId: "",
  weeklyHours: "2",
  isActive: true,
});

/**
 * TO'GARAKLAR — ro'yxat, kiritish formasi va a'zolar boshqaruvi.
 *
 * ⚠️ IKKI KO'RINISH BITTA OYNADA: ro'yxat va bitta to'garakning a'zolari.
 * Ular alohida oyna qilinsa, "a'zo qo'shdim → qaysi to'garakka edi?" degan
 * yo'qotish paydo bo'lardi; bu yerda esa orqaga tugmasi bilan bir qadam.
 */
export const ClubsModal = () => (
  <ResponsiveModal name="academicClubs" title="To'garak va qo'shimcha darslar" className="max-w-3xl">
    <ClubsPanel />
  </ResponsiveModal>
);

const ClubsPanel = ({ close }) => {
  const { can } = usePermissions();

  // null → ro'yxat, id → o'sha to'garakning a'zolari
  const [openClubId, setOpenClubId] = useState(null);
  const [form, setForm] = useState(null);

  const canCreate = can("clubs.create");
  const canUpdate = can("clubs.update");
  const canDelete = can("clubs.delete");
  const canMembers = can("clubs.members");

  const { data: list, isLoading } = useQuery(academicQueries.clubs({ limit: 100 }));
  const { data: subjects = [] } = useQuery(subjectsQueries.list());
  const { data: allUsers = [] } = useQuery(usersQueries.allShort());

  const { mutate: createClub, isPending: isCreating } = useCreateClub();
  const { mutate: updateClub, isPending: isUpdating } = useUpdateClub();
  const { mutate: deleteClub } = useDeleteClub();

  const isSaving = isCreating || isUpdating;

  const teacherOptions = useMemo(
    () => [
      { value: "", label: "Rahbar biriktirilmagan" },
      ...allUsers
        .filter((user) => user.role !== "student")
        .map((user) => ({
          value: user.id,
          label: [user.firstName, user.lastName].filter(Boolean).join(" "),
        })),
    ],
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

    if (!form.name.trim()) return toast.error("To'garak nomini kiriting");

    const hours = Number(form.weeklyHours);
    if (!Number.isInteger(hours) || hours < 0) {
      return toast.error("Haftalik soat butun son bo'lishi kerak");
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      teacherId: form.teacherId || null,
      subjectId: form.subjectId || null,
      weeklyHours: hours,
      isActive: form.isActive,
    };

    const onSuccess = () => {
      setForm(null);
      toast.success(form.id ? "To'garak yangilandi" : "To'garak qo'shildi");
    };
    const onError = (err) =>
      toast.error(err.response?.data?.message || "To'garakni saqlab bo'lmadi");

    if (form.id) updateClub({ id: form.id, ...payload }, { onSuccess, onError });
    else createClub(payload, { onSuccess, onError });
  };

  const handleDelete = (row) => {
    if (!window.confirm(`"${row.name}" to'garagi o'chirilsinmi?`)) return;

    deleteClub(row.id, {
      onSuccess: () => toast.success("To'garak o'chirildi"),
      // ⚠️ A'zosi bor to'garak o'chirilmaydi — server aynan shu sababni
      // qaytaradi va u foydalanuvchiga ko'rsatiladi
      onError: (err) => toast.error(err.response?.data?.message || "O'chirib bo'lmadi"),
    });
  };

  if (openClubId) {
    return (
      <MembersPanel
        clubId={openClubId}
        canManage={canMembers}
        students={allUsers.filter((user) => user.role === "student")}
        onBack={() => setOpenClubId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          Faol to'garaklar dashboardda hisobga olinadi
        </p>

        {canCreate && !form && (
          <Button size="sm" onClick={() => setForm(emptyForm())}>
            <Plus className="size-4" />
            Yangi to'garak
          </Button>
        )}
      </div>

      {form && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-100 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nomi">
              <Input
                value={form.name}
                placeholder="Robototexnika"
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>

            <Field label="Rahbar (ixtiyoriy)">
              <Select
                value={form.teacherId}
                options={teacherOptions}
                triggerClassName="w-full"
                onChange={(value) => setForm((prev) => ({ ...prev, teacherId: value }))}
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

            <Field label="Haftalik soat">
              <Input
                type="number"
                min="0"
                step="1"
                value={form.weeklyHours}
                onChange={(e) => setForm((prev) => ({ ...prev, weeklyHours: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Izoh (ixtiyoriy)">
            <Input
              value={form.description}
              placeholder="Qisqacha ma'lumot"
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </Field>

          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={form.isActive}
              className="size-4 rounded border-gray-300"
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Faol (dashboardda hisobga olinadi)
          </label>

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

      <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex h-24 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Hali to'garak qo'shilmagan
          </p>
        )}

        {rows.map((row) => (
          <div key={row.id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium text-gray-800">
                {row.name}
                {!row.isActive && (
                  <span className="rounded bg-gray-100 px-1.5 text-[10px] font-medium text-gray-500">
                    nofaol
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {row.teacher
                  ? [row.teacher.firstName, row.teacher.lastName].filter(Boolean).join(" ")
                  : "Rahbarsiz"}
                {row.subject ? ` · ${row.subject.name}` : ""} · {row.weeklyHours} soat/hafta
              </p>
              <p className="mt-1 text-[11px] text-gray-400">{row.memberCount} ta a'zo</p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setOpenClubId(row.id)}
                className="rounded-lg px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/5"
              >
                A'zolar
              </button>

              {canUpdate && (
                <IconButton
                  title="Tahrirlash"
                  icon={Pencil}
                  onClick={() =>
                    setForm({
                      id: row.id,
                      name: row.name,
                      description: row.description ?? "",
                      teacherId: row.teacherId ?? "",
                      subjectId: row.subject?.id ?? "",
                      weeklyHours: String(row.weeklyHours ?? 0),
                      isActive: row.isActive,
                    })
                  }
                />
              )}
              {canDelete && (
                <IconButton title="O'chirish" icon={Trash2} tone="danger" onClick={() => handleDelete(row)} />
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

/**
 * BITTA TO'GARAKNING A'ZOLARI.
 *
 * ⚠️ A'zolik YOPILADI, o'chirilmaydi: o'tgan oylarning hisoboti shu
 * qatorlardan yig'iladi va o'chirilgan a'zo bilan birga o'tgan oyning
 * "428 o'quvchi" degan raqami ham o'zgarib ketardi. O'chirish faqat XATO
 * kiritilgan qator uchun.
 */
const MembersPanel = ({ clubId, canManage, students, onBack }) => {
  const [selected, setSelected] = useState("");

  const { data: club, isLoading } = useQuery(academicQueries.club(clubId));

  const { mutate: addMembers, isPending: isAdding } = useAddClubMembers();
  const { mutate: closeMember } = useCloseClubMember();
  const { mutate: removeMember } = useRemoveClubMember();

  // ⚠️ `club?.members ?? []` to'g'ridan-to'g'ri yozilsa, har renderda
  // YANGI massiv chiqib, quyidagi `useMemo` hech qachon keshlanmasdi
  const members = useMemo(() => club?.members ?? [], [club]);

  // ⚠️ Allaqachon FAOL a'zo ro'yxatda ko'rinmaydi: server takroriy
  // qo'shishni jim tashlab ketadi, ya'ni tanlash mumkin-u hech narsa
  // sodir bo'lmasdi
  const options = useMemo(() => {
    const active = new Set(
      members.filter((row) => row.endDate == null).map((row) => row.studentId),
    );

    return students
      .filter((user) => !active.has(user.id))
      .map((user) => ({
        value: user.id,
        label: [user.firstName, user.lastName].filter(Boolean).join(" "),
      }));
  }, [students, members]);

  const handleAdd = () => {
    if (!selected) return toast.error("O'quvchini tanlang");

    addMembers(
      { clubId, studentIds: [selected] },
      {
        onSuccess: () => {
          setSelected("");
          toast.success("O'quvchi qo'shildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Qo'shib bo'lmadi"),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" />
          To'garaklar
        </button>

        <p className="truncate text-xs font-medium text-gray-700">{club?.name ?? "…"}</p>
      </div>

      {canManage && (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-100 p-3">
          <div className="min-w-48 flex-1">
            <p className="mb-1 text-[11px] font-medium text-gray-500">O'quvchi qo'shish</p>
            <SelectSearch
              value={selected}
              options={options}
              triggerClassName="w-full"
              placeholder="O'quvchini tanlang"
              searchPlaceholder="O'quvchini qidirish..."
              onChange={setSelected}
            />
          </div>

          <Button size="sm" disabled={isAdding} onClick={handleAdd}>
            <UserPlus className="size-4" />
            {isAdding ? "Qo'shilmoqda…" : "Qo'shish"}
          </Button>
        </div>
      )}

      <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
        {isLoading && (
          <div className="flex h-24 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
          </div>
        )}

        {!isLoading && members.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
            Hali a'zo qo'shilmagan
          </p>
        )}

        {members.map((row) => (
          <div key={row.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {[row.student?.firstName, row.student?.lastName].filter(Boolean).join(" ")}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">
                {row.student?.className ?? "—"} · {formatDateUz(row.startDate)} dan
                {row.endDate ? ` ${formatDateUz(row.endDate)} gacha` : ""}
              </p>
            </div>

            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                row.endDate == null
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 text-gray-500",
              )}
            >
              {row.endDate == null ? "faol" : "yopilgan"}
            </span>

            {canManage && (
              <div className="flex shrink-0 items-center gap-1">
                {row.endDate == null && (
                  <IconButton
                    title="A'zolikni yopish"
                    icon={Ban}
                    onClick={() =>
                      closeMember(
                        { clubId, memberId: row.id },
                        {
                          onSuccess: () => toast.success("A'zolik yopildi"),
                          onError: (err) =>
                            toast.error(err.response?.data?.message || "Yopib bo'lmadi"),
                        },
                      )
                    }
                  />
                )}

                <IconButton
                  title="Xato yozuvni o'chirish"
                  icon={Trash2}
                  tone="danger"
                  onClick={() => {
                    if (!window.confirm("A'zolik yozuvi butunlay o'chirilsinmi?")) return;

                    removeMember(
                      { clubId, memberId: row.id },
                      {
                        onSuccess: () => toast.success("A'zolik o'chirildi"),
                        onError: (err) =>
                          toast.error(err.response?.data?.message || "O'chirib bo'lmadi"),
                      },
                    );
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

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

export default ClubsModal;
