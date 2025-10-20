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
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading about data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FaUser className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Manage About Me</h2>
            <p className="text-gray-300 text-sm mt-1">Update your personal information and bio</p>
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
                <FaUser className="text-orange-400" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={aboutData.name}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., NDAGIJIMANA Aime Patrick"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
                <FaBriefcase className="text-orange-400" />
                Professional Title *
              </label>
              <input
                type="text"
                name="title"
                value={aboutData.title}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Bio / Introduction *</label>
            <textarea
              name="bio"
              value={aboutData.bio}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 min-h-[120px] text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Tell visitors about yourself, your passion, and what drives you..."
              required
            />
          </div>

          {/* Experience */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
              <FaBriefcase className="text-orange-400" />
              Experience *
            </label>
            <textarea
              name="experience"
              value={aboutData.experience}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 min-h-[100px] text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Describe your professional experience, key roles, and achievements..."
              required
            />
          </div>

          {/* Education */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
              <FaGraduationCap className="text-orange-400" />
              Education *
            </label>
            <textarea
              name="education"
              value={aboutData.education}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 min-h-[100px] text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="List your educational background, degrees, and institutions..."
              required
            />
          </div>

          {/* Skills */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm flex items-center gap-2">
              <FaCode className="text-orange-400" />
              Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Add a skill (e.g., React, TypeScript, Node.js)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {aboutData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium border border-orange-500/30"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-red-400 hover:text-red-300 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Profile Image</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-gray-300 border-2 border-orange-500/30 rounded-xl cursor-pointer bg-black/50 focus:outline-none file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white hover:file:from-orange-600 hover:file:to-red-600 file:transition-all"
              />
            </div>
            {imagePreview && (
              <div className="mt-4 p-4 bg-black/30 rounded-xl border border-orange-500/20">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-40 h-40 rounded-2xl object-cover shadow-lg border-4 border-orange-500/30"
                />
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
              'Save About Me'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AboutManager;

