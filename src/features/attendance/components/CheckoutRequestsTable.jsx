// Hooks
import useModal from "@/shared/hooks/useModal";

// Components
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { CHECKOUT_REQUEST_STATUS_COLORS } from "../data/attendance.data";

/**
 * Ketish so'rovlari jadvali. "Tugamagan ishlar" — so'rov yuborilgan
 * paytdagi MUHR (server `pendingItems`): o'qituvchi keyin baho qo'ysa ham
 * rahbar nimaga ruxsat so'ralganini ko'radi.
 */
const CheckoutRequestsTable = ({ requests, isLoading }) => {
  const { openModal } = useModal();

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Yuklanmoqda...</div>;
  }

  if (!requests.length) {
    return (
      <div className="py-12 text-center text-gray-500">
        Hozircha ketish so'rovlari yo'q
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table>
        <thead>
          <tr>
            <th className="px-4 py-3">O'qituvchi</th>
            <th className="px-4 py-3">Sana</th>
            <th className="px-4 py-3">Sabab</th>
            <th className="px-4 py-3">Tugamagan ishlar</th>
            <th className="px-4 py-3">Holat</th>
            <th className="px-4 py-3">Amal</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
            <tr key={req.id} className="align-top text-sm">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{req.userName}</p>
                <p className="text-xs text-gray-500">{req.username}</p>
              </td>

              <td className="px-4 py-3 text-gray-700">
                <p>{req.dateLabel}</p>
                <p className="text-xs text-gray-500">
                  Yuborildi: {req.createdAtLabel}
                </p>
              </td>

              <td className="max-w-xs px-4 py-3 text-gray-700">
                <p className="line-clamp-3 whitespace-pre-line">{req.reason}</p>
              </td>

              <td className="px-4 py-3 text-gray-700">
                <ul className="list-disc pl-4 text-xs">
                  {(req.pendingItems?.blockers ?? []).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </td>

              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                    CHECKOUT_REQUEST_STATUS_COLORS[req.status],
                  )}
                >
                  {req.statusLabel}
                </span>

                {req.reviewerName && (
                  <p className="mt-1 text-xs text-gray-500">
                    {req.reviewerName}, {req.reviewedAtLabel}
                  </p>
                )}
                {req.reviewNote && (
                  <p className="text-xs text-gray-500">Izoh: {req.reviewNote}</p>
                )}
                {req.usedAtLabel && (
                  <p className="text-xs text-green-700">
                    {req.usedAtLabel} da ketdi
                  </p>
                )}
              </td>

              <td className="px-4 py-3">
                {req.status === "pending" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openModal("reviewCheckoutRequest", { request: req })}
                  >
                    Ko'rib chiqish
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckoutRequestsTable;
