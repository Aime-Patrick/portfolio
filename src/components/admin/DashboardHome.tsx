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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

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
      
      // Fetch skills count from 'about' collection
      const aboutDoc = await getDoc(doc(db, 'about', 'main'));
      const skillsCount = aboutDoc.exists() ? (aboutDoc.data()?.skills?.length || 0) : 0;
      
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

      // Get recent activity from projects, services, and messages
      const projectsList = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'project',
        action: 'Project updated',
        title: doc.data().title || 'Project',
        timestamp: doc.data().updatedAt?.toDate?.() || doc.data().createdAt?.toDate?.() || new Date(),
      }));

      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'service',
        action: 'Service updated',
        title: doc.data().title || 'Service',
        timestamp: doc.data().updatedAt?.toDate?.() || doc.data().createdAt?.toDate?.() || new Date(),
      }));

      const messagesList = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'message',
        action: 'New message',
        title: doc.data().name || 'Message',
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      // Combine and sort all activities
      const allActivities = [...projectsList, ...servicesList, ...messagesList]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 3);
      
      setStats({
        projects: projectsCount,
        services: servicesCount,
        skills: skillsCount,
        messages: messagesCount,
      });
      
      setRecentMessages(recentMessagesData);
      setRecentActivity(allActivities);
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

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 md:p-10 shadow-2xl animate-slideUp border border-gray-700/50">
        {/* Simplified Background - No Heavy Blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--first-color)] opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 opacity-5 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--first-color)] to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/50">
                <span className="text-3xl">👋</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Welcome back, Aime!
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl">
              Your portfolio is looking great! You have <span className="text-[var(--first-color)] font-semibold">{stats.projects} active projects</span> and <span className="text-[var(--first-color)] font-semibold">{stats.messages} new messages</span> waiting for you.
            </p>
          </div>
          
          {/* Quick Stats in Banner */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.services}</p>
              <p className="text-gray-300 text-sm mt-1">Services</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-3xl font-bold text-white">{stats.skills}</p>
              <p className="text-gray-300 text-sm mt-1">Skills</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Projects', 
            value: stats.projects, 
            icon: <FaProjectDiagram />, 
            delay: '0ms'
          },
          { 
            label: 'Services', 
            value: stats.services, 
            icon: <FaTools />, 
            delay: '100ms'
          },
          { 
            label: 'Skills', 
            value: stats.skills, 
            icon: <FaUser />, 
            delay: '200ms'
          },
          { 
            label: 'Messages', 
            value: stats.messages, 
            icon: <FaEnvelope />, 
            delay: '300ms'
          },
          ].map((stat, _index) => (
          <div
            key={stat.label}
            className="group relative bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer animate-scaleIn border-2 border-orange-500/30 hover:border-orange-500/60 overflow-hidden"
            style={{ animationDelay: stat.delay }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">{stat.label}</p>
                <p className="text-5xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-400 font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Active</span>
                </div>
              </div>
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-orange-500/50 to-red-500/50 group-hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30">
                <div className="text-4xl text-white">
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500/50 to-red-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        ))}
      </div>

      {/* Portfolio Insights & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Health */}
        <div className="bg-gradient-to-br from-orange-500/50 to-red-500/50 rounded-2xl p-6 text-white shadow-xl animate-slideUp" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portfolio Health</h3>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">
            {stats.projects > 0 && stats.services > 0 && stats.skills > 0 ? 'Excellent' : 
             stats.projects > 0 || stats.services > 0 ? 'Good' : 'Needs Setup'}
          </div>
          <p className="text-orange-100 text-sm">
            {stats.projects > 0 && stats.services > 0 && stats.skills > 0 
              ? 'All systems operational. Your portfolio is performing at its best.'
              : stats.projects > 0 || stats.services > 0
              ? 'Add more content to improve your portfolio.'
              : 'Start by adding projects, services, and skills.'}
          </p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-100">Total Items</span>
              <span className="font-semibold">{stats.projects + stats.services + stats.skills}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 shadow-xl border-2 border-orange-500/30 animate-slideUp" style={{ animationDelay: '450ms' }}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800/50 hover:scrollbar-thumb-orange-500/70 transition-colors" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(249, 115, 22, 0.5) rgba(31, 41, 55, 0.5)'
          }}>
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 animate-fadeIn">
                <p className="text-gray-400 text-sm">No recent activity</p>
                <p className="text-gray-500 text-xs mt-2">Activity will appear here as you add content</p>
              </div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div 
                  key={activity.id || idx} 
                  className="flex items-center gap-3 p-3 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-all duration-300 border border-orange-500/20 hover:border-orange-500/40 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20"
                  style={{ 
                    animation: `slideInRight 0.5s ease-out ${idx * 0.1}s both`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content Summary */}
        <div className="bg-gradient-to-br from-orange-600/50 to-red-600/50 rounded-2xl p-6 text-white shadow-xl animate-slideUp" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Content Summary</h3>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{stats.projects + stats.services}</div>
          <p className="text-orange-100 text-sm">Total projects and services in your portfolio</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-100">Skills</span>
              <span className="font-semibold">{stats.skills}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Messages */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 overflow-hidden animate-slideUp" style={{ animationDelay: '550ms' }}>
        <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaEnvelope className="text-orange-500" />
            Recent Messages
          </h3>
        </div>
        
        {recentMessages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
              <FaEnvelope className="text-3xl text-orange-400" />
            </div>
            <p className="text-gray-300 text-lg">No messages yet.</p>
            <p className="text-gray-500 text-sm mt-2">Messages from your contact form will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-500/20">
              <thead className="bg-black/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-400 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-orange-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-500/10">
                {recentMessages.map((message, index) => (
                  <tr 
                    key={message.id} 
                    className="hover:bg-orange-500/10 transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {message.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{message.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{message.email}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-gray-300">{message.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatDate(message.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 p-6 md:p-8 animate-slideUp" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500/50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
            </svg>
            Quick Actions
          </h3>
          <span className="text-sm text-gray-400">Manage your content</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              label: 'Manage Projects', 
              description: 'Add, edit or delete projects',
              icon: <FaProjectDiagram />, 
              section: 'projects'
            },
            { 
              label: 'Manage Services', 
              description: 'Update your service offerings',
              icon: <FaTools />, 
              section: 'services'
            },
            { 
              label: 'Update Profile', 
              description: 'Edit your personal information',
              icon: <FaUser />, 
              section: 'profile'
            }
          ].map((action, _index) => (
            <button
              key={action.section}
              onClick={() => window.location.href = `/admin?section=${action.section}`}
              className="group relative overflow-hidden bg-black/50 hover:bg-orange-500/10 border-2 border-orange-500/30 hover:border-orange-500/60 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-left"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/50 to-red-500/50 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-500/30 mb-4 group-hover:scale-105 transition-transform duration-300">
                  {action.icon}
                </div>
                <h4 className="font-bold text-white text-lg mb-2">{action.label}</h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300">{action.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
                  <span>Open</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;