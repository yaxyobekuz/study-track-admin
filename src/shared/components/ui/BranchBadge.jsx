// Icons
import { Building2 } from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

/**
 * QATOR QAYSI FILIALDAN — umumiy ko'rinishdagi belgi.
 *
 * Umumiy ("barcha filiallar") rejimida server har qatorga `_branch`
 * maydonini qo'yadi (`middleware/aggregate.middleware.js`), bu komponent
 * esa uni ko'rsatadi.
 *
 * ⚠️ `_branch` BO'LMASA HECH NARSA CHIZMAYDI: bitta filial rejimida ekranda
 * "Filial: Bosh filial" degan ma'nosiz ustun paydo bo'lmasligi kerak —
 * odam allaqachon qaysi filialda ishlayotganini sidebardan ko'rib turadi.
 *
 * @param {object} props
 * @param {{id: string, code: string, name: string, shortName?: string}} [props.branch]
 * @param {string} [props.className]
 */
const BranchBadge = ({ branch, className }) => {
  if (!branch?.name) return null;

  return (
    <span
      title={branch.name}
      className={cn(
        "inline-flex max-w-[11rem] items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600",
        className,
      )}
    >
      <Building2 size={12} strokeWidth={1.75} className="shrink-0 opacity-60" />
      <span className="truncate">{branch.shortName || branch.name}</span>
    </span>
  );
};

export default BranchBadge;
