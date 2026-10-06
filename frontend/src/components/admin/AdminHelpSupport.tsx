import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, MessageSquare, ChevronDown, ChevronUp, RefreshCw, Eye } from 'lucide-react';
import { apiUrl } from '../../config/api';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

interface Ticket {
  id: string;
  guest_name?: string;
  guest_email?: string;
  user_id?: string;
  user_role: string;
  category: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created_at: string;
}

export default function AdminHelpSupport() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'tickets'>('faqs');

  // FAQs State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Tickets State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState('');

  const fetchFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const token = localStorage.getItem('sc_auth_token');
      const res = await fetch(apiUrl('/api/support/admin/faqs'), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setFaqs(data.faqs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const token = localStorage.getItem('sc_auth_token');
      const res = await fetch(apiUrl('/api/support/admin/tickets'), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTickets(data.tickets || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'faqs') fetchFaqs();
    if (activeTab === 'tickets') fetchTickets();
  }, [activeTab]);

  const handleFaqSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      category: formData.get('category'),
      question: formData.get('question'),
      answer: formData.get('answer'),
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: formData.get('is_active') === 'on'
    };

    const token = localStorage.getItem('sc_auth_token');
    const url = editingFaq ? apiUrl(`/api/support/admin/faqs/${editingFaq.id}`) : apiUrl('/api/support/admin/faqs');
    const method = editingFaq ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setIsFaqModalOpen(false);
        fetchFaqs();
      }
    } catch (err) {
      alert('Failed to save FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    const token = localStorage.getItem('sc_auth_token');
    try {
      await fetch(apiUrl(`/api/support/admin/faqs/${id}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  const loadTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    const token = localStorage.getItem('sc_auth_token');
    try {
      const res = await fetch(apiUrl(`/api/support/admin/tickets/${ticket.id}`), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setTicketReplies(data.replies);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    const token = localStorage.getItem('sc_auth_token');
    try {
      const res = await fetch(apiUrl(`/api/support/admin/tickets/${selectedTicket.id}/reply`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: replyMessage, status: 'In Progress' })
      });
      if (res.ok) {
        setReplyMessage('');
        loadTicketDetails(selectedTicket);
        fetchTickets(); // refresh list
      }
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Help & Support Management</h2>

        <div className="flex space-x-6 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`pb-3 px-2 font-medium transition flex items-center gap-2 ${activeTab === 'faqs' ? 'text-[#D4A338] border-b-2 border-[#D4A338]' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <MessageSquare className="w-4 h-4" /> Manage FAQs
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 px-2 font-medium transition flex items-center gap-2 ${activeTab === 'tickets' ? 'text-[#D4A338] border-b-2 border-[#D4A338]' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <Search className="w-4 h-4" /> Support Tickets
          </button>
        </div>

        {activeTab === 'faqs' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-700">All FAQs</h3>
              <button
                onClick={() => { setEditingFaq(null); setIsFaqModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#D4A338] text-white rounded-xl hover:bg-[#c29330] transition font-semibold"
              >
                <Plus className="w-4 h-4" /> Add New FAQ
              </button>
            </div>

            {loadingFaqs ? (
              <div className="flex justify-center p-10"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-500">No FAQs added yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-start justify-between group hover:border-[#D4A338]/50 transition">
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg mb-2">
                        {faq.category}
                      </span>
                      <h4 className="font-semibold text-slate-800 text-lg mb-1">{faq.question}</h4>
                      <p className="text-slate-200 text-sm line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setEditingFaq(faq); setIsFaqModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && !selectedTicket && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-slate-700 mb-6">Recent Tickets</h3>
            {loadingTickets ? (
              <div className="flex justify-center p-10"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-500">No tickets found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-xl">ID</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 rounded-tr-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-medium text-slate-200">#{ticket.id.slice(-5).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{ticket.guest_name || ticket.user_role}</div>
                          <div className="text-xs text-slate-500">{ticket.user_role === 'GUEST' ? 'Guest' : 'Registered'}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-200">{ticket.subject}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${ticket.status === 'Open' ? 'bg-amber-100 text-amber-700' :
                            ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-200' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{new Date(ticket.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => loadTicketDetails(ticket)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && selectedTicket && (
          <div className="animate-fadeIn">
            <button onClick={() => setSelectedTicket(null)} className="text-sm font-semibold text-blue-600 mb-6 hover:underline">&larr; Back to Tickets</button>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{selectedTicket.subject}</h3>
                <p className="text-slate-300 mb-4">{selectedTicket.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="bg-[#D4A338]/10 text-[#D4A338] px-2 py-1 rounded border border-[#D4A338]/20">{selectedTicket.category}</span>
                  <span>From: <strong className="text-slate-200 font-semibold">{selectedTicket.guest_name || selectedTicket.user_role}</strong></span>
                  <span>Role: <strong className="text-slate-200 font-semibold">{selectedTicket.user_role}</strong></span>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-xl text-sm">
                {selectedTicket.status}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {ticketReplies.map(reply => (
                <div key={reply.id} className={`flex ${reply.sender_role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl ${reply.sender_role === 'ADMIN' ? 'bg-[#D4A338] text-slate-900 rounded-br-none font-medium' : 'bg-white/10 text-slate-200 rounded-bl-none'
                    }`}>
                    <p className="text-sm">{reply.message}</p>
                    <div className={`text-[10px] mt-2 ${reply.sender_role === 'ADMIN' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(reply.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleReplySubmit} className="flex gap-2">
              <input
                type="text"
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                placeholder="Type your reply to the user..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A338]/50"
                required
              />
              <button type="submit" className="px-6 py-3 bg-[#D4A338] text-white font-bold rounded-xl hover:bg-[#c29330] transition">
                Send Reply
              </button>
            </form>
          </div>
        )}
      </div>

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <input name="category" defaultValue={editingFaq?.category || ''} placeholder="e.g. Account, Billing" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A338]/50" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Question</label>
                <input name="question" defaultValue={editingFaq?.question || ''} placeholder="What is your question?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A338]/50" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Answer</label>
                <textarea name="answer" defaultValue={editingFaq?.answer || ''} placeholder="Write the answer here..." rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A338]/50" required></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sort Order</label>
                  <input type="number" name="sort_order" defaultValue={editingFaq?.sort_order || 0} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D4A338]/50" />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_active" defaultChecked={editingFaq ? editingFaq.is_active : true} className="w-5 h-5 text-[#D4A338] rounded border-slate-300 focus:ring-[#D4A338]" />
                    <span className="font-bold text-slate-700">Active</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full mt-4 py-3 bg-[#D4A338] text-white font-bold rounded-xl hover:bg-[#c29330] transition shadow-lg shadow-[#D4A338]/20">
                {editingFaq ? 'Update FAQ' : 'Save FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
