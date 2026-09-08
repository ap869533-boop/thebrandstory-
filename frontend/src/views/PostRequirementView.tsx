import React, { useState } from 'react';
import { Building2, Sparkles, Send, CheckCircle2, ArrowRight, IndianRupee, MapPin, Users, Calendar, ShieldCheck } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CATEGORIES_LIST, CITIES_LIST, INDUSTRIES_LIST, CAMPAIGN_TYPES } from '../data/initialData';
import confetti from 'canvas-confetti';

export const PostRequirementView: React.FC = () => {
  const { postCampaignRequirement, navigateTo, activeBrandName, categories, cities, industries } = usePlatform();

  const [formData, setFormData] = useState({
    companyName: activeBrandName || '',
    contactPerson: '',
    email: '',
    phone: '',
    campaignTitle: '',
    industry: 'Fashion & Lifestyle',
    category: 'Fashion',
    city: 'Delhi NCR',
    deliverablesNeeded: '1x Instagram Reel (30s) with brand product tagging + 2x Stories with link',
    budget: '₹25,000 - ₹50,000',
    influencersCount: 2,
    followerRange: '10k-100k',
    isBarter: false,
    campaignStartDate: '',
    customInstructions: '',
  });

  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.campaignTitle || !formData.email || !formData.phone) {
      alert('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const campId = postCampaignRequirement({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson || formData.companyName,
        email: formData.email,
        phone: formData.phone,
        campaignTitle: formData.campaignTitle,
        industry: formData.industry,
        category: formData.category,
        city: formData.city,
        deliverablesNeeded: formData.deliverablesNeeded,
        budget: formData.isBarter ? 'Barter / Product Exchange' : formData.budget,
        influencersCount: Number(formData.influencersCount) || 1,
        followerRange: formData.followerRange,
        isBarter: formData.isBarter,
        campaignStartDate: formData.campaignStartDate || 'Immediate',
        customInstructions: formData.customInstructions,
      });

      setIsSubmitting(false);
      setSubmittedId(campId);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // silent
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#b88628] text-xs font-bold uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Post Requirement & Get Contacted (IndiaMART Style)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tell Us Your Influencer Requirement
          </h1>

        </div>

        {submittedId ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Campaign Brief Published!</h2>
              <p className="text-xs text-slate-500">
                Your requirement has been listed on the Live Brand Briefs board and dispatched to matching verified creators.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Campaign Reference:</span>
                <span className="font-mono font-bold text-[#b88628]">{submittedId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Title:</span>
                <span className="font-bold text-slate-800">{formData.campaignTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target Region:</span>
                <span className="font-semibold text-slate-800">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Allocated Budget:</span>
                <span className="font-bold text-emerald-600">{formData.budget}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-center gap-3">
              <button
                onClick={() => navigateTo('opportunities')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                View Live Board
              </button>
              <button
                onClick={() => navigateTo('explore')}
                className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Browse Creators
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
            {/* Step 1: Basic Campaign Brief */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                1. Campaign Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zomato, Fastrack"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Brand Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  >
                    {(industries && industries.length > 0 ? industries : INDUSTRIES_LIST).map((ind, idx) => (
                      <option key={idx} value={ind.name}>{ind.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">Campaign Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Indo-Western Collection Launch"
                  value={formData.campaignTitle}
                  onChange={(e) => setFormData({ ...formData, campaignTitle: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Creator Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  >
                    {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Target City / Geography *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  >
                    <option value="Pan India">Pan India</option>
                    {(cities && cities.length > 0 ? cities : CITIES_LIST).map((c, idx) => (
                      <option key={idx} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Deliverables & Specs */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                2. Deliverables & Creator Specifications
              </h3>

              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1.5">Deliverables Needed *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 1x Reel, 2x Stories..."
                  value={formData.deliverablesNeeded}
                  onChange={(e) => setFormData({ ...formData, deliverablesNeeded: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Influencers Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.influencersCount}
                    onChange={(e) => setFormData({ ...formData, influencersCount: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Desired Follower Tier</label>
                  <select
                    value={formData.followerRange}
                    onChange={(e) => setFormData({ ...formData, followerRange: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  >
                    <option value="Any Tier">Any Follower Tier</option>
                    <option value="1k-10k">Nano (1k - 10k)</option>
                    <option value="10k-100k">Micro (10k - 100k)</option>
                    <option value="100k-500k">Macro (100k - 500k)</option>
                    <option value="500k+">Mega / Celeb (500k+)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Total Budget (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹30,000 or Barter"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                3. Brand Representative Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Alok Roy"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="alok@brand.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1.5">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98112 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#D4A338] font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero commission • Real direct creator pitches
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-black hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Publishing Campaign...' : 'Publish Brief & Get Quotes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

