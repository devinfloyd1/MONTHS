# MONTHS - Daily Journaling App

A minimalist journaling app that generates monthly books from your daily reflections.

## Features

- **Daily Questions**: 3 randomly selected growth/reflection prompts each day
- **Question Bank**: 100+ diverse questions across 7 categories (gratitude, growth, reflection, future, relationships, creativity, challenge)
- **No Repeats**: Questions don't repeat within the same month
- **Calendar View**: Browse past entries with an interactive calendar
- **Monthly Books**: Generate beautifully formatted 5×7" PDFs of your journal entries
- **Clean Design**: Minimalist, journal-like UI with warm colors

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/months-app.git
cd months-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Enable Google OAuth (optional):
   - Go to **Authentication** → **Providers** → **Google**
   - Add your Google OAuth credentials

### 4. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase dashboard under **Settings** → **API**.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
months-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── page.tsx       # Home - daily questions
│   │   │   ├── calendar/      # Calendar view
│   │   │   ├── books/         # Monthly books list
│   │   │   ├── book/[month]/  # Book preview/download
│   │   │   └── settings/      # User settings
│   │   └── auth/callback/     # OAuth callback handler
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   ├── journal/           # Journal-specific components
│   │   ├── calendar/          # Calendar components
│   │   ├── books/             # Book-related components
│   │   └── settings/          # Settings components
│   └── lib/
│       ├── supabase/          # Supabase client configuration
│       ├── types.ts           # TypeScript type definitions
│       ├── questions.ts       # Question bank data
│       ├── utils.ts           # Utility functions
│       └── pdf.ts             # PDF generation logic
├── supabase/
│   └── schema.sql             # Database schema & seed data
└── public/                    # Static assets
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## Database Schema

### Tables

- **users**: User profiles (id, email, name, subscription_tier)
- **questions**: Question bank (text, category, is_active)
- **daily_entries**: Journal entries (user_id, entry_date, questions & answers)
- **monthly_books**: Generated book metadata (user_id, month_year, pdf_url)

## Design System

### Colors

- Background: `#FEFDFB` (off-white, journal paper)
- Text: `#2C2C2C` (soft black)
- Accent: `#8B7355` (warm brown)
- Borders: `#E8E6E3` (subtle gray)
- Muted: `#6B6B6B` (secondary text)

### Typography

- Headings: Lora (serif)
- Body: Inter (sans-serif)

## Future Enhancements (Phase 2)

- [ ] Push notifications for daily reminders
- [ ] Stripe integration for Pro subscriptions
- [ ] Print-on-demand ordering (Lulu/Printful)
- [ ] Cloud backup for PDFs
- [ ] Analytics dashboard

## License

MIT

---

Built with care for mindful reflection.
