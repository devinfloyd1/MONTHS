import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DailyQuestions from '@/components/journal/DailyQuestions';
import { getTodayDate, getCurrentMonthYear } from '@/lib/utils';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <p className="text-[#6B6B6B] text-sm mb-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#2C2C2C]">
          {profile?.name ? `Good ${getGreeting()}, ${profile.name.split(' ')[0]}` : `Good ${getGreeting()}`}
        </h1>
      </header>

      <DailyQuestions
        userId={user.id}
        existingEntry={existingEntry}
        allQuestions={allQuestions || []}
        usedQuestionIds={Array.from(usedQuestionIds)}
        today={today}
      />
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
