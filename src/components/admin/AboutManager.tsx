import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaUser, FaGraduationCap, FaBriefcase, FaCode } from 'react-icons/fa';

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface AboutData {
  name: string;
  title: string;
  bio: string;
  experience: string;
  education: string;
  skills: string[];
  image: string;
  cloudinaryPublicId?: string;
}

const AboutManager: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData>({
    name: '',
    title: '',
    bio: '',
    experience: '',
    education: '',
    skills: [],
    image: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const aboutDoc = doc(db, 'about', 'main');
      const aboutSnapshot = await getDoc(aboutDoc);
      
      if (aboutSnapshot.exists()) {
        const data = aboutSnapshot.data() as AboutData;
        setAboutData(data);
        setImagePreview(data.image || '');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('Failed to load about data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAboutData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !aboutData.skills.includes(skillInput.trim())) {
      setAboutData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setAboutData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary is not configured');
      return;
    }
    
    try {
      setSaving(true);
      let imageUrl = aboutData.image;
      let cloudinaryPublicId = aboutData.cloudinaryPublicId;

      // Upload image if new file selected
      if (imageFile) {
        toast.loading('Uploading image...');
        
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'portfolio/about');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        imageUrl = data.secure_url;
        cloudinaryPublicId = data.public_id;
        
        toast.dismiss();
        toast.success('Image uploaded!');
      }

      // Save to Firestore
      const aboutDoc = doc(db, 'about', 'main');
      await setDoc(aboutDoc, {
        ...aboutData,
        image: imageUrl,
        cloudinaryPublicId,
      });

      toast.success('About section updated successfully!');
      setImageFile(null);
    } catch (error) {
      console.error('Error saving about data:', error);
      toast.dismiss();
      toast.error('Failed to save about data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[var(--first-color)] to-orange-600 rounded-xl flex items-center justify-center">
          <FaUser className="text-white text-2xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manage About Me</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal information and bio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaUser className="text-[var(--first-color)]" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={aboutData.name}
              onChange={handleInputChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
              placeholder="e.g., NDAGIJIMANA Aime Patrick"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaBriefcase className="text-[var(--first-color)]" />
              Professional Title *
            </label>
            <input
              type="text"
              name="title"
              value={aboutData.title}
              onChange={handleInputChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
              placeholder="e.g., Full Stack Developer"
              required
            />
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">Bio / Introduction *</label>
          <textarea
            name="bio"
            value={aboutData.bio}
            onChange={handleInputChange}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[120px] bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
            placeholder="Tell visitors about yourself, your passion, and what drives you..."
            required
          />
        </div>

        {/* Experience */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FaBriefcase className="text-[var(--first-color)]" />
            Experience *
          </label>
          <textarea
            name="experience"
            value={aboutData.experience}
            onChange={handleInputChange}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[100px] bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
            placeholder="Describe your professional experience, key roles, and achievements..."
            required
          />
        </div>

        {/* Education */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FaGraduationCap className="text-[var(--first-color)]" />
            Education *
          </label>
          <textarea
            name="education"
            value={aboutData.education}
            onChange={handleInputChange}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[100px] bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
            placeholder="List your educational background, degrees, and institutions..."
            required
          />
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FaCode className="text-[var(--first-color)]" />
            Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
              placeholder="Add a skill (e.g., React, TypeScript, Node.js)"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-6 py-3 rounded-lg bg-[var(--first-color)] text-white font-semibold hover:bg-orange-600 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {aboutData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Profile Image */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700 dark:text-gray-300">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-32 h-32 rounded-lg object-cover shadow-md"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save About Me'}
        </button>
      </form>
    </div>
  );
};

export default AboutManager;

