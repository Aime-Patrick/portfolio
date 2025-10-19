import React, { useState, useRef, useEffect } from "react";
import { RiRobot3Fill } from "react-icons/ri";
import { IoIosClose, IoIosSend } from "react-icons/io";
import { FiMaximize2, FiMinimize2, FiMonitor } from "react-icons/fi";
import axios from "axios";
import { useSiteSettings } from "./SiteSettingsProvider";

type ChatSize = "normal" | "maximized" | "fullscreen";

const Chatbot: React.FC = () => {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [chatSize, setChatSize] = useState<ChatSize>("normal");
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // If chatbot is disabled in settings, don't render anything
  if (settings.enableChatbot === false) {
    return null;
  }

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Send initial greeting when chatbot is opened for the first time
  useEffect(() => {
    const fetchInitialGreeting = async () => {
      if (open && !hasInitialized) {
        setHasInitialized(true);
        setLoading(true);

        try {
          const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";
          
          if (!N8N_WEBHOOK_URL) {
            // Fallback to default greeting if webhook not configured
            setMessages([{ from: "bot", text: "Hi! How can I help you today?" }]);
            return;
          }

          const response = await axios.post(
            N8N_WEBHOOK_URL,
            {
              message: "hello", // Initial greeting trigger
              chatHistory: [],
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000, // 10 second timeout for initial greeting
            }
          );

          if (response.data?.success && response.data?.response) {
            setMessages([{ from: "bot", text: response.data.response }]);
          } else {
            setMessages([{ from: "bot", text: "Hi! How can I help you today?" }]);
          }
        } catch (err) {
          console.error("Initial greeting error:", err);
          // Fallback greeting on error
          setMessages([{ from: "bot", text: "Hi! How can I help you today?" }]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialGreeting();
  }, [open, hasInitialized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";
      
      if (!N8N_WEBHOOK_URL) {
        throw new Error("N8N webhook URL not configured");
      }

      // Wait for the response from N8N webhook
      const response = await axios.post(
        N8N_WEBHOOK_URL,
        {
          message: userMessage,
          chatHistory: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout for AI response
        }
      );

      // Handle N8N webhook response format: { success, response, timestamp }
      if (response.data?.success && response.data?.response) {
        setMessages((prev) => [...prev, { from: "bot", text: response.data.response }]);
        console.log("Response received at:", response.data.timestamp);
      } else {
        throw new Error("Invalid response format from webhook");
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      
      let errorMessage = "Sorry, I couldn't get a response. Please try again later.";
      
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          errorMessage = "Request timed out. The AI is taking too long to respond. Please try again.";
        } else if (err.response) {
          errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage = "Unable to reach the server. Please check your connection.";
        }
      }
      
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end">
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative group transition-all duration-500 ease-out bg-gradient-to-br from-[var(--first-color)] to-orange-600 shadow-2xl shadow-orange-500/40 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-white text-2xl md:text-3xl hover:scale-110 hover:shadow-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/30 ${
          open ? "rotate-180 scale-95" : "animate-bounce"
        }`}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--first-color)] to-orange-600 animate-ping opacity-75"></span>
        
        {/* Icon */}
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          {open ? <IoIosClose className="text-4xl" /> : <RiRobot3Fill />}
        </span>
        
        {/* Notification Badge */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></span>
        )}
      </button>
      {/* Chat Window */}
      <div
        className={`backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl shadow-black/10 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-out flex flex-col overflow-hidden ${
          open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 pointer-events-none translate-y-8 scale-90"
        } ${
          chatSize === "fullscreen"
            ? "fixed inset-4 w-auto max-w-none z-[100]"
            : chatSize === "maximized"
            ? "fixed bottom-24 right-4 w-[600px] max-w-[90vw] z-50"
            : "mt-4 w-[360px] max-w-[95vw]"
        }`}
        style={{ 
          minHeight: open ? (chatSize === "fullscreen" ? "auto" : "500px") : 0, 
          maxHeight: open ? (chatSize === "fullscreen" ? "auto" : "85vh") : 0,
        }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[var(--first-color)] to-orange-600 text-white px-6 py-5 rounded-t-3xl flex items-center justify-between shadow-lg">
          {/* Bot Avatar & Title */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <RiRobot3Fill className="text-xl" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">AI Assistant</h3>
              <p className="text-xs text-white/80">Online • Ready to help</p>
            </div>
          </div>

          {/* Size & Close Controls */}
          <div className="flex items-center gap-2">
            {/* Maximize/Minimize Buttons */}
            <button
              onClick={() => {
                if (chatSize === "normal") setChatSize("maximized");
                else if (chatSize === "maximized") setChatSize("fullscreen");
                else setChatSize("normal");
              }}
              className="p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label={chatSize === "fullscreen" ? "Minimize chat" : "Maximize chat"}
              title={chatSize === "fullscreen" ? "Minimize" : chatSize === "maximized" ? "Fullscreen" : "Maximize"}
            >
              {chatSize === "fullscreen" ? (
                <FiMinimize2 className="text-lg" />
              ) : chatSize === "maximized" ? (
                <FiMonitor className="text-lg" />
              ) : (
                <FiMaximize2 className="text-lg" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setOpen(false);
                setChatSize("normal"); // Reset to normal size when closed
              }}
              className="p-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="Close chatbot"
            >
              <IoIosClose className="text-2xl" />
            </button>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" style={{ minHeight: "280px" }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--first-color)]/10 to-orange-600/10 rounded-full flex items-center justify-center mb-4">
                <RiRobot3Fill className="text-3xl text-[var(--first-color)]" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Welcome! Ask me anything</p>
              <p className="text-gray-400 text-xs mt-2">I'm here to help you</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                {msg.from === "bot" && (
                  <div className="w-7 h-7 bg-gradient-to-br from-[var(--first-color)] to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <RiRobot3Fill className="text-white text-sm" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div
                  className={`relative px-4 py-2.5 rounded-2xl text-sm max-w-[80%] break-words shadow-sm transition-all duration-300 ${
                    msg.from === "user"
                      ? "bg-gradient-to-br from-[var(--first-color)] to-orange-600 text-white rounded-br-md shadow-orange-500/20"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                  } animate-slide-in-${msg.from === "user" ? "right" : "left"}`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  
                  {/* Time (optional) */}
                  <span className={`block text-[10px] mt-1 ${
                    msg.from === "user" ? "text-white/70" : "text-gray-400"
                  }`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-[var(--first-color)] to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <RiRobot3Fill className="text-white text-sm" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 rounded-b-3xl shadow-lg">
          <input
            type="text"
            className="flex-1 px-5 py-3 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--first-color)] focus:border-transparent transition-all duration-300 text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!open || loading}
          />
          <button
            type="submit"
            className={`p-3 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              input.trim()
                ? "bg-gradient-to-br from-[var(--first-color)] to-orange-600 text-white hover:shadow-orange-500/40 hover:scale-105"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            }`}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <IoIosSend className="text-xl" />
          </button>
        </form>
        {/* Animations for message bubbles */}
        <style>{`
          @keyframes slide-in-right {
            0% { opacity: 0; transform: translateX(40px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes slide-in-left {
            0% { opacity: 0; transform: translateX(-40px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right { animation: slide-in-right 0.3s; }
          .animate-slide-in-left { animation: slide-in-left 0.3s; }
        `}</style>
      </div>
    </div>
  );
};

export default Chatbot;