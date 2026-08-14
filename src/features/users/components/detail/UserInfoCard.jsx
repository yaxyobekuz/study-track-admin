// Components
import Card from "@/shared/components/ui/Card";

/**
 * Tahrirlab bo'lmaydigan ma'lumotlar (username, rol, ro'yxatdan o'tgan sana)
 * uchun oddiy "yorliq — qiymat" kartasi.
 *
 * Forma bilan takrorlanmaydi: formada faqat o'zgartirsa bo'ladigan maydonlar
 * turadi, bu yerda esa qolgani.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {{label: string, value: React.ReactNode}[]} props.rows
 */
const UserInfoCard = ({ title, rows }) => (
  <Card title={title}>
    <dl className="mt-3 divide-y divide-gray-100">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-4 py-2.5 text-sm"
        >
          <dt className="text-gray-500 shrink-0">{row.label}</dt>
          <dd className="text-right font-medium text-gray-900">
            {row.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  </Card>
);

export default UserInfoCard;
