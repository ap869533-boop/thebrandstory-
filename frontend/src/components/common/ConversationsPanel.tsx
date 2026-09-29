import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  Star,
  Search,
  ArrowLeft,
  X,
  CheckCheck,
  Smile,
  Paperclip,
  Check,
} from 'lucide-react';
import { apiUrl, authHeaders } from '../../config/api';
import type { ChatMessage, ConversationThread } from '../../types';
import { usePlatform } from '../../context/PlatformContext';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

// WhatsApp-style clearly visible WHITE doodle SVG background pattern (high contrast)
const WHATSAPP_DOODLE_WHITE_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="380" height="380" viewBox="0 0 380 380" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <!-- Chat Bubble 1 -->
  <path d="M40 45h46a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8h-28l-14 12V81a8 8 0 0 1-4-8V53a8 8 0 0 1 8-8z"/>
  <circle cx="54" cy="63" r="1.8" fill="rgba(255,255,255,0.22)"/>
  <circle cx="63" cy="63" r="1.8" fill="rgba(255,255,255,0.22)"/>
  <circle cx="72" cy="63" r="1.8" fill="rgba(255,255,255,0.22)"/>

  <!-- Camera -->
  <rect x="235" y="38" width="46" height="30" rx="6"/>
  <circle cx="258" cy="53" r="8"/>
  <path d="M243 38l3-6h16l3 6"/>
  <circle cx="273" cy="45" r="1.5" fill="rgba(255,255,255,0.22)"/>

  <!-- Music Notes -->
  <path d="M150 62V35l28-7v28"/>
  <circle cx="144" cy="64" r="6" fill="rgba(255,255,255,0.22)"/>
  <circle cx="172" cy="56" r="6" fill="rgba(255,255,255,0.22)"/>

  <!-- Heart -->
  <path d="M330 115c-9-13-26-4-26 10 0 14 22 27 26 31 4-4 26-17 26-31 0-14-17-23-26-10z"/>

  <!-- Paper Plane -->
  <path d="M55 155l54 18-28 9-9 27z"/>
  <path d="M109 173l-28 9"/>

  <!-- Coffee Cup -->
  <path d="M210 145h28v22a8 8 0 0 1-8 8h-12a8 8 0 0 1-8-8v-22z"/>
  <path d="M238 150h7a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-7"/>
  <path d="M216 137c0-3 3-5 5-8M225 137c0-3 3-5 5-8"/>

  <!-- Star -->
  <polygon points="150,130 153,139 162,139 155,145 158,154 150,148 142,154 145,145 138,139 147,139"/>

  <!-- Sparkles -->
  <path d="M48 245v16M40 253h16M270 235v14M263 242h14"/>

  <!-- Headphones -->
  <path d="M125 230a22 22 0 0 1 44 0v14h-9v-14a13 13 0 0 0-26 0v14h-9z"/>
  <rect x="120" y="235" width="9" height="14" rx="2.5"/>
  <rect x="165" y="235" width="9" height="14" rx="2.5"/>

  <!-- Clock -->
  <circle cx="315" cy="250" r="16"/>
  <path d="M315 241v9l7 4"/>

  <!-- Mobile phone -->
  <rect x="50" y="300" width="22" height="38" rx="4"/>
  <line x1="57" y1="332" x2="65" y2="332"/>

  <!-- Chat Bubble 2 -->
  <path d="M210 300h42a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8h-20l-12 9v-9h-10a8 8 0 0 1-8-8v-18a8 8 0 0 1 8-8z"/>

  <!-- Smiley Face -->
  <circle cx="145" cy="310" r="15"/>
  <circle cx="140" cy="306" r="1.6" fill="rgba(255,255,255,0.22)"/>
  <circle cx="150" cy="306" r="1.6" fill="rgba(255,255,255,0.22)"/>
  <path d="M139 314a6 6 0 0 0 12 0"/>
</svg>
`)}`;

