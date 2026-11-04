// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Check, LogOut, TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import {
  LEAD_EXIT_STATUSES,
  LEAD_STAGES_FALLBACK,
  LEAD_FIELD_LIMITS,
} from "../data/leads.data";
import { leadsQueries } from "../queries/leads.queries";
import { useUpdateLeadStatus } from "../queries/leads.mutations";

export const LeadStageModal = () => (
  <ResponsiveModal name="leadStage" title="Bosqichni belgilash" className="max-w-xl">
    <LeadStageForm />
  </ResponsiveModal>
);

/**
 * POG'ONANI BELGILASH.
 *
 * ⚠️ ZINAPOYA MONOTON: 4-pog'ona belgilansa, 1–3 ham "yetgan" bo'lib
 * yoziladi (serverda, `recordStagesInTx`). Shuning uchun oynada bitta
 * pog'onani tanlash yetarli — har birini ketma-ket bosib chiqish shart emas.
 *
 * ⚠️ ORTGA QAYTARISH TARIXNI O'CHIRMAYDI: "yetgan" — o'tgan fakt. Shu
 * sababli oynada ortga qaytarish TUGMASI YO'Q; bola to'xtab qolgan bo'lsa
 * u CHIQIB KETGAN deb belgilanadi (sababi bilan) va qaysi pog'onada
 * yo'qotilgani tahlilda qoladi.
 */
const LeadStageForm = ({ close, isLoading, setIsLoading, lead }) => {
  const { mutate: updateStatus } = useUpdateLeadStatus();
  const { data: ladder } = useQuery(leadsQueries.stages());

  const stages = ladder?.stages ?? LEAD_STAGES_FALLBACK;
  const exits = ladder?.exits ?? LEAD_EXIT_STATUSES;

  const currentStage = lead?.stage ?? 0;
  const isExited = Boolean(lead?.isExited);

  // Sukut: keyingi pog'ona (eng ko'p uchraydigan amal — bir qadam oldinga)
  const nextStage = useMemo(
    () => stages.find((s) => s.stage > currentStage) ?? stages[stages.length - 1],
    [stages, currentStage],
  );

  const [mode, setMode] = useState("stage");
  const [picked, setPicked] = useState(nextStage?.status ?? "");
  const [exitStatus, setExitStatus] = useState(exits[0]?.status ?? "lost");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  const isExitMode = mode === "exit";
  const error = isExitMode
    ? !reason.trim()
      ? "Chiqib ketish sababini yozing"
      : null
    : !picked
      ? "Bosqichni tanlang"
      : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (error || isLoading) return;

    setIsLoading(true);
    updateStatus(
      {
        id: lead.id,
        status: isExitMode ? exitStatus : picked,
        description: note.trim() || undefined,
        lostReason: isExitMode ? reason.trim() : undefined,
      },
      {
        onSuccess: (updated) => {
          close();
          toast.success(
            isExitMode
              ? "Chiqib ketgani qayd etildi"
              : updated?.isEnrolled
                ? "Qabul qilindi — barcha bosqichlar o'tildi"
                : "Bosqich belgilandi",
          );
        },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
        <span className="font-medium">
          {lead?.firstName} {lead?.lastName}
        </span>
        <span className="ml-1.5 text-gray-500">
          — hozir: {lead?.statusLabel ?? "Yangi"}
          {currentStage > 0 && ` (${currentStage}/${stages.length})`}
        </span>
      </div>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <ModeButton active={!isExitMode} onClick={() => setMode("stage")}>
          Bosqichni belgilash
        </ModeButton>
        <ModeButton active={isExitMode} onClick={() => setMode("exit")}>
          Chiqib ketdi
        </ModeButton>
      </div>

      {isExitMode ? (
        <>
          <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
            {exits.map((exit) => (
              <button
                key={exit.status}
                type="button"
                onClick={() => setExitStatus(exit.status)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  exitStatus === exit.status
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {exit.label}
              </button>
            ))}
          </div>

          <InputField
            name="reason"
            label="Sababi"
            required
            value={reason}
            maxLength={LEAD_FIELD_LIMITS.note}
            placeholder="Ikkinchi darsga kelmadi"
            onChange={(event) => setReason(event.target.value)}
          />

          <p className="flex items-start gap-2 text-xs text-gray-600">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
            <span>
              Yetib borgan bosqichlari saqlanib qoladi — tahlilda bola aynan
              qaysi qadamda yo'qotilgani ko'rinadi.
            </span>
          </p>
        </>
      ) : (
        <>
          <ul className="overflow-hidden rounded-xl border border-gray-200">
            {stages.map((stage) => {
              const reached = stage.stage <= currentStage;
              const checked = picked === stage.status;

              return (
                <li key={stage.stage}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-b-0 hover:bg-gray-50",
                      checked && "bg-primary/5",
                    )}
                  >
                    <input
                      type="radio"
                      name="stage"
                      checked={checked}
                      onChange={() => setPicked(stage.status)}
                      className="size-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-900">
                        {stage.stage}. {stage.label}
                      </span>
                      {stage.hint && (
                        <span className="block text-xs text-gray-400">{stage.hint}</span>
                      )}
                    </span>
                    {reached && (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check className="size-3.5" />
                        yetgan
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>

          <InputField
            name="note"
            label="Izoh (ixtiyoriy)"
            value={note}
            maxLength={LEAD_FIELD_LIMITS.note}
            placeholder="Dushanba 15:00 ga kelishildi"
            onChange={(event) => setNote(event.target.value)}
          />

          <p className="text-xs text-gray-500">
            Oraliq bosqichlar o'z-o'zidan "yetgan" bo'lib yoziladi — har birini
            alohida bosish shart emas.
          </p>
        </>
      )}

      {isExited && !isExitMode && (
        <p className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
          Bu lid chiqib ketgan deb belgilangan. Bosqich tanlansa, u yana
          zinapoyaga qaytadi va "yo'qoldi" belgisi olib tashlanadi.
        </p>
      )}

      <Button
        type="submit"
        variant={isExitMode ? "danger" : "default"}
        className="w-full"
        loading={isLoading}
        disabled={Boolean(error)}
      >
        {isExitMode ? <LogOut /> : <Check />}
        {isExitMode ? "Chiqib ketgani qayd etilsin" : "Belgilash"}
      </Button>
    </InputGroup>
  );
};

const ModeButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
      active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
    )}
  >
    {children}
  </button>
);
