import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Sparkles, RefreshCw, User, ShieldCheck, CornerDownRight, MessageSquareCode } from "lucide-react";

interface AIConsultantProps {
  onSelectService: (serviceName: string) => void;
}

export default function AIConsultant({ onSelectService }: AIConsultantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Namaste! I am Aura, your wellness advisor at Veda Spa Indore. Tell me how you are feeling today. Are you experiencing stress, desk-bound body aches, exhaustion, or looking for skin rejuvenation? I will customize a holistic treatment package specifically for you.",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startermessages = [
    { label: "Neck stiffness from desk work", text: "I work long hours on my desk in Indore and suffer from neck and shoulder stiffness. What do you recommend?" },
    { label: "Anxious and deeply stressed", text: "I have been feeling highly anxious, sleepless, and stressed out. I need a deeply calming treatment." },
    { label: "Dull skin & city pollution", text: "Indore's dusty roads and dry climate have made my skin look dull and pigmented. How can I restore my skin's glow?" },
    { label: "Full-body detox ritual", text: "I'm looking for a premium detox session that cleanses both my body and mind completely." }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Gather conversation history formatted for Express
      const formattedHistory = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          history: formattedHistory
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        const botMsg: ChatMessage = {
          id: `msg-${Date.now()}-bot`,
          role: "model",
          text: data.text,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        text: "My apologies, I had trouble connecting to the wellness engine. Please try asking me again or check out our premium therapist list directly.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: "Namaste! I am Aura, your wellness advisor at Veda Spa Indore. Tell me how you are feeling today. Are you experiencing stress, desk-bound body aches, exhaustion, or looking for skin rejuvenation? I will customize a holistic treatment package specifically for you.",
        timestamp: new Date()
      }
    ]);
  };

  // Helper to check if a specific service is mentioned and render quick booking button
  const renderBookingShortcut = (text: string) => {
    const lowercase = text.toLowerCase();
    const matches = [];
    if (lowercase.includes("abhyanga")) matches.push({ name: "Abhyanga Shanti Ayurvedic Massage", tag: "Abhyanga Shanti" });
    if (lowercase.includes("soundarya") || lowercase.includes("facial")) matches.push({ name: "Indori Royal Soundarya Facial", tag: "Royal Soundarya Facial" });
    if (lowercase.includes("hot stone") || lowercase.includes("nirvana")) matches.push({ name: "Nirvana Hot Stone Therapy", tag: "Nirvana Hot Stones" });
    if (lowercase.includes("marma")) matches.push({ name: "Marma Points Healing Therapy", tag: "Marma Points Therapy" });
    if (lowercase.includes("deep tissue") || lowercase.includes("mukti")) matches.push({ name: "Deep Tissue Mukti Massage", tag: "Deep Tissue Mukti" });
    if (lowercase.includes("aroma") || lowercase.includes("fusion")) matches.push({ name: "Aroma Harmony Fusion", tag: "Aroma Harmony Fusion" });
    if (lowercase.includes("detox") || lowercase.includes("panchakarma")) matches.push({ name: "Panchakarma Express Detox", tag: "Panchakarma Express Detox" });
    if (lowercase.includes("couple") || lowercase.includes("mewar")) matches.push({ name: "Royal Mewar Couple's Ritual", tag: "Royal Mewar Couple's Ritual" });

    if (matches.length === 0) return null;

    return (
      <div className="mt-4 pt-3 border-t border-blue-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono font-bold text-blue-600 flex items-center">
          <CornerDownRight className="w-3.5 h-3.5 mr-1" /> Recommends:
        </span>
        {matches.map((m, idx) => (
          <button
            key={idx}
            onClick={() => onSelectService(m.name)}
            className="text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Book {m.tag}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div id="ai-advisor-container" className="bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-lg flex flex-col h-[700px]">
      {/* Header */}
      <div className="bg-blue-50/50 p-5 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white relative">
            <Sparkles className="w-6 h-6" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-lg text-slate-900">Aura AI Spa Consultant</h3>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-[11px] font-mono tracking-wide text-blue-600 uppercase font-bold">Veda Certified Holistic Guide</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors duration-300 flex items-center space-x-1"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Reset</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div className={`flex items-start max-w-[85%] ${isUser ? "flex-row-reverse space-x-reverse" : "space-x-3"}`}>
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? "bg-slate-100 text-slate-800" : "bg-blue-50 text-blue-600 border border-blue-100"
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`rounded-3xl p-5 shadow-sm text-sm sm:text-base leading-relaxed ${
                  isUser 
                    ? "bg-blue-600 text-white" 
                    : "bg-white border border-blue-100 text-slate-800"
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* Recommended Therapy Bookings (rendered if bot message) */}
                  {!isUser && renderBookingShortcut(msg.text)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-start space-x-3 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-blue-100 rounded-3xl p-5 text-sm text-slate-500 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" />
                </div>
                <span className="font-mono text-xs italic tracking-wide text-blue-600 font-semibold">Aura is writing recommendations...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 bg-slate-50 border-t border-blue-100">
          <p className="text-[11px] font-mono uppercase tracking-wider text-blue-600 mb-2 font-bold">Suggested questions for Aura Advisor:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {startermessages.map((sm, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(sm.text)}
                className="text-left text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 p-2.5 rounded-xl transition-all duration-300 text-slate-700 font-medium cursor-pointer"
              >
                {sm.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(userInput);
        }}
        className="p-4 bg-white border-t border-blue-100 flex items-center space-x-3"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={isLoading}
          placeholder="Type how your body is feeling, stress levels, or skin goals..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full py-3 px-5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors disabled:opacity-40 disabled:hover:bg-blue-600 cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
