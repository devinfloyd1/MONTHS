-- MONTHS Journaling App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Users can only read/update their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  text text not null,
  category text not null check (category in ('gratitude', 'growth', 'reflection', 'future', 'relationships', 'creativity', 'challenge')),
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (questions are readable by all authenticated users)
alter table public.questions enable row level security;

create policy "Questions are viewable by authenticated users" on public.questions
  for select using (auth.role() = 'authenticated');

-- ============================================
-- DAILY ENTRIES TABLE
-- ============================================
create table if not exists public.daily_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  entry_date date not null,
  question_1_id uuid references public.questions(id) not null,
  question_1_answer text,
  question_1_completed boolean default false,
  question_2_id uuid references public.questions(id) not null,
  question_2_answer text,
  question_2_completed boolean default false,
  question_3_id uuid references public.questions(id) not null,
  question_3_answer text,
  question_3_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- One entry per user per day
  unique(user_id, entry_date)
);

-- Enable Row Level Security
alter table public.daily_entries enable row level security;

create policy "Users can view own entries" on public.daily_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries" on public.daily_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries" on public.daily_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries" on public.daily_entries
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.daily_entries
  for each row
  execute procedure public.handle_updated_at();

-- ============================================
-- MONTHLY BOOKS TABLE (for caching generated PDFs)
-- ============================================
create table if not exists public.monthly_books (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  month_year text not null, -- Format: YYYY-MM
  pdf_url text,
  generated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- One book per user per month
  unique(user_id, month_year)
);

-- Enable Row Level Security
alter table public.monthly_books enable row level security;

create policy "Users can view own books" on public.monthly_books
  for select using (auth.uid() = user_id);

create policy "Users can insert own books" on public.monthly_books
  for insert with check (auth.uid() = user_id);

create policy "Users can update own books" on public.monthly_books
  for update using (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_daily_entries_user_date on public.daily_entries(user_id, entry_date);
create index if not exists idx_daily_entries_entry_date on public.daily_entries(entry_date);
create index if not exists idx_questions_category on public.questions(category);
create index if not exists idx_questions_active on public.questions(is_active);
create index if not exists idx_monthly_books_user_month on public.monthly_books(user_id, month_year);

-- ============================================
-- SEED QUESTIONS
-- Run this after creating the tables
-- ============================================

-- Gratitude questions
insert into public.questions (text, category) values
  ('What made you smile today?', 'gratitude'),
  ('What are three things you''re grateful for right now?', 'gratitude'),
  ('Who made a positive difference in your day?', 'gratitude'),
  ('What simple pleasure did you enjoy today?', 'gratitude'),
  ('What''s something beautiful you noticed today?', 'gratitude'),
  ('What comfort do you often take for granted?', 'gratitude'),
  ('What ability or skill are you thankful to have?', 'gratitude'),
  ('What memory are you most grateful for?', 'gratitude'),
  ('What technology made your life easier today?', 'gratitude'),
  ('What food did you enjoy eating today?', 'gratitude'),
  ('What moment of peace did you experience today?', 'gratitude'),
  ('What about your home makes you feel grateful?', 'gratitude'),
  ('What aspect of your health are you thankful for?', 'gratitude'),
  ('What unexpected kindness did you receive recently?', 'gratitude'),
  ('What lesson are you grateful to have learned?', 'gratitude');

-- Growth questions
insert into public.questions (text, category) values
  ('What lesson did you learn this week?', 'growth'),
  ('What skill would you like to develop further?', 'growth'),
  ('What mistake taught you something valuable?', 'growth'),
  ('How have you grown as a person this year?', 'growth'),
  ('What habit are you trying to build?', 'growth'),
  ('What area of your life needs more attention?', 'growth'),
  ('What knowledge do you wish you had gained sooner?', 'growth'),
  ('What''s one thing you could do better tomorrow?', 'growth'),
  ('What feedback have you received that helped you improve?', 'growth'),
  ('What book, podcast, or article taught you something new?', 'growth'),
  ('What challenge helped you become stronger?', 'growth'),
  ('What old belief have you reconsidered recently?', 'growth'),
  ('What would your ideal self do differently?', 'growth'),
  ('What''s something you used to struggle with but have improved at?', 'growth'),
  ('What learning opportunity are you excited about?', 'growth');

-- Reflection questions
insert into public.questions (text, category) values
  ('What would you tell your younger self?', 'reflection'),
  ('What''s on your mind right now?', 'reflection'),
  ('How are you really feeling today?', 'reflection'),
  ('What''s something you''ve been avoiding?', 'reflection'),
  ('What decision are you currently facing?', 'reflection'),
  ('What do you need to let go of?', 'reflection'),
  ('What''s been weighing on your heart lately?', 'reflection'),
  ('What brings you the most peace?', 'reflection'),
  ('What''s something you need to forgive yourself for?', 'reflection'),
  ('What would make today meaningful?', 'reflection'),
  ('What''s your current state of mind in one word?', 'reflection'),
  ('What do you wish others understood about you?', 'reflection'),
  ('What are you most proud of about yourself?', 'reflection'),
  ('What''s something you''ve been putting off that you know you should do?', 'reflection'),
  ('How did you take care of yourself today?', 'reflection'),
  ('What boundaries do you need to set or maintain?', 'reflection'),
  ('What''s draining your energy lately?', 'reflection'),
  ('What''s giving you energy lately?', 'reflection'),
  ('If today was your last day, what would you want to do?', 'reflection'),
  ('What season of life are you in right now?', 'reflection');

-- Future questions
insert into public.questions (text, category) values
  ('Where do you see yourself in 5 years?', 'future'),
  ('What are you looking forward to?', 'future'),
  ('What goal are you working toward?', 'future'),
  ('What would you do if you knew you couldn''t fail?', 'future'),
  ('What does your ideal day look like?', 'future'),
  ('What legacy do you want to leave?', 'future'),
  ('What''s on your bucket list?', 'future'),
  ('What dream have you been postponing?', 'future'),
  ('What would you attempt if resources were unlimited?', 'future'),
  ('What change do you want to see in the world?', 'future'),
  ('What adventure do you want to have?', 'future'),
  ('What kind of person do you want to become?', 'future'),
  ('What''s the next big milestone you''re working toward?', 'future'),
  ('What would make next month better than this one?', 'future'),
  ('What new experience do you want to try?', 'future');

-- Relationships questions
insert into public.questions (text, category) values
  ('Who inspired you recently?', 'relationships'),
  ('Who do you need to reconnect with?', 'relationships'),
  ('What relationship in your life needs more attention?', 'relationships'),
  ('Who has shaped who you are today?', 'relationships'),
  ('What quality do you admire most in others?', 'relationships'),
  ('Who would you like to thank?', 'relationships'),
  ('What conversation do you need to have?', 'relationships'),
  ('How did you show love to someone today?', 'relationships'),
  ('Who makes you feel truly seen and heard?', 'relationships'),
  ('What have you learned from a difficult relationship?', 'relationships'),
  ('Who do you turn to in times of trouble?', 'relationships'),
  ('What kind of friend do you want to be?', 'relationships'),
  ('Who challenges you to be better?', 'relationships'),
  ('What''s the most meaningful conversation you''ve had recently?', 'relationships'),
  ('How can you be more present with the people you love?', 'relationships');

-- Creativity questions
insert into public.questions (text, category) values
  ('What idea excited you today?', 'creativity'),
  ('What creative project are you working on?', 'creativity'),
  ('What would you create if you had no limits?', 'creativity'),
  ('What inspires your creativity?', 'creativity'),
  ('What problem would you love to solve?', 'creativity'),
  ('What''s a new way you could approach an old problem?', 'creativity'),
  ('What art, music, or writing moved you recently?', 'creativity'),
  ('What''s something you''d like to make with your hands?', 'creativity'),
  ('What hobby would you like to explore?', 'creativity'),
  ('If you wrote a book, what would it be about?', 'creativity'),
  ('What would you design if you were an architect?', 'creativity'),
  ('What story do you want to tell?', 'creativity'),
  ('What''s the most creative thing you did today?', 'creativity'),
  ('What would you invent to make life better?', 'creativity'),
  ('How do you express yourself creatively?', 'creativity');

-- Challenge questions
insert into public.questions (text, category) values
  ('What scared you but you did anyway?', 'challenge'),
  ('What''s the hardest thing you''re dealing with right now?', 'challenge'),
  ('What obstacle are you currently facing?', 'challenge'),
  ('What fear would you like to overcome?', 'challenge'),
  ('What''s outside your comfort zone that you want to try?', 'challenge'),
  ('What failure taught you resilience?', 'challenge'),
  ('What difficult conversation do you need to have?', 'challenge'),
  ('What risk is worth taking?', 'challenge'),
  ('What''s the bravest thing you''ve done recently?', 'challenge'),
  ('What challenge are you avoiding?', 'challenge'),
  ('What would you do if you weren''t afraid?', 'challenge'),
  ('What setback have you overcome?', 'challenge'),
  ('What tough decision are you facing?', 'challenge'),
  ('What''s pushing you to grow right now?', 'challenge'),
  ('How do you handle stress and pressure?', 'challenge');
