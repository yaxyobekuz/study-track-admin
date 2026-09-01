// Toast
import { toast } from "sonner";

// Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Select from "@/shared/components/ui/select/Select";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { formatMoney } from "@/shared/utils/formatMoney";

// Queries
import { payrollQueries } from "../queries/payroll.queries";
import {
  useCreateDepartment,
  useUpdateDepartment,
  useCreatePosition,
  useUpdatePosition,
  useCreateCategory,
  useUpdateCategory,
  useAssignStaff,
} from "../queries/payroll.mutations";

const toNum = (v) => (v == null || Number(v) === 0 ? "" : String(Number(v)));

// ═════════════════════ BO'LIM ═════════════════════
export const DepartmentModal = () => (
  <ResponsiveModal name="department" title="Bo'lim">
    <DepartmentForm />
  </ResponsiveModal>
);

const DepartmentForm = ({ close, isLoading, setIsLoading, department }) => {
  const isEdit = Boolean(department?.id);
  const { mutate: create } = useCreateDepartment();
  const { mutate: update } = useUpdateDepartment();
  const { name, kind, sortOrder, setField } = useObjectState({
    name: department?.name ?? "",
    kind: department?.kind ?? "staff",
    sortOrder: department?.sortOrder ?? 0,
  });

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name, sortOrder: Number(sortOrder) || 0, ...(isEdit ? {} : { kind }) };
    const h = {
      onSuccess: () => { close(); toast.success(isEdit ? "Bo'lim yangilandi" : "Bo'lim qo'shildi"); },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
      onSettled: () => setIsLoading(false),
    };
    if (isEdit) update({ id: department.id, data: payload }, h);
    else create(payload, h);
  };

  return (
    <InputGroup onSubmit={submit} as="form">
      <InputField required name="name" label="Bo'lim nomi" value={name} placeholder="Texnik bo'lim" onChange={(e) => setField("name", e.target.value)} />
      {!isEdit && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-700">Turi</p>
          <Select
            value={kind}
            onChange={(v) => setField("kind", v)}
            options={[
              { label: "Staff (lavozim + maosh)", value: "staff" },
              { label: "Teaching (toifa + soatbay)", value: "teaching" },
            ]}
          />
        </div>
      )}
      <InputField type="number" name="sortOrder" label="Tartib" value={sortOrder} onChange={(e) => setField("sortOrder", e.target.value)} />
      <Button type="submit" className="w-full" loading={isLoading} disabled={!name}>
        {isEdit ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};

// ═════════════════════ LAVOZIM ═════════════════════
export const PositionModal = () => (
  <ResponsiveModal name="position" title="Lavozim">
    <PositionForm />
  </ResponsiveModal>
);

