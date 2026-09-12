// Utils
import { cn } from "@/shared/utils/cn";

/**
 * "Nom — qiymat" ro'yxati (holat va versiya kartalari). Tor ekranda
 * qiymat nom ostiga tushadi.
 */
export const InfoList = ({ children, className = "" }) => (
  <dl className={cn("divide-y divide-gray-100", className)}>{children}</dl>
);

/**
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.children
 */
export const InfoRow = ({ label, children }) => (
  <div className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0 xs:flex-row xs:items-start xs:justify-between xs:gap-4">
    <dt className="shrink-0 text-sm text-gray-500">{label}</dt>
    <dd className="min-w-0 break-words text-sm text-gray-900 xs:text-right">
      {children}
    </dd>
  </div>
);
