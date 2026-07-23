import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API
import { schedulesAPI } from "@/features/schedules/api/schedules.api";

// Queries
import {
  useSubjectTopics,
  topicsKeys,
} from "@/features/subjects/queries/topics.queries";

// Components
import Card from "@/shared/components/ui/Card";

// Icons
import { ArrowLeft, Edit2, Check, X } from "lucide-react";

const SubjectTopics = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Topics come from the shared subjects-feature cache.
  const { data: topics = [], isLoading: topicsLoading } =
    useSubjectTopics(subjectId);

  // Classes for this subject come from the schedules endpoint. Schedules has no
  // query module yet, so we read it here with an inline queryFn keyed under the
  // topics namespace, and patch the cache directly after editing a topic number.
  const schedulesKey = [...topicsKeys.all, "subject", subjectId, "classes"];
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: schedulesKey,
    queryFn: () => schedulesAPI.getBySubject(subjectId).then((r) => r.data),
    enabled: Boolean(subjectId),
  });

  const subject = schedules?.subject;
  const classesData = schedules?.data ?? [];

  const loading = topicsLoading || schedulesLoading;

  // Edit state
  const [editingClassId, setEditingClassId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const getTopicName = (topicNumber) => {
    const topic = topics.find((t) => t.order === topicNumber);
    return topic?.name || `${topicNumber}-mavzu`;
  };

  const handleEditClick = (item) => {
    setEditingClassId(item.class.id);
    setEditValue(String(item.currentTopicNumber));
  };

  const handleCancel = () => {
    setEditingClassId(null);
    setEditValue("");
  };

  const handleSave = async (item) => {
    const newNumber = parseInt(editValue, 10);

    if (isNaN(newNumber) || newNumber < 1) {
      toast.error("Mavzu raqami kamida 1 bo'lishi kerak");
      return;
    }

    if (newNumber > topics.length) {
      toast.error(`Mavzu raqami ${topics.length} dan oshmasligi kerak`);
      return;
    }

    setSaving(true);
    try {
      await schedulesAPI.updateCurrentTopic(
        item.class.id,
        subjectId,
        newNumber,
      );

      // Patch the cached classes for this subject with the new topic number.
      qc.setQueryData(schedulesKey, (prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((c) =>
                c.class.id === item.class.id
                  ? { ...c, currentTopicNumber: newNumber }
                  : c,
              ),
            }
          : prev,
      );

      toast.success("Mavzu raqami yangilandi");
      setEditingClassId(null);
    } catch (error) {
      console.error("Error updating topic:", error);
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {subject?.name || "Fan"}
        </h1>
      </div>

      {/* Classes List */}
      {classesData.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Bu fan hech qaysi sinf jadvalida yo'q
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesData.map((item) => {
            const isEditing = editingClassId === item.class.id;

            return (
              <Card key={item.class.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Class Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.class.name}
                    </h3>

                    {/* Current Topic */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={topics.length || 999}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(item);
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                        <span className="text-sm text-gray-500">
                          / {topics.length}
                        </span>
                        <button
                          onClick={() => handleSave(item)}
                          disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-blue-600">
                            {item.currentTopicNumber}
                          </span>
                          <span className="text-gray-400">
                            / {topics.length}
                          </span>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="size-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {getTopicName(item.currentTopicNumber)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${topics.length > 0 ? (item.currentTopicNumber / topics.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {topics.length > 0
                      ? Math.round(
                          (item.currentTopicNumber / topics.length) * 100,
                        )
                      : 0}
                    % tugallangan
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectTopics;
