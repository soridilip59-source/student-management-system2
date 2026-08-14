/**
 * Standard Grade Calculation based on PRD:
 * 90–100 -> A+
 * 80–89  -> A
 * 70–79  -> B+
 * 60–69  -> B
 * 50–59  -> C
 * 40–49  -> D
 * <40    -> F
 */

const calculateGrade = (percentage) => {
  const p = Number(percentage);
  if (isNaN(p)) return { grade: 'F', result: 'Fail', gpa: 0.0 };

  if (p >= 90) return { grade: 'A+', result: 'Pass', gpa: 4.0 };
  if (p >= 80) return { grade: 'A', result: 'Pass', gpa: 3.7 };
  if (p >= 70) return { grade: 'B+', result: 'Pass', gpa: 3.3 };
  if (p >= 60) return { grade: 'B', result: 'Pass', gpa: 3.0 };
  if (p >= 50) return { grade: 'C', result: 'Pass', gpa: 2.0 };
  if (p >= 40) return { grade: 'D', result: 'Pass', gpa: 1.0 };
  return { grade: 'F', result: 'Fail', gpa: 0.0 };
};

const calculateAttendancePercentage = (presentCount, totalClasses) => {
  if (!totalClasses || totalClasses === 0) return 0;
  return parseFloat(((presentCount / totalClasses) * 100).toFixed(2));
};

module.exports = {
  calculateGrade,
  calculateAttendancePercentage,
};
