// React
import { useEffect, useMemo } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { UserPlus } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import InputField from "@/shared/components/ui/input/InputField";
import Button from "@/shared/components/ui/button/Button";
import SelectSearch from "@/shared/components/ui/select/SelectSearch";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import useAuth from "@/shared/hooks/useAuth";

// Data & queries
import { LEAD_FIELD_LIMITS } from "../data/leads.data";
import { leadsQueries } from "../queries/leads.queries";
import { useCreateLead, useUpdateLead } from "../queries/leads.mutations";
import { usersQueries } from "@/features/users/queries/users.queries";

export const LeadFormModal = () => (
  <ResponsiveModal name="leadForm" title="Lid" className="max-w-2xl">
    <LeadForm />
  </ResponsiveModal>
);

/**
 * LID KIRITISH / TAHRIRLASH.
 *
 * ⚠️ FAQAT UCH MAYDON MAJBURIY: ism, familiya va telefon. Bola kelganda
 * birinchi yoziladigan narsa shu; manba, yo'nalish va toifa keyin
 * to'ldiriladi. Ilgari server ularni ham talab qilardi va lid yaratish
 * 400 bilan yiqilardi — forma esa ularni umuman so'ramaydi.
 *
 * ⚠️ LOGIN (username) va PAROL YO'Q: lid hali o'quvchi emas, u tizimga
 * kirmaydi. Hisob faqat to'lov qilgandan keyin, o'quvchi sifatida ochiladi.
 *
 * ⚠️ "KIM OLIB KELDI" — `createdBy` DAN BOSHQA MAYDON: tizimga qabulxona
 * kiritadi, bolani esa boshqa odam olib kelishi mumkin. Tahlil
 * ("men 10 ta olib keldim") aynan shu maydon bo'yicha qilinadi, shuning
 * uchun u formada turadi. Bo'sh qoldirilsa — kiritgan odam.
 */
