// React
import { useEffect, useRef } from "react";

// Toast
import { toast } from "sonner";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";
import ResponsiveModal from "@/shared/components/ui/ResponsiveModal";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useUpdateUser } from "@/features/users/queries/users.mutations";
import { useUpdateEnrollment } from "@/features/enrollment/queries/enrollment.mutations";

// Queries & helpers
import { enrollmentQueries } from "@/features/enrollment/queries/enrollment.queries";
import { monthKeyToInputValue } from "@/shared/helpers/month.helpers";

// Data
import { genderOptions } from "../data/users.data";

/**
 * Asosiy ma'lumot kartasining tahrirlash oynasi: ism, familiya, jins.
 *
 * O'QUVCHI uchun bunga qo'shimcha "boshlang'ich oy to'lovi" ham chiqadi va u
 * o'quvchining OCHIQ o'qish davriga yoziladi (yaratishdagi UserForm bilan bir xil
 * maydon). Shu tufayli eski o'quvchida ham birinchi oy summasini keyin qo'yish
 * yoki o'zgartirish mumkin.
 *
 * Faqat o'zgargan maydonlar yuboriladi (`updateUser`/`updateEnrollment` ikkalasi
 * ham `!== undefined` sharti bilan yozadi) — boshqa narsalar tasodifan
 * o'chmaydi.
 */
const EditUserBasicModal = () => (
  <ResponsiveModal name="editUserBasic" title="Asosiy ma'lumotni tahrirlash">
    <Content />
  </ResponsiveModal>
);

const Content = ({ close, isLoading, setIsLoading, ...user }) => {
  const isStudent = user.role === "student";

  const { mutate: updateUser } = useUpdateUser();
  const { mutate: updateEnrollment } = useUpdateEnrollment();

  // O'quvchining OCHIQ (tugamagan) o'qish davri — birinchi oy summasi shunga
  // biriktiriladi. Faqat o'quvchi bo'lsa so'raymiz.
  const { data: enrollmentData } = useQuery({
    ...enrollmentQueries.forStudent(user.id),
    enabled: isStudent,
  });
  const openPeriod = (enrollmentData?.items ?? []).find((p) => !p.endDate) ?? null;

  const { firstName, lastName, gender, firstMonthKey, firstMonthAmount, setField } =
    useObjectState({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      gender: user.gender ?? "",
      firstMonthKey: "",
      firstMonthAmount: "",
    });

  // Ochiq davr asinxron yuklanadi — kelgach birinchi oy maydonlarini bir marta
  // to'ldiramiz (foydalanuvchi hozirgi qiymatni ko'rib turishi kerak).
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (openPeriod && !prefilledRef.current) {
      prefilledRef.current = true;
      setField("firstMonthKey", monthKeyToInputValue(openPeriod.firstMonthKey) || "");
      setField(
        "firstMonthAmount",
        openPeriod.firstMonthAmount != null ? String(openPeriod.firstMonthAmount) : "",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPeriod]);

  const handleError = (err) =>
    toast.error(err.response?.data?.message || "Xatolik yuz berdi");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Birinchi oy maydonlari o'zgardimi (faqat o'quvchi + ochiq davr bo'lsa)
    const curKey = monthKeyToInputValue(openPeriod?.firstMonthKey) || "";
    const curAmount =
      openPeriod?.firstMonthAmount != null ? String(openPeriod.firstMonthAmount) : "";
    const firstMonthChanged =
      isStudent &&
      openPeriod &&
      (firstMonthKey !== curKey || firstMonthAmount !== curAmount);

    const finish = () => {
      close();
      toast.success("Ma'lumotlar saqlandi");
    };

    updateUser(
      {
        id: user.id,
        data: { firstName, lastName, gender: gender || null },
      },
      {
        onSuccess: () => {
          if (!firstMonthChanged) {
            finish();
            setIsLoading(false);
            return;
          }
          // Boshlang'ich summa OCHIQ davrga yoziladi (qisman yangilash)
          updateEnrollment(
            {
              id: openPeriod.id,
              data: {
                firstMonthKey: firstMonthKey || null,
                firstMonthAmount: firstMonthAmount || null,
              },
            },
            {
              onSuccess: () => {
                finish();
                toast.info(
                  "Boshlang'ich summa o'zgardi — o'sha oy hisob-fakturasini " +
                    "\"Qayta shakllantirish\" bilan yangilang.",
                );
              },
              onError: handleError,
              onSettled: () => setIsLoading(false),
            },
          );
        },
        onError: (err) => {
          handleError(err);
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        required
        label="Ism"
        name="firstName"
        value={firstName}
        placeholder="Falonchi"
        onChange={(e) => setField("firstName", e.target.value)}
      />

      <InputField
        required
        label="Familiya"
        name="lastName"
        value={lastName}
        placeholder="Falonchiyev"
        onChange={(e) => setField("lastName", e.target.value)}
      />

      <SelectField
        label="Jins"
        value={gender}
        options={genderOptions}
        placeholder="Jinsni tanlang"
        onChange={(value) => setField("gender", value)}
      />

      {/* ── Boshlang'ich (birinchi oy) to'lovi — faqat o'quvchi + ochiq davr ── */}
      {isStudent && openPeriod && (
        <div className="space-y-3.5 rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">
            Boshlang'ich to'lov — belgilangan oyga aynan shu summa qarz sifatida
            yoziladi (kun-proratsiyasiz). Bo'sh qolsa — tarif bo'yicha hisoblanadi.
          </p>
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
            <InputField
              type="month"
              name="firstMonthKey"
              label="Birinchi to'lov oyi"
              value={firstMonthKey}
              onChange={(e) => setField("firstMonthKey", e.target.value)}
            />
            <InputField
              min="0"
              step="0.01"
              type="number"
              name="firstMonthAmount"
              label="Birinchi oy to'lovi (so'm)"
              value={firstMonthAmount}
              placeholder="Masalan: 300000"
              onChange={(e) => setField("firstMonthAmount", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3.5 w-full mt-5 xs:m-0 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          className="w-full xs:w-32"
        >
          Bekor qilish
        </Button>

        <Button autoFocus disabled={isLoading} className="w-full xs:w-32">
          Saqlash
          {isLoading && "..."}
        </Button>
      </div>
    </form>
  );
};

export default EditUserBasicModal;
