/**
 * Registry of every modal name in the admin panel.
 *
 * A `<ResponsiveModal name="...">` and every `openModal("...")` call must use a
 * name from this list. Adding a new modal? Register its name here first — in dev,
 * opening an unregistered name logs a warning so typos surface immediately.
 */
export const MODAL_NAMES = [
  // User
  "profile",
  "editUserBasic",
  "editWorkSchedule",
  "editStudentClasses",
  "editStaffSubjects",
  "attendanceDay",
  "deleteUser",
  "archiveUser",
  "restoreUser",
  "createUser",
  "resetUserPassword",
  "viewUserPassword",
  "exportUsers",

  // Class
  "createClass",
  "editClass",
  "deleteClass",
  "addStudentsToClass",
  "moveClassStudents",
  "removeClassStudents",

  // Subject / Topics
  "createSubject",
  "editSubject",
  "deleteSubject",
  "uploadTopics",

  // Grade
  "editGrade",
  "deleteGrade",
  "createGrade",

  // Holiday
  "createHoliday",
  "editHoliday",
  "deleteHoliday",

  // Messages
  "sendMessage",
  "messageDetails",
  "cancelMessage",

  // Stats
  "studentStats",

  // Market
  "addDeliveryImage",
  "deleteMarketProduct",
  "updateMarketOrderStatus",

  // Penalties
  "createPenalty",
  "reviewPenalty",
  "penaltyDetail",
  "reducePenalty",
  "deletePenalty",
  "createPenaltyCategory",
  "editPenaltyCategory",
  "createReductionPackage",
  "editReductionPackage",
  "exemptTeachersModal",

  // Roles
  "createRole",
  "deleteRole",

  // Coin Distribution
  "confirmDistribution",

  // App / misc
  "downloadApp",
  "bugReport",

  // Social network
  "editSocialNetwork",
  "deleteSocialNetwork",
  "createSocialNetwork",

  // Task
  "stopTask",
  "reviewTask",
  "createTask",
  "extendDeadline",

  // Attendance
  "reviewExcuse",
  "createAbsenceReason",
  "editAbsenceReason",

  // O'qish davrlari
  "enrollmentPeriod",
  "closeEnrollment",

  // Moliya - tariflar
  "createTariff",
  "editTariff",
  "addTariffVersion",
  "editTariffVersion",
  "assignTariff",
  "changeStudentTariff",
  "generateInvoices",
  "recordPayment",
  "editStudentFinanceStatus",

  // Moliya - chegirmalar
  "createDiscount",
  "editDiscount",
  "assignDiscount",

  // Moliya - kassa va depozit
  "paymentAccount",
  "accountTransfer",
  "adjustAccount",
  "refundDeposit",
  "adjustStudentBalance",

  // Moliya - tashqi kirimlar
  "externalIncome",
  "voidExternalIncome",
  "incomeCategory",

  // Moliya - chiqim (oylik va xarajatlar)
  "staffSalary",
  "salaryPayment",
  "voidSalaryPayment",
  "cancelPayrollEntry",
  "expense",
  "voidExpense",
  "expenseCategory",

  // Moliya - ta'til
  "markVacation",

  // Moliya - qarzdorlarga Telegram eslatmasi
  "remindDebtors",

  // Moliya - sabab so'raladigan amallar (bekor qilish, qayta shakllantirish)
  "financeReason",

  // Premium
  "grantPremium",
  "createEmoji",
  "editEmoji",

  // Test seasons
  "announceSeason",
  "createSeason",
  "editSeason",
  "deleteSeason",
  "finalizeSeason",
  "createAssignment",
  "editAssignment",
  "deleteAssignment",

  // Changelog
  "createChangelog",
  "editChangelog",
  "deleteChangelog",
];