const LeadForm = ({ close, isLoading, setIsLoading, lead }) => {
  const isEdit = Boolean(lead?.id);
  const { user } = useAuth();

  const { mutate: createLead } = useCreateLead();
  const { mutate: updateLead } = useUpdateLead();

  const { state: form, setField, setFields } = useObjectState({
    firstName: "",
    lastName: "",
    phone: "",
    additionalPhone: "",
    parentPhone: "",
    previousSchool: "",
    broughtBy: "",
    assignedTo: "",
    source: "",
    direction: "",
    category: "",
    notes: "",
  });

  const { data: staffAll = [] } = useQuery(usersQueries.allShort());
  const { data: sources = [] } = useQuery(leadsQueries.sources());
  const { data: directions = [] } = useQuery(leadsQueries.directions());
  const { data: categories = [] } = useQuery(leadsQueries.categories());

  // ⚠️ Xodimlar: o'quvchilar chiqarib tashlanadi (ularni "olib keldi" yoki
  // "mas'ul" qilib bo'lmaydi — server ham rad etadi). Ro'yxatda owner yo'q,
  // shuning uchun joriy foydalanuvchi alohida qo'shiladi: odam o'zini
  // tanlay olmasligi kutilmagan hol bo'lardi.
  const staffOptions = useMemo(() => {
    const options = staffAll
      .filter((u) => u.role !== "student")
      .map((u) => ({
        value: u.id,
        label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Noma'lum",
      }));

    if (user?.id && !options.some((o) => o.value === user.id)) {
      options.unshift({
        value: user.id,
        label: `${`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Men"} (men)`,
      });
    }
    return options;
  }, [staffAll, user]);

  const catalogOptions = (rows, emptyLabel) => [
    { value: "", label: emptyLabel },
    ...rows.map((row) => ({ value: row.id, label: row.name })),
  ];

  // Tahrirlashda formani to'ldirish. Server havolalarni obyekt bo'lib
  // qaytaradi (`{ id, name }`), forma esa id bilan ishlaydi.
  useEffect(() => {
    if (!lead) return;
    setFields({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      phone: lead.phone || "",
      additionalPhone: lead.additionalPhone || "",
      parentPhone: lead.parentPhone || "",
      previousSchool: lead.previousSchool || "",
      broughtBy: lead.broughtBy?.id || "",
      assignedTo: lead.assignedTo?.id || "",
      source: lead.source?.id || "",
      direction: lead.direction?.id || "",
      category: lead.category?.id || "",
      notes: lead.notes || "",
    });
  }, [lead]);

  const error = !form.firstName.trim()
    ? "Ismni kiriting"
    : !form.lastName.trim()
      ? "Familiyani kiriting"
      : !form.phone.trim()
        ? "Telefon raqamini kiriting"
        : null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (error || isLoading) return;

    // ⚠️ Bo'sh maydon ham YUBORILADI: tahrirlashda u maydonni TOZALASH
    // degani (server bo'sh satrni `null` ga aylantiradi). Tushirib
    // qoldirilsa, "kelgan maktabi" ni o'chirib bo'lmasdi.
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      additionalPhone: form.additionalPhone.trim(),
      parentPhone: form.parentPhone.trim(),
      previousSchool: form.previousSchool.trim(),
      broughtBy: form.broughtBy || null,
      assignedTo: form.assignedTo || null,
      source: form.source || null,
      direction: form.direction || null,
      category: form.category || null,
      notes: form.notes.trim(),
    };

    setIsLoading(true);
    const onDone = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "Lid yangilandi" : "Lid ro'yxatga olindi");
      },
      onError: (err) => toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) updateLead({ id: lead.id, data: payload }, onDone);
    else createLead(payload, onDone);
  };

  return (
    <InputGroup as="form" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          name="firstName"
          label="Ism"
          required
          value={form.firstName}
          maxLength={LEAD_FIELD_LIMITS.name}
          placeholder="Ali"
          onChange={(event) => setField("firstName", event.target.value)}
        />
        <InputField
          name="lastName"
          label="Familiya"
          required
          value={form.lastName}
          maxLength={LEAD_FIELD_LIMITS.name}
          placeholder="Valiyev"
          onChange={(event) => setField("lastName", event.target.value)}
        />

        {/* `type="tel"` → maskali input: +998 (90) 123-45-67 */}
        <InputField
          type="tel"
          name="phone"
          label="Telefon"
          required
          autoComplete="off"
          value={form.phone}
          onChange={(event) => setField("phone", event.target.value)}
        />
        <InputField
          name="previousSchool"
          label="Kelgan maktabi"
          value={form.previousSchool}
          maxLength={LEAD_FIELD_LIMITS.school}
          placeholder="12-maktab"
          onChange={(event) => setField("previousSchool", event.target.value)}
        />

        <InputField
          type="tel"
          name="additionalPhone"
          label="Qo'shimcha raqam 1"
          autoComplete="off"
          value={form.additionalPhone}
          onChange={(event) => setField("additionalPhone", event.target.value)}
        />
        <InputField
          type="tel"
          name="parentPhone"
          label="Qo'shimcha raqam 2"
          autoComplete="off"
          value={form.parentPhone}
          onChange={(event) => setField("parentPhone", event.target.value)}
        />
      </div>

      <div className="h-px bg-gray-100" />

      {/* ── Tahlil uchun: kim olib keldi va kim mas'ul ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Labeled label="Kim olib keldi">
          <SelectSearch
            inline
            idValues
            value={form.broughtBy}
            onChange={(next) => setField("broughtBy", next)}
            options={[{ value: "", label: "Kiritgan odam (men)" }, ...staffOptions]}
          />
        </Labeled>

        <Labeled label="Mas'ul xodim">
          <SelectSearch
            inline
            idValues
            value={form.assignedTo}
            onChange={(next) => setField("assignedTo", next)}
            options={[{ value: "", label: "Belgilanmagan" }, ...staffOptions]}
          />
        </Labeled>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Labeled label="Manba">
          <SelectSearch
            inline
            idValues
            value={form.source}
            onChange={(next) => setField("source", next)}
            options={catalogOptions(sources, "Tanlanmagan")}
          />
        </Labeled>
        <Labeled label="Yo'nalish">
          <SelectSearch
            inline
            idValues
            value={form.direction}
            onChange={(next) => setField("direction", next)}
            options={catalogOptions(directions, "Tanlanmagan")}
          />
        </Labeled>
        <Labeled label="Toifa">
          <SelectSearch
            inline
            idValues
            value={form.category}
            onChange={(next) => setField("category", next)}
            options={catalogOptions(categories, "Tanlanmagan")}
          />
        </Labeled>
      </div>

      <InputField
        name="notes"
        label="Izoh"
        value={form.notes}
        maxLength={LEAD_FIELD_LIMITS.note}
        placeholder="Nima deb murojaat qildi"
        onChange={(event) => setField("notes", event.target.value)}
      />

      {error && <p className="text-xs text-gray-500">{error}</p>}

      <Button type="submit" className="w-full" loading={isLoading} disabled={Boolean(error)}>
        <UserPlus />
        {isEdit ? "Saqlash" : "Ro'yxatga olish"}
      </Button>
    </InputGroup>
  );
};

/** Tanlagichlar uchun yorliq — `InputField` dagi bilan bir xil ko'rinish. */
const Labeled = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    {children}
  </div>
);
