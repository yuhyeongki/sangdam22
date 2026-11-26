import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  Send,
} from 'lucide-react';
import {
  COUNSELING_CATEGORIES,
  CounselingCategory,
  CounselingRequest,
  Student,
  StudentRequestMethod,
  TIME_SLOTS,
} from '../types/counseling';

interface QuickBookingPortalProps {
  students: Student[];
  requests: CounselingRequest[];
  preselectedDate?: string;
  preselectedTime?: string;
  onSubmitRequest: (payload: {
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
  }) => Promise<CounselingRequest>;
}

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const QuickBookingPortal: React.FC<QuickBookingPortalProps> = ({
  students,
  requests,
  preselectedDate,
  preselectedTime,
  onSubmitRequest,
}) => {
  const today = getDateOffset(0);
  const tomorrow = getDateOffset(1);
  const dayAfter = getDateOffset(2);

  const [identityMode, setIdentityMode] = useState<'select' | 'manual'>('select');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [studentName, setStudentName] = useState('');
  const [gradeClass, setGradeClass] = useState('2학년 1반');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState<CounselingCategory>('진로·진학');
  const [preferredDate, setPreferredDate] = useState(preselectedDate || today);
  const [preferredTime, setPreferredTime] = useState(preselectedTime || '12:30');
  const [method, setMethod] = useState<StudentRequestMethod>('대면 상담');
  const [message, setMessage] = useState('');
  const [isConfidentialNote, setIsConfidentialNote] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedTicket, setCompletedTicket] = useState<CounselingRequest | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');

  useEffect(() => {
    if (preselectedDate) setPreferredDate(preselectedDate);
    if (preselectedTime) setPreferredTime(preselectedTime);
  }, [preselectedDate, preselectedTime]);

  useEffect(() => {
    if (identityMode === 'select') {
      const found = students.find((s) => s.id === selectedStudentId);
      if (found) {
        setStudentName(found.name);
        setGradeClass(`${found.grade}학년 ${found.classNum}반`);
        setContact(found.phone);
      }
    }
  }, [identityMode, selectedStudentId, students]);

  const takenTimesOnDate = new Set(
    requests
      .filter(
        (r) => r.preferredDate === preferredDate && r.status !== '취소',
      )
      .map((r) => r.preferredTime),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !gradeClass.trim()) {
      setError('이름과 학년/반을 입력해 주세요.');
      return;
    }
    if (takenTimesOnDate.has(preferredTime)) {
      setError('선택하신 시간은 이미 다른 학생의 신청이 있습니다. 비어 있는 시간을 선택해 주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const created = await onSubmitRequest({
        studentId: identityMode === 'select' ? selectedStudentId || undefined : undefined,
        studentName: studentName.trim(),
        gradeClass: gradeClass.trim(),
        contact: contact.trim(),
        category,
        preferredDate,
        preferredTime,
        method,
        message: message.trim(),
        isConfidentialNote,
      });
      setCompletedTicket(created);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStatusList = requests.filter((r) => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.requestCode.toLowerCase().includes(q) ||
      r.gradeClass.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Welcoming Calm Blue Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white p-6 md:p-8 border border-blue-700/60">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight [text-wrap:balance]">
            간편 학생 상담 신청
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            진로, 학업, 친구 관계, 마음 고민까지 편하게 신청하세요. 원하는 날짜와 시간만 고르면 바로 접수됩니다.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Easy Booking Form or Confirmation Ticket */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-blue-200/90 p-6 sm:p-8">
          {completedTicket ? (
            <div className="py-6 space-y-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold font-mono-tabular text-blue-700">
                  신청번호 {completedTicket.requestCode}
                </p>
                <h2 className="text-xl font-bold text-slate-900">
                  {completedTicket.studentName} 학생의 상담 신청이 접수되었습니다
                </h2>
                <p className="text-sm text-slate-600">
                  상담교사 확인 후 일정이 확정되며, 오른쪽 신청 현황에서도 바로 확인할 수 있습니다.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">신청자</span>
                  <span className="font-semibold text-slate-900">
                    {completedTicket.studentName} ({completedTicket.gradeClass})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">희망 일시</span>
                  <span className="font-mono-tabular font-semibold text-blue-900">
                    {completedTicket.preferredDate} {completedTicket.preferredTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">상담 주제 · 방식</span>
                  <span className="font-medium text-slate-800">
                    {completedTicket.category} · {completedTicket.method}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCompletedTicket(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  다른 시간 추가 신청하기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Step 1: Student Identification */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    01. 신청 학생 정보
                  </h2>
                  <div className="flex items-center gap-1 p-1 bg-blue-50 rounded-lg border border-blue-100">
                    <button
                      type="button"
                      onClick={() => setIdentityMode('select')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        identityMode === 'select'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      이름 선택하기
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIdentityMode('manual');
                        setStudentName('');
                        setGradeClass('');
                        setContact('');
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        identityMode === 'manual'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      직접 입력하기
                    </button>
                  </div>
                </div>

                {identityMode === 'select' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        학생 선택
                      </label>
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {students.map((stu) => (
                          <option key={stu.id} value={stu.id}>
                            {stu.name} ({stu.grade}학년 {stu.classNum}반)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        회신 받을 연락처 (선택)
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="010-0000-0000"
                        className="w-full px-3.5 py-2.5 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        이름 *
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="예: 홍길동"
                        className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        학년 · 반 *
                      </label>
                      <input
                        type="text"
                        value={gradeClass}
                        onChange={(e) => setGradeClass(e.target.value)}
                        placeholder="예: 2학년 4반"
                        className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        연락처 (선택)
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="010-0000-0000"
                        className="w-full px-3.5 py-2.5 text-sm font-mono-tabular border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Topic */}
              <div className="space-y-2.5 pt-4 border-t border-blue-100">
                <h2 className="text-sm font-bold text-slate-900">
                  02. 어떤 이야기를 나누고 싶나요?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COUNSELING_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                        category === cat
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-blue-50/60 text-slate-800 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Preferred Date & Time Slot */}
              <div className="space-y-3 pt-4 border-t border-blue-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    03. 희망 날짜 및 시간 선택
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {[
                      { date: today, label: '오늘' },
                      { date: tomorrow, label: '내일' },
                      { date: dayAfter, label: '모레' },
                    ].map((d) => (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setPreferredDate(d.date)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                          preferredDate === d.date
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                    <input
                      type="date"
                      value={preferredDate}
                      min={today}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      aria-label="상담 희망 날짜"
                      className="px-2.5 py-1 text-xs font-mono-tabular border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isTaken = takenTimesOnDate.has(slot.time);
                    const isSelected = preferredTime === slot.time && !isTaken;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setPreferredTime(slot.time)}
                        className={`p-2.5 rounded-lg border text-left transition-colors ${
                          isTaken
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : isSelected
                              ? 'bg-blue-700 text-white border-blue-700 cursor-pointer'
                              : 'bg-white text-slate-800 border-blue-200 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <div className="text-sm font-bold font-mono-tabular">
                          {slot.time}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${
                            isSelected
                              ? 'text-blue-100'
                              : isTaken
                                ? 'text-slate-400'
                                : 'text-slate-500'
                          }`}
                        >
                          {isTaken ? '예약 마감' : slot.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Method & Short Note */}
              <div className="space-y-3 pt-4 border-t border-blue-100">
                <h2 className="text-sm font-bold text-slate-900">
                  04. 상담 방식 및 남기고 싶은 말 (선택)
                </h2>

                <div className="grid grid-cols-3 gap-2">
                  {(['대면 상담', '전화·화상', '메신저·쪽지'] as StudentRequestMethod[]).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                          method === m
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {m}
                      </button>
                    ),
                  )}
                </div>

                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="미리 전하고 싶은 이야기가 있다면 한두 줄로 편하게 적어주세요. (적지 않아도 신청할 수 있어요)"
                  className="w-full px-3.5 py-2.5 text-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isConfidentialNote}
                    onChange={(e) => setIsConfidentialNote(e.target.checked)}
                    className="w-4 h-4 rounded border-blue-300 text-blue-700 focus:ring-blue-500"
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                    주변 친구나 담임 선생님께 알리지 않고 조용히 상담받고 싶어요
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-6 inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{submitting ? '신청 접수 중...' : '간편 상담 신청 완료하기'}</span>
              </button>
            </form>
          )}
        </section>

        {/* Right: Real-time Booking Status Lookup */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-blue-200/90 overflow-hidden">
          <div className="p-5 border-b border-blue-100 space-y-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                내 신청 현황 바로 확인
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                이름이나 신청번호(예: REQ-2042)로 접수 상태를 확인하세요.
              </p>
            </div>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder="이름 또는 신청번호 검색"
                className="w-full pl-9 pr-3 py-2 text-sm bg-blue-50/50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="divide-y divide-blue-100 max-h-[540px] overflow-y-auto">
            {filteredStatusList.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                검색 결과와 일치하는 신청 내역이 없습니다.
              </div>
            ) : (
              filteredStatusList.slice(0, 8).map((req) => (
                <div key={req.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-slate-900">
                        {req.studentName}
                      </span>
                      <span className="text-xs text-slate-500">{req.gradeClass}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        req.status === '대기중'
                          ? 'text-amber-700'
                          : req.status === '일정확정'
                            ? 'text-blue-700'
                            : req.status === '완료'
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                      }`}
                    >
                      {req.status === '대기중' && <Clock className="w-3.5 h-3.5" />}
                      {req.status === '일정확정' && (
                        <CalendarCheck className="w-3.5 h-3.5" />
                      )}
                      {req.status === '완료' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {req.status === '일정확정' ? '일정 확정' : req.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-mono-tabular">
                    {req.requestCode} · {req.preferredDate} {req.preferredTime} ·{' '}
                    {req.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
