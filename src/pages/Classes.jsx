import { useState, useEffect } from "react";
import { classesAPI } from "../api/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    grade: 1,
    section: "",
    academicYear: "2024-2025",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data.data);
    } catch (error) {
      toast.error("Sinflarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        name: classItem.name,
        grade: classItem.grade,
        section: classItem.section,
        academicYear: classItem.academicYear,
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: "",
        grade: 1,
        section: "",
        academicYear: "2024-2025",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = { ...formData };

      // Name ni avtomatik generate qilish
      data.name = `${data.grade}-${data.section.toUpperCase()}`;

      if (editingClass) {
        await classesAPI.update(editingClass._id, data);
        toast.success("Sinf muvaffaqiyatli yangilandi");
      } else {
        await classesAPI.create(data);
        toast.success("Sinf muvaffaqiyatli yaratildi");
      }

      handleCloseModal();
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    try {
      await classesAPI.delete(id);
      toast.success("Sinf muvaffaqiyatli o'chirildi");
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Yuklanmoqda...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sinflar</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="size-5 mr-2" strokeWidth={1.5} />
          Yangi sinf
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem._id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {classItem.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {classItem.academicYear} o'quv yili
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(classItem)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="size-5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleDelete(classItem._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="size-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    classItem.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {classItem.isActive ? "Faol" : "Faol emas"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Hozircha sinflar yo'q</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Sinfni tahrirlash" : "Yangi sinf"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sinf darajasi *
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grade: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
                    <option key={num} value={num}>
                      {num}-sinf
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bo'lim *
                </label>
                <input
                  type="text"
                  required
                  maxLength="1"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      section: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="A, B, C..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O'quv yili *
              </label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="2024-2025"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Sinf nomi:{" "}
                <strong>
                  {formData.grade}-{formData.section.toUpperCase() || "?"}
                </strong>
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingClass ? "Saqlash" : "Yaratish"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;
