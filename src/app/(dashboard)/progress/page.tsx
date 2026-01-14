import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentMonthYear, getMonthName } from '@/lib/utils';
import ProgressTracker from '@/components/progress/ProgressTracker';

export default async function ProgressPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const currentMonth = getCurrentMonthYear();
  const monthName = getMonthName(currentMonth);

  // Get the number of days in the current month
  const [year, month] = currentMonth.split('-').map(Number);
  const totalDays = new Date(year, month, 0).getDate();

  // Count days journaled this month (only count days where all 3 questions are completed)
  const { data: entries } = await supabase
    .from('daily_entries')
    .select('entry_date, question_1_completed, question_2_completed, question_3_completed')
    .eq('user_id', user.id)
    .gte('entry_date', `${currentMonth}-01`)
    .lt('entry_date', `${currentMonth}-32`);

  // Count only fully completed days
  const daysJournaled = entries?.filter(
    entry => entry.question_1_completed && entry.question_2_completed && entry.question_3_completed
  ).length || 0;

  return (
    <ProgressTracker
      currentMonth={monthName}
      daysJournaled={daysJournaled}
      totalDays={totalDays}
    />
  );
}
