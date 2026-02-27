
export interface SchoolConfig {
  name: string;
  address: string;
  contact: string;
  academicYear: string;
  examType: string;
  logoUrl?: string;
}

export interface StudentInfo {
  rollNo: string;
  name: string;
  fatherName: string;
  dob: string;
  class: string;
  section: string;
}

export interface SubjectScore {
  rollNo: string;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
}

export interface ProcessedResult {
  student: StudentInfo;
  scores: SubjectScore[];
  summary: {
    totalMaxMarks: number;
    totalObtainedMarks: number;
    percentage: number;
    grade: string;
    status: 'Pass' | 'Fail';
  };
}

export enum GradeRules {
  A_PLUS = 90,
  A = 80,
  B = 70,
  C = 60,
  FAIL = 0
}
