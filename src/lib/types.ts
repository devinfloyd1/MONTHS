export type QuestionCategory =
  | 'gratitude'
  | 'growth'
  | 'reflection'
  | 'future'
  | 'relationships'
  | 'creativity'
  | 'challenge';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  subscription_tier: 'free' | 'pro';
}

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string;
  question_1_id: string;
  question_1_answer: string | null;
  question_2_id: string;
  question_2_answer: string | null;
  question_3_id: string;
  question_3_answer: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyEntryWithQuestions extends Omit<DailyEntry, 'question_1_id' | 'question_2_id' | 'question_3_id'> {
  question_1: Question;
  question_2: Question;
  question_3: Question;
}

export interface MonthlyBook {
  id: string;
  user_id: string;
  month_year: string; // Format: YYYY-MM
  pdf_url: string | null;
  generated_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          subscription_tier?: 'free' | 'pro';
        };
        Update: {
          email?: string;
          name?: string | null;
          subscription_tier?: 'free' | 'pro';
        };
        Relationships: [];
      };
      questions: {
        Row: Question;
        Insert: {
          text: string;
          category: QuestionCategory;
          is_active?: boolean;
        };
        Update: {
          text?: string;
          category?: QuestionCategory;
          is_active?: boolean;
        };
        Relationships: [];
      };
      daily_entries: {
        Row: DailyEntry;
        Insert: {
          user_id: string;
          entry_date: string;
          question_1_id: string;
          question_1_answer?: string | null;
          question_2_id: string;
          question_2_answer?: string | null;
          question_3_id: string;
          question_3_answer?: string | null;
        };
        Update: {
          user_id?: string;
          entry_date?: string;
          question_1_id?: string;
          question_1_answer?: string | null;
          question_2_id?: string;
          question_2_answer?: string | null;
          question_3_id?: string;
          question_3_answer?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_entries_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_entries_question_1_id_fkey';
            columns: ['question_1_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_entries_question_2_id_fkey';
            columns: ['question_2_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_entries_question_3_id_fkey';
            columns: ['question_3_id'];
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          }
        ];
      };
      monthly_books: {
        Row: MonthlyBook;
        Insert: {
          user_id: string;
          month_year: string;
          pdf_url?: string | null;
          generated_at?: string | null;
        };
        Update: {
          user_id?: string;
          month_year?: string;
          pdf_url?: string | null;
          generated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'monthly_books_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
