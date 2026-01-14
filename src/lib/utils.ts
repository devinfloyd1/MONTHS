import { format, parseISO } from 'date-fns';

export function formatDate(date: string | Date, formatStr: string = 'MMMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentMonthYear(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthName(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMMM yyyy');
}

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random questions that haven't been used this month
export function selectRandomQuestions<T extends { id: string }>(
  allQuestions: T[],
  usedQuestionIds: string[],
  count: number = 3
): T[] {
  const availableQuestions = allQuestions.filter(
    (q) => !usedQuestionIds.includes(q.id)
  );

  // If we don't have enough unused questions, reset and use all
  const pool = availableQuestions.length >= count ? availableQuestions : allQuestions;

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, count);
}
