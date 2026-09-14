import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, User, AtSign, MapPin, Phone, Mail, Instagram, Camera, ArrowRight, IndianRupee, Layers } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { CATEGORIES_LIST, CITIES_LIST } from '../../data/initialData';
import confetti from 'canvas-confetti';

export const CreatorOnboardingModal: React.FC = () => {
  const { onboardingModalOpen, closeOnboardingModal, registerCreator, navigateTo, categories, cities } = usePlatform();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    currentCity: '',
    primaryCategory: '',
    phone: '',
    email: '',
    followers: 0,
    engagementRate: 0,
    avgViews: 0,
    startingPrice: 0,
    isBarterAvailable: false,
    bio: '',
    avatar: '',
  });

  if (!onboardingModalOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete Registration
      const newCreator = registerCreator({
        name: formData.name,
        username: formData.username.replace(/^@/, '').trim(),
        currentCity: formData.currentCity,
        primaryCategory: formData.primaryCategory,
        phone: formData.phone,
        email: formData.email,
        followers: Number(formData.followers),
        engagementRate: Number(formData.engagementRate),
        avgViews: Number(formData.avgViews),
        startingPrice: Number(formData.startingPrice),
        bio: formData.bio,
        avatar: formData.avatar,
        pricing: {
          reelPrice: Number(formData.startingPrice) * 1.5,
          storyPrice: Number(formData.startingPrice) * 0.4,
          postPrice: Number(formData.startingPrice),
          ugcPrice: Number(formData.startingPrice) * 1.2,
          youtubePrice: Number(formData.startingPrice) * 3,
          eventPrice: Number(formData.startingPrice) * 2,
          isNegotiable: true,
          isBarterAvailable: formData.isBarterAvailable,
          pricingDisplayType: 'starting',
        },
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // silent
      }

      closeOnboardingModal();
      setStep(1);
      navigateTo('creator-dashboard');
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  ];

  return (
    <div
      id="creator-onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={closeOnboardingModal}
    >
      <div
        id="creator-onboarding-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">List Yourself — FREE</h3>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                100% Free
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Join India’s Biggest Creator Marketplace • Get Direct Inquiries from Top Brands
            </p>
          </div>
          <button
            onClick={closeOnboardingModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#D4A338]' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold">1</span>
            <span>Basic Info</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#D4A338]' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Metrics & Rates</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#D4A338]' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold">3</span>
            <span>Profile & Bio</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleNext} className="p-6 overflow-y-auto space-y-4 text-xs">
          {step === 1 && (
            <>
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanya Singhania"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Instagram Username / Handle *</label>
                <div className="relative">
                  <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="tanyasinghania"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Current City *</label>
                  <select
                    value={formData.currentCity}
                    onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="" disabled>Select a city</option>
                    {(cities && cities.length > 0 ? cities : CITIES_LIST).map((city, idx) => (
                      <option key={idx} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Primary Niche *</label>
                  <select
                    value={formData.primaryCategory}
                    onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  >
                    <option value="" disabled>Select a niche</option>
                    {(categories && categories.length > 0 ? categories : CATEGORIES_LIST).map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98112 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Work Email</label>
                  <input
                    type="email"
                    placeholder="creator@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Followers Count *</label>
                  <input
                    type="number"
                    required
                    placeholder="25000"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Engagement Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="4.8"
                    value={formData.engagementRate}
                    onChange={(e) => setFormData({ ...formData, engagementRate: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Average Reel Views</label>
                  <input
                    type="number"
                    placeholder="18000"
                    value={formData.avgViews}
                    onChange={(e) => setFormData({ ...formData, avgViews: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 text-xs font-bold mb-1.5">Starting Commercial Rate (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBarterAvailable}
                    onChange={(e) => setFormData({ ...formData, isBarterAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D4A338] focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-800 text-xs">
                    I am also open to Barter / Product gifting collaborations
                  </span>
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Short Bio / Pitch</label>
                <textarea
                  rows={2}
                  placeholder="Tell brands about your content style, audience demographics, and what makes your collaborations unique..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-800 text-xs font-bold mb-1.5">Select Profile Avatar</label>
                <div className="flex items-center gap-3 py-2 overflow-x-auto">
                  {sampleAvatars.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Sample avatar"
                      onClick={() => setFormData({ ...formData, avatar: url })}
                      className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition ${
                        formData.avatar === url ? 'border-blue-600 scale-105 ring-2 ring-blue-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 text-[11px] space-y-1">
                <span className="font-bold block">✓ Instant Live Directory Inclusion</span>
                <p>
                  Your profile will be immediately indexed and discoverable under {formData.primaryCategory} in {formData.currentCity}.
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              {step === 3 ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Publish Free Profile Now
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
