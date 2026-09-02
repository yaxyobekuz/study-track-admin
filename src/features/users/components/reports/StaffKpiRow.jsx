// Components
import Counter from "@/shared/components/ui/Counter";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { KPI_ACCENTS, buildKpiCards } from "../../data/staffReport.data";

/**
 * Sahifaning birinchi qatori — beshta KPI kartasi.
 *
 * Kartalarning tarkibi ATAYLAB shu yerda hisoblanmaydi: `buildKpiCards`
 * payload'ni yagona joyda o'qiydi, shuning uchun bu komponent "nimani
 * ko'rsatish" emas, faqat "qanday ko'rsatish" bilan shug'ullanadi. Karta
 * qo'shish yoki oxirgi kartaning ma'nosini o'zgartirish uchun ham shu
 * fayl emas, `staffReport.data.js` tahrirlanadi.
 *
 * Qiymat ikki xil bo'lishi mumkin: dastlabki to'rt kartada RAQAM (jonli
 * sanaladi), oxirgisida esa tayyor satr ("92.4%" yoki ma'lumot bo'lmasa
 * "—"). Shu sababli `Counter` ga faqat raqam beriladi — satr berilsa
 * animatsiya uni nolga aylantirib yuborardi.
 *
 * Izoh qatori bitta, lekin karta unga IKKI xil manba beradi: joriy oy
 * tanlanganda birinchi kartada `delta` (o'tgan oyga nisbatan o'zgarish —
 * rangi, matni va strelkasi tayyor holda keladi, strelka bo'lmasligi ham
 * mumkin), aks holda esa oddiy kulrang `hint`. Ikkovi bir vaqtda hech
 * qachon kelmaydi, shuning uchun bu yerda `delta` bor-yo'qligi tekshiriladi.
 *
 * @param {object} props
 * @param {object} props.report - `GET /users/reports` payload'i
 */
const StaffKpiRow = ({ report }) => {
  if (!report) return null;

  const cards = buildKpiCards(report);

  return (
    <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ key, label, value, icon: Icon, accent, delta, hint }) => {
        const tone = KPI_ACCENTS[accent] ?? KPI_ACCENTS.blue;
        const DeltaIcon = delta?.icon ?? null;

        return (
          <div
            key={key}
            className={cn(
              "rounded-2xl bg-gradient-to-b to-white p-4 ring-1",
              tone.card,
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  tone.chip,
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>

              <p
                className={cn(
                  "min-w-0 break-words text-sm font-medium leading-tight",
                  tone.label,
                )}
              >
                {label}
              </p>
            </div>

            <p className="mt-3 text-3xl font-bold tabular-nums text-gray-900">
              {typeof value === "number" ? <Counter value={value} /> : value}
            </p>

            <p
              className={cn(
                "mt-1 flex items-start gap-1 text-xs leading-snug",
                delta ? delta.className : "text-gray-500",
              )}
            >
              {DeltaIcon && <DeltaIcon className="mt-px size-3.5 shrink-0" />}
              <span className="min-w-0">{delta ? delta.text : hint}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StaffKpiRow;
