// Toast
import { toast } from "sonner";

// TanStack Query
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";
import { usersAPI } from "@/features/users/api/users.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import SelectField from "@/shared/components/ui/select/SelectField";

const ExemptTeachersModal = () => (
  <ResponsiveModal
    name="exemptTeachersModal"
    title="Istisno ustozlar"
    description="Tanlangan ustozlarga baho qo'ymaslik uchun jarima berilmaydi"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close }) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["penalties", "grade-settings"],
    queryFn: () =>
      penaltiesAPI.getGradePenaltySettings().then((res) => res.data.data),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users", "all-users-short"],
    queryFn: () => usersAPI.getAllShort().then((res) => res.data.data),
  });

  const teachers = allUsers.filter((u) => u.role === "teacher");
  const teacherOptions = teachers.map((u) => ({
    value: u._id,
    label: `${u.firstName} ${u.lastName || ""}`,
  }));

  const currentExemptIds = (settings?.exemptTeachers || []).map((t) =>
    typeof t === "object" ? t._id : t,
  );

  const saveMutation = useMutation({
    mutationFn: (ids) =>
      penaltiesAPI.updateGradePenaltySettings({ exemptTeachers: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties", "grade-settings"] });
      close();
      toast.success("Istisno ustozlar saqlandi");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const toggleTeacher = (id) => {
    const updated = currentExemptIds.includes(id)
      ? currentExemptIds.filter((tid) => tid !== id)
      : [...currentExemptIds, id];
    saveMutation.mutate(updated);
  };

  const removeTeacher = (id) => {
    saveMutation.mutate(currentExemptIds.filter((tid) => tid !== id));
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const exemptTeachersList = (settings?.exemptTeachers || []).map((t) =>
    typeof t === "object"
      ? t
      : teachers.find((u) => u._id === t),
  ).filter(Boolean);

  const availableOptions = teacherOptions.filter(
    (opt) => !currentExemptIds.includes(opt.value),
  );

  return (
    <div className="space-y-4">
      <SelectField
        label="Ustoz qo'shish"
        searchable
        value=""
        options={availableOptions}
        emptyText="Barcha ustozlar qo'shilgan"
        placeholder="Ustoz tanlang..."
        onChange={(id) => {
          if (id) toggleTeacher(id);
        }}
      />

      {exemptTeachersList.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Istisno ustozlar:</p>
          <div className="flex flex-wrap gap-2">
            {exemptTeachersList.map((teacher) => (
              <span
                key={teacher._id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
              >
                {teacher.firstName} {teacher.lastName}
                <button
                  type="button"
                  onClick={() => removeTeacher(teacher._id)}
                  className="hover:text-blue-900 font-medium"
                  disabled={saveMutation.isPending}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Hech qanday istisno ustoz yo'q</p>
      )}

      <Button variant="outline" onClick={close}>
        Yopish
      </Button>
    </div>
  );
};

export default ExemptTeachersModal;
