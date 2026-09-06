// Icons
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Tokens
import { DELTA } from "../data/atlas.tokens";

/**
 * O'ZGARISH CHIPI — taqqoslash oyiga nisbatan.
 *
 * ⚠️ RANG YAXSHI/YOMONNI bildiradi, o'sish/pasayishni EMAS. Zararning
 * o'sishi qizil, undiruvning o'sishi yashil bo'lishi kerak — ikkalasi
 * ham "↑". Shuning uchun `goodWhen` MAJBURIY o'ylanadigan prop:
 *   goodWhen="up"   — o'sishi yaxshi (baza qiymati, undiruv, intizom)
 *   goodWhen="down" — pasayishi yaxshi (zarar, yaroqsizlar, qarz)
 *
 * ⚠️ Ishora (strelka) YO'NALISHNI, rang esa BAHONI beradi — ikkita
 * mustaqil belgi. Faqat rang bo'lsa, uni ajrata olmaydigan ko'z
 * ko'rsatkichni umuman o'qiy olmasdi.
 *
 * ⚠️ `null` — "taqqoslab bo'lmaydi" (o'tgan oy noldan iborat). Chip
 * UMUMAN chizilmaydi: "0%" yozuvi "o'zgarmadi" degan YOLG'ON ma'noni
 * berardi.
 *
 * @param {object} props
 * @param {number|null} props.value - o'zgarish qiymati
 * @param {"percent"|"point"} [props.unit] - foiz yoki punkt
 * @param {"up"|"down"} props.goodWhen
 * @param {boolean} [props.dark] - to'q sirt varianti
 */
const Delta = ({ value, unit = "percent", goodWhen, dark = false, className }) => {
  if (value == null || Number.isNaN(Number(value))) return null;

  const number = Number(value);
  // 0.05 dan kichik o'zgarish — shovqin, "o'zgarmadi" deb ko'rsatiladi
  const isFlat = Math.abs(number) < 0.05;
  const isUp = number > 0;
  const isGood = goodWhen === "up" ? isUp : !isUp;

  const tone = isFlat
    ? dark
      ? DELTA.flatDark
      : DELTA.flat
    : isGood
      ? dark
        ? DELTA.upDark
        : DELTA.up
      : dark
        ? DELTA.downDark
        : DELTA.down;

  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={cn(DELTA.chip, tone, className)}>
      <Icon className="size-2.5" strokeWidth={2.6} />
      {isFlat ? "0" : Math.abs(number).toFixed(unit === "point" ? 1 : 1)}
      {unit === "point" ? " p" : "%"}
    </span>
  );
};

export default Delta;
