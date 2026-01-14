'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { selectRandomQuestions } from '@/lib/utils';
import type { Question, DailyEntryWithQuestions } from '@/lib/types';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface DailyQuestionsProps {
  userId: string;
  existingEntry: DailyEntryWithQuestions | null;
  allQuestions: Question[];
  usedQuestionIds: string[];
  today: string;
}

interface SelectedQuestions {
  question_1: Question;
  question_2: Question;
  question_3: Question;
}

export default function DailyQuestions({
  userId,
  existingEntry,
  allQuestions,
  usedQuestionIds,
  today,
}: DailyQuestionsProps) {
  const [questions, setQuestions] = useState<SelectedQuestions | null>(null);
  const [answers, setAnswers] = useState({
    answer_1: '',
    answer_2: '',
    answer_3: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (existingEntry) {
      setQuestions({
        question_1: existingEntry.question_1,
        question_2: existingEntry.question_2,
        question_3: existingEntry.question_3,
      });
      setAnswers({
        answer_1: existingEntry.question_1_answer || '',
        answer_2: existingEntry.question_2_answer || '',
        answer_3: existingEntry.question_3_answer || '',
      });
      setEntryId(existingEntry.id);
      setLastSaved(new Date(existingEntry.updated_at));
    } else if (allQuestions.length >= 3) {
      const selected = selectRandomQuestions(allQuestions, usedQuestionIds, 3);
      setQuestions({
        question_1: selected[0],
        question_2: selected[1],
        question_3: selected[2],
      });
    }
  }, [existingEntry, allQuestions, usedQuestionIds]);

  const handleSave = async () => {
    if (!questions) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      const entryData = {
        user_id: userId,
        entry_date: today,
        question_1_id: questions.question_1.id,
        question_1_answer: answers.answer_1 || null,
        question_2_id: questions.question_2.id,
        question_2_answer: answers.answer_2 || null,
        question_3_id: questions.question_3.id,
        question_3_answer: answers.answer_3 || null,
      };

      if (entryId) {
        await supabase
          .from('daily_entries')
          .update(entryData)
          .eq('id', entryId);
      } else {
        const { data } = await supabase
          .from('daily_entries')
          .insert(entryData)
          .select()
          .single();
        if (data) {
          setEntryId(data.id);
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on blur
  const handleBlur = () => {
    if (answers.answer_1 || answers.answer_2 || answers.answer_3) {
      handleSave();
    }
  };

  if (!questions) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B6B6B]">Loading your questions...</p>
      </div>
    );
  }

  const questionItems = [
    { question: questions.question_1, answer: answers.answer_1, key: 'answer_1' as const },
    { question: questions.question_2, answer: answers.answer_2, key: 'answer_2' as const },
    { question: questions.question_3, answer: answers.answer_3, key: 'answer_3' as const },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="p-6 border-b border-[#E8E6E3]">
          <h2 className="text-lg font-serif font-semibold text-[#2C2C2C]">
            Today&apos;s Questions
          </h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Take a moment to reflect. There&apos;s no right or wrong answer.
          </p>
        </div>

        <div className="divide-y divide-[#E8E6E3]">
          {questionItems.map((item, index) => (
            <motion.div
              key={item.question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center font-serif font-semibold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-3">
                  <p className="text-lg font-medium text-[#2C2C2C] leading-relaxed">
                    {item.question.text}
                  </p>
                  <Textarea
                    value={item.answer}
                    onChange={(e) =>
                      setAnswers({ ...answers, [item.key]: e.target.value })
                    }
                    onBlur={handleBlur}
                    placeholder="Write your thoughts..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 bg-[#FEFDFB] border-t border-[#E8E6E3] flex items-center justify-between">
          <div className="text-sm text-[#6B6B6B]">
            {lastSaved ? (
              <>Saved at {lastSaved.toLocaleTimeString()}</>
            ) : (
              <>Your answers auto-save</>
            )}
          </div>
          <Button onClick={handleSave} isLoading={isSaving} size="sm">
            Save
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-[#6B6B6B]">
        Your reflections will become part of your monthly book.
      </p>
    </div>
  );
}
