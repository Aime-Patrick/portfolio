import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaServer, FaCloud, FaCog, FaDatabase, FaShieldAlt, FaLock, FaMicrochip, FaDocker } from 'react-icons/fa';
import { FiLayout, FiLink2 } from 'react-icons/fi';
import { FaLaptopCode } from 'react-icons/fa6';
import { GiSmartphone } from 'react-icons/gi';

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  borderClass?: string;
}

const iconOptions = [
  { value: 'FiLayout', label: 'Layout', component: <FiLayout size={32} className="text-white" /> },
  { value: 'FaLaptopCode', label: 'Code', component: <FaLaptopCode size={32} className="text-white" /> },
  { value: 'GiSmartphone', label: 'Mobile', component: <GiSmartphone size={32} className="text-white" /> },
  { value: 'FaServer', label: 'Server', component: <FaServer size={32} className="text-white" /> },
  { value: 'FaCloud', label: 'Cloud', component: <FaCloud size={32} className="text-white" /> },
  { value: 'FaMicrochip', label: 'CPU/Robot/Smart', component: <FaMicrochip size={32} className="text-white" /> },
  { value: 'FaCog', label: 'Settings', component: <FaCog size={32} className="text-white" /> },
  { value: 'FaDocker', label: 'Docker', component: <FaDocker size={32} className="text-white" /> },
  { value: 'FaDatabase', label: 'Database', component: <FaDatabase size={32} className="text-white" /> },
  { value: 'FiLink2', label: 'Plug/Link/Share', component: <FiLink2 size={32} className="text-white" /> },
  { value: 'FaShieldAlt', label: 'Shield', component: <FaShieldAlt size={32} className="text-white" /> },
  { value: 'FaLock', label: 'Lock', component: <FaLock size={32} className="text-white" /> },
];

const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service>({
    id: '',
    icon: 'FiLayout',
    title: '',
    description: '',
    borderClass: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(servicesList);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setCurrentService({
      id: '',
      icon: 'FiLayout',
      title: '',
      description: '',
      borderClass: '',
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...serviceData } = currentService;

      if (isEditing) {
        // Update existing service
        const serviceRef = doc(db, 'services', id);
        await updateDoc(serviceRef, serviceData);
        toast.success('Service updated successfully');
      } else {
        // Add new service
        await addDoc(collection(db, 'services'), serviceData);
        toast.success('Service added successfully');
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setCurrentService(service);
    setIsEditing(true);
  };

  const handleDelete = async (service: Service) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', service.id));
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('Failed to delete service');
      }
    }
  };

  const renderIconPreview = (iconName: string) => {
    const icon = iconOptions.find(option => option.value === iconName);
    return icon ? icon.component : null;
  };

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
            <h2 className="text-2xl md:text-3xl font-bold">Services Manager</h2>
            <p className="text-gray-300 text-sm mt-1">Manage your service offerings</p>
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
            {isEditing ? 'Edit Service' : 'Add New Service'}
          </h3>
        </div>
        <div className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Service Title</label>
              <input
                type="text"
                name="title"
                value={currentService.title}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                placeholder="Enter service name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-300 text-sm">Icon</label>
              <select
                name="icon"
                value={currentService.icon}
                onChange={handleInputChange}
                className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                required
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-black/30 rounded-xl border-2 border-orange-500/30">
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-300">Icon Preview:</span>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                {renderIconPreview(currentService.icon)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Description</label>
            <textarea
              name="description"
              value={currentService.description}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[120px]"
              placeholder="Describe your service..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-300 text-sm">Border Class (optional)</label>
            <input
              type="text"
              name="borderClass"
              value={currentService.borderClass}
              onChange={handleInputChange}
              className="bg-black/50 border-2 border-orange-500/30 rounded-xl p-3 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="e.g., second"
            />
            <p className="text-xs text-gray-500 mt-1">Used for special styling on the frontend</p>
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t border-orange-500/30">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-[1.02]"
            >
              {isEditing ? '✓ Update Service' : '+ Add Service'}
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

      {/* Services List */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 overflow-hidden animate-slideUp" style={{ animationDelay: '200ms' }}>
        <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            Your Services ({services.length})
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-medium">Loading services...</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-gray-300 text-lg font-medium">No services yet</p>
              <p className="text-gray-500 text-sm mt-2">Add your first service using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="group relative bg-black/50 border-2 border-orange-500/30 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-orange-500/60 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-bl-full"></div>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {renderIconPreview(service.icon)}
                      </div>
                      <h4 className="font-bold text-xl text-white flex-1">{service.title}</h4>
                    </div>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">{service.description}</p>
                    {service.borderClass && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-orange-400 bg-orange-500/20 px-2 py-1 rounded-lg border border-orange-500/30">
                          Class: {service.borderClass}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-4 border-t border-orange-500/20">
                      <button
                        onClick={() => handleEdit(service)}
                        className="flex-1 bg-orange-500/20 text-orange-400 p-2.5 rounded-xl hover:bg-orange-500/30 border border-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        aria-label="Edit service"
                      >
                        <FaEdit />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="flex-1 bg-red-500/20 text-red-400 p-2.5 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        aria-label="Delete service"
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

export default ServicesManager;