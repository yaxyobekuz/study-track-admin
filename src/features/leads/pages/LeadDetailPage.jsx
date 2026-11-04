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
  Pencil,
  School,
} from "lucide-react";

// Queries
import { leadsQueries } from "@/features/leads/queries/leads.queries";

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
import Can from "@/shared/components/guards/Can";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import LeadStageTimeline from "@/features/leads/components/LeadStageTimeline";
import LeadStageBar from "@/features/leads/components/LeadStageBar";
import { LeadFormModal } from "@/features/leads/components/LeadFormModal";
import { LeadStageModal } from "@/features/leads/components/LeadStageModal";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Utils (telefon ko'rinishi butun panelda bir xil)
import { formatPhoneUz } from "@/shared/utils/phone.utils";

const LeadDetailPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();

  const { openModal } = useModal();

  // ⚠️ Yagona so'rov moduli: bosqich belgilangandan keyin mutatsiya
  // `leadsKeys.all` ni bekor qiladi va bu sahifa ham yangilanadi.
  const { data, isLoading } = useQuery(leadsQueries.detail(leadId));

  const lead = data?.lead;
  const activities = data?.activities || [];
  const stageTimeline = data?.stageTimeline || [];

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
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-800">
            {lead.firstName} {lead.lastName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${leadStatusColors[lead.status]}`}
            >
              {lead.statusLabel || leadStatusLabels[lead.status]}
            </span>
            <LeadStageBar stage={lead.stage} isExited={lead.isExited} />
          </div>
        </div>

        <Can do="leads.update">
          <Button variant="outline" onClick={() => openModal("leadForm", { lead })}>
            <Pencil />
            Tahrirlash
          </Button>
        </Can>
      </div>

      {/* QABUL ZINAPOYASI — eng tepada: sahifaning asosiy savoli shu */}
      <LeadStageTimeline lead={lead} timeline={stageTimeline} />

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
                  <p className="text-sm text-gray-800">{formatPhoneUz(lead.phone)}</p>
                </div>
              </div>

              {lead.additionalPhone && (
                <div className="flex items-start gap-2.5">
                  <Phone size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Qo'shimcha raqam 1</p>
                    <p className="text-sm text-gray-800">
                      {formatPhoneUz(lead.additionalPhone)}
                    </p>
                  </div>
                </div>
              )}

              {lead.previousSchool && (
                <div className="flex items-start gap-2.5">
                  <School size={16} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Kelgan maktabi</p>
                    <p className="text-sm text-gray-800">{lead.previousSchool}</p>
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
                        Qo'shimcha raqam 2 (ota-ona)
                      </p>
                      <p className="text-sm text-gray-800">
                        {formatPhoneUz(lead.parentPhone)}
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
              {/* ⚠️ UCHTA BOSHQA-BOSHQA ODAM: tizimga kim kiritdi, bolani
                  kim olib keldi va kim mas'ul. Tahlil oxirgi ikkisi
                  bo'yicha qilinadi. */}
              {lead.createdBy && (
                <div>
                  <p className="text-xs text-gray-400">Kiritgan</p>
                  <p className="text-sm text-gray-800">
                    {lead.createdBy.firstName} {lead.createdBy.lastName}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">Kim olib keldi</p>
                <p className="text-sm text-gray-800">
                  {lead.broughtBy
                    ? `${lead.broughtBy.firstName} ${lead.broughtBy.lastName ?? ""}`.trim()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Mas'ul xodim</p>
                <p className="text-sm text-gray-800">
                  {lead.assignedTo
                    ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName ?? ""}`.trim()
                    : "Belgilanmagan"}
                </p>
              </div>
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
                    key={activity.id}
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

      <LeadFormModal />
      <LeadStageModal />
    </div>
  );
};

export default LeadDetailPage;
