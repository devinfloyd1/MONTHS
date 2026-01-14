import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTodayDate, getCurrentMonthYear } from '@/lib/utils';
import TodayPage from '@/components/journal/TodayPage';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const today = getTodayDate();
  const currentMonth = getCurrentMonthYear();

  // Get today's entry if it exists
  const { data: existingEntry } = await supabase
    .from('daily_entries')
    .select(`
      *,
      question_1:questions!daily_entries_question_1_id_fkey(*),
      question_2:questions!daily_entries_question_2_id_fkey(*),
      question_3:questions!daily_entries_question_3_id_fkey(*)
    `)
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .single();

  // Get questions used this month (to avoid repeats)
  const { data: monthEntries } = await supabase
    .from('daily_entries')
    .select('question_1_id, question_2_id, question_3_id')
    .eq('user_id', user.id)
    .gte('entry_date', `${currentMonth}-01`)
    .lt('entry_date', `${currentMonth}-32`);

  const usedQuestionIds = new Set<string>();
  monthEntries?.forEach((entry) => {
    if (entry.question_1_id) usedQuestionIds.add(entry.question_1_id);
    if (entry.question_2_id) usedQuestionIds.add(entry.question_2_id);
    if (entry.question_3_id) usedQuestionIds.add(entry.question_3_id);
  });

  // Get all active questions
  const { data: allQuestions } = await supabase
    .from('questions')
    .select('*')
    .eq('is_active', true);

  // Determine if we should show the landing animation
  // Show it only if there's no entry for today yet
  const showLanding = !existingEntry;

  return (
    <TodayPage
      userId={user.id}
      existingEntry={existingEntry}
      allQuestions={allQuestions || []}
      usedQuestionIds={Array.from(usedQuestionIds)}
      today={today}
      showLanding={showLanding}
    />
  );
}
