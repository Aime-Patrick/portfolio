import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

// Cloudinary configuration for image uploads
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface Project {
  id: string;
  image: string;
  subtitle: string;
  title: string;
  description: string;
  links: { url: string; label: string }[];
  imageFile?: File;
  cloudinaryPublicId?: string; // Store Cloudinary public_id for potential future use
}

const ProjectsManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '',
    image: '',
    subtitle: '',
    title: '',
    description: '',
    links: [{ url: '', label: 'GitHub' }, { url: '', label: 'Live' }],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsCollection = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsCollection);
      const projectsList = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index: number, field: 'url' | 'label', value: string) => {
    const updatedLinks = [...currentProject.links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setCurrentProject(prev => ({ ...prev, links: updatedLinks }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentProject(prev => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const resetForm = () => {
    setCurrentProject({
      id: '',
      image: '',
      subtitle: '',
      title: '',
      description: '',
      links: [{ url: '', label: 'GitHub' }, { url: '', label: 'Live' }],
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Cloudinary is configured
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file');
      return;
    }
    
    try {
      const { id, imageFile, image, ...projectData } = currentProject;
      
      // Filter out empty links (optional GitHub/Live links)
      const validLinks = currentProject.links.filter(link => link.url.trim() !== '');
      
      let imageUrl = image;
      let cloudinaryPublicId = currentProject.cloudinaryPublicId;

      // Handle image upload if there's a new file
      if (imageFile) {
        toast.loading('Uploading image to Cloudinary...');
        
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'portfolio/projects'); // Organize in Cloudinary

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        imageUrl = data.secure_url; // Get secure HTTPS URL
        cloudinaryPublicId = data.public_id; // Store for potential future use
        
        toast.dismiss();
        toast.success('Image uploaded successfully!');
      }

      if (isEditing) {
        // Update existing project
        const projectRef = doc(db, 'projects', id);
        await updateDoc(projectRef, {
          ...projectData,
          links: validLinks,
          image: imageUrl,
          cloudinaryPublicId,
        });
        toast.success('Project updated successfully');
      } else {
        // Add new project
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          links: validLinks,
          image: imageUrl,
          cloudinaryPublicId,
        });
        toast.success('Project added successfully');
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.dismiss();
      toast.error('Failed to save project. Check console for details.');
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
  };

  const handleDelete = async (project: Project) => {
    if (window.confirm('Are you sure you want to delete this project? Note: The image will remain in Cloudinary.')) {
      try {
        // Delete document from Firestore
        await deleteDoc(doc(db, 'projects', project.id));

        // Note: Cloudinary image deletion requires authenticated API calls
        // which need a backend server. The image will remain in Cloudinary
        // but won't be referenced in your portfolio.
        // You can manually delete unused images from Cloudinary dashboard.

        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Projects Manager</h2>
            <p className="text-gray-300 text-sm mt-1">Manage your portfolio projects</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 overflow-hidden animate-slideUp" style={{ animationDelay: '100ms' }}>
        <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            {isEditing ? 'Edit Project' : 'Add New Project'}
          </h3>
        </div>
        <div className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Title</label>
              <input
                type="text"
                name="title"
                value={currentProject.title}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Enter project title"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={currentProject.subtitle}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Enter project category"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Description</label>
            <textarea
              name="description"
              value={currentProject.description}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[120px]"
              placeholder="Describe your project..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Project Image</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white file:font-semibold hover:file:from-orange-600 hover:file:to-red-600 transition-all w-full"
                {...(!isEditing && { required: true })}
              />
            </div>
            {currentProject.image && (
              <div className="mt-4 p-4 bg-black/30 rounded-xl border border-orange-500/20">
                <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
                <img
                  src={currentProject.image}
                  alt="Project preview"
                  className="w-full max-w-xs h-auto rounded-lg shadow-md border-2 border-orange-500/20"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 p-6 bg-black/30 rounded-xl border-2 border-orange-500/30">
            <label className="font-semibold text-white text-sm flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                </svg>
              </div>
              Project Links
            </label>
            <div className="space-y-4">
              {currentProject.links.map((link, index) => (
                <div key={index} className="p-4 bg-black/50 rounded-xl border-2 border-orange-500/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-300">
                        Label <span className="text-gray-500 text-xs">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                        className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2.5 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                        placeholder="e.g., GitHub, Live Demo"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-300">
                        URL <span className="text-gray-500 text-xs">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        className="bg-black/50 border-2 border-orange-500/20 rounded-lg p-2.5 text-white placeholder-gray-500 focus:border-orange-500 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t border-orange-500/30">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-[1.02]"
            >
              {isEditing ? '✓ Update Project' : '+ Add Project'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 overflow-hidden animate-slideUp" style={{ animationDelay: '200ms' }}>
        <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
            </svg>
            Your Projects ({projects.length})
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading projects...</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <p className="text-gray-300 text-lg font-medium">No projects yet</p>
              <p className="text-gray-500 text-sm mt-2">Add your first project using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="group relative bg-black/50 border-2 border-orange-500/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-orange-500/60 transition-all duration-300 hover:scale-[1.02]">
                  <div className="h-48 overflow-hidden bg-black/30">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-orange-400 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                        {project.subtitle}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-white mb-2 line-clamp-1">{project.title}</h4>
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">{project.description}</p>
                    <div className="flex gap-2 pt-4 border-t border-orange-500/20">
                      <button
                        onClick={() => handleEdit(project)}
                        className="flex-1 bg-orange-500/20 text-orange-400 p-2.5 rounded-xl hover:bg-orange-500/30 border border-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        aria-label="Edit project"
                      >
                        <FaEdit />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="flex-1 bg-red-500/20 text-red-400 p-2.5 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        aria-label="Delete project"
                      >
                        <FaTrash />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsManager;