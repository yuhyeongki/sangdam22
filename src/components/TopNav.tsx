import React from 'react';
import { CalendarPlus } from 'lucide-react';

export type ActiveTab = 'overview' | 'records' | 'schedule' | 'booking';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenQuickBooking: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'overview', label: '상담 현황' },
  { id: 'records', label: '학생별 기록' },
  { id: 'schedule', label: '상담 일정' },
  { id: 'booking', label: '학생 신청' },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickBooking,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#1E3A8A] text-white border-b border-blue-800/80 shadow-sm">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
        >
          푸른마음 상담실
        </button>

        <nav
          aria-label="주요 메뉴"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1E3A8A] bg-white hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <CalendarPlus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>간편 상담 신청</span>
          </button>
        </div>
      </div>

      <nav
        aria-label="모바일 메뉴"
        className="md:hidden flex items-center justify-between px-4 pb-2.5 gap-2 overflow-x-auto border-t border-blue-800/60"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'text-blue-200 hover:text-white hover:bg-blue-800/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
