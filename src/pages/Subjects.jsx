// Components
import Card from "@/components/Card";
import Button from "@/components/form/button";

// Icons
import { Plus, Edit, Trash2 } from "lucide-react";

// Hooks
import useModal from "@/hooks/useModal.hook";
import useArrayStore from "@/hooks/useArrayStore.hook";

const Subjects = () => {
  const { openModal } = useModal();
  const { data: subjects, isLoading } = useArrayStore("subjects");

  if (isLoading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      {/* Create New Btn */}
      <Button onClick={() => openModal("createSubject")} className="px-3.5 mb-6">
        <Plus className="size-5 mr-2" strokeWidth={1.5} />
        Yangi fan
      </Button>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card key={subject._id}>
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {subject.name}
              </h3>

              {/* Action buttons */}
              <div className="flex gap-3.5">
                {/* Edit */}
                <button
                  onClick={() => openModal("editSubject", subject)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="size-5" strokeWidth={1.5} />
                </button>

                {/* Delete */}
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => openModal("deleteSubject", subject)}
                >
                  <Trash2 className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Description */}
            {subject.description && (
              <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
            )}

            {/* Bottom */}
            <div className="flex items-center justify-between pt-4 border-t space-y-3">
              <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">
                {subject.isActive ? "Faol" : "Faol emas"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Hozircha fanlar yo'q</p>
        </div>
      )}
    </div>
  );
};

export default Subjects;
