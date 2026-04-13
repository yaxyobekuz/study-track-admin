// Router
import { useParams, useNavigate } from "react-router-dom";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Icons
import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  Calendar,
} from "lucide-react";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Data
import {
  leadStatusLabels,
  leadStatusColors,
  leadActivityTypeLabels,
  leadActivityTypeColors,
} from "@/features/leads/data/leads.data";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";

const LeadDetailPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["leads", "detail", leadId],
    queryFn: () => leadsAPI.getById(leadId).then((res) => res.data),
  });

  const lead = data?.data?.lead;
  const activities = data?.data?.activities || [];

  if (isLoading) {
    return (
      <Card className="text-center py-10 text-gray-400">Yuklanmoqda...</Card>
    );
  }

  if (!lead) {
    return (
      <Card className="text-center py-10 text-gray-400">
        Sotuv topilmadi
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/leads")}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {lead.firstName} {lead.lastName}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium mt-1 ${leadStatusColors[lead.status]}`}
          >
            {leadStatusLabels[lead.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Lead info */}
        <div className="md:col-span-2 space-y-4">
          {/* Contact info */}
          <Card title="Aloqa ma'lumotlari">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Telefon</p>
                  <p className="text-sm text-gray-800">{lead.phone}</p>
                </div>
              </div>

              {lead.additionalPhone && (
                <div className="flex items-start gap-2.5">
                  <Phone size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Qo'shimcha telefon</p>
                    <p className="text-sm text-gray-800">
                      {lead.additionalPhone}
                    </p>
                  </div>
                </div>
              )}

              {lead.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Manzil</p>
                    <p className="text-sm text-gray-800">{lead.address}</p>
                  </div>
                </div>
              )}

              {lead.classInterest && (
                <div className="flex items-start gap-2.5">
                  <Calendar size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">
                      Qiziqish (sinf/yosh)
                    </p>
                    <p className="text-sm text-gray-800">
                      {lead.classInterest}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Parent info */}
          {(lead.parentName || lead.parentPhone) && (
            <Card title="Ota-ona ma'lumotlari">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                {lead.parentName && (
                  <div className="flex items-start gap-2.5">
                    <User size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Ota-ona ismi</p>
                      <p className="text-sm text-gray-800">
                        {lead.parentName}
                      </p>
                    </div>
                  </div>
                )}
                {lead.parentPhone && (
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Ota-ona telefoni
                      </p>
                      <p className="text-sm text-gray-800">
                        {lead.parentPhone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Additional info */}
          <Card title="Qo'shimcha ma'lumotlar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-400">Manba</p>
                <p className="text-sm text-gray-800">
                  {lead.source?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Yaratilgan sana</p>
                <p className="text-sm text-gray-800">
                  {formatDateUZ(lead.createdAt)}
                </p>
              </div>
              {lead.expectedEnrollDate && (
                <div>
                  <p className="text-xs text-gray-400">
                    Kutilayotgan ro'yxat sanasi
                  </p>
                  <p className="text-sm text-gray-800">
                    {formatDateUZ(lead.expectedEnrollDate)}
                  </p>
                </div>
              )}
              {lead.createdBy && (
                <div>
                  <p className="text-xs text-gray-400">Yaratgan</p>
                  <p className="text-sm text-gray-800">
                    {lead.createdBy.firstName} {lead.createdBy.lastName}
                  </p>
                </div>
              )}
            </div>

            {lead.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Izoh</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            )}

            {lead.lostReason && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">
                  Rad etish / Yo'qolish sababi
                </p>
                <p className="text-sm text-red-600">{lead.lostReason}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Activities timeline */}
        <div>
          <Card title="Harakatlar tarixi">
            <div className="mt-3 space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Hali harakatlar yo'q
                </p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="relative pl-4 pb-3 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                  >
                    <div className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-gray-400" />
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${leadActivityTypeColors[activity.type]}`}
                      >
                        {leadActivityTypeLabels[activity.type]}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDateUZ(activity.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {activity.description}
                    </p>
                    {activity.previousStatus && activity.newStatus && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {leadStatusLabels[activity.previousStatus]} →{" "}
                        {leadStatusLabels[activity.newStatus]}
                      </p>
                    )}
                    {activity.createdBy && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {activity.createdBy.firstName}{" "}
                        {activity.createdBy.lastName}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;
