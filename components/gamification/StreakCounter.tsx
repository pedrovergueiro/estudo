'use client';

import React from 'react';
import useGameificationStore from '@/lib/gamification/store';

export function StreakCounter() {
  const { streak } = useGameificationStore();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Sequência: {streak.current} dias
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Recorde: {streak.longest} dias
          </div>
        </div>
      </div>
    </div>
  );
}
