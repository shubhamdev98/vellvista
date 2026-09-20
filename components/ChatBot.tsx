"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, RefreshCw, Bot, User, ShoppingBag, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { useBrand } from '../context/BrandProvider';
import { useAuth } from '../context/AuthProvider';
import { getImageUrl, getInitials } from '../app/utils/image';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  userAvatar?: string;
  userInitials?: string;
  quickActions?: { label: string; action: string }[];
  recommendation?: {
    name: string;
    notes: string;
    price: string;
    image: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Welcome to Vellvista Luxury Store! I am your AI Shopping Assistant & Concierge. How can I help you explore our luxury products, categories, or orders today?',
    timestamp: 'Just now',
    quickActions: [
      { label: 'Shop All Categories', action: 'What product categories do you offer?' },
      { label: 'Fragrances & Perfumes', action: 'Can you recommend a perfume or luxury scent?' },
      { label: 'Track Order Status', action: 'How do I track my order status?' },
      { label: 'Luxury Gift Guide', action: 'Suggest luxury gift ideas for a special occasion' },
    ]
  }
];

// Helper to render formatted Markdown text (stripping raw asterisks ** and applying bold/headings/lists)
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

        // Headings (#, ##, ###)
        if (trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={lineIdx} className="font-bold text-sm text-gray-900 mt-2 mb-0.5">
              {parseBold(headingText)}
            </h4>
          );
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={lineIdx} className="my-2 border-gray-200" />;
        }

        // Numbered list (e.g., 1. **Title** description)
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

        // Bullet list (e.g., - **Title** or * **Title**)
        const bulletMatch = trimmed.match(/^[\-\*]\s+(.*)/);
        if (bulletMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 my-1 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0 mt-2"></span>
              <div className="flex-1 text-gray-800">
                {parseBold(bulletMatch[1])}
              </div>
            </div>
          );
        }

        // Regular paragraph line
        return (
          <p key={lineIdx} className="text-gray-800">
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatBot() {
  const { brandName } = useBrand();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new message is added
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // User message with logged in avatar/initials
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: now,
      userAvatar: user?.avatar,
      userInitials: user?.fullName ? getInitials(user.fullName) : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const userAccountContext = user
        ? `ACTIVE LOGGED-IN USER ACCOUNT:
- Name: ${user.fullName}
- Email: ${user.email}
- Account ID: #${user.id}
- Account Role: ${user.role || 'Customer'}`
        : `USER ACCOUNT STATUS: Guest User (Not logged in). Advise them to log in to view their profile, track personal orders, or manage settings.`;

      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'groq/compound-mini',
          messages: [
            {
              role: 'system',
              content: `You are the official AI Shopping Concierge & Personal Account Assistant for ${brandName || 'Vellvista'}, a luxury multi-category store featuring Fragrances & Perfumes, Skincare, Cosmetics, Fashion & Apparel, Electronics, and Accessories.

${userAccountContext}

STORE CONTEXT & CAPABILITIES:
- Store Name: ${brandName || 'Vellvista'} (The Realm of Luxury Fragrances & Lifestyle)
- Product Departments: Niche Fragrances & Perfumes, Skincare & Serums, Cosmetics & Beauty, Designer Apparel & Fashion, Tech & Accessories.
- Customer Services: Worldwide Express Insured Shipping (3-5 business days), 30-Day Easy Returns & Exchanges, 100% Authentic Guarantee, Order Tracking via Account Dashboard.
- Customer Support Contact: info@vellvista.com

STRICT DOMAIN BOUNDARIES & BEHAVIOR:
- When the user asks questions about their account (e.g., "What is my account email?", "Who am I logged in as?", "Show my profile name"), use the ACTIVE LOGGED-IN USER ACCOUNT context provided above to answer warmly, accurately, and directly.
- You ONLY answer questions relevant to the ${brandName || 'Vellvista'} e-commerce store, its products, customer accounts, orders, shipping, returns, and shopping guidance.
- If the user asks ANY off-topic or unrelated question (such as coding/programming, math problems, general trivia, recipes, sports, politics), POLITELY DECLINE by stating: "I am your dedicated ${brandName || 'Vellvista'} Assistant. I can only assist with our store products, your account, orders, and shopping inquiries. How may I help you explore our store today?"
- Format all valid store responses clearly with short paragraphs, bold titles, and clean numbered/bullet points without markdown table syntax.`,
            },
            ...updatedMessages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API returned status ${response.status}`);
      }

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Thank you for reaching out! How else may I assist your fragrance journey today?";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: 'Explore Scents', action: 'Can you recommend a perfume for me?' },
          { label: 'Track Order', action: 'How do I track my order?' }
        ]
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Groq API Call failed, falling back to local response:', err);
      generateBotResponse(messageText, now);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = (query: string, timestamp: string) => {
    const q = query.toLowerCase();
    let botMsg: Message;

    if (q.includes('category') || q.includes('categories') || q.includes('department') || q.includes('offer')) {
      botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'At Vellvista, we offer a curated selection across multiple luxury departments:\n1. Fragrances & Niche Perfumes\n2. Luxury Skincare & Serums\n3. Premium Cosmetics & Beauty\n4. Fashion & Designer Apparel\n5. Tech & Premium Accessories',
        timestamp,
        quickActions: [
          { label: 'Explore Fragrances', action: 'Show me bestselling perfumes' },
          { label: 'Skincare Guide', action: 'Tell me about skincare products' }
        ]
      };
    } else if (q.includes('recommend') || q.includes('perfume') || q.includes('scent') || q.includes('fragrance')) {
      botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'For luxury fragrances, we feature iconic scents like Amber Oud Noir, Velvet Saffron Imperial, and Rose De Mai Pure Elixir.',
        timestamp,
        recommendation: {
          name: 'Amber Oud Noir Eau De Parfum',
          notes: 'Bergamot • Damascus Rose • Royal Oud',
          price: '$240.00',
          image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=300'
        },
        quickActions: [
          { label: 'Other Categories', action: 'What product categories do you offer?' },
          { label: 'Gift Advice', action: 'Suggest luxury gift ideas' }
        ]
      };
    } else if (q.includes('track') || q.includes('order') || q.includes('shipping')) {
      botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'We offer express insured shipping worldwide! To track your order, please navigate to your Account dashboard or enter your 8-digit Order ID here.',
        timestamp,
        quickActions: [
          { label: 'Shipping Info', action: 'What are your delivery times?' },
          { label: 'Return Policy', action: 'What is your return policy?' }
        ]
      };
    } else {
      botMsg = {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Thank you for reaching out! As your ${brandName || 'Vellvista'} Shopping Assistant, I am here to help with all products, categories, orders, or shopping inquiries. How may I assist you today?`,
        timestamp,
        quickActions: [
          { label: 'Browse Store', action: 'What product categories do you offer?' },
          { label: 'Customer Support', action: 'How do I contact customer support?' }
        ]
      };
    }

    setMessages((prev) => [...prev, botMsg]);
  };

  const resetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        <button
          onClick={toggleChat}
          className="relative group bg-primary hover:bg-primary-light text-white p-4 rounded-full shadow-2xl border border-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer focus:outline-none ring-2 ring-black/10"
          aria-label="Toggle AI Fragrance Chatbot"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white transition-transform duration-300 rotate-90" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
          )}

          {/* Glowing Unread Indicator Badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white text-[10px] font-bold text-black border border-gray-300 items-center justify-center">
                1
              </span>
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white text-primary overflow-hidden flex flex-col transition-all duration-300 animate-fade-in ${
            isFullscreen
              ? 'inset-3 sm:inset-6 w-auto h-auto max-w-5xl mx-auto rounded-3xl shadow-2xl border border-gray-300'
              : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border border-gray-200'
          }`}
          style={{ boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)' }}
        >
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-white">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-primary rounded-full"></span>
              </div>
              <div>
                <h3 className="font-medium text-sm text-white flex items-center gap-1.5">
                  Vellvista Bot
                </h3>
                <p className="text-[11px] text-gray-400">Shopping Assistant • Online</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={resetChat}
                title="Reset Chat"
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={toggleChat}
                title="Close"
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
                <div className="flex items-end space-x-2 max-w-[85%]">
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary shrink-0 mb-1 shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-br-none shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-line">{msg.text}</p>
                    ) : (
                      <FormattedMessage content={msg.text} />
                    )}

                    {/* Recommendation Card */}
                    {msg.recommendation && (
                      <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-left">
                        <div className="flex gap-3 items-center">
                          <img
                            src={msg.recommendation.image}
                            alt={msg.recommendation.name}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-gray-900 truncate">
                              {msg.recommendation.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {msg.recommendation.notes}
                            </p>
                            <span className="text-xs font-bold text-gray-900 mt-0.5 inline-block">
                              {msg.recommendation.price}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendMessage(`I would like to view details of ${msg.recommendation?.name}`)}
                          className="mt-2.5 w-full bg-primary hover:bg-primary-light text-white text-[11px] py-1.5 px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="h-3 w-3 text-white" />
                          View Scent Details
                        </button>
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
                  <div className="mt-3 flex flex-wrap gap-1.5 max-w-[95%]">
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
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <Bot className="h-4 w-4" />
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
              placeholder="Ask Fragrance Concierge..."
              className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-primary hover:bg-primary-light disabled:opacity-40 text-white p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
