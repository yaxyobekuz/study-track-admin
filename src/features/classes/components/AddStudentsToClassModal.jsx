// Toast
import { toast } from "sonner";

// React
import { useState, useEffect, useRef } from "react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Hooks
import { classesQueries } from "@/features/classes/queries/classes.queries";
import { useAddStudentsToClass } from "@/features/classes/queries/classes.mutations";

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
  const { mutate: addStudents } = useAddStudentsToClass();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const debounceRef = useRef(null);

  const existingSet = new Set(existingIds.map((id) => String(id)));

  // Qidiruv so'rovini debounce qilish
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Qidiruv natijalari (TanStack keshlab, oldingi sahifani saqlab turadi)
  const { data: allResults = [], isLoading: loadingResults } = useQuery(
    classesQueries.studentSearch(debouncedSearch),
  );

  // Sinfda allaqachon mavjud o'quvchilarni chiqarib tashlash
  const results = allResults.filter((s) => !existingSet.has(String(s.id)));

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAdd = (e) => {
    e.preventDefault();

    if (selected.length === 0) {
      return toast.warning("Kamida bitta o'quvchi tanlang");
    }

    setIsLoading(true);

    addStudents(
      { classId, studentIds: selected },
      {
        onSuccess: () => {
          close();
          toast.success("O'quvchilar sinfga qo'shildi");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
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
            const isSelected = selected.includes(student.id);

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => toggleStudent(student.id)}
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
