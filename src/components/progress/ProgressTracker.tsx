'use client';

import { motion } from 'framer-motion';

interface ProgressTrackerProps {
  currentMonth: string;
  daysJournaled: number;
  totalDays: number;
}

export default function ProgressTracker({
  currentMonth,
  daysJournaled,
  totalDays,
}: ProgressTrackerProps) {
  const percentage = totalDays > 0 ? (daysJournaled / totalDays) * 100 : 0;

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#2C2C2C] mb-2">
          {currentMonth}
        </h1>
        <p className="text-[#6B6B6B]">Your journaling progress</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] p-8">
        {/* Main stat */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-5xl md:text-6xl font-serif font-bold text-[#8B7355]">
              {daysJournaled}
            </span>
            <span className="text-2xl md:text-3xl font-serif text-[#6B6B6B] ml-2">
              / {totalDays}
            </span>
          </motion.div>
          <p className="text-[#6B6B6B] mt-2">days journaled</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-3 bg-[#E8E6E3] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#8B7355] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-[#6B6B6B]">
            <span>Start</span>
            <span>{Math.round(percentage)}%</span>
            <span>End</span>
          </div>
        </div>

        {/* Encouragement message */}
        <div className="text-center">
          {daysJournaled === 0 ? (
            <p className="text-[#6B6B6B]">
              Start your journaling journey today.
            </p>
          ) : daysJournaled === totalDays ? (
            <p className="text-[#8B7355] font-medium">
              Perfect month! Every day journaled.
            </p>
          ) : percentage >= 80 ? (
            <p className="text-[#8B7355]">
              Amazing consistency! Keep it up.
            </p>
          ) : percentage >= 50 ? (
            <p className="text-[#6B6B6B]">
              Great progress! You&apos;re building a habit.
            </p>
          ) : (
            <p className="text-[#6B6B6B]">
              Every entry counts. Keep going.
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-sm text-[#6B6B6B] mt-8">
        Your reflections become a book at the end of each month.
      </p>
    </div>
  );
}
