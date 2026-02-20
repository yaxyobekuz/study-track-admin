import http from "@/shared/api/http";

export const gradesAPI = {
  getAll: (params) => http.get("/grades", { params }),
  getByClassAndDate: (classId, date) =>
    http.get(`/grades/class/${classId}/date/${date}`),
  exportGrades: (classId, date, subjectId) =>
    http.get("/grades/export", {
      params: { classId, date, subjectId },
      responseType: "blob",
    }),
  getStudentGrades: (dateOrStudentId) => {
    // If it's a date format (YYYY-MM-DD), it's for current student with date filter
    if (
      typeof dateOrStudentId === "string" &&
      dateOrStudentId.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return http.get("/grades/student/my-grades", {
        params: { date: dateOrStudentId },
      });
    }
    // If it's undefined, get current student's all grades
    if (!dateOrStudentId) {
      return http.get("/grades/student/my-grades");
    }
    // Otherwise it's a student ID (for owner viewing specific student)
    return http.get(`/grades/student/${dateOrStudentId}`);
  },
  getTeacherSubjects: (classId) =>
    http.get(`/grades/teacher/subjects/${classId}`),
  getStudentsWithGrades: (params) =>
    http.get("/grades/students-with-grades", { params }),
  create: (data) => http.post("/grades", data),
  update: (id, data) => http.put(`/grades/${id}`, data),
  delete: (id) => http.delete(`/grades/${id}`),
  getMissingToday: () => http.get("/grades/missing-today"),
};
