import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, RefreshCw, Send, CheckCircle, Clock } from 'lucide-react';
import { apiUrl } from '../config/api';
import { Navbar } from '../components/common/Navbar';

interface Ticket {
  id: string;
  guest_name?: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
}

export const TicketTrackingView: React.FC = () => {
  const { id, token } = useParams<{ id: string; token: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(apiUrl(`/api/support/tickets/${id}/token/${token}`))
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setTicket(d.ticket);
          setReplies(d.replies);
        } else {
          setError(d.error || 'Ticket not found or invalid link');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [id, token]);

  // NOTE: Guest reply API is not yet built in Phase 1 (Admin replies to Guest), 
  // but we provide a mockup for the guest to see their conversation.
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#051126] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-[#D4A338] animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#051126] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-black text-white mb-4">Invalid Tracking Link</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8">{error}</p>
        <Link to="/help-support" className="px-6 py-3 bg-[#D4A338] text-slate-900 font-bold rounded-xl hover:bg-[#be8f2b] transition">
          Return to Help & Support
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051126] text-slate-200">
      <Navbar />
      <div className="pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{ticket.subject}</h1>
              <p className="text-slate-400 mt-1">Ticket ID: #{ticket.id.slice(-5).toUpperCase()}</p>
            </div>
            <div>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${
                ticket.status === 'Open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              }`}>
                {ticket.status === 'Resolved' || ticket.status === 'Closed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {ticket.status}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            
            <div className="space-y-6">
              {replies.map((reply) => {
                const isAdmin = reply.sender_role === 'ADMIN';
                return (
                  <div key={reply.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-5 ${
                      isAdmin ? 'bg-blue-600/20 border border-blue-500/30 text-slate-200 rounded-tl-none' : 
                      'bg-white/10 border border-white/10 text-slate-200 rounded-tr-none'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-white">{isAdmin ? 'Support Team' : (ticket.guest_name || 'You')}</span>
                        <span className="text-xs text-slate-400">• {new Date(reply.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
              <div className="pt-6 border-t border-white/10">
                <div className="bg-[#051126] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Guest reply coming in Phase 2..."
                    className="flex-1 bg-transparent border-none text-white focus:outline-none"
                    disabled
                  />
                  <button disabled className="p-3 bg-white/5 text-slate-500 rounded-lg cursor-not-allowed">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};
