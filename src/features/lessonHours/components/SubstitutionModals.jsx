// React
import { useMemo, useState } from "react";

// Toast
import { toast } from "sonner";

// Icons
import { ArrowRight, CalendarRange, Check, TriangleAlert } from "lucide-react";

// TanStack Query
import { useQuery } from "@tanstack/react-query";

// Components
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";
import Button from "@/shared/components/ui/button/Button";
import TeacherPicker from "./TeacherPicker";
import DateField from "./DateField";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Utils
import { cn } from "@/shared/utils/cn";

// Data & queries
import { CHIP, SURFACE, T } from "../data/ledger.tokens";
import { SUBSTITUTION_REASONS, formatHourNumber } from "../data/lessonHours.data";
import { substitutionQueries } from "../queries/lessonHours.queries";
import {
  useCancelSubstitution,
  useCreateSubstitution,
  useDeleteSubstitution,
  useUpdateSubstitution,
} from "../queries/lessonHours.mutations";

/**
 * O'RINBOSAR BIRIKTIRISH — bir ekranda to'rt qadam.
 *
 * ⚠️ DARSLAR RO'YXATI DAVR TANLANGANDAN KEYIN KELADI. Ro'yxat davrga
 * BOG'LIQ: davrga tushmaydigan hafta kunlari umuman ko'rsatilmaydi va
 * har katakning yonida "necha marta takrorlanadi" turadi. Davrsiz
 * ro'yxat "4 ta dars tanladim" degan odamga aslida 12 soat
 * biriktirilganini yashirardi.
 *
 * ⚠️ TANLOV BIR MARTALIK EMAS. Har katak (sinf + hafta kuni + dars
 * tartibi) davr ichidagi HAR BIR mos kunga tarqaladi — modal jami soatni
 * jonli ko'rsatib turadi, aks holda odam faqat "Saqlash" dan keyin
 * bilardi.
 */
export const CreateSubstitutionModal = () => (
  <ResponsiveModal
    name="createSubstitution"
    title="O'rinbosar biriktirish"
    description="Darslar boshqa o'qituvchiga vaqtincha o'tkaziladi: jurnal huquqi va dars soati ham u bilan birga ko'chadi."
    className="max-w-2xl"
  >
    <SubstitutionForm />
  </ResponsiveModal>
);

/**
 * TAHRIRLASH — AYNI forma, boshqa qobiq.
 *
 * ⚠️ Alohida forma yozilmaydi: tekshiruvlar ro'yxati bir xil va ikki nusxa
 * bo'lsa, ertami-kechmi bittasiga qo'shilgan maydon ikkinchisida unutilardi
 * (server tomonida ham AYNI mulohaza — `prepareSubstitution`).
 *
 * ⚠️ Faqat hali BOSHLANMAGAN yozuv tahrirlanadi. Panel tugmani
 * `canEdit` bo'yicha yashiradi, server esa buni qayta tekshiradi:
 * boshlangan yozuv dalil bo'lib qoladi va uni o'zgartirish o'tgan kunni
 * qayta yozish degani bo'lardi.
 */
export const EditSubstitutionModal = () => (
  <ResponsiveModal
    name="editSubstitution"
    title="O'rinbosarlikni tahrirlash"
    description="Yozuv hali boshlanmagan — o'qituvchilarni, muddatni va darslar ro'yxatini o'zgartirish mumkin."
    className="max-w-2xl"
  >
    <SubstitutionForm />
  </ResponsiveModal>
);

const todayInput = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
};

