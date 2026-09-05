import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! 👋 I'm the Sholex assistant. How can I help you today?",
    sender: "bot",
  },
];

const botResponses: Record<string, string> = {
  "hello": "Hello! How can I assist you?",
  "hi": "Hi there! What can I do for you?",
  "help": "I can help with product information, order status, shipping, and more. Just ask!",
  "shipping": "We deliver across Nigeria within 2-5 business days. Free shipping on orders over ₦50,000.",
  "return": "You can return items within 7 days of delivery. Check our Returns Policy for details.",
  "payment": "We accept Paystack, bank transfer, and WhatsApp Pay. Let me know if you need help with a specific payment method.",
  "order": "To check your order status, please provide your order number or log in to your account.",
  "default": "I'm still learning! For more complex questions, please contact our support team at hello@Sholex.com.",
};

const StoreAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simple bot reply
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      let reply = botResponses.default;
      for (const key of Object.keys(botResponses)) {
        if (lower.includes(key)) {
          reply = botResponses[key];
          break;
        }
      }
      const botMessage: Message = {
        id: Date.now() + 1,
        text: reply,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#e8622a] text-white rounded-full shadow-lg hover:bg-[#c9511f] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e8622a]"
        aria-label={isOpen ? "Close store assistant" : "Open store assistant"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="bg-[#e8622a] px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sholex Assistant</h3>
                <p className="text-xs text-white/80">Online - typically replies instantly</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender === "user"
                        ? "bg-[#e8622a] text-white rounded-br-none"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.sender === "bot" && (
                        <Bot size={16} className="mt-0.5 text-[#e8622a]" />
                      )}
                      <span>{msg.text}</span>
                      {msg.sender === "user" && (
                        <User size={16} className="mt-0.5 text-white/70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#e8622a] text-gray-800 dark:text-gray-100"
                aria-label="Message input"
              />
              <button
                type="submit"
                className="p-2 bg-[#e8622a] text-white rounded-full hover:bg-[#c9511f] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e8622a]"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoreAssistant;