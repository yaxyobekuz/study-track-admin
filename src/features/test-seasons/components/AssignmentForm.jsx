// Toast
import { toast } from "sonner";

// React
import { useEffect, useMemo } from "react";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { teacherAssignmentsAPI } from "../api/teacherAssignments.api";
import { classesAPI } from "@/features/classes/api/classes.api";
import { subjectsAPI } from "@/features/subjects/api/subjects.api";
import { usersAPI } from "@/features/users/api/users.api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

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
  onSuccess,
  setIsLoading,
  isEdit = false,
  seasonId,
  ...assignment
}) => {
  const { class: classId, subject, teacher, setField, setFields } =
    useObjectState({
      class: "",
      subject: "",
      teacher: "",
    });

  useEffect(() => {
    if (isEdit && assignment._id) {
      setFields({
        class: assignment.class?._id || assignment.class || "",
        subject: assignment.subject?._id || assignment.subject || "",
        teacher: assignment.teacher?._id || assignment.teacher || "",
      });
    }
  }, [isEdit, assignment?._id]);

  // Sinflar
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesAPI.getAll().then((res) => res.data.data),
  });

  // Fanlar
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsAPI.getAll().then((res) => res.data.data),
  });

  // O'qituvchilar (qisqartirilgan ro'yxat - userlardan teacher roli)
  const { data: usersShort = [] } = useQuery({
    queryKey: ["users", "all-short"],
    queryFn: () => usersAPI.getAllShort().then((res) => res.data.data),
  });

  const classOptions = useMemo(
    () => classes.map((c) => ({ label: c.name, value: c._id })),
    [classes],
  );

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ label: s.name, value: s._id })),
    [subjects],
  );

  const teacherOptions = useMemo(
    () =>
      usersShort
        .filter((u) => u.role === "teacher")
        .map((u) => ({
          label: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username,
          value: u._id,
        })),
    [usersShort],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classId || !subject || !teacher) {
      toast.error("Sinf, fan va o'qituvchi tanlanishi kerak");
      return;
    }

    setIsLoading(true);

    try {
      const payload = { season: seasonId, class: classId, subject, teacher };

      let response;
      if (isEdit) {
        response = await teacherAssignmentsAPI.update(assignment._id, payload);
        toast.success("Biriktiruv yangilandi");
      } else {
        response = await teacherAssignmentsAPI.create(payload);
        toast.success("Biriktiruv yaratildi");
      }

      onSuccess(response.data.data);
      close();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
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
