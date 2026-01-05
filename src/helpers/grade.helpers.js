export const getGradeColor = (grade) => {
  if (grade === 5) return "bg-green-100 text-green-800 border-green-300";
  if (grade === 4) return "bg-blue-100 text-blue-800 border-blue-300";
  if (grade === 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-red-100 text-red-800 border-red-300";
};

export const calculateAverageGrade = (grades) => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.grade, 0);
  return (sum / grades.length).toFixed(2);
};

export const getGradeForSubject = (studentGrades, subjectId) => {
  if (!subjectId || subjectId === "all") return null;
  return studentGrades.find((g) => g.subject._id === subjectId);
};
