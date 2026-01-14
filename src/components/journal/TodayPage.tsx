'use client';

import { useState } from 'react';
import type { Question, DailyEntryWithQuestions } from '@/lib/types';
import AnimatedLanding from './AnimatedLanding';
import SequentialQuestions from './SequentialQuestions';

interface TodayPageProps {
  userId: string;
  existingEntry: DailyEntryWithQuestions | null;
  allQuestions: Question[];
  usedQuestionIds: string[];
  today: string;
  showLanding: boolean;
}

export default function TodayPage({
  userId,
  existingEntry,
  allQuestions,
  usedQuestionIds,
  today,
  showLanding,
}: TodayPageProps) {
  const [landingComplete, setLandingComplete] = useState(!showLanding);

  const handleLandingComplete = () => {
    setLandingComplete(true);
  };

  // Show landing animation first if needed
  if (!landingComplete) {
    return (
      <AnimatedLanding
        isVisible={true}
        onComplete={handleLandingComplete}
      />
    );
  }

  // Show the sequential questions flow
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-8">
        <p className="text-[#6B6B6B] text-sm mb-2">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      <SequentialQuestions
        userId={userId}
        existingEntry={existingEntry}
        allQuestions={allQuestions}
        usedQuestionIds={usedQuestionIds}
        today={today}
      />
    </div>
  );
}
