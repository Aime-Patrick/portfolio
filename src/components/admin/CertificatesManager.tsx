import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaAward, FaExternalLinkAlt } from 'react-icons/fa';

// Cloudinary configuration for image uploads
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  credentialUrl?: string;
  cloudinaryPublicId?: string;
  imageFile?: File;
}

const CertificatesManager: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<Certificate>({
    id: '',
    title: '',
    issuer: '',
    date: '',
    description: '',
    image: '',
    credentialUrl: '',
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const certificatesCollection = collection(db, 'certificates');
      const certificatesSnapshot = await getDocs(certificatesCollection);
      const certificatesList = certificatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Certificate[];
      
      // Sort by date (newest first)
      certificatesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setCertificates(certificatesList);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCertificate(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentCertificate(prev => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  };

  const resetForm = () => {
    setCurrentCertificate({
      id: '',
      title: '',
      issuer: '',
      date: '',
      description: '',
      image: '',
      credentialUrl: '',
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Cloudinary is configured
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary is not configured');
      return;
    }
    
    try {
      const { id, imageFile, image, ...certificateData } = currentCertificate;
      let imageUrl = image;
      let cloudinaryPublicId = currentCertificate.cloudinaryPublicId;

      // Handle image upload if there's a new file
      if (imageFile) {
        toast.loading('Uploading image...');
        
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'portfolio/certificates');

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

      if (isEditing) {
        const certRef = doc(db, 'certificates', id);
        await updateDoc(certRef, {
          ...certificateData,
          image: imageUrl,
          cloudinaryPublicId,
        });
        toast.success('Certificate updated successfully');
      } else {
        await addDoc(collection(db, 'certificates'), {
          ...certificateData,
          image: imageUrl,
          cloudinaryPublicId,
        });
        toast.success('Certificate added successfully');
      }

      resetForm();
      fetchCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast.dismiss();
      toast.error('Failed to save certificate');
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setCurrentCertificate(certificate);
    setIsEditing(true);
  };

  const handleDelete = async (certificate: Certificate) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await deleteDoc(doc(db, 'certificates', certificate.id));
        toast.success('Certificate deleted successfully');
        fetchCertificates();
      } catch (error) {
        console.error('Error deleting certificate:', error);
        toast.error('Failed to delete certificate');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input
                type="text"
                name="title"
                value={currentCertificate.title}
                onChange={handleInputChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
                placeholder="e.g., AWS Certified Solutions Architect"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">Issuer *</label>
              <input
                type="text"
                name="issuer"
                value={currentCertificate.issuer}
                onChange={handleInputChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
                placeholder="e.g., Amazon Web Services"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">Date *</label>
              <input
                type="date"
                name="date"
                value={currentCertificate.date}
                onChange={handleInputChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700 dark:text-gray-300">Credential URL (optional)</label>
              <input
                type="url"
                name="credentialUrl"
                value={currentCertificate.credentialUrl || ''}
                onChange={handleInputChange}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-300">Description *</label>
            <textarea
              name="description"
              value={currentCertificate.description}
              onChange={handleInputChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[100px] bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent"
              placeholder="Describe what skills or knowledge this certificate represents..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700 dark:text-gray-300">Certificate Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              {...(!isEditing && { required: true })}
            />
            {currentCertificate.image && (
              <div className="mt-2">
                <img
                  src={currentCertificate.image}
                  alt="Certificate preview"
                  className="w-48 h-auto rounded-md shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-[var(--first-color)] to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition"
            >
              {isEditing ? 'Update Certificate' : 'Add Certificate'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Certificates List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Manage Certificates ({certificates.length})
        </h3>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No certificates found. Add your first certificate above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={certificate.image}
                    alt={certificate.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <FaAward className="text-[var(--first-color)] text-2xl flex-shrink-0" />
                    {certificate.credentialUrl && (
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <FaExternalLinkAlt className="text-sm" />
                      </a>
                    )}
                  </div>
                  <h4 className="font-bold text-base mb-1 text-gray-800 dark:text-white">{certificate.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{certificate.issuer}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    {new Date(certificate.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{certificate.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(certificate)}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                      aria-label="Edit certificate"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(certificate)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      aria-label="Delete certificate"
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

export default CertificatesManager;

