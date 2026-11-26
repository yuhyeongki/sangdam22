import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'counseling-db.json');

interface Student {
  id: string;
  studentNumber: string;
  name: string;
  grade: number;
  classNum: number;
  numberInClass: number;
  phone: string;
  guardianPhone: string;
  focusArea: string;
  supportLevel: '일반' | '관심' | '집중';
  personalMemo: string;
  createdAt: string;
}

interface CounselingRecord {
  id: string;
  studentId: string;
  date: string;
  time: string;
  category: '진로·진학' | '학업·학습' | '교우관계' | '정서·심리' | '가정·생활' | '기타';
  method: '대면 상담' | '전화·화상' | '학부모 연계' | '메신저·쪽지';
  summary: string;
  details: string;
  actionPlan: string;
  moodState: '안정' | '보통' | '스트레스' | '위기지원';
  followUpDate?: string;
  counselorName: string;
  createdAt: string;
}

interface CounselingRequest {
  id: string;
  requestCode: string;
  studentId?: string;
  studentName: string;
  gradeClass: string;
  contact: string;
  category: '진로·진학' | '학업·학습' | '교우관계' | '정서·심리' | '가정·생활' | '기타';
  preferredDate: string;
  preferredTime: string;
  method: '대면 상담' | '전화·화상' | '메신저·쪽지';
  message: string;
  isConfidentialNote: boolean;
  status: '대기중' | '일정확정' | '완료' | '취소';
  linkedRecordId?: string;
  createdAt: string;
}

interface DatabaseSchema {
  students: Student[];
  records: CounselingRecord[];
  requests: CounselingRequest[];
}

function formatOffsetDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createInitialData(): DatabaseSchema {
  const today = formatOffsetDate(0);
  const tomorrow = formatOffsetDate(1);
  const twoDaysAgo = formatOffsetDate(-2);
  const fiveDaysAgo = formatOffsetDate(-5);
  const nineDaysAgo = formatOffsetDate(-9);
  const fourteenDaysAgo = formatOffsetDate(-14);
  const nextWeek = formatOffsetDate(5);

  const students: Student[] = [
    {
      id: 'stu-1',
      studentNumber: '20314',
      name: '김서연',
      grade: 2,
      classNum: 3,
      numberInClass: 14,
      phone: '010-4821-3910',
      guardianPhone: '010-9102-3910',
      focusArea: '진로 탐색 · 이공계 학과 선택',
      supportLevel: '일반',
      personalMemo:
        '평소 수업 태도가 성실하며 생명공학 및 데이터 분석 분야에 관심이 많음. 시험 기간 직전 자기효능감이 일시적으로 낮아지는 경향이 있어 격려 중심 피드백이 효과적임.',
      createdAt: `${fourteenDaysAgo}T09:00:00.000Z`,
    },
    {
      id: 'stu-2',
      studentNumber: '10508',
      name: '박민준',
      grade: 1,
      classNum: 5,
      numberInClass: 8,
      phone: '010-3319-8241',
      guardianPhone: '010-7741-8241',
      focusArea: '교우 관계 적응 · 학교 생활 안정',
      supportLevel: '집중',
      personalMemo:
        '전학 직후 낯가림으로 점심시간 혼자 있는 경우가 잦았으나, 최근 동아리 활동(코딩반)에 관심을 보임. 격주 화요일 정기 체크인 권장.',
      createdAt: `${fourteenDaysAgo}T09:10:00.000Z`,
    },
    {
      id: 'stu-3',
      studentNumber: '30121',
      name: '이지은',
      grade: 3,
      classNum: 1,
      numberInClass: 21,
      phone: '010-5592-1104',
      guardianPhone: '010-8834-1104',
      focusArea: '수험 스트레스 관리 · 수면 루틴',
      supportLevel: '관심',
      personalMemo:
        '수시 자기소개서 및 모의고사 성적 변동에 대한 압박감이 큼. 수면 시간이 5시간 미만으로 줄어든 날에는 두통을 호소하므로 건강관리와 학습 분량 조율 병행 필요.',
      createdAt: `${fourteenDaysAgo}T09:20:00.000Z`,
    },
    {
      id: 'stu-4',
      studentNumber: '20105',
      name: '최도윤',
      grade: 2,
      classNum: 1,
      numberInClass: 5,
      phone: '010-6204-7731',
      guardianPhone: '010-4410-7731',
      focusArea: '학습 집중력 · 시간 관리 코칭',
      supportLevel: '일반',
      personalMemo:
        '수행평가 마감 직전에 몰아서 하는 습관이 있어 주간 플래너 활용법을 함께 연습 중. 긍정적인 라포가 잘 형성되어 있음.',
      createdAt: `${fourteenDaysAgo}T09:30:00.000Z`,
    },
    {
      id: 'stu-5',
      studentNumber: '10219',
      name: '정하은',
      grade: 1,
      classNum: 2,
      numberInClass: 19,
      phone: '010-7183-5029',
      guardianPhone: '010-3905-5029',
      focusArea: '가족 간 소통 · 정서 지원',
      supportLevel: '관심',
      personalMemo:
        '부모님과 진로 방향에 대한 의견 차이로 대화 시 위축되는 경향. 본인의 미술·디자인 포트폴리오 열의가 높으므로 학부모 상담 연계 시 강점 중심 전달 필요.',
      createdAt: `${fourteenDaysAgo}T09:40:00.000Z`,
    },
  ];

  const records: CounselingRecord[] = [
    {
      id: 'rec-1',
      studentId: 'stu-2',
      date: twoDaysAgo,
      time: '12:30',
      category: '교우관계',
      method: '대면 상담',
      summary: '코딩 동아리 체험 후 또래와 첫 프로젝트 팀 구성',
      details:
        '지난 상담에서 추천했던 방과후 코딩 동아리에 참여하여 같은 반 친구 2명과 짝을 이뤄 과제를 수행함. 아직 먼저 말을 거는 것은 어색하지만 점심시간에 함께 이동하는 빈도가 늘었다고 긍정적으로 보고함.',
      actionPlan: '다음 주 동아리 발표 준비 과정 점검 및 모둠 내 역할 적응 여부 확인.',
      moodState: '보통',
      followUpDate: nextWeek,
      counselorName: '한지민 상담교사',
      createdAt: `${twoDaysAgo}T13:10:00.000Z`,
    },
    {
      id: 'rec-2',
      studentId: 'stu-2',
      date: nineDaysAgo,
      time: '15:40',
      category: '정서·심리',
      method: '대면 상담',
      summary: '전학 초기 낯설음과 소외감 호소, 관심사 기반 소그룹 탐색',
      details:
        '새 학교 환경에서 쉬는 시간 대화가 어색해 위축감을 느낀다고 표현함. 평소 컴퓨터 및 간단한 게임 제작에 흥미가 있음을 확인하여 교내 동아리 및 소규모 활동 안내를 진행함.',
      actionPlan: '동아리 담당 교사에게 학생 관심사 공유 및 첫 방문 동행 안내.',
      moodState: '스트레스',
      followUpDate: twoDaysAgo,
      counselorName: '한지민 상담교사',
      createdAt: `${nineDaysAgo}T16:20:00.000Z`,
    },
    {
      id: 'rec-3',
      studentId: 'stu-3',
      date: fiveDaysAgo,
      time: '16:30',
      category: '학업·학습',
      method: '대면 상담',
      summary: '모의고사 이후 불안감 완화 및 수면 6시간 이상 확보 약속',
      details:
        '최근 모의고사 수학 점수 하락으로 인한 자책감이 컸음. 오답 원인 분석 시 실수 비중이 높아 수면 부족이 주요 요인임을 함께 확인하고, 밤 12시 30분 이전 취침 루틴을 세움.',
      actionPlan: '주간 수면·컨디션 체크표 작성 후 다음 상담 시 검토.',
      moodState: '스트레스',
      followUpDate: tomorrow,
      counselorName: '한지민 상담교사',
      createdAt: `${fiveDaysAgo}T17:10:00.000Z`,
    },
    {
      id: 'rec-4',
      studentId: 'stu-1',
      date: fiveDaysAgo,
      time: '14:20',
      category: '진로·진학',
      method: '대면 상담',
      summary: '생명정보공학 vs 의생명공학과 교과 선택과목 비교',
      details:
        '2학년 2학기 선택과목 확정을 앞두고 화학Ⅱ와 확률과 통계 중 우선순위를 고민함. 희망 대학 모집요강을 함께 열람하여 필수 이수 권장 과목을 정리해 줌.',
      actionPlan: '진로 체험 보고서 초안 작성 시 참고 도서 2권 안내.',
      moodState: '안정',
      counselorName: '한지민 상담교사',
      createdAt: `${fiveDaysAgo}T15:00:00.000Z`,
    },
    {
      id: 'rec-5',
      studentId: 'stu-5',
      date: nineDaysAgo,
      time: '15:40',
      category: '가정·생활',
      method: '학부모 연계',
      summary: '디자인 진로 희망에 대한 보호자 이해 증진 전화 상담',
      details:
        '학생의 시각디자인 포트폴리오 작업물과 학업 병행 계획을 보호자에게 구체적으로 설명함. 보호자께서도 학생의 진정성을 이해하고 학기말까지 자율 탐색 시간을 존중하기로 합의함.',
      actionPlan: '학생 본인의 주간 학습·실기 균형표 공유 및 월 1회 정기 피드백.',
      moodState: '안정',
      counselorName: '한지민 상담교사',
      createdAt: `${nineDaysAgo}T16:30:00.000Z`,
    },
    {
      id: 'rec-6',
      studentId: 'stu-4',
      date: fourteenDaysAgo,
      time: '12:30',
      category: '학업·학습',
      method: '대면 상담',
      summary: '수행평가 일정 분산 및 25분 집중 타이머 학습법 도입',
      details:
        '과제 시작 전 부담감으로 미루는 패턴을 줄이기 위해 하루 25분 단위 작은 목표를 설정하기로 함.',
      actionPlan: '2주 후 수행평가 제출 현황 및 만족도 점검.',
      moodState: '안정',
      counselorName: '한지민 상담교사',
      createdAt: `${fourteenDaysAgo}T13:00:00.000Z`,
    },
  ];

  const requests: CounselingRequest[] = [
    {
      id: 'req-1',
      requestCode: 'REQ-2041',
      studentId: 'stu-3',
      studentName: '이지은',
      gradeClass: '3학년 1반',
      contact: '010-5592-1104',
      category: '정서·심리',
      preferredDate: today,
      preferredTime: '15:40',
      method: '대면 상담',
      message: '저번 주 약속했던 수면 체크표 정리해서 가져갈게요. 최근 컨디션 얘기도 조금 더 나누고 싶습니다.',
      isConfidentialNote: false,
      status: '일정확정',
      createdAt: `${twoDaysAgo}T11:20:00.000Z`,
    },
    {
      id: 'req-2',
      requestCode: 'REQ-2042',
      studentId: 'stu-1',
      studentName: '김서연',
      gradeClass: '2학년 3반',
      contact: '010-4821-3910',
      category: '진로·진학',
      preferredDate: today,
      preferredTime: '12:30',
      method: '대면 상담',
      message: '진로 보고서 주제 2개 중에 어떤 게 더 나을지 짧게 피드백 받고 싶어요!',
      isConfidentialNote: false,
      status: '대기중',
      createdAt: `${today}T08:40:00.000Z`,
    },
    {
      id: 'req-3',
      requestCode: 'REQ-2043',
      studentId: 'stu-5',
      studentName: '정하은',
      gradeClass: '1학년 2반',
      contact: '010-7183-5029',
      category: '가정·생활',
      preferredDate: tomorrow,
      preferredTime: '14:20',
      method: '대면 상담',
      message: '집에서 진로 이야기할 때 조금 긴장돼서 선생님께 조언을 구하고 싶습니다.',
      isConfidentialNote: true,
      status: '대기중',
      createdAt: `${today}T09:15:00.000Z`,
    },
  ];

  return { students, records, requests };
}

