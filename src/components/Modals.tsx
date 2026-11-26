import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  COUNSELING_CATEGORIES,
  CounselingCategory,
  CounselingMethod,
  CounselingRecord,
  CounselingRequest,
  MoodState,
  Student,
  SupportLevel,
  TIME_SLOTS,
} from '../types/counseling';

interface StudentModalProps {
  isOpen: boolean;
  initialStudent?: Student | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    grade: number;
    classNum: number;
    numberInClass: number;
    studentNumber: string;
    phone: string;
    guardianPhone: string;
    focusArea: string;
    supportLevel: SupportLevel;
    personalMemo: string;
  }) => Promise<void>;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  initialStudent,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(2);
  const [classNum, setClassNum] = useState(1);
  const [numberInClass, setNumberInClass] = useState(1);
  const [studentNumber, setStudentNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [supportLevel, setSupportLevel] = useState<SupportLevel>('일반');
  const [personalMemo, setPersonalMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialStudent) {
      setName(initialStudent.name);
      setGrade(initialStudent.grade);
      setClassNum(initialStudent.classNum);
      setNumberInClass(initialStudent.numberInClass);
      setStudentNumber(initialStudent.studentNumber);
      setPhone(initialStudent.phone);
      setGuardianPhone(initialStudent.guardianPhone);
      setFocusArea(initialStudent.focusArea);
      setSupportLevel(initialStudent.supportLevel);
      setPersonalMemo(initialStudent.personalMemo);
    } else {
      setName('');
      setGrade(2);
      setClassNum(1);
      setNumberInClass(1);
      setStudentNumber('');
      setPhone('');
      setGuardianPhone('');
      setFocusArea('');
      setSupportLevel('일반');
      setPersonalMemo('');
    }
    setError('');
  }, [isOpen, initialStudent]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('학생 이름을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSave({
        id: initialStudent?.id,
        name: name.trim(),
        grade,
        classNum,
        numberInClass,
        studentNumber: studentNumber.trim(),
        phone: phone.trim(),
        guardianPhone: guardianPhone.trim(),
        focusArea: focusArea.trim() || '일반 상담',
        supportLevel,
        personalMemo: personalMemo.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl border border-blue-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 bg-[#1E3A8A] text-white flex items-center justify-between">
          <h2 id="student-modal-title" className="text-base font-bold">
            {initialStudent ? '학생 정보 수정' : '새 학생 등록'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학생 이름 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김하늘"
                className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학번 (비워두면 자동 생성)
              </label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="예: 20314"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학년
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                반
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm tabular-nums border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                번호
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={numberInClass}
                onChange={(e) => setNumberInClass(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm tabular-nums border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학생 연락처
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                보호자 연락처
              </label>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3.5 py-2 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                주요 상담/관심 분야
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="예: 진로 탐색 · 학습 동기"
                className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                지원 단계
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-blue-50 rounded-lg border border-blue-200">
                {(['일반', '관심', '집중'] as SupportLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSupportLevel(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      supportLevel === lvl
                        ? 'bg-blue-700 text-white'
                        : 'text-slate-700 hover:bg-blue-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              학생 개별 관찰 메모
            </label>
            <textarea
              rows={3}
              value={personalMemo}
              onChange={(e) => setPersonalMemo(e.target.value)}
              placeholder="학생의 성향, 강점, 유의사항 등 개별적으로 누적 기록할 내용을 입력하세요."
              className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-blue-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {submitting ? '저장 중...' : initialStudent ? '수정 저장' : '학생 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RecordModalProps {
  isOpen: boolean;
  students: Student[];
  defaultStudentId?: string;
  initialRecord?: CounselingRecord | null;
  convertingRequest?: CounselingRequest | null;
  onClose: () => void;
  onSaveRecord: (payload: {
    id?: string;
    studentId: string;
    date: string;
    time: string;
    category: CounselingCategory;
    method: CounselingMethod;
    summary: string;
    details: string;
    actionPlan: string;
    moodState: MoodState;
    followUpDate: string;
    counselorName: string;
  }) => Promise<void>;
  onConvertRequest?: (
    requestId: string,
    payload: {
      summary: string;
      details: string;
      actionPlan: string;
      moodState: MoodState;
      followUpDate: string;
      counselorName: string;
    },
  ) => Promise<void>;
}

function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  students,
  defaultStudentId,
  initialRecord,
  convertingRequest,
  onClose,
  onSaveRecord,
  onConvertRequest,
}) => {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('14:20');
  const [category, setCategory] = useState<CounselingCategory>('진로·진학');
  const [method, setMethod] = useState<CounselingMethod>('대면 상담');
  const [moodState, setMoodState] = useState<MoodState>('보통');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [counselorName, setCounselorName] = useState('한지민 상담교사');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (convertingRequest) {
      setStudentId(convertingRequest.studentId || '');
      setDate(convertingRequest.preferredDate);
      setTime(convertingRequest.preferredTime);
      setCategory(convertingRequest.category);
      setMethod(convertingRequest.method);
      setMoodState('보통');
      setSummary(
        convertingRequest.message
          ? `${convertingRequest.category} 관련 상담 (${convertingRequest.studentName})`
          : `${convertingRequest.studentName} 학생 요청 상담 진행`,
      );
      setDetails(
        convertingRequest.message
          ? `[학생 신청 메시지] ${convertingRequest.message}\n\n[상담 내용]\n`
          : '',
      );
      setActionPlan('');
      setFollowUpDate('');
      setCounselorName('한지민 상담교사');
    } else if (initialRecord) {
      setStudentId(initialRecord.studentId);
      setDate(initialRecord.date);
      setTime(initialRecord.time);
      setCategory(initialRecord.category);
      setMethod(initialRecord.method);
      setMoodState(initialRecord.moodState);
      setSummary(initialRecord.summary);
      setDetails(initialRecord.details);
      setActionPlan(initialRecord.actionPlan);
      setFollowUpDate(initialRecord.followUpDate || '');
      setCounselorName(initialRecord.counselorName);
    } else {
      setStudentId(defaultStudentId || students[0]?.id || '');
      setDate(getTodayDateString());
      setTime('14:20');
      setCategory('진로·진학');
      setMethod('대면 상담');
      setMoodState('보통');
      setSummary('');
      setDetails('');
      setActionPlan('');
      setFollowUpDate('');
      setCounselorName('한지민 상담교사');
    }
    setError('');
  }, [isOpen, initialRecord, convertingRequest, defaultStudentId, students]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingRequest && !studentId) {
      setError('상담 대상 학생을 선택해 주세요.');
      return;
    }
    if (!summary.trim() || !details.trim()) {
      setError('상담 요약과 상세 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (convertingRequest && onConvertRequest) {
        await onConvertRequest(convertingRequest.id, {
          summary: summary.trim(),
          details: details.trim(),
          actionPlan: actionPlan.trim(),
          moodState,
          followUpDate,
          counselorName: counselorName.trim() || '한지민 상담교사',
        });
      } else {
        await onSaveRecord({
          id: initialRecord?.id,
          studentId,
          date,
          time,
          category,
          method,
          summary: summary.trim(),
          details: details.trim(),
          actionPlan: actionPlan.trim(),
          moodState,
          followUpDate,
          counselorName: counselorName.trim() || '한지민 상담교사',
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '기록 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-modal-title"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-blue-200 shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 bg-[#1E3A8A] text-white flex items-center justify-between">
          <h2 id="record-modal-title" className="text-base font-bold">
            {convertingRequest
              ? `상담 완료 및 개별 기록 저장 · ${convertingRequest.studentName} (${convertingRequest.gradeClass})`
              : initialRecord
                ? '개별 상담 기록 수정'
                : '새 학생 개별 상담 기록 작성'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {!convertingRequest ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  대상 학생 *
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">학생 선택</option>
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.grade}학년 {stu.classNum}반)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  상담 일자
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  상담 시간
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-tabular border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.time} ({slot.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-900">신청 정보</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">{convertingRequest.requestCode}</span>
              <span aria-hidden="true">·</span>
              <span>
                {convertingRequest.preferredDate} {convertingRequest.preferredTime}
              </span>
              <span aria-hidden="true">·</span>
              <span>{convertingRequest.category}</span>
              <span aria-hidden="true">·</span>
              <span>{convertingRequest.method}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                상담 영역
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CounselingCategory)}
                disabled={Boolean(convertingRequest)}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COUNSELING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                상담 방식
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as CounselingMethod)}
                disabled={Boolean(convertingRequest)}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="대면 상담">대면 상담</option>
                <option value="전화·화상">전화·화상</option>
                <option value="학부모 연계">학부모 연계</option>
                <option value="메신저·쪽지">메신저·쪽지</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                학생 정서·상태
              </label>
              <select
                value={moodState}
                onChange={(e) => setMoodState(e.target.value as MoodState)}
                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="안정">안정</option>
                <option value="보통">보통</option>
                <option value="스트레스">스트레스</option>
                <option value="위기지원">위기지원</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              핵심 요약 (제목) *
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예: 2학기 선택과목 조정 및 진로 보고서 방향 설정"
              className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              상세 상담 내용 *
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="학생이 호소한 고민, 상담 중 나눈 주요 대화 및 관찰 내용을 기록하세요."
              className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              후속 조치 및 지도 계획
            </label>
            <textarea
              rows={2}
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="다음 상담 전 학생에게 안내한 과제, 담임/보호자 연계 사항 등"
              className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                후속 상담 예정일 (선택)
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                상담교사
              </label>
              <input
                type="text"
                value={counselorName}
                onChange={(e) => setCounselorName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-blue-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              {submitting ? '저장 중...' : '개별 기록 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
