import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Mail, MapPin, Phone, Send, CheckCircle, AlertCircle, Bot, User } from 'lucide-react';
import { apiUrl } from '../config/api';
import { usePlatform } from '../context/PlatformContext';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: React.ReactNode;
}

export const HelpSupportView: React.FC = () => {
  const { authUser } = usePlatform();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: 'Hi! How can I help you today? Select a question below or type your query.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(apiUrl('/api/support/faqs'))
      .then(r => r.json())
      .then(d => {
        if (d.success) setFaqs(d.faqs || []);
        setLoadingFaqs(false);
      })
      .catch(() => setLoadingFaqs(false));
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, faqs, isTyping]);

  const handleFaqClick = (faq: FAQ) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: faq.question }
    ]);
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', text: faq.answer }
      ]);
    }, 1500);
  };

  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: queryText }]);
    setSubmitting(true);
    setIsTyping(true);

    const data = {
      message: queryText,
      ticket_id: activeTicketId,
      access_token: activeToken,
      guest_name: authUser ? undefined : 'Guest User',
      guest_email: authUser ? undefined : 'guest@thebrandstory.com'
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('sc_auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(apiUrl('/api/support/chat'), {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      
      setIsTyping(false);
      setSubmitting(false);

      if (resData.success) {
        if (!activeTicketId && resData.ticket_id) {
          setActiveTicketId(resData.ticket_id);
          setActiveToken(resData.access_token);
        }

        const isHandoff = resData.reply.includes("I need human assistance") || resData.reply.includes("TRANSFER_TO_HUMAN");
        const secretLink = resData.access_token
          ? `${window.location.origin}/ticket/${resData.ticket_id}/track/${resData.access_token}`
          : `${window.location.origin}/dashboard`;

        if (isHandoff) {
           setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            text: (
              <div className="space-y-2">
                <p>I need human assistance to answer this properly. I have forwarded this entire chat to our support team, and they will get back to you soon on this ticket.</p>
                {resData.access_token && (
                  <div className="bg-black/20 p-3 rounded-lg border border-white/10 mt-2 text-sm">
                    <p className="text-amber-400 font-bold mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Ticket Tracking Link:</p>
                    <a href={secretLink} className="text-blue-400 hover:underline break-all block">{secretLink}</a>
                  </div>
                )}
              </div>
            )
          }]);
        } else {
           setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'bot',
            text: resData.reply
          }]);
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'Failed to submit query: ' + resData.error }]);
      }

    } catch (err) {
      setTimeout(() => {
        setIsTyping(false);
        setSubmitting(false);
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'Network error while submitting query. Please try again.' }]);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#051126] text-slate-200 py-12 px-6 lg:px-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4A338]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start relative z-10">

        {/* LEFT SIDE: Info & Contact */}
        <div className="space-y-10 lg:sticky lg:top-24 pt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Help & Support</h1>
              <div className="w-12 h-12 bg-[#D4A338]/10 rounded-2xl flex items-center justify-center border border-[#D4A338]/30 flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-[#D4A338]" />
              </div>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Welcome to our help center. Need quick answers? Try our smart assistant or submit a custom query on the right.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#D4A338]/10 group-hover:border-[#D4A338]/30 transition-all">
                <MapPin className="w-5 h-5 text-slate-400 group-hover:text-[#D4A338] transition-colors" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-0.5">Address</p>
                <p className="text-slate-200">Noida</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#D4A338]/10 group-hover:border-[#D4A338]/30 transition-all">
                <Mail className="w-5 h-5 text-slate-400 group-hover:text-[#D4A338] transition-colors" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-0.5">Email Us</p>
                <p className="text-slate-200">support@thebrandstory.com</p>
              </div>
            </div>


          </div>
        </div>

        {/* RIGHT SIDE: Chat Assistant Interface */}
        <div className="bg-[#0b1b36]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[70vh] min-h-[550px] max-h-[750px] border-t-white/20 lg:mt-16">

          {/* Chat Header */}
          <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#D4A338]/20 rounded-full flex items-center justify-center border border-[#D4A338]/40 relative">
              <Bot className="w-6 h-6 text-[#D4A338]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b1b36]"></div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Support Assistant</h3>
              <p className="text-xs text-emerald-400 font-medium">Online • Typically replies instantly</p>
            </div>
          </div>

          {/* Chat Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <Bot className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${msg.sender === 'user'
                    ? 'bg-[#D4A338] text-slate-900 rounded-br-sm'
                    : 'bg-white/10 text-slate-200 rounded-bl-sm border border-white/5'
                    }`}>
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Quick Replies (FAQs) - Rendered only under the first welcome message */}
                {msg.id === '1' && !loadingFaqs && faqs.length > 0 && (
                  <div className="pl-11 pr-4 flex flex-col items-start gap-2 mt-2 animate-fadeIn">
                    {faqs.map(faq => (
                      <button
                        key={faq.id}
                        onClick={() => handleFaqClick(faq)}
                        className="text-left px-4 py-2.5 bg-[#D4A338]/10 hover:bg-[#D4A338]/20 text-[#D4A338] border border-[#D4A338]/30 rounded-xl text-sm font-medium transition-colors"
                      >
                        Q: {faq.question}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Bot className="w-4 h-4 text-slate-400" />
                </div>
                <div className="max-w-[80%] md:max-w-[70%] p-4 rounded-2xl bg-white/10 text-slate-200 rounded-bl-sm border border-white/5">
                  <div className="flex gap-1.5 items-center h-5 px-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-black/20 border-t border-white/10">
            <form onSubmit={handleCustomQuery} className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-[#D4A338]/50 focus-within:bg-white/10 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) handleCustomQuery(e);
                  }
                }}
                placeholder="Ask something or write your query..."
                className="flex-1 bg-transparent border-none text-white px-3 py-2 text-[15px] focus:outline-none resize-none max-h-32 min-h-[44px] custom-scrollbar"
                rows={1}
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || submitting}
                className="w-11 h-11 bg-[#D4A338] hover:bg-[#be8f2b] disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
            <p className="text-center text-[11px] text-slate-500 mt-3 font-medium">
              If your query is not answered, typing here will submit a direct ticket to our team.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