const PositionForm = ({ close, isLoading, setIsLoading, position, departmentId, departmentName }) => {
  const isEdit = Boolean(position?.id);
  const { mutate: create } = useCreatePosition();
  const { mutate: update } = useUpdatePosition();
  const { name, baseSalary, sortOrder, setField } = useObjectState({
    name: position?.name ?? "",
    baseSalary: toNum(position?.baseSalary),
    sortOrder: position?.sortOrder ?? 0,
  });

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name, baseSalary: baseSalary || 0, sortOrder: Number(sortOrder) || 0 };
    const h = {
      onSuccess: () => { close(); toast.success(isEdit ? "Lavozim yangilandi" : "Lavozim qo'shildi"); },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
      onSettled: () => setIsLoading(false),
    };
    if (isEdit) update({ id: position.id, data: payload }, h);
    else create({ ...payload, departmentId: departmentId ?? position?.departmentId }, h);
  };

  return (
    <InputGroup onSubmit={submit} as="form">
      {departmentName && <p className="rounded-xl bg-gray-50 p-2.5 text-sm text-gray-600">Bo'lim: <b>{departmentName}</b></p>}
      <InputField required name="name" label="Lavozim nomi" value={name} placeholder="Administrator" onChange={(e) => setField("name", e.target.value)} />
      <InputField required type="amount" name="baseSalary" label="Bazaviy maosh" value={baseSalary} placeholder="4000000" description={Number(baseSalary) > 0 ? `${formatMoney(baseSalary)} / oy` : "So'mda"} onChange={(e) => setField("baseSalary", e.target.value)} />
      <InputField type="number" name="sortOrder" label="Tartib" value={sortOrder} onChange={(e) => setField("sortOrder", e.target.value)} />
      <Button type="submit" className="w-full" loading={isLoading} disabled={!name || !(Number(baseSalary) > 0)}>
        {isEdit ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};

// ═════════════════════ TOIFA (v2) ═════════════════════
export const CategoryV2Modal = () => (
  <ResponsiveModal name="categoryV2" title="Malaka toifasi">
    <CategoryV2Form />
  </ResponsiveModal>
);

const CategoryV2Form = ({ close, isLoading, setIsLoading, category, departmentId, departmentName }) => {
  const isEdit = Boolean(category?.id);
  const { mutate: create } = useCreateCategory();
  const { mutate: update } = useUpdateCategory();
  const { name, perHourRate, monthlyPerHour, hoursPerStavka, baseSalary, sortOrder, setField } = useObjectState({
    name: category?.name ?? "",
    perHourRate: toNum(category?.perHourRate),
    monthlyPerHour: toNum(category?.monthlyPerHour),
    hoursPerStavka: category?.hoursPerStavka ?? "",
    baseSalary: toNum(category?.baseSalary),
    sortOrder: category?.sortOrder ?? 0,
  });

  // Yordamchi: asosiy maoshni avtomat taklif qilish (oy × stavka soati)
  const suggestedBase = (Number(monthlyPerHour) || 0) * (Number(hoursPerStavka) || 0);

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      name,
      perHourRate: perHourRate || 0,
      monthlyPerHour: monthlyPerHour || 0,
      hoursPerStavka: Number(hoursPerStavka) || 0,
      baseSalary: baseSalary || (suggestedBase ? String(suggestedBase) : 0),
      sortOrder: Number(sortOrder) || 0,
    };
    const h = {
      onSuccess: () => { close(); toast.success(isEdit ? "Toifa yangilandi" : "Toifa qo'shildi"); },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
      onSettled: () => setIsLoading(false),
    };
    if (isEdit) update({ id: category.id, data: payload }, h);
    else create({ ...payload, departmentId: departmentId ?? category?.departmentId }, h);
  };

  return (
    <InputGroup onSubmit={submit} as="form">
      {departmentName && <p className="rounded-xl bg-gray-50 p-2.5 text-sm text-gray-600">Bo'lim: <b>{departmentName}</b></p>}
      <InputField required name="name" label="Toifa turi" value={name} placeholder="1-toifa" onChange={(e) => setField("name", e.target.value)} />
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
        <InputField required type="amount" name="perHourRate" label="Bir soat uchun" value={perHourRate} placeholder="60000" onChange={(e) => setField("perHourRate", e.target.value)} />
        <InputField type="amount" name="monthlyPerHour" label="Bir oy uchun" value={monthlyPerHour} placeholder="240000" onChange={(e) => setField("monthlyPerHour", e.target.value)} />
        <InputField type="number" name="hoursPerStavka" label="Bir stavka dars soati" value={hoursPerStavka} placeholder="18" onChange={(e) => setField("hoursPerStavka", e.target.value)} />
        <InputField type="amount" name="baseSalary" label="Asosiy maosh" value={baseSalary} placeholder={suggestedBase ? String(suggestedBase) : "4320000"} description={suggestedBase && !baseSalary ? `Taklif: ${formatMoney(suggestedBase)}` : ""} onChange={(e) => setField("baseSalary", e.target.value)} />
      </div>
      <Button type="submit" className="w-full" loading={isLoading} disabled={!name || !(Number(perHourRate) > 0)}>
        {isEdit ? "Saqlash" : "Qo'shish"}
      </Button>
    </InputGroup>
  );
};

// ═════════════════════ BIRIKTIRISH ═════════════════════
export const AssignStaffModal = () => (
  <ResponsiveModal name="assignStaff" title="Xodimni biriktirish">
    <AssignStaffForm />
  </ResponsiveModal>
);

const AssignStaffForm = ({ close, isLoading, setIsLoading, staff, department }) => {
  const { mutate: assign } = useAssignStaff();
  const isTeaching = department?.kind === "teaching";

  const { data: positions = [] } = useQuery({
    ...payrollQueries.positions(department?.id),
    enabled: Boolean(department?.id) && !isTeaching,
  });
  const { data: categories = [] } = useQuery({
    ...payrollQueries.categories({ departmentId: department?.id, status: "active" }),
    enabled: Boolean(department?.id) && isTeaching,
  });

  const { targetId, setField } = useObjectState({
    targetId: (isTeaching ? staff?.salaryCategoryId : staff?.positionId) ?? "",
  });

  const options = isTeaching
    ? categories.map((c) => ({ label: `${c.name} — ${formatMoney(c.perHourRate)}/soat`, value: c.id }))
    : positions.map((p) => ({ label: `${p.name} — ${formatMoney(p.baseSalary)}`, value: p.id }));

  const submit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = isTeaching ? { salaryCategoryId: targetId } : { positionId: targetId };
    assign(
      { staffId: staff.id, data },
      {
        onSuccess: () => { close(); toast.success("Biriktirildi"); },
        onError: (err) => toast.error(err.response?.data?.message || "Xatolik"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <InputGroup onSubmit={submit} as="form">
      <div className="rounded-xl bg-gray-50 p-3 text-sm">
        <p className="font-medium text-gray-900">{staff?.fullName || `${staff?.firstName ?? ""} ${staff?.lastName ?? ""}`.trim()}</p>
        <p className="text-gray-500">{department?.name}</p>
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">{isTeaching ? "Toifa" : "Lavozim"}</p>
        <Select searchable value={targetId} placeholder={isTeaching ? "Toifani tanlang" : "Lavozimni tanlang"} onChange={(v) => setField("targetId", v)} options={options} />
      </div>
      <Button type="submit" className="w-full" loading={isLoading} disabled={!targetId}>
        Biriktirish
      </Button>
    </InputGroup>
  );
};
