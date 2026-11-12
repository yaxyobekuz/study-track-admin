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
import TopicMeta from "@/features/subjects/components/TopicMeta";
import LanguageBadge from "@/shared/components/ui/LanguageBadge";

// Hooks
import usePermissions from "@/shared/hooks/usePermissions";

// Icons
import { ArrowLeft, Edit2, Check, X, Users, TriangleAlert } from "lucide-react";

const SubjectTopics = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { can } = usePermissions();

  // Mavzu biriktirish — alohida ruxsat (`topics.assign`). Tugma yashirilmasa,
  // ruxsatsiz odam har bosganda 403 xatosini ko'rardi.
  const canAssign = can("topics.assign");

  /**
   * ⚠️ MAVZULAR RO'YXATI BU EKRANDA FAQAT DARAJA/KITOB BELGISI UCHUN.
   *
   * Sinflar boshqa-boshqa tilda bo'lishi mumkin va har sinfning joriy
   * mavzusi O'Z tilidagi ro'yxatdan hisoblanadi — nom va maxrajni SERVER
   * beradi (`currentTopicName`, `totalTopics`). Ro'yxatni bitta tilda
   * o'qib undan nom izlash rus guruhiga o'zbek mavzusini ko'rsatardi.
   */
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

  // ⚠️ Mavzu raqami `null` BO'LISHI MUMKIN: mavzular yuklanmagan, yaqin
  // kunlarda bu fandan dars yo'q yoki mavzular tugagan. Server sababni
  // `reason` da aytadi — ekranda "null-mavzu" chiqib qolmasligi kerak.
  const getTopicName = (item) => {
    if (item.currentTopicNumber == null) return null;
    // ⚠️ SERVER BERGAN NOM BIRINCHI: u sinfning TILIDAGI ro'yxatdan
    // olingan. Mahalliy ro'yxat faqat zaxira (nom kelmagan holat).
    return item.currentTopicName || `${item.currentTopicNumber}-mavzu`;
  };

  const handleEditClick = (item) => {
    setEditingClassId(item.class.id);
    setEditValue(item.currentTopicNumber != null ? String(item.currentTopicNumber) : "");
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

    // ⚠️ MAXRAJ SINFNING O'ZIDAN (`item.totalTopics`): rus guruhning
    // chegarasi o'zbek ro'yxatining uzunligi bo'lmasligi kerak.
    const limit = item.totalTopics ?? topics.length;
    if (limit && newNumber > limit) {
      toast.error(`Mavzu raqami ${limit} dan oshmasligi kerak`);
      return;
    }

    setSaving(true);
    try {
      await schedulesAPI.updateCurrentTopic(
        item.class.id,
        subjectId,
        newNumber,
      );

      // ⚠️ Cache QAYTA O'QILADI, qo'lda yamalmaydi: server mavzuni sinfning
      // KEYINGI darsiga biriktiradi va javobda sana, sabab hamda ankor ham
      // o'zgaradi. Faqat raqamni yamash ekranda eski sabab ("Mavzu
      // biriktirilmagan") ni qoldirib ketardi.
      qc.invalidateQueries({ queryKey: topicsKeys.all });

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
            // Maxraj — SINFNING tilidagi ro'yxat uzunligi (serverdan)
            const limit = item.totalTopics ?? topics.length;
            // ⚠️ Daraja/kitob belgisi faqat sinfning tili tanlangan
            // ro'yxat bilan BIR XIL bo'lsa ko'rsatiladi: boshqa tilning
            // kitobi noto'g'ri ma'lumot bo'lardi.
            const currentTopic =
              item.currentTopicNumber != null && item.language === "uz"
                ? topics.find((t) => t.order === item.currentTopicNumber)
                : null;

            return (
              <Card key={item.class.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Class Name */}
                    <h3 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-gray-900">
                      {item.class.name}
                      <LanguageBadge language={item.language} asClass />
                    </h3>

                    {/* Current Topic */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={limit || 999}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(item);
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                        <span className="text-sm text-gray-500">/ {limit}</span>
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
                            {item.currentTopicNumber ?? "—"}
                          </span>
                          <span className="text-gray-400">/ {limit}</span>
                          {canAssign && (
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="size-4" />
                            </button>
                          )}
                        </div>
                        <TopicMeta
                          level={currentTopic?.level}
                          book={currentTopic?.book}
                          className="mb-1"
                        />
                        <p className="text-sm text-gray-600">
                          {getTopicName(item) || item.reason || "Mavzu aniqlanmadi"}
                        </p>

                        {/* ⚠️ ANKOR BOSHQA TILDA YOZILGAN — jim tuzatilmaydi.
                            Sinfning tili o'zgarsa, eski ankorning raqami
                            boshqa kitobning mavzusiga tushadi: admin mavzuni
                            qayta biriktirishi kerak. */}
                        {item.languageMismatch && (
                          <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-700">
                            <TriangleAlert
                              className="mt-0.5 size-3.5 shrink-0"
                              strokeWidth={1.5}
                            />
                            <span>
                              Mavzu boshqa tildagi reja bo'yicha biriktirilgan —
                              qayta biriktiring
                            </span>
                          </p>
                        )}
                        {item.nextLesson && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Keyingi dars: {item.nextLesson.dateLabel},{" "}
                            {item.nextLesson.lessonOrder}-dars
                          </p>
                        )}
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
                        width: `${limit > 0 && item.currentTopicNumber != null ? (item.currentTopicNumber / limit) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {limit > 0 && item.currentTopicNumber != null
                      ? Math.round((item.currentTopicNumber / limit) * 100)
                      : 0}
                    % tugallangan
                  </p>
                </div>

                {/* ⚠️ GURUH ICHIGA KIRISH — har o'quvchiga alohida mavzu
                    o'rni va "bitta darsda nechta mavzu" qadami. Diagnostika
                    testining qamrovi aynan shu raqamdan quriladi. */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/subjects/${subjectId}/topics/${item.class.id}` +
                        `?from=/subjects/${subjectId}/topics`,
                    )
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Users className="size-4" strokeWidth={1.5} />
                  O'quvchilar bo'yicha
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectTopics;
