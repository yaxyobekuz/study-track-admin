// React
import { useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { Building2, GraduationCap, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import Input from "@/shared/components/ui/input/Input";
import Select from "@/shared/components/ui/select/Select";
import StudentPicker from "./StudentPicker";

// Utils
import { cn } from "@/shared/utils/cn";

// Queries & tokens
import { useClasses } from "@/features/classes/queries/classes.queries";
import { SURFACE, T } from "../data/guard.tokens";
import { devicesQueries } from "../queries/devices.queries";
import { useSetAssignment } from "../queries/devices.mutations";

const SCOPES = [
  {
    value: "student",
    label: "Bitta o'quvchi",
    icon: UserRound,
    hint: "Shaxsiy istisno — sinf va maktab qoidasidan USTUN turadi",
  },
  {
    value: "class",
    label: "Sinf",
    icon: GraduationCap,
    hint: "Sinfdagi barcha o'quvchilar. Shaxsiy istisnosi borlarga tegmaydi",
  },
  {
    value: "school",
    label: "Butun maktab",
    icon: Building2,
    hint: "Barcha o'quvchilar. Sinf va shaxsiy qoidalar baribir ustun turadi",
  },
];

/**
 * SIYOSATNI BIRIKTIRISH — qoidani HAQIQATDA yoqadigan qadam.
 *
 * ⚠️ QAMROV TARTIBI OYNADA TUSHUNTIRILADI: eng tor qamrov yutadi va
 * siyosatlar QO'SHILMAYDI. Busiz admin "maktabga ham, sinfga ham
 * biriktiray, ikkalasi qo'shiladi" deb o'ylardi — natija esa butunlay
 * boshqacha bo'lardi.
 *
 * ⚠️ "BUTUN MAKTAB" UCHUN ALOHIDA TASDIQ (`confirmAll`) va u serverda
 * ham tekshiriladi: bitta so'rov butun maktabning telefonini qulflaydi.
 *
 * ⚠️ NECHTA O'QUVCHIGA TA'SIR QILISHI OLDINDAN KO'RSATILADI — bu raqam
 * biriktirishlar sonidan emas, HAQIQIY yechimdan chiqadi (shaxsiy
 * istisnosi borlar hisobga olinmaydi).
 */
const AssignPolicyModal = () => (
  <ResponsiveModal
    name="deviceAssignPolicy"
    title="Siyosatni biriktirish"
    description="Biriktirilgandan keyin qoida telefonlarda kuchga kiradi."
    className="max-w-lg"
  >
    <AssignForm />
  </ResponsiveModal>
);

const AssignForm = ({ close, setIsLoading, policyId, policyName }) => {
  const [scope, setScope] = useState("class");
  const [classId, setClassId] = useState("");
  const [studentIds, setStudentIds] = useState([]);
  const [note, setNote] = useState("");
  const [confirmAll, setConfirmAll] = useState(false);

  const { data: classes = [] } = useClasses();
  const { data: impact } = useQuery(devicesQueries.policyImpact(policyId));
  const { mutate: setAssignment } = useSetAssignment();

  const active = SCOPES.find((s) => s.value === scope);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (scope === "class" && !classId) return toast.error("Sinfni tanlang");
    if (scope === "student" && studentIds.length === 0) return toast.error("O'quvchini tanlang");
    if (scope === "school" && !confirmAll) {
      return toast.error("Butun maktabga biriktirish uchun tasdiqlang");
    }

    setIsLoading(true);
    setAssignment(
      {
        policyId,
        scope,
        note: note.trim(),
        ...(scope === "class" ? { classId } : {}),
        ...(scope === "student" ? { studentId: studentIds[0] } : {}),
        ...(scope === "school" ? { confirmAll: true } : {}),
      },
      {
        onSuccess: () => {
          close();
          toast.success("Siyosat biriktirildi");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Biriktirilmadi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={cn(SURFACE.inset, "px-3.5 py-2.5")}>
        <p className={T.label}>Siyosat</p>
        <p className={cn(T.tdName, "mt-0.5")}>{policyName}</p>
        {typeof impact?.students === "number" && (
          <p className={cn(T.hint, "mt-0.5")}>
            Hozir {impact.students} ta o'quvchida amalda
          </p>
        )}
      </div>

      {/* ── Qamrov ── */}
      <div>
        <p className={cn(T.label, "mb-1.5")}>Kimga</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SCOPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setScope(item.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors",
                scope === item.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              <item.icon className="size-4" strokeWidth={1.9} />
              <span className="text-[11.5px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
        <p className={cn(T.hint, "mt-1.5")}>{active.hint}</p>
      </div>

      {/* ── Nishon ── */}
      {scope === "class" && (
        <div>
          <p className={cn(T.label, "mb-1.5")}>Sinf</p>
          <Select
            value={classId}
            placeholder="Sinfni tanlang"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            onChange={setClassId}
          />
        </div>
      )}

      {scope === "student" && (
        <div>
          <p className={cn(T.label, "mb-1.5")}>O'quvchi</p>
          <StudentPicker value={studentIds} onChange={setStudentIds} />
        </div>
      )}

      {scope === "school" && (
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3">
          <input
            type="checkbox"
            checked={confirmAll}
            onChange={(e) => setConfirmAll(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-slate-900"
          />
          <span>
            <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-amber-900">
              <TriangleAlert className="size-3.5" strokeWidth={2} />
              Tushundim: bu qoida butun maktabga qo'llanadi
            </span>
            <span className={cn(T.hint, "mt-0.5 block text-amber-700")}>
              Shaxsiy istisnosi va sinf qoidasi borlar o'z qoidasida qoladi.
            </span>
          </span>
        </label>
      )}

      <div>
        <p className={cn(T.label, "mb-1.5")}>Izoh</p>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ixtiyoriy"
          maxLength={500}
        />
      </div>

      {/* Qamrov tartibi — modulning eng ko'p chalkashtiradigan qoidasi */}
      <div className="flex items-start gap-2.5 rounded-xl bg-sky-50 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" strokeWidth={2} />
        <p className="text-[11.5px] leading-relaxed text-sky-900">
          Har o'quvchiga <strong className="font-medium">bitta</strong> siyosat
          qo'llanadi: o'quvchi → sinf → maktab tartibida eng tori yutadi.
          Siyosatlar bir-biriga qo'shilmaydi.
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => close()}>
          Bekor qilish
        </Button>
        <Button type="submit" className="flex-1">
          Biriktirish
        </Button>
      </div>
    </form>
  );
};

export default AssignPolicyModal;
