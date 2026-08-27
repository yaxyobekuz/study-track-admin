// Utils
import { cn } from "@/shared/utils/cn";

/**
 * UMUMIY JADVAL — satr: sinf, ustun: dars, bitta kun uchun.
 *
 * O'quv bo'limi maktabni aynan shu ko'rinishda o'qiydi: "seshanba 3-darsda
 * qaysi sinf nima qilyapti?". Haftalik grid bu savolga javob bermaydi,
 * chunki unda bir vaqtning o'zida bitta sinf ko'rinadi.
 */
const TimetableDayMatrix = ({ classes, periods, lessonAt }) => {
  if (classes.length === 0 || periods.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-28 border-b border-r border-gray-200 bg-white px-3 py-2 text-left font-medium text-gray-700">
              Sinf
            </th>
            {periods.map((period) => (
              <th
                key={period.order}
                className="min-w-36 border-b border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-xs font-medium text-gray-600"
              >
                {period.order}-dars
                {period.startTime && (
                  <span className="block font-normal text-gray-400">
                    {period.startTime}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {classes.map((cls) => (
            <tr key={cls.id} className="group">
              <td className="sticky left-0 z-10 border-b border-r border-gray-100 bg-white px-3 py-1.5 font-medium text-gray-900 group-hover:bg-gray-50">
                {cls.name}
              </td>

              {periods.map((period) => {
                const lesson = lessonAt(cls.id, period.order);
                return (
                  <td
                    key={period.order}
                    className={cn(
                      "border-b border-gray-100 px-2 py-1.5 align-top",
                      !lesson && "bg-gray-50/40",
                    )}
                  >
                    {lesson ? (
                      <>
                        <span className="block truncate font-medium text-gray-900">
                          {lesson.subject.name}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {lesson.teacher.fullName}
                        </span>
                      </>
                    ) : (
                      <span className="block text-xs text-gray-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableDayMatrix;
