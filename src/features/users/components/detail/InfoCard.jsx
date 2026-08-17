// Icons
import { Pencil } from "lucide-react";

// Components
import Can from "@/shared/components/guards/Can";

/**
 * Detal sahifasining oq kartasi: sarlavha, o'ng yuqorida qalam tugmasi va
 * ichida "yorliq — qiymat" ro'yxati.
 *
 * Tahrirlash aynan shu yerdan boshlanadi: kartaning qalami faqat o'sha
 * kartaning maydonlarini ochadi. Shu tufayli sahifa o'qish uchun tinch
 * qoladi va bitta katta formani to'ldirish shart bo'lmaydi.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {() => void} [props.onEdit] - berilsa qalam tugmasi chiziladi
 * @param {string} [props.editPermission] - qalamni ko'rsatish uchun ruxsat
 * @param {{label: string, value: React.ReactNode}[]} [props.rows]
 * @param {React.ReactNode} [props.children] - `rows` o'rniga erkin kontent
 * @param {string} [props.className]
 */
const InfoCard = ({
  title,
  onEdit,
  editPermission = "users.update",
  rows,
  children,
  className = "",
}) => (
  <section className={`rounded-2xl bg-white p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <h2 className="font-semibold text-gray-900">{title}</h2>

      {onEdit && (
        <Can do={editPermission}>
          <button
            type="button"
            onClick={onEdit}
            title="Tahrirlash"
            className="-mr-1.5 -mt-1 shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </button>
        </Can>
      )}
    </div>

    <div className="mt-4">{rows ? <InfoRows rows={rows} /> : children}</div>
  </section>
);

/**
 * "Yorliq — qiymat" ro'yxati. Tor ekranda yorliq qiymat ustida turadi,
 * kengida ikkita ustunga bo'linadi.
 */
export const InfoRows = ({ rows }) => (
  <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-[minmax(110px,150px)_1fr]">
    {rows.map((row) => (
      <div key={row.label} className="contents">
        <dt className="text-sm font-medium text-gray-700">{row.label}</dt>
        <dd className="text-sm text-gray-500 max-sm:mt-0.5 max-sm:mb-1">
          {row.value ?? "—"}
        </dd>
      </div>
    ))}
  </dl>
);

export default InfoCard;
