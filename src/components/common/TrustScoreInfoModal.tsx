import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, BarChart3, Users, Clock, Award, Phone, Mail } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const TrustScoreInfoModal: React.FC = () => {
  const { trustScoreModalOpen, closeTrustScoreModal } = usePlatform();

  if (!trustScoreModalOpen) return null;

  const signals = [
    { name: 'Profile Completeness', weight: '10%', desc: 'Full bio, multiple portfolio reels, clear rate cards, and language tags' },
    { name: 'Phone & Email OTP Verification', weight: '10%', desc: 'Double-authenticated contact credentials verified via OTP' },
    { name: 'Social Account Ownership & API Connect', weight: '15%', desc: 'Direct authentication verifying creator handles and active posting' },
    { name: 'Engagement Quality & Comment Pod Detection', weight: '15%', desc: 'Algorithmic scan detecting authentic discussions vs generic emoji spam' },
    { name: 'Audience Geographic Quality', weight: '15%', desc: 'Demographic match between target campaign regions and real followers' },
    { name: 'Brand Collaboration History', weight: '15%', desc: 'Proven campaign execution with verified D2C, agency, and enterprise brands' },
    { name: 'Verified Brand Reviews (1-5★)', weight: '10%', desc: 'Public feedback rated on communication, quality, timeliness, and ROI' },
    { name: 'Enquiry Response Rate & Turnaround', weight: '10%', desc: 'Prompt replies to brand briefs within 24 hours' },
  ];

  return (
    <div
      id="trust-score-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={closeTrustScoreModal}
    >
      <div
        id="trust-score-modal-content"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">thebrandsstory. Trust Score</h3>
              <p className="text-xs text-slate-500">Proprietary 0–100 Creator Quality & Reliability Index</p>
            </div>
          </div>
          <button
            id="close-trust-score-modal-btn"
            onClick={closeTrustScoreModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Summary Box */}
          <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#D4A338] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-950">How is the Trust Score Calculated?</h4>
              <p className="text-xs text-[#93651f]/90 mt-1 leading-relaxed">
                The thebrandsstory. Trust Score evaluates 11 distinct platform signals across identity authentication, audience integrity, past campaign delivery, and verified brand testimonials. It helps brands make risk-free hiring decisions.
              </p>
            </div>
          </div>

          {/* Signals Grid */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D4A338]" />
              Evaluation Signals & Weighting
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {signals.map((sig, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-blue-200 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{sig.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-[#b88628] rounded-md">{sig.weight}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-snug">{sig.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score Tiers */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-blue-400">Score Tier Classifications</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                <span className="block font-bold text-amber-400">94 – 100</span>
                <span className="text-[11px] text-slate-300 font-medium mt-0.5 block">Elite Top Creator</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                <span className="block font-bold text-blue-400">88 – 93</span>
                <span className="text-[11px] text-slate-300 font-medium mt-0.5 block">High Trust Verified</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
                <span className="block font-bold text-slate-300">80 – 87</span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Emerging Verified</span>
              </div>
            </div>
          </div>

          {/* Mandatory Tooltip Disclaimer */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Platform Notice:</strong> thebrandsstory. Trust Score is a platform-generated quality indicator based on available profile, activity and collaboration signals. It does not guarantee campaign performance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={closeTrustScoreModal}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
