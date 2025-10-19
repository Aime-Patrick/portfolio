import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FiLayout } from 'react-icons/fi';
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
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4">
          {isEditing ? 'Edit Service' : 'Add New Service'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={currentService.title}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Icon</label>
              <select
                name="icon"
                value={currentService.icon}
                onChange={handleInputChange}
                className="border rounded-lg p-2"
                required
              >
                {iconOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <span>Preview:</span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsla(14,98%,50%,1)]">
                  {renderIconPreview(currentService.icon)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Description</label>
            <textarea
              name="description"
              value={currentService.description}
              onChange={handleInputChange}
              className="border rounded-lg p-2 min-h-[100px]"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Border Class (optional)</label>
            <input
              type="text"
              name="borderClass"
              value={currentService.borderClass}
              onChange={handleInputChange}
              className="border rounded-lg p-2"
              placeholder="e.g., second"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="bg-[var(--color-black)] text-white px-6 py-2 rounded-lg hover:bg-[var(--first-color)] transition"
            >
              {isEditing ? 'Update Service' : 'Add Service'}
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
        <h3 className="text-xl font-bold mb-4">Manage Services</h3>
        {loading ? (
          <p>Loading services...</p>
        ) : services.length === 0 ? (
          <p>No services found. Add your first service above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg overflow-hidden shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[hsla(14,98%,50%,1)]">
                    {renderIconPreview(service.icon)}
                  </div>
                  <h4 className="font-bold text-lg">{service.title}</h4>
                </div>
                <p className="text-sm mb-4">{service.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                    aria-label="Edit service"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                    aria-label="Delete service"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesManager;