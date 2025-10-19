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
          image: imageUrl,
          cloudinaryPublicId,
        });
        toast.success('Project updated successfully');
      } else {
        // Add new project
        await addDoc(collection(db, 'projects'), {
          ...projectData,
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
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={currentProject.title}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={currentProject.subtitle}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={currentProject.description}
              onChange={handleInputChange}
              className="border rounded-lg p-2 min-h-[100px]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Project Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded-lg p-2"
              {...(!isEditing && { required: true })}
            />
            {currentProject.image && (
              <div className="mt-2">
                <img
                  src={currentProject.image}
                  alt="Project preview"
                  className="w-40 h-auto rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <label className="font-medium">Links</label>
            {currentProject.links.map((link, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm">Label</label>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                    className="border rounded-lg p-2"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm">URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    className="border rounded-lg p-2"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-[var(--color-black)] text-white px-6 py-2 rounded-lg hover:bg-[var(--first-color)] transition"
            >
              {isEditing ? 'Update Project' : 'Add Project'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4">Manage Projects</h3>
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found. Add your first project above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="h-40 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg">{project.title}</h4>
                  <p className="text-sm text-gray-500">{project.subtitle}</p>
                  <p className="text-sm mt-2 line-clamp-2">{project.description}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(project)}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                      aria-label="Edit project"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      aria-label="Delete project"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsManager;