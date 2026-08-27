// Icons
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

// Components
import Card from "@/shared/components/ui/Card";

// Utils
import { cn } from "@/shared/utils/cn";

// Data
import { PREFLIGHT_GROUPS } from "../data/planner.data";

/**
 * TAYYORGARLIK — shakllantirishdan oldin nima to'g'ri, nima emas.
 *
 * To'siq (blocking) va ogohlantirish ATAYLAB ajratilgan: hammasini "xato"
 * deb ko'rsatsak, foydalanuvchi qaysi biri haqiqatan yo'lni to'sib
 * turganini bilmasdi va har safar hammasini tuzatishga urinardi.
 */
const PreflightPanel = ({ preflight }) => {
  const blocking = preflight?.blocking ?? [];
  const warnings = preflight?.warnings ?? [];

  const pick = (list, codes) => list.filter((item) => codes.includes(item.code));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PREFLIGHT_GROUPS.map((group) => {
        const groupBlocking = pick(blocking, group.codes);
        const groupWarnings = pick(warnings, group.codes);
        const state =
          groupBlocking.length > 0
            ? "blocked"
            : groupWarnings.length > 0
              ? "warning"
              : "ok";

        const Icon =
          state === "blocked"
            ? CircleAlert
            : state === "warning"
              ? TriangleAlert
              : CircleCheck;

        return (
          <Card key={group.key} className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Icon
                size={18}
                strokeWidth={1.5}
                className={cn(
                  state === "blocked" && "text-red-500",
                  state === "warning" && "text-amber-500",
                  state === "ok" && "text-emerald-500",
                )}
              />
              <h3 className="font-medium text-gray-900">{group.label}</h3>
            </div>

            {state === "ok" && (
              <p className="text-sm text-gray-500">Hammasi joyida.</p>
            )}

            {groupBlocking.map((item, index) => (
              <div key={`b-${index}`} className="rounded-xl bg-red-50 p-2.5">
                <p className="text-sm font-medium text-red-800">{item.message}</p>
                {item.hint && (
                  <p className="mt-0.5 text-xs text-red-700/80">{item.hint}</p>
                )}
              </div>
            ))}

            {groupWarnings.map((item, index) => (
              <div key={`w-${index}`} className="rounded-xl bg-amber-50 p-2.5">
                <p className="text-sm text-amber-800">{item.message}</p>
                {item.hint && (
                  <p className="mt-0.5 text-xs text-amber-700/80">{item.hint}</p>
                )}
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
};

export default PreflightPanel;