function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    const initial = createInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDatabase(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function parseGradeClass(gradeClass: string): { grade: number; classNum: number } {
  const match = gradeClass.match(/(\d+)\s*학년\s*(\d+)\s*반/);
  if (match) {
    return { grade: Number(match[1]) || 1, classNum: Number(match[2]) || 1 };
  }
  const nums = gradeClass.match(/\d+/g);
  if (nums && nums.length >= 2) {
    return { grade: Number(nums[0]) || 1, classNum: Number(nums[1]) || 1 };
  }
  return { grade: 1, classNum: 1 };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/bootstrap', (_req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json(db);
  });

  app.post('/api/students', (req: Request, res: Response) => {
    const body = req.body as Partial<Student>;
    if (!body.name || !body.name.trim()) {
      res.status(400).json({ error: '학생 이름을 입력해 주세요.' });
      return;
    }

    const db = ensureDatabase();
    const grade = Number(body.grade) || 1;
    const classNum = Number(body.classNum) || 1;
    const numberInClass = Number(body.numberInClass) || 1;
    const studentNumber =
      body.studentNumber?.trim() ||
      `${grade}${String(classNum).padStart(2, '0')}${String(numberInClass).padStart(2, '0')}`;

    const newStudent: Student = {
      id: generateId('stu'),
      studentNumber,
      name: body.name.trim(),
      grade,
      classNum,
      numberInClass,
      phone: (body.phone || '').trim(),
      guardianPhone: (body.guardianPhone || '').trim(),
      focusArea: (body.focusArea || '일반 상담').trim(),
      supportLevel: body.supportLevel || '일반',
      personalMemo: (body.personalMemo || '').trim(),
      createdAt: new Date().toISOString(),
    };

    db.students.unshift(newStudent);
    saveDatabase(db);
    res.status(201).json(newStudent);
  });

  app.patch('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Partial<Student>;
    const db = ensureDatabase();
    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: '학생 정보를 찾을 수 없습니다.' });
      return;
    }

    const current = db.students[idx];
    const updated: Student = {
      ...current,
      name: typeof body.name === 'string' && body.name.trim() ? body.name.trim() : current.name,
      grade: typeof body.grade === 'number' ? body.grade : current.grade,
      classNum: typeof body.classNum === 'number' ? body.classNum : current.classNum,
      numberInClass: typeof body.numberInClass === 'number' ? body.numberInClass : current.numberInClass,
      studentNumber:
        typeof body.studentNumber === 'string' && body.studentNumber.trim()
          ? body.studentNumber.trim()
          : current.studentNumber,
      phone: typeof body.phone === 'string' ? body.phone.trim() : current.phone,
      guardianPhone: typeof body.guardianPhone === 'string' ? body.guardianPhone.trim() : current.guardianPhone,
      focusArea: typeof body.focusArea === 'string' ? body.focusArea.trim() : current.focusArea,
      supportLevel: body.supportLevel || current.supportLevel,
      personalMemo: typeof body.personalMemo === 'string' ? body.personalMemo : current.personalMemo,
    };

    db.students[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/students/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = ensureDatabase();
    const exists = db.students.some((s) => s.id === id);
    if (!exists) {
      res.status(404).json({ error: '학생 정보를 찾을 수 없습니다.' });
      return;
    }
    db.students = db.students.filter((s) => s.id !== id);
    db.records = db.records.filter((r) => r.studentId !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/records', (req: Request, res: Response) => {
    const body = req.body as Partial<CounselingRecord>;
    if (!body.studentId || !body.summary?.trim() || !body.details?.trim()) {
      res.status(400).json({ error: '학생, 상담 요약, 상담 내용을 모두 입력해 주세요.' });
      return;
    }

    const db = ensureDatabase();
    const studentExists = db.students.some((s) => s.id === body.studentId);
    if (!studentExists) {
      res.status(404).json({ error: '해당 학생이 존재하지 않습니다.' });
      return;
    }

    const newRecord: CounselingRecord = {
      id: generateId('rec'),
      studentId: body.studentId,
      date: body.date || formatOffsetDate(0),
      time: body.time || '14:20',
      category: body.category || '진로·진학',
      method: body.method || '대면 상담',
      summary: body.summary.trim(),
      details: body.details.trim(),
      actionPlan: (body.actionPlan || '').trim(),
      moodState: body.moodState || '보통',
      followUpDate: body.followUpDate?.trim() || undefined,
      counselorName: (body.counselorName || '한지민 상담교사').trim(),
      createdAt: new Date().toISOString(),
    };

    db.records.unshift(newRecord);
    saveDatabase(db);
    res.status(201).json(newRecord);
  });

  app.patch('/api/records/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Partial<CounselingRecord>;
    const db = ensureDatabase();
    const idx = db.records.findIndex((r) => r.id === id);
    if (idx === -1) {
      res.status(404).json({ error: '상담 기록을 찾을 수 없습니다.' });
      return;
    }

    const current = db.records[idx];
    const updated: CounselingRecord = {
      ...current,
      date: body.date || current.date,
      time: body.time || current.time,
      category: body.category || current.category,
      method: body.method || current.method,
      summary: typeof body.summary === 'string' && body.summary.trim() ? body.summary.trim() : current.summary,
      details: typeof body.details === 'string' && body.details.trim() ? body.details.trim() : current.details,
      actionPlan: typeof body.actionPlan === 'string' ? body.actionPlan.trim() : current.actionPlan,
      moodState: body.moodState || current.moodState,
      followUpDate: typeof body.followUpDate === 'string' ? body.followUpDate.trim() || undefined : current.followUpDate,
      counselorName:
        typeof body.counselorName === 'string' && body.counselorName.trim()
          ? body.counselorName.trim()
          : current.counselorName,
    };

    db.records[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/records/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = ensureDatabase();
    const exists = db.records.some((r) => r.id === id);
    if (!exists) {
      res.status(404).json({ error: '상담 기록을 찾을 수 없습니다.' });
      return;
    }
    db.records = db.records.filter((r) => r.id !== id);
    saveDatabase(db);
    res.json({ ok: true });
  });

  app.post('/api/requests', (req: Request, res: Response) => {
    const body = req.body as Partial<CounselingRequest>;
    if (!body.studentName?.trim() || !body.gradeClass?.trim() || !body.preferredDate || !body.preferredTime) {
      res.status(400).json({ error: '이름, 학년/반, 희망 날짜와 시간을 입력해 주세요.' });
      return;
    }

    const db = ensureDatabase();
    const matchedStudent = body.studentId
      ? db.students.find((s) => s.id === body.studentId)
      : db.students.find(
          (s) =>
            s.name === body.studentName?.trim() &&
            `${s.grade}학년 ${s.classNum}반` === body.gradeClass?.trim(),
        );

    const requestCode = `REQ-${Math.floor(2100 + Math.random() * 7800)}`;
    const newRequest: CounselingRequest = {
      id: generateId('req'),
      requestCode,
      studentId: matchedStudent?.id,
      studentName: body.studentName.trim(),
      gradeClass: body.gradeClass.trim(),
      contact: (body.contact || matchedStudent?.phone || '').trim(),
      category: body.category || '진로·진학',
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime,
      method: body.method || '대면 상담',
      message: (body.message || '').trim(),
      isConfidentialNote: Boolean(body.isConfidentialNote),
      status: '대기중',
      createdAt: new Date().toISOString(),
    };

    db.requests.unshift(newRequest);
    saveDatabase(db);
    res.status(201).json(newRequest);
  });

  app.patch('/api/requests/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Partial<CounselingRequest>;
    const db = ensureDatabase();
    const idx = db.requests.findIndex((r) => r.id === id);
    if (idx === -1) {
      res.status(404).json({ error: '상담 신청을 찾을 수 없습니다.' });
      return;
    }
    const current = db.requests[idx];
    const updated: CounselingRequest = {
      ...current,
      status: body.status || current.status,
      preferredDate: body.preferredDate || current.preferredDate,
      preferredTime: body.preferredTime || current.preferredTime,
      linkedRecordId: body.linkedRecordId || current.linkedRecordId,
    };
    db.requests[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.post('/api/requests/:id/convert', (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as {
      summary?: string;
      details?: string;
      actionPlan?: string;
      moodState?: CounselingRecord['moodState'];
      followUpDate?: string;
      counselorName?: string;
    };

    if (!body.summary?.trim() || !body.details?.trim()) {
      res.status(400).json({ error: '상담 요약과 상세 내용을 입력해 주세요.' });
      return;
    }

    const db = ensureDatabase();
    const reqIdx = db.requests.findIndex((r) => r.id === id);
    if (reqIdx === -1) {
      res.status(404).json({ error: '상담 신청을 찾을 수 없습니다.' });
      return;
    }

    const requestItem = db.requests[reqIdx];
    let targetStudent = requestItem.studentId
      ? db.students.find((s) => s.id === requestItem.studentId)
      : db.students.find((s) => s.name === requestItem.studentName);

    let createdStudent: Student | null = null;
    if (!targetStudent) {
      const { grade, classNum } = parseGradeClass(requestItem.gradeClass);
      const numberInClass = db.students.length + 1;
      createdStudent = {
        id: generateId('stu'),
        studentNumber: `${grade}${String(classNum).padStart(2, '0')}${String(numberInClass).padStart(2, '0')}`,
        name: requestItem.studentName,
        grade,
        classNum,
        numberInClass,
        phone: requestItem.contact || '',
        guardianPhone: '',
        focusArea: requestItem.category,
        supportLevel: '일반',
        personalMemo: requestItem.message
          ? `학생 신청 메모: ${requestItem.message}`
          : '간편 상담 신청을 통해 등록된 학생입니다.',
        createdAt: new Date().toISOString(),
      };
      db.students.unshift(createdStudent);
      targetStudent = createdStudent;
    }

    const newRecord: CounselingRecord = {
      id: generateId('rec'),
      studentId: targetStudent.id,
      date: requestItem.preferredDate,
      time: requestItem.preferredTime,
      category: requestItem.category,
      method: requestItem.method,
      summary: body.summary.trim(),
      details: body.details.trim(),
      actionPlan: (body.actionPlan || '').trim(),
      moodState: body.moodState || '보통',
      followUpDate: body.followUpDate?.trim() || undefined,
      counselorName: (body.counselorName || '한지민 상담교사').trim(),
      createdAt: new Date().toISOString(),
    };

    db.records.unshift(newRecord);
    db.requests[reqIdx] = {
      ...requestItem,
      studentId: targetStudent.id,
      status: '완료',
      linkedRecordId: newRecord.id,
    };

    saveDatabase(db);
    res.status(201).json({
      record: newRecord,
      request: db.requests[reqIdx],
      createdStudent,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
