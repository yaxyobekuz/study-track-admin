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

export const getGradeForSubject = (studentGrades, subjectId, lessonOrder = null) => {
  if (!subjectId || subjectId === "all") return null;
  
  const subjectGrades = studentGrades.filter((g) => g.subject._id === subjectId);
  
  if (subjectGrades.length === 0) return null;
  
  // Agar lesson order berilgan bo'lsa (bir fan bir necha marta bo'lsa), 
  // shu order bo'yicha bahoni qaytarish
  if (lessonOrder !== null && subjectGrades.length > 1) {
    const gradeAtOrder = subjectGrades[lessonOrder - 1];
    return gradeAtOrder || null;
  }
  
  // Aks holda birinchi bahoni qaytarish
  return subjectGrades[0];
};
