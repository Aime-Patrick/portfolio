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
    return <div>Loading profile data...</div>;
  }

  return (
    <div className="!bg-white !p-6 !rounded-xl !shadow-md">
      <h3 className="!text-xl !font-bold !mb-6">Manage Profile</h3>
      <form onSubmit={handleSubmit} className="!flex !flex-col !gap-6">
        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
          {/* Personal Information */}
          <div className="!flex !flex-col !gap-4">
            <h4 className="!text-lg !font-semibold">Personal Information</h4>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className="!border !rounded-lg !p-2"
                required
              />
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={profileData.title}
                onChange={handleInputChange}
                className="!border !rounded-lg !p-2"
                required
                placeholder="e.g., Full Stack Developer"
              />
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                className="!border !rounded-lg !p-2 !min-h-[100px]"
                required
              />
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="!border !rounded-lg !p-2"
                required
              />
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="!border !rounded-lg !p-2"
              />
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                className="!border !rounded-lg !p-2"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>
          
          {/* Profile Image & Resume */}
          <div className="!flex !flex-col !gap-4">
            <h4 className="!text-lg !font-semibold">Media</h4>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="!border !rounded-lg !p-2"
              />
              {profileData.profileImage && (
                <div className="!mt-2">
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="!w-32 !h-32 !rounded-full !object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Resume</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="!border !rounded-lg !p-2"
              />
              {profileData.resumeUrl && (
                <div className="!mt-2">
                  <a
                    href={profileData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!text-blue-500 hover:!underline flex items-center gap-2"
                  >
                    View Current Resume
                  </a>
                </div>
              )}
            </div>
            
            {/* Experience */}
            <h4 className="!text-lg !font-semibold !mt-4">Experience</h4>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Years of Experience</label>
              <input
                type="text"
                name="years"
                value={profileData.experience.years}
                onChange={handleExperienceChange}
                className="!border !rounded-lg !p-2"
                placeholder="e.g., 5+"
              />
            </div>
            
            <div className="!flex !flex-col !gap-2">
              <label className="!font-medium">Experience Description</label>
              <textarea
                name="description"
                value={profileData.experience.description}
                onChange={handleExperienceChange}
                className="!border !rounded-lg !p-2 !min-h-[100px]"
                placeholder="Brief description of your experience"
              />
            </div>
          </div>
        </div>
        
        {/* Skills */}
        <div className="!mt-4">
          <h4 className="!text-lg !font-semibold !mb-4">Skills</h4>
          <div className="flex flex-wrap gap-2 !mb-4">
            {profileData.skills.map((skill, index) => (
              <div
                key={index}
                className="!bg-gray-100 !px-3 !py-1 !rounded-full flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="!text-red-500 !text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="!flex !gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="!border !rounded-lg !p-2 flex-1"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="!bg-[var(--color-black)] !text-white !px-4 !py-2 !rounded-lg hover:!bg-[var(--first-color)] transition"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Education */}
        <div className="!mt-4">
          <div className="flex items-center justify-between !mb-4">
            <h4 className="!text-lg !font-semibold">Education</h4>
            <button
              type="button"
              onClick={addEducation}
              className="!bg-[var(--color-black)] !text-white !px-4 !py-2 !rounded-lg hover:!bg-[var(--first-color)] transition"
            >
              Add Education
            </button>
          </div>
          
          {profileData.education.map((edu, index) => (
            <div key={index} className="!border !p-4 !rounded-lg !mb-4">
              <div className="flex justify-between items-center !mb-2">
                <h5 className="!font-medium">Education #{index + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="!text-red-500"
                >
                  Remove
                </button>
              </div>
              <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
                <div className="!flex !flex-col !gap-2">
                  <label className="!text-sm">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="!border !rounded-lg !p-2"
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>
                <div className="!flex !flex-col !gap-2">
                  <label className="!text-sm">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="!border !rounded-lg !p-2"
                    placeholder="e.g., University of Example"
                    required
                  />
                </div>
                <div className="!flex !flex-col !gap-2">
                  <label className="!text-sm">Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    className="!border !rounded-lg !p-2"
                    placeholder="e.g., 2020"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Social Links */}
        <div className="!mt-4">
          <div className="flex items-center justify-between !mb-4">
            <h4 className="!text-lg !font-semibold">Social Links</h4>
            <button
              type="button"
              onClick={addSocialLink}
              className="!bg-[var(--color-black)] !text-white !px-4 !py-2 !rounded-lg hover:!bg-[var(--first-color)] transition"
            >
              Add Link
            </button>
          </div>
          
          {profileData.socialLinks.map((link, index) => (
            <div key={index} className="!border !p-4 !rounded-lg !mb-4">
              <div className="flex justify-between items-center !mb-2">
                <h5 className="!font-medium">Social Link #{index + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="!text-red-500"
                >
                  Remove
                </button>
              </div>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                <div className="!flex !flex-col !gap-2">
                  <label className="!text-sm">Platform</label>
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                    className="!border !rounded-lg !p-2"
                    placeholder="e.g., github, linkedin, twitter"
                    required
                  />
                </div>
                <div className="!flex !flex-col !gap-2">
                  <label className="!text-sm">URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    className="!border !rounded-lg !p-2"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className="!bg-[var(--color-black)] !text-white !px-6 !py-3 !rounded-lg hover:!bg-[var(--first-color)] transition disabled:!opacity-50 !mt-6"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileManager;