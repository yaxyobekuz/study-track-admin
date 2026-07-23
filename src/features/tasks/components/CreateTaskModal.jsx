// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useRoles } from "@/features/roles/queries/roles.queries";

// Queries
import { useTaskAssignees } from "../queries/tasks.queries";
import { useCreateTask } from "../queries/tasks.mutations";

// Helpers
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Components
import MultiSelect from "@/shared/components/form/multi-select";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

const CreateTaskModal = () => (
  <ResponsiveModal
    name="createTask"
    title="Topshiriq yaratish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading }) => {
  const { data: roles = [] } = useRoles();
  const { mutate: createTask } = useCreateTask();

  const { title, description, dueDate, penaltyPoints, setField } =
    useObjectState({
      title: "",
      description: "",
      dueDate: "",
      penaltyPoints: "1",
    });

  const [assigneeIds, setAssigneeIds] = useState([]);
  const [files, setFiles] = useState(null);

  const { data: usersData = [], isLoading: usersLoading } = useTaskAssignees();

  const userOptions = usersData
    .filter((u) => u.role !== "owner")
    .map((u) => ({
      label: `${u.firstName}${u.lastName ? ` ${u.lastName}` : ""} (${getRoleLabel(u.role, roles)})`,
      value: u.id,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (assigneeIds.length === 0) {
      toast.error("Kamida bitta ijrochi tanlash kerak");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("penaltyPoints", penaltyPoints || "1");
    formData.append("assigneeIds", JSON.stringify(assigneeIds));

    if (files) {
      for (const file of files) formData.append("files", file);
    }

    setIsLoading(true);
    createTask(formData, {
      onSuccess: (res) => {
        close();
        const count = res?.data?.length || 1;
        toast.success(`${count} ta topshiriq yaratildi`);
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <MultiSelect
        required
        label="Ijrochilar"
        value={assigneeIds}
        options={userOptions}
        disabled={usersLoading}
        onChange={setAssigneeIds}
        placeholder={
          usersLoading ? "Yuklanmoqda..." : "Ijrochilarni tanlang..."
        }
      />

      <InputField
        required
        value={title}
        maxLength={300}
        label="Sarlavha"
        onChange={(e) => setField("title", e.target.value)}
      />

      <InputField
        required
        label="Tavsif"
        type="textarea"
        value={description}
        onChange={(e) => setField("description", e.target.value)}
        maxLength={1000}
      />

      <InputField
        required
        value={dueDate}
        label="Ijro muddati"
        type="datetime-local"
        onChange={(e) => setField("dueDate", e.target.value)}
      />

      <InputField
        required
        min={1}
        type="number"
        label="Jarima bali"
        value={penaltyPoints}
        onChange={(e) => setField("penaltyPoints", e.target.value)}
        description="Topshiriq muddatida bajarilmasa beriladigan jarima bali"
      />

      <InputField
        multiple
        type="file"
        label="Fayllar (ixtiyoriy)"
        onChange={(e) => setFiles(e.target.files)}
        accept="image/*,video/mp4,video/webm,application/pdf"
      />

      <Button disabled={isLoading || assigneeIds.length === 0 || !title || !dueDate}>
        Yaratish{isLoading && "..."}
      </Button>
    </form>
  );
};

export default CreateTaskModal;
