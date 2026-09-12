// React
import { useState } from "react";

// Data
import { ACK_FALLBACK } from "../data/scheduleSync.data";

/**
 * Talab qilingan ogohlantirishlar (`requiredAcks`) — qaysilarini odam
 * O'ZI belgilagani.
 *
 * ⚠️ Hammasi BELGILANMAGAN holda boshlanadi va avtomatik belgilanmaydi:
 * serverga faqat odam ko'rib tasdiqlagan kodlar yuboriladi. Ko'rinish
 * o'zgarganda (yangi xesh) holat qayta boshlanishi uchun uni ishlatgan
 * komponent xesh bo'yicha `key` bilan chiziladi.
 *
 * `missing` — server "tasdiqlanmagan" deb qaytargan kodlar (400
 * `ack_required`): ular qizil bilan ajratiladi. Server yuborgan, lekin
 * ko'rinishda hali yo'q tasdiqlar (`details.acks`) ro'yxatga QO'SHILADI —
 * qayta o'qilgan ko'rinish kelguncha ham katak turadi va tugma ularsiz
 * ochilmaydi.
 */
const useAcknowledgements = () => {
  const [acked, setAcked] = useState(() => new Set());
  const [missing, setMissing] = useState(() => new Set());
  const [extra, setExtra] = useState([]);

  const toggle = (code) => {
    setAcked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    setMissing((prev) => {
      if (!prev.has(code)) return prev;
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  };

  /**
   * @param {string[]} codes - `details.required`
   * @param {Array<{code: string, title: string, message: string}>} [acks] - `details.acks`
   */
  const markMissing = (codes = [], acks = []) => {
    setMissing(new Set(codes));
    setExtra(
      codes.map(
        (code) => acks.find((ack) => ack?.code === code) ?? { code, ...ACK_FALLBACK },
      ),
    );
  };

  /** Ko'rinishdagi tasdiqlar + server qo'shimcha talab qilganlari (takrorsiz). */
  const listFor = (requiredAcks = []) => {
    const known = new Set(requiredAcks.map((ack) => ack.code));
    return [...requiredAcks, ...extra.filter((ack) => !known.has(ack.code))];
  };

  return { acked, missing, toggle, markMissing, listFor, acknowledged: [...acked] };
};

export default useAcknowledgements;