export const ConversationsPanel: React.FC<{
  openConversationId?: string | null;
  fullPage?: boolean;
}> = ({ openConversationId, fullPage = false }) => {
  const { authUser } = usePlatform();
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(openConversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Review states (Top right button toggle)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewMsg, setReviewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingReview, setSavingReview] = useState(false);

  // Chat enhancements
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // WhatsApp-style "Contact Info" Drawer State (View-Only)
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showEnlargedPhoto, setShowEnlargedPhoto] = useState(false);

  // Mobile navigation state
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(openConversationId));

  const listRef = useRef<HTMLDivElement>(null);

  // Robust Avatar URL resolver with ui-avatars fallback
  const getPeerAvatar = (avatar: string | null | undefined, name: string) => {
    if (!avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0f172a&color=D4A338&bold=true`;
    }
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    return apiUrl(avatar);
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0f172a&color=D4A338&bold=true`;
  };

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/conversations'), { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setThreads(data.conversations);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/conversations/${id}/messages`), { headers: authHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!authUser) return;
    void loadThreads();
    const heartbeat = window.setInterval(() => {
      fetch(apiUrl('/api/presence/heartbeat'), { method: 'POST', headers: authHeaders() }).catch(() => undefined);
    }, 45000);
    fetch(apiUrl('/api/presence/heartbeat'), { method: 'POST', headers: authHeaders() }).catch(() => undefined);
    const poll = window.setInterval(() => {
      void loadThreads();
    }, 2500);
    return () => {
      window.clearInterval(heartbeat);
      window.clearInterval(poll);
    };
  }, [authUser, loadThreads]);

  useEffect(() => {
    if (openConversationId) {
      setActiveId(openConversationId);
      setMobileShowChat(true);
    }
  }, [openConversationId]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    const poll = window.setInterval(() => {
      void loadMessages(activeId);
    }, 2000);
    return () => window.clearInterval(poll);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  const active = threads.find((t) => t.id === activeId) || null;
  const revieweeLabel = authUser?.role === 'BRAND' ? 'Creator' : 'Brand';

  // Filter threads by search input
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(
      (t) =>
        t.peerName.toLowerCase().includes(q) ||
        (t.lastMessage && t.lastMessage.toLowerCase().includes(q))
    );
  }, [threads, searchQuery]);

  // Handle typing indicator
  useEffect(() => {
    if (!activeId) return;
    const isTyping = draft.trim().length > 0;
    
    if (isTyping) {
      fetch(apiUrl(`/api/conversations/${activeId}/typing`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ isTyping: true }),
      }).catch(() => {});
    }

    const timer = setTimeout(() => {
      fetch(apiUrl(`/api/conversations/${activeId}/typing`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ isTyping: false }),
      }).catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, [draft, activeId]);

  const send = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeId || sending || uploadingAttachment) return;
    
    // Allow sending if there's text OR an attachment
    const textToSend = draft.trim();
    if (!textToSend && !attachment) return;
    
    setSending(true);

    try {
      let attachmentUrl = null;
      let attachmentType = null;
      let attachmentName = null;

      if (attachment) {
        setUploadingAttachment(true);
        // Ensure size under 50MB
        if (attachment.size > 50 * 1024 * 1024) {
           alert("Attachment too large. Maximum size is 50MB.");
           setUploadingAttachment(false);
           setSending(false);
           return;
        }

        const base64 = await new Promise<string>((resolve) => {
           const reader = new FileReader();
           reader.onload = () => resolve(reader.result as string);
           reader.readAsDataURL(attachment);
        });

        const uploadRes = await fetch(apiUrl('/api/upload'), {
           method: 'POST',
           headers: authHeaders(),
           body: JSON.stringify({
              image: base64,
              creatorId: authUser.id,
              type: 'chat_attachment'
           })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
           attachmentUrl = uploadData.url;
           attachmentName = attachment.name;
           if (attachment.type.startsWith('image/')) attachmentType = 'image';
           else if (attachment.type.startsWith('video/')) attachmentType = 'video';
           else if (attachment.type === 'application/pdf') attachmentType = 'pdf';
           else attachmentType = 'file';
        }
        setUploadingAttachment(false);
      }

      const res = await fetch(apiUrl(`/api/conversations/${activeId}/messages`), {
        method: 'POST',
        headers: authHeaders(),
        // Send 'body' as textToSend, which handles empty strings gracefully.
        body: JSON.stringify({ body: textToSend || '', attachmentUrl, attachmentType, attachmentName }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setDraft('');
        setAttachment(null);
        setShowEmojiPicker(false);
        void loadThreads();
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
      } else {
        console.error("Message send failed:", data);
        alert("Failed to send message.");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // ignore
      setUploadingAttachment(false);
    } finally {
      setSending(false);
      setUploadingAttachment(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || savingReview) return;
    setReviewMsg(null);
    setSavingReview(true);
    try {
      const res = await fetch(apiUrl('/api/conversations/reviews'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ conversationId: activeId, rating: reviewRating, reviewText }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewMsg({ type: 'success', text: 'Thank you! Your review has been saved securely.' });
        setReviewText('');
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewMsg(null);
        }, 1800);
      } else {
        setReviewMsg({ type: 'error', text: data.error || 'Could not save review.' });
      }
    } catch {
      setReviewMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSavingReview(false);
    }
  };

  const formatMsgTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const formatThreadTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  if (!authUser) return null;

  return (
    <div
      className={`relative w-full rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#0c1322] grid grid-cols-1 md:grid-cols-12 ${
        fullPage ? 'h-[calc(100vh-12rem)] min-h-[580px]' : 'min-h-[560px] h-[640px]'
      }`}
    >
      {/* ========================================================
          LEFT SIDEBAR: CONVERSATION LIST (WhatsApp Web Theme)
      ======================================================== */}
      <aside
        className={`md:col-span-4 lg:col-span-4 bg-[#0e172a] border-r border-white/10 flex flex-col h-full ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 px-4 bg-[#111c34] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D4A338]/15 border border-[#D4A338]/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#D4A338]" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white tracking-wide">Chats</h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {threads.length} {threads.length === 1 ? 'conversation' : 'conversations'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 px-3 bg-[#0c1527] border-b border-white/5">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full pl-9 pr-3 py-2 bg-[#17233d] text-xs text-white placeholder-slate-400 rounded-xl border border-white/5 focus:border-[#D4A338]/50 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-[#D4A338] border-t-transparent rounded-full animate-spin" />
              <span>Loading chats...</span>
            </div>
          )}

          {!loading && threads.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-300">No conversations yet</p>
              <p className="text-[11px] text-slate-500">
                When you or a brand start a chat from a campaign pitch or inquiry, it will appear here.
              </p>
            </div>
          )}

          {!loading && threads.length > 0 && filteredThreads.length === 0 && (
            <p className="p-6 text-center text-xs text-slate-400">No chats found for "{searchQuery}"</p>
          )}

          {filteredThreads.map((t) => {
            const isSelected = activeId === t.id;
            const avatarUrl = getPeerAvatar(t.peerAvatar, t.peerName);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveId(t.id);
                  setMobileShowChat(true);
                }}
                className={`w-full text-left px-3.5 py-3 flex items-center gap-3 transition relative group ${
                  isSelected
                    ? 'bg-[#182748] border-l-4 border-l-[#D4A338]'
                    : 'hover:bg-[#121f3a]'
                }`}
              >
                {/* Peer Avatar with status ring */}
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt={t.peerName}
                    onError={(e) => handleAvatarError(e, t.peerName)}
                    className="w-11 h-11 rounded-full object-cover border border-white/10 bg-[#16233d]"
                  />
                  {t.online && (
                    <span
                      title="Online"
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e172a]"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`font-bold text-xs truncate ${
                        isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {t.peerName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatThreadTime(t.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 truncate flex-1 leading-snug">
                      {t.peerTyping ? (
                        <span className="text-[#D4A338] italic font-medium animate-pulse">
                          typing...
                        </span>
                      ) : (
                        t.lastMessage || 'Click to open conversation'
                      )}
                    </p>
                    {t.unreadCount > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#D4A338] text-black text-[10px] font-black flex items-center justify-center shadow-md">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ========================================================
          RIGHT PANEL: ACTIVE CHAT SCREEN (WhatsApp Styled)
      ======================================================== */}
      <section
        className={`md:col-span-8 lg:col-span-8 flex flex-col h-full bg-[#08101e] relative ${
          !mobileShowChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {!active && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#091222] select-none">
            <div className="w-16 h-16 rounded-3xl bg-[#D4A338]/10 border border-[#D4A338]/20 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#D4A338]" />
            </div>
            <h3 className="text-base font-bold text-slate-200">The Brand Story Live Messenger</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              Select a conversation from the left to start chatting with verified creators and brands.
            </p>
          </div>
        )}

        {active && (
          <>
            {/* Top Bar: Clickable Peer Info (Opens Contact info) + Top Right "Save Review" Button */}
            <header className="px-4 py-3 bg-[#0f1b34] border-b border-white/10 flex items-center justify-between gap-3 shrink-0 z-10 shadow-sm">
              {/* Clickable Profile Info Section (Opens WhatsApp Contact info drawer) */}
              <div
                onClick={() => setShowContactInfo(true)}
                className="flex items-center gap-3 min-w-0 cursor-pointer group"
                title="Click to view Contact info"
              >
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileShowChat(false);
                  }}
                  className="md:hidden p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
                  title="Back to chats"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Peer Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={getPeerAvatar(active.peerAvatar, active.peerName)}
                    alt={active.peerName}
                    onError={(e) => handleAvatarError(e, active.peerName)}
                    className="w-10 h-10 rounded-full object-cover border border-white/15 bg-[#16233d] group-hover:ring-2 group-hover:ring-[#D4A338] transition"
                  />
                  {active.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0f1b34]" />
                  )}
                </div>

                {/* Peer Name & Status */}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-white truncate leading-tight group-hover:text-[#D4A338] transition flex items-center gap-1.5">
                    <span>{active.peerName}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    {active.peerTyping ? (
                      <span className="text-[#D4A338] italic font-medium animate-pulse">
                        typing...
                      </span>
                    ) : (
                      <>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            active.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        {active.online ? 'Online' : 'Offline'}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Side Top "Save Review" Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReviewModal((prev) => !prev)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                    showReviewModal
                      ? 'bg-[#D4A338] text-black border-[#D4A338]'
                      : 'bg-[#D4A338]/10 hover:bg-[#D4A338]/20 text-[#e6b955] border-[#D4A338]/40'
                  }`}
                  title={`Rate & Review ${active.peerName}`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Save Review</span>
                </button>
              </div>
            </header>

            {/* Collapsible / Floating Review Drawer (Opened via Top Right Button) */}
            {showReviewModal && (
              <div className="absolute top-[62px] left-0 right-0 z-20 p-4 bg-[#0e1933]/95 backdrop-blur-md border-b border-[#D4A338]/30 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                <div className="max-w-xl mx-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#D4A338] fill-[#D4A338]" />
                      <h4 className="font-bold text-xs text-white">Rate & Review {active.peerName}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-3">
                    Share your experience working with this {revieweeLabel.toLowerCase()}. Your rating will be recorded with this collaboration.
                  </p>

                  <form onSubmit={submitReview} className="space-y-3">
                    {/* Interactive Star Rating */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-2 font-medium">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              (hoverRating !== null ? hoverRating >= star : reviewRating >= star)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-300 ml-2">
                        {hoverRating !== null ? hoverRating : reviewRating} Star
                        {(hoverRating !== null ? hoverRating : reviewRating) > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Review text input */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={`Write your honest feedback for ${active.peerName}...`}
                        minLength={5}
                        required
                        className="flex-1 px-3 py-2 bg-[#172545] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A338]"
                      />
                      <button
                        type="submit"
                        disabled={savingReview || !reviewText.trim()}
                        className="px-4 py-2 bg-[#D4A338] hover:bg-[#e2b047] text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {savingReview ? (
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Submit Review</span>
                      </button>
                    </div>

                    {reviewMsg && (
                      <p
                        className={`text-xs font-semibold ${
                          reviewMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {reviewMsg.text}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Main Chat Area With Optional Right Side "Contact Info" Drawer */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* ========================================================
                  CHAT MESSAGES AREA: Crisp White WhatsApp Doodle Pattern
              ======================================================== */}
              <div
                ref={listRef}
                style={{
                  backgroundColor: '#091222',
                  backgroundImage: `url("${WHATSAPP_DOODLE_WHITE_DATA_URL}")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '240px 240px',
                }}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar transition-all"
              >
                {/* Security Notice */}
                <div className="flex justify-center my-2">
                  <span className="px-3.5 py-1.5 rounded-xl text-[11px] text-amber-200/90 bg-[#162238]/95 backdrop-blur border border-amber-500/20 text-center max-w-md shadow-sm">
                    🔒 Messages are end-to-end encrypted on The Brand Story platform.
                  </span>
                </div>

                {/* Date separator pill */}
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-[#121c32]/95 border border-white/10 shadow-sm">
                    Conversation History
                  </span>
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-400">
                    <p className="bg-[#121c32]/90 inline-block px-4 py-2 rounded-2xl border border-white/5">
                      No messages yet. Send a message below to start chatting!
                    </p>
                  </div>
                )}

                {messages.map((m) => {
                  const mine = m.senderId === authUser.id;

                  return (
                    <div key={m.id} className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                          mine
                            ? 'bg-[#005c4b] text-white rounded-tr-xs'
                            : 'bg-[#1f2c34] text-slate-100 rounded-tl-xs border border-white/5'
                        }`}
                      >
                        {/* Attachment Rendering */}
                        {m.attachmentUrl && (
                          <div className="mb-2">
                            {m.attachmentType === 'image' ? (
                              <img src={apiUrl(m.attachmentUrl)} alt={m.attachmentName || 'Attachment'} className="max-w-full rounded-lg max-h-[300px] object-contain bg-black/20" />
                            ) : m.attachmentType === 'video' ? (
                              <video src={apiUrl(m.attachmentUrl)} controls className="max-w-full rounded-lg max-h-[300px] object-contain bg-black/20" />
                            ) : (
                              <a href={apiUrl(m.attachmentUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-300 hover:underline break-all bg-black/20 p-2.5 rounded-lg">
                                <Paperclip className="w-4 h-4 shrink-0" /> 
                                <span className="line-clamp-2 font-medium">{m.attachmentName || 'Document'}</span>
                              </a>
                            )}
                            <p className="text-[9px] text-white/50 mt-1.5 italic font-medium leading-tight opacity-80">
                              (Auto-deletes in 15 days)
                            </p>
                          </div>
                        )}

                        {/* Message Content */}
                        {m.body && <p className="leading-relaxed whitespace-pre-wrap break-words text-[13px]">{m.body}</p>}

                        {/* Timestamp & Delivery status */}
                        <div className="flex items-center justify-end gap-1 mt-1 select-none">
                          <span className="text-[10px] text-white/70 font-medium">
                            {formatMsgTime(m.createdAt)}
                          </span>
                          {mine && (
                            <CheckCheck
                              className={`w-3.5 h-3.5 ${m.isRead ? 'text-[#53bdeb]' : 'text-white/60'}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ========================================================
                  WHATSAPP "CONTACT INFO" DRAWER (Requested in Screenshot 2)
              ======================================================== */}
              {showContactInfo && (
                <div className="absolute inset-y-0 right-0 w-full sm:w-80 md:w-88 lg:w-96 bg-[#0c162c] border-l border-white/10 flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
                  {/* Top Header: [X] Close | Contact info (View Only — No Edit) */}
                  <div className="p-3.5 px-4 bg-[#101e3a] border-b border-white/10 flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowContactInfo(false)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="font-bold text-sm text-white">Contact info</h3>
                  </div>

                  {/* Body: View-Only Large Profile Photo + Name */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar">
                    {/* Large Profile Picture — View Only, no camera/edit overlay */}
                    <div className="mt-3">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/15 shadow-2xl bg-[#13213d]">
                        <img
                          src={getPeerAvatar(active.peerAvatar, active.peerName)}
                          alt={active.peerName}
                          onError={(e) => handleAvatarError(e, active.peerName)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Name — View Only, no pencil/edit button */}
                    <div className="mt-6 w-full text-center">
                      <h2 className="text-xl font-bold text-white tracking-wide">
                        {active.peerName}
                      </h2>

                      {/* Online Status */}
                      <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            active.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        {active.online ? 'Online' : 'Offline'}
                      </p>

                      {/* Premium Divider */}
                      <div className="mt-6 w-full border-t border-white/10" />

                      {/* Role badge */}
                      <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A338]/10 border border-[#D4A338]/30 text-[#D4A338] text-xs font-bold">
                        {active.peerName}
                      </div>

                      <p className="mt-3 text-[11px] text-slate-500">
                        Messages are private and encrypted on The Brand Story platform.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================
                BOTTOM INPUT BAR (WhatsApp Style)
            ======================================================== */}
            <div className="relative">
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 z-50 mb-2">
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={(emojiData: EmojiClickData) => {
                      setDraft((prev) => prev + emojiData.emoji);
                    }}
                  />
                </div>
              )}

              {attachment && (
                <div className="absolute bottom-full left-0 mb-2 p-2 mx-3 bg-[#1f2c34] rounded-xl border border-white/10 flex items-center gap-3 shadow-lg max-w-sm">
                  <div className="flex flex-col flex-1 truncate">
                    <span className="text-white text-xs font-bold truncate">{attachment.name}</span>
                    <span className="text-slate-400 text-[10px]">{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button type="button" onClick={() => setAttachment(null)} className="text-slate-400 hover:text-white p-1 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachment(e.target.files[0]);
                    setShowEmojiPicker(false);
                  }
                }}
              />

              <form
                onSubmit={send}
                className="p-2.5 sm:p-3 bg-[#0d172c] border-t border-white/10 flex items-center gap-2 sm:gap-3 shrink-0 relative z-40"
              >
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`p-2 rounded-full transition cursor-pointer flex-shrink-0 ${showEmojiPicker ? 'text-[#D4A338] bg-[#D4A338]/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition cursor-pointer flex-shrink-0"
                  title="Attach File"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-[#182647] border border-white/10 focus:border-[#D4A338] rounded-full px-4 sm:px-5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || uploadingAttachment || (!draft.trim() && !attachment)}
                  className="w-10 h-10 rounded-full bg-[#D4A338] hover:bg-[#b88628] text-black flex items-center justify-center shadow-lg transition disabled:opacity-40 disabled:hover:bg-[#D4A338] shrink-0 cursor-pointer"
                  title="Send Message"
                >
                  {uploadingAttachment ? (
                     <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                     <Send className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
