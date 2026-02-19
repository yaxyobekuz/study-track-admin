// HTTP
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni boshqarish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getStats: () => api.get("/users/stats"),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
  getPassword: (id) => api.get(`/users/${id}/password`),
  exportUsers: (role) =>
    api.get("/users/export", { params: { role }, responseType: "blob" }),
};

// Subjects API
export const subjectsAPI = {
  getAll: () => api.get("/subjects"),
  create: (data) => api.post("/subjects", data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  export: () => api.get("/subjects/export", { responseType: "blob" }),
};

// Classes API
export const classesAPI = {
  getAll: () => api.get("/classes"),
  getOne: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  exportStudents: (id) =>
    api.get(`/classes/${id}/export`, { responseType: "blob" }),
  exportAll: () => api.get("/classes/export", { responseType: "blob" }),
};

// Schedules API
export const schedulesAPI = {
  getByClass: (classId) => api.get(`/schedules/class/${classId}`),
  getByDay: (classId, day) => api.get(`/schedules/class/${classId}/day/${day}`),
  getBySubject: (subjectId) => api.get(`/schedules/subject/${subjectId}`),
  getMyToday: () => api.get("/schedules/my-today"),
  getAllToday: () => api.get("/schedules/all-today"),
  exportByClass: (classId) =>
    api.get(`/schedules/class/${classId}/export`, { responseType: "blob" }),
  createOrUpdate: (data) => api.post("/schedules", data),
  updateCurrentTopic: (classId, subjectId, topicNumber) =>
    api.patch(`/schedules/class/${classId}/subject/${subjectId}/topic`, {
      topicNumber,
    }),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// Grades API
export const gradesAPI = {
  getAll: (params) => api.get("/grades", { params }),
  getByClassAndDate: (classId, date) =>
    api.get(`/grades/class/${classId}/date/${date}`),
  exportGrades: (classId, date, subjectId) =>
    api.get("/grades/export", {
      params: { classId, date, subjectId },
      responseType: "blob",
    }),
  getStudentGrades: (dateOrStudentId) => {
    // If it's a date format (YYYY-MM-DD), it's for current student with date filter
    if (
      typeof dateOrStudentId === "string" &&
      dateOrStudentId.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return api.get("/grades/student/my-grades", {
        params: { date: dateOrStudentId },
      });
    }
    // If it's undefined, get current student's all grades
    if (!dateOrStudentId) {
      return api.get("/grades/student/my-grades");
    }
    // Otherwise it's a student ID (for owner viewing specific student)
    return api.get(`/grades/student/${dateOrStudentId}`);
  },
  getTeacherSubjects: (classId) =>
    api.get(`/grades/teacher/subjects/${classId}`),
  getStudentsWithGrades: (params) =>
    api.get("/grades/students-with-grades", { params }),
  create: (data) => api.post("/grades", data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  delete: (id) => api.delete(`/grades/${id}`),
  getMissingToday: () => api.get("/grades/missing-today"),
};

// Holidays API
export const holidaysAPI = {
  getAll: () => api.get("/holidays"),
  create: (data) => api.post("/holidays", data),
  update: (id, data) => api.put(`/holidays/${id}`, data),
  delete: (id) => api.delete(`/holidays/${id}`),
  checkToday: () => api.get("/holidays/check/today"),
  checkDate: (date) => api.get(`/holidays/check/${date}`),
};

// Messages API
export const messagesAPI = {
  getAll: (params) => api.get("/messages", { params }),
  getOne: (id) => api.get(`/messages/${id}`),
  send: (data) => {
    const formData = new FormData();
    formData.append("messageText", data.messageText);
    formData.append("recipientType", data.recipientType);

    if (data.classId) formData.append("classId", data.classId);
    if (data.studentId) formData.append("studentId", data.studentId);
    if (data.file) formData.append("file", data.file);

    return api.post("/messages", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Statistics API
export const statisticsAPI = {
  getStudentWeekly: (studentId) =>
    api.get(`/statistics/weekly/current/${studentId}`),
  getClassRankings: (classId, params) =>
    api.get(`/statistics/weekly/class/${classId}/rankings`, { params }),
  getSchoolRankings: (params) =>
    api.get("/statistics/weekly/school/rankings", { params }),
  export: (params) =>
    api.get("/statistics/weekly/export", { params, responseType: "blob" }),
};

// Topics API
export const topicsAPI = {
  upload: (file, subjectId = null) => {
    const formData = new FormData();
    formData.append("file", file);
    if (subjectId) formData.append("subjectId", subjectId);

    return api.post("/topics/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getBySubject: (subjectId) => api.get(`/topics/subject/${subjectId}`),
  deleteBySubject: (subjectId) => api.delete(`/topics/subject/${subjectId}`),
};

// Coins API
export const coinsAPI = {
  getSettings: () => api.get("/coins/settings"),
  updateSettings: (data) => api.put("/coins/settings", data),
  getStats: () => api.get("/coins/stats"),
  getStudentTransactions: (studentId, params) =>
    api.get(`/coins/transactions/${studentId}`, { params }),
};

export default api;
