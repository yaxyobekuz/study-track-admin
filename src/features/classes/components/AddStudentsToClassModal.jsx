// Toast
import { toast } from "sonner";

// React
import { useState, useEffect, useRef } from "react";

// API
import { usersAPI } from "@/features/users/api/users.api";
import { classesAPI } from "@/features/classes/api/classes.api";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Components
import Input from "@/shared/components/ui/input/Input";
import Button from "@/shared/components/ui/button/Button";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Icons
import { Check, Search } from "lucide-react";

const AddStudentsToClassModal = () => (
  <ResponsiveModal
    name="addStudentsToClass"
    title="O'quvchilarni qo'shish"
    className="max-w-lg"
  >
    <Content />
  </ResponsiveModal>
);

const Content = ({
  close,
  isLoading,
  setIsLoading,
  classId,
  existingIds = [],
}) => {
  const { setCollection, setCollectionLoadingState, invalidateCache } =
    useArrayStore();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [selected, setSelected] = useState([]);
  const debounceRef = useRef(null);

  const existingSet = new Set(existingIds.map((id) => String(id)));

  // Qidiruv natijalarini yuklash (debounce bilan)
  useEffect(() => {
    let active = true;

    debounceRef.current = setTimeout(() => {
      setLoadingResults(true);

      usersAPI
        .getAll({ role: "student", search: search.trim(), limit: 50 })
        .then((res) => {
          if (!active) return;
          // Sinfda allaqachon mavjud o'quvchilarni chiqarib tashlash
          const list = (res.data.data || []).filter(
            (s) => !existingSet.has(String(s._id)),
          );
          setResults(list);
        })
        .catch(() => active && toast.error("O'quvchilarni yuklashda xatolik"))
        .finally(() => active && setLoadingResults(false));
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const refetchClassStudents = () => {
    const collectionName = `class-students-${classId}`;
    setCollectionLoadingState(true, collectionName);

    usersAPI
      .getAll({ role: "student", class: classId, limit: 200 })
      .then((res) => setCollection(res.data.data || [], null, collectionName))
      .catch(() => setCollection([], true, collectionName));
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (selected.length === 0) {
      return toast.warning("Kamida bitta o'quvchi tanlang");
    }

    setIsLoading(true);

    classesAPI
      .addStudents(classId, selected)
      .then(() => {
        close();
        refetchClassStudents();
        invalidateCache("users");
        toast.success("O'quvchilar sinfga qo'shildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleAdd} className="flex flex-col gap-3.5">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          strokeWidth={1.5}
        />
        <Input
          autoFocus
          type="search"
          value={search}
          className="pl-9"
          placeholder="Ism, familiya yoki username bo'yicha qidirish..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <p className="text-sm text-gray-500">
          {selected.length} ta o'quvchi tanlandi
        </p>
      )}

      {/* Results list */}
      <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-100">
        {loadingResults && (
          <p className="py-6 text-center text-sm text-gray-500">
            Yuklanmoqda...
          </p>
        )}

        {!loadingResults && results.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            O'quvchi topilmadi
          </p>
        )}

        {!loadingResults &&
          results.map((student) => {
            const isSelected = selected.includes(student._id);

            return (
              <button
                key={student._id}
                type="button"
                onClick={() => toggleStudent(student._id)}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">@{student.username}</p>
                </div>

                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="size-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
      </div>

      <div className="flex flex-col-reverse gap-3.5 w-full mt-2 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button
          className="w-full xs:w-32"
          disabled={isLoading || selected.length === 0}
        >
          Qo'shish
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default AddStudentsToClassModal;
