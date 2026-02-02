export const getGradeColor = (grade) => {
  if (grade === 5) return "bg-green-100 text-green-800 border-green-300";
  if (grade === 4) return "bg-blue-100 text-blue-800 border-blue-300";
  if (grade === 3) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (grade === 2) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300"; // Grade 1
};

export const calculateAverageGrade = (grades) => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.grade, 0);
  return (sum / grades.length).toFixed(2);
};

export const getGradeForSubject = (studentGrades, subjectId, lessonOrder = null) => {
  if (!subjectId || subjectId === "all") return null;

  const subjectGrades = studentGrades.filter(
    (g) => g.subject && g.subject._id && g.subject._id.toString() === subjectId.toString()
  );

  if (subjectGrades.length === 0) return null;

  // Agar lesson order berilgan bo'lsa (bir fan bir necha marta bo'lsa),
  // shu order bo'yicha bahoni topish
  if (lessonOrder !== null) {
    const gradeAtOrder = subjectGrades.find((g) => g.lessonOrder === lessonOrder);
    // Agar shu order bo'yicha baho topilmasa, birinchi bahoni qaytarish
    return gradeAtOrder || subjectGrades[0];
  }

  // Aks holda birinchi bahoni qaytarish
  return subjectGrades[0];
};
