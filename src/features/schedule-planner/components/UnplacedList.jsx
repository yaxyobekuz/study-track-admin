// Icons
import { CircleAlert } from "lucide-react";

/**
 * JOYLASHMAGAN DARSLAR — odam tilida.
 *
 * Bu ro'yxat jim qolmasligi kerak: "98%" degan raqamning o'zi qaysi darsni
 * qo'lda joylash kerakligini ham, nega joylashmaganini ham aytmaydi.
 */
const UnplacedList = ({ items = [], classes = [], subjects = [], teachers = [] }) => {
  if (items.length === 0) return null;

  const classMap = new Map(classes.map((c) => [c.id, c.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t.fullName]));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CircleAlert size={18} strokeWidth={1.5} className="text-amber-500" />
        <h3 className="font-medium text-gray-900">
          Joylashtirib bo'lmagan darslar
        </h3>
      </div>

      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-xl bg-amber-50 px-3 py-2 text-sm"
          >
            <span className="font-medium text-amber-900">
              {subjectMap.get(item.subjectId) ?? "Fan"}
            </span>
            <span className="text-amber-800">
              · {classMap.get(item.classId) ?? "Sinf"}
            </span>
            <span className="text-amber-800">
              · {teacherMap.get(item.teacherId) ?? "O'qituvchi"}
            </span>
            <span className="text-amber-800">· {item.missing} soat</span>
            <span className="text-amber-700/80">— {item.reason}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-gray-500">
        Ularni "Dars jadvali" tabida bo'sh katakka qo'lda qo'yish yoki
        sozlamalarni yumshatib qayta shakllantirish mumkin.
      </p>
    </div>
  );
};

export default UnplacedList;
