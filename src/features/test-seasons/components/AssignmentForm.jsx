// Toast
import { toast } from "sonner";

// React
import { useEffect, useMemo } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useClasses } from "@/features/classes/queries/classes.queries";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { usersQueries } from "@/features/users/queries/users.queries";
import {
  useCreateAssignment,
  useEditAssignment,
} from "../queries/test-seasons.mutations";

// Components
import Button from "@/shared/components/ui/button/Button";
import SelectField from "@/shared/components/ui/select/SelectField";

/**
 * O'qituvchi biriktiruvini yaratish/tahrirlash formasi.
 * `season` prop majburiy - modal data sifatida uzatiladi va edit holatida
 * mavjud assignment maydonlari bilan birga keladi.
 */
const AssignmentForm = ({
  close,
  isLoading,
  setIsLoading,
  isEdit = false,
  seasonId,
  ...assignment
}) => {
  const { mutate: createAssignment } = useCreateAssignment();
  const { mutate: editAssignment } = useEditAssignment();

  const { class: classId, subject, teacher, setField, setFields } =
    useObjectState({
      class: "",
      subject: "",
      teacher: "",
    });

  useEffect(() => {
    if (isEdit && assignment.id) {
      setFields({
        class: assignment.class?.id || assignment.class || "",
        subject: assignment.subject?.id || assignment.subject || "",
        teacher: assignment.teacher?.id || assignment.teacher || "",
      });
    }
  }, [isEdit, assignment?.id]);

  // Reference ma'lumotlar (deduped, cached)
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: usersShort = [] } = useQuery(usersQueries.allShort());
  const teachers = usersShort.filter((u) => u.role === "teacher");

  const classOptions = useMemo(
    () => classes.map((c) => ({ label: c.name, value: c.id })),
    [classes],
  );

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!classId || !subject || !teacher) {
      toast.error("Sinf, fan va o'qituvchi tanlanishi kerak");
      return;
    }

    setIsLoading(true);

    const payload = { season: seasonId, class: classId, subject, teacher };

    const handlers = {
      onSuccess: () => {
        toast.success(isEdit ? "Biriktiruv yangilandi" : "Biriktiruv yaratildi");
        close();
      },
      onError: (error) =>
        toast.error(error.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) {
      editAssignment({ id: assignment.id, data: payload }, handlers);
    } else {
      createAssignment(payload, handlers);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        searchable
        required
        label="Sinf"
        value={classId}
        options={classOptions}
        triggerClassName="w-full"
        onChange={(v) => setField("class", v)}
        placeholder="Sinfni tanlang"
        searchPlaceholder="Sinf qidirish..."
      />

      <SelectField
        searchable
        required
        label="Fan"
        value={subject}
        options={subjectOptions}
        triggerClassName="w-full"
        onChange={(v) => setField("subject", v)}
        placeholder="Fanni tanlang"
        searchPlaceholder="Fan qidirish..."
      />

      <SelectField
        searchable
        required
        label="O'qituvchi"
        value={teacher}
        options={teacherOptions}
        triggerClassName="w-full"
        onChange={(v) => setField("teacher", v)}
        placeholder="O'qituvchini tanlang"
        searchPlaceholder="O'qituvchi qidirish..."
      />

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default AssignmentForm;
