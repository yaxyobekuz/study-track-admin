// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { Link } from "react-router-dom";

// API
import { leadsAPI } from "@/features/leads/api/leads.api";

// Data
import {
  leadStatusLabels,
  leadStatusColors,
} from "@/features/leads/data/leads.data";

// Utils
import { formatDateUZ } from "@/shared/utils/date.utils";

// Components
import Card from "@/shared/components/ui/Card";

const RecentLeads = () => {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", "recent"],
    queryFn: () =>
      leadsAPI
        .getAll({ limit: 10, sort: "-createdAt" })
        .then((res) => res.data.data),
  });

  return (
    <Card title="So'nggi sotuvlar" className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-8">Yuklanmoqda...</p>
      ) : leads.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Sotuvlar topilmadi
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2.5 px-3">Ism</th>
                <th className="text-left py-2.5 px-3">Telefon</th>
                <th className="text-left py-2.5 px-3">Manba</th>
                <th className="text-left py-2.5 px-3">Status</th>
                <th className="text-left py-2.5 px-3">Sana</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2.5 px-3 font-medium text-gray-800">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{lead.phone}</td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {lead.source?.name || "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${leadStatusColors[lead.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {leadStatusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 text-xs">
                    {formatDateUZ(lead.createdAt)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Link
                      to={`/leads/${lead._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ko'rish
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RecentLeads;
