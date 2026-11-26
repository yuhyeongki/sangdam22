export type CounselingCategory =
  | '진로·진학'
  | '학업·학습'
  | '교우관계'
  | '정서·심리'
  | '가정·생활'
  | '기타';

export type CounselingMethod =
  | '대면 상담'
  | '전화·화상'
  | '학부모 연계'
  | '메신저·쪽지';

export type StudentRequestMethod = '대면 상담' | '전화·화상' | '메신저·쪽지';

export type MoodState = '안정' | '보통' | '스트레스' | '위기지원';

export type SupportLevel = '일반' | '관심' | '집중';

export type RequestStatus = '대기중' | '일정확정' | '완료' | '취소';

export interface Student {
  id: string;
  studentNumber: string;
  name: string;
  grade: number;
  classNum: number;
  numberInClass: number;
  phone: string;
  guardianPhone: string;
  focusArea: string;
  supportLevel: SupportLevel;
  personalMemo: string;
  createdAt: string;
}

export interface CounselingRecord {
  id: string;
  studentId: string;
  date: string;
  time: string;
  category: CounselingCategory;
  method: CounselingMethod;
  summary: string;
  details: string;
  actionPlan: string;
  moodState: MoodState;
  followUpDate?: string;
  counselorName: string;
  createdAt: string;
}

export interface CounselingRequest {
  id: string;
  requestCode: string;
  studentId?: string;
  studentName: string;
  gradeClass: string;
  contact: string;
  category: CounselingCategory;
  preferredDate: string;
  preferredTime: string;
  method: StudentRequestMethod;
  message: string;
  isConfidentialNote: boolean;
  status: RequestStatus;
  linkedRecordId?: string;
  createdAt: string;
}

export interface CounselingBootstrapData {
  students: Student[];
  records: CounselingRecord[];
  requests: CounselingRequest[];
}

export const COUNSELING_CATEGORIES: CounselingCategory[] = [
  '진로·진학',
  '학업·학습',
  '교우관계',
  '정서·심리',
  '가정·생활',
  '기타',
];

export const TIME_SLOTS: Array<{ time: string; label: string }> = [
  { time: '09:20', label: '1교시 후' },
  { time: '10:20', label: '2교시 후' },
  { time: '11:20', label: '3교시 후' },
  { time: '12:30', label: '점심시간' },
  { time: '14:20', label: '5교시 후' },
  { time: '15:40', label: '방과후 1부' },
  { time: '16:30', label: '방과후 2부' },
];
