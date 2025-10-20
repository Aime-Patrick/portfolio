import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { toast } from 'react-hot-toast';

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  resumeUrl: string;
  skills: string[];
  experience: {
    years: string;
    description: string;
  };
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
}

const ProfileManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    profileImage: '',
    resumeUrl: '',
    skills: [],
    experience: {
      years: '',
      description: '',
    },
    education: [{
      degree: '',
      institution: '',
      year: '',
    }],
    socialLinks: [
      { platform: 'github', url: '' },
      { platform: 'linkedin', url: '' },
      { platform: 'twitter', url: '' },
    ],
  });
  const [newSkill, setNewSkill] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profileDoc = await getDoc(doc(db, 'profile', 'main'));
      
      if (profileDoc.exists()) {
        setProfileData(profileDoc.data() as ProfileData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        [name]: value,
      },
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updatedEducation = [...profileData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setProfileData(prev => ({
      ...prev,
      education: updatedEducation,
    }));
  };

  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', year: '' },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    if (profileData.education.length > 1) {
      const updatedEducation = [...profileData.education];
      updatedEducation.splice(index, 1);
      setProfileData(prev => ({
        ...prev,
        education: updatedEducation,
      }));
    } else {
      toast.error('You must have at least one education entry');
    }
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const updatedLinks = [...profileData.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setProfileData(prev => ({
      ...prev,
      socialLinks: updatedLinks,
    }));
  };

  const addSocialLink = () => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: '', url: '' },
      ],
    }));
  };

  const removeSocialLink = (index: number) => {
    if (profileData.socialLinks.length > 1) {
      const updatedLinks = [...profileData.socialLinks];
      updatedLinks.splice(index, 1);
      setProfileData(prev => ({
        ...prev,
        socialLinks: updatedLinks,
      }));
    } else {
      toast.error('You must have at least one social link');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      let updatedProfileData = { ...profileData };

      // Handle profile image upload
      if (profileImageFile) {
        const storageRef = ref(storage, `profile/profile-image`);
        await uploadBytes(storageRef, profileImageFile);
        updatedProfileData.profileImage = await getDownloadURL(storageRef);
      }

      // Handle resume upload
      if (resumeFile) {
        const storageRef = ref(storage, `profile/resume`);
        await uploadBytes(storageRef, resumeFile);
        updatedProfileData.resumeUrl = await getDownloadURL(storageRef);
      }

      // Save to Firestore
      await setDoc(doc(db, 'profile', 'main'), updatedProfileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading profile data...</p>
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
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Profile Manager</h2>
            <p className="text-gray-300 text-sm mt-1">Manage your personal information and credentials</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 p-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              Personal Information
            </h4>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Title</label>
              <input
                type="text"
                name="title"
                value={profileData.title}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                required
                placeholder="e.g., Full Stack Developer"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[100px]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>
          
          {/* Profile Image & Resume */}
          <div className="flex flex-col gap-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                </svg>
              </div>
              Media
            </h4>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white file:font-semibold hover:file:from-orange-600 hover:file:to-red-600 transition-all"
              />
              {profileData.profileImage && (
                <div className="mt-2 p-3 bg-black/30 rounded-xl border border-orange-500/20">
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-500/30"
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Resume</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white file:font-semibold hover:file:from-orange-600 hover:file:to-red-600 transition-all"
              />
              {profileData.resumeUrl && (
                <div className="mt-2">
                  <a
                    href={profileData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 flex items-center gap-2 transition-colors"
                  >
                    View Current Resume
                  </a>
                </div>
              )}
            </div>
            
            {/* Experience */}
            <h4 className="text-lg font-semibold mt-4 text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                </svg>
              </div>
              Experience
            </h4>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Years of Experience</label>
              <input
                type="text"
                name="years"
                value={profileData.experience.years}
                onChange={handleExperienceChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., 5+"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Experience Description</label>
              <textarea
                name="description"
                value={profileData.experience.description}
                onChange={handleExperienceChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[100px]"
                placeholder="Brief description of your experience"
              />
            </div>
          </div>
        </div>
        
        {/* Skills */}
        <div className="mt-4 p-6 bg-black/30 rounded-xl border-2 border-orange-500/30">
          <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z"/><path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd"/>
              </svg>
            </div>
            Skills
          </h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full flex items-center gap-2 text-gray-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-red-400 hover:text-red-300 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 flex-1 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Education */}
        <div className="mt-4 p-6 bg-black/30 rounded-xl border-2 border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              Education
            </h4>
            <button
              type="button"
              onClick={addEducation}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Add Education
            </button>
          </div>
          
          {profileData.education.map((edu, index) => (
            <div key={index} className="bg-black/50 border-2 border-orange-500/20 p-4 rounded-xl mb-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium text-white">Education #{index + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-300">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-300">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                    placeholder="e.g., University of Example"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-300">Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                    placeholder="e.g., 2020"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Social Links */}
        <div className="mt-4 p-6 bg-black/30 rounded-xl border-2 border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                </svg>
              </div>
              Social Links
            </h4>
            <button
              type="button"
              onClick={addSocialLink}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Add Link
            </button>
          </div>
          
          {profileData.socialLinks.map((link, index) => (
            <div key={index} className="bg-black/50 border-2 border-orange-500/20 p-4 rounded-xl mb-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium text-white">Social Link #{index + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-300">Platform</label>
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                    className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                    placeholder="e.g., github, linkedin, twitter"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-300">URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-6 border-t border-orange-500/30">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Profile...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                </svg>
                Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default ProfileManager;