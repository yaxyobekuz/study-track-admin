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
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
};

// Subjects API
export const subjectsAPI = {
  getAll: () => api.get("/subjects"),
  create: (data) => api.post("/subjects", data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Classes API
export const classesAPI = {
  getAll: () => api.get("/classes"),
  getOne: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post("/classes", data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Schedules API
export const schedulesAPI = {
  getByClass: (classId) => api.get(`/schedules/class/${classId}`),
  getByDay: (classId, day) => api.get(`/schedules/class/${classId}/day/${day}`),
  createOrUpdate: (data) => api.post("/schedules", data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

// Grades API
export const gradesAPI = {
  getAll: (params) => api.get("/grades", { params }),
  getByClassAndDate: (classId, date) =>
    api.get(`/grades/class/${classId}/date/${date}`),
  getStudentGrades: (studentId) =>
    studentId
      ? api.get(`/grades/student/${studentId}`)
      : api.get("/grades/student/my-grades"),
  getTeacherSubjects: (classId) =>
    api.get(`/grades/teacher/subjects/${classId}`),
  getStudentsWithGrades: (params) =>
    api.get("/grades/students-with-grades", { params }),
  create: (data) => api.post("/grades", data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  delete: (id) => api.delete(`/grades/${id}`),
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

export default api;
