import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaProjectDiagram, FaTools, FaUser, FaEnvelope } from 'react-icons/fa';

interface DashboardStats {
  projects: number;
  services: number;
  skills: number;
  messages: number;
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    services: 0,
    skills: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch projects count
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projectsCount = projectsSnapshot.size;
      
      // Fetch services count
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const servicesCount = servicesSnapshot.size;
      
      // Fetch skills count
      const profileDoc = await getDoc(doc(db, 'profile', 'main'));
      const skillsCount = profileDoc.exists() ? profileDoc.data()?.skills?.length || 0 : 0;
      
      // Fetch messages
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      const messagesCount = messagesSnapshot.size;
      
      // Get recent messages
      const recentMessagesData = messagesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
      
      setStats({
        projects: projectsCount,
        services: servicesCount,
        skills: skillsCount,
        messages: messagesCount,
      });
      
      setRecentMessages(recentMessagesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="!flex !flex-col !gap-8">
      {/* Stats Cards */}
      <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        <div className="!bg-white !p-6 !rounded-xl !shadow-md flex items-center gap-4">
          <div className="!bg-blue-100 !p-4 !rounded-full">
            <FaProjectDiagram className="!text-blue-500 !text-2xl" />
          </div>
          <div>
            <h3 className="!text-lg !font-semibold !text-gray-500">Projects</h3>
            <p className="!text-3xl !font-bold">{stats.projects}</p>
          </div>
        </div>
        
        <div className="!bg-white !p-6 !rounded-xl !shadow-md flex items-center gap-4">
          <div className="!bg-green-100 !p-4 !rounded-full">
            <FaTools className="!text-green-500 !text-2xl" />
          </div>
          <div>
            <h3 className="!text-lg !font-semibold !text-gray-500">Services</h3>
            <p className="!text-3xl !font-bold">{stats.services}</p>
          </div>
        </div>
        
        <div className="!bg-white !p-6 !rounded-xl !shadow-md flex items-center gap-4">
          <div className="!bg-purple-100 !p-4 !rounded-full">
            <FaUser className="!text-purple-500 !text-2xl" />
          </div>
          <div>
            <h3 className="!text-lg !font-semibold !text-gray-500">Skills</h3>
            <p className="!text-3xl !font-bold">{stats.skills}</p>
          </div>
        </div>
        
        <div className="!bg-white !p-6 !rounded-xl !shadow-md flex items-center gap-4">
          <div className="!bg-orange-100 !p-4 !rounded-full">
            <FaEnvelope className="!text-orange-500 !text-2xl" />
          </div>
          <div>
            <h3 className="!text-lg !font-semibold !text-gray-500">Messages</h3>
            <p className="!text-3xl !font-bold">{stats.messages}</p>
          </div>
        </div>
      </div>
      
      {/* Recent Messages */}
      <div className="!bg-white !p-6 !rounded-xl !shadow-md">
        <h3 className="!text-xl !font-bold !mb-4">Recent Messages</h3>
        
        {recentMessages.length === 0 ? (
          <p className="!text-gray-500">No messages yet.</p>
        ) : (
          <div className="!overflow-x-auto">
            <table className="!min-w-full !divide-y !divide-gray-200">
              <thead className="!bg-gray-50">
                <tr>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-medium !text-gray-500 !uppercase !tracking-wider">Name</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-medium !text-gray-500 !uppercase !tracking-wider">Email</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-medium !text-gray-500 !uppercase !tracking-wider">Message</th>
                  <th className="!px-6 !py-3 !text-left !text-xs !font-medium !text-gray-500 !uppercase !tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="!bg-white !divide-y !divide-gray-200">
                {recentMessages.map((message) => (
                  <tr key={message.id}>
                    <td className="!px-6 !py-4 !whitespace-nowrap">{message.name}</td>
                    <td className="!px-6 !py-4 !whitespace-nowrap">{message.email}</td>
                    <td className="!px-6 !py-4">
                      <div className="!max-w-xs !truncate">{message.message}</div>
                    </td>
                    <td className="!px-6 !py-4 !whitespace-nowrap">{formatDate(message.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="!bg-white !p-6 !rounded-xl !shadow-md">
        <h3 className="!text-xl !font-bold !mb-4">Quick Actions</h3>
        <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
          <button
            onClick={() => window.location.href = '/admin?section=projects'}
            className="!bg-[var(--color-black)] !text-white !p-4 !rounded-lg hover:!bg-[var(--first-color)] transition flex items-center justify-center gap-2"
          >
            <FaProjectDiagram />
            <span>Manage Projects</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/admin?section=services'}
            className="!bg-[var(--color-black)] !text-white !p-4 !rounded-lg hover:!bg-[var(--first-color)] transition flex items-center justify-center gap-2"
          >
            <FaTools />
            <span>Manage Services</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/admin?section=profile'}
            className="!bg-[var(--color-black)] !text-white !p-4 !rounded-lg hover:!bg-[var(--first-color)] transition flex items-center justify-center gap-2"
          >
            <FaUser />
            <span>Update Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;