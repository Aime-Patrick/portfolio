import React, { useState, useRef, useEffect } from "react";
import { RiRobot3Fill } from "react-icons/ri";
import { IoIosClose, IoIosSend } from "react-icons/io";
import axios from "axios";
import { useSiteSettings } from "./SiteSettingsProvider";

const Chatbot: React.FC = () => {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
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
    <div className="!fixed !bottom-6 !right-6 !z-[100] !flex !flex-col !items-end">
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`transition-transform duration-300 ease-in-out bg-gradient-to-br from-[var(--black-color-light)] to-[var(--color-black)] shadow-xl rounded-full w-16 h-16 flex items-center justify-center text-white text-3xl hover:scale-110 focus:outline-none animate-bounce ${open ? "rotate-12" : ""}`}
        aria-label="Open chatbot"
      >
        <span><RiRobot3Fill /></span>
      </button>
      {/* Chat Window */}
      <div
        className={`mt-4 !w-[350px] !max-w-[95vw] !bg-white !rounded-3xl !shadow-2xl !border !border-gray-200 transition-all duration-500 ease-in-out flex flex-col ${open ? "!opacity-100 !translate-y-0 !scale-100" : "!opacity-0 !pointer-events-none !translate-y-4 !scale-95"}`}
        style={{ minHeight: open ? "480px" : 0, maxHeight: open ? "80vh" : 0 }}
      >
        {/* Header */}
        <div className="relative !bg-gradient-to-r !from-[var(--black-color-light)] !to-[var(--color-black)] !text-white !px-6 !py-4 rounded-t-2xl flex items-center justify-center border-b border-black/10">
          <span className="!absolute !left-4 !text-2xl !bg-white/!10 !rounded-full !p-1"><RiRobot3Fill /></span>
          <span className="!font-semibold !text-lg !tracking-wide">AI Chatbot</span>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 !text-white hover:!text-gray-200 focus:!outline-none text-2xl"
            aria-label="Close chatbot"
          >
            <IoIosClose />
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto !px-4 !py-4 space-y-3 !bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" style={{ minHeight: "200px" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`!px-4 !py-2 !rounded-2xl text-sm !shadow max-w-[75%] transition-all duration-300 break-words ${
                  msg.from === "user"
                    ? "!bg-black !text-white rounded-br-md animate-slide-in-right mb-2"
                    : "!bg-white !text-gray-800 !border !border-gray-200 rounded-bl-md animate-slide-in-left"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="!flex !justify-start">
              <div className="!px-4 !py-2 rounded-2xl bg-gray-200 text-gray-600 text-sm animate-pulse max-w-[75%]">
                Bot is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 !bg-white !px-4 !py-3 rounded-b-3xl !shadow-md">
          <input
            type="text"
            className="flex-1 !px-4 !py-2 !rounded-full !border !border-gray-200 focus:!outline-none focus:!ring-2 focus:!ring-gray-700 transition text-sm !bg-gray-50"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!open}
          />
          <button
            type="submit"
            className="!bg-black hover:!bg-[var(--black-color-light)] !text-white !px-5 !py-2 !rounded-full transition disabled:!opacity-50 !shadow"
            disabled={!input.trim()}
          >
            <IoIosSend />
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