// Utils
import { cn } from "@/shared/utils/cn";

// Components
import Tooltip from "@/shared/components/ui/tooltip/Tooltip";

// Data
import { STATUS_DOT_COLORS, STATUS_LABELS } from "../data/attendance.data";

const AttendanceTable = ({ records, month, year }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const byUser = {};
  records.forEach((rec) => {
    const uid = rec.user?._id || rec.user;
    if (!byUser[uid]) {
      byUser[uid] = { user: rec.user, days: {} };
    }

    const day = new Date(rec.date).getUTCDate();
    byUser[uid].days[day] = rec;
  });

  const userRows = Object.values(byUser);

  if (userRows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Bu oy uchun davomat ma'lumotlari yo'q
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full text-sm">
        {/* Thead */}
        <thead>
          <tr>
            <th className="w-40">Foydalanuvchi</th>

            {days.map((d) => (
              <th key={d} className="p-0 w-8">
                {d}
              </th>
            ))}
          </tr>
        </thead>

        {/* Tbody */}
        <tbody>
          {userRows.map(({ user, days: userDays }) => (
            <tr key={user?._id}>
              {/* Full Name */}
              <td className="p-0">
                <div className="flex flex-col justify-center h-12 px-4">
                  <p className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName?.[0]}.
                  </p>

                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </td>

              {/* Days */}
              {days.map((d) => {
                const rec = userDays[d];

                if (!rec) {
                  return (
                    <td key={d} className="p-0">
                      <div className="flex items-center justify-center w-8 h-12">
                        <span className="inline-block size-4 rounded-full bg-gray-200" />
                      </div>
                    </td>
                  );
                }

                return (
                  <td key={d} className="p-0">
                    <div className="flex items-center justify-center w-8 h-12">
                      <Tooltip content={<TooltipContent record={rec} />}>
                        <button
                          className={cn(
                            STATUS_DOT_COLORS[rec.status],
                            "size-4 rounded-full cursor-pointer outline-none transition-transform duration-200 focus:scale-150 hover:scale-150",
                          )}
                        />
                      </Tooltip>
                    </div>
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

const TooltipContent = ({ record }) => (
  <div className="space-y-1">
    <b className="font-bold">{STATUS_LABELS[record.status]}</b>

    {record.checkIn && (
      <p>
        Keldi:{" "}
        {new Date(record.checkIn).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    )}

    {record.checkOut && (
      <p>
        Ketdi:{" "}
        {new Date(record.checkOut).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    )}

    {record.isLate && (
      <p className="text-yellow-300">{record.lateMinutes} daqiqa kech</p>
    )}

    {record.isEarlyOut && (
      <p className="text-orange-300">
        {record.earlyOutMinutes} daqiqa erta ketdi
      </p>
    )}

    {record.outOfOffice && <p className="text-red-300">Ofisdan tashqarida</p>}
  </div>
);

export default AttendanceTable;
