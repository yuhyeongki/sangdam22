import React, { useState } from 'react';
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  CounselingRecord,
  CounselingRequest,
  RequestStatus,
  Student,
  TIME_SLOTS,
} from '../types/counseling';

interface ScheduleBoardProps {
  students: Student[];
  records: CounselingRecord[];
  requests: CounselingRequest[];
  onUpdateRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  onOpenConvertRequest: (request: CounselingRequest) => void;
  onOpenQuickBookingForSlot: (date: string, time: string) => void;
}

function formatDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const ScheduleBoard: React.FC<ScheduleBoardProps> = ({
  students,
  records,
  requests,
  onUpdateRequestStatus,
  onOpenConvertRequest,
  onOpenQuickBookingForSlot,
}) => {
  const today = formatDateOffset(0);
  const tomorrow = formatDateOffset(1);
  const dayAfter = formatDateOffset(2);

  const [selectedDate, setSelectedDate] = useState(today);

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const dayRequests = requests.filter(
    (r) => r.preferredDate === selectedDate && r.status !== '취소',
  );
  const dayRecords = records.filter((rec) => rec.date === selectedDate);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-blue-200/90 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            일간 상담실 시간표
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            시간대별 학생 상담 신청 현황과 완료된 상담을 한눈에 확인하고 일정을 확정하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { date: today, label: '오늘' },
            { date: tomorrow, label: '내일' },
            { date: dayAfter, label: '모레' },
          ].map((preset) => (
            <button
              key={preset.date}
              type="button"
              onClick={() => setSelectedDate(preset.date)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                selectedDate === preset.date
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="상담 일정 날짜 선택"
            className="px-3 py-1.5 text-sm font-mono-tabular border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-blue-200/90 divide-y divide-blue-100 overflow-hidden">
        {TIME_SLOTS.map((slot) => {
          const req = dayRequests.find((r) => r.preferredTime === slot.time);
          const rec = dayRecords.find((r) => r.time === slot.time);
          const recStudent = rec ? studentMap.get(rec.studentId) : null;

          return (
            <div
              key={slot.time}
              className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="w-28 shrink-0">
                  <div className="text-base font-bold font-mono-tabular text-blue-900">
                    {slot.time}
                  </div>
                  <div className="text-xs text-slate-500">{slot.label}</div>
                </div>

                {req ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-slate-900">
                        {req.studentName}
                      </span>
                      <span className="text-xs text-slate-500">{req.gradeClass}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-xs font-medium text-blue-800">
                        {req.category}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-xs text-slate-600">{req.method}</span>
                    </div>
                    {req.message && (
                      <p className="text-xs text-slate-600 line-clamp-1">
                        “{req.message}”
                      </p>
                    )}
                  </div>
                ) : rec ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-slate-900">
                        {recStudent ? recStudent.name : '등록 학생'}
                      </span>
                      <span className="text-xs font-medium text-blue-800">
                        {rec.category}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="text-xs text-slate-600">{rec.method}</span>
                    </div>
                    <p className="text-xs text-slate-600">{rec.summary}</p>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    비어 있는 시간대 · 학생 상담 신청 가능
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {req ? (
                  <>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold mr-2 ${
                        req.status === '대기중'
                          ? 'text-amber-700'
                          : req.status === '일정확정'
                            ? 'text-blue-700'
                            : 'text-emerald-700'
                      }`}
                    >
                      {req.status === '대기중' && <Clock className="w-3.5 h-3.5" />}
                      {req.status === '일정확정' && (
                        <CalendarCheck className="w-3.5 h-3.5" />
                      )}
                      {req.status === '완료' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {req.status === '일정확정' ? '일정 확정' : req.status}
                    </span>

                    {req.status === '대기중' && (
                      <button
                        type="button"
                        onClick={() => onUpdateRequestStatus(req.id, '일정확정')}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      >
                        일정 확정
                      </button>
                    )}

                    {(req.status === '대기중' || req.status === '일정확정') && (
                      <button
                        type="button"
                        onClick={() => onOpenConvertRequest(req)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                      >
                        상담 완료 및 기록
                      </button>
                    )}
                  </>
                ) : rec ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    상담 기록 완료
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenQuickBookingForSlot(selectedDate, slot.time)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>이 시간으로 신청하기</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
