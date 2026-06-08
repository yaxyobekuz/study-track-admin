// Toast
import { toast } from "sonner";

// React
import { useEffect, useRef, useState } from "react";

// API
import { testSeasonsAPI } from "../api/testSeasons.api";

// Components
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

/**
 * Mavsum e'loni modali.
 * Biriktirilgan sinflar o'quvchilariga bot orqali e'lon yuboradi.
 * Avtomatik mavsum ma'lumoti + ixtiyoriy izoh. Sinflarni istisno qilish mumkin.
 */
const AnnounceSeasonModal = () => (
  <ResponsiveModal name="announceSeason" title="Mavsumni e'lon qilish">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, _id, name }) => {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [excluded, setExcluded] = useState([]); // istisno qilingan sinf ID lari
  const [note, setNote] = useState("");
  const isSubmittingRef = useRef(false);

  // Biriktirilgan sinflarni yuklash (modal har ochilganda Content qayta mount bo'ladi)
  useEffect(() => {
    if (!_id) return;
    testSeasonsAPI
      .getAnnounceClasses(_id)
      .then((res) => setClasses(res.data.data || []))
      .catch(() => toast.error("Sinflarni yuklashda xato"))
      .finally(() => setLoadingClasses(false));
  }, [_id]);

  const toggleClass = (classId) => {
    setExcluded((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId],
    );
  };

  const includedClasses = classes.filter((c) => !excluded.includes(c._id));
  const totalStudents = includedClasses.reduce(
    (sum, c) => sum + (c.studentCount || 0),
    0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (includedClasses.length === 0) {
      return toast.warning("Kamida bitta sinf tanlanishi kerak");
    }

    isSubmittingRef.current = true;
    setIsLoading(true);

    testSeasonsAPI
      .announce(_id, { note: note.trim(), excludedClassIds: excluded })
      .then((res) => {
        close();
        toast.success(res.data?.message || "E'lon navbatga qo'shildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => {
        isSubmittingRef.current = false;
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        <span className="font-medium">{name}</span> mavsumi e'loni biriktirilgan
        sinflar o'quvchilariga bot orqali yuboriladi.
      </p>

      {/* Izoh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Qo'shimcha izoh (ixtiyoriy)
        </label>
        <textarea
          rows={4}
          maxLength={1500}
          value={note}
          placeholder="E'longa qo'shimcha izoh..."
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      {/* Sinflar */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sinflar
        </label>

        {loadingClasses ? (
          <p className="text-sm text-gray-500 py-3">Yuklanmoqda...</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-gray-500 py-3">
            Bu mavsumga sinf biriktirilmagan.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {classes.map((c) => {
              const included = !excluded.includes(c._id);
              return (
                <label
                  key={c._id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() => toggleClass(c._id)}
                      className="size-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-900">{c.name}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {c.studentCount} o'quvchi
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Xulosa */}
      {classes.length > 0 && (
        <p className="text-sm text-gray-600">
          {includedClasses.length} sinf · <strong>{totalStudents}</strong>{" "}
          o'quvchiga yuboriladi
        </p>
      )}

      {/* Amallar */}
      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button
          className="w-full xs:w-32"
          disabled={isLoading || includedClasses.length === 0}
        >
          E'lon qilish{isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default AnnounceSeasonModal;
