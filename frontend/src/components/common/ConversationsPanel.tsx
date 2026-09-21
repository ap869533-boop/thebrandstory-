import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Star, Circle } from 'lucide-react';
import { apiUrl, authHeaders } from '../../config/api';
import type { ChatMessage, ConversationThread } from '../../types';
import { usePlatform } from '../../context/PlatformContext';

export const ConversationsPanel: React.FC<{ openConversationId?: string | null }> = ({ openConversationId }) => {
  const { authUser } = usePlatform();
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(openConversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    const res = await fetch(apiUrl('/api/conversations'), { headers: authHeaders() });
    const data = await res.json();
    if (data.success && Array.isArray(data.conversations)) {
      setThreads(data.conversations);
    }
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const res = await fetch(apiUrl(`/api/conversations/${id}/messages`), { headers: authHeaders() });
    const data = await res.json();
    if (data.success && Array.isArray(data.messages)) {
      setMessages(data.messages);
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
    }, 8000);
    return () => {
      window.clearInterval(heartbeat);
      window.clearInterval(poll);
    };
  }, [authUser, loadThreads]);

  useEffect(() => {
    if (openConversationId) setActiveId(openConversationId);
  }, [openConversationId]);

  useEffect(() => {
    if (!activeId) return;
    void loadMessages(activeId);
    const poll = window.setInterval(() => {
      void loadMessages(activeId);
    }, 3000);
    return () => window.clearInterval(poll);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  const active = threads.find((t) => t.id === activeId) || null;
  const revieweeLabel = authUser?.role === 'BRAND' ? 'influencer' : 'brand';

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(apiUrl(`/api/conversations/${activeId}/messages`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ body: draft.trim() }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setDraft('');
        void loadThreads();
      }
    } finally {
      setSending(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeId) return;
    setReviewMsg(null);
    const res = await fetch(apiUrl('/api/conversations/reviews'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ conversationId: activeId, rating: reviewRating, reviewText }),
    });
    const data = await res.json();
    if (data.success) {
      setReviewMsg('Review saved.');
      setReviewText('');
    } else {
      setReviewMsg(data.error || 'Could not save review');
    }
  };

  if (!authUser) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden min-h-[520px] grid grid-cols-1 md:grid-cols-12">
      <aside className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-100 max-h-[280px] md:max-h-[640px] overflow-y-auto">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#D4A338]" />
            Conversations
          </h3>
        </div>
        {loading && <p className="p-4 text-xs text-slate-500">Loading conversations...</p>}
        {!loading && threads.length === 0 && (
          <p className="p-4 text-xs text-slate-500">No conversations yet. Confirm an inquiry to start chatting.</p>
        )}
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveId(t.id)}
            className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 transition ${activeId === t.id ? 'bg-amber-50' : ''}`}
          >
            <img
              src={t.peerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.peerName)}`}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 truncate">{t.peerName}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                  <Circle className={`w-2 h-2 fill-current ${t.online ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {t.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{t.lastMessage || 'No messages yet'}</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-slate-400">
                  {t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                {t.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A338] text-black text-[10px] font-black flex items-center justify-center">
                    {t.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </aside>

      <section className="md:col-span-8 flex flex-col min-h-[360px]">
        {!active && (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 p-8 text-center">
            Select a conversation to view messages.
          </div>
        )}
        {active && (
          <>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <img
                src={active.peerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(active.peerName)}`}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <p className="font-black text-sm text-slate-900">{active.peerName}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Circle className={`w-2 h-2 fill-current ${active.online ? 'text-emerald-500' : 'text-slate-300'}`} />
                  {active.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <form onSubmit={submitReview} className="m-4 mb-0 p-3 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#b88628] fill-[#D4A338]" />
                <p className="text-xs font-black text-slate-800">Review {active.peerName}</p>
              </div>
              <p className="text-[11px] text-slate-600">Rate the {revieweeLabel} you are chatting with. Your review is saved securely with this collaboration.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  aria-label={`Rating for ${active.peerName}`}
                  className="px-2 py-2 border border-amber-200 rounded-lg text-xs bg-white"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>
                  ))}
                </select>
                <input
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  minLength={5}
                  required
                  placeholder={`Write a review for ${active.peerName}...`}
                  className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-xs bg-white"
                />
                <button type="submit" className="px-3 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold">
                  Save Review
                </button>
              </div>
              {reviewMsg && <p className="text-[11px] text-slate-600">{reviewMsg}</p>}
            </form>
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/60 max-h-[360px]">
              {messages.map((m) => {
                const mine = m.senderId === authUser.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${mine ? 'bg-[#D4A338] text-black' : 'bg-white border border-slate-200 text-slate-800'}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                      <p className={`text-[10px] mt-1 ${mine ? 'text-black/60' : 'text-slate-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={send} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#D4A338]"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="px-4 py-2.5 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
