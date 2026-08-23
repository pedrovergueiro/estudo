'use client';

import React from 'react';
import useGameificationStore from '@/lib/gamification/store';

export function XpBar() {
  const { xp, getLevel, getXpForNextLevel } = useGameificationStore();

  const level = getLevel();
  const xpForNextLevel = getXpForNextLevel();
  const xpAtCurrentLevel = level === 1 ? xp : xp - (level - 1) * 500;
  const totalXpForLevel = 500;
  const progressPercent = (xpAtCurrentLevel / totalXpForLevel) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">⭐ Level {level}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">{xp} XP total</span>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{xpForNextLevel} até próximo level</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-300"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
    </div>
  );
}
