import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaHome, FaImage, FaLink, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import ConfirmationDialog from '../ConfirmationDialog';

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface HomeData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  cloudinaryPublicId?: string;
  typeAnimationSequence?: (string | number)[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

const HomeManager: React.FC = () => {
  const [homeData, setHomeData] = useState<HomeData>({
    name: '',
    title: '',
    bio: '',
    profileImage: '',
    typeAnimationSequence: ['I am Aime Patrick Ndagijimana', 3000, 'Full Stack & AI Solutions Engineer', 3000, 'Software Engineer', 3000, 'AI Agent Developer', 3000, 'AI Engineer', 3000],
    socialLinks: [
      { platform: 'instagram', url: '' },
      { platform: 'linkedin', url: '' },
      { platform: 'github', url: '' },
    ],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageInputRef, setImageInputRef] = useState<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newAnimationText, setNewAnimationText] = useState('');
  const [newAnimationDuration, setNewAnimationDuration] = useState('3000');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const profileDoc = doc(db, 'profile', 'main');
      const profileSnapshot = await getDoc(profileDoc);
      
      if (profileSnapshot.exists()) {
        const data = profileSnapshot.data();
        const homeDataUpdate: HomeData = {
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          profileImage: data.profileImage || '',
          typeAnimationSequence: data.typeAnimationSequence || ['I am Aime Patrick Ndagijimana', 3000, 'Full Stack & AI Solutions Engineer', 3000, 'Software Engineer', 3000, 'AI Agent Developer', 3000, 'AI Engineer', 3000],
          socialLinks: data.socialLinks || [
            { platform: 'instagram', url: '' },
            { platform: 'linkedin', url: '' },
            { platform: 'github', url: '' },
          ],
        };
        // Only include cloudinaryPublicId if it exists
        if (data.cloudinaryPublicId) {
          homeDataUpdate.cloudinaryPublicId = data.cloudinaryPublicId;
        }
        setHomeData(homeDataUpdate);
        setImagePreview(data.profileImage || '');
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHomeData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 20 * 1024 * 1024; // 20 MB
      
      if (file.size > maxSize) {
        toast.error(`File size too large. Maximum size is 20 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview('');
    setHomeData(prev => {
      const { cloudinaryPublicId, ...rest } = prev;
      return {
        ...rest,
        profileImage: '',
      };
    });
    toast.success('Image removed!');
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setHomeData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link =>
        link.platform === platform ? { ...link, url } : link
      ),
    }));
  };

  const addAnimationItem = () => {
    if (newAnimationText.trim()) {
      const duration = parseInt(newAnimationDuration) || 3000;
      setHomeData(prev => ({
        ...prev,
        typeAnimationSequence: [
          ...(prev.typeAnimationSequence || []),
          newAnimationText.trim(),
          duration,
        ],
      }));
      setNewAnimationText('');
      setNewAnimationDuration('3000');
    }
  };

  const removeAnimationItem = (originalIndex: number) => {
    setHomeData(prev => {
      const newSequence = [...(prev.typeAnimationSequence || [])];
      // Find the actual index in the sequence (originalIndex is the index in animationItems array)
      const actualIndex = originalIndex * 2;
      // Remove both text and duration
      newSequence.splice(actualIndex, 2);
      return {
        ...prev,
        typeAnimationSequence: newSequence,
      };
    });
    toast.success('Animation item removed!');
  };

  const updateAnimationItem = (originalIndex: number, text: string, duration: number) => {
    setHomeData(prev => {
      const newSequence = [...(prev.typeAnimationSequence || [])];
      // originalIndex is the index in animationItems array, multiply by 2 to get actual sequence index
      const actualIndex = originalIndex * 2;
      newSequence[actualIndex] = text;
      newSequence[actualIndex + 1] = duration;
      return {
        ...prev,
        typeAnimationSequence: newSequence,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary is not configured');
      return;
    }
    
    try {
      setSaving(true);
      let imageUrl = homeData.profileImage;
      let cloudinaryPublicId = homeData.cloudinaryPublicId;

      // Upload image if new file selected
      if (imageFile) {
        toast.loading('Uploading image...');
        
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'portfolio/home');
        formData.append('max_file_size', '20971520'); // 20 MB in bytes

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData?.error?.message || 'Failed to upload image';
          throw new Error(errorMessage);
        }

        const data = await response.json();
        imageUrl = data.secure_url;
        cloudinaryPublicId = data.public_id;
        
        toast.dismiss();
        toast.success('Image uploaded!');
      }

      // Save to Firestore
      const profileDoc = doc(db, 'profile', 'main');
      // Exclude cloudinaryPublicId from spread to avoid undefined values
      const { cloudinaryPublicId: _, ...homeDataWithoutCloudinaryId } = homeData;
      const dataToSave: any = {
        ...homeDataWithoutCloudinaryId,
        profileImage: imageUrl,
      };
      // Only include cloudinaryPublicId if it has a value
      if (cloudinaryPublicId) {
        dataToSave.cloudinaryPublicId = cloudinaryPublicId;
      }
      await setDoc(profileDoc, dataToSave, { merge: true });

      toast.success('Home section updated successfully!');
      setImageFile(null);
    } catch (error: any) {
      console.error('Error saving home data:', error);
      toast.dismiss();
      const errorMessage = error?.message || 'Failed to save home data';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading home data...</p>
        </div>
      </div>
    );
  }

  // Parse animation sequence: [text1, duration1, text2, duration2, ...]
  const animationItems: Array<{ text: string; duration: number; originalIndex: number }> = [];
  const sequence = homeData.typeAnimationSequence || [];
  for (let i = 0; i < sequence.length; i += 2) {
    if (i + 1 < sequence.length && typeof sequence[i] === 'string' && typeof sequence[i + 1] === 'number') {
      animationItems.push({
        text: sequence[i] as string,
        duration: sequence[i + 1] as number,
        originalIndex: i,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FaHome className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Home Section Manager</h2>
            <p className="text-gray-300 text-sm mt-1">Manage your home page content and hero section</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 rounded-2xl shadow-xl border-2 border-orange-500/30 animate-slideUp" style={{ animationDelay: '100ms' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
                <FaHome className="text-orange-400" />
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={homeData.name}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., Aime Patrick Ndagijimana"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
                <FaHome className="text-orange-400" />
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={homeData.title}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Bio / Description *</label>
            <textarea
              name="bio"
              value={homeData.bio}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 min-h-[100px] text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Brief description for the home section..."
              required
            />
          </div>

          {/* TypeAnimation Sequence */}
          <div className="flex flex-col gap-4">
            <label className="font-medium text-gray-300 text-sm">Animated Titles (TypeAnimation Sequence)</label>
            <div className="p-4 bg-black/30 rounded-xl border-2 border-orange-500/30">
              <div className="space-y-3">
                {animationItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-black/50 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateAnimationItem(idx, e.target.value, item.duration)}
                        className="bg-black/50 border border-orange-500/30 rounded-lg p-2 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                        placeholder="Animation text"
                      />
                      <input
                        type="number"
                        value={item.duration}
                        onChange={(e) => updateAnimationItem(idx, item.text, parseInt(e.target.value) || 3000)}
                        className="bg-black/50 border border-orange-500/30 rounded-lg p-2 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                        placeholder="Duration (ms)"
                        min="1000"
                        step="1000"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAnimationItem(idx)}
                      className="p-2 bg-red-500/30 hover:bg-red-500/50 text-red-300 hover:text-white rounded-lg transition-all"
                      aria-label="Remove animation item"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newAnimationText}
                  onChange={(e) => setNewAnimationText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAnimationItem())}
                  className="flex-1 bg-black/50 border-2 border-orange-500/30 rounded-xl p-2 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="New animation text"
                />
                <input
                  type="number"
                  value={newAnimationDuration}
                  onChange={(e) => setNewAnimationDuration(e.target.value)}
                  className="w-24 bg-black/50 border-2 border-orange-500/30 rounded-xl p-2 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Duration"
                  min="1000"
                  step="1000"
                />
                <button
                  type="button"
                  onClick={addAnimationItem}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
                >
                  <FaPlus className="text-xs" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-4">
            <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
              <FaLink className="text-orange-400" />
              Social Links
            </label>
            <div className="space-y-3">
              {homeData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-300 capitalize">{link.platform}:</span>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(link.platform, e.target.value)}
                    className="flex-1 bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    placeholder={`https://${link.platform}.com/your-profile`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
              <FaImage className="text-orange-400" />
              Profile Image
            </label>
            <div className="relative">
              <input
                ref={(input) => setImageInputRef(input)}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-gray-300 border-2 border-orange-500/30 rounded-xl cursor-pointer bg-black/50 focus:outline-none file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white hover:file:from-orange-600 hover:file:to-red-600 file:transition-all"
              />
            </div>
            {(imagePreview || homeData.profileImage) && (
              <div className="mt-4 p-4 bg-black/30 rounded-xl border border-orange-500/20 relative group">
                <img
                  src={imagePreview || homeData.profileImage}
                  alt="Profile preview"
                  onClick={() => imageInputRef?.click()}
                  className="w-40 h-40 rounded-2xl object-cover shadow-lg border-4 border-orange-500/30 cursor-pointer hover:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="absolute top-6 right-6 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  aria-label="Delete image"
                >
                  <FaTrash className="text-sm" />
                </button>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 px-3 py-1 rounded-lg text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Click image to change
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              'Save Home Section'
            )}
          </button>
        </form>
      </div>

      {/* Delete Image Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete the current image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default HomeManager;

