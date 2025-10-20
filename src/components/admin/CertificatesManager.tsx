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
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FaAward className="text-3xl" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Certificates Manager</h2>
            <p className="text-gray-300 text-sm mt-1">Manage your professional certifications</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 overflow-hidden animate-slideUp" style={{ animationDelay: '100ms' }}>
        <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            {isEditing ? 'Edit Certificate' : 'Add New Certificate'}
          </h3>
        </div>
        <div className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Certificate Title</label>
              <input
                type="text"
                name="title"
                value={currentCertificate.title}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., AWS Certified Solutions Architect"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Issuing Organization</label>
              <input
                type="text"
                name="issuer"
                value={currentCertificate.issuer}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="e.g., Amazon Web Services"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Issue Date</label>
              <input
                type="date"
                name="date"
                value={currentCertificate.date}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Credential URL (Optional)</label>
              <input
                type="url"
                name="credentialUrl"
                value={currentCertificate.credentialUrl || ''}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="https://verify-certificate.com/..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Description</label>
            <textarea
              name="description"
              value={currentCertificate.description}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 min-h-[120px] text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Describe what skills or knowledge this certificate represents..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Certificate Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-red-500 file:text-white file:font-semibold hover:file:from-orange-600 hover:file:to-red-600 transition-all w-full"
              {...(!isEditing && { required: true })}
            />
            {currentCertificate.image && (
              <div className="mt-4 p-4 bg-black/30 rounded-xl border border-orange-500/20">
                <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
                <img
                  src={currentCertificate.image}
                  alt="Certificate preview"
                  className="w-full max-w-md h-auto rounded-lg shadow-md border-2 border-orange-500/20"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t border-orange-500/30">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-[1.02]"
            >
              {isEditing ? '✓ Update Certificate' : '+ Add Certificate'}
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

      {/* Certificates List */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 overflow-hidden animate-slideUp" style={{ animationDelay: '200ms' }}>
        <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaAward className="text-orange-400" />
            Your Certificates ({certificates.length})
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading certificates...</p>
              </div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                <FaAward className="text-3xl text-orange-400" />
              </div>
              <p className="text-gray-300 text-lg font-medium">No certificates yet</p>
              <p className="text-gray-500 text-sm mt-2">Add your first certificate using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="group relative bg-black/50 border-2 border-orange-500/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-orange-500/60 transition-all duration-300 hover:scale-[1.02]">
                  <div className="h-48 overflow-hidden bg-black/30">
                    <img
                      src={certificate.image}
                      alt={certificate.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <FaAward className="text-xl" />
                      </div>
                      {certificate.credentialUrl && (
                        <a
                          href={certificate.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 transition-colors"
                          title="View Credential"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-white mb-2 line-clamp-1">{certificate.title}</h4>
                    <p className="text-sm font-medium text-gray-300 mb-1">{certificate.issuer}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(certificate.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{certificate.description}</p>
                    <div className="flex gap-2 pt-4 border-t border-orange-500/20">
                      <button
                        onClick={() => handleEdit(certificate)}
                        className="flex-1 bg-orange-500/20 text-orange-400 p-2.5 rounded-xl hover:bg-orange-500/30 border border-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        aria-label="Edit certificate"
                      >
                        <FaEdit />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(certificate)}
                        className="flex-1 bg-red-500/20 text-red-400 p-2.5 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        aria-label="Delete certificate"
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

export default CertificatesManager;

