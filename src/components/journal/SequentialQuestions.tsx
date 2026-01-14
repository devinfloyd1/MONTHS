'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { selectRandomQuestions } from '@/lib/utils';
import type { Question, DailyEntryWithQuestions } from '@/lib/types';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import AnimatedLanding from './AnimatedLanding';

interface SequentialQuestionsProps {
  userId: string;
  existingEntry: DailyEntryWithQuestions | null;
  allQuestions: Question[];
  usedQuestionIds: string[];
  today: string;
  showLanding?: boolean;
}

interface SelectedQuestions {
  question_1: Question;
  question_2: Question;
  question_3: Question;
}

type QuestionKey = 'question_1' | 'question_2' | 'question_3';
type AnswerKey = 'answer_1' | 'answer_2' | 'answer_3';
type CompletedKey = 'question_1_completed' | 'question_2_completed' | 'question_3_completed';

export default function SequentialQuestions({
  userId,
  existingEntry,
  allQuestions,
  usedQuestionIds,
  today,
  showLanding = false,
}: SequentialQuestionsProps) {
  const [showLandingScreen, setShowLandingScreen] = useState(showLanding);
  const [questions, setQuestions] = useState<SelectedQuestions | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    answer_1: '',
    answer_2: '',
    answer_3: '',
  });
  const [completedQuestions, setCompletedQuestions] = useState({
    question_1_completed: false,
    question_2_completed: false,
    question_3_completed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
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
      setCompletedQuestions({
        question_1_completed: existingEntry.question_1_completed || false,
        question_2_completed: existingEntry.question_2_completed || false,
        question_3_completed: existingEntry.question_3_completed || false,
      });
      setEntryId(existingEntry.id);

      // Determine which question to show based on completion status
      if (existingEntry.question_3_completed) {
        setAllComplete(true);
        setCurrentQuestionIndex(2);
      } else if (existingEntry.question_2_completed) {
        setCurrentQuestionIndex(2);
      } else if (existingEntry.question_1_completed) {
        setCurrentQuestionIndex(1);
      } else {
        setCurrentQuestionIndex(0);
      }
    } else if (allQuestions.length >= 3) {
      const selected = selectRandomQuestions(allQuestions, usedQuestionIds, 3);
      setQuestions({
        question_1: selected[0],
        question_2: selected[1],
        question_3: selected[2],
      });
      // Create entry immediately with questions locked in
      createInitialEntry(selected);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createInitialEntry = async (selected: Question[]) => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('daily_entries')
        .insert({
          user_id: userId,
          entry_date: today,
          question_1_id: selected[0].id,
          question_1_answer: null,
          question_1_completed: false,
          question_2_id: selected[1].id,
          question_2_answer: null,
          question_2_completed: false,
          question_3_id: selected[2].id,
          question_3_answer: null,
          question_3_completed: false,
        })
        .select()
        .single();
      if (data) {
        setEntryId(data.id);
      }
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!questions || !entryId) return;

    setIsSubmitting(true);

    const questionKeys: QuestionKey[] = ['question_1', 'question_2', 'question_3'];
    const answerKeys: AnswerKey[] = ['answer_1', 'answer_2', 'answer_3'];
    const completedKeys: CompletedKey[] = ['question_1_completed', 'question_2_completed', 'question_3_completed'];

    const currentAnswerKey = answerKeys[currentQuestionIndex];
    const currentCompletedKey = completedKeys[currentQuestionIndex];

    try {
      const supabase = createClient();

      const updateData: Record<string, string | boolean | null> = {
        [`question_${currentQuestionIndex + 1}_answer`]: answers[currentAnswerKey] || null,
        [currentCompletedKey]: true,
      };

      await supabase
        .from('daily_entries')
        .update(updateData)
        .eq('id', entryId);

      // Update local state
      setCompletedQuestions(prev => ({
        ...prev,
        [currentCompletedKey]: true,
      }));

      // Show success message
      setShowSuccess(true);

      // After success animation, move to next question or complete
      setTimeout(() => {
        setShowSuccess(false);

        if (currentQuestionIndex === 2) {
          // All questions complete
          setAllComplete(true);
        } else {
          // Move to next question
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }, 1500);

    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [questions, entryId, currentQuestionIndex, answers]);

  const handleLandingComplete = () => {
    setShowLandingScreen(false);
  };

  if (!questions) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B6B6B]">Loading your questions...</p>
      </div>
    );
  }

  // Show landing animation if needed
  if (showLandingScreen) {
    return <AnimatedLanding isVisible={true} onComplete={handleLandingComplete} />;
  }

  // All questions are complete
  if (allComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="text-5xl">✓</span>
        </motion.div>
        <h2 className="text-2xl font-serif font-semibold text-[#2C2C2C] mb-2">
          All journals for today completed
        </h2>
        <p className="text-[#6B6B6B]">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-sm text-[#6B6B6B] mt-8">
          Come back tomorrow for new questions.
        </p>
      </motion.div>
    );
  }

  const questionKeys: QuestionKey[] = ['question_1', 'question_2', 'question_3'];
  const answerKeys: AnswerKey[] = ['answer_1', 'answer_2', 'answer_3'];
  const completedKeys: CompletedKey[] = ['question_1_completed', 'question_2_completed', 'question_3_completed'];

  const currentQuestion = questions[questionKeys[currentQuestionIndex]];
  const currentAnswerKey = answerKeys[currentQuestionIndex];
  const isCurrentCompleted = completedQuestions[completedKeys[currentQuestionIndex]];

  return (
    <div className="max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-4xl mb-4"
            >
              ✓
            </motion.div>
            <p className="text-xl font-serif text-[#8B7355]">Journaled</p>
          </motion.div>
        ) : (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    completedQuestions[completedKeys[index]]
                      ? 'bg-[#8B7355]'
                      : index === currentQuestionIndex
                      ? 'bg-[#8B7355]/50'
                      : 'bg-[#E8E6E3]'
                  }`}
                />
              ))}
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
              <div className="p-6 border-b border-[#E8E6E3]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B7355]/10 text-[#8B7355] flex items-center justify-center font-serif font-semibold text-sm">
                    {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-[#6B6B6B]">
                    Question {currentQuestionIndex + 1} of 3
                  </span>
                </div>
                <p className="text-xl font-medium text-[#2C2C2C] leading-relaxed font-serif">
                  {currentQuestion.text}
                </p>
              </div>

              <div className="p-6">
                {isCurrentCompleted ? (
                  <div className="text-center py-8">
                    <span className="text-3xl">✓</span>
                    <p className="text-[#8B7355] mt-2 font-medium">Journaled</p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={answers[currentAnswerKey]}
                      onChange={(e) =>
                        setAnswers({ ...answers, [currentAnswerKey]: e.target.value })
                      }
                      placeholder="Write your thoughts..."
                      className="min-h-[150px] text-base"
                      autoFocus
                    />
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={!answers[currentAnswerKey].trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-center text-sm text-[#6B6B6B] mt-6">
              Take your time. There&apos;s no right or wrong answer.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
