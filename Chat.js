import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI fitness coach 🤖\n\nI can help you with:\n• **Workout plans** tailored to your goals\n• **Diet & nutrition** advice\n• **Exercise form** tips\n• **Recovery** strategies\n\nAsk me anything about fitness!",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Quick suggestion chips
  const suggestions = [
    "Best exercises for weight loss?",
    "High protein meal plan",
    "How to build muscle fast?",
    "Morning workout routine",
  ];

  const formatMessage = (text) => {
    // Simple markdown-like formatting
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '• ')
      .replace(/^(\d+)\. /gm, '$1. ')
      .replace(/\n/g, '<br/>');
    return formatted;
  };

  const handleSendMessage = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const messageText = customMessage || inputValue;

    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: messageText }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.reply,
          sender: "bot",
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: data.error || "Sorry, I couldn't process that. Please try again.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error("Chat Error:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Connection error. Please check that the backend server is running at http://localhost:5000",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Chat cleared! How can I help you today? 💪",
        sender: "bot",
      },
    ]);
  };

  return (
    <div className="h-screen flex flex-col relative">
      <div className="mesh-bg" />
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-4 relative z-10 min-h-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-4 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI Fitness Coach</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-400">Online • Powered by Gemini AI</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} chat-message-enter`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-2xl transition-all hover:shadow-lg ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md shadow-lg shadow-blue-600/20 font-medium"
                      : "glass-light text-slate-200 rounded-bl-md"
                  }`}
                >
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                  />
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start chat-message-enter">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="glass-light px-5 py-4 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 1 && !loading && (
            <div className="px-5 pb-3">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={(e) => handleSendMessage(e, s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-white/5 p-4 flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800"
          >
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about workouts, diet, exercises..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 text-sm border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
            />
            <button
              id="chat-send"
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;