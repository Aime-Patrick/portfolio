import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  footerText: string;
  enableChatbot: boolean;
  primaryColor: string;
  secondaryColor: string;
}

const SiteSettingsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: '{{ NAP }}',
    siteDescription: 'Software Engineer Portfolio',
    siteKeywords: 'software engineer, web development, react, portfolio',
    footerText: '© 2023 Aime Patrick Ndagijimana. All rights reserved.',
    enableChatbot: true,
    primaryColor: '#ff5d56',
    secondaryColor: '#121212',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settingsDoc = doc(db, 'settings', 'site');
        const settingsSnapshot = await getDoc(settingsDoc);
        
        if (settingsSnapshot.exists()) {
          const data = settingsSnapshot.data() as SiteSettings;
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
        toast.error('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsDoc = doc(db, 'settings', 'site');
      await setDoc(settingsDoc, settings);
      toast.success('Site settings updated successfully');
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast.error('Failed to update site settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--first-color)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Site Title */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Site Title</label>
            <input
              type="text"
              name="siteTitle"
              value={settings.siteTitle}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          
          {/* Site Description */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Site Description</label>
            <input
              type="text"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          
          {/* Site Keywords */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Site Keywords</label>
            <input
              type="text"
              name="siteKeywords"
              value={settings.siteKeywords}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
              placeholder="Comma separated keywords"
            />
          </div>
          
          {/* Footer Text */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Footer Text</label>
            <input
              type="text"
              name="footerText"
              value={settings.footerText}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2"
            />
          </div>
          
          {/* Primary Color */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleInputChange}
                className="w-10 h-10 border-0"
              />
              <input
                type="text"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 flex-1"
              />
            </div>
          </div>
          
          {/* Secondary Color */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleInputChange}
                className="w-10 h-10 border-0"
              />
              <input
                type="text"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 flex-1"
              />
            </div>
          </div>
        </div>
        
        {/* Enable Chatbot */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enableChatbot"
            id="enableChatbot"
            checked={settings.enableChatbot}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <label htmlFor="enableChatbot" className="font-medium">Enable Chatbot</label>
        </div>
        
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-[var(--first-color)] text-white py-2 px-4 rounded-md hover:bg-[var(--first-color-alt)] transition-colors"
        >
          <FaSave />
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default SiteSettingsManager;