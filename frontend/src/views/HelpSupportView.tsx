import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Send, AlertCircle, Bot, User, Check, MessageSquare, RotateCcw, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
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
  sender: 'bot' | 'user' | 'admin';
  text: React.ReactNode;
  timestamp: string;
  isOptionsCard?: boolean;
  isResolutionPrompt?: boolean;
}

export const HelpSupportView: React.FC = () => {
  const { authUser } = usePlatform();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(() => {
    return sessionStorage.getItem('sc_support_active_ticket') || null;
  });
  const [activeToken, setActiveToken] = useState<string | null>(() => {
    return sessionStorage.getItem('sc_support_active_token') || null;
  });
  const [showInputBar, setShowInputBar] = useState(true);
  const [isResolved, setIsResolved] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const seenReplyIdsRef = useRef<Set<string>>(new Set());

  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clean raw question string (strip leading Q: or Q : if present)
  const cleanQuestion = (q: string) => {
    return q.replace(/^Q\s*:\s*/i, '').trim();
  };

  const getUserFirstName = () => {
    if (authUser?.name) {
      return authUser.name.trim().split(' ')[0];
    }
    return 'there';
  };

  // Initialize normal conversation greeting
  const initChatFlow = (faqList: FAQ[]) => {
    const time = formatCurrentTime();
    const userName = getUserFirstName();

    const initialMsgs: ChatMessage[] = [
      {
        id: 'msg-greeting',
        sender: 'bot',
        text: (
          <div>
            <p className="font-semibold text-amber-300/90 text-xs tracking-wider uppercase mb-1">Assistant</p>
            <p className="text-[15px] font-medium text-white">Hi {userName}!</p>
            <p className="text-slate-200 text-sm mt-0.5">Welcome to The Brand Story support.</p>
          </div>
        ),
        timestamp: time
      },
      {
        id: 'msg-help-prompt',
        sender: 'bot',
        text: (
          <div>
            <p className="font-semibold text-amber-300/90 text-xs tracking-wider uppercase mb-1">Assistant</p>
            <p className="text-[14.5px] text-slate-100 font-medium">How may I help you today?</p>
          </div>
        ),
        timestamp: time
      }
    ];

    setMessages(initialMsgs);
    setShowInputBar(true);
    setIsResolved(false);
    setSelectedFaqId(null);
  };

  useEffect(() => {
    fetch(apiUrl('/api/support/faqs'))
      .then(r => r.json())
      .then(d => {
        const loadedFaqs = d.success ? (d.faqs || []) : [];
        setFaqs(loadedFaqs);
        setLoadingFaqs(false);
        initChatFlow(loadedFaqs);
      })
      .catch(() => {
        setLoadingFaqs(false);
        initChatFlow([]);
      });
  }, [authUser]);

  // Check for active open ticket if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('sc_auth_token');
    const syncUrl = activeTicketId
      ? apiUrl(`/api/support/chat/sync?ticket_id=${activeTicketId}${activeToken ? `&access_token=${activeToken}` : ''}`)
      : apiUrl('/api/support/chat/sync');

    fetch(syncUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.ticket_id) {
          setActiveTicketId(d.ticket_id);
          sessionStorage.setItem('sc_support_active_ticket', d.ticket_id);
          if (d.access_token) {
            setActiveToken(d.access_token);
            sessionStorage.setItem('sc_support_active_token', d.access_token);
          }
          if (d.status === 'Resolved' || d.status === 'Closed') {
            setIsResolved(true);
          }
        }
      })
      .catch(() => {});
  }, [authUser]);

  // Real-time synchronization polling for Admin replies & ticket status updates
  useEffect(() => {
    if (!activeTicketId) return;

    let isSubscribed = true;

    const syncReplies = async () => {
      try {
        const token = localStorage.getItem('sc_auth_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const url = apiUrl(`/api/support/chat/sync?ticket_id=${activeTicketId}${activeToken ? `&access_token=${activeToken}` : ''}`);
        const res = await fetch(url, { headers });
        const data = await res.json();

        if (isSubscribed && data.success && Array.isArray(data.replies)) {
          if (data.status === 'Resolved' || data.status === 'Closed') {
            setIsResolved(true);
          }

          const newAdminMessages: ChatMessage[] = [];
          data.replies.forEach((rep: any) => {
            if (!seenReplyIdsRef.current.has(rep.id)) {
              seenReplyIdsRef.current.add(rep.id);
              if (rep.sender_role === 'ADMIN') {
                const time = rep.created_at
                  ? new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : formatCurrentTime();
                newAdminMessages.push({
                  id: rep.id,
                  sender: 'admin',
                  text: rep.message,
                  timestamp: time
                });
              }
            }
          });

          if (newAdminMessages.length > 0) {
            setMessages(prev => [...prev, ...newAdminMessages]);
            setShowInputBar(true); // Open input bar so user can continue conversation with Admin
          }
        }
      } catch (err) {
        // silent polling catch
      }
    };

    // Immediate sync
    syncReplies();

    // Poll every 2.5 seconds
    const interval = setInterval(syncReplies, 2500);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeTicketId, activeToken]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping, showInputBar, isResolved]);

  // Handle FAQ item selection
  const handleSelectFaq = (faq: FAQ) => {
    const qClean = cleanQuestion(faq.question);
    const time = formatCurrentTime();
    setSelectedFaqId(faq.id);

    // 1. Add user selected message
    setMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: qClean,
        timestamp: time
      }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botTime = formatCurrentTime();

      setMessages(prev => [
        ...prev,
        {
          id: 'bot-ans-' + Date.now(),
          sender: 'bot',
          text: (
            <div>
              <p className="font-semibold text-amber-300/90 text-xs tracking-wider uppercase mb-1">Assistant</p>
              <div className="text-[14px] leading-relaxed text-slate-100 whitespace-pre-line">{faq.answer}</div>
            </div>
          ),
          timestamp: botTime
        },
        {
          id: 'bot-res-' + Date.now(),
          sender: 'bot',
          text: (
            <div>
              <p className="text-sm font-medium text-slate-200">Did this resolve your issue?</p>
            </div>
          ),
          timestamp: botTime,
          isResolutionPrompt: true
        }
      ]);
    }, 700);
  };

  // Handle "I have a different issue / Chat with support"
  const handleOpenChatMode = (reasonText?: string) => {
    const time = formatCurrentTime();
    const userMsg = reasonText || "I need help with something else";

    setMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: userMsg,
        timestamp: time
      }
    ]);

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botTime = formatCurrentTime();

      setMessages(prev => [
        ...prev,
        {
          id: 'bot-chat-prompt-' + Date.now(),
          sender: 'bot',
          text: (
            <div>
              <p className="font-semibold text-amber-300/90 text-xs tracking-wider uppercase mb-1">Assistant</p>
              <p className="text-[14.5px] text-slate-100">
                Please describe your issue below so our team and smart assistant can assist you better.
              </p>
            </div>
          ),
          timestamp: botTime
        }
      ]);
      setShowInputBar(true);
    }, 600);
  };

  // Handle Issue Resolved
  const handleMarkResolved = () => {
    const time = formatCurrentTime();
    setMessages(prev => [
      ...prev,
      {
        id: 'user-resolved-' + Date.now(),
        sender: 'user',
        text: "Yes, my issue is resolved. Thank you!",
        timestamp: time
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setIsResolved(true);
      setShowInputBar(false);
    }, 500);
  };

  // Send custom query through input bar
  const handleCustomQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const queryText = inputValue.trim();
    const time = formatCurrentTime();
    setInputValue('');
    setMessages(prev => [
      ...prev,
      {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: queryText,
        timestamp: time
      }
    ]);
    setSubmitting(true);
    setIsTyping(true);

    const userRoleToSend = authUser?.role
      ? (authUser.role === 'CREATOR' ? 'INFLUENCER' : authUser.role)
      : 'GUEST';

    const data = {
      message: queryText,
      ticket_id: activeTicketId,
      access_token: activeToken,
      guest_name: authUser?.name || 'Guest User',
      guest_email: authUser?.email || 'guest@thebrandstory.com',
      user_id: authUser?.id || null,
      user_role: userRoleToSend
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
        if (resData.ticket_id) {
          setActiveTicketId(resData.ticket_id);
          sessionStorage.setItem('sc_support_active_ticket', resData.ticket_id);
          if (resData.access_token) {
            setActiveToken(resData.access_token);
            sessionStorage.setItem('sc_support_active_token', resData.access_token);
          }
        }

        const isHandoff = resData.reply.includes("I need human assistance") || resData.reply.includes("TRANSFER_TO_HUMAN");
        const secretLink = resData.access_token
          ? `${window.location.origin}/ticket/${resData.ticket_id}/track/${resData.access_token}`
          : `${window.location.origin}/dashboard`;

        const botTime = formatCurrentTime();

        if (isHandoff) {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              timestamp: botTime,
              text: (
                <div className="space-y-2">
                  <p className="font-semibold text-amber-300/90 text-xs tracking-wider uppercase mb-1">Assistant</p>
                  <p className="text-[14.5px] leading-relaxed text-slate-100">
                    I have forwarded this entire chat to our human support team, and our representative will reply soon.
                  </p>
                  {resData.access_token && (
                    <div className="bg-black/30 p-3 rounded-xl border border-white/10 mt-2 text-xs">
                      <p className="text-amber-400 font-bold mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Ticket Tracking Link:
                      </p>
                      <a href={secretLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all block">
                        {secretLink}
                      </a>
                    </div>
                  )}
                </div>
              )
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: 'bot-' + Date.now(),
              sender: 'bot',
              timestamp: botTime,
              text: (
                <div>
                  <p className="font-semibold text-amber-300/90 text-xs tracking-wider uppercase mb-1">Assistant</p>
                  <p className="text-[14.5px] leading-relaxed text-slate-100 whitespace-pre-wrap">{resData.reply}</p>
                </div>
              )
            }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-err-' + Date.now(),
            sender: 'bot',
            timestamp: formatCurrentTime(),
            text: 'Failed to submit query: ' + resData.error
          }
        ]);
      }
    } catch (err) {
      setIsTyping(false);
      setSubmitting(false);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          timestamp: formatCurrentTime(),
          text: 'Network error while submitting query. Please try again.'
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#051126] text-slate-200 py-6 sm:py-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4A338]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.25fr] gap-8 lg:gap-12 items-start relative z-10">

        {/* LEFT SIDE: Info (hidden on mobile, shown on desktop) */}
        <div className="hidden lg:block space-y-4 lg:sticky lg:top-24 pt-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Help & Support</h1>
            <div className="w-12 h-12 bg-[#D4A338]/10 rounded-2xl flex items-center justify-center border border-[#D4A338]/30 flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-[#D4A338]" />
            </div>
          </div>
          <p className="text-slate-400 text-base md:text-lg max-w-md leading-relaxed">
            Welcome to our help center. Select your issue or chat with our 24/7 support assistant for instant resolution.
          </p>
        </div>

        {/* RIGHT SIDE: Chat Interface */}
        <div className="bg-[#0b1b36]/80 backdrop-blur-xl border border-white/10 rounded-[1.75rem] shadow-2xl overflow-hidden flex flex-col h-[75vh] min-h-[520px] sm:min-h-[580px] max-h-[750px] border-t-white/20 w-full">

          {/* Chat Header (Zomato-Style) */}
          <div className="bg-slate-900/60 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4A338]/50 relative flex-shrink-0 shadow-md bg-slate-800">
                <img
                  src="/support-agent.png"
                  alt="Support Agent"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0b1b36]"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Support Assistant</h3>
                <p className="text-[11px] text-slate-400">Your personal virtual assistant</p>
              </div>
            </div>

            <button
              onClick={() => initChatFlow(faqs)}
              title="Reset Conversation"
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Today Divider */}
          <div className="flex justify-center my-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-0.5 rounded-full border border-white/5">
              Today
            </span>
          </div>

          {/* Chat Messages Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-4 custom-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4A338]/40 mr-2.5 mt-1 flex-shrink-0 shadow-sm bg-slate-800">
                      <img src="/support-agent.png" alt="Agent" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {msg.sender === 'admin' && (
                    <div className="w-7 h-7 rounded-full border border-amber-400 mr-2.5 mt-1 flex-shrink-0 shadow-md bg-amber-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/40'
                        : msg.sender === 'admin'
                        ? 'bg-[#1b2f57] text-white rounded-tl-sm border-2 border-amber-400/50 shadow-xl'
                        : 'bg-[#182744] text-slate-100 rounded-tl-sm border border-white/10'
                    }`}
                  >
                    {msg.sender === 'admin' && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/10">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Support Team (Admin)
                        </span>
                      </div>
                    )}
                    <div className="text-[14px] leading-relaxed text-white">
                      {msg.text}
                    </div>
                    <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'user' && (
                        <span className="text-white font-bold text-xs inline-flex items-center ml-0.5">✓✓</span>
                      )}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-full flex items-center justify-center ml-2.5 mt-1 flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-300" />
                    </div>
                  )}
                </div>



                {/* Resolution Prompt Buttons (Did this resolve your issue?) */}
                {msg.isResolutionPrompt && !isResolved && (
                  <div className="pl-9 pr-2 sm:pr-8 flex flex-wrap gap-2 pt-1 animate-fadeIn">
                    <button
                      onClick={handleMarkResolved}
                      className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Yes, issue resolved
                    </button>
                    <button
                      onClick={() => handleOpenChatMode("I still need help with this")}
                      className="px-4 py-2 bg-[#D4A338]/15 hover:bg-[#D4A338]/25 text-[#D4A338] border border-[#D4A338]/30 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      No, I want to chat with Support
                    </button>
                    <button
                      onClick={() => initChatFlow(faqs)}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      Select another topic
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Resolved Conversation Notice (Zomato Style) */}
            {isResolved && (
              <div className="my-4 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 text-xs sm:text-sm animate-fadeIn">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>This conversation has been closed and marked as resolved.</span>
                </div>
                <button
                  onClick={() => initChatFlow(faqs)}
                  className="px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 rounded-lg text-xs font-semibold text-white whitespace-nowrap transition-colors"
                >
                  Start New
                </button>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#D4A338]/40 mr-2.5 mt-1 flex-shrink-0 shadow-sm bg-slate-800">
                  <img src="/support-agent.png" alt="Agent" className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#182744] border border-white/10 rounded-tl-sm">
                  <div className="flex gap-1.5 items-center h-4 px-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 bg-slate-900/80 border-t border-white/10 animate-fadeIn">
            <form onSubmit={handleCustomQuery} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-[#D4A338]/60 focus-within:bg-white/10 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) handleCustomQuery(e);
                  }
                }}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent border-none text-white px-3 py-2 text-sm focus:outline-none resize-none max-h-24 min-h-[40px] custom-scrollbar placeholder:text-slate-400"
                rows={1}
                disabled={submitting}
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || submitting}
                className="w-10 h-10 bg-[#D4A338] hover:bg-[#be8f2b] disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
            <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
              Our support team & AI assistant will review and respond directly.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

