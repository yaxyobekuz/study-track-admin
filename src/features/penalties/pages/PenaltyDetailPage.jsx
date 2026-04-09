// Toast
import { toast } from "sonner";

// React
import { useState } from "react";

// Data
import {
  penaltyStatusLabels,
  penaltyStatusColors,
  penaltyReviewOptions,
} from "../data/penalties.data";

// Router
import { useParams } from "react-router-dom";

// Hooks
import useArrayStore from "@/shared/hooks/useArrayStore";

// Utils & Helpers
import { cn } from "@/shared/utils/cn";
import { formatDateUZ } from "@/shared/utils/date.utils";
import { getRoleLabel } from "@/shared/helpers/role.helpers";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import SelectField from "@/shared/components/ui/select/SelectField";

// API
import { penaltiesAPI } from "@/features/penalties/api/penalties.api";

// Tanstack Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PenaltyDetailPage = () => {
  const { getCollectionData: getRolesData } = useArrayStore("roles");
  const roles = getRolesData();
  const { penaltyId } = useParams();

  const queryClient = useQueryClient();

  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewStatus, setReviewStatus] = useState("approved");

  const { data: penalty, isLoading: loading } = useQuery({
    queryKey: ["penalties", "detail", penaltyId],
    queryFn: () => penaltiesAPI.getById(penaltyId).then((res) => res.data.data),
  });

  const reviewMutation = useMutation({
    mutationFn: (body) => penaltiesAPI.review(penaltyId, body),
    onSuccess: (res) => {
      queryClient.setQueryData(
        ["penalties", "detail", penaltyId],
        res.data.data,
      );
      queryClient.invalidateQueries({ queryKey: ["penalties", "list"] });
      toast.success(
        reviewStatus === "approved"
          ? "Jarima tasdiqlandi"
          : "Jarima rad etildi",
      );
      setReviewStatus("");
      setRejectionReason("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Xatolik yuz berdi"),
  });

  const handleReview = () => {
    if (!reviewStatus) return;
    if (reviewStatus === "rejected" && !rejectionReason.trim()) {
      toast.error("Rad etish sababini kiriting");
      return;
    }
    const body = { status: reviewStatus };
    if (reviewStatus === "rejected") body.rejectionReason = rejectionReason;
    reviewMutation.mutate(body);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!penalty) return null;

  const isReduction = penalty.type === "reduction";

  return (
    <div className="space-y-4">
      {/* Top */}
      <div className="flex items-center gap-4 ">
        {/* Title */}
        <h1 className="page-title">Jarima ta'fsilotlari</h1>

        {/* Status */}
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
            penaltyStatusColors[penalty.status],
          )}
        >
          {penaltyStatusLabels[penalty.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <Card title="Asosiy ma'lumotlar" className="space-y-4">
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Tur">
                {isReduction ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700">
                    Kamaytirish
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-700">
                    Jarima
                  </span>
                )}
              </InfoRow>

              <InfoRow label="Foydalanuvchi">
                {penalty.user?.firstName} {penalty.user?.lastName}
              </InfoRow>

              <InfoRow label="Rol">
                {getRoleLabel(penalty.user?.role, roles)}
              </InfoRow>

              {(penalty.title || penalty.description) && (
                <InfoRow label="Sabab">
                  <span className="font-medium">
                    {penalty.title || penalty.description}
                  </span>
                </InfoRow>
              )}

              {penalty.title && penalty.description && (
                <InfoRow label="Izoh">{penalty.description}</InfoRow>
              )}

              <InfoRow label="Ball">
                {isReduction ? (
                  <span className="font-semibold text-green-600">
                    -{penalty.points}
                  </span>
                ) : (
                  <span className="font-semibold text-red-600">
                    +{penalty.points}
                  </span>
                )}
              </InfoRow>

              {penalty.fineAmount > 0 && (
                <InfoRow label="Jarima summasi">
                  {penalty.fineAmount.toLocaleString("uz-UZ")} so'm
                </InfoRow>
              )}

              {penalty.isCustom && (
                <InfoRow label="Kategoriya">
                  <span className="text-blue-500 text-xs">Kategoriyasiz</span>
                </InfoRow>
              )}

              {penalty.category && (
                <InfoRow label="Kategoriya">{penalty.category.title}</InfoRow>
              )}

              <InfoRow label="Sana">{formatDateUZ(penalty.createdAt)}</InfoRow>
            </div>
          </Card>

          <Card title="Tomonidan berildi" className="space-y-4">
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Foydalanuvchi">
                {penalty.givenBy?.firstName} {penalty.givenBy?.lastName}
              </InfoRow>

              <InfoRow label="Rol">
                {getRoleLabel(penalty.givenBy?.role, roles)}
              </InfoRow>
            </div>
          </Card>

          {/* Review info */}
          {penalty.reviewedBy && (
            <Card title="Ko'rib chiqildi" className="space-y-4">
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Foydalanuvchi">
                  {penalty.reviewedBy?.firstName} {penalty.reviewedBy?.lastName}
                </InfoRow>

                <InfoRow label="Sana">
                  {formatDateUZ(penalty.reviewedAt)}
                </InfoRow>

                {penalty.rejectionReason && (
                  <InfoRow label="Rad etish sababi">
                    <span className="text-red-600">
                      {penalty.rejectionReason}
                    </span>
                  </InfoRow>
                )}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {penalty.attachments?.length > 0 && (
            <Card title="Biriktirmalar" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {penalty.attachments.map((attachment, index) => (
                  <AttachmentItem key={index} attachment={attachment} />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* User stats */}
          <Card title="Foydalanuvchi holati" className="space-y-4">
            <div className="space-y-2 text-sm">
              <InfoRow label="Jami jarima bali">
                <span className="font-semibold text-red-600">
                  {penalty.user?.penaltyPoints ?? "-"}
                </span>
              </InfoRow>
            </div>
          </Card>

          {/* Review action */}
          {penalty.status === "pending" && (
            <Card title="Holatni o'zgartirish" className="space-y-4">
              <SelectField
                required
                label="Holat"
                value={reviewStatus}
                triggerClassName="w-full"
                onChange={setReviewStatus}
                options={penaltyReviewOptions}
              />

              {reviewStatus === "rejected" && (
                <InputField
                  required
                  type="textarea"
                  value={rejectionReason}
                  label="Rad etish sababi"
                  placeholder="Sababni kiriting..."
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              )}

              {reviewStatus && (
                <Button
                  className="w-full"
                  onClick={handleReview}
                  variant={reviewStatus === "approved" ? "default" : "danger"}
                  disabled={
                    reviewMutation.isPending ||
                    (reviewStatus === "rejected" && !rejectionReason.trim())
                  }
                >
                  O'zgartirish{reviewMutation.isPending && "..."}
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, children }) => (
  <p>
    <span className="text-gray-500">{label}:</span> <span>{children}</span>
  </p>
);

const AttachmentItem = ({ attachment }) => {
  const { url, type, originalName } = attachment;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={originalName}
          className="w-full h-auto max-h-96 object-cover rounded-lg border"
        />
      </a>
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        className="w-full h-auto max-h-96 rounded-lg border object-cover"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 text-sm"
    >
      <span className="truncate">{originalName || "Fayl"}</span>
    </a>
  );
};

export default PenaltyDetailPage;
