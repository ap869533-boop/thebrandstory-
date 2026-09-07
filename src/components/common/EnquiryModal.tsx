import React, { useState } from 'react';
import { X, Send, ShieldCheck, CheckCircle2, Building, User, Mail, Phone, Calendar, IndianRupee, MapPin, Sparkles } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CITIES_LIST, CAMPAIGN_TYPES } from '../../data/initialData';
import confetti from 'canvas-confetti';

export const EnquiryModal: React.FC = () => {
  const { enquiryModalCreator, closeEnquiryModal, submitEnquiry, activeBrandName } = usePlatform();

  const [formData, setFormData] = useState({
    brandName: activeBrandName || '',
    contactPerson: '',
    email: '',
    phone: '',
    campaignType: 'Sponsored Instagram Reel',
    campaignDescription: '',
    city: enquiryModalCreator?.currentCity || 'Delhi NCR',
    budget: '₹15,000 - ₹30,000',
    influencersRequired: 1,
    preferredDate: '',
    message: '',
  });

  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!enquiryModalCreator) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName || !formData.email || !formData.phone) {
      alert('Please fill out brand name, email, and phone number');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const leadId = submitEnquiry({
        creatorId: enquiryModalCreator.id,
        creatorName: enquiryModalCreator.name,
        creatorUsername: enquiryModalCreator.username,
        creatorAvatar: enquiryModalCreator.avatar,
        brandName: formData.brandName,
        contactPerson: formData.contactPerson || formData.brandName,
        email: formData.email,
        phone: formData.phone,
        campaignType: formData.campaignType,
        campaignDescription: formData.campaignDescription || 'Campaign requirements for ' + enquiryModalCreator.name,
        city: formData.city,
        budget: formData.budget,
        influencersRequired: Number(formData.influencersRequired) || 1,
        preferredDate: formData.preferredDate || 'Next 2 Weeks',
        message: formData.message || `Hi ${enquiryModalCreator.name}, we would love to collaborate on this campaign!`,
      });

      setIsSubmitting(false);
      setSubmittedLeadId(leadId);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // silent
      }
    }, 400);
  };

  const resetAndClose = () => {
    setSubmittedLeadId(null);
    closeEnquiryModal();
  };

  return (
    <div
      id="enquiry-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={resetAndClose}
    >
      <div
        id="enquiry-modal-card"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <img
              src={enquiryModalCreator.avatar}
              alt={enquiryModalCreator.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Contact {enquiryModalCreator.name}
                </h3>
                {enquiryModalCreator.isVerified && (
                  <ShieldCheck className="w-4 h-4 text-[#D4A338] shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500">
                @{enquiryModalCreator.username} • {enquiryModalCreator.currentCity} • Starting ₹{(enquiryModalCreator.startingPrice ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            id="close-enquiry-modal-btn"
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submittedLeadId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Enquiry Sent Successfully!</h3>
              <p className="text-xs text-slate-500">
                Your direct enquiry has been dispatched to {enquiryModalCreator.name} and the thebrandsstory. Brand desk.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Tracking Reference ID:</span>
                <span className="font-mono font-bold text-[#b88628] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {submittedLeadId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Creator:</span>
                <span className="font-semibold text-slate-800">{enquiryModalCreator.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Proposed Budget:</span>
                <span className="font-semibold text-emerald-700">{formData.budget}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Average Response Time:</span>
                <span className="font-semibold text-slate-800">Under 4 Hours</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                id="done-enquiry-modal-btn"
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Return to Marketplace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A338] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Connect directly with verified creators. Receive proposals, negotiate deliverables, or book end-to-end campaign execution.
              </p>
            </div>

            {/* Brand & Person */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Brand / Company Name *</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nykaa, Blue Tokai, Startup"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Contact Person Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Rohit Mehra"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Official Work Email *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="rohit@brand.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">WhatsApp / Phone Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98112 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Type & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Deliverable Type</label>
                <select
                  value={formData.campaignType}
                  onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  {CAMPAIGN_TYPES.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Target City / Region</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="Pan India">Pan India</option>
                    {CITIES_LIST.map((city, idx) => (
                      <option key={idx} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Budget & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Estimated Budget (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. ₹15,000 or Barter"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Target Campaign Date</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-slate-800 text-xs font-bold mb-1.5">Campaign Brief / Message to Creator</label>
              <textarea
                rows={3}
                placeholder="Explain your product, deliverables needed, hashtag guidelines, or special concepts..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-enquiry-btn"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-black hover:bg-zinc-900 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Sending Enquiry...' : 'Submit Collaboration Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
