import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
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

  // Get entry count
  const { count: entryCount } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-semibold text-[#2C2C2C]">
          Settings
        </h1>
        <p className="text-[#6B6B6B] mt-1">
          Manage your account and preferences
        </p>
      </header>

      <div className="space-y-6">
        <SettingsForm
          userId={user.id}
          email={user.email || ''}
          name={profile?.name || ''}
          subscriptionTier={profile?.subscription_tier || 'free'}
          entryCount={entryCount || 0}
        />
      </div>
    </div>
  );
}
