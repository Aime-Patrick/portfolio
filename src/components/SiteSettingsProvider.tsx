import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
  siteTitle: 'Aime Patrick Ndagijimana - Portfolio',
  siteDescription: 'Software Engineer Portfolio',
  siteKeywords: 'software engineer, web development, react, portfolio',
  footerText: '© 2023 Aime Patrick Ndagijimana. All rights reserved.',
  enableChatbot: true,
  primaryColor: '#ff5d56',
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

export const SiteSettingsProvider: React.FC<SiteSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = doc(db, 'settings', 'site');
        const settingsSnapshot = await getDoc(settingsDoc);
        
        if (settingsSnapshot.exists()) {
          const data = settingsSnapshot.data() as SiteSettings;
          setSettings(data);
          
          // Apply settings to document
          document.title = data.siteTitle;
          
          // Update meta tags
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
          
          // Apply CSS variables for colors
          document.documentElement.style.setProperty('--first-color', data.primaryColor);
          document.documentElement.style.setProperty('--color-black', data.secondaryColor);
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