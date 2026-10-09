// Toast
import { toast } from "sonner";

// Utils
import { formatDateTimeUz } from "@/shared/utils/date.utils";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";
import { useReviewIssue } from "../queries/issues.mutations";

// Data
import {
  ISSUE_STATUSES,
  ISSUE_FINAL_STATUSES,
  issueStatusLabels,
  issueAuthorKindLabels,
} from "../data/issues.data";

// Components
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

const statusOptions = ISSUE_STATUSES.map((value) => ({
  value,
  label: issueStatusLabels[value],
}));

/**
 * Muammoni ko'rib chiqish: holat + javob.
 *
 * ⚠️ JAVOB YAKUNIY HOLATDA MAJBURIY — bu yerda ham, serverda ham
 * (`issue.service#reviewIssue`). Tekshiruv ikki joyda: formadagi
 * ogohlantirish odamga darhol ko'rinadi, serverdagi esa qoidani ushlab
 * turadi (API'ga to'g'ridan-to'g'ri murojaat bo'lsa ham).
 *
 * ⚠️ JAVOB BOTGA KETADI va maktab nomidan yoziladi — shuning uchun
 * maydon ostida buni aytib qo'yamiz: ma'muriyat "ichki izoh" deb o'ylab
 * yozib qo'ymasligi kerak.
 */
const ReviewIssueForm = ({ close, isLoading, setIsLoading, ...issue }) => {
  const { mutate: reviewIssue } = useReviewIssue();

  const { status, reply, setField } = useObjectState({
    // "Yangi" dan "ko'rilmoqda" ga o'tish eng ko'p uchraydigan qadam,
    // lekin tanlovni o'zgartirmaymiz: holatni odam o'zi hal qiladi.
    status: issue.status || "new",
    reply: issue.reply || "",
  });

  const needsReply = ISSUE_FINAL_STATUSES.includes(status);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (needsReply && !reply.trim()) {
      toast.warning("Yakunlash uchun javob matnini kiriting");
      return;
    }

    setIsLoading(true);

    reviewIssue(
      { id: issue.id, data: { status, reply: reply.trim() } },
      {
        onSuccess: (updated) => {
          // ⚠️ Javob YUBORILMAGAN bo'lishi mumkin (odam botni bloklagan).
          // Amal bajarildi, lekin buni jim o'tkazib yuborish ma'muriyatni
          // "javob ketdi" deb o'ylashga majburlardi.
          if (needsReply && updated && !updated.repliedAt) {
            toast.warning(
              "Holat saqlandi, lekin javob botga yetib bormadi — foydalanuvchi botni bloklagan bo'lishi mumkin",
            );
          } else {
            toast.success("Muammo ko'rib chiqildi");
          }
          close();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Xatolik yuz berdi");
        },
        onSettled: () => setIsLoading(false),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Murojaat */}
      <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-sm">
        <p>
          <span className="text-gray-500">Kimdan:</span>{" "}
          <span className="font-medium">
            {issue.author?.fullName || "Noma'lum"}
          </span>{" "}
          <span className="text-xs text-gray-500">
            ({issueAuthorKindLabels[issue.authorKind] || issue.authorKind})
          </span>
        </p>

        <p>
          <span className="text-gray-500">Kategoriya:</span>{" "}
          <span className="font-medium">{issue.categoryName || "—"}</span>
        </p>

        <p>
          <span className="text-gray-500">Yuborilgan:</span>{" "}
          <span className="font-medium">
            {formatDateTimeUz(issue.createdAt)}
          </span>
        </p>

        <p className="whitespace-pre-wrap border-t border-gray-200 pt-2 text-gray-800">
          {issue.body}
        </p>
      </div>

      <SelectField
        required
        label="Holat"
        value={status}
        options={statusOptions}
        triggerClassName="w-full"
        onChange={(value) => setField("status", value)}
      />

      <InputField
        type="textarea"
        value={reply}
        required={needsReply}
        label="Javob (foydalanuvchiga)"
        placeholder="Nima qilindi yoki nega rad etildi..."
        onChange={(e) => setField("reply", e.target.value)}
        description={
          needsReply
            ? "Javob botga yuboriladi — maktab nomidan yoziladi."
            : "Yakuniy holatda (hal qilindi / rad etildi) javob majburiy va botga yuboriladi."
        }
      />

      <div className="flex flex-col-reverse gap-4 pt-2 xs:flex-row xs:justify-end">
        <Button
          type="button"
          onClick={close}
          variant="secondary"
          disabled={isLoading}
        >
          Bekor qilish
        </Button>

        <Button disabled={isLoading}>
          {isLoading ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewIssueForm;
