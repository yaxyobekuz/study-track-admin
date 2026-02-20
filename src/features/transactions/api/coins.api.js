import http from "@/shared/api/http";

export const coinsAPI = {
  getBalance: () => http.get("/api/coins/balance"),
  getTransactions: (params) => http.get("/api/coins/transactions", { params }),
};
