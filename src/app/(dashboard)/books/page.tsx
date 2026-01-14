import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import Link from 'next/link';

export default async function BooksPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('name, created_at')
    .eq('id', user.id)
    .single();

  // Get all entries to determine which months have data
  const { data: entries } = await supabase
    .from('daily_entries')
    .select('entry_date')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: true });

  // Group entries by month
  const entriesByMonth = new Map<string, number>();
  entries?.forEach((entry) => {
    const monthKey = format(parseISO(entry.entry_date), 'yyyy-MM');
    entriesByMonth.set(monthKey, (entriesByMonth.get(monthKey) || 0) + 1);
  });

  // Generate list of months from user creation to now
  const userCreatedAt = profile?.created_at ? parseISO(profile.created_at) : subMonths(new Date(), 1);
  const months = eachMonthOfInterval({
    start: startOfMonth(userCreatedAt),
    end: endOfMonth(new Date()),
  }).reverse();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#2C2C2C]">
          Monthly Books
        </h1>
        <p className="text-[#6B6B6B] mt-1">
          Download your reflections as beautifully formatted books
        </p>
      </header>

      <div className="space-y-4">
        {months.map((month) => {
          const monthKey = format(month, 'yyyy-MM');
          const entryCount = entriesByMonth.get(monthKey) || 0;
          const monthName = format(month, 'MMMM yyyy');
          const isCurrentMonth = format(new Date(), 'yyyy-MM') === monthKey;

          return (
            <Link
              key={monthKey}
              href={`/book/${monthKey}`}
              className={`block bg-white rounded-2xl shadow-sm border border-[#E8E6E3] p-6 transition-all hover:shadow-md hover:border-[#8B7355]/30 ${
                entryCount === 0 ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-[#2C2C2C]">
                    {monthName}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mt-1">
                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                    {isCurrentMonth && ' (in progress)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entryCount > 0 && (
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#8B7355]/10 text-[#8B7355]">
                      <BookIcon className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {months.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E6E3]">
            <p className="text-[#6B6B6B]">
              Start journaling to create your first monthly book!
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-[#6B6B6B] mt-8">
        Books are generated on-demand as downloadable 5×7&quot; PDFs
      </p>
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