const SubstitutionForm = ({
  close,
  isLoading,
  setIsLoading,
  teacherId,
  substitution = null,
}) => {
  const isEdit = Boolean(substitution?.id);

  const { mutate: create } = useCreateSubstitution();
  const { mutate: update } = useUpdateSubstitution();

  // `@db.Date` UTC yarim tunida keladi — kun qismini kesib olamiz. Bu
  // MASHINA QIYMATI (`<DateField>` ham shu shaklda ishlaydi), ekranga esa
  // `formatDateUz` natijasi chiqadi.
  const dayOf = (value) => String(value ?? "").split("T")[0];

  const {
    originalTeacherId,
    substituteTeacherId,
    fromDate,
    toDate,
    reason,
    note,
    setField,
  } = useObjectState({
    originalTeacherId: substitution?.originalTeacherId ?? teacherId ?? "",
    substituteTeacherId: substitution?.substituteTeacherId ?? "",
    fromDate: substitution ? dayOf(substitution.fromDate) : todayInput(),
    toDate: substitution ? dayOf(substitution.toDate) : todayInput(),
    reason: substitution?.reason ?? "illness",
    note: substitution?.note ?? "",
  });

  // Tahrirlashda tanlangan kataklar yozuvning O'ZIDAN keladi. Kalit shakli
  // `getAvailableLessons` bilan AYNAN bir xil bo'lishi shart.
  const [picked, setPicked] = useState(() =>
    (substitution?.items ?? []).map(
      (item) => `${item.classId}|${item.day}|${item.lessonOrder}`,
    ),
  );

  const { data: teachers = [] } = useQuery(substitutionQueries.teachers());

  const { data: available, isFetching } = useQuery(
    substitutionQueries.available(originalTeacherId, { fromDate, toDate }),
  );

  // Barqaror havola — pastdagi `useMemo` har renderda qayta ishlamasligi uchun
  const lessons = useMemo(() => available?.items ?? [], [available]);

  // Jami soat — tanlangan kataklarning takrorlanishlari yig'indisi
  const totalHours = useMemo(
    () =>
      lessons
        .filter((lesson) => picked.includes(lesson.key))
        .reduce((sum, lesson) => sum + lesson.occurrences, 0),
    [lessons, picked],
  );

  const toggle = (key) =>
    setPicked((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (picked.length === 0) {
      toast.error("Kamida bitta dars tanlang");
      return;
    }

    setIsLoading(true);

    const payload = {
      originalTeacherId,
      substituteTeacherId,
      fromDate,
      toDate,
      reason,
      note,
      lessons: lessons
        .filter((lesson) => picked.includes(lesson.key))
        .map((lesson) => ({
          classId: lesson.classId,
          day: lesson.day,
          lessonOrder: lesson.lessonOrder,
        })),
    };

    const handlers = {
      onSuccess: () => {
        close();
        toast.success(isEdit ? "O'rinbosarlik yangilandi" : "O'rinbosar biriktirildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    };

    if (isEdit) update({ id: substitution.id, ...payload }, handlers);
    else create(payload, handlers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── 1. Kim va kim ────────────────────────────────────── */}
      {/* ⚠️ `items-end` EMAS, `items-start`. Tanlagich ro'yxati OQIM ICHIDA
          ochiladi (portal emas — `TeacherPicker` sarlavhasiga qarang), ya'ni
          bitta katak balandligi o'zgaradi. Pastdan tekislansa, qo'shni
          maydon ro'yxat ochilganda pastga sirg'alib ketardi. */}
      <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
        <Field label="Dars egasi">
          <TeacherPicker
            value={originalTeacherId}
            teachers={teachers}
            placeholder="Kimning darsi ko'chiriladi"
            onChange={(id) => {
              setField("originalTeacherId", id);
              // ⚠️ Tanlov TOZALANADI: darslar ro'yxati egaga bog'liq va
              // eski tanlov yangi o'qituvchida umuman mavjud bo'lmasligi
              // mumkin. Server buni baribir rad etardi, lekin odam sababini
              // tushunmasdi.
              setPicked([]);
            }}
          />
        </Field>

        {/* Yorliq balandligi (22px) + maydon balandligining yarmi (22px)
            — o'q aynan maydonlar o'rtasiga to'g'ri keladi. */}
        <span className="mt-[22px] hidden h-11 items-center sm:flex">
          <ArrowRight className="size-4 text-slate-300" strokeWidth={2} />
        </span>

        <Field label="O'rinbosar">
          <TeacherPicker
            value={substituteTeacherId}
            teachers={teachers}
            excludeId={originalTeacherId}
            placeholder="Kim o'rniga chiqadi"
            onChange={(id) => setField("substituteTeacherId", id)}
          />
        </Field>
      </div>

      {/* ── 2. Davr ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        <DateField
          label="Boshlanish sanasi"
          value={fromDate}
          onChange={(next) => {
            setField("fromDate", next);
            // Davr o'zgardi — darslar ro'yxati ham o'zgaradi
            setPicked([]);
          }}
        />
        <DateField
          label="Tugash sanasi"
          value={toDate}
          min={fromDate}
          hint="Shu kun ham davrga kiradi"
          onChange={(next) => {
            setField("toDate", next);
            setPicked([]);
          }}
        />
      </div>

      {/* ── 3. Darslar ───────────────────────────────────────── */}
      <section>
        <div className="mb-2 flex items-center gap-3">
          <span className={T.label}>Ko'chiriladigan darslar</span>
          <span className={SURFACE.rule} />
          {picked.length > 0 && (
            <span className={cn(CHIP, "bg-indigo-50 text-indigo-700")}>
              {picked.length} dars · {formatHourNumber(totalHours)}
            </span>
          )}
        </div>

        {!originalTeacherId ? (
          <p className={cn(T.hint, "py-4 text-center")}>
            Avval dars egasini va davrni tanlang
          </p>
        ) : isFetching ? (
          <div className="space-y-2 py-3">
            {[90, 72, 56].map((width) => (
              <div
                key={width}
                className="h-2.5 rounded-full bg-slate-100 motion-safe:animate-breathe"
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <p className={cn(T.hint, "py-4 text-center")}>
            Bu davrda ushbu o'qituvchining darslari topilmadi
          </p>
        ) : (
          // ⚠️ `hidden-scrollbar` QO'YILMAYDI: bu ro'yxatda aylantirish
          // asosiy harakat va yashirilgan aylantirgich "ro'yxat shu yerda
          // tugadi" degan taassurot berardi.
          <ul className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1">
            {lessons.map((lesson) => (
              <LessonOption
                key={lesson.key}
                lesson={lesson}
                checked={picked.includes(lesson.key)}
                onToggle={() => toggle(lesson.key)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ── 4. Sabab ─────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <Field label="Sabab">
          {/* ⚠️ Ochiladigan ro'yxat EMAS: variantlar beshta va ular
              bir qatorga sig'adi. Ro'yxat esa joriy tanlovni yashirib,
              har safar ikki bosish talab qilardi. */}
          <div className="flex flex-wrap gap-1.5">
            {SUBSTITUTION_REASONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setField("reason", item.value)}
                className={cn(
                  "rounded-xl px-3 py-2 text-[12px] font-medium",
                  "transition-colors duration-200 ease-out-quint",
                  reason === item.value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={reason === "other" ? "Izoh (majburiy)" : "Izoh (ixtiyoriy)"}>
          <input
            value={note}
            onChange={(event) => setField("note", event.target.value)}
            required={reason === "other"}
            placeholder="Qisqacha tushuntirish"
            className={INPUT}
          />
        </Field>
      </div>

      {/* Oqibat — saqlashdan OLDIN aytiladi */}
      {picked.length > 0 && (
        <div className={cn(SURFACE.tile, "flex items-start gap-2.5")}>
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" strokeWidth={2.2} />
          <p className={cn(T.hint, "leading-relaxed")}>
            Tanlangan darslar uchun jurnal huquqi o'rinbosarga o'tadi, dars
            egasida esa faqat ko'rish rejimi qoladi.{" "}
            <span className="font-medium text-slate-700">
              {formatHourNumber(totalHours)}
            </span>{" "}
            uning oylik hisobidan ayirilib, o'rinbosarnikiga qo'shiladi.
          </p>
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Bekor qilish
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Biriktirish"}
        </Button>
      </div>
    </form>
  );
};

/**
 * Matn va sana maydonlari — chegarasiz, tint bilan ajraladi.
 *
 * ⚠️ Balandlik 44px (`h-11`): `TeacherPicker` tugmasi bilan AYNI. Bir
 * qatorda turgan ikki maydon bir piksel farq qilsa ham ko'zga tashlanadi.
 */
const INPUT =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-3 text-[12.5px] text-slate-900 " +
  "transition-colors duration-200 focus:bg-slate-100 focus:outline-none focus:ring-0";

const Field = ({ label, children }) => (
  <label className="block">
    <span className={cn(T.label, "mb-1.5 block")}>{label}</span>
    {children}
  </label>
);

/**
 * Bitta katak — sinf, fan, kun, tartib va davrdagi takrorlanish soni.
 *
 * ⚠️ Allaqachon boshqa o'rinbosarga berilgan katak O'CHIRILGAN holatda
 * ko'rinadi, ro'yxatdan yo'qolmaydi: "bu darsni tanlay olmayapman"
 * degan savolga ekranning o'zi javob berishi kerak.
 */
const LessonOption = ({ lesson, checked, onToggle }) => (
  <li>
    <button
      type="button"
      onClick={onToggle}
      disabled={lesson.alreadyAssigned}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ease-out-quint",
        lesson.alreadyAssigned
          ? "cursor-not-allowed bg-slate-50/60 opacity-55"
          : checked
            ? "bg-indigo-50"
            : "bg-slate-50/80 hover:bg-slate-100/80",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
          checked ? "bg-indigo-600 text-white" : "bg-white",
        )}
      >
        {checked && <Check className="size-2.5" strokeWidth={3} />}
      </span>

      <div className="min-w-0 flex-1">
        <p className={cn(T.tdName, "truncate")}>
          {lesson.className} · {lesson.subjectName}
        </p>
        <p className={cn(T.meta, "mt-0.5 truncate")}>
          {lesson.dayLabel}, {lesson.lessonOrder}-dars
          {lesson.startTime ? ` · ${lesson.startTime}–${lesson.endTime}` : ""}
        </p>
      </div>

      {lesson.alreadyAssigned ? (
        <span className={cn(CHIP, "bg-slate-100 text-slate-500")}>Band</span>
      ) : (
        <span className={cn(CHIP, "bg-white text-slate-600")}>
          {lesson.occurrences} marta
        </span>
      )}
    </button>
  </li>
);

/**
 * O'CHIRISH — BEKOR QILISH EMAS.
 *
 * ⚠️ Ikkalasi BOSHQA savolga javob beradi va shuning uchun ikki xil oyna:
 *
 *   · o'chirish — yozuv HECH QACHON kuchga kirmagan (hali boshlanmagan).
 *     Xato kiritilgan reja; uni saqlash tarixni ifloslantiradi, shuning
 *     uchun sabab ham so'ralmaydi.
 *   · bekor qilish — yozuv amalda bo'lgan yoki hozir amalda. U dalil:
 *     jurnal huquqi ochilgan, soat hisoblangan. Sababi MAJBURIY.
 */
export const DeleteSubstitutionModal = () => (
  <ResponsiveModal
    name="deleteSubstitution"
    title="O'rinbosarlikni o'chirish"
    description="Bu yozuv hali boshlanmagan — hech qanday jurnal huquqi ochilmagan va soat hisoblanmagan. Shuning uchun u butunlay o'chiriladi."
  >
    <DeleteSubstitutionForm />
  </ResponsiveModal>
);

const DeleteSubstitutionForm = ({ close, isLoading, setIsLoading, substitution }) => {
  const { mutate: remove } = useDeleteSubstitution();

  const handleDelete = () => {
    setIsLoading(true);

    remove(substitution.id, {
      onSuccess: () => {
        close();
        toast.success("O'rinbosarlik o'chirildi");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="space-y-4">
      <SubstitutionSummary substitution={substitution} />

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Yopish
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={isLoading}
          onClick={handleDelete}
          className="flex-1"
        >
          {isLoading ? "O'chirilmoqda..." : "O'chirish"}
        </Button>
      </div>
    </div>
  );
};

/** Ikkala oynada bir xil: kim → kim, davr va darslar soni. */
const SubstitutionSummary = ({ substitution }) => (
  <div className={cn(SURFACE.tile, "flex items-center gap-2.5")}>
    <CalendarRange className="size-3.5 shrink-0 text-slate-400" strokeWidth={2} />
    <div className="min-w-0">
      <p className={cn(T.tdName, "truncate")}>
        {substitution?.originalTeacherName} → {substitution?.substituteTeacherName}
      </p>
      <p className={cn(T.meta, "mt-0.5 truncate")}>
        {substitution?.periodLabel} · {substitution?.lessonCount} dars
      </p>
    </div>
  </div>
);

/**
 * BEKOR QILISH — o'chirish EMAS.
 *
 * ⚠️ Sabab MAJBURIY: bekor qilish o'tgan davr soatini egasiga qaytaradi,
 * ya'ni pulga tegadi. Sababsiz bunday amal keyin tushuntirib bo'lmasdi.
 */
export const CancelSubstitutionModal = () => (
  <ResponsiveModal
    name="cancelSubstitution"
    title="O'rinbosarlikni bekor qilish"
    description="Yozuv o'chirilmaydi — u bekor qilingan deb belgilanadi va tarixda qoladi."
  >
    <CancelSubstitutionForm />
  </ResponsiveModal>
);

const CancelSubstitutionForm = ({ close, isLoading, setIsLoading, substitution }) => {
  const { mutate: cancel } = useCancelSubstitution();
  const [reason, setReason] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);

    cancel(
      { id: substitution.id, reason },
      {
        onSuccess: (result) => {
          close();
          toast.success("O'rinbosarlik bekor qilindi");
          // Muhrlangan oylik avtomatik qayta hisoblanmaydi — buni jim
          // qoldirib bo'lmaydi (server `warnings` bilan aytadi).
          result?.warnings?.forEach((warning) => toast.warning(warning));
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SubstitutionSummary substitution={substitution} />

      <Field label="Bekor qilish sababi">
        <input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
          autoFocus
          placeholder="Masalan: o'qituvchi ishga chiqdi"
          className={INPUT}
        />
      </Field>

      <div className="flex gap-2.5">
        <Button type="button" variant="outline" onClick={close} className="flex-1">
          Yopish
        </Button>
        <Button
          type="submit"
          variant="danger"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Bekor qilinmoqda..." : "Bekor qilish"}
        </Button>
      </div>
    </form>
  );
};
