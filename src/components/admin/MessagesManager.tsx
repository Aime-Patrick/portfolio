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
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* Messages List */}
      <div className="bg-white p-4 rounded-xl shadow-md md:w-1/3 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Messages</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg ${filter === 'all' ? 'bg-[var(--color-black)] text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg ${filter === 'unread' ? 'bg-[var(--color-black)] text-white' : 'bg-gray-200'}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={`px-3 py-1 rounded-lg ${filter === 'starred' ? 'bg-[var(--color-black)] text-white' : 'bg-gray-200'}`}
            >
              Starred
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center py-4">Loading messages...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-center py-4">No messages found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredMessages.map(message => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-3 rounded-lg cursor-pointer flex items-start gap-3 ${selectedMessage?.id === message.id ? 'bg-blue-50' : 'bg-gray-50'} ${message.read ? 'font-semibold' : ''}`}
                >
                  <div className="mt-1">
                    {message.read ? (
                      <FaEnvelopeOpen className="text-gray-400" />
                    ) : (
                      <FaEnvelope className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">{message.name}</h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.timestamp).split(',')[0]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{message.email}</p>
                    <p className="text-sm truncate">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Message Detail */}
      <div className="bg-white p-6 rounded-xl shadow-md md:w-2/3 overflow-hidden flex flex-col">
        {selectedMessage ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{selectedMessage.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStar(selectedMessage.id, selectedMessage.starred)}
                  className="p-2 rounded-full hover:bg-gray-100"
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
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label={selectedMessage.read ? 'Mark as unread' : 'Mark as read'}
                >
                  {selectedMessage.read ? (
                    <FaEnvelopeOpen className="text-gray-400 text-xl" />
                  ) : (
                    <FaEnvelope className="text-blue-500 text-xl" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                  aria-label="Delete message"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">From:</span>
                <span>{selectedMessage.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>{formatDate(selectedMessage.timestamp)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg overflow-y-auto flex-1">
              <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            
            <div className="mt-4">
              <a
                href={`mailto:${selectedMessage.email}`}
                className="bg-[var(--color-black)] text-white px-4 py-2 rounded-lg hover:bg-[var(--first-color)] transition inline-block"
              >
                Reply via Email
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaEnvelope className="text-6xl mb-4" />
            <p>Select a message to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManager;