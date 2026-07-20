"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CACHE_KEYS, readCache, writeCache } from '@/lib/clientCache';

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  footerText: string;
  enableChatbot: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const defaultSettings: SiteSettings = {
  siteTitle: 'AimePatrick',
  siteDescription: 'Software Engineer Portfolio',
  siteKeywords: 'software engineer, web development, react, portfolio',
  footerText: '© 2025 NDAGIJIMANA Aime Patrick. All rights reserved.',
  enableChatbot: true,
  primaryColor: '#f44a00',
  secondaryColor: '#121212',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

interface SiteSettingsProviderProps {
  children: ReactNode;
}

const applySettingsSideEffects = (data: SiteSettings) => {
  document.title = data.siteTitle;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', data.siteDescription);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = data.siteDescription;
    document.head.appendChild(meta);
  }

  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta) {
    keywordsMeta.setAttribute('content', data.siteKeywords);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'keywords';
    meta.content = data.siteKeywords;
    document.head.appendChild(meta);
  }

  if (data.primaryColor) {
    // Portfolio accent only — do not overwrite shadcn --primary with a raw hex
    // (that can break admin/ui tokens and make public controls hard to see).
    document.documentElement.style.setProperty('--first-color', data.primaryColor);
  }
};

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCache<SiteSettings>(CACHE_KEYS.settings);
    if (cached) {
      setSettings(cached);
      applySettingsSideEffects(cached);
      setLoading(false);
    }

    const fetchSettings = async () => {
      try {
        // Defer Firebase off the initial JS graph so first paint stays light
        const [{ doc, getDoc }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../firebase'),
        ]);
        const settingsDoc = doc(db, 'settings', 'site');
        const settingsSnapshot = await getDoc(settingsDoc);

        if (settingsSnapshot.exists()) {
          const raw = settingsSnapshot.data() as Partial<SiteSettings>;
          const data = {
            ...defaultSettings,
            ...raw,
            // Coerce so missing/undefined never disables the assistant
            enableChatbot: raw.enableChatbot !== false,
          };
          setSettings(data);
          writeCache(CACHE_KEYS.settings, data);
          applySettingsSideEffects(data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsProvider;