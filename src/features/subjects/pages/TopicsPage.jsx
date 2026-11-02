// Toast
import { toast } from "sonner";

// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useModal from "@/shared/hooks/useModal";
import { useSubjects } from "@/features/subjects/queries/subjects.queries";
import { useSubjectTopics } from "@/features/subjects/queries/topics.queries";
import { useDeleteSubjectTopics } from "@/features/subjects/queries/topics.mutations";

// API
import { topicsAPI } from "@/features/subjects/api/topics.api";

// Utils
import {
  downloadBlob,
  readBlobErrorMessage,
} from "@/shared/utils/download.utils";

// Icons
import { Upload, Download, Trash2, BookOpen, Users } from "lucide-react";

const Topics = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { data: subjects = [] } = useSubjects();

  const [selectedSubject, setSelectedSubject] = useState(
    () => localStorage.getItem("topics_selectedSubject") || "",
  );

  // Topics for the selected subject. The upload mutation invalidates the topics
  // cache, so newly uploaded topics show up here without any manual listener.
  const { data: topics = [], isLoading: loading } =
    useSubjectTopics(selectedSubject);

  const { mutate: deleteSubjectTopics } = useDeleteSubjectTopics();

  const [exporting, setExporting] = useState(false);

  // Daraja va Kitob ustunlari faqat fanning faylida bo'lsa chiqadi: eski
  // shablon (Mavzu nomi, Tavsif) bilan yuklangan fanda ular har qatorda
  // "—" bo'lib, jadvalni bo'sh ustunlarga to'ldirardi.
  const hasLevel = topics.some((topic) => topic.level);
  const hasBook = topics.some((topic) => topic.book);

  useEffect(() => {
    if (selectedSubject) {
      localStorage.setItem("topics_selectedSubject", selectedSubject);
    } else {
      localStorage.removeItem("topics_selectedSubject");
    }
  }, [selectedSubject]);

  /**
   * MAVZULARNI EXCEL'GA YUKLAB OLISH.
   *
   * ⚠️ Fayl — QAYTA YUKLASH SHABLONI, hisobot emas: ustunlar va varaq
   * nomlari "Mavzular yuklash" kutadigan shaklda. Platformada mavzuni
   * tahrirlash yo'li yo'q, shuning uchun tuzatish yo'li aynan shu:
   * yuklab olish → Excel'da tahrirlash → qayta yuklash.
   *
   * Fan tanlanmagan bo'lsa — mavzusi bor HAMMA fan (har biri alohida
   * varaqda), ya'ni butun rejaning zaxira nusxasi.
   */
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await topicsAPI.export(selectedSubject || null);
      downloadBlob(response, "mavzular.xlsx");
    } catch (error) {
      toast.error(
        await readBlobErrorMessage(error, "Mavzularni yuklab bo'lmadi"),
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllTopics = () => {
    if (!selectedSubject) return;

    const selectedSubjectName =
      subjects.find((s) => s.id === selectedSubject)?.name || "Bu fan";

    const confirmed = window.confirm(
      `${selectedSubjectName} uchun barcha mavzular o'chiriladi. Davom etishni xohlaysizmi?`,
    );

    if (!confirmed) return;

    deleteSubjectTopics(selectedSubject, {
      onSuccess: (res) => toast.success(res.message),
      onError: (error) =>
        toast.error(
          error.response?.data?.message || "Mavzularni o'chirishda xatolik",
        ),
    });
  };

  return (
    <div>
      {/* Filters and Actions */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select
              label="Fan"
              value={selectedSubject}
              onChange={(value) => setSelectedSubject(value)}
              options={subjects.map((subject) => ({
                label: subject.name,
                value: subject.id,
              }))}
              placeholder="Fanni tanlang"
            />
          </div>

          <div className="flex gap-3 items-end">
            {/* Fan tanlangan bo'lsa — o'sha fan, aks holda mavzusi bor
                hamma fan. Mavzusi yo'q fanda tugma o'chiq: server ham rad
                etadi, lekin bo'sh fayl kutib turish ortiqcha. */}
            <Button
              className="px-5"
              variant="outline"
              disabled={
                exporting ||
                Boolean(selectedSubject && (loading || topics.length === 0))
              }
              onClick={handleExport}
            >
              <Download className="size-4 mr-2" strokeWidth={1.5} />
              {exporting
                ? "Tayyorlanmoqda..."
                : selectedSubject
                  ? "Yuklab olish"
                  : "Hammasini yuklab olish"}
            </Button>

            <Button
              className="px-5"
              variant="default"
              onClick={() => openModal("uploadTopics")}
            >
              <Upload className="size-4 mr-2" strokeWidth={1.5} />
              Mavzular yuklash
            </Button>

            {selectedSubject && topics.length > 0 && (
              <Button
                className="px-5"
                variant="danger"
                onClick={handleDeleteAllTopics}
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {selectedSubject && (
        <Card className="flex justify-end mb-6">
          <Button
            className="px-5"
            variant="default"
            onClick={() => navigate(`/subjects/${selectedSubject}/topics`)}
          >
            <Users className="size-4 mr-2" strokeWidth={1.5} />
            Sinflar
          </Button>
        </Card>
      )}

      {/* Topics List */}
      {selectedSubject && (
        <div>
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Yuklanmoqda...</p>
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-center py-12">
              <BookOpen
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                strokeWidth={1.5}
              />

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Mavzular topilmadi
              </h3>

              <p className="text-gray-600 mb-4">
                Bu fan uchun hali mavzular yuklanmagan
              </p>
            </div>
          )}

          {!loading && topics.length > 0 && (
            <div className="rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                {/* ⚠️ Sarlavha `text-left`: global uslub `th` ni markazga
                    tekislaydi, katakdagi matn esa chapda turadi — keng
                    ustunda sarlavha ma'lumotdan "siljib" ko'rinardi.
                    Kenglik — Daraja/Kitob qisqa, Mavzu va mazmun keng. */}
                <thead>
                  <tr>
                    {/* Platforma bergan mavzu raqami (jadvaldagi "N-mavzu"),
                        fayldagi T/R EMAS — u yuklashda o'qilmaydi */}
                    <th className="w-16 text-left whitespace-nowrap">№</th>
                    {hasLevel && <th className="w-40 text-left">Daraja</th>}
                    {hasBook && <th className="w-56 text-left">Kitob</th>}
                    <th className="min-w-[260px] text-left">Mavzu</th>
                    <th className="min-w-[300px] text-left">Nimalar o'rgatiladi</th>
                  </tr>
                </thead>

                <tbody>
                  {topics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {topic.order}
                      </td>
                      {hasLevel && (
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {topic.level || "—"}
                        </td>
                      )}
                      {hasBook && (
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {topic.book || "—"}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {topic.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {topic.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Topics;
