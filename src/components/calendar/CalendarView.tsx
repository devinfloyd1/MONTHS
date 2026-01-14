'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay, subMonths, addMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '@/lib/types';

interface Entry {
  id: string;
  entry_date: string;
  question_1_answer: string | null;
  question_2_answer: string | null;
  question_3_answer: string | null;
  question_1: Pick<Question, 'id' | 'text'> | null;
  question_2: Pick<Question, 'id' | 'text'> | null;
  question_3: Pick<Question, 'id' | 'text'> | null;
}

interface CalendarViewProps {
  entries: Entry[];
}

export default function CalendarView({ entries }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach((entry) => {
      map.set(entry.entry_date, entry);
    });
    return map;
  }, [entries]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDay = monthStart.getDay();

  // Create array with empty slots for days before month starts
  const calendarDays = [...Array(startDay).fill(null), ...days];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entriesByDate.get(dateStr);
    if (entry) {
      setSelectedEntry(entry);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8E6E3]">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-[#8B7355]/10 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[#6B6B6B]" />
          </button>
          <h2 className="text-lg font-serif font-semibold text-[#2C2C2C]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-[#8B7355]/10 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-[#6B6B6B]" />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 border-b border-[#E8E6E3]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-[#6B6B6B]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = entriesByDate.get(dateStr);
            const hasEntry = !!entry;
            const isCurrentDay = isToday(day);
            const isSelected = selectedEntry && isSameDay(parseISO(selectedEntry.entry_date), day);

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                disabled={!hasEntry}
                className={`aspect-square p-1 border-t border-r border-[#E8E6E3] relative flex items-center justify-center transition-colors
                  ${!isSameMonth(day, currentMonth) ? 'text-[#E8E6E3]' : ''}
                  ${hasEntry ? 'cursor-pointer hover:bg-[#8B7355]/5' : 'cursor-default'}
                  ${isSelected ? 'bg-[#8B7355]/10' : ''}
                `}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                    ${isCurrentDay ? 'bg-[#8B7355] text-white' : ''}
                    ${hasEntry && !isCurrentDay ? 'bg-[#8B7355]/20 text-[#8B7355] font-medium' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-[#E8E6E3] flex items-center gap-4 text-sm text-[#6B6B6B]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8B7355]" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8B7355]/20" />
            <span>Entry</span>
          </div>
        </div>
      </div>

      {/* Selected Entry Detail */}
      <AnimatePresence mode="wait">
        {selectedEntry && (
          <motion.div
            key={selectedEntry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden"
          >
            <div className="p-6 border-b border-[#E8E6E3] flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold text-[#2C2C2C]">
                {format(parseISO(selectedEntry.entry_date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 hover:bg-[#8B7355]/10 rounded transition-colors"
              >
                <XIcon className="w-5 h-5 text-[#6B6B6B]" />
              </button>
            </div>

            <div className="divide-y divide-[#E8E6E3]">
              {[
                { question: selectedEntry.question_1, answer: selectedEntry.question_1_answer },
                { question: selectedEntry.question_2, answer: selectedEntry.question_2_answer },
                { question: selectedEntry.question_3, answer: selectedEntry.question_3_answer },
              ].map((item, index) => (
                <div key={index} className="p-6">
                  <p className="text-[#8B7355] font-medium mb-2">
                    Q{index + 1}: {item.question?.text || 'Question not available'}
                  </p>
                  <p className="text-[#2C2C2C] whitespace-pre-wrap">
                    {item.answer || <span className="text-[#6B6B6B] italic">No answer provided</span>}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Count */}
      <p className="text-center text-sm text-[#6B6B6B]">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
      </p>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
