import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import BookPreview from '@/components/books/BookPreview';

interface BookPageProps {
  params: Promise<{ month: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { month } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    redirect('/books');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single();

  // Parse the month to get date range
  const [year, monthNum] = month.split('-');
  const monthDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

  // Get entries for this month
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
    .gte('entry_date', monthStart)
    .lte('entry_date', monthEnd)
    .order('entry_date', { ascending: true });

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

  const monthName = format(monthDate, 'MMMM yyyy');
  const userName = profile?.name || 'My Journal';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <a
          href="/books"
          className="inline-flex items-center gap-2 text-[#8B7355] hover:underline mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Books
        </a>
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#2C2C2C]">
          {monthName}
        </h1>
        <p className="text-[#6B6B6B] mt-1">
          {entries?.length || 0} {entries?.length === 1 ? 'entry' : 'entries'} in this book
        </p>
      </header>

      <BookPreview
        userName={userName}
        monthYear={month}
        monthName={monthName}
        entries={entries || []}
      />
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
