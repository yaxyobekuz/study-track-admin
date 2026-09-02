/**
 * Diagramma tooltip'ining yagona qobig'i.
 *
 * To'rtta diagramma bir xil ramkani (`rounded-xl border ... shadow-lg`) va
 * bir xil qator ko'rinishini (nuqta — nom — o'ngda qiymat) takrorlayotgan
 * edi. Recharts har bir diagrammaga o'z `payload` shaklini beradi, shuning
 * uchun MOSLASH har bir diagrammada qoladi, KO'RINISH esa shu yerda:
 * chaqiruvchi faqat sarlavha va tayyor qatorlarni uzatadi.
 *
 * @param {object} props
 * @param {string} props.title - tepadagi sarlavha (odatda o'q yorlig'i)
 * @param {Array<{key: string, color?: string, name: string, value: string}>} props.rows
 *   `value` — TAYYOR MATN: "—" bo'lishi mumkin, shuning uchun bu yerda
 *   raqamga aylantirilmaydi va formatlanmaydi.
 */
const ChartTooltip = ({ title, rows = [] }) => {
  if (!rows.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      {title && <p className="text-xs font-medium text-gray-900">{title}</p>}

      <div className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2 text-xs">
            {row.color && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color }}
              />
            )}
            <span className="text-gray-500">{row.name}</span>
            <span className="ml-auto pl-3 font-medium text-gray-900">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartTooltip;
