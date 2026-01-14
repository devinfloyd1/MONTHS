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

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [error, setError] = useState<string | null>(null);

  // Retry creating entry if it failed initially or wasn't captured
  const ensureEntryExists = async () => {
    if (entryId) return entryId;
    if (!questions) return null;

    try {
      const supabase = createClient();

      // First check if one already exists for today that we missed
      const { data: existing } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .single();

      if (existing) {
        setEntryId(existing.id);
        return existing.id;
      }

      // Create new one
      console.log('Attempting to create new entry for', today);
      const { data, error: insertError } = await supabase
        .from('daily_entries')
        .insert({
          user_id: userId,
          entry_date: today,
          question_1_id: questions.question_1.id,
          question_2_id: questions.question_2.id,
          question_3_id: questions.question_3.id,
        })
        .select()
        .single();

      if (insertError) {
        // Check for unique constraint violation (Postgres code 23505)
        if (insertError.code === '23505') {
          console.log('Recovered from unique constraint violation, fetching existing entry...');
          const { data: retryExisting, error: retryError } = await supabase
            .from('daily_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('entry_date', today)
            .single();

          if (retryExisting) {
            setEntryId(retryExisting.id);
            return retryExisting.id;
          }
          if (retryError) {
            console.error('Error fetching existing entry after unique violation:', retryError);
            throw retryError;
          }
        }

        console.error('Insert error details:', insertError);
        throw insertError;
      }
      if (data) {
        console.log('Entry created:', data.id);
        setEntryId(data.id);
        return data.id;
      }
    } catch (err) {
      console.error('Error ensuring entry exists:', err);
      setError('Failed to start a new entry. Please refresh and try again.');
      return null;
    }
  };

  const createInitialEntry = async (selected: Question[]) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
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

      if (error) {
        // If it's a unique constraint violation, we can ignore it here as ensureEntryExists will handle it
        if (error.code === '23505') {
          console.log('Initial entry creation race condition handled');
          return;
        }
        throw error;
      }

      if (data) {
        setEntryId(data.id);
      }
    } catch (error) {
      console.error('Error creating initial entry:', error);
      // Don't set error here, we'll retry on submit
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!questions) return;
    setError(null);
    setIsSubmitting(true);

    try {
      console.log('Submitting answer for question index:', currentQuestionIndex);
      // Ensure we have an entry ID
      const currentEntryId = await ensureEntryExists();
      if (!currentEntryId) {
        throw new Error('Could not create or find today\'s journal entry');
      }

      const questionKeys: QuestionKey[] = ['question_1', 'question_2', 'question_3'];
      const answerKeys: AnswerKey[] = ['answer_1', 'answer_2', 'answer_3'];
      const completedKeys: CompletedKey[] = ['question_1_completed', 'question_2_completed', 'question_3_completed'];

      const currentAnswerKey = answerKeys[currentQuestionIndex];
      const currentCompletedKey = completedKeys[currentQuestionIndex];

      const supabase = createClient();

      const updateData: Record<string, string | boolean | null> = {
        [`question_${currentQuestionIndex + 1}_answer`]: answers[currentAnswerKey] || null,
        [currentCompletedKey]: true,
      };

      console.log('Updating entry:', currentEntryId, updateData);

      const { error: updateError } = await supabase
        .from('daily_entries')
        .update(updateData)
        .eq('id', currentEntryId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Update successful');

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
      setError(`Failed to save: ${(error as any).message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="flex justify-center items-center gap-3 mb-10">
              <span className="text-xs font-medium text-white/60 tracking-wider uppercase">
                Step {currentQuestionIndex + 1} of 3
              </span>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{
                      scale: index === currentQuestionIndex ? 1.2 : 1,
                      backgroundColor: completedQuestions[completedKeys[index]]
                        ? 'rgba(255, 255, 255, 0.9)'
                        : index === currentQuestionIndex
                          ? 'rgba(255, 255, 255, 0.5)'
                          : 'rgba(255, 255, 255, 0.2)'
                    }}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Question card */}
            <div className="backdrop-blur-md bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
              {/* Decorative gradient blob behind */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2" />

              <div className="p-8 md:p-10 border-b border-white/10">
                <motion.p
                  key={currentQuestion.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-light text-white leading-relaxed font-serif tracking-wide"
                >
                  {currentQuestion.text}
                </motion.p>
              </div>

              <div className="p-8 md:p-10 bg-black/5">
                {isCurrentCompleted ? (
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="inline-block p-4 rounded-full bg-green-500/20 mb-4"
                    >
                      <span className="text-3xl text-green-400">✓</span>
                    </motion.div>
                    <p className="text-white/80 font-medium text-lg tracking-wide">Journaled</p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={answers[currentAnswerKey]}
                      onChange={(e) =>
                        setAnswers({ ...answers, [currentAnswerKey]: e.target.value })
                      }
                      placeholder="Write your thoughts..."
                      className="min-h-[200px] text-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:ring-white/20 rounded-xl resize-none p-4 transition-all duration-300"
                      autoFocus
                    />
                    {error && (
                      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={!answers[currentAnswerKey].trim()}
                        className="bg-white text-black hover:bg-white/90 font-medium px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                      >
                        Submit Entry
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="text-center text-sm text-white/40 mt-8 font-light tracking-wide">
              Take your time. There&apos;s no right or wrong answer.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
