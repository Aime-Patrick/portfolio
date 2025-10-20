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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Site Settings</h2>
            <p className="text-gray-300 text-sm mt-1">Configure your portfolio site preferences</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 p-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEO Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-orange-500/30">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">SEO Settings</h4>
                <p className="text-sm text-gray-400">Configure meta information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-300 text-sm">Site Title</label>
                <input
                  type="text"
                  name="siteTitle"
                  value={settings.siteTitle}
                  onChange={handleInputChange}
                  className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Your portfolio title"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-300 text-sm">Site Description</label>
                <input
                  type="text"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                  className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Brief site description"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-medium text-gray-300 text-sm">Site Keywords</label>
                <input
                  type="text"
                  name="siteKeywords"
                  value={settings.siteKeywords}
                  onChange={handleInputChange}
                  className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Comma separated keywords"
                />
                <p className="text-xs text-gray-500">Separate keywords with commas (e.g., developer, portfolio, react)</p>
              </div>
              
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-medium text-gray-300 text-sm">Footer Text</label>
                <input
                  type="text"
                  name="footerText"
                  value={settings.footerText}
                  onChange={handleInputChange}
                  className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="© 2024 Your Name. All rights reserved."
                />
              </div>
            </div>
          </div>


          {/* Appearance Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-orange-500/30">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Theme Colors</h4>
                <p className="text-sm text-gray-400">Customize your brand colors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-300 text-sm">Primary Color</label>
                <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border-2 border-orange-500/30">
                  <input
                    type="color"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                    className="w-16 h-16 rounded-lg border-2 border-orange-500/30 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                    className="bg-black/50 border-2 border-orange-500/30 rounded-lg p-2 flex-1 text-white"
                    placeholder="#ff5d56"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-300 text-sm">Secondary Color</label>
                <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border-2 border-orange-500/30">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleInputChange}
                    className="w-16 h-16 rounded-lg border-2 border-orange-500/30 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleInputChange}
                    className="bg-black/50 border-2 border-orange-500/30 rounded-lg p-2 flex-1 text-white"
                    placeholder="#121212"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-orange-500/30">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Features</h4>
                <p className="text-sm text-gray-400">Enable or disable site features</p>
              </div>
            </div>

            <div className="p-6 bg-black/30 rounded-xl border-2 border-orange-500/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableChatbot"
                  id="enableChatbot"
                  checked={settings.enableChatbot}
                  onChange={handleInputChange}
                  className="w-6 h-6 rounded-lg border-2 border-orange-500/30 text-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-black/50"
                />
                <div className="flex-1">
                  <span className="font-semibold text-white block">Enable AI Chatbot</span>
                  <span className="text-sm text-gray-400">Allow visitors to interact with your AI assistant</span>
                </div>
              </label>
            </div>
          </div>
        
          <div className="pt-6 border-t border-orange-500/30">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <FaSave className="text-xl" />
              Save All Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettingsManager;