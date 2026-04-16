import http from "@/shared/api/http";

export const leadsAPI = {
  // Analytics
  getOverview: (params) => http.get("/leads/analytics/overview", { params }),
  getSourceAnalytics: (params) => http.get("/leads/analytics/sources", { params }),
  getConversion: (params) => http.get("/leads/analytics/conversion", { params }),
  getTrends: (params) => http.get("/leads/analytics/trends", { params }),
  getDirectionAnalytics: (params) => http.get("/leads/analytics/directions", { params }),
  getCategoryAnalytics: (params) => http.get("/leads/analytics/categories", { params }),

  // Leads
  getAll: (params) => http.get("/leads", { params }),
  getById: (id) => http.get(`/leads/${id}`),

  // Sources
  getSources: (params) => http.get("/leads/sources", { params }),
};
