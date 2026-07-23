// Toast
import { toast } from "sonner";

// React
import { useMemo, useRef, useState } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link, useNavigate, useParams } from "react-router-dom";

// Icons
import { ChevronLeft, Plus, Trash2, X } from "lucide-react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Hooks
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { usersQueries } from "@/features/users/queries/users.queries";
import { useBulkCreateAssignment } from "../queries/test-seasons.mutations";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";

const createEmptyRow = (id) => ({ id, subject: "", teacher: "" });
const isRowComplete = (r) => Boolean(r.subject && r.teacher);

/**
 * Bir mavsum uchun ko'p biriktiruvni bittada qo'shish sahifasi.
 * Bir yoki bir nechta sinf tanlanadi, fan + o'qituvchi qatorlari ko'paytiriladi,
 * natija sinflar x qatorlar ko'paytmasi sifatida bulk yuboriladi.
 */
const CreateAssignmentsPage = () => {
  const { id: seasonId } = useParams();
  const navigate = useNavigate();
  const backTo = `/test-seasons/${seasonId}/assignments`;

  const rowIdRef = useRef(1);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [rows, setRows] = useState([createEmptyRow(0)]);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: bulkCreateAssignment } = useBulkCreateAssignment();

  // Mavsum (sarlavha uchun)
  const { data: season } = useQuery({
    queryKey: ["test-season", seasonId],
    queryFn: () => testSeasonsAPI.getOne(seasonId).then((res) => res.data.data),
  });

  // Reference ma'lumotlar (deduped, cached)
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: usersShort = [] } = useQuery(usersQueries.allShort());
  const teachers = usersShort.filter((u) => u.role === "teacher");

  const classOptions = useMemo(
    () => classes.map((c) => ({ label: c.name, value: c.id })),
    [classes],
  );

  const classNameById = useMemo(() => {
    const map = {};
    classes.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [classes]);

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ label: s.name, value: s.id })),
    [subjects],
  );

  const teacherOptions = useMemo(
    () =>
      teachers.map((t) => ({
        label:
          t.fullName ||
          `${t.firstName || ""} ${t.lastName || ""}`.trim() ||
          t.username,
        value: t.id,
      })),
    [teachers],
  );

  // Hali tanlanmagan sinflar (chip sifatida qo'shilgach ro'yxatdan chiqadi)
  const availableClassOptions = useMemo(
    () => classOptions.filter((o) => !selectedClasses.includes(o.value)),
    [classOptions, selectedClasses],
  );

  const completeRows = rows.filter(isRowComplete);
  const totalCount = selectedClasses.length * completeRows.length;

  // ── Sinflar ────────────────────────────────────────────────────────────────
  const addClass = (value) => {
    if (!value || selectedClasses.includes(value)) return;
    setSelectedClasses((prev) => [...prev, value]);
  };

  const removeClass = (value) => {
    setSelectedClasses((prev) => prev.filter((v) => v !== value));
  };

  // ── Fan + o'qituvchi qatorlari ───────────────────────────────────────────────
  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow(rowIdRef.current++)]);
  };

  const removeRow = (id) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length ? next : [createEmptyRow(rowIdRef.current++)];
    });
  };

  const setRowField = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Barcha fanlar uchun qator yaratish (mavjud o'qituvchi tanlovlarini saqlagan holda)
  const addAllSubjects = () => {
    const teacherBySubject = {};
    rows.forEach((r) => {
      if (r.subject && r.teacher) teacherBySubject[r.subject] = r.teacher;
    });
    setRows(
      subjects.map((s) => ({
        id: rowIdRef.current++,
        subject: s.id,
        teacher: teacherBySubject[s.id] || "",
      })),
    );
  };

  // ── Saqlash ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (selectedClasses.length === 0) {
      toast.error("Kamida bitta sinf tanlang");
      return;
    }
    if (completeRows.length === 0) {
      toast.error("Kamida bitta fan va o'qituvchi tanlang");
      return;
    }

    const items = [];
    selectedClasses.forEach((classId) => {
      completeRows.forEach((r) => {
        items.push({ class: classId, subject: r.subject, teacher: r.teacher });
      });
    });

    setIsLoading(true);

    bulkCreateAssignment(
      { season: seasonId, items },
      {
        onSuccess: (res) => {
          const { createdCount = 0, skippedCount = 0 } = res.data || {};

          if (createdCount > 0) {
            toast.success(
              skippedCount > 0
                ? `${createdCount} ta biriktiruv qo'shildi, ${skippedCount} ta o'tkazib yuborildi (mavjud)`
                : `${createdCount} ta biriktiruv qo'shildi`,
            );
            navigate(backTo);
          } else {
            toast.warning(
              "Yangi biriktiruv qo'shilmadi (barchasi allaqachon mavjud)",
            );
          }
        },
        onError: (error) =>
          toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center gap-2">
        <Link
          to={backTo}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="size-4" />
          Biriktiruvlar
        </Link>
      </div>

      <h1 className="page-title">
        {season?.name ? `${season.name} - ` : ""}Yangi biriktiruvlar
      </h1>

      {/* Sinflar */}
      <Card title="Sinflar" className="space-y-3">
        <SelectField
          searchable
          label="Sinf qo'shish"
          value=""
          options={availableClassOptions}
          triggerClassName="w-full sm:max-w-xs"
          onChange={addClass}
          placeholder="Sinfni tanlang"
          searchPlaceholder="Sinf qidirish..."
        />

        {selectedClasses.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedClasses.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
              >
                {classNameById[id] || "Sinf"}
                <X
                  className="size-3.5 cursor-pointer hover:text-blue-600"
                  onClick={() => removeClass(id)}
                />
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Bir yoki bir nechta sinf tanlang. Tanlangan fanlar har bir sinfga
            qo'llanadi.
          </p>
        )}
      </Card>

      {/* Fan + o'qituvchi qatorlari */}
      <Card title="Fan va o'qituvchilar" className="space-y-3">
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <SelectField
                searchable
                label="Fan"
                value={row.subject}
                options={subjectOptions}
                triggerClassName="w-full"
                className="flex-1"
                onChange={(v) => setRowField(row.id, "subject", v)}
                placeholder="Fanni tanlang"
                searchPlaceholder="Fan qidirish..."
              />

              <SelectField
                searchable
                label="O'qituvchi"
                value={row.teacher}
                options={teacherOptions}
                triggerClassName="w-full"
                className="flex-1"
                onChange={(v) => setRowField(row.id, "teacher", v)}
                placeholder="O'qituvchini tanlang"
                searchPlaceholder="O'qituvchi qidirish..."
              />

              <Button
                type="button"
                variant="secondary"
                onClick={() => removeRow(row.id)}
                className="size-10 p-0 shrink-0 text-red-600"
                title="Qatorni o'chirish"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={addRow}>
            <Plus className="size-4" strokeWidth={1.5} />
            Fan qo'shish
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={addAllSubjects}
            disabled={subjects.length === 0}
          >
            Barcha fanlarni qo'shish
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Jami <strong>{totalCount}</strong> biriktiruv yaratiladi
          {selectedClasses.length > 0 && completeRows.length > 0 && (
            <>
              {" "}
              ({selectedClasses.length} sinf × {completeRows.length} fan)
            </>
          )}
        </p>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(backTo)}
            disabled={isLoading}
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || totalCount === 0}
          >
            {isLoading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentsPage;
