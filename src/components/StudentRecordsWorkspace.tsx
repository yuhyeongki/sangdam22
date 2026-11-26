import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  Edit3,
  FilePlus2,
  HeartHandshake,
  Phone,
  Search,
  ShieldAlert,
  Smile,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  COUNSELING_CATEGORIES,
  CounselingCategory,
  CounselingRecord,
  MoodState,
  Student,
  SupportLevel,
} from '../types/counseling';

interface StudentRecordsWorkspaceProps {
  students: Student[];
  records: CounselingRecord[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
  onOpenAddStudent: () => void;
  onOpenEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onUpdateStudentQuick: (
    studentId: string,
    patch: Partial<Pick<Student, 'personalMemo' | 'supportLevel'>>,
  ) => Promise<void>;
  onOpenAddRecord: (studentId: string) => void;
  onOpenEditRecord: (record: CounselingRecord) => void;
  onDeleteRecord: (recordId: string) => Promise<void>;
}

function getSupportMeta(level: SupportLevel): {
  label: string;
  textColor: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  switch (level) {
    case '집중':
      return {
        label: '집중 지원',
        textColor: 'text-red-700',
        Icon: ShieldAlert,
      };
    case '관심':
      return {
        label: '관심 관찰',
        textColor: 'text-amber-700',
        Icon: AlertTriangle,
      };
    default:
      return {
        label: '일반 관리',
        textColor: 'text-blue-700',
        Icon: HeartHandshake,
      };
  }
}

function getMoodMeta(mood: MoodState): {
  label: string;
  className: string;
} {
  switch (mood) {
    case '안정':
      return { label: '안정', className: 'text-emerald-700' };
    case '보통':
      return { label: '보통', className: 'text-blue-700' };
    case '스트레스':
      return { label: '스트레스', className: 'text-amber-700' };
    case '위기지원':
      return { label: '위기지원', className: 'text-red-700' };
  }
}

export const StudentRecordsWorkspace: React.FC<StudentRecordsWorkspaceProps> = ({
  students,
  records,
  selectedStudentId,
  onSelectStudent,
  onOpenAddStudent,
  onOpenEditStudent,
  onDeleteStudent,
  onUpdateStudentQuick,
  onOpenAddRecord,
  onOpenEditRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '1' | '2' | '3' | 'priority'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'전체' | CounselingCategory>('전체');
  const [memoDraft, setMemoDraft] = useState('');
  const [memoSavedNotice, setMemoSavedNotice] = useState(false);
  const [savingMemo, setSavingMemo] = useState(false);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q) ||
      s.focusArea.toLowerCase().includes(q) ||
      `${s.grade}학년 ${s.classNum}반`.includes(q);

    const matchesGrade =
      gradeFilter === 'all'
        ? true
        : gradeFilter === 'priority'
          ? s.supportLevel === '관심' || s.supportLevel === '집중'
          : s.grade === Number(gradeFilter);

    return matchesSearch && matchesGrade;
  });

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) ||
    filteredStudents[0] ||
    students[0] ||
    null;

  useEffect(() => {
    if (activeStudent) {
      setMemoDraft(activeStudent.personalMemo || '');
      setMemoSavedNotice(false);
    }
  }, [activeStudent?.id, activeStudent?.personalMemo]);

  const studentRecords = activeStudent
    ? records
        .filter((r) => r.studentId === activeStudent.id)
        .filter((r) => (categoryFilter === '전체' ? true : r.category === categoryFilter))
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    : [];

  const recordCountMap = new Map<string, number>();
  records.forEach((r) => {
    recordCountMap.set(r.studentId, (recordCountMap.get(r.studentId) || 0) + 1);
  });

  const handleSaveMemo = async () => {
    if (!activeStudent) return;
    setSavingMemo(true);
    try {
      await onUpdateStudentQuick(activeStudent.id, { personalMemo: memoDraft });
      setMemoSavedNotice(true);
      setTimeout(() => setMemoSavedNotice(false), 2500);
    } finally {
      setSavingMemo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Student List & Filter Sidebar */}
      <aside className="lg:col-span-4 xl:col-span-4 bg-white rounded-2xl border border-blue-200/90 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-blue-100 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-bold text-slate-900">
              학생 개별 목록 ({filteredStudents.length})
            </h1>
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>학생 등록</span>
            </button>
          </div>

          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 학번, 반, 관심분야 검색"
              className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-blue-50 rounded-lg border border-blue-100 overflow-x-auto">
            {(
              [
                { id: 'all', label: '전체' },
                { id: '1', label: '1학년' },
                { id: '2', label: '2학년' },
                { id: '3', label: '3학년' },
                { id: 'priority', label: '관심·집중' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGradeFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  gradeFilter === tab.id
                    ? 'bg-white text-blue-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-blue-100 max-h-[640px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">조건에 맞는 학생이 없습니다.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setGradeFilter('all');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg cursor-pointer"
              >
                검색 초기화
              </button>
            </div>
          ) : (
            filteredStudents.map((stu) => {
              const isSelected = activeStudent?.id === stu.id;
              const supportMeta = getSupportMeta(stu.supportLevel);
              const SupportIcon = supportMeta.Icon;
              const count = recordCountMap.get(stu.id) || 0;

              return (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => onSelectStudent(stu.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EFF6FF]'
                      : 'hover:bg-blue-50/40 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-sm font-bold truncate ${
                          isSelected ? 'text-blue-900' : 'text-slate-900'
                        }`}
                      >
                        {stu.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono-tabular shrink-0">
                        {stu.grade}학년 {stu.classNum}반 · {stu.studentNumber}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                      기록 {count}건
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 truncate">{stu.focusArea}</span>
                    <span
                      className={`inline-flex items-center gap-1 font-medium shrink-0 ${supportMeta.textColor}`}
                    >
                      <SupportIcon className="w-3 h-3" aria-hidden="true" />
                      {supportMeta.label}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right: Individual Student Profile, Editable Memo & Counseling Records */}
      <section className="lg:col-span-8 xl:col-span-8 space-y-6">
        {!activeStudent ? (
          <div className="bg-white rounded-2xl border border-blue-200 p-12 text-center space-y-3">
            <p className="text-base font-semibold text-slate-800">
              등록된 학생이 없습니다.
            </p>
            <p className="text-sm text-slate-500">
              먼저 학생을 등록하면 학생별 개별 관찰 메모와 상담 기록을 관리할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              첫 학생 등록하기
            </button>
          </div>
        ) : (
          <>
            {/* Student Individual Profile & Editable Personal Observation Memo */}
            <div className="bg-white rounded-2xl border border-blue-200/90 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900">
                      {activeStudent.name}
                    </h2>
                    <span className="text-sm text-slate-500 font-mono-tabular">
                      {activeStudent.grade}학년 {activeStudent.classNum}반{' '}
                      {activeStudent.numberInClass}번 · 학번 {activeStudent.studentNumber}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-mono-tabular">
                      <Phone className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                      학생: {activeStudent.phone || '미등록'}
                    </span>
                    <span className="font-mono-tabular">
                      보호자: {activeStudent.guardianPhone || '미등록'}
                    </span>
                    <span>관심영역: {activeStudent.focusArea}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenEditStudent(activeStudent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>정보 수정</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteStudent(activeStudent.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>학생 삭제</span>
                  </button>
                </div>
              </div>

              {/* Support Level Selector */}
              <div className="pt-4 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-700">
                    학생 지원 단계 설정
                  </span>
                  <p className="text-xs text-slate-500">
                    학생 상태에 따라 일반 / 관심 / 집중 단계를 즉시 변경할 수 있습니다.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 p-1 bg-blue-50 rounded-lg border border-blue-100 self-start sm:self-auto">
                  {(['일반', '관심', '집중'] as SupportLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        onUpdateStudentQuick(activeStudent.id, { supportLevel: lvl })
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        activeStudent.supportLevel === lvl
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-700 hover:bg-blue-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Ongoing Observation Memo */}
              <div className="pt-4 border-t border-blue-100 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="student-personal-memo"
                    className="text-xs font-semibold text-slate-800"
                  >
                    {activeStudent.name} 학생 개별 상시 관찰 메모
                  </label>
                  <div className="flex items-center gap-2">
                    {memoSavedNotice && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        저장되었습니다
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={savingMemo || memoDraft === activeStudent.personalMemo}
                      onClick={handleSaveMemo}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500 rounded-lg transition-colors cursor-pointer"
                    >
                      {savingMemo ? '저장 중...' : '개별 메모 저장'}
                    </button>
                  </div>
                </div>
                <textarea
                  id="student-personal-memo"
                  rows={3}
                  value={memoDraft}
                  onChange={(e) => setMemoDraft(e.target.value)}
                  placeholder="이 학생만의 성향, 강점, 교우 관계, 가정 배경, 다음 만남 시 유의할 점 등을 자유롭게 기록하세요."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-blue-50/40 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Individual Counseling Records Timeline */}
            <div className="bg-white rounded-2xl border border-blue-200/90 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    개별 상담 누적 기록 ({studentRecords.length}건)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    회기별 상담 내용, 정서 상태 및 후속 조치 계획을 기록합니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAddRecord(activeStudent.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                  <span>이 학생 상담 기록 추가</span>
                </button>
              </div>

              <div className="px-6 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center gap-1.5 overflow-x-auto">
                {(['전체', ...COUNSELING_CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-blue-700 text-white font-semibold'
                        : 'text-slate-600 hover:bg-blue-100 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-blue-100">
                {studentRecords.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      선택한 조건의 상담 기록이 없습니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenAddRecord(activeStudent.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                    >
                      + 새 상담 기록 남기기
                    </button>
                  </div>
                ) : (
                  studentRecords.map((rec) => {
                    const moodMeta = getMoodMeta(rec.moodState);
                    return (
                      <article key={rec.id} className="p-6 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="font-mono-tabular font-semibold text-slate-900">
                              {rec.date} {rec.time}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-blue-800">
                              {rec.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{rec.method}</span>
                            <span aria-hidden="true">·</span>
                            <span className={`inline-flex items-center gap-1 font-semibold ${moodMeta.className}`}>
                              <Smile className="w-3.5 h-3.5" aria-hidden="true" />
                              상태: {moodMeta.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenEditRecord(rec)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRecord(rec.id)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-slate-900">
                          {rec.summary}
                        </h4>

                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {rec.details}
                        </p>

                        {(rec.actionPlan || rec.followUpDate) && (
                          <div className="pt-3 border-t border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                            <div>
                              {rec.actionPlan && (
                                <p>
                                  <span className="font-semibold text-blue-900">
                                    후속 조치:{' '}
                                  </span>
                                  {rec.actionPlan}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-slate-500">
                              {rec.followUpDate && (
                                <span className="inline-flex items-center gap-1 font-mono-tabular text-blue-800 font-medium">
                                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                  다음 상담: {rec.followUpDate}
                                </span>
                              )}
                              <span>담당: {rec.counselorName}</span>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
