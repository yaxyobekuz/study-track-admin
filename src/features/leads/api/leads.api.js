import http from "@/shared/api/http";

export const leadsAPI = {
  // Analytics
  getOverview: (params) => http.get("/leads/analytics/overview", { params }),
  getSourceAnalytics: (params) => http.get("/leads/analytics/sources", { params }),
  getConversion: (params) => http.get("/leads/analytics/conversion", { params }),
  // XODIMLAR KESIMI — "kim nechta olib keldi, nechtasi qoldi"
  getStaffConversion: (params) => http.get("/leads/analytics/staff", { params }),
  getTrends: (params) => http.get("/leads/analytics/trends", { params }),
  getDirectionAnalytics: (params) => http.get("/leads/analytics/directions", { params }),
  getCategoryAnalytics: (params) => http.get("/leads/analytics/categories", { params }),

  // QABUL ZINAPOYASI — pog'onalar serverdan (yagona manba)
  getStages: () => http.get("/leads/stages"),

  // Leads
  getAll: (params) => http.get("/leads", { params }),
  getById: (id) => http.get(`/leads/${id}`),
  create: (data) => http.post("/leads", data),
  update: (id, data) => http.put(`/leads/${id}`, data),
  // Pog'onani belgilash / chiqib ketganini qayd etish
  updateStatus: (id, data) => http.put(`/leads/${id}/status`, data),
  remove: (id) => http.delete(`/leads/${id}`),

  // Kataloglar
  getSources: (params) => http.get("/leads/sources", { params }),
  getDirections: (params) => http.get("/leads/directions", { params }),
  getCategories: (params) => http.get("/leads/categories", { params }),
};
