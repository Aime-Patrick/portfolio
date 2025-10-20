import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-hot-toast';
import { FaTrash, FaEnvelope, FaEnvelopeOpen, FaStar, FaRegStar } from 'react-icons/fa';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
}

const MessagesManager: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesCollection = collection(db, 'messages');
      const messagesSnapshot = await getDocs(messagesCollection);
      const messagesList = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        read: doc.data().read || false,
        starred: doc.data().starred || false,
      })) as Message[];
      
      // Sort by timestamp (newest first)
      messagesList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setMessages(messagesList);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteDoc(doc(db, 'messages', id));
        toast.success('Message deleted successfully');
        
        // Update local state
        setMessages(prev => prev.filter(message => message.id !== id));
        
        // Clear selected message if it was deleted
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const handleToggleRead = async (id: string, currentReadStatus: boolean) => {
    try {
      const messageRef = doc(db, 'messages', id);
      await updateDoc(messageRef, { read: !currentReadStatus });
      
      // Update local state
      setMessages(prev => 
        prev.map(message => 
          message.id === id ? { ...message, read: !currentReadStatus } : message
        )
      );
      
      // Update selected message if it was toggled
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: !currentReadStatus });
      }
    } catch (error) {
      console.error('Error updating message read status:', error);
      toast.error('Failed to update message status');
    }
  };

  const handleToggleStar = async (id: string, currentStarredStatus: boolean) => {
    try {
      const messageRef = doc(db, 'messages', id);
      await updateDoc(messageRef, { starred: !currentStarredStatus });
      
      // Update local state
      setMessages(prev => 
        prev.map(message => 
          message.id === id ? { ...message, starred: !currentStarredStatus } : message
        )
      );
      
      // Update selected message if it was toggled
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, starred: !currentStarredStatus });
      }
    } catch (error) {
      console.error('Error updating message starred status:', error);
      toast.error('Failed to update message status');
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if it's unread
    if (!message.read) {
      await handleToggleRead(message.id, false);
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

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return !message.read;
    if (filter === 'starred') return message.starred;
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white shadow-xl animate-slideUp">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <FaEnvelope className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Messages Manager</h2>
            <p className="text-orange-100 text-sm">View and manage contact messages</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Messages List */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 lg:w-1/3 overflow-hidden flex flex-col animate-slideUp" style={{ animationDelay: '100ms' }}>
          <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <FaEnvelope className="text-orange-400" />
              Inbox ({filteredMessages.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'all' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-black/50 text-gray-300 hover:bg-black/70 border border-orange-500/20'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'unread' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-black/50 text-gray-300 hover:bg-black/70 border border-orange-500/20'}`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('starred')}
                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === 'starred' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-black/50 text-gray-300 hover:bg-black/70 border border-orange-500/20'}`}
              >
                <FaStar className="inline mr-1" />
                Starred
              </button>
            </div>
          </div>
        
          <div className="overflow-y-auto flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-medium">Loading messages...</p>
                </div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No messages</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new messages</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredMessages.map(message => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedMessage?.id === message.id 
                        ? 'bg-orange-500/20 border-orange-500/60 shadow-lg' 
                        : 'bg-black/30 border-orange-500/20 hover:border-orange-500/40 hover:bg-black/50'
                    } ${!message.read ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center ${
                        message.read 
                          ? 'bg-gray-700 text-gray-400' 
                          : 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                      }`}>
                        {message.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-white truncate">{message.name}</h4>
                          {message.starred && <FaStar className="text-yellow-400 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-400 truncate mb-1">{message.email}</p>
                        <p className="text-sm text-gray-300 line-clamp-2">{message.message}</p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {formatDate(message.timestamp).split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl border-2 border-orange-500/30 lg:w-2/3 overflow-hidden flex flex-col animate-slideUp" style={{ animationDelay: '200ms' }}>
          {selectedMessage ? (
            <>
              <div className="px-6 py-5 border-b border-orange-500/30 bg-black/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedMessage.name}</h3>
                      <p className="text-sm text-gray-400">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStar(selectedMessage.id, selectedMessage.starred)}
                      className="p-3 rounded-xl hover:bg-orange-500/20 transition-colors"
                      aria-label={selectedMessage.starred ? 'Unstar message' : 'Star message'}
                    >
                      {selectedMessage.starred ? (
                        <FaStar className="text-yellow-400 text-xl" />
                      ) : (
                        <FaRegStar className="text-gray-400 text-xl" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.read)}
                      className="p-3 rounded-xl hover:bg-orange-500/20 transition-colors"
                      aria-label={selectedMessage.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {selectedMessage.read ? (
                        <FaEnvelopeOpen className="text-gray-400 text-xl" />
                      ) : (
                        <FaEnvelope className="text-orange-400 text-xl" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="p-3 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors"
                      aria-label="Delete message"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-b border-orange-500/20 bg-black/30">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Date:</span>
                    <span className="text-gray-400">{formatDate(selectedMessage.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-black/50 p-6 rounded-2xl border-2 border-orange-500/20">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                </div>
              </div>
              
              <div className="p-6 border-t border-orange-500/30 bg-black/30">
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-[1.02] inline-flex items-center justify-center gap-2"
                >
                  <FaEnvelope />
                  Reply via Email
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12">
              <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                <FaEnvelope className="text-5xl text-orange-400" />
              </div>
              <p className="text-lg font-medium text-gray-300">Select a message to view details</p>
              <p className="text-sm text-gray-500 mt-2">Click on any message from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManager;