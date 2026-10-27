// React
import { useEffect, useMemo } from "react";

// Icons
import { ImageOff, UserRound } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// HTTP
import http from "@/shared/api/http";

// Keys
import { faceIdKeys } from "../queries/faceId.queries";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * YUZ KADRI — TOKEN BILAN YUKLANADIGAN RASM.
 *
 * ⚠️ ODDIY `<img src>` ISHLAMAYDI va buni bilish MUHIM: brauzer
 * `<img>` so'roviga `Authorization` sarlavhasini QO'SHMAYDI, server
 * esa bu yo'lni `faceId.events` ruxsati ortida ushlab turadi — ya'ni
 * rasm 401 bilan qaytadi va ekranda buzuq rasm belgisi turardi.
 *
 * Shuning uchun rasm `http` (axios) orqali olinadi — u tokenni
 * interceptor'da o'zi qo'yadi — va `blob:` URL sifatida ko'rsatiladi.
 *
 * ⚠️ NIMA UCHUN OCHIQ URL BERMADIK: bu odamning — ko'pincha bolaning —
 * yuz rasmi. Ochiq havola qo'lga tushsa, uni istalgan kim ochib ko'ra
 * olardi, kesh va proksilarda esa nusxalari qolib ketardi
 * (`.claude/rules/face-id.md` §10).
 *
 * ⚠️ `URL.revokeObjectURL` MAJBURIY: jurnalda 50 qator bo'lsa, 50 blob
 * xotirada qoladi va sahifa ochiq turgan sari o'sib boradi.
 */
const FaceSnapshot = ({ path, alt = "", className = "", fallback = "avatar" }) => {
  /**
   * ⚠️ `useQuery` — rasm ham SERVER HOLATI (loyiha qoidasi:
   * `.claude/docs/tanstack-query.md`). Qo'lda `useEffect` + `useState`
   * bilan yozilsa, jurnaldagi 30 qator har sahifa almashtirilganda
   * rasmni QAYTADAN yuklab olardi — kesh esa so'rovni bir marta
   * qiladi va orqaga qaytganda darhol ko'rsatadi.
   *
   * ⚠️ `retry: false` — rasm yo'qligi NORMAL holat (`storeSnapshots`
   * o'chiq yoki supurgi o'chirgan), uni uch marta qayta so'rash
   * bekorga tarmoq sarflash bo'lardi.
   */
  const { data: blob, isError, isPending } = useQuery({
    queryKey: [...faceIdKeys.all, "snapshot", path],
    queryFn: () => http.get(path, { responseType: "blob" }).then((r) => r.data),
    enabled: Boolean(path),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  /**
   * ⚠️ `useMemo` + cleanup, `useState` EMAS: effekt ichida `setState`
   * qilish kaskadli render beradi (va eslint qoidasi buni to'sadi).
   * `URL.revokeObjectURL` esa MAJBURIY — jurnalda 30 qator bo'lsa, 30
   * blob xotirada qoladi va sahifa ochiq turgan sari o'sib boradi.
   */
  const src = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(
    () => () => {
      if (src) URL.revokeObjectURL(src);
    },
    [src],
  );

  if (!path || isError) {
    const Icon = fallback === "none" ? ImageOff : UserRound;
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          className,
        )}
      >
        <Icon className="size-4" />
      </span>
    );
  }

  if (isPending || !src) {
    return <span className={cn("animate-pulse bg-gray-200", className)} />;
  }

  return <img src={src} alt={alt} className={cn("object-cover", className)} />;
};

export default FaceSnapshot;
