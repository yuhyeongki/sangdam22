/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { TopNav, ActiveTab } from './components/TopNav';
import { OverviewDashboard } from './components/OverviewDashboard';
import { StudentRecordsWorkspace } from './components/StudentRecordsWorkspace';
import { ScheduleBoard } from './components/ScheduleBoard';
import { QuickBookingPortal } from './components/QuickBookingPortal';
import { RecordModal, StudentModal } from './components/Modals';
import {
  CounselingBootstrapData,
  CounselingCategory,
  CounselingMethod,
  CounselingRecord,
  CounselingRequest,
  MoodState,
  RequestStatus,
  Student,
  StudentRequestMethod,
  SupportLevel,
} from './types/counseling';

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
  }
  return data as T;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<CounselingRecord[]>([]);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CounselingRecord | null>(null);
  const [defaultRecordStudentId, setDefaultRecordStudentId] = useState<string | undefined>(
    undefined,
  );
  const [convertingRequest, setConvertingRequest] = useState<CounselingRequest | null>(
    null,
  );

  const [bookingSlotPreset, setBookingSlotPreset] = useState<{
    date?: string;
    time?: string;
  }>({});

  const fetchBootstrap = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await apiRequest<CounselingBootstrapData>('/api/bootstrap');
      setStudents(data.students);
      setRecords(data.records);
      setRequests(data.requests);
      setSelectedStudentId((prev) => prev || data.students[0]?.id || null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : '데이터를 불러오는 데 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  const handleSaveStudent = async (payload: {
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
  }) => {
    if (payload.id) {
      const updated = await apiRequest<Student>(`/api/students/${payload.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setSelectedStudentId(updated.id);
    } else {
      const created = await apiRequest<Student>('/api/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStudents((prev) => [created, ...prev]);
      setSelectedStudentId(created.id);
    }
  };

  const handleUpdateStudentQuick = async (
    studentId: string,
    patch: Partial<Pick<Student, 'personalMemo' | 'supportLevel'>>,
  ) => {
    const updated = await apiRequest<Student>(`/api/students/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteStudent = async (studentId: string) => {
    await apiRequest(`/api/students/${studentId}`, { method: 'DELETE' });
    setStudents((prev) => {
      const remaining = prev.filter((s) => s.id !== studentId);
      if (selectedStudentId === studentId) {
        setSelectedStudentId(remaining[0]?.id || null);
      }
      return remaining;
    });
    setRecords((prev) => prev.filter((r) => r.studentId !== studentId));
  };

  const handleSaveRecord = async (payload: {
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
  }) => {
    if (payload.id) {
      const updated = await apiRequest<CounselingRecord>(`/api/records/${payload.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      const created = await apiRequest<CounselingRecord>('/api/records', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setRecords((prev) => [created, ...prev]);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    await apiRequest(`/api/records/${recordId}`, { method: 'DELETE' });
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handleSubmitQuickRequest = async (payload: {
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
  }): Promise<CounselingRequest> => {
    const created = await apiRequest<CounselingRequest>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setRequests((prev) => [created, ...prev]);
    return created;
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: RequestStatus,
  ) => {
    const updated = await apiRequest<CounselingRequest>(`/api/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleConvertRequestToRecord = async (
    requestId: string,
    payload: {
      summary: string;
      details: string;
      actionPlan: string;
      moodState: MoodState;
      followUpDate: string;
      counselorName: string;
    },
  ) => {
    const res = await apiRequest<{
      record: CounselingRecord;
      request: CounselingRequest;
      createdStudent: Student | null;
    }>(`/api/requests/${requestId}/convert`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.createdStudent) {
      setStudents((prev) => [res.createdStudent!, ...prev]);
    }
    setRecords((prev) => [res.record, ...prev]);
    setRequests((prev) => prev.map((r) => (r.id === res.request.id ? res.request : r)));
    setSelectedStudentId(res.record.studentId);
  };

  return (
    <div className="min-h-screen bg-[#DCEBFF] text-slate-900 flex flex-col">
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenQuickBooking={() => {
          setBookingSlotPreset({});
          setActiveTab('booking');
        }}
      />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="space-y-6" aria-busy="true" aria-label="데이터 불러오는 중">
            <div className="h-44 rounded-2xl bg-blue-200/70 animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-white/80 border border-blue-200 animate-pulse"
                />
              ))}
            </div>
            <div className="h-72 rounded-2xl bg-white/80 border border-blue-200 animate-pulse" />
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-2xl border border-blue-200 p-10 text-center space-y-4">
            <p className="text-base font-semibold text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={fetchBootstrap}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
            >
              다시 불러오기
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewDashboard
                students={students}
                records={records}
                requests={requests}
                onOpenNewRecord={() => {
                  setConvertingRequest(null);
                  setEditingRecord(null);
                  setDefaultRecordStudentId(selectedStudentId || students[0]?.id);
                  setRecordModalOpen(true);
                }}
                onOpenQuickBooking={() => {
                  setBookingSlotPreset({});
                  setActiveTab('booking');
                }}
                onSelectStudentProfile={(studentId) => {
                  setSelectedStudentId(studentId);
                  setActiveTab('records');
                }}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onOpenConvertRequest={(req) => {
                  setEditingRecord(null);
                  setConvertingRequest(req);
                  setRecordModalOpen(true);
                }}
              />
            )}

            {activeTab === 'records' && (
              <StudentRecordsWorkspace
                students={students}
                records={records}
                selectedStudentId={selectedStudentId}
                onSelectStudent={(id) => setSelectedStudentId(id)}
                onOpenAddStudent={() => {
                  setEditingStudent(null);
                  setStudentModalOpen(true);
                }}
                onOpenEditStudent={(stu) => {
                  setEditingStudent(stu);
                  setStudentModalOpen(true);
                }}
                onDeleteStudent={handleDeleteStudent}
                onUpdateStudentQuick={handleUpdateStudentQuick}
                onOpenAddRecord={(stuId) => {
                  setConvertingRequest(null);
                  setEditingRecord(null);
                  setDefaultRecordStudentId(stuId);
                  setRecordModalOpen(true);
                }}
                onOpenEditRecord={(rec) => {
                  setConvertingRequest(null);
                  setEditingRecord(rec);
                  setRecordModalOpen(true);
                }}
                onDeleteRecord={handleDeleteRecord}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleBoard
                students={students}
                records={records}
                requests={requests}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onOpenConvertRequest={(req) => {
                  setEditingRecord(null);
                  setConvertingRequest(req);
                  setRecordModalOpen(true);
                }}
                onOpenQuickBookingForSlot={(date, time) => {
                  setBookingSlotPreset({ date, time });
                  setActiveTab('booking');
                }}
              />
            )}

            {activeTab === 'booking' && (
              <QuickBookingPortal
                students={students}
                requests={requests}
                preselectedDate={bookingSlotPreset.date}
                preselectedTime={bookingSlotPreset.time}
                onSubmitRequest={handleSubmitQuickRequest}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-blue-200/80 bg-[#CFE2FF]/80">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>푸른마음 상담실 · 학생 개별 상담 기록 및 간편 신청 시스템</span>
          <span>비밀 보장 원칙에 따라 모든 상담 내용은 안전하게 관리됩니다.</span>
        </div>
      </footer>

      <StudentModal
        isOpen={studentModalOpen}
        initialStudent={editingStudent}
        onClose={() => setStudentModalOpen(false)}
        onSave={handleSaveStudent}
      />

      <RecordModal
        isOpen={recordModalOpen}
        students={students}
        defaultStudentId={defaultRecordStudentId}
        initialRecord={editingRecord}
        convertingRequest={convertingRequest}
        onClose={() => {
          setRecordModalOpen(false);
          setConvertingRequest(null);
          setEditingRecord(null);
        }}
        onSaveRecord={handleSaveRecord}
        onConvertRequest={handleConvertRequestToRecord}
      />
    </div>
  );
}
