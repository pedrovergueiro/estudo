import type { StateStorage } from 'zustand/middleware';

const localStorageImpl: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      const item = window.localStorage.getItem(name);
      return item;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(name, value);
    } catch {
      // Ignore quota exceeded errors in some browsers
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    } catch {
      // Ignore errors
    }
  },
};

export default localStorageImpl;
