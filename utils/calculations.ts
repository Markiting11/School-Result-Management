
import { SubjectScore, ProcessedResult, StudentInfo } from '../types';

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  return 'Fail';
};

export const processResults = (
  students: StudentInfo[],
  scores: SubjectScore[]
): ProcessedResult[] => {
  return students.map(student => {
    const studentScores = scores.filter(s => s.rollNo === student.rollNo);
    
    const totalMaxMarks = studentScores.reduce((acc, curr) => acc + Number(curr.totalMarks), 0);
    const totalObtainedMarks = studentScores.reduce((acc, curr) => acc + Number(curr.obtainedMarks), 0);
    
    const percentage = totalMaxMarks > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
    const grade = calculateGrade(percentage);
    
    // Check if passed all subjects (Obtained >= Passing)
    const failedSubjects = studentScores.filter(s => Number(s.obtainedMarks) < Number(s.passingMarks));
    const status = failedSubjects.length === 0 && grade !== 'Fail' ? 'Pass' : 'Fail';

    return {
      student,
      scores: studentScores,
      summary: {
        totalMaxMarks,
        totalObtainedMarks,
        percentage: parseFloat(percentage.toFixed(2)),
        grade,
        status
      }
    };
  });
};
