// API
import http from "@/shared/api/http";

/**
 * AI YORDAMCHI — oddiy (oqimsiz) so'rovlar. Chat oqimi alohida:
 * `assistantStream.js` (axios SSE o'qiy olmaydi).
 *
 * ⚠️ AUDIO `responseType: "blob"` BILAN. Xato javobi ham shu holda Blob
 * bo'lib keladi — matnini `lib/errors.js` dagi `readErrorMessage` o'qiydi.
 */
export const aiAssistantAPI = {
  getStatus: () => http.get("/ai-assistant/status"),

  getConversations: (params) => http.get("/ai-assistant/conversations", { params }),
  getConversation: (id) => http.get(`/ai-assistant/conversations/${id}`),
  renameConversation: (id, title) => http.patch(`/ai-assistant/conversations/${id}`, { title }),
  deleteConversation: (id) => http.delete(`/ai-assistant/conversations/${id}`),

  getActions: (params) => http.get("/ai-assistant/actions", { params }),
  confirmAction: (id, data) => http.post(`/ai-assistant/actions/${id}/confirm`, data),
  rejectAction: (id) => http.post(`/ai-assistant/actions/${id}/reject`),

  getMessageAudio: (id, config) =>
    http.get(`/ai-assistant/messages/${id}/audio`, { responseType: "blob", ...config }),
  getMessageSpeech: (id, config) =>
    http.post(`/ai-assistant/messages/${id}/speech`, null, { responseType: "blob", ...config }),
};

export default aiAssistantAPI;
