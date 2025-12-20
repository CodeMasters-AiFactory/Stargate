/**
 * Settings Screen
 * Account settings and preferences
 */

import React from 'react';
import { AccountSettings } from '@/pages/AccountSettings';
import { BackButton } from './BackButton';

export function SettingsScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-y-auto" data-testid="settings-screen">
      <div className="w-full px-8 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Account Settings Component */}
        <AccountSettings />
      </div>
    </div>
  );
}

