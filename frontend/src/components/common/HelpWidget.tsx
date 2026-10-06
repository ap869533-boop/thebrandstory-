import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, ChevronDown, ChevronUp, AlertCircle, CheckCircle, RefreshCw, X, MessageCircle } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { usePlatform } from '../../context/PlatformContext';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const HelpWidget: React.FC = () => {
  const { authUser } = usePlatform();
  const [isOpen, setIsOpen] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ id: string, token: string } | null>(null);

  useEffect(() => {
    if (isOpen && faqs.length === 0) {
      setLoadingFaqs(true);
      fetch(apiUrl('/api/support/faqs'))
        .then(r => r.json())
        .then(d => {
          if (d.success) setFaqs(d.faqs || []);
          setLoadingFaqs(false);
        })
        .catch(() => setLoadingFaqs(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      category: 'General',
      subject: 'Support Query',
      description: formData.get('description'),
      guest_name: formData.get('guest_name'),
      guest_email: formData.get('guest_email')
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('sc_auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(apiUrl('/api/support/tickets'), {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      
      if (resData.success) {
        setTicketResult({ id: resData.ticket_id, token: resData.access_token });
      } else {
        alert('Failed to submit ticket: ' + resData.error);
      }
    } catch (err) {
      alert('Network error while submitting query.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSecretLink = () => {
    if (!ticketResult) return '';
    const baseUrl = window.location.origin;
    if (ticketResult.token) {
      return `${baseUrl}/ticket/${ticketResult.id}/track/${ticketResult.token}`;
    }
    return `${baseUrl}/dashboard`; // For logged in users
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[420px] max-w-[calc(100vw-3rem)] max-h-[70vh] sm:max-h-[600px] bg-[#051126] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4A338] to-[#be8f2b] p-4 flex justify-between items-center text-slate-900">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-bold text-lg">Help & Support</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/10 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
            {/* FAQs Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Frequently Asked Questions</h4>
              {loadingFaqs ? (
                <div className="flex justify-center py-4"><RefreshCw className="w-5 h-5 animate-spin text-[#D4A338]" /></div>
              ) : faqs.length === 0 ? (
                <p className="text-xs text-slate-500">No FAQs available.</p>
              ) : (
                <div className="space-y-2">
                  {faqs.map(faq => (
                    <div key={faq.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition"
                      >
                        <span className="font-semibold text-white text-sm">{faq.question}</span>
                        {expandedFaqId === faq.id ? <ChevronUp className="w-4 h-4 text-[#D4A338] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                      </button>
                      {expandedFaqId === faq.id && (
                        <div className="px-4 pb-3 pt-1 text-sm text-slate-300 border-t border-white/5 whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Query Form Section */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Write Your Query Here</h4>
              
              {ticketResult ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm text-white font-medium">Query Submitted Successfully!</p>
                  
                  {ticketResult.token && (
                    <div className="bg-black/20 p-3 rounded-lg text-left mt-2">
                      <p className="text-[10px] text-amber-400 font-bold mb-1">Save this tracking link:</p>
                      <input 
                        type="text" 
                        readOnly 
                        value={getSecretLink()}
                        className="w-full bg-black/50 text-emerald-400 text-xs p-2 rounded border border-white/10 outline-none"
                      />
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setTicketResult(null)}
                    className="text-xs text-emerald-400 hover:underline mt-2 inline-block"
                  >
                    Submit another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!authUser && (
                    <>
                      <div>
                        <input name="guest_name" type="text" required placeholder="Your Name" className="w-full bg-[#051126]/50 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A338] transition" />
                      </div>
                      <div>
                        <input name="guest_email" type="email" required placeholder="Your Email" className="w-full bg-[#051126]/50 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#D4A338] transition" />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <textarea name="description" required rows={4} placeholder="Write your query here..." className="w-full bg-[#051126]/50 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#D4A338] transition resize-none"></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-[#D4A338] hover:bg-[#be8f2b] text-slate-900 font-bold text-sm rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Query'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-[#D4A338] text-slate-900 hover:bg-[#be8f2b] hover:scale-110'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
