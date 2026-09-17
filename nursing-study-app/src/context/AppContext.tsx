import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { initDatabase } from '../db/database';
import { seedIfEmpty } from '../db/seed';
import { getSettings, setSetting } from '../db/queries';
import { AppSettings } from '../types';
import { getTheme, Theme } from '../theme/theme';

interface AppContextValue {
  ready: boolean;
  settings: AppSettings;
  theme: Theme;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  refreshCounter: number;
  bumpRefresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const FALLBACK_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 'medium',
  randomDomainFilter: 'all',
  passThreshold: 4,
  intervals: { box1: 1, box2: 3, box3: 7, box4: 14, box5: 30 },
  reminderEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await seedIfEmpty();
      const s = await getSettings();
      setSettings(s);
      setReady(true);
    })();
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      await setSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const bumpRefresh = useCallback(() => setRefreshCounter((c) => c + 1), []);

  const theme = getTheme(settings.theme);

  return (
    <AppContext.Provider value={{ ready, settings, theme, updateSetting, refreshCounter, bumpRefresh }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
