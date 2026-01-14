import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CalendarView from '@/components/calendar/CalendarView';

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get all entries for the user
  const { data: rawEntries } = await supabase
    .from('daily_entries')
    .select(`
      id,
      entry_date,
      question_1_answer,
      question_2_answer,
      question_3_answer,
      question_1:questions!daily_entries_question_1_id_fkey(id, text),
      question_2:questions!daily_entries_question_2_id_fkey(id, text),
      question_3:questions!daily_entries_question_3_id_fkey(id, text)
    `)
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false });

  // Transform entries to handle Supabase's array return for relations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries = rawEntries?.map((entry: any) => ({
    id: entry.id,
    entry_date: entry.entry_date,
    question_1_answer: entry.question_1_answer,
    question_2_answer: entry.question_2_answer,
    question_3_answer: entry.question_3_answer,
    question_1: Array.isArray(entry.question_1) ? entry.question_1[0] : entry.question_1,
    question_2: Array.isArray(entry.question_2) ? entry.question_2[0] : entry.question_2,
    question_3: Array.isArray(entry.question_3) ? entry.question_3[0] : entry.question_3,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#2C2C2C]">
          Your Journal
        </h1>
        <p className="text-[#6B6B6B] mt-1">
          Browse your past reflections
        </p>
      </header>

      <CalendarView entries={entries || []} />
    </div>
  );
}
