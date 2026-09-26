"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, X, Send, RefreshCw, User, ShoppingBag, ArrowRight, Maximize2, Minimize2, Calendar, Ticket } from 'lucide-react';
import { useBrand } from '../context/BrandProvider';
import { useAuth } from '../context/AuthProvider';
import { useChat } from '../context/ChatProvider';
import { trpc } from '../app/utils/trpc';
import { getImageUrl, getInitials } from '../app/utils/image';

interface StructuredProduct {
  id: number;
  name: string;
  brand: string;
  price: number | string;
  image: string;
  category?: string;
}

interface StructuredEvent {
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
  category: string;
}

interface StructuredData {
  products?: StructuredProduct[];
  events?: StructuredEvent[];
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  userAvatar?: string;
  userInitials?: string;
  quickActions?: { label: string; action: string }[];
  structuredData?: StructuredData;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Welcome to Vellvista help AI! How can I help you explore luxury products, Navratri Garba event passes, or order information today?',
    timestamp: 'Just now',
    quickActions: [
      { label: 'Shop All Products', action: 'Show me bestselling perfumes and products' },
      { label: 'Garba & Event Passes', action: 'Show me upcoming events and Garba passes' },
      { label: 'Track My Orders', action: 'What is the status of my orders?' },
      { label: 'My Saved Wishlist', action: 'Show my saved wishlist items' },
    ]
  }
];

// Helper to render formatted Markdown text
function parseBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-gray-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1.5" />;

        if (trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lineIdx} className="font-bold text-sm text-gray-900 mt-2 mb-0.5">
              {parseBold(headingText)}
            </h4>
          );
        }

        if (trimmed === '---' || trimmed === '***') {
          return <hr key={lineIdx} className="my-2 border-gray-200" />;
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 my-1 pl-1">
              <span className="font-semibold text-gray-900 shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
              <div className="flex-1 text-gray-800">
                {parseBold(numMatch[2])}
              </div>
            </div>
          );
        }

        const bulletMatch = trimmed.match(/^[\-\*]\s+(.*)/);
        if (bulletMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 my-1 pl-1">
              <span className="text-gray-400 shrink-0 text-xs">•</span>
              <div className="flex-1 text-gray-800">
                {parseBold(bulletMatch[1])}
              </div>
            </div>
          );
        }

        return <p key={lineIdx}>{parseBold(line)}</p>;
      })}
    </div>
  );
}

export default function ChatBot() {
  const { brandName } = useBrand();
  const { user } = useAuth();
  const { isOpen, closeChat } = useChat();

  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize or retrieve persistent session ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let saved = sessionStorage.getItem('vellvista_chat_session');
      if (!saved) {
        saved = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        sessionStorage.setItem('vellvista_chat_session', saved);
      }
      setSessionId(saved);
    }
  }, []);

  // Fetch past chat history from database for this session
  useEffect(() => {
    if (!sessionId || !isOpen) return;

    const fetchHistory = async () => {
      try {
        const historyData = await trpc.getChatHistory({ sessionId, userId: user?.id });
        if (historyData && historyData.length > 0) {
          const mapped: Message[] = historyData.map((m: any) => ({
            id: m.id,
            sender: m.sender as 'bot' | 'user',
            text: m.text,
            timestamp: m.timestamp,
            structuredData: m.metadata as StructuredData | undefined,
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    fetchHistory();
  }, [sessionId, isOpen, user?.id]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp,
      userAvatar: user?.avatar,
      userInitials: user?.fullName ? getInitials(user.fullName) : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await trpc.sendChatMessage({
        sessionId,
        message: query,
        userId: user?.id,
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredData: res.structuredData,
        quickActions: [
          { label: 'Shop Products', action: 'Show me bestselling perfumes' },
          { label: 'Garba Events', action: 'Show me Garba & concert event passes' },
        ]
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Failed to process message:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue retrieving that information. Please try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = async () => {
    if (sessionId) {
      try {
        await trpc.clearChatHistory({ sessionId, userId: user?.id });
      } catch (e) {
        console.error('Failed to clear chat history:', e);
      }
    }
    const newSession = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('vellvista_chat_session', newSession);
    }
    setSessionId(newSession);
    setMessages(INITIAL_MESSAGES);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bg-white text-primary overflow-hidden flex flex-col transition-all duration-300 animate-fade-in ${
        isFullscreen
          ? 'inset-0 w-full h-full z-[9999] rounded-none border-none shadow-none'
          : 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[calc(100vh-5rem)] rounded-2xl shadow-2xl border border-gray-200 z-50'
      }`}
      style={isFullscreen ? {} : { boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)' }}
    >
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center border border-white/20 select-none">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-primary rounded-full"></span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white tracking-wide">
              {brandName || 'VellVista'} help AI
            </h3>
            <p className="text-[11px] text-gray-300">
              {user ? `Logged in as ${user.fullName}` : 'Website AI Assistant'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleResetChat}
            title="Reset Chat"
            className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={closeChat}
            title="Close"
            className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end space-x-2 max-w-[88%]">
              {msg.sender === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mb-1 select-none shadow-xs">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-br-none shadow-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-line">{msg.text}</p>
                ) : (
                  <FormattedMessage content={msg.text} />
                )}

                {/* Structured Product Results Cards */}
                {msg.structuredData?.products && msg.structuredData.products.length > 0 && (
                  <div className="mt-3 space-y-2 text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Featured Products:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {msg.structuredData.products.slice(0, 3).map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.id}`}
                          onClick={closeChat}
                          className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group cursor-pointer"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-md border border-gray-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-gray-900 truncate group-hover:text-primary transition-colors">
                              {prod.name}
                            </h5>
                            <span className="text-[11px] font-semibold text-emerald-600 block">
                              ${prod.price}
                            </span>
                          </div>
                          <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-primary shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Event Results Cards */}
                {msg.structuredData?.events && msg.structuredData.events.length > 0 && (
                  <div className="mt-3 space-y-2 text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Garba & Event Passes:
                    </p>
                    <div className="space-y-2">
                      {msg.structuredData.events.map((evt, idx) => (
                        <Link
                          key={idx}
                          href="/events"
                          onClick={closeChat}
                          className="block p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-gray-900 group-hover:text-primary">
                              {evt.title}
                            </h5>
                            <span className="text-xs font-bold text-emerald-600">{evt.price}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{evt.date}</span>
                            <span>•</span>
                            <Ticket className="w-3 h-3 text-gray-400" />
                            <span>{evt.category}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                (msg.userAvatar || user?.avatar) ? (
                  <img
                    src={getImageUrl(msg.userAvatar || user?.avatar)}
                    alt={user?.fullName || "User Avatar"}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-gray-300"
                  />
                ) : (msg.userInitials || (user?.fullName && getInitials(user.fullName))) ? (
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mb-1 border border-gray-300 select-none">
                    {msg.userInitials || getInitials(user?.fullName)}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-primary flex items-center justify-center shrink-0 mb-1 border border-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                )
              )}
            </div>

            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {msg.timestamp}
            </span>

            {/* Quick Action Prompts */}
            {msg.quickActions && msg.quickActions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                {msg.quickActions.map((qa, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(qa.action)}
                    className="text-[11px] bg-white hover:bg-gray-100 text-gray-800 hover:text-black border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1 font-medium transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    {qa.label}
                    <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Animation Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 select-none shadow-xs">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-xs flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Footer Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask ${brandName || 'Vellvista'} help AI...`}
          className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="bg-primary hover:bg-primary-light disabled:opacity-40 text-white p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
