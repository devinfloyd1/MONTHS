'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SettingsFormProps {
  userId: string;
  email: string;
  name: string;
  subscriptionTier: 'free' | 'pro';
  entryCount: number;
}

export default function SettingsForm({
  userId,
  email,
  name: initialName,
  subscriptionTier,
  entryCount,
}: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', userId);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="p-6 border-b border-[#E8E6E3]">
          <h2 className="text-lg font-serif font-semibold text-[#2C2C2C]">
            Profile
          </h2>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Your name will appear on your monthly book covers
          </p>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={email}
            disabled
            className="opacity-60"
          />

          {message && (
            <p className={`text-sm px-3 py-2 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}>
              {message.text}
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="p-6 border-b border-[#E8E6E3]">
          <h2 className="text-lg font-serif font-semibold text-[#2C2C2C]">
            Your Journey
          </h2>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-[#FEFDFB] rounded-xl">
            <div className="text-3xl font-serif font-bold text-[#8B7355]">
              {entryCount}
            </div>
            <div className="text-sm text-[#6B6B6B] mt-1">
              Journal {entryCount === 1 ? 'Entry' : 'Entries'}
            </div>
          </div>
          <div className="text-center p-4 bg-[#FEFDFB] rounded-xl">
            <div className="text-3xl font-serif font-bold text-[#8B7355]">
              {entryCount * 3}
            </div>
            <div className="text-sm text-[#6B6B6B] mt-1">
              Questions Answered
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="p-6 border-b border-[#E8E6E3]">
          <h2 className="text-lg font-serif font-semibold text-[#2C2C2C]">
            Subscription
          </h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                subscriptionTier === 'pro'
                  ? 'bg-[#8B7355]/10 text-[#8B7355]'
                  : 'bg-[#E8E6E3] text-[#6B6B6B]'
              }`}>
                {subscriptionTier === 'pro' ? 'Pro' : 'Free'}
              </span>
              <p className="text-sm text-[#6B6B6B] mt-2">
                {subscriptionTier === 'pro'
                  ? 'Full access to PDF downloads and cloud backup'
                  : 'Upgrade for PDF downloads and cloud backup'}
              </p>
            </div>
            {subscriptionTier === 'free' && (
              <Button variant="secondary" disabled>
                Upgrade (Coming Soon)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-semibold text-[#2C2C2C]">
              Sign Out
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">
              Sign out of your account
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
