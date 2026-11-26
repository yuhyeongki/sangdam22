import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FilePlus2,
  Lock,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  CounselingRecord,
  CounselingRequest,
  RequestStatus,
  Student,
} from '../types/counseling';

interface OverviewDashboardProps {
  students: Student[];
  records: CounselingRecord[];
  requests: CounselingRequest[];
  onOpenNewRecord: () => void;
  onOpenQuickBooking: () => void;
  onSelectStudentProfile: (studentId: string) => void;
  onUpdateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  onOpenConvertRequest: (request: CounselingRequest) => void;
}

function getStatusDisplay(status: RequestStatus): {
  label: string;
  className: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  switch (status) {
    case '대기중':
      return {
        label: '대기중',
        className: 'text-amber-700',
        Icon: Clock,
      };
    case '일정확정':
      return {
        label: '일정 확정',
        className: 'text-blue-700',
        Icon: CalendarCheck,
      };
    case '완료':
      return {
        label: '상담 완료',
        className: 'text-emerald-700',
        Icon: CheckCircle2,
      };
    case '취소':
      return {
        label: '취소됨',
        className: 'text-slate-500',
        Icon: XCircle,
      };
  }
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  students,
  records,
  requests,
  onOpenNewRecord,
  onOpenQuickBooking,
  onSelectStudentProfile,
  onUpdateRequestStatus,
  onOpenConvertRequest,
}) => {
  const [statusFilter, setStatusFilter] = useState<'전체' | RequestStatus>('전체');

  const pendingCount = requests.filter((r) => r.status === '대기중').length;
  const confirmedCount = requests.filter((r) => r.status === '일정확정').length;
  const priorityStudentCount = students.filter(
    (s) => s.supportLevel === '관심' || s.supportLevel === '집중',
  ).length;

  const filteredRequests = requests.filter((req) =>
    statusFilter === '전체' ? true : req.status === statusFilter,
  );

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const todayFormatted = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Primary Royal Blue Hero Summary */}
      <section className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] text-white p-6 md:p-8 shadow-sm border border-blue-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-blue-100 tabular-nums">
              {todayFormatted}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight [text-wrap:balance]">
              학생 한 명 한 명의 마음을 세심하게 잇는 상담실
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              학생 개별 상담 기록과 관찰 메모를 체계적으로 누적하고, 학생들이 30초 만에 간편하게 신청한 상담 일정을 바로 관리하세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenNewRecord}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1E3A8A] bg-white hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>개별 상담 기록 작성</span>
            </button>
            <button
              type="button"
              onClick={onOpenQuickBooking}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-900/50 hover:bg-blue-900/70 border border-blue-300/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>학생 간편 신청 화면</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column Metric Strip */}
      <section aria-label="상담실 주요 현황" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-blue-200/90 p-5">
          <p className="text-xs font-medium text-slate-500">등록 학생</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {students.length}명
          </p>
          <p className="mt-1 text-xs text-slate-500">개별 프로필 및 메모 관리</p>
        </div>

        <div className="bg-white rounded-xl border border-blue-200/90 p-5">
          <p className="text-xs font-medium text-slate-500">누적 개별 기록</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {records.length}건
          </p>
          <p className="mt-1 text-xs text-slate-500">상담 이력 · 후속 조치 포함</p>
        </div>

        <div className="bg-white rounded-xl border border-blue-200/90 p-5">
          <p className="text-xs font-medium text-slate-500">대기 · 확정 신청</p>
          <p className="mt-2 text-2xl font-bold text-blue-700 tabular-nums">
            {pendingCount + confirmedCount}건
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            대기 {pendingCount}건 · 확정 {confirmedCount}건
          </p>
        </div>

        <div className="bg-white rounded-xl border border-blue-200/90 p-5">
          <p className="text-xs font-medium text-slate-500">관심 · 집중 지원</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {priorityStudentCount}명
          </p>
          <p className="mt-1 text-xs text-slate-500">정기 체크인 권장 학생</p>
        </div>
      </section>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Student Counseling Requests Queue */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-blue-200/90 flex flex-col">
          <div className="px-6 py-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                학생 간편 상담 신청 내역
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                학생이 신청한 상담 일정을 확정하거나 상담 완료 후 바로 개별 기록으로 전환할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-blue-50 rounded-lg border border-blue-100 self-start sm:self-auto">
              {(['전체', '대기중', '일정확정', '완료'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-blue-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-blue-100 flex-1">
            {filteredRequests.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  해당 상태의 상담 신청 내역이 없습니다.
                </p>
                <button
                  type="button"
                  onClick={onOpenQuickBooking}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  간편 상담 신청 열기
                </button>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const statusInfo = getStatusDisplay(req.status);
                const StatusIcon = statusInfo.Icon;

                return (
                  <div
                    key={req.id}
                    className="px-6 py-4 hover:bg-blue-50/40 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-bold text-slate-900">
                          {req.studentName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {req.gradeClass}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="text-xs font-medium text-blue-800">
                          {req.category}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="text-xs font-mono-tabular text-slate-600">
                          {req.preferredDate} {req.preferredTime}
                        </span>
                        {req.isConfidentialNote && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                              <Lock className="w-3 h-3" aria-hidden="true" />
                              비공개 희망
                            </span>
                          </>
                        )}
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusInfo.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-sm text-slate-700 leading-relaxed">
                        “{req.message}”
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-xs text-slate-500 font-mono-tabular">
                        {req.requestCode} · {req.method}
                        {req.contact ? ` · ${req.contact}` : ''}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {req.status === '대기중' && (
                          <button
                            type="button"
                            onClick={() => onUpdateRequestStatus(req.id, '일정확정')}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            일정 확정
                          </button>
                        )}
                        {(req.status === '대기중' || req.status === '일정확정') && (
                          <>
                            <button
                              type="button"
                              onClick={() => onOpenConvertRequest(req)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              상담 완료 및 기록 작성
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateRequestStatus(req.id, '취소')}
                              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              취소
                            </button>
                          </>
                        )}
                        {req.status === '완료' && req.studentId && (
                          <button
                            type="button"
                            onClick={() => onSelectStudentProfile(req.studentId!)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>학생 기록 보기</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Recent Individual Counseling Records */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-blue-200/90 flex flex-col">
          <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                최근 학생 개별 상담 기록
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                기록을 클릭하면 해당 학생의 전체 상담 이력으로 이동합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewRecord}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              + 기록 추가
            </button>
          </div>

          <div className="divide-y divide-blue-100 flex-1">
            {records.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <p className="text-sm text-slate-600">등록된 상담 기록이 아직 없습니다.</p>
                <button
                  type="button"
                  onClick={onOpenNewRecord}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg cursor-pointer"
                >
                  첫 상담 기록 작성
                </button>
              </div>
            ) : (
              records.slice(0, 6).map((rec) => {
                const student = studentMap.get(rec.studentId);
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => onSelectStudentProfile(rec.studentId)}
                    className="w-full text-left px-6 py-4 hover:bg-blue-50/50 transition-colors block cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-900 text-sm">
                          {student ? student.name : '미등록 학생'}
                        </span>
                        {student && (
                          <span>
                            {student.grade}학년 {student.classNum}반
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="text-blue-700 font-medium">
                          {rec.category}
                        </span>
                      </div>
                      <span className="font-mono-tabular shrink-0">{rec.date}</span>
                    </div>

                    <p className="mt-1.5 text-sm font-medium text-slate-900 line-clamp-1">
                      {rec.summary}
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="line-clamp-1">{rec.details}</span>
                      {rec.moodState === '스트레스' || rec.moodState === '위기지원' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium shrink-0">
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {rec.moodState}
                        </span>
                      ) : (
                        <span className="text-slate-500 shrink-0">{rec.moodState}</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
