// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Queries
import { useCreateTask } from "../queries/tasks.mutations";

// Components
import AssigneePicker from "./AssigneePicker";
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
  const { mutate: createTask } = useCreateTask();

  const { title, description, dueDate, penaltyPoints, setField } =
    useObjectState({
      title: "",
      description: "",
      dueDate: "",
      penaltyPoints: "1",
    });

  const [assignees, setAssignees] = useState([]);
  const [files, setFiles] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (assignees.length === 0) {
      toast.error("Kamida bitta ijrochi tanlash kerak");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("penaltyPoints", penaltyPoints || "1");
    formData.append("assigneeIds", JSON.stringify(assignees.map((u) => u.id)));

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
      <AssigneePicker
        value={assignees}
        disabled={isLoading}
        onChange={setAssignees}
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

      <Button disabled={isLoading || assignees.length === 0 || !title || !dueDate}>
        Yaratish{isLoading && "..."}
      </Button>
    </form>
  );
};

export default CreateTaskModal;
